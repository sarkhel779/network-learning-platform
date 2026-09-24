import Link from "next/link";
import type { ReactNode } from "react";

import { PRO_UNLOCKED_FOR_EVERYONE } from "./access-policy";

type PremiumPreviewProps = {
  children: ReactNode;
  ctaLabel?: string;
  ctaHref?: string;
};

export function PremiumPreview({
  children,
  ctaLabel = "Join the Pro Member Waitlist",
  ctaHref = "/contact",
}: PremiumPreviewProps) {
  return (
    <aside aria-label="Premium lesson preview" className="learning-block premium-preview">
      <h2>Premium lesson preview</h2>
      <div>{children}</div>
      {PRO_UNLOCKED_FOR_EVERYONE ? (
        <p>Pro content is unlocked for everyone right now — no waitlist required.</p>
      ) : (
        <>
          <p>This preview introduces material covered in the upcoming premium lessons.</p>
          <Link href={ctaHref}>{ctaLabel}</Link>
        </>
      )}
    </aside>
  );
}
