import React, { type FC, memo, useState, useMemo } from 'react'
import { View } from 'react-native'
import { runOnJS, useAnimatedReaction } from 'react-native-reanimated'
import type { StoryContentProps } from '../../core/dto/componentsDTO'
import ContentStyles from './Footer.styles'

const StoryFooter: FC<StoryContentProps> = ({ stories, active, activeStory }) => {
  const [storyIndex, setStoryIndex] = useState(0)

  const onChange = async () => {
    'worklet'

    const index = stories.findIndex((item) => item.id === activeStory.value)
    if (active.value && index >= 0 && index !== storyIndex) {
      runOnJS(setStoryIndex)(index)
    }
  }

  useAnimatedReaction(
    () => active.value,
    (res, prev) => res !== prev && onChange(),
    [active.value, onChange]
  )

  useAnimatedReaction(
    () => activeStory.value,
    (res, prev) => res !== prev && onChange(),
    [activeStory.value, onChange]
  )

  const footer = useMemo(() => stories[storyIndex]?.renderFooter?.(), [storyIndex])

  return footer ? (
    <View style={ContentStyles.container} pointerEvents="box-none">
      {footer}
    </View>
  ) : null
}

export default memo(StoryFooter)
