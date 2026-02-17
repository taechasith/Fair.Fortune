import * as React from "react";
import { cn } from "@/lib/utils";

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, ...props }, ref) => (
  <textarea
    className={cn(
      "min-h-[80px] w-full rounded-xl border border-[#D4AF37]/50 bg-[#FDF6EC] px-3 py-2 text-sm text-[#2B2B2B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]",
      className
    )}
    ref={ref}
    {...props}
  />
));
Textarea.displayName = "Textarea";

export { Textarea };
