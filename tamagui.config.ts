// tamagui.config.ts
import { config as configBase } from '@tamagui/config/v3'
import { createTamagui, createTokens } from 'tamagui'

// Define color tokens for all themes
const colorTokens = createTokens({
  light: {
    // Background colors
    background: {
      default: '#FFFFFF',
      secondary: '#F5F5F5',
      tertiary: '#EFEFEF',
      inverse: '#000000',
    },
    // Text colors
    text: {
      default: '#000000',
      secondary: '#555555',
      tertiary: '#888888',
      inverse: '#FFFFFF',
    },
    // Border colors
    border: {
      default: '#E0E0E0',
      strong: '#AAAAAA',
      inverse: '#FFFFFF',
    },
    // Interactive colors
    interactive: {
      active: '#2b7fff',
      hover: '#3395FF',
    }
  },
  dark: {
    // Background colors
    background: {
      default: '#000000',
      secondary: '#1E1E1E',
      tertiary: '#2A2A2A',
      inverse: '#ffffff',
    },
    // Text colors
    text: {
      default: '#FFFFFF',
      secondary: '#BBBBBB',
      tertiary: '#888888',
      inverse: '#000000',
    },
    // Border colors
    border: {
      default: '#333333',
      strong: '#555555',
      inverse: '#000000',
    },
    // Interactive colors
    interactive: {
      active: '#51a2ff',
      hover: '#3395FF',
    }
  },
  // New slate gray dark theme
  slateDark: {
    // Background colors with slate gray tones
    background: {
      default: '#2F3542',
      secondary: '#3A4050',
      tertiary: '#454C5C',
      inverse: '#ffffff',
    },
    // Text colors
    text: {
      default: '#FFFFFF',
      secondary: '#D1D5DB',
      tertiary: '#9CA3AF',
      inverse: '#2F3542',
    },
    // Border colors
    border: {
      default: '#4B5563',
      strong: '#6B7280',
      inverse: '#1F2937',
    },
    // Interactive colors
    interactive: {
      active: '#60A5FA',
      hover: '#3B82F6',
    }
  },
  // New hot pink theme
  hotPink: {
    // Background colors
    background: {
      default: '#fdf2f8',
      secondary: '#FDF2F8',
      tertiary: '#FCE7F3',
      inverse: '#831843',
    },
    // Text colors
    text: {
      default: '#831843',
      secondary: '#BE185D',
      tertiary: '#DB2777',
      inverse: '#FFFFFF',
    },
    // Border colors
    border: {
      default: '#F9A8D4',
      strong: '#F472B6',
      inverse: '#BF125D',
    },
    // Interactive colors
    interactive: {
      active: '#EC4899',
      hover: '#DB2777',
    }
  },
  // New honey theme for Ben (our Double Platinum Backer)
  honey: {
    // Background colors
    background: {
      default: '#fff3e3',
      secondary: '#ffebcc',
      tertiary: '#ffe3b3',
      inverse: '#593900',
    },
    // Text colors
    text: {
      default: '#593900',
      secondary: '#7a5000',
      tertiary: '#9c6500',
      inverse: '#fff3e3',
    },
    // Border colors
    border: {
      default: '#b79f7a',
      strong: '#a38a60',
      inverse: '#ecdac0',
    },
    // Interactive colors
    interactive: {
      active: '#ffb22e',
      hover: '#ffa600',
    }
  }
})

// Create themes
const themes = {
  light: {
    background: colorTokens.light.background,
    color: colorTokens.light.text,
    borderColor: colorTokens.light.border,
    colorHover: colorTokens.light.interactive,
  },
  dark: {
    background: colorTokens.dark.background,
    color: colorTokens.dark.text,
    borderColor: colorTokens.dark.border,
    colorHover: colorTokens.dark.interactive,
  },
  // Add the new slate gray dark theme
  slateDark: {
    background: colorTokens.slateDark.background,
    color: colorTokens.slateDark.text,
    borderColor: colorTokens.slateDark.border,
    colorHover: colorTokens.slateDark.interactive,
  },
  // Add the new hot pink theme
  hotPink: {
    background: colorTokens.hotPink.background,
    color: colorTokens.hotPink.text,
    borderColor: colorTokens.hotPink.border,
    colorHover: colorTokens.hotPink.interactive,
  },
  // Add the new ben theme
  honey: {
    background: colorTokens.honey.background,
    color: colorTokens.honey.text,
    borderColor: colorTokens.honey.border,
    colorHover: colorTokens.honey.interactive,
  }
}

// Extend the base configuration with our themes
const extendedConfig = {
  ...configBase,
  tokens: {
    ...configBase.tokens,
    color: colorTokens
  },
  themes: {
    ...configBase.themes,
    ...themes
  }
}

// Create the Tamagui config
export const config = createTamagui(extendedConfig)

export default config

export type Conf = typeof config

declare module 'tamagui' {
  interface TamaguiCustomConfig extends Conf {}
}