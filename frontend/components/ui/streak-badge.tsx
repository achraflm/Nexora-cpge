"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Flame } from "lucide-react"
import { cn } from "@/lib/utils"

interface StreakResponse {
  length: number
  frequency: "daily" | "weekly" | "monthly"
}

const streakBadgeVariants = cva(
  "inline-flex flex-col items-center justify-center rounded-3xl border border-border/60 bg-card text-center text-card-foreground transition-colors",
  {
    variants: {
      size: {
        sm: "w-28 gap-1.5 p-3",
        default: "w-40 gap-2.5 p-5",
        lg: "w-52 gap-3 p-6",
      },
    },
    defaultVariants: { size: "default" },
  }
)

interface StreakBadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof streakBadgeVariants> {
  length?: number
  frequency?: StreakResponse["frequency"]
  subtitle?: string
  icon?: React.ReactNode
}

const units = {
  daily: ["jour", "jours"],
  weekly: ["semaine", "semaines"],
  monthly: ["mois", "mois"],
}

const sizes = {
  sm: { icon: "size-10", value: "text-2xl", subtitle: "text-xs" },
  default: { icon: "size-16", value: "text-5xl", subtitle: "text-sm" },
  lg: { icon: "size-20", value: "text-6xl", subtitle: "text-base" },
}

const StreakBadge = React.forwardRef<HTMLDivElement, StreakBadgeProps>(
  ({ className, size, length = 0, frequency = "daily", subtitle = "Régularité", icon, ...props }, ref) => {
    const unit = units[frequency][length === 1 ? 0 : 1]
    const styles = sizes[size ?? "default"]

    return (
      <div
        ref={ref}
        role="status"
        aria-label={`${subtitle} : ${length} ${unit} de suite`}
        className={cn(streakBadgeVariants({ size }), className)}
        {...props}
      >
        <span className="contents" aria-hidden="true">
          {icon ?? <Flame className={cn(styles.icon, "shrink-0 text-primary")} />}
        </span>
        <span className={cn("font-semibold tracking-tight", styles.value)} aria-hidden="true">
          {length} <span className="font-medium text-muted-foreground">{unit}</span>
        </span>
        <span className={cn("font-normal text-muted-foreground", styles.subtitle)} aria-hidden="true">
          {subtitle}
        </span>
      </div>
    )
  }
)
StreakBadge.displayName = "StreakBadge"

export { StreakBadge, streakBadgeVariants }
export type { StreakBadgeProps, StreakResponse }
