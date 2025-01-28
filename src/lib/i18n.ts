import { getLocales } from 'expo-localization'
import { I18n } from 'i18n-js'

import en from '../shared/translations/en.json'
import ptBR from '../shared/translations/pt-BR.json'
import { Storage } from 'src/state/cache'

export const i18nLocaleStorageKey = 'ui.locale'

export const availableLocales = ['en', 'pt-BR']
const defaultLocale = 'en'

const findClosestLocale = (locale: string) => {
  const [language] = locale.split('-')
  const closestLocale = Object.keys(i18n.translations).find((key) =>
    key.startsWith(language)
  )
  return closestLocale ?? defaultLocale
}

const getDeviceLocaleOrClosest = () => {
  const storedLocale = Storage.getString(i18nLocaleStorageKey)

  if (storedLocale) {
    return storedLocale
  }
  const locale = getLocales()[0].languageTag
  return i18n.translations[locale] ? locale : findClosestLocale(locale)
}

export const i18n = new I18n()

i18n.store(en)
i18n.store(ptBR)

i18n.defaultLocale = defaultLocale
i18n.enableFallback = true
i18n.locale = getDeviceLocaleOrClosest()
