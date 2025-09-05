import * as React from "react"

import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: "default" | "glass" | "bordered"
  size?: "sm" | "default" | "lg"
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, variant = "default", size = "default", ...props }, ref) => {
    const variantClasses = {
      default: "input-field",
      glass: "bg-glass border-white/20 text-white placeholder:text-gray-400",
      bordered: "input-field border-2 border-blue-500/30 focus:border-blue-500"
    }

    const sizeClasses = {
      sm: "h-8 px-3 py-2 text-sm",
      default: "h-11 px-4 py-3 text-base",
      lg: "h-14 px-6 py-4 text-lg"
    }

    return (
      <input
        type={type}
        className={cn(
          "w-full rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50",
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
