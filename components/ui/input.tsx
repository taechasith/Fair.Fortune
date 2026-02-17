import * as React from "react";
import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "flex h-10 w-full rounded-xl border border-[#D4AF37]/50 bg-[#FDF6EC] px-3 py-2 text-sm text-[#2B2B2B] ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-[#6f6259] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37] disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = "Input";

export { Input };
