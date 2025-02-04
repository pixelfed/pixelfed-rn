import { BottomSheetModal, BottomSheetModalProps } from "@gorhom/bottom-sheet";
import React from "react";
import { useEffect, useRef } from "react";
import { BackHandler } from "react-native";


export const PixelfedBottomSheetModal = React.forwardRef<BottomSheetModal, BottomSheetModalProps>((
  props, ref?
) => {
  const { children } = props
  const localRef = ref || useRef<BottomSheetModal | null>(null)

  useEffect(() => {
    const backAction = () => {
      localRef?.current?.close()

      return true
    }

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    )

    return () => backHandler.remove()
  }, [])

  return <BottomSheetModal ref={localRef} {...props}>
    {children}
  </BottomSheetModal>
})
