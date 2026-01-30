'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Field,
  FieldContent,
  FieldLabel,
  FieldDescription,
} from '@/components/ui/field';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { useUserPreferences } from '@/hooks';
import type { UserPreferences, UserPreferencesUpdate } from '@/lib/models';

export type FontSize = 'small' | 'medium' | 'large' | 'extra-large';
export type ColorBlindMode = 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';

export interface AccessibilitySettings {
  fontSize: FontSize;
  highContrast: boolean;
  reducedMotion: boolean;
  screenReader: boolean;
  keyboardNavigation: boolean;
  colorBlindMode: ColorBlindMode;
}

interface AccessibilitySettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  studentId: string;
}

const defaultSettings: AccessibilitySettings = {
  fontSize: 'medium',
  highContrast: false,
  reducedMotion: false,
  screenReader: false,
  keyboardNavigation: false,
  colorBlindMode: 'none',
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
    fontSize: prefs.font_size,
    highContrast: prefs.high_contrast,
    reducedMotion: prefs.reduced_motion,
    screenReader: prefs.screen_reader_optimized,
    keyboardNavigation: prefs.keyboard_navigation_enhanced,
    colorBlindMode: prefs.color_blind_mode,
  };
}

export function AccessibilitySettingsModal({
  open,
  onOpenChange,
  studentId,
}: AccessibilitySettingsModalProps) {
  const { preferences, loading, updatePreferences } = useUserPreferences(open ? studentId : null);
  const currentSettings = preferencesToSettings(preferences);

  const handleSettingChange = React.useCallback<
    <K extends keyof AccessibilitySettings>(key: K, value: AccessibilitySettings[K]) => void
  >(
    async (key, value) => {
      const update: UserPreferencesUpdate = {};
      if (key === 'fontSize') update.font_size = value as FontSize;
      else if (key === 'highContrast') update.high_contrast = value as boolean;
      else if (key === 'reducedMotion') update.reduced_motion = value as boolean;
      else if (key === 'screenReader') update.screen_reader_optimized = value as boolean;
      else if (key === 'keyboardNavigation') update.keyboard_navigation_enhanced = value as boolean;
      else if (key === 'colorBlindMode') update.color_blind_mode = value as ColorBlindMode;

      const fullUpdate: UserPreferencesUpdate = {
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
      }
    },
    [currentSettings, updatePreferences]
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="w-full max-w-full sm:max-w-2xl h-[90vh] sm:h-auto sm:max-h-[90vh] flex flex-col rounded-t-2xl sm:rounded-2xl p-0 gap-0 fixed bottom-0 sm:bottom-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 translate-y-0 overflow-hidden border-border m-0 sm:m-4"
        aria-describedby={undefined}
      >
        {loading ? (
          <div className="flex items-center justify-center py-12 flex-1">
            <p className="text-sm text-muted-foreground">Loading settings...</p>
          </div>
        ) : (
          <>
            {/* Drag Handle (mobile) */}
            <div className="flex justify-center pt-3 sm:hidden shrink-0">
              <div className="h-1.5 w-12 rounded-full bg-muted" />
            </div>

            <DialogHeader className="px-5 pt-4 pb-3 sm:p-6 sm:pb-4 shrink-0">
              <DialogTitle className="text-lg text-foreground">Accessibility Settings</DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                Customize your app experience to match your accessibility needs.
              </DialogDescription>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-4 sm:py-6 space-y-6">
              {/* Font Size */}
              <div className="space-y-2.5">
                <Label htmlFor="font-size" className="text-base sm:text-sm text-foreground">
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

              {/* High Contrast */}
              <Field orientation="horizontal" className="items-center gap-4 py-2">
                <FieldContent className="flex-1 gap-1">
                  <FieldLabel className="text-base sm:text-sm font-medium" asChild>
                    <Label htmlFor="high-contrast">High Contrast</Label>
                  </FieldLabel>
                  <FieldDescription>
                    Increase contrast for better visibility
                  </FieldDescription>
                </FieldContent>
                <Switch
                  id="high-contrast"
                  checked={currentSettings.highContrast}
                  onCheckedChange={(checked) => handleSettingChange('highContrast', checked)}
                  className="scale-110 sm:scale-100 shrink-0"
                />
              </Field>

              {/* Reduced Motion */}
              <Field orientation="horizontal" className="items-center gap-4 py-2">
                <FieldContent className="flex-1 gap-1">
                  <FieldLabel className="text-base sm:text-sm font-medium" asChild>
                    <Label htmlFor="reduced-motion">Reduced Motion</Label>
                  </FieldLabel>
                  <FieldDescription>
                    Minimize animations and transitions
                  </FieldDescription>
                </FieldContent>
                <Switch
                  id="reduced-motion"
                  checked={currentSettings.reducedMotion}
                  onCheckedChange={(checked) => handleSettingChange('reducedMotion', checked)}
                  className="scale-110 sm:scale-100 shrink-0"
                />
              </Field>

              {/* Screen Reader */}
              <Field orientation="horizontal" className="items-center gap-4 py-2">
                <FieldContent className="flex-1 gap-1">
                  <FieldLabel className="text-base sm:text-sm font-medium" asChild>
                    <Label htmlFor="screen-reader">Screen Reader</Label>
                  </FieldLabel>
                  <FieldDescription>
                    Optimize for screen reader usage
                  </FieldDescription>
                </FieldContent>
                <Switch
                  id="screen-reader"
                  checked={currentSettings.screenReader}
                  onCheckedChange={(checked) => handleSettingChange('screenReader', checked)}
                  className="scale-110 sm:scale-100 shrink-0"
                />
              </Field>

              {/* Keyboard Navigation */}
              <Field orientation="horizontal" className="items-center gap-4 py-2">
                <FieldContent className="flex-1 gap-1">
                  <FieldLabel className="text-base sm:text-sm font-medium" asChild>
                    <Label htmlFor="keyboard-nav">Keyboard Navigation</Label>
                  </FieldLabel>
                  <FieldDescription>
                    Enhanced keyboard navigation support
                  </FieldDescription>
                </FieldContent>
                <Switch
                  id="keyboard-nav"
                  checked={currentSettings.keyboardNavigation}
                  onCheckedChange={(checked) => handleSettingChange('keyboardNavigation', checked)}
                  className="scale-110 sm:scale-100 shrink-0"
                />
              </Field>

              {/* Color Blind Mode */}
              <div className="space-y-2.5">
                <Label htmlFor="color-blind-mode" className="text-base sm:text-sm text-foreground">
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
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Adjust colors for different types of color blindness
                </p>
              </div>
            </div>

            <DialogFooter className="p-5 sm:p-6 pt-4 border-t border-border shrink-0">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="w-full sm:w-auto h-12 sm:h-10 text-base sm:text-sm border-border bg-background hover:bg-muted"
              >
                Close
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
