import { requireStaff } from "@/features/admin/admin-access";
import { IntegrationState } from "@/features/admin/integration-state";

export default async function BillingPage() {
  await requireStaff("billing");
  return <main className="admin-page" id="main-content"><p className="eyebrow">Commerce</p><h1>Billing</h1><IntegrationState area="Billing" reason="PacketSecrets does not collect payments yet. Revenue, invoices, failed payments, coupons, and refunds will appear only after a payment provider is connected." /></main>;
}
