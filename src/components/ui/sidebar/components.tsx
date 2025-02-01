import * as React from "react"
import { cn } from "@/lib/utils"

export const SidebarGroup = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-sidebar="group"
    className={cn("flex w-full flex-col gap-4", className)}
    {...props}
  />
))
SidebarGroup.displayName = "SidebarGroup"

export const SidebarGroupContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-sidebar="group-content"
    className={cn("flex w-full flex-col gap-1", className)}
    {...props}
  />
))
SidebarGroupContent.displayName = "SidebarGroupContent"

export const SidebarGroupLabel = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-sidebar="group-label"
    className={cn(
      "px-4 py-1 text-xs font-medium text-muted-foreground",
      className
    )}
    {...props}
  />
))
SidebarGroupLabel.displayName = "SidebarGroupLabel"

export const SidebarFooter = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-sidebar="footer"
    className={cn("mt-auto flex w-full flex-col gap-4 p-4", className)}
    {...props}
  />
))
SidebarFooter.displayName = "SidebarFooter"