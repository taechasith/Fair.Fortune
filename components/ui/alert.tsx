import { cn } from "@/lib/utils";
import { ReactNode } from "react";

export function Alert({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("rounded-md border p-3 text-sm", className)}>{children}</div>;
}