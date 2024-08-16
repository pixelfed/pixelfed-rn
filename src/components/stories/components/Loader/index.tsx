import React, { type FC, memo, useMemo, useState } from 'react'
import Animated, {
  cancelAnimation,
  interpolate,
  runOnJS,
  useAnimatedProps,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated'
import { Circle, Defs, LinearGradient, Stop, Svg } from 'react-native-svg'
import { AVATAR_SIZE, LOADER_ID, LOADER_URL, STROKE_WIDTH } from '../../core/constants'
import type { StoryLoaderProps } from '../../core/dto/componentsDTO'

const AnimatedCircle = Animated.createAnimatedComponent(Circle)
const AnimatedSvg = Animated.createAnimatedComponent(Svg)

const Loader: FC<StoryLoaderProps> = ({ loading, color, size = AVATAR_SIZE + 10 }) => {
  const RADIUS = useMemo(() => (size - STROKE_WIDTH) / 2, [size])
  const CIRCUMFERENCE = useMemo(() => RADIUS * 2 * Math.PI, [RADIUS])

  const [colors, setColors] = useState<string[]>(color.value)

  const rotation = useSharedValue(0)
  const progress = useSharedValue(0)

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: interpolate(progress.value, [0, 1], [0, (CIRCUMFERENCE * 2) / 3]),
  }))
  const animatedStyles = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }))

  const startAnimation = () => {
    'worklet'

    progress.value = withRepeat(withTiming(1, { duration: 3000 }), -1, true)
    rotation.value = withRepeat(withTiming(720, { duration: 3000 }), -1, false, () => {
      rotation.value = 0
    })
  }

  const stopAnimation = () => {
    'worklet'

    cancelAnimation(progress)
    progress.value = withTiming(0)

    cancelAnimation(rotation)
    rotation.value = withTiming(0)
  }

  const onColorChange = (newColors: string[]) => {
    'worklet'

    if (JSON.stringify(colors) === JSON.stringify(newColors)) {
      return
    }

    runOnJS(setColors)(newColors)
  }

  useAnimatedReaction(
    () => loading.value,
    (res) => (res ? startAnimation() : stopAnimation()),
    [loading.value]
  )
  useAnimatedReaction(
    () => color.value,
    (res) => onColorChange(res),
    [color.value]
  )

  return (
    <AnimatedSvg width={size} height={size} style={animatedStyles}>
      <Defs>
        <LinearGradient id={LOADER_ID} x1="0%" y1="0%" x2="100%" y2="0%">
          {colors?.map((item, i) => (
            <Stop key={item} offset={i / colors.length} stopColor={item} />
          ))}
        </LinearGradient>
      </Defs>
      <AnimatedCircle
        cx={size / 2}
        cy={size / 2}
        r={RADIUS}
        fill="none"
        stroke={LOADER_URL}
        strokeWidth={STROKE_WIDTH}
        strokeLinecap="round"
        strokeDasharray={[CIRCUMFERENCE]}
        animatedProps={animatedProps}
      />
    </AnimatedSvg>
  )
}

export default memo(Loader)
