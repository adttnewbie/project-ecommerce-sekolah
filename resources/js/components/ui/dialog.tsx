"use client"

import * as React from "react"
import { Dialog as DialogPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { XIcon } from "lucide-react"

function Dialog({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />
}

function DialogTrigger({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />
}

function DialogPortal({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />
}

function DialogClose({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />
}

function DialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      data-slot="dialog-overlay"
      className={cn(
        "fixed inset-0 isolate z-50 bg-black/30 duration-100 supports-backdrop-filter:backdrop-blur-sm data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0",
        className
      )}
      {...props}
    />
  )
}

function DialogContent({
  className,
  children,
  showCloseButton = true,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
  showCloseButton?: boolean
}) {
  const {
    onInteractOutside: userOnInteractOutside,
    onPointerDownOutside: userOnPointerDownOutside,
    onPointerDownCapture: userOnPointerDownCapture,
    onFocusOutside: userOnFocusOutside,
    onEscapeKeyDown: userOnEscapeKeyDown,
    ...rest
  } = props as unknown as {
    onInteractOutside?: (e: Event) => void;
    onPointerDownOutside?: (e: Event) => void;
    onPointerDownCapture?: (e: any) => void;
    onFocusOutside?: (e: Event) => void;
    onEscapeKeyDown?: (e: KeyboardEvent) => void;
  };
  const selectWasOpenRef = React.useRef(false);

  React.useEffect(() => {
    const handlePointerDown = () => {
      if (typeof document !== 'undefined') {
        selectWasOpenRef.current =
          !!document.querySelector('[data-slot="select-content"]');
      }
    };
    document.addEventListener('pointerdown', handlePointerDown, true);
    return () =>
      document.removeEventListener('pointerdown', handlePointerDown, true);
  }, []);

  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        className={cn(
          "fixed top-1/2 left-1/2 z-50 grid w-full max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 gap-6 rounded-[8px] bg-white p-6 text-sm text-slate-900 shadow-xl ring-1 ring-slate-200 duration-100 outline-none sm:max-w-md data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
          className
        )}
        onPointerDownCapture={(e: any) => {
          if (typeof document !== 'undefined') {
            const hasSelect = !!document.querySelector(
              '[data-slot="select-content"]',
            );
            // simpan status saat pointer down, sebelum Select unmount
            selectWasOpenRef.current = hasSelect;
          }
          userOnPointerDownCapture?.(e);
        }}
        onInteractOutside={(e) => {
          // Jika Select sedang terbuka (capture di pointerDown) atau masih ada di DOM, jangan tutup Dialog
          if (
            selectWasOpenRef.current ||
            (typeof document !== 'undefined' &&
              document.querySelector('[data-slot="select-content"]'))
          ) {
            e.preventDefault();
            selectWasOpenRef.current = false;
          }
          const target = e.target as HTMLElement;
          if (
            target?.closest?.('[data-slot="select-content"]') ||
            target?.closest?.('[data-radix-popper-content-wrapper]') ||
            target?.closest?.('[data-slot="select-trigger"]')
          ) {
            e.preventDefault();
          }
          userOnInteractOutside?.(e);
        }}
        onPointerDownOutside={(e) => {
          if (
            selectWasOpenRef.current ||
            (typeof document !== 'undefined' &&
              document.querySelector('[data-slot="select-content"]'))
          ) {
            e.preventDefault();
            selectWasOpenRef.current = false;
          }
          const target = e.target as HTMLElement;
          if (target?.closest?.('[data-slot="select-content"]')) {
            e.preventDefault();
          }
          userOnPointerDownOutside?.(e);
        }}
        onFocusOutside={(e: any) => {
          if (
            selectWasOpenRef.current ||
            (typeof document !== 'undefined' &&
              document.querySelector('[data-slot="select-content"]'))
          ) {
            e.preventDefault();
          }
          // @ts-ignore
          userOnFocusOutside?.(e);
        }}
        onEscapeKeyDown={(e: any) => {
          if (
            typeof document !== 'undefined' &&
            document.querySelector('[data-slot="select-content"]')
          ) {
            e.preventDefault();
          }
          // @ts-ignore
          userOnEscapeKeyDown?.(e);
        }}
        {...rest}
      >
        {children}
        {showCloseButton && (
          <DialogPrimitive.Close data-slot="dialog-close" asChild>
            <Button
              variant="ghost"
              className="absolute top-4 right-4"
              size="icon-sm"
            >
              <XIcon
              />
              <span className="sr-only">Close</span>
            </Button>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPortal>
  )
}

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-header"
      className={cn("flex flex-col gap-1.5", className)}
      {...props}
    />
  )
}

function DialogFooter({
  className,
  showCloseButton = false,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  showCloseButton?: boolean
}) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        className
      )}
      {...props}
    >
      {children}
      {showCloseButton && (
        <DialogPrimitive.Close asChild>
          <Button variant="outline">Close</Button>
        </DialogPrimitive.Close>
      )}
    </div>
  )
}

function DialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn(
        "font-heading text-base leading-none font-semibold text-slate-950",
        className
      )}
      {...props}
    />
  )
}

function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn(
        "text-sm text-muted-foreground *:[a]:underline *:[a]:underline-offset-3 *:[a]:hover:text-foreground",
        className
      )}
      {...props}
    />
  )
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
}
