import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:-translate-y-0.5",
  {
    variants: {
      variant: {
        default:
          "bg-[linear-gradient(140deg,#C8102E,#7A0C1B)] text-primary-foreground shadow-[0_8px_18px_rgba(122,12,27,0.25)] hover:shadow-[0_12px_22px_rgba(122,12,27,0.33)]",
        secondary:
          "border border-[#D4AF37]/55 bg-[#FDF6EC] text-[#7A0C1B] hover:border-[#D4AF37] hover:bg-[#F8EFD8]",
        ghost: "text-[#7A0C1B] hover:bg-[#7A0C1B]/10"
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-lg px-3",
        lg: "h-11 rounded-xl px-8"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return <button className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
