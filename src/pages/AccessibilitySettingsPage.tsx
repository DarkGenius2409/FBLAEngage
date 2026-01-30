import * as React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useUserPreferences } from '@/hooks';
import { useNavigate } from 'react-router-dom';
import { Spinner } from '@/components/ui/spinner';
import type { UserPreferences, UserPreferencesUpdate, ThemeMode } from '@/lib/models';

export type FontSize = 'small' | 'medium' | 'large' | 'extra-large';
export type ColorBlindMode = 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';

export interface AccessibilitySettings {
  theme: ThemeMode;
  fontSize: FontSize;
  highContrast: boolean;
  reducedMotion: boolean;
  screenReader: boolean;
  keyboardNavigation: boolean;
  colorBlindMode: ColorBlindMode;
}

const defaultSettings: AccessibilitySettings = {
  theme: 'light',
  fontSize: 'medium',
  highContrast: false,
  reducedMotion: false,
  screenReader: false,
  keyboardNavigation: false,
  colorBlindMode: 'none',
};

const themeLabels: Record<ThemeMode, string> = {
  light: 'Light',
  dark: 'Dark',
  'high-contrast': 'High contrast',
};

const fontSizeLabels: Record<FontSize, string> = {
  small: 'Small',
  medium: 'Medium',
  large: 'Large',
  'extra-large': 'Extra Large',
};

const colorBlindModeLabels: Record<ColorBlindMode, string> = {
  none: 'None',
  protanopia: 'Protanopia (Red-Blind)',
  deuteranopia: 'Deuteranopia (Green-Blind)',
  tritanopia: 'Tritanopia (Blue-Blind)',
};

function preferencesToSettings(prefs: UserPreferences | null): AccessibilitySettings {
  if (!prefs) return defaultSettings;
  return {
    theme: prefs.theme ?? 'light',
    fontSize: prefs.font_size,
    highContrast: prefs.high_contrast,
    reducedMotion: prefs.reduced_motion,
    screenReader: prefs.screen_reader_optimized,
    keyboardNavigation: prefs.keyboard_navigation_enhanced,
    colorBlindMode: prefs.color_blind_mode,
  };
}

