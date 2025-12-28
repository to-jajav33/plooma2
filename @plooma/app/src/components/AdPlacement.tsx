import React from "react";
import { AdBanner } from "./AdBanner";
import { cn } from "@/lib/utils";

interface AdPlacementProps {
  position: "sidebar" | "between-nodes" | "header" | "footer";
  adClient?: string;
  adSlot?: string;
  className?: string;
}

/**
 * Pre-configured ad placements for common locations
 */
export function AdPlacement({
  position,
  adClient,
  adSlot,
  className,
}: AdPlacementProps) {
  const config = {
    sidebar: {
      format: "vertical" as const,
      style: { minWidth: "160px", minHeight: "600px" },
    },
    "between-nodes": {
      format: "horizontal" as const,
      style: { width: "100%", minHeight: "100px" },
    },
    header: {
      format: "horizontal" as const,
      style: { width: "100%", minHeight: "90px" },
    },
    footer: {
      format: "horizontal" as const,
      style: { width: "100%", minHeight: "90px" },
    },
  };

  const placementConfig = config[position];

  return (
    <div className={cn("ad-placement", className)}>
      <AdBanner
        adClient={adClient}
        adSlot={adSlot}
        format={placementConfig.format}
        style={placementConfig.style}
        className={cn(
          position === "sidebar" && "sticky top-4",
          position === "between-nodes" && "my-6"
        )}
      />
    </div>
  );
}

