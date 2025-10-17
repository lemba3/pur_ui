/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

// const tintColor = '#2164ff';
const tintColor = '#0F4FB0';

export const Colors = {
  light: {
    text: '#FFFFFF',
    background: '#0D1B3A',
    cardBackground: '#1A2B4A',
    cardText: '#111111',
    inputBackground: '#1A2B4A',
    tint: tintColor,
    icon: '#B0B0B0',
    tabIconDefault: '#B0B0B0',
    tabIconSelected: tintColor,
    // Alerts
    error: '#E57373',    // softened red
    warning: '#FFB74D',  // muted orange
    success: '#81C784',  // muted green
    info: '#64B5F6',     // soft blue
  },
  dark: {
    text: '#F8F8F8',
    background: '#2164ff',
    cardBackground: '#F8F8F8',
    cardText: '#111111',
    inputBackground: '#F0F0F0',
    tint: tintColor,
    icon: '#B0B0B0',
    tabIconDefault: '#B0B0B0',
    tabIconSelected: tintColor,
    // Alerts
    error: '#E57373',    // softened red
    warning: '#FFB74D',  // muted orange
    success: '#81C784',  // muted green
    info: '#64B5F6',     // soft blue
  },
};


export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