export default function AccessibilitySettingsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { preferences, loading, updatePreferences } = useUserPreferences(user?.id || null);
  const currentSettings = preferencesToSettings(preferences);

  const handleSettingChange = React.useCallback<
    <K extends keyof AccessibilitySettings>(key: K, value: AccessibilitySettings[K]) => void
  >(
    async (key, value) => {
      const update: UserPreferencesUpdate = {};
      if (key === 'theme') update.theme = value as ThemeMode;
      else if (key === 'fontSize') update.font_size = value as FontSize;
      else if (key === 'highContrast') update.high_contrast = value as boolean;
      else if (key === 'reducedMotion') update.reduced_motion = value as boolean;
      else if (key === 'screenReader') update.screen_reader_optimized = value as boolean;
      else if (key === 'keyboardNavigation') update.keyboard_navigation_enhanced = value as boolean;
      else if (key === 'colorBlindMode') update.color_blind_mode = value as ColorBlindMode;

      const fullUpdate: UserPreferencesUpdate = {
        theme: currentSettings.theme,
        font_size: currentSettings.fontSize,
        high_contrast: currentSettings.highContrast,
        reduced_motion: currentSettings.reducedMotion,
        screen_reader_optimized: currentSettings.screenReader,
        keyboard_navigation_enhanced: currentSettings.keyboardNavigation,
        color_blind_mode: currentSettings.colorBlindMode,
        ...update,
      };
      const { error } = await updatePreferences(fullUpdate);
      if (error) {
        toast.error('Failed to update accessibility settings', {
          description: error.message,
        });
      } else {
        toast.success('Accessibility settings updated');
      }
    },
    [currentSettings, updatePreferences]
  );

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-4xl pb-20 flex flex-col items-center justify-center min-h-[400px] gap-3">
        <Spinner className="size-8" />
        <p className="text-sm text-muted-foreground">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl pb-20">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/profile')}
          className="mb-4 -ml-2"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Profile
        </Button>
        <h1 className="text-2xl font-semibold text-foreground mb-2">Accessibility Settings</h1>
        <p className="text-sm text-muted-foreground">
          Customize your app experience to match your accessibility needs.
        </p>
      </div>

      <Card className="p-6 sm:p-8">
        <div className="space-y-8">
          {/* Theme / Color mode */}
          <div className="space-y-3">
            <Label htmlFor="theme" className="text-base sm:text-sm text-foreground font-medium">
              Color mode
            </Label>
            <Select
              value={currentSettings.theme}
              onValueChange={(value: ThemeMode) => handleSettingChange('theme', value)}
            >
              <SelectTrigger
                id="theme"
                className="w-full h-12 sm:h-10 text-base sm:text-sm border-input bg-background"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(themeLabels) as ThemeMode[]).map((mode) => (
                  <SelectItem key={mode} value={mode}>
                    {themeLabels[mode]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground leading-relaxed mt-2">
              Light, dark, or high contrast for better visibility
            </p>
          </div>

          {/* Font Size */}
          <div className="space-y-3">
            <Label htmlFor="font-size" className="text-base sm:text-sm text-foreground font-medium">
              Font Size
            </Label>
            <Select
              value={currentSettings.fontSize}
              onValueChange={(value: FontSize) => handleSettingChange('fontSize', value)}
            >
              <SelectTrigger
                id="font-size"
                className="w-full h-12 sm:h-10 text-base sm:text-sm border-input bg-background"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(fontSizeLabels) as FontSize[]).map((size) => (
                  <SelectItem key={size} value={size}>
                    {fontSizeLabels[size]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Reduced Motion */}
          <div className="flex flex-row items-center justify-between gap-4 py-4">
            <div className="flex-1 min-w-0 space-y-1">
              <Label htmlFor="reduced-motion" className="text-base sm:text-sm font-medium">
                Reduced Motion
              </Label>
              <p className="text-sm text-muted-foreground">
                Minimize animations and transitions
              </p>
            </div>
            <Switch
              id="reduced-motion"
              checked={currentSettings.reducedMotion}
              onCheckedChange={(checked) => handleSettingChange('reducedMotion', checked)}
              className="flex-shrink-0"
            />
          </div>

          {/* Screen Reader */}
          <div className="flex flex-row items-center justify-between gap-4 py-4">
            <div className="flex-1 min-w-0 space-y-1">
              <Label htmlFor="screen-reader" className="text-base sm:text-sm font-medium">
                Screen Reader
              </Label>
              <p className="text-sm text-muted-foreground">
                Optimize for screen reader usage
              </p>
            </div>
            <Switch
              id="screen-reader"
              checked={currentSettings.screenReader}
              onCheckedChange={(checked) => handleSettingChange('screenReader', checked)}
              className="flex-shrink-0"
            />
          </div>

          {/* Keyboard Navigation */}
          <div className="flex flex-row items-center justify-between gap-4 py-4">
            <div className="flex-1 min-w-0 space-y-1">
              <Label htmlFor="keyboard-nav" className="text-base sm:text-sm font-medium">
                Keyboard Navigation
              </Label>
              <p className="text-sm text-muted-foreground">
                Enhanced keyboard navigation support
              </p>
            </div>
            <Switch
              id="keyboard-nav"
              checked={currentSettings.keyboardNavigation}
              onCheckedChange={(checked) => handleSettingChange('keyboardNavigation', checked)}
              className="flex-shrink-0"
            />
          </div>

          {/* Color Blind Mode */}
          <div className="space-y-3">
            <Label htmlFor="color-blind-mode" className="text-base sm:text-sm text-foreground font-medium">
              Color Blind Mode
            </Label>
            <Select
              value={currentSettings.colorBlindMode}
              onValueChange={(value: ColorBlindMode) =>
                handleSettingChange('colorBlindMode', value)
              }
            >
              <SelectTrigger
                id="color-blind-mode"
                className="w-full h-12 sm:h-10 text-base sm:text-sm border-input bg-background"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(colorBlindModeLabels) as ColorBlindMode[]).map((mode) => (
                  <SelectItem key={mode} value={mode}>
                    {colorBlindModeLabels[mode]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground leading-relaxed mt-2">
              Adjust colors for different types of color blindness
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
