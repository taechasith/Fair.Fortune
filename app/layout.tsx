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
  return (
    <html lang="en">
      <body>
        <div className="page-shell">
          <SiteHeader />
          <main className="page-main">{children}</main>
        </div>
      </body>
    </html>
  );
}
