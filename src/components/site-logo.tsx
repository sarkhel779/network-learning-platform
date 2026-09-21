import Image from "next/image";

export function SiteLogoMark() {
  return (
    <Image
      className="site-logo__mark-svg"
      src="/icon.svg"
      alt=""
      aria-hidden="true"
      width={32}
      height={32}
      priority
      unoptimized
    />
  );
}
