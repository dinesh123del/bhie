import * as React from "react";

const cn = (...classes: (string | false | undefined)[]) => classes.filter(Boolean).join(' ');

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { variant?: "default" | "destructive" }
>(({ className, variant = "default", ...props }, ref) => (
  <div
    ref={ref}
    role="alert"
    className={cn(
      "relative w-full rounded-lg border p-4",
      variant === "default" && "bg-gray-50 text-gray-900",
      variant === "destructive" && "bg-red-50 border-red-200 text-red-900",
      className
    )}
    {...props}
  />
));
Alert.displayName = "Alert";

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm", className)}
    {...props}
  />
));
AlertDescription.displayName = "AlertDescription";

export { Alert, AlertDescription };
