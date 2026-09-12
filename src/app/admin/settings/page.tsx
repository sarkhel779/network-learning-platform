import { requireStaff } from "@/features/admin/admin-access";
import { IntegrationState } from "@/features/admin/integration-state";

export default async function SettingsPage() {
  await requireStaff("settings");
  return <main className="admin-page" id="main-content"><p className="eyebrow">System</p><h1>Settings</h1><IntegrationState area="Platform settings" reason="Configuration is managed through deployment settings. Editable support email, templates, feature flags, and payment keys require a secure settings backend." /></main>;
}
