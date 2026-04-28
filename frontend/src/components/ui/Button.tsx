import * as React from "react"
import { cn } from "../../lib/utils"
// Note: We don't have radix installed actually, so let's skip Slot for now and use cleaner standard Button

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
    size?: "default" | "sm" | "lg" | "icon"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "default", size = "default", ...props }, ref) => {
        return (
            <button
                ref={ref}
                className={cn(
                    "relative inline-flex max-w-full items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-2xl border border-transparent text-sm font-semibold tracking-[0.01em] ring-offset-white transition-[transform,box-shadow,background-color,border-color,color,opacity] duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/70 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none motion-safe:hover:-translate-y-0.5 motion-safe:active:translate-y-0 dark:ring-offset-slate-950",
                    {
                        "bg-slate-900 text-slate-50 shadow-[0_12px_30px_rgba(15,23,42,0.16)] hover:bg-slate-800 hover:shadow-[0_18px_40px_rgba(15,23,42,0.22)] dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-white dark:hover:shadow-[0_14px_36px_rgba(248,250,252,0.16)]": variant === "default",
                        "bg-red-500 text-slate-50 shadow-[0_12px_30px_rgba(239,68,68,0.2)] hover:bg-red-500/90 hover:shadow-[0_18px_40px_rgba(239,68,68,0.26)] dark:bg-red-900 dark:text-slate-50 dark:hover:bg-red-800": variant === "destructive",
                        "border-slate-200/90 bg-white/90 text-slate-700 shadow-[0_10px_24px_rgba(15,23,42,0.05)] hover:border-slate-300 hover:bg-white hover:text-slate-950 hover:shadow-[0_16px_34px_rgba(15,23,42,0.1)] dark:border-slate-800 dark:bg-slate-950/90 dark:text-slate-200 dark:hover:border-slate-700 dark:hover:bg-slate-900 dark:hover:text-white dark:hover:shadow-[0_16px_36px_rgba(2,6,23,0.32)]": variant === "outline",
                        "bg-slate-100 text-slate-900 shadow-[0_10px_22px_rgba(148,163,184,0.18)] hover:bg-slate-200 hover:shadow-[0_16px_34px_rgba(148,163,184,0.24)] dark:bg-slate-800 dark:text-slate-50 dark:hover:bg-slate-700 dark:hover:shadow-[0_16px_36px_rgba(2,6,23,0.28)]": variant === "secondary",
                        "text-slate-700 hover:bg-slate-100/90 hover:text-slate-950 dark:text-slate-200 dark:hover:bg-slate-800/80 dark:hover:text-white": variant === "ghost",
                        "rounded-none border-0 p-0 text-slate-900 underline-offset-4 hover:underline hover:shadow-none dark:text-slate-50": variant === "link",
                        "h-11 px-4 py-2": size === "default",
                        "h-9 rounded-xl px-3": size === "sm",
                        "h-12 px-6 text-base": size === "lg",
                        "h-10 w-10 rounded-xl": size === "icon",
                    },
                    className
                )}
                {...props}
            />
        )
    }
)
Button.displayName = "Button"

export { Button }
