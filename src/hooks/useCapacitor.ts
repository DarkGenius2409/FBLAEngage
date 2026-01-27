import { useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { Keyboard } from '@capacitor/keyboard';

/**
 * Hook to detect if running on native platform
 */
export function useCapacitor() {
  const [isNative, setIsNative] = useState(false);
  const [platform, setPlatform] = useState<'ios' | 'android' | 'web'>('web');
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const native = Capacitor.isNativePlatform();
    setIsNative(native);
    setPlatform(Capacitor.getPlatform() as 'ios' | 'android' | 'web');

    if (native) {
      // Listen to keyboard events
      const showListener = Keyboard.addListener('keyboardWillShow', (info) => {
        setKeyboardVisible(true);
        setKeyboardHeight(info.keyboardHeight);
      });

      const hideListener = Keyboard.addListener('keyboardWillHide', () => {
        setKeyboardVisible(false);
        setKeyboardHeight(0);
      });

      return () => {
        showListener.remove();
        hideListener.remove();
      };
    }
  }, []);

  return {
    isNative,
    platform,
    isIOS: platform === 'ios',
    isAndroid: platform === 'android',
    isWeb: platform === 'web',
    isMobile: platform === 'ios' || platform === 'android',
    keyboardVisible,
    keyboardHeight,
  };
}
