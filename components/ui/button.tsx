import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-sm text-sm font-medium tracking-[0.1em] uppercase transition-all duration-300 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-[#D4AF37]/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          "bg-transparent border-2 border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#1C1C1C]",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20",
        outline:
          "border border-[#1C1C1C] bg-transparent text-[#1C1C1C] hover:bg-[#1C1C1C] hover:text-white dark:border-[#F0EDE8] dark:text-[#F0EDE8] dark:hover:bg-[#F0EDE8] dark:hover:text-[#1A1A1A]",
        secondary: "bg-[#D4AF37] text-[#1C1C1C] hover:bg-[#BF9B30]",
        ghost:
          "text-[#D4AF37] hover:underline hover:underline-offset-4 hover:decoration-[#D4AF37]",
        link: "text-[#D4AF37] underline-offset-4 hover:underline",
        "hero-primary":
          "bg-transparent border-2 border-[#D4AF37] text-white hover:bg-[#D4AF37] hover:text-[#1C1C1C]",
        "hero-secondary":
          "bg-transparent border border-white/60 text-white hover:bg-white hover:text-[#1C1C1C]",
      },
      size: {
        default: "h-10 px-6 py-2",
        sm: "h-8 px-4 py-1.5 text-xs",
        lg: "h-12 px-10 py-4 text-sm",
        xl: "h-14 px-12 py-4 text-base",
        icon: "size-9",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
