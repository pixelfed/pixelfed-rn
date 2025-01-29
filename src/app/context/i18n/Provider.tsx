import { type PropsWithChildren, useCallback, useEffect, useState } from 'react'
import { i18nContext } from './context'
import { i18n, i18nLocaleStorageKey } from 'src/lib/i18n'
import { Storage } from 'src/state/cache'

export const I18nContextProvider = ({ children }: PropsWithChildren) => {
  const [localeHasChanged, setLocaleHasChanged] = useState(false)

  const setLocale = useCallback((newLocale: string) => {
    i18n.locale = newLocale
    setLocaleHasChanged((state) => !state)
  }, [])

  const getLocaleLabel = useCallback((locale: string) => {
    const translated = i18n.t(`locales.${locale}`, {
      defaultValue: locale,
    })

    const thisLocalTranslations = i18n.translations[locale]

    if (!thisLocalTranslations) {
      return { translated, original: locale }
    }

    const translatedLocalesOfThisLocale = thisLocalTranslations['locales']

    if (!translatedLocalesOfThisLocale) {
      return { translated, original: locale }
    }

    return { translated, original: translatedLocalesOfThisLocale[locale] ?? locale }
  }, [])

  useEffect(() => {
    const unsubsribe = i18n.onChange((newVal) => {
      Storage.set(i18nLocaleStorageKey, newVal.locale)
    })

    return () => unsubsribe()
  }, [])

  return (
    <i18nContext.Provider
      value={{
        locale: i18n.locale,
        setLocale,
        localeHasChanged,
        getLocaleLabel,
        t: (...props) => i18n.t(...props),
      }}
    >
      {children}
    </i18nContext.Provider>
  )
}
