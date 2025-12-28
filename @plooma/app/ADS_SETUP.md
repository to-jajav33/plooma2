# Ad Monetization Setup (Adsterra)

The app now includes Adsterra ad integration for monetization. Ads are placed strategically throughout the story editor.

## Why Adsterra?

Adsterra is a great choice for apps that may not be text-heavy initially, as they have more flexible approval requirements and work well with various content types.

## Ad Placements

1. **Sidebar Ad** (Desktop only)

   - Vertical ad on the right side of the editor
   - Sticky positioning for better visibility
   - Hidden on mobile/tablet

2. **Between Nodes Ad**
   - Horizontal ad shown every 3rd story node
   - Appears between content for natural placement
   - Non-intrusive design

## Configuration

### Environment Variables

Set these in your `.env` file or environment:

```bash
# Enable/disable ads
BUN_PUBLIC_ADS_ENABLED=true

# Adsterra Zone ID (main zone for between-nodes ads)
BUN_PUBLIC_ADSTERRA_ZONE_ID=12345678

# Adsterra Sidebar Zone ID (optional, uses main zone if not set)
BUN_PUBLIC_ADSTERRA_SIDEBAR_ZONE_ID=87654321

# Show ads only for guests (set to false to show for all users)
BUN_PUBLIC_ADS_GUESTS_ONLY=true
```

### Direct Configuration

You can also edit `src/config/ads.ts` directly:

```typescript
export const AD_CONFIG = {
  zoneId: "12345678", // Main zone ID
  sidebarZoneId: "87654321", // Sidebar zone ID (optional)
  enabled: true,
  guestsOnly: true, // Only show ads for guest users
};
```

## Adsterra Setup

1. **Sign up for Adsterra**

   - Visit https://adsterra.com/
   - Create an account and get approved (usually faster than AdSense)

2. **Create Ad Zones**

   - Log into your Adsterra dashboard
   - Go to "Zones" section
   - Create zones for different placements:
     - **Banner Zone**: For between-nodes ads (recommended: 728x90 or responsive)
     - **Sidebar Zone**: For sidebar ads (recommended: 160x600 or 300x250)

3. **Get Zone IDs**

   - Each zone has a unique Zone ID
   - Copy the Zone ID for each placement
   - You can use the same zone ID for multiple placements or create separate zones

4. **Configure the App**
   - Set `BUN_PUBLIC_ADSTERRA_ZONE_ID` to your main zone ID
   - Set `BUN_PUBLIC_ADSTERRA_SIDEBAR_ZONE_ID` to your sidebar zone ID (optional)
   - Set `BUN_PUBLIC_ADS_ENABLED=true`

## Ad Display Logic

- **Guests Only**: By default, ads only show for guest users (not authenticated)
- **All Users**: Set `BUN_PUBLIC_ADS_GUESTS_ONLY=false` to show ads for everyone
- **Disabled**: Set `BUN_PUBLIC_ADS_ENABLED=false` to disable all ads

## Testing

Without Adsterra zone IDs, you'll see placeholder "Ad Space" boxes indicating where ads will appear. This helps with layout testing.

## Best Practices

1. **Don't click your own ads** - This violates Adsterra policies
2. **Test thoroughly** - Ensure ads don't break the layout
3. **Monitor performance** - Check Adsterra dashboard for revenue and stats
4. **Respect user experience** - Ads are placed to be non-intrusive
5. **Mobile optimization** - Sidebar ads are hidden on mobile for better UX
6. **Zone optimization** - Create separate zones for different placements to optimize performance

## Customization

You can customize ad placements by editing:

- `src/components/StoryEditor.tsx` - Main ad placements
- `src/components/AdPlacement.tsx` - Ad placement configurations
- `src/components/AdBanner.tsx` - Ad banner component

## Revenue Optimization

- **Placement**: Ads are placed where they're visible but not intrusive
- **Frequency**: Between-node ads appear every 3rd node (adjustable)
- **Responsive**: Ads automatically adapt to screen size
- **Performance**: Ads load asynchronously to not block page rendering
- **Zone Types**: Use banner zones for best performance and user experience

## Adsterra Features

- **Fast Approval**: Usually approved faster than AdSense
- **Flexible Content**: Works well with various content types
- **Multiple Formats**: Supports banners, native ads, popunders, and more
- **Real-time Stats**: Track performance in real-time dashboard
- **High CPM**: Competitive rates for quality traffic
