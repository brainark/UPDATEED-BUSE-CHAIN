import React from "react"
import { cva } from "class-variance-authority"
import { cn } from "../../lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-blockchain-primary text-white hover:bg-blockchain-primary/90",
        destructive: "bg-blockchain-error text-white hover:bg-blockchain-error/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-blockchain-secondary text-white hover:bg-blockchain-secondary/90",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-blockchain-primary underline-offset-4 hover:underline",
        success: "bg-blockchain-success text-white hover:bg-blockchain-success/90",
        warning: "bg-blockchain-warning text-white hover:bg-blockchain-warning/90",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  return (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  )
})
Button.displayName = "Button"

export { Button, buttonVariants }