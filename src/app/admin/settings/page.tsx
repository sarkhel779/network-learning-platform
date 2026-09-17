import { requireStaff } from "@/features/admin/admin-access";
import { FeatureFlagsManager } from "@/features/admin/feature-flags-manager";
import { listFeatureFlags } from "@/features/admin/admin.repository";
import type { FeatureFlag } from "@/features/admin/admin.types";

export default async function SettingsPage() {
  await requireStaff("settings");
  let flags: FeatureFlag[] | null = null;
  try {
    flags = await listFeatureFlags();
  } catch {
    // An unavailable flag list must never be represented as an empty one.
  }

  return <main className="admin-page" id="main-content">
    <header className="admin-page__header"><div><p className="eyebrow">System</p><h1>Settings</h1></div><span>{flags ? `${flags.length.toLocaleString("en-IN")} feature flags` : "Unavailable"}</span></header>
    {!flags ? <p role="status">Settings are temporarily unavailable. Please try again.</p> : <FeatureFlagsManager flags={flags} />}
  </main>;
}
