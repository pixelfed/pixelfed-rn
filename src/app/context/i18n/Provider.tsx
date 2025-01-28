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
        t: (...props) => i18n.t(...props),
      }}
    >
      {children}
    </i18nContext.Provider>
  )
}
