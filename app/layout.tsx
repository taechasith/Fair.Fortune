import type { Metadata } from "next";
import Link from "next/link";
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
        <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,_#f5ddcc,_#f7f0e8_45%,_#f9f4ee)]">
          <header className="border-b bg-white/70 backdrop-blur">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
              <Link href="/" className="text-xl font-bold">
                FairFortune
              </Link>
              <nav className="flex gap-4 text-sm">
                <Link href="/giver">Giver Mode</Link>
                <Link href="/receiver">Receiver Mode</Link>
                <Link href="/lab">Lab Mode</Link>
              </nav>
            </div>
          </header>
          <main className="mx-auto max-w-6xl p-4">{children}</main>
        </div>
      </body>
    </html>
  );
}