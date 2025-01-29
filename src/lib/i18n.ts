import { getLocales } from 'expo-localization'
import { type Dict, I18n } from 'i18n-js'

import en from '../shared/translations/en.json'
import ptBR from '../shared/translations/pt-BR.json'
import { Storage } from 'src/state/cache'

const defaultLocale = 'en'
const locales = getLocales();

export const i18n = new I18n()
export const i18nLocaleStorageKey = 'ui.locale'
export const i18nAppSettingsLocaleStorageKey = 'system.appSettingsLocale'
export const availableLocales: string[] = []

const findClosestLocale = (locale: string) => {
  const [language] = locale.split('-')
  const closestLocale = Object.keys(i18n.translations).find((key) =>
    key.startsWith(language)
  )
  return closestLocale ?? defaultLocale
}

const getDeviceLocaleOrClosest = () => {
  let locale = locales[0].languageTag
  const storedAppSettingsLocale = Storage.getString(i18nAppSettingsLocaleStorageKey)
  const storedLocale = Storage.getString(i18nLocaleStorageKey)

  if(locale !== storedAppSettingsLocale) {
    Storage.set(i18nAppSettingsLocaleStorageKey, locale)
  }else if (storedLocale) {
    locale = storedLocale
  }
  return i18n.translations[locale] ? locale : findClosestLocale(locale)
}

const addLocale = (locale: string, translations: Dict) => {
  i18n.store(translations)
  availableLocales.push(locale)
}

addLocale('en', en)
addLocale('pt-BR', ptBR)

i18n.defaultLocale = defaultLocale
i18n.enableFallback = true
i18n.locale = getDeviceLocaleOrClosest()
