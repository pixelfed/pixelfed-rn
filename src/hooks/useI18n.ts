import { useContext } from 'react'
import { i18nContext } from 'src/app/context/i18n/context'

export const useI18n = () => useContext(i18nContext)
