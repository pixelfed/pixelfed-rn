import React, { type FC, memo } from 'react'
import { View } from 'react-native'
import Animated, { useAnimatedStyle } from 'react-native-reanimated'
import type { StoryProgressItemProps } from '../../core/dto/componentsDTO'
import ProgressStyles from './Progress.styles'
import { PROGRESS_ACTIVE_COLOR, PROGRESS_COLOR } from '../../core/constants'

const AnimatedView = Animated.createAnimatedComponent(View)

const ProgressItem: FC<StoryProgressItemProps> = ({
  progress,
  active,
  activeStory,
  index,
  width,
  progressActiveColor = PROGRESS_ACTIVE_COLOR,
  progressColor = PROGRESS_COLOR,
}) => {
  const animatedStyle = useAnimatedStyle(() => {
    if (!active.value || activeStory.value < index) {
      return { width: 0 }
    }

    if (activeStory.value > index) {
      return { width }
    }

    return { width: width * progress.value }
  })

  return (
    <View style={[ProgressStyles.item, { backgroundColor: progressColor }, { width }]}>
      <AnimatedView
        style={[
          ProgressStyles.item,
          { backgroundColor: progressActiveColor },
          animatedStyle,
        ]}
      />
    </View>
  )
}

export default memo(ProgressItem)
