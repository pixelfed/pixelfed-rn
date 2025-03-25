import { MaterialCommunityIcons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { useEffect } from 'react'
import { Pressable, StyleSheet } from 'react-native'
import Animated, {
  useSharedValue,
  withSpring,
  useAnimatedStyle,
  Extrapolate,
  interpolate,
} from 'react-native-reanimated'
import { useTheme } from 'tamagui'

type LikeButtonProps = {
  hasLiked: boolean
  handleLike: () => void
  size?: number
}

export default function LikeButton(props: LikeButtonProps) {
  const { hasLiked, handleLike, size = 32 } = props
  const likeAnimation = useSharedValue(hasLiked ? 1 : 0)
  const theme = useTheme()

  useEffect(() => {
    likeAnimation.value = withSpring<number>(hasLiked ? 1 : 0)
  }, [hasLiked])

  const outlineStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: interpolate(likeAnimation.value, [0, 1], [1, 0], Extrapolate.CLAMP),
        },
      ],
    }
  })

  const fillStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: likeAnimation.value,
        },
      ],
      opacity: likeAnimation.value,
    }
  })

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    handleLike()
  }

  return (
    <Pressable onPress={handlePress}>
      <Animated.View style={[StyleSheet.absoluteFillObject, outlineStyle]}>
        <MaterialCommunityIcons
          name={'heart-outline'}
          size={size}
          color={theme.color?.val.default.val}
        />
      </Animated.View>

      <Animated.View style={fillStyle}>
        <MaterialCommunityIcons name={'heart'} size={size} color={'red'} />
      </Animated.View>
    </Pressable>
  )
}
