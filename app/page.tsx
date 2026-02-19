import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const modes = [
  {
    href: "/login",
    icon: "LOGIN",
    title: "Login",
    description: "Sign in or register to store project, room, and gratitude data."
  },
  {
    href: "/giver",
    icon: "GIVER",
    title: "Giver Mode",
    description: "Set budget, recipients, fairness and lucky rules, then generate allocations."
  },
  {
    href: "/receiver",
    icon: "RECV",
    title: "Receiver Mode",
    description: "Pick one person and see why their hongbao amount was assigned."
  }
];

export default function HomePage() {
  return (
    <div className="space-y-8 md:space-y-10">
      <section className="cny-hero rounded-2xl p-6 text-[#FDF6EC] md:p-10">
        <span className="cny-lantern left-[10%] top-8" />
        <span className="cny-lantern left-[62%] top-6 [animation-delay:2s]" />
        <span className="cny-lantern right-[8%] top-12 [animation-delay:4s]" />
        <div className="relative grid items-center gap-8 md:grid-cols-2">
          <div className="space-y-4">
            <p className="inline-flex rounded-full border border-[#D4AF37]/70 bg-[#D4AF37]/10 px-3 py-1 text-xs font-semibold text-[#F5DE88]">
              Budget-Constrained Hongbao System
            </p>
            <h1 className="text-3xl font-bold leading-tight md:text-5xl">FairFortune for Chinese New Year</h1>
            <p className="max-w-xl text-sm text-[#F8EFD8] md:text-base">
              A modern, transparent, and academically grounded way to allocate hongbao fairly for family gatherings
              and classroom demos.
            </p>
            <div className="inline-flex rounded-full border border-[#D4AF37]/70 bg-[#7A0C1B]/55 px-4 py-2 text-xs md:text-sm">
              Festive, elegant, and data-driven.
            </div>
          </div>
          <div className="relative hidden justify-self-end md:block">
            <Image
              src="/assets/hongbao-illustration.png"
              alt="Decorative hongbao illustration"
              width={360}
              height={320}
              className="h-auto w-[320px] drop-shadow-[0_14px_20px_rgba(43,43,43,0.25)]"
              priority
            />
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {modes.map((mode) => (
          <Link key={mode.href} href={mode.href}>
            <Card className="cny-panel cny-card-hover h-full rounded-2xl transition">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[#7A0C1B]">
                  <span aria-hidden>{mode.icon}</span>
                  <span>{mode.title}</span>
                </CardTitle>
                <CardDescription className="text-[#5f5148]">{mode.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <div className="text-sm text-[#2B2B2B]">Open {mode.title}</div>
                <div className="rounded-full bg-[linear-gradient(140deg,#C8102E,#7A0C1B)] px-3 py-1 text-xs font-semibold text-[#FDF6EC]">
                  Enter
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </section>

      <section className="cny-panel rounded-2xl p-4 md:p-6">
        <details>
          <summary className="cursor-pointer text-sm font-semibold text-[#7A0C1B]">Study / Classroom Mode</summary>
          <p className="mt-2 text-sm text-[#5f5148]">
            This section is for educational purposes and shows the behind-the-scenes calculation process.
          </p>
          <Link
            href="/lab"
            className="mt-3 inline-flex rounded-full border border-[#D4AF37]/70 bg-[#FDF6EC] px-4 py-2 text-sm font-medium text-[#7A0C1B] hover:bg-[#F8EFD8]"
          >
            Open Behind the Scenes
          </Link>
        </details>
      </section>
    </div>
  );
}
