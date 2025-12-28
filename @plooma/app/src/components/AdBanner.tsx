import React, { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface AdBannerProps {
  adSlot?: string;
  adClient?: string;
  format?: "auto" | "rectangle" | "horizontal" | "vertical";
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Ad Banner Component
 * Supports Google AdSense and other ad networks
 *
 * To use with Google AdSense:
 * 1. Set adClient to your AdSense publisher ID (e.g., "ca-pub-xxxxxxxxxx")
 * 2. Set adSlot to your ad slot ID (e.g., "1234567890")
 *
 * @example
 * <AdBanner
 *   adClient="ca-pub-xxxxxxxxxx"
 *   adSlot="1234567890"
 *   format="auto"
 * />
 */
export function AdBanner({
  adSlot,
  adClient,
  format = "auto",
  className,
  style,
}: AdBannerProps) {
  const adRef = useRef<HTMLDivElement>(null);
  const adLoadedRef = useRef(false);

  useEffect(() => {
    if (!adRef.current || adLoadedRef.current) return;
    if (!adClient || !adSlot) return;

    // Google AdSense integration
    const loadAd = () => {
      if (window.adsbygoogle && Array.isArray(window.adsbygoogle)) {
        try {
          window.adsbygoogle.push({});
          adLoadedRef.current = true;
        } catch (error) {
          console.error("Error loading ad:", error);
        }
      }
    };

    // Check if AdSense script is already loaded
    if (document.querySelector(`script[src*="adsbygoogle.js"]`)) {
      // Script already loaded, just push the ad
      loadAd();
    } else {
      // Load AdSense script
      const script = document.createElement("script");
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adClient}`;
      script.async = true;
      script.crossOrigin = "anonymous";
      script.onload = loadAd;
      script.onerror = () => {
        console.error("Failed to load AdSense script");
      };
      document.head.appendChild(script);
    }
  }, [adClient, adSlot]);

  // If no ad client/slot provided, show placeholder for development
  if (!adClient || !adSlot) {
    debugger;
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
          <p className="text-xs">
            Configure adClient and adSlot to display ads
          </p>
        </div>
      </div>
    );
  }

  return (
    <div ref={adRef} className={cn("ad-container", className)} style={style}>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={adClient}
        data-ad-slot={adSlot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
}

// Extend Window interface for AdSense
declare global {
  interface Window {
    adsbygoogle?: Array<Record<string, unknown>>;
  }
}
