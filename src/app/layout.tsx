import type { Metadata } from "next";
import type { ReactNode } from "react";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { listPathways } from "@/features/catalog/catalog.repository";

import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://packetsecrets.com"),
  title: "Packetsecrets",
  description: "A beginner-friendly path to understanding computer networks.",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  const searchableLessons = listPathways().flatMap((pathway) => pathway.modules.flatMap((module) => module.lessons
    .filter((lesson) => lesson.published)
    .map((lesson) => ({ title: lesson.title, objective: lesson.objective, href: `/learn/${pathway.slug}/${lesson.slug}` }))));
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `(function(){try{var t=localStorage.getItem('packetsecrets-theme');if(t==='light'||t==='dark'){document.documentElement.dataset.theme=t}else{document.documentElement.removeAttribute('data-theme')}}catch(e){}})()` }} />
      </head>
      <body>
        <SiteHeader lessons={searchableLessons} />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
