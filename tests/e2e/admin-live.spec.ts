import { randomUUID } from "node:crypto";

import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { expect, test, type BrowserContext } from "@playwright/test";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
const serviceKey = process.env.TEST_SUPABASE_SERVICE_ROLE_KEY ?? "";
const appUrl = "http://127.0.0.1:3000";
const password = `AdminE2e-${randomUUID()}!`;

type Account = { id: string; email: string };
let staff: Account;
let learner: Account;

function ensureDisposableDatabase() {
  if (supabaseUrl !== "http://127.0.0.1:54321" || !anonKey || !serviceKey) {
    throw new Error("Admin live tests require the disposable local Supabase instance and its test keys");
  }
}

test.beforeAll(async () => {
  ensureDisposableDatabase();
  const service = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const suffix = randomUUID();
  const staffEmail = `staff-${suffix}@example.test`;
  const learnerEmail = `learner-${suffix}@example.test`;

  const staffResult = await service.auth.admin.createUser({ email: staffEmail, password, email_confirm: true });
  if (staffResult.error || !staffResult.data.user) throw new Error(`Could not seed staff: ${staffResult.error?.message}`);
  staff = { id: staffResult.data.user.id, email: staffEmail };

  const learnerResult = await service.auth.admin.createUser({ email: learnerEmail, password, email_confirm: true });
  if (learnerResult.error || !learnerResult.data.user) throw new Error(`Could not seed learner: ${learnerResult.error?.message}`);
  learner = { id: learnerResult.data.user.id, email: learnerEmail };

  const role = await service.from("staff_roles").insert({ user_id: staff.id, role: "super_admin" });
  if (role.error) throw new Error(`Could not seed staff role: ${role.error.message}`);
  const waitlist = await service.from("pro_waitlist_entries").insert({
    user_id: learner.id, email: learner.email, status: "joined", consent_version: "e2e-v1", consented_at: new Date().toISOString(),
  });
  if (waitlist.error) throw new Error(`Could not seed waitlist: ${waitlist.error.message}`);
});

async function signIn(context: BrowserContext, account: Account) {
  const jar = new Map<string, string>();
  const client = createServerClient(supabaseUrl, anonKey, {
    cookies: {
      getAll: () => Array.from(jar, ([name, value]) => ({ name, value })),
      setAll: (items) => items.forEach(({ name, value }) => jar.set(name, value)),
    },
  });
  const { error } = await client.auth.signInWithPassword({ email: account.email, password });
  if (error) throw new Error(`Local sign-in failed: ${error.message}`);
  await context.addCookies(Array.from(jar, ([name, value]) => ({ name, value, url: appUrl })));
}

test("an authenticated learner cannot open admin but can open their own dashboard", async ({ page, context }) => {
  await signIn(context, learner);
  const denied = await page.goto("/admin");
  expect(denied?.status()).toBe(404);
  await page.goto("/dashboard");
  await expect(page.getByRole("heading", { name: /Welcome back/ })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Overview" })).toHaveCount(0);
});

test("public page-view requests use the guarded disposable ingester", async ({ request }) => {
  const eventId = randomUUID();
  const first = await request.post("/api/page-view", { data: { path: "/pricing", eventId } });
  expect(first.status()).toBe(204);
  const retry = await request.post("/api/page-view", { data: { path: "/pricing", eventId } });
  expect(retry.status()).toBe(204);
  const service = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data, error } = await service.from("page_views").select("event_id").eq("event_id", eventId);
  expect(error).toBeNull();
  expect(data).toHaveLength(1);
});

test("staff sees real metrics and a learner edit appears in the audit log", async ({ page, context }) => {
  await signIn(context, staff);
  await page.goto("/admin");
  await expect(page.getByRole("heading", { name: "Overview" })).toBeVisible();
  await expect(page.locator(".admin-metric").filter({ hasText: "Registered accounts" }).locator("strong")).toHaveText("2");
  await expect(page.locator(".admin-metric").filter({ hasText: "Founding Pro waitlist" }).locator("strong")).toHaveText("1");

  await page.goto(`/admin/users/${learner.id}`);
  await expect(page.getByRole("heading", { name: "Edit learner profile" })).toBeVisible();
  await page.getByLabel("Display name").fill("CI Learner");
  await page.getByLabel("Add an internal note").fill("Reviewed in disposable CI");
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(page.getByRole("status")).toContainText("saved and audited");

  await page.goto("/admin/audit");
  await expect(page.getByRole("table")).toContainText("learner_profile_updated");
  await expect(page.getByRole("table")).toContainText(learner.id);
});
