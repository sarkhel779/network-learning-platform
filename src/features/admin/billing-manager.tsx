"use client";

import { useState, useTransition } from "react";

import { grantSubscriptionAction, revokeSubscriptionAction } from "@/app/admin/billing/actions";

import type { BillingPlan, SubscriptionRow } from "./admin.types";

export function BillingManager({ plans, subscriptions }: { plans: BillingPlan[]; subscriptions: SubscriptionRow[] }) {
  const [pending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ ok: boolean; message: string } | null>(null);
  const [revokingId, setRevokingId] = useState<number | null>(null);

  function submitGrant(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    startTransition(async () => {
      const result = await grantSubscriptionAction(data);
      setFeedback(result);
      if (result.ok) form.reset();
    });
  }

  function submitRevoke(subscriptionId: number) {
    setRevokingId(subscriptionId);
    startTransition(async () => {
      const data = new FormData();
      data.set("subscriptionId", String(subscriptionId));
      const result = await revokeSubscriptionAction(data);
      setFeedback(result);
      setRevokingId(null);
    });
  }

  return <section className="admin-panel admin-billing-manager">
    <h2>Plans</h2>
    <p>No payment gateway is connected yet. Prices below are placeholders until one is attached.</p>
    <ul className="admin-plan-list">
      <li><strong>Free</strong> — the default for every learner without an active subscription.</li>
      {plans.map((plan) => (
        <li key={plan.id}>
          <strong>{plan.name}</strong> — {plan.priceCents === null ? "price not set (placeholder)" : `${plan.currency} ${(plan.priceCents / 100).toFixed(2)}`}
        </li>
      ))}
    </ul>

    <h2>Grant Pro access</h2>
    <p>Manually grant an existing account Pro access (comp, offline payment, etc.) until a payment gateway is connected.</p>
    <form onSubmit={submitGrant}>
      <label htmlFor="billing-grant-email">Email</label>
      <input id="billing-grant-email" name="email" type="email" required maxLength={254} placeholder="name@example.com" />
      <label htmlFor="billing-grant-plan">Plan</label>
      <select id="billing-grant-plan" name="planId" defaultValue={plans[0]?.id}>
        {plans.map((plan) => <option key={plan.id} value={plan.id}>{plan.name}</option>)}
      </select>
      <button type="submit" disabled={pending}>{pending && !revokingId ? "Saving…" : "Grant access"}</button>
      {feedback ? <p role={feedback.ok ? "status" : "alert"}>{feedback.message}</p> : null}
    </form>

    <h2>Subscriptions</h2>
    {subscriptions.length === 0 ? <p>No subscriptions yet.</p> : <div className="admin-table-scroll"><table className="admin-table"><thead><tr><th scope="col">Learner</th><th scope="col">Plan</th><th scope="col">Status</th><th scope="col">Source</th><th scope="col">Action</th></tr></thead><tbody>{subscriptions.map((sub) => <tr key={sub.id}><td>{sub.learnerEmail}</td><td>{plans.find((plan) => plan.id === sub.planId)?.name ?? sub.planId}</td><td>{sub.status === "active" ? "Active" : "Canceled"}</td><td>{sub.source === "manual" ? "Manually granted" : "Payment gateway"}</td><td>{sub.status === "active" ? <button type="button" disabled={pending} onClick={() => submitRevoke(sub.id)}>{pending && revokingId === sub.id ? "Revoking…" : "Revoke"}</button> : <span>—</span>}</td></tr>)}</tbody></table></div>}
  </section>;
}
