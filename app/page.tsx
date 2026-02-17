import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const modes = [
  {
    href: "/giver",
    title: "Giver Mode",
    description: "Set budget, recipients, fairness and lucky rules, then generate allocations."
  },
  {
    href: "/receiver",
    title: "Receiver Mode",
    description: "Pick one person and see why their hongbao amount was assigned."
  },
  {
    href: "/lab",
    title: "Lab Mode",
    description: "Compare Gaussian/Jacobi/Gauss-Seidel and inspect convergence/sensitivity."
  }
];

export default function HomePage() {
  return (
    <div className="space-y-6">
      <section className="space-y-2">
        <h1 className="text-4xl font-bold">FairFortune: A Budget-Constrained Hongbao System</h1>
        <p className="text-muted-foreground">
          Family-friendly allocation with transparent numerical methods and classroom-ready lab tools.
        </p>
      </section>
      <section className="grid gap-4 md:grid-cols-3">
        {modes.map((mode) => (
          <Link key={mode.href} href={mode.href}>
            <Card className="h-full border-2 transition hover:border-primary">
              <CardHeader>
                <CardTitle>{mode.title}</CardTitle>
                <CardDescription>{mode.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm">Open {mode.title}</div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </section>
    </div>
  );
}