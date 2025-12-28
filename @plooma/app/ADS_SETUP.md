# Ad Monetization Setup

The app now includes ad integration for monetization. Ads are placed strategically throughout the story editor.

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

# Google AdSense Publisher ID
BUN_PUBLIC_ADSENSE_CLIENT=ca-pub-xxxxxxxxxx

# Google AdSense Ad Slot ID
BUN_PUBLIC_ADSENSE_SLOT=1234567890

# Show ads only for guests (set to false to show for all users)
BUN_PUBLIC_ADS_GUESTS_ONLY=true
```

### Direct Configuration

You can also edit `src/config/ads.ts` directly:

```typescript
export const AD_CONFIG = {
  adClient: "ca-pub-xxxxxxxxxx",
  adSlot: "1234567890",
  enabled: true,
  guestsOnly: true, // Only show ads for guest users
};
```

## Google AdSense Setup

1. **Sign up for Google AdSense**
   - Visit https://www.google.com/adsense/
   - Create an account and get approved

2. **Get your Publisher ID**
   - Format: `ca-pub-xxxxxxxxxx`
   - Found in your AdSense dashboard

3. **Create Ad Units**
   - Create ad units for different sizes:
     - Sidebar: 160x600 (vertical)
     - Between nodes: 728x90 or responsive (horizontal)

4. **Get Ad Slot IDs**
   - Each ad unit has a unique slot ID
   - Copy the slot ID for each placement

5. **Configure the App**
   - Set `BUN_PUBLIC_ADSENSE_CLIENT` to your publisher ID
   - Set `BUN_PUBLIC_ADSENSE_SLOT` to your ad slot ID
   - Set `BUN_PUBLIC_ADS_ENABLED=true`

## Ad Display Logic

- **Guests Only**: By default, ads only show for guest users (not authenticated)
- **All Users**: Set `BUN_PUBLIC_ADS_GUESTS_ONLY=false` to show ads for everyone
- **Disabled**: Set `BUN_PUBLIC_ADS_ENABLED=false` to disable all ads

## Testing

Without AdSense credentials, you'll see placeholder "Ad Space" boxes indicating where ads will appear. This helps with layout testing.

## Best Practices

1. **Don't click your own ads** - This violates AdSense policies
2. **Test thoroughly** - Ensure ads don't break the layout
3. **Monitor performance** - Check AdSense dashboard for revenue
4. **Respect user experience** - Ads are placed to be non-intrusive
5. **Mobile optimization** - Sidebar ads are hidden on mobile for better UX

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

