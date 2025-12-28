import React from "react";
import { AdBanner } from "./AdBanner";
import { cn } from "@/lib/utils";

interface AdPlacementProps {
  position: "sidebar" | "between-nodes" | "header" | "footer";
  zoneId?: string;
  className?: string;
}

/**
 * Pre-configured ad placements for common locations
 */
export function AdPlacement({ position, zoneId, className }: AdPlacementProps) {
  const config = {
    sidebar: {
      style: { minWidth: "160px", minHeight: "600px" },
    },
    "between-nodes": {
      style: { width: "100%", minHeight: "100px" },
    },
    header: {
      style: { width: "100%", minHeight: "90px" },
    },
    footer: {
      style: { width: "100%", minHeight: "90px" },
    },
  };

  const placementConfig = config[position];

  return (
    <div className={cn("ad-placement", className)}>
      <AdBanner
        zoneId={zoneId}
        format="banner"
        style={placementConfig.style}
        className={cn(
          position === "sidebar" && "sticky top-4",
          position === "between-nodes" && "my-6"
        )}
      />
    </div>
  );
}
