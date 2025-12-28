/**
 * Ad configuration
 * Set these environment variables or update directly for ad network integration
 */

const adClient = process.env.BUN_PUBLIC_ADSENSE_CLIENT;
const adSlot = process.env.BUN_PUBLIC_ADSENSE_SLOT;
const enabled = process.env.BUN_PUBLIC_ADS_ENABLED;
const guestsOnly = process.env.BUN_PUBLIC_ADS_GUESTS_ONLY;

export const AD_CONFIG = {
  // Google AdSense
  adClient: adClient || "",
  adSlot: adSlot || "",

  // Enable/disable ads
  enabled: enabled === "true",

  // Show ads for guests only (set to false to show for all users)
  guestsOnly: guestsOnly === "true",
};
