import { BottomSheetModal, useBottomSheetModal } from '@gorhom/bottom-sheet'
import type { BottomSheetModalProps } from '@gorhom/bottom-sheet'
import { BottomSheetModalMethods } from '@gorhom/bottom-sheet/lib/typescript/types'
import React, { useCallback } from 'react'
import { useEffect } from 'react'
import { BackHandler } from 'react-native'

export const PixelfedBottomSheetModal = React.forwardRef<BottomSheetModalMethods, BottomSheetModalProps>((props, ref?) => {
  const { children } = props
  const { dismissAll } = useBottomSheetModal()

  const onBackPressed = useCallback(() => {
    dismissAll()
    return true
  }, [dismissAll])

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackPressed)
    return () => backHandler.remove()
  }, [onBackPressed])

  return (
    <BottomSheetModal ref={ref} {...props}>
      {children}
    </BottomSheetModal>
  )
})
