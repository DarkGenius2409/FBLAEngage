# Capacitor, iOS & Android Setup Guide

This app is fully configured for Capacitor, iOS, and Android native deployment.

## Features Implemented

### 1. **Safe Areas (iOS & Android)**
- All full-screen views respect iOS safe areas (notches, home indicators)
- Header and bottom navigation include safe area padding
- Full-screen modals and detail views use `fullscreen-safe` class

### 2. **Touch Optimizations**
- All buttons use `touch-manipulation` for better touch responsiveness
- Tap highlight removed for cleaner interactions (iOS & Android)
- Active states with scale animations for visual feedback
- Android ripple effect prevention

### 3. **Viewport & Scrolling**
- Fixed viewport height issues with `-webkit-fill-available` (iOS) and `100dvh` (Android)
- Momentum scrolling enabled for smooth scrolling (iOS & Android)
- Prevented bounce/overscroll behavior on both platforms
- Fixed input zoom prevention (16px minimum font size)
- Dynamic viewport height support for Android

### 4. **Status Bar & Navigation Bar**
- Status bar configured to match app theme (iOS & Android)
- Android navigation bar color matching app theme
- Splash screen auto-hides after app loads
- Proper status bar styling for both platforms

### 5. **Keyboard Handling**
- Keyboard events handled to adjust viewport (iOS & Android)
- Prevents viewport resizing on iOS
- Prevents body scroll when keyboard is open on Android
- Proper padding when keyboard appears
- Keyboard resize mode configured for Android

### 6. **Meta Tags**
- iOS web app capable meta tags
- Android PWA meta tags
- Proper viewport configuration for both platforms
- Theme color set for status bars (iOS & Android)
- Prevented text selection on long press (except inputs)
- Android Chrome color scheme support

## Installation

1. **Install Capacitor plugins:**
```bash
npm install @capacitor/status-bar @capacitor/splash-screen @capacitor/keyboard
```

2. **Sync Capacitor:**
```bash
npx cap sync
```

3. **Open in Xcode (iOS):**
```bash
npx cap open ios
```

## Build Commands

```bash
# Build for production
npm run build

# Sync to native projects
npx cap sync

# Open iOS project
npx cap open ios

# Open Android project
npx cap open android
```

## CSS Classes Available

### Cross-Platform
- `.safe-area` - Full safe area padding (iOS & Android)
- `.safe-area-top` - Top safe area padding
- `.safe-area-bottom` - Bottom safe area padding
- `.fullscreen-safe` - Full screen with safe areas
- `.momentum-scroll` - Momentum scrolling (iOS & Android)
- `.touch-manipulation` - Optimized touch handling
- `.mobile-viewport-fix` - Fixes viewport height issues (iOS & Android)
- `.no-bounce` - Prevents overscroll bounce
- `.hardware-accelerated` - Hardware acceleration for animations

### iOS Specific
- `.ios-viewport-fix` - Fixes iOS viewport height issues
- `.vh-ios` - iOS viewport height fix
- `.min-vh-ios` - iOS minimum viewport height

### Android Specific
- `.android-viewport-fix` - Fixes Android viewport height issues
- `.android-nav-safe` - Android navigation bar safe area
- `.android-status-safe` - Android status bar safe area
- `.android-scroll` - Android scroll optimizations
- `.fixed-android` - Android fixed positioning fix
- `.no-ripple` - Prevents Android ripple effect

## Components Updated

All components have been updated with:
- Safe area support for full-screen views
- Touch-optimized interactions
- Momentum scrolling for scrollable areas
- Proper iOS viewport handling

## Testing

### iOS
1. Build the app: `npm run build`
2. Sync: `npx cap sync`
3. Open in Xcode: `npx cap open ios`
4. Run on simulator or device

### Android
1. Build the app: `npm run build`
2. Sync: `npx cap sync`
3. Open in Android Studio: `npx cap open android`
4. Run on emulator or device

## Notes

### Cross-Platform
- Input fields use 16px font size to prevent zoom on both platforms
- All buttons have proper touch targets (minimum 44x44px)
- Safe areas are automatically handled via CSS environment variables
- Status bar color matches app primary color (#0a2e4e)
- Hardware acceleration enabled for better performance

### iOS Specific
- Uses `-webkit-fill-available` for viewport height
- Status bar style: dark with primary color background
- Keyboard resize mode: body

### Android Specific
- Uses `100dvh` (dynamic viewport height) for proper height calculation
- Navigation bar color matches app theme
- Keyboard resize mode: body with full screen support
- Hardware acceleration enabled in manifest
- Cleartext traffic allowed for development