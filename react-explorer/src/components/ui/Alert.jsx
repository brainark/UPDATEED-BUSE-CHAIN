import React from "react"
import { cva } from "class-variance-authority"
import { cn } from "../../lib/utils"

const alertVariants = cva(
  "relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground border-gray-200 dark:border-gray-700",
        destructive: "border-blockchain-error/50 text-blockchain-error dark:border-blockchain-error [&>svg]:text-blockchain-error bg-red-50 dark:bg-red-950/20",
        success: "border-blockchain-success/50 text-blockchain-success dark:border-blockchain-success [&>svg]:text-blockchain-success bg-green-50 dark:bg-green-950/20",
        warning: "border-blockchain-warning/50 text-blockchain-warning dark:border-blockchain-warning [&>svg]:text-blockchain-warning bg-yellow-50 dark:bg-yellow-950/20",
        info: "border-blockchain-accent/50 text-blockchain-accent dark:border-blockchain-accent [&>svg]:text-blockchain-accent bg-blue-50 dark:bg-blue-950/20",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const Alert = React.forwardRef(({ className, variant, ...props }, ref) => (
  <div
    ref={ref}
    role="alert"
    className={cn(alertVariants({ variant }), className)}
    {...props}
  />
))
Alert.displayName = "Alert"

const AlertTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn("mb-1 font-medium leading-none tracking-tight", className)}
    {...props}
  />
))
AlertTitle.displayName = "AlertTitle"

const AlertDescription = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm [&_p]:leading-relaxed", className)}
    {...props}
  />
))
AlertDescription.displayName = "AlertDescription"

export { Alert, AlertTitle, AlertDescription }