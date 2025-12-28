/**
 * Ad configuration for Adsterra
 * Set these environment variables or update directly for ad network integration
 */

const zoneId = process.env.BUN_PUBLIC_ADSTERRA_ZONE_ID;
const sidebarZoneId = process.env.BUN_PUBLIC_ADSTERRA_SIDEBAR_ZONE_ID;
const enabled = process.env.BUN_PUBLIC_ADS_ENABLED;
const guestsOnly = process.env.BUN_PUBLIC_ADS_GUESTS_ONLY;

export const AD_CONFIG = {
  // Adsterra Zone IDs
  // Main zone ID for between-nodes ads
  zoneId: zoneId || "",
  // Sidebar zone ID (can be same as zoneId or different)
  sidebarZoneId: sidebarZoneId || zoneId || "",

  // Enable/disable ads
  enabled: enabled === "true",

  // Show ads for guests only (set to false to show for all users)
  guestsOnly: guestsOnly === "true",
};
