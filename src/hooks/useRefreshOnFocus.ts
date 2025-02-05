import { useFocusEffect } from '@react-navigation/native'
import * as React from 'react'

export function useRefreshOnFocus(refetch: () => void) {
  const enabledRef = React.useRef(false)

  useFocusEffect(
    React.useCallback(() => {
      if (enabledRef.current) {
        refetch()
      } else {
        enabledRef.current = true
      }
    }, [refetch])
  )
}
