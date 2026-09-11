import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const migrationPath = resolve(
  "supabase/migrations/202609110006_create_pro_waitlist.sql",
);

describe("Founding Pro waitlist migration", () => {
  it("creates the owned waitlist row with constrained lifecycle fields", () => {
    const sql = readFileSync(migrationPath, "utf8");

    expect(sql).toMatch(/create table public\.pro_waitlist_entries/i);
    expect(sql).toMatch(/user_id uuid primary key references auth\.users\s*\(id\)/i);
    expect(sql).toMatch(/status text not null[^;]*joined[\s\S]*unsubscribed/i);
    expect(sql).toMatch(/consent_version text not null/i);
    expect(sql).toMatch(/consented_at timestamptz not null/i);
    expect(sql).toMatch(/unsubscribed_at timestamptz/i);
    expect(sql).toMatch(/alter table public\.pro_waitlist_entries enable row level security/i);
  });

  it("allows own-row reads without direct authenticated mutations", () => {
    const sql = readFileSync(migrationPath, "utf8");

    expect(sql).toMatch(/create policy "learners read own waitlist entry"[\s\S]*auth\.uid\(\)[\s\S]*user_id/i);
    expect(sql).toMatch(/revoke insert, update, delete on public\.pro_waitlist_entries from authenticated/i);
    expect(sql).toMatch(/grant select on public\.pro_waitlist_entries to authenticated/i);
    expect(sql).not.toMatch(/create policy[^;]+for (insert|update|delete)/i);
  });

  it("owns joins in a hardened RPC that derives the verified email", () => {
    const sql = readFileSync(migrationPath, "utf8");

    expect(sql).toMatch(/create function public\.join_pro_waitlist/i);
    expect(sql).toMatch(/security definer[\s\S]*set search_path = ''/i);
    expect(sql).toMatch(/if p_consent is distinct from true/i);
    expect(sql).toMatch(/from auth\.users[\s\S]*auth\.uid\(\)/i);
    expect(sql).toMatch(/on conflict \(user_id\) do update/i);
    expect(sql).toMatch(/when public\.pro_waitlist_entries\.status = 'joined'[\s\S]*public\.pro_waitlist_entries\.consented_at/i);
  });

  it("unsubscribes without deleting and limits RPC execution", () => {
    const sql = readFileSync(migrationPath, "utf8");

    expect(sql).toMatch(/create function public\.leave_pro_waitlist/i);
    expect(sql).toMatch(/set status = 'unsubscribed'[\s\S]*unsubscribed_at = now\(\)/i);
    expect(sql).not.toMatch(/delete from public\.pro_waitlist_entries/i);
    expect(sql).toMatch(/revoke all on function public\.join_pro_waitlist[^;]+from public/i);
    expect(sql).toMatch(/grant execute on function public\.join_pro_waitlist[^;]+to authenticated/i);
    expect(sql).toMatch(/grant execute on function public\.leave_pro_waitlist[^;]+to authenticated/i);
  });
});
