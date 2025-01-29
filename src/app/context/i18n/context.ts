import { createContext } from 'react'
import type { i18n } from 'src/lib/i18n'

type I18nContextType = {
  locale: string
  setLocale: (locale: string) => void
  localeHasChanged: boolean
  t: typeof i18n.t
  getLocaleLabel(locale: string): { translated: string; original: string }
}

const defaultValue: I18nContextType = {
  locale: 'en',
  setLocale: () => {},
  localeHasChanged: false,
  t: () => '',
  getLocaleLabel: () => {
    return { translated: '', original: '' }
  },
}

export const i18nContext = createContext<I18nContextType>(defaultValue)
