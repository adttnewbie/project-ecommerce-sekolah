import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-24 w-full resize-none rounded-[10px] border border-slate-200 bg-white px-3 py-3 text-base text-slate-900 transition-[color,box-shadow,background-color] duration-[180ms] ease-[cubic-bezier(0.22,1,0.36,1)] outline-none placeholder:text-slate-400 focus-visible:border-[#0080FF] focus-visible:ring-3 focus-visible:ring-[#0080FF]/20 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:opacity-60 aria-invalid:border-[#DC2626] aria-invalid:ring-3 aria-invalid:ring-[#DC2626]/20 md:text-sm dark:aria-invalid:border-rose-500/50 dark:aria-invalid:ring-rose-500/40",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
