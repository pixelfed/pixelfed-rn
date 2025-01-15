import React from 'react'
import Animated, {
  useSharedValue,
  withSpring,
  useAnimatedStyle,
  Extrapolate,
  interpolate,
} from 'react-native-reanimated'
import { Pressable, StyleSheet } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'

type LikeButtonProps = {
  hasLiked: boolean
  handleLike: () => void
}

export default function LikeButton(props: LikeButtonProps) {
  const liked = useSharedValue(props.hasLiked ? 1 : 0)

  const outlineStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: interpolate(liked.value, [0, 1], [1, 0], Extrapolate.CLAMP),
        },
      ],
    }
  })

  const fillStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: liked.value,
        },
      ],
      opacity: liked.value,
    }
  })

  const handleLike = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    liked.value = withSpring(liked.value ? 0 : 1)
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
