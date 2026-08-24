import { Toaster as Sonner, type ToasterProps } from "sonner"
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from "lucide-react"

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      duration={4000}
      position="top-right"
      gap={8}
      offset={80}
      visibleToasts={5}
      closeButton
      icons={{
        success: (
          <CircleCheckIcon className="size-4 shrink-0" />
        ),
        info: (
          <InfoIcon className="size-4 shrink-0" />
        ),
        warning: (
          <TriangleAlertIcon className="size-4 shrink-0" />
        ),
        error: (
          <OctagonXIcon className="size-4 shrink-0" />
        ),
        loading: (
          <Loader2Icon className="size-4 animate-spin" />
        ),
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: "cn-toast",
          title: "text-sm font-semibold text-slate-900 mb-0.5",
          description: "text-xs text-slate-500 leading-relaxed",
          success: "data-[type=success]:border-l-4 data-[type=success]:border-l-emerald-500",
          error: "data-[type=error]:border-l-4 data-[type=error]:border-l-red-500",
          warning: "data-[type=warning]:border-l-4 data-[type=warning]:border-l-amber-500",
          info: "data-[type=info]:border-l-4 data-[type=info]:border-l-blue-500",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
