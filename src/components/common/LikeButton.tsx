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
}

export default function LikeButton(props: LikeButtonProps) {
  const likeAnimation = useSharedValue(props?.hasLiked ? 1 : 0)

  useEffect(() => {
    likeAnimation.value = withSpring<number>(props?.hasLiked ? 1 : 0)
  }, [props.hasLiked])

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

  const handleLike = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    props.handleLike()
  }

  return (
    <Pressable onPress={() => handleLike()}>
      <Animated.View style={[StyleSheet.absoluteFillObject, outlineStyle]}>
        <MaterialCommunityIcons name={'heart-outline'} size={32} color={'black'} />
      </Animated.View>

      <Animated.View style={fillStyle}>
        <MaterialCommunityIcons name={'heart'} size={32} color={'red'} />
      </Animated.View>
    </Pressable>
  )
}
