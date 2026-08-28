import Link from "next/link";
import type { ReactNode } from "react";

type PremiumPreviewProps = { children: ReactNode };

export function PremiumPreview({ children }: PremiumPreviewProps) {
  return (
    <aside aria-label="Premium lesson preview" className="learning-block premium-preview">
      <h2>Premium lesson preview</h2>
      <div>{children}</div>
      <p>This preview introduces material covered in the upcoming premium lessons.</p>
      <Link href="/pricing">Explore premium learning options</Link>
    </aside>
  );
}
