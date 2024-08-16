import React, { type FC, memo } from 'react'
import { Platform } from 'react-native'
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
} from 'react-native-reanimated'
import { HEIGHT, WIDTH } from '../../core/constants'
import type { AnimationProps } from '../../core/dto/componentsDTO'
import AnimationStyles from './Animation.styles'

const StoryAnimation: FC<AnimationProps> = ({ children, x, index }) => {
  const angle = Math.PI / 3
  const ratio = Platform.OS === 'ios' ? 2 : 1.2
  const offset = WIDTH * index
  const inputRange = [offset - WIDTH, offset + WIDTH]
  const maskInputRange = [offset - WIDTH, offset, offset + WIDTH]

  const animatedStyle = useAnimatedStyle(() => {
    const translateX = interpolate(
      x.value,
      inputRange,
      [WIDTH / ratio, -WIDTH / ratio],
      Extrapolation.CLAMP
    )

    const rotateY = interpolate(x.value, inputRange, [angle, -angle], Extrapolation.CLAMP)

    const alpha = Math.abs(rotateY)
    const gamma = angle - alpha
    const beta = Math.PI - alpha - gamma
    const w = WIDTH / 2 - (WIDTH / 2) * (Math.sin(gamma) / Math.sin(beta))
    const translateX1 = rotateY > 0 ? w : -w
    const left =
      Platform.OS === 'android'
        ? interpolate(
            rotateY,
            [-angle, -angle + 0.1, 0, angle - 0.1, angle],
            [0, 20, 0, -20, 0],
            Extrapolation.CLAMP
          )
        : 0

    return {
      transform: [
        { perspective: WIDTH },
        { translateX },
        { rotateY: `${rotateY}rad` },
        { translateX: translateX1 },
      ],
      left,
    }
  })

  const maskAnimatedStyles = useAnimatedStyle(() => ({
    opacity: interpolate(x.value, maskInputRange, [0.5, 0, 0.5], Extrapolation.CLAMP),
  }))

  return (
    <Animated.View
      style={[animatedStyle, AnimationStyles.container, AnimationStyles.cube]}
    >
      {children}
      <Animated.View
        style={[
          maskAnimatedStyles,
          AnimationStyles.absolute,
          { width: WIDTH, height: HEIGHT },
        ]}
        pointerEvents="none"
      />
    </Animated.View>
  )
}

export default memo(StoryAnimation)
