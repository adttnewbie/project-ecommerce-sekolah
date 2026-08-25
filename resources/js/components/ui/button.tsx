import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-[12px] border border-transparent bg-clip-padding text-sm font-semibold whitespace-nowrap transition-all duration-[180ms] ease-[cubic-bezier(0.22,1,0.36,1)] outline-none select-none focus-visible:border-[#0080FF] focus-visible:ring-3 focus-visible:ring-[#0080FF]/20 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-[#DC2626] aria-invalid:ring-3 aria-invalid:ring-[#DC2626]/20 dark:aria-invalid:border-rose-500/50 dark:aria-invalid:ring-rose-500/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 motion-reduce:transition-none motion-reduce:transform-none",
  {
    variants: {
      variant: {
        default: "bg-[#0080FF] text-white hover:bg-[#006FE0] active:bg-[#0059B8]",
        outline:
          "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-950 aria-expanded:bg-slate-50 aria-expanded:text-slate-950 dark:bg-transparent dark:hover:bg-input/30",
        secondary:
          "bg-slate-100 text-slate-700 hover:bg-slate-200 aria-expanded:bg-slate-100 aria-expanded:text-slate-900",
        ghost:
          "text-slate-700 hover:bg-slate-100 hover:text-slate-950 aria-expanded:bg-slate-100 aria-expanded:text-slate-950 dark:hover:bg-muted/50",
        destructive:
          "bg-rose-600 text-white hover:bg-rose-700 focus-visible:border-rose-500 focus-visible:ring-rose-500/20 dark:bg-rose-600 dark:hover:bg-rose-700 dark:focus-visible:ring-rose-500/40",
        link: "text-[#0080FF] underline-offset-4 hover:underline",
      },
      size: {
        default:
          "h-11 gap-2 px-5 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3",
        xs: "h-6 gap-1 px-2.5 text-xs has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-9 gap-1.5 px-3 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        lg: "h-11 gap-1.5 px-4 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3",
        icon: "size-11",
        "icon-xs": "size-6 [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8",
        "icon-lg": "size-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const Button = React.forwardRef<
    HTMLButtonElement,
    React.ComponentProps<'button'> &
        VariantProps<typeof buttonVariants> & { asChild?: boolean }
>(function Button(
    { className, variant = 'default', size = 'default', asChild = false, ...props },
    ref,
) {
    const Comp = asChild ? Slot.Root : 'button';

    return (
        <Comp
            ref={ref as never}
            data-slot="button"
            data-variant={variant}
            data-size={size}
            className={cn(buttonVariants({ variant, size, className }))}
            {...props}
        />
    );
});

Button.displayName = 'Button';

export { Button, buttonVariants }
