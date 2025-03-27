
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
  maxLength = 15,
  showTooltip = true,
  ...props
}: ColoredBadgeProps) {
  const truncatedLabel = label.length > maxLength 
    ? `${label.substring(0, maxLength)}...` 
    : label;
  
  const shouldShowTooltip = showTooltip && label.length > maxLength;
  
  const badgeContent = (
    <Badge
      className={cn(
        "text-xs font-medium px-2 py-0.5",
        backgroundColor && `bg-opacity-20 bg-[${backgroundColor}]`,
        color && `text-[${color}]`,
        borderColor && `border border-[${borderColor}]`,
        className
      )}
      {...props}
    >
      {truncatedLabel}
    </Badge>
  );

  if (shouldShowTooltip) {
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
