import * as React from "react";
import { cn } from "@/lib/utils";

export type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement>;

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(({ className, children, ...props }, ref) => (
  <select
    ref={ref}
    className={cn(
      "flex h-10 w-full rounded-xl border border-[#D4AF37]/50 bg-[#FDF6EC] px-3 py-2 text-sm text-[#2B2B2B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]",
      className
    )}
    {...props}
  >
    {children}
  </select>
));
Select.displayName = "Select";

export { Select };
