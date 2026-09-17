import { requireStaff } from "@/features/admin/admin-access";
import { BillingManager } from "@/features/admin/billing-manager";
import { listBillingPlans, listSubscriptions } from "@/features/admin/admin.repository";
import type { BillingPlan, SubscriptionRow } from "@/features/admin/admin.types";

export default async function BillingPage() {
  await requireStaff("billing");
  let plans: BillingPlan[] | null = null;
  let subscriptions: { rows: SubscriptionRow[]; total: number } | null = null;
  try {
    [plans, subscriptions] = await Promise.all([listBillingPlans(), listSubscriptions({ limit: 50 })]);
  } catch {
    // An unavailable billing directory must never be represented as empty.
  }

  return <main className="admin-page" id="main-content">
    <header className="admin-page__header"><div><p className="eyebrow">Commerce</p><h1>Billing</h1></div><span>{subscriptions ? `${subscriptions.total.toLocaleString("en-IN")} subscriptions` : "Unavailable"}</span></header>
    {!plans || !subscriptions ? <p role="status">Billing data is temporarily unavailable. Please try again.</p> : <BillingManager plans={plans} subscriptions={subscriptions.rows} />}
  </main>;
}
