import { requireStaff } from "@/features/admin/admin-access";
import { listStaff } from "@/features/admin/admin.repository";
import type { StaffMember } from "@/features/admin/admin.types";
import { StaffRolesManager } from "@/features/admin/staff-roles-manager";

export default async function RolesPage() {
  const { viewer } = await requireStaff("roles");
  let staff: StaffMember[] | null = null;
  try {
    staff = await listStaff();
  } catch {
    // An unavailable directory must never be represented as an empty result.
  }

  return <main className="admin-page" id="main-content">
    <header className="admin-page__header"><div><p className="eyebrow">System</p><h1>Roles</h1></div><span>{staff ? `${staff.length.toLocaleString("en-IN")} staff` : "Directory unavailable"}</span></header>
    {!staff ? <p role="status">The staff directory is temporarily unavailable. Please try again.</p> : <StaffRolesManager staff={staff} viewerId={viewer.id} />}
  </main>;
}
