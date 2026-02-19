import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

export const metadata: Metadata = {
  title: "FairFortune",
  description: "Budget-constrained hongbao allocation with numerical algorithms"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const year = new Date().getFullYear();

  return (
    <html lang="en" data-theme="morning">
      <body>
        <div className="page-shell">
          <SiteHeader />
          <main className="page-main">{children}</main>
          <footer className="page-footer">
            &copy; {year} All Rights Reserved. Researcher of FUTURISTIC CULTURE Interfaces, CreativeDev.Lab@HSUTCC
            (CreativeLabTH Group).
          </footer>
        </div>
      </body>
    </html>
  );
}
