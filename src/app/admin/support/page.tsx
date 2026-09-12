import { requireStaff } from "@/features/admin/admin-access";
import { IntegrationState } from "@/features/admin/integration-state";

export default async function SupportPage() {
  await requireStaff("support");
  return <main className="admin-page" id="main-content"><p className="eyebrow">Operations</p><h1>Support</h1><IntegrationState area="Support queue" reason="No ticket service or message thread is configured. Account notes are available from the Users section, but they are not support tickets." /></main>;
}
