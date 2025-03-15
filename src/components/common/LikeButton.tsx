import { MaterialCommunityIcons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import React, { useEffect } from 'react'
import { Pressable, StyleSheet } from 'react-native'
import Animated, {
  useSharedValue,
  withSpring,
  useAnimatedStyle,
  Extrapolate,
  interpolate,
} from 'react-native-reanimated'

type LikeButtonProps = {
  hasLiked: boolean
  handleLike: () => void
  size?: number
}

export default function LikeButton(props: LikeButtonProps) {
  const { hasLiked, handleLike, size = 32 } = props
  const likeAnimation = useSharedValue(hasLiked ? 1 : 0)

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
        <MaterialCommunityIcons name={'heart-outline'} size={size} color={'black'} />
      </Animated.View>

      <Animated.View style={fillStyle}>
        <MaterialCommunityIcons name={'heart'} size={size} color={'red'} />
      </Animated.View>
    </Pressable>
  )
}
