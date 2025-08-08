import type { BottomSheetModalProps } from '@gorhom/bottom-sheet'
import { BottomSheetModal, useBottomSheetModal } from '@gorhom/bottom-sheet'
import type { BottomSheetModalMethods } from '@gorhom/bottom-sheet/lib/typescript/types'
import React, { useCallback, useEffect, useState } from 'react'
import { BackHandler } from 'react-native'

export const PixelfedBottomSheetModal = React.forwardRef<
  BottomSheetModalMethods,
  Omit<BottomSheetModalProps, 'onChange'>
>((props, ref?) => {
  const [openPosition, setOpenPosition] = useState(-1)
  const { children } = props
  const { dismissAll } = useBottomSheetModal()

  const onBackPressed = useCallback(() => {
    if (openPosition < 0) {
      return false
    }

    dismissAll()
    return true
  }, [openPosition])

  const onChange = (index: number) => {
    setOpenPosition(index)
  }

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackPressed)
    return () => backHandler.remove()
  }, [onBackPressed])

  return (
    <BottomSheetModal ref={ref} {...props} onChange={onChange}>
      {children}
    </BottomSheetModal>
  )
})
