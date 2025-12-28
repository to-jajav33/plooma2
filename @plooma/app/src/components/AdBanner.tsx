import React, { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface AdBannerProps {
  zoneId?: string;
  format?: "banner" | "native" | "popunder";
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Ad Banner Component for Adsterra
 *
 * To use with Adsterra:
 * 1. Get your zone ID from your Adsterra account
 * 2. Set zoneId prop with your zone ID
 *
 * @example
 * <AdBanner
 *   zoneId="12345678"
 *   format="banner"
 * />
 */
export function AdBanner({
  zoneId,
  format = "banner",
  className,
  style,
}: AdBannerProps) {
  const adRef = useRef<HTMLDivElement>(null);
  const scriptLoadedRef = useRef(false);

  useEffect(() => {
    if (!adRef.current || !zoneId) return;

    // Load Adsterra script only once
    if (!scriptLoadedRef.current) {
      const existingScript = document.querySelector(
        'script[src*="delivery.adsterra.net"]'
      );

      if (!existingScript) {
        const script = document.createElement("script");
        script.src = "https://delivery.adsterra.net/invoke.js";
        script.async = true;
        script.onerror = () => {
          console.error("Failed to load Adsterra script");
        };
        document.head.appendChild(script);
      }

      scriptLoadedRef.current = true;
    }

    // Adsterra automatically detects divs with data-id attribute
    // The script will fill the ad when it loads
  }, [zoneId]);

  // If no zone ID provided, show placeholder for development
  if (!zoneId) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-muted border border-dashed rounded-lg p-8 text-center text-muted-foreground",
          className
        )}
        style={style}
      >
        <div>
          <p className="text-sm font-medium mb-1">Ad Space</p>
          <p className="text-xs">Configure zoneId to display Adsterra ads</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={adRef}
      className={cn("ad-container", className)}
      style={style}
      id={`adsterra-${zoneId}`}
      data-id={zoneId}
    />
  );
}
