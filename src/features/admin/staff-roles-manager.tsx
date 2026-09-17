"use client";

import { useState, useTransition } from "react";

import { assignStaffRoleAction, revokeStaffRoleAction } from "@/app/admin/roles/actions";

import type { StaffMember } from "./admin.types";

const roleLabels: Record<StaffMember["role"], string> = {
  super_admin: "Super admin",
  content_editor: "Content editor",
  support_agent: "Support agent",
  finance: "Finance",
};

export function StaffRolesManager({ staff, viewerId }: { staff: StaffMember[]; viewerId: string }) {
  const [pending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ ok: boolean; message: string } | null>(null);
  const [revokingId, setRevokingId] = useState<string | null>(null);

  function submitAssignment(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    startTransition(async () => {
      const result = await assignStaffRoleAction(data);
      setFeedback(result);
      if (result.ok) form.reset();
    });
  }

  function submitRevoke(userId: string) {
    setRevokingId(userId);
    startTransition(async () => {
      const data = new FormData();
      data.set("userId", userId);
      const result = await revokeStaffRoleAction(data);
      setFeedback(result);
      setRevokingId(null);
    });
  }

  return <section className="admin-panel admin-staff-manager">
    <h2>Assign a role</h2>
    <p>Enter the email of an account that has already signed up. Assigning a role to an existing staff member&rsquo;s email changes their role instead of adding a duplicate.</p>
    <form onSubmit={submitAssignment}>
      <label htmlFor="admin-staff-email">Email</label>
      <input id="admin-staff-email" name="email" type="email" required maxLength={254} placeholder="name@example.com" />
      <label htmlFor="admin-staff-role">Role</label>
      <select id="admin-staff-role" name="role" defaultValue="support_agent">
        <option value="super_admin">Super admin</option>
        <option value="content_editor">Content editor</option>
        <option value="support_agent">Support agent</option>
        <option value="finance">Finance</option>
      </select>
      <button type="submit" disabled={pending}>{pending && !revokingId ? "Saving…" : "Assign role"}</button>
      {feedback ? <p role={feedback.ok ? "status" : "alert"}>{feedback.message}</p> : null}
    </form>

    <h2>Current staff</h2>
    {staff.length === 0 ? <p>No staff roles assigned yet.</p> : <div className="admin-table-scroll"><table className="admin-table"><thead><tr><th scope="col">Staff member</th><th scope="col">Role</th><th scope="col">Granted</th><th scope="col">Action</th></tr></thead><tbody>{staff.map((member) => <tr key={member.userId}><td>{member.email}</td><td>{roleLabels[member.role]}</td><td>{new Date(member.createdAt).toLocaleDateString("en-IN")}</td><td>{member.userId === viewerId ? <span>This is you</span> : <button type="button" disabled={pending} onClick={() => submitRevoke(member.userId)}>{pending && revokingId === member.userId ? "Revoking…" : "Revoke access"}</button>}</td></tr>)}</tbody></table></div>}
  </section>;
}
