
import React from "react";
import { Badge, BadgeProps } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export interface ColoredBadgeProps extends BadgeProps {
  label: string;
  color?: string;
  backgroundColor?: string;
  borderColor?: string;
  maxLength?: number;
  showTooltip?: boolean;
}

export function ColoredBadge({
  label,
  color,
  backgroundColor,
  borderColor,
  className,
  maxLength = 24,
  showTooltip = true,
  ...props
}: ColoredBadgeProps) {
  const truncatedLabel = label.length > maxLength 
    ? `${label.substring(0, maxLength)}...` 
    : label;
  
  // Always show tooltip on hover, regardless of truncation
  const badgeContent = (
    <Badge
      className={cn(
        "text-xs font-medium px-2 py-0.5",
        className
      )}
      style={{
        color: color,
        backgroundColor: backgroundColor ? `${backgroundColor}33` : undefined, // 33 is ~20% opacity in hex
        borderColor: borderColor,
        borderWidth: borderColor ? '1px' : undefined,
        borderStyle: borderColor ? 'solid' : undefined,
      }}
      {...props}
    >
      {truncatedLabel}
    </Badge>
  );

  if (showTooltip) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {badgeContent}
          </TooltipTrigger>
          <TooltipContent side="top" className="text-xs">
            {label}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return badgeContent;
}
