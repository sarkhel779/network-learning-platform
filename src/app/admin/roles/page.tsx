import { requireStaff } from "@/features/admin/admin-access";
import { IntegrationState } from "@/features/admin/integration-state";

export default async function RolesPage() {
  await requireStaff("roles");
  return <main className="admin-page" id="main-content"><p className="eyebrow">System</p><h1>Roles</h1><IntegrationState area="Staff invitations" reason="Staff roles are enforced in the database. Initial super-admin access must be assigned by a verified operator; invitations and role changes are not connected yet." /></main>;
}
