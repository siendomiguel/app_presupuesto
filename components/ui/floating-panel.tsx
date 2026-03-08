"use client"

import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

const OVERLAY_CLASSES =
    "fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"

const PANEL_BASE =
    "fixed left-[50%] top-[50%] z-50 grid w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg rounded-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] max-h-[90vh] overflow-y-auto"

// --- Root, Trigger, Close (re-exports) ---
const FloatingPanel = DialogPrimitive.Root
const FloatingPanelTrigger = DialogPrimitive.Trigger
const FloatingPanelClose = DialogPrimitive.Close
const FloatingPanelPortal = DialogPrimitive.Portal

// --- Overlay ---
const FloatingPanelOverlay = React.forwardRef<
    React.ElementRef<typeof DialogPrimitive.Overlay>,
    React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
    <DialogPrimitive.Overlay
        ref={ref}
        className={cn(OVERLAY_CLASSES, className)}
        {...props}
    />
))
FloatingPanelOverlay.displayName = "FloatingPanelOverlay"

// --- Content ---
interface FloatingPanelContentProps
    extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
    /** Desktop max-width. Defaults to "sm:max-w-lg" */
    size?: "sm" | "md" | "lg" | "xl" | "2xl" | "5xl" | "6xl" | "full"
    /** Show the X close button. Defaults to true */
    showClose?: boolean
}

const sizeMap: Record<string, string> = {
    sm: "sm:max-w-sm",
    md: "sm:max-w-md",
    lg: "sm:max-w-lg",
    xl: "sm:max-w-xl",
    "2xl": "sm:max-w-2xl",
    "5xl": "sm:max-w-5xl",
    "6xl": "sm:max-w-6xl",
    full: "sm:max-w-[calc(100%-4rem)]",
}

const FloatingPanelContent = React.forwardRef<
    React.ElementRef<typeof DialogPrimitive.Content>,
    FloatingPanelContentProps
>(({ className, children, size = "lg", showClose = true, ...props }, ref) => (
    <FloatingPanelPortal>
        <FloatingPanelOverlay />
        <DialogPrimitive.Content
            ref={ref}
            className={cn(PANEL_BASE, sizeMap[size], className)}
            {...props}
        >
            {children}
            {showClose && (
                <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
                    <X className="h-4 w-4" />
                    <span className="sr-only">Cerrar</span>
                </DialogPrimitive.Close>
            )}
        </DialogPrimitive.Content>
    </FloatingPanelPortal>
))
FloatingPanelContent.displayName = "FloatingPanelContent"

// --- Header ---
const FloatingPanelHeader = ({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
    <div
        className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)}
        {...props}
    />
)
FloatingPanelHeader.displayName = "FloatingPanelHeader"

// --- Footer ---
const FloatingPanelFooter = ({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
    <div
        className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)}
        {...props}
    />
)
FloatingPanelFooter.displayName = "FloatingPanelFooter"

// --- Title ---
const FloatingPanelTitle = React.forwardRef<
    React.ElementRef<typeof DialogPrimitive.Title>,
    React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
    <DialogPrimitive.Title
        ref={ref}
        className={cn("text-lg font-semibold leading-none tracking-tight", className)}
        {...props}
    />
))
FloatingPanelTitle.displayName = "FloatingPanelTitle"

// --- Description ---
const FloatingPanelDescription = React.forwardRef<
    React.ElementRef<typeof DialogPrimitive.Description>,
    React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
    <DialogPrimitive.Description
        ref={ref}
        className={cn("text-sm text-muted-foreground", className)}
        {...props}
    />
))
FloatingPanelDescription.displayName = "FloatingPanelDescription"

export {
    FloatingPanel,
    FloatingPanelPortal,
    FloatingPanelOverlay,
    FloatingPanelClose,
    FloatingPanelTrigger,
    FloatingPanelContent,
    FloatingPanelHeader,
    FloatingPanelFooter,
    FloatingPanelTitle,
    FloatingPanelDescription,
}
