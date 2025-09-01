import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        // Status variants
        open: "border-transparent bg-blue-500/20 text-blue-600 dark:text-blue-400",
        pending: "border-transparent bg-amber-500/20 text-amber-600 dark:text-amber-400",
        closed: "border-transparent bg-gray-500/20 text-gray-600 dark:text-gray-400",
        online: "border-transparent bg-success/20 text-success",
        offline: "border-transparent bg-gray-500/20 text-gray-500",
        error: "border-transparent bg-destructive/20 text-destructive",
        // Additional variants
        success: "border-transparent bg-green-500/20 text-green-600 dark:text-green-400",
        warning: "border-transparent bg-amber-500/20 text-amber-600 dark:text-amber-400",
        // SLA variants
        sla_normal: "border-transparent bg-success/20 text-success",
        sla_warning: "border-transparent bg-warning/20 text-warning",
        sla_critical: "border-transparent bg-destructive/20 text-destructive",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
