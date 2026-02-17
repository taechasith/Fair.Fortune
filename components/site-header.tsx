"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/giver", label: "Giver Mode" },
  { href: "/receiver", label: "Receiver Mode" }
];

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-[#D4AF37] bg-[#FDF6EC]/95 backdrop-blur">
      <div className="mx-auto flex max-w-[1200px] items-center justify-between px-4 py-3 md:px-8">
        <Link href="/" className="inline-flex items-center gap-3" aria-label="FairFortune home">
          <Image
            src="/assets/logo-fairfortune-cny.png"
            alt="FairFortune logo"
            width={220}
            height={52}
            priority
            className="h-auto w-[190px] md:w-[220px]"
          />
        </Link>

        <nav className="flex items-center gap-1 rounded-full border border-[#D4AF37]/50 bg-[#FDF6EC] p-1 text-sm md:gap-2">
          {tabs.map((tab) => {
            const active = pathname === tab.href;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  "rounded-full px-3 py-2 font-medium text-[#2B2B2B] hover:bg-[#7A0C1B]/10",
                  active && "border-b-2 border-[#D4AF37] bg-[#7A0C1B]/8 text-[#7A0C1B]"
                )}
                aria-current={active ? "page" : undefined}
              >
                {tab.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
