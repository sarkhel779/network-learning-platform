import type { Metadata } from "next";
import type { ReactNode } from "react";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://packetsecrets.com"),
  title: "Packetsecrets",
  description: "A beginner-friendly path to understanding computer networks.",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `(function(){try{var t=localStorage.getItem('packetsecrets-theme');if(t==='light'||t==='dark'){document.documentElement.dataset.theme=t}else{document.documentElement.removeAttribute('data-theme')}}catch(e){}})()` }} />
      </head>
      <body>
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
