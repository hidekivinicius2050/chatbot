import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900 disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed",
  {
    variants: {
      variant: {
        default: "btn-primary shadow-professional hover:scale-105 active:scale-95",
        destructive: "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-professional hover:scale-105 active:scale-95 hover:from-red-600 hover:to-red-700",
        outline: "btn-secondary hover:scale-105 active:scale-95",
        secondary: "bg-gradient-to-r from-gray-600 to-gray-700 text-white shadow-professional hover:scale-105 active:scale-95 hover:from-gray-700 hover:to-gray-800",
        ghost: "text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-lg px-4 py-2 transition-all duration-200",
        link: "text-blue-400 underline-offset-4 hover:text-blue-300 hover:underline transition-colors duration-200",
        brand: "gradient-primary text-white shadow-professional hover:scale-105 active:scale-95",
        success: "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-professional hover:scale-105 active:scale-95 hover:from-green-600 hover:to-green-700",
        warning: "bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-professional hover:scale-105 active:scale-95 hover:from-yellow-600 hover:to-yellow-700",
        glass: "bg-glass text-white border border-white/20 shadow-professional hover:scale-105 active:scale-95 hover:bg-white/10",
      },
      size: {
        default: "h-11 px-6 py-3 rounded-xl text-base",
        sm: "h-9 px-4 py-2 rounded-lg text-sm",
        lg: "h-14 px-8 py-4 rounded-2xl text-lg",
        xl: "h-16 px-10 py-5 rounded-2xl text-xl",
        icon: "h-11 w-11 rounded-xl",
        compact: "h-8 px-3 py-1.5 rounded-lg text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading = false, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={loading || props.disabled}
        {...props}
      >
        {loading && (
          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        )}
        {children}
      </Comp>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
