import { MaterialCommunityIcons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { useEffect } from 'react'
import { Pressable, StyleSheet } from 'react-native'
import Animated, {
  Extrapolate,
  interpolate,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
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
  const hasLikedShared = useSharedValue(hasLiked)
  const theme = useTheme()

  useEffect(() => {
    hasLikedShared.value = hasLiked
  }, [hasLiked])

  useAnimatedReaction(
    () => hasLikedShared.value,
    (currentHasLiked, previousHasLiked) => {
      if (currentHasLiked !== previousHasLiked) {
        likeAnimation.value = withSpring(currentHasLiked ? 1 : 0)
      }
    },
    [hasLiked]
  )

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
    <Pressable 
      accessible={true}
      accessibilityLabel="Like post"
      accessibilityRole="button"
      accessibilityState={{ checked: hasLiked }}
      onPress={handlePress}
      hitSlop={4}
    >
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
