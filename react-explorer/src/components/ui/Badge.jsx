import React from "react"
import { cva } from "class-variance-authority"
import { cn } from "../../lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-blockchain-primary text-white hover:bg-blockchain-primary/80",
        secondary: "border-transparent bg-blockchain-secondary text-white hover:bg-blockchain-secondary/80",
        destructive: "border-transparent bg-blockchain-error text-white hover:bg-blockchain-error/80",
        outline: "text-foreground border-gray-300 dark:border-gray-600",
        success: "border-transparent bg-blockchain-success text-white hover:bg-blockchain-success/80",
        warning: "border-transparent bg-blockchain-warning text-white hover:bg-blockchain-warning/80",
        accent: "border-transparent bg-blockchain-accent text-white hover:bg-blockchain-accent/80",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({ className, variant, ...props }) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }