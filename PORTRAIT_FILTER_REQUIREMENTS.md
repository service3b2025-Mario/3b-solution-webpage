# Portrait Mode Filter Overlay Requirements

## A) Overlay-Based Filter Interface
- [ ] Detect portrait orientation (height > width)
- [ ] Create dedicated full-screen overlay modal for portrait mode
- [ ] Use fixed positioning above page content
- [ ] Include all existing filter fields in overlay
- [ ] Separate implementation from landscape mode

## B) Background Stability
- [ ] Lock background page when overlay is open
- [ ] Prevent all scrolling behind overlay
- [ ] Prevent movement or jumping of background content
- [ ] Preserve current scroll position when opening overlay
- [ ] Restore scroll position when closing overlay

## C) Interaction Consistency
- [ ] Ensure dropdown menus open and remain stable
- [ ] Input fields editable without viewport repositioning
- [ ] Apply button functions reliably
- [ ] Reset button functions reliably
- [ ] Close button functions reliably
- [ ] Backdrop click closes overlay

## D) UX Parity
- [ ] Portrait mode feels identical to landscape mode in stability
- [ ] Portrait mode feels identical to landscape mode in usability
- [ ] No scrolling issues in portrait mode
- [ ] No jumping or repositioning in portrait mode
- [ ] All filter interactions work smoothly

## Implementation Strategy
1. Add orientation detection state (isPortrait)
2. Implement body scroll lock when overlay opens
3. Save scroll position before opening overlay
4. Apply position: fixed to body with negative top offset
5. Restore scroll position and remove fixed positioning when closing
6. Test on actual mobile devices (iOS Safari, Android Chrome)
