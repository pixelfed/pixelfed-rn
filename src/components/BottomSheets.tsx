import {
  BottomSheetModal,
  type BottomSheetModalProps,
  useBottomSheetModal,
} from '@gorhom/bottom-sheet'
import React, { useCallback } from 'react'
import { useEffect } from 'react'
import { BackHandler } from 'react-native'

export const PixelfedBottomSheetModal = React.forwardRef<
  BottomSheetModal,
  BottomSheetModalProps
>((props, ref?) => {
  const { children } = props
  const { dismissAll } = useBottomSheetModal()

  const onBackPressed = useCallback(() => {
    dismissAll()
    return true
  }, [])

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackPressed)

    return () => backHandler.remove()
  }, [])

  return (
    <BottomSheetModal ref={ref} {...props}>
      {children}
    </BottomSheetModal>
  )
})
