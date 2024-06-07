import { Stack, styled } from '@tamagui/core'
import { createSwitch } from '@tamagui/switch'
import { Label, XStack, YStack } from 'tamagui'

const Frame = styled(Stack, {
  width: 60,
  height: 30,
  borderRadius: 30,
  variants: {
    checked: {
      true: {
        backgroundColor: '#2563eb',
      },
      false: {
        backgroundColor: '#f1f5f9',
      },
    },
  } as const,
  defaultVariants: {
    checked: false,
  },
})

const Thumb = styled(Stack, {
  width: 30,
  height: 30,
  backgroundColor: 'white',
  borderRadius: 20,
  borderColor: '#D1D4DA',
  borderWidth: 1,
  
  variants: {
      checked: {
        true: {
            opacity: 1,
        },
        false: {
            opacity: 1,
      },
    },
  } as const,
})

export const Switch = createSwitch({
  Frame,
  Thumb,
})