"use client";

import { useState, useTransition } from "react";

import { deleteFeatureFlagAction, upsertFeatureFlagAction } from "@/app/admin/settings/actions";

import type { FeatureFlag } from "./admin.types";

export function FeatureFlagsManager({ flags }: { flags: FeatureFlag[] }) {
  const [pending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ ok: boolean; message: string } | null>(null);
  const [busyKey, setBusyKey] = useState<string | null>(null);

  function submitCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    if (!data.has("enabled")) data.set("enabled", "false");
    startTransition(async () => {
      const result = await upsertFeatureFlagAction(data);
      setFeedback(result);
      if (result.ok) form.reset();
    });
  }

  function submitToggle(flag: FeatureFlag) {
    setBusyKey(flag.key);
    const data = new FormData();
    data.set("key", flag.key);
    data.set("enabled", String(!flag.enabled));
    data.set("description", flag.description ?? "");
    startTransition(async () => {
      const result = await upsertFeatureFlagAction(data);
      setFeedback(result);
      setBusyKey(null);
    });
  }

  function submitDelete(key: string) {
    setBusyKey(key);
    const data = new FormData();
    data.set("key", key);
    startTransition(async () => {
      const result = await deleteFeatureFlagAction(data);
      setFeedback(result);
      setBusyKey(null);
    });
  }

  return <section className="admin-panel admin-feature-flags">
    <h2>New feature flag</h2>
    <p>Create a named on/off switch. Other parts of the app can check its value without a code change.</p>
    <form onSubmit={submitCreate}>
      <label htmlFor="flag-key">Key</label>
      <input id="flag-key" name="key" required maxLength={50} pattern="[a-z][a-z0-9_]{1,49}" placeholder="new_lesson_ui" />
      <label htmlFor="flag-description">Description</label>
      <input id="flag-description" name="description" maxLength={200} placeholder="What this flag controls" />
      <label htmlFor="flag-enabled"><input id="flag-enabled" name="enabled" type="checkbox" value="true" /> Enabled</label>
      <button type="submit" disabled={pending}>{pending && !busyKey ? "Saving…" : "Create flag"}</button>
      {feedback ? <p role={feedback.ok ? "status" : "alert"}>{feedback.message}</p> : null}
    </form>

    <h2>Flags</h2>
    {flags.length === 0 ? <p>No feature flags yet.</p> : <div className="admin-table-scroll"><table className="admin-table"><thead><tr><th scope="col">Key</th><th scope="col">Description</th><th scope="col">Status</th><th scope="col">Action</th></tr></thead><tbody>{flags.map((flag) => <tr key={flag.key}><td><code>{flag.key}</code></td><td>{flag.description || "—"}</td><td>{flag.enabled ? "Enabled" : "Disabled"}</td><td><button type="button" disabled={pending} onClick={() => submitToggle(flag)}>{pending && busyKey === flag.key ? "Saving…" : flag.enabled ? "Disable" : "Enable"}</button> <button type="button" disabled={pending} onClick={() => submitDelete(flag.key)}>{pending && busyKey === flag.key ? "…" : "Delete"}</button></td></tr>)}</tbody></table></div>}
  </section>;
}
