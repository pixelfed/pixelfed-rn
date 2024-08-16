import React, { type FC, memo, useRef, useState } from 'react'
import type { LayoutChangeEvent } from 'react-native'
import { runOnJS, useAnimatedReaction } from 'react-native-reanimated'
import type { StoryVideoProps } from '../../core/dto/componentsDTO'
import { WIDTH } from '../../core/constants'

const StoryVideo: FC<StoryVideoProps> = ({
  source,
  paused,
  isActive,
  onLoad,
  onLayout,
  ...props
}) => {
  try {
    // eslint-disable-next-line global-require
    const Video = require('react-native-video').default

    const ref = useRef<any>(null)

    const [pausedValue, setPausedValue] = useState(paused.value)

    const start = () => {
      ref.current?.seek(0)
      ref.current?.resume?.()
    }

    useAnimatedReaction(
      () => paused.value,
      (res, prev) => res !== prev && runOnJS(setPausedValue)(res),
      [paused.value]
    )

    useAnimatedReaction(
      () => isActive.value,
      (res) => res && runOnJS(start)(),
      [isActive.value]
    )

    return (
      <Video
        ref={ref}
        style={{ width: WIDTH, aspectRatio: 0.5626 }}
        {...props}
        source={source}
        paused={pausedValue}
        controls={false}
        repeat={false}
        onLoad={({ duration }: { duration: number }) => onLoad(duration * 1000)}
        onLayout={(e: LayoutChangeEvent) => onLayout(e.nativeEvent.layout.height)}
      />
    )
  } catch (error) {
    return null
  }
}

export default memo(StoryVideo)
