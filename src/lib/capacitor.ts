import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { Keyboard } from '@capacitor/keyboard';

/**
 * Initialize Capacitor plugins for iOS/Android
 */
export async function initCapacitor() {
  if (Capacitor.isNativePlatform()) {
    try {
      // Configure Status Bar
      await StatusBar.setStyle({ style: Style.Dark });
      await StatusBar.setBackgroundColor({ color: '#032A87' });

      // Hide splash screen after app is ready
      await SplashScreen.hide();

      const platform = Capacitor.getPlatform();

      // Handle keyboard events (works for both iOS and Android)
      Keyboard.addListener('keyboardWillShow', (info) => {
        // Adjust viewport when keyboard appears
        document.body.style.paddingBottom = `${info.keyboardHeight}px`;
        // Prevent body scroll when keyboard is open on Android
        if (platform === 'android') {
          document.body.style.overflow = 'hidden';
        }
      });

      Keyboard.addListener('keyboardWillHide', () => {
        // Reset viewport when keyboard hides
        document.body.style.paddingBottom = '';
        if (platform === 'android') {
          document.body.style.overflow = '';
        }
      });

      // Platform-specific configurations
      if (platform === 'ios') {
        // Prevent keyboard from resizing viewport on iOS
        const viewport = document.querySelector('meta[name="viewport"]');
        if (viewport) {
          viewport.setAttribute(
            'content',
            'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover'
          );
        }
      } else if (platform === 'android') {
        // Android-specific optimizations
        // Set status bar style for Android
        await StatusBar.setStyle({ style: Style.Dark });
        
        // Handle Android back button (if needed in the future)
        // You can add App.addListener('backButton', ...) here
        
        // Prevent Android from zooming on input focus
        const viewport = document.querySelector('meta[name="viewport"]');
        if (viewport) {
          viewport.setAttribute(
            'content',
            'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no'
          );
        }
      }
    } catch (error) {
      console.warn('Capacitor initialization error:', error);
    }
  }
}

/**
 * Check if running on native platform
 */
export function isNativePlatform(): boolean {
  return Capacitor.isNativePlatform();
}

/**
 * Get the current platform
 */
export function getPlatform(): 'ios' | 'android' | 'web' {
  return Capacitor.getPlatform() as 'ios' | 'android' | 'web';
}

/**
 * Open a URL (e.g. for PDF download or external link).
 * On native: uses Capacitor Browser (in-app browser with share/save).
 * On web: uses window.open.
 */
export async function openUrl(url: string): Promise<void> {
  if (!url || !url.startsWith('http')) {
    console.warn('openUrl: invalid or missing protocol');
    return;
  }
  if (Capacitor.isNativePlatform()) {
    const { Browser } = await import('@capacitor/browser');
    await Browser.open({ url });
  } else {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}
