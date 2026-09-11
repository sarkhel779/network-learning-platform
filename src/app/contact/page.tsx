import { isPublishedLessonSlug } from "@/features/waitlist/waitlist-input.schema";
import { getWaitlistStatus } from "@/features/waitlist/waitlist.repository";
import { WaitlistForm } from "@/features/waitlist/waitlist-form";
import { getViewer } from "@/lib/supabase/session";

type ContactPageProps = {
  searchParams?: Promise<{ source?: string | string[] }>;
};

export default async function ContactPage({ searchParams = Promise.resolve({}) }: ContactPageProps) {
  const viewer = await getViewer();
  const source = (await searchParams).source;
  const sourceLessonSlug = typeof source === "string" && isPublishedLessonSlug(source) ? source : undefined;
  const status = viewer ? await getWaitlistStatus(viewer.id) : { ok: true as const, entry: null };

  return (
    <main className="informational-page" id="main-content">
      <p className="eyebrow">Early access</p>
      <h1>Founding Pro waitlist</h1>
      <p className="summary">Pro learning is being shaped around real learner needs.</p>
      <p>
        Join for occasional product and launch updates. The waitlist is free, does not unlock paid
        content, and does not collect payment details.
      </p>
      <WaitlistForm
        viewer={viewer}
        initialEntry={status.ok ? status.entry : null}
        initialUnavailable={!status.ok}
        sourceLessonSlug={sourceLessonSlug}
      />
    </main>
  );
}
