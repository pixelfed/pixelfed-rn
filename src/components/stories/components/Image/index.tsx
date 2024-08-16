import { Image, View } from 'react-native'
import React, { type FC, memo, useState } from 'react'
import {
  runOnJS,
  useAnimatedReaction,
  useDerivedValue,
  useSharedValue,
} from 'react-native-reanimated'
import type { StoryImageProps } from '../../core/dto/componentsDTO'
import Loader from '../Loader'
import { HEIGHT, LOADER_COLORS, WIDTH } from '../../core/constants'
import ImageStyles from './Image.styles'
import StoryVideo from './video'
import type { StoryItemProps } from '~/core/dto/PixelfedStoriesDTO'
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg'

const StoryImage: FC<StoryImageProps> = ({
  stories,
  activeStory,
  defaultStory,
  isDefaultVideo,
  paused,
  videoProps,
  isActive,
  mediaContainerStyle,
  imageStyles,
  imageProps,
  videoDuration,
  onImageLayout,
  onLoad,
}) => {
  const [data, setData] = useState<{ data?: StoryItemProps; isVideo?: boolean }>({
    data: defaultStory,
    isVideo: isDefaultVideo,
  })

  const loading = useSharedValue(true)
  const color = useSharedValue(LOADER_COLORS)
  const duration = useSharedValue<number | undefined>(undefined)
  const isPaused = useDerivedValue(() => paused.value || !isActive.value)

  const onImageChange = async () => {
    if (!activeStory.value) {
      return
    }

    const story = stories.find((item) => item.id === activeStory.value)

    if (!story) {
      return
    }

    if (data.data?.id === story.id) {
      if (!loading.value) {
        onLoad(duration.value)
      }
    } else {
      loading.value = true
      setData({ data: story, isVideo: story.mediaType === 'video' })
    }

    const nextStory = stories[stories.indexOf(story) + 1]

    if (
      nextStory &&
      nextStory.mediaType !== 'video' &&
      ((nextStory.source as any)?.uri || nextStory.sourceUrl)
    ) {
      Image.prefetch((nextStory.source as any)?.uri ?? nextStory.sourceUrl)
    }
  }

  useAnimatedReaction(
    () => isActive.value,
    (res, prev) => res !== prev && res && runOnJS(onImageChange)(),
    [isActive.value, onImageChange]
  )

  useAnimatedReaction(
    () => activeStory.value,
    (res, prev) => res !== prev && runOnJS(onImageChange)(),
    [activeStory.value, onImageChange]
  )

  const onContentLoad = (newDuration?: number) => {
    const animationDuration =
      (data?.data?.mediaType === 'video' ? videoDuration : undefined) ??
      data.data?.animationDuration ??
      newDuration
    duration.value = animationDuration

    loading.value = false

    if (isActive.value) {
      onLoad(animationDuration)
    }
  }

  return (
    <>
      <View style={ImageStyles.container}>
        <Loader loading={loading} color={color} size={50} />
      </View>
      <View style={[ImageStyles.image, mediaContainerStyle]}>
        <Svg
          height={100}
          width="100%"
          style={{ position: 'absolute', zIndex: 3, top: 0 }}
        >
          <Defs>
            <LinearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor="black" stopOpacity="0.8" />
              <Stop offset="100%" stopColor="black" stopOpacity="0" />
            </LinearGradient>
          </Defs>
          <Rect x="0" y="0" width="100%" height={100} fill="url(#grad)" />
        </Svg>
        {(data.data?.source || data.data?.sourceUrl) &&
          (data.isVideo ? (
            <StoryVideo
              onLoad={onContentLoad}
              onLayout={onImageLayout}
              source={data.data.source ?? { uri: data.data.sourceUrl }}
              paused={isPaused}
              isActive={isActive}
              {...videoProps}
            />
          ) : (
            <Image
              source={data.data.source ?? { uri: data.data.sourceUrl }}
              style={[{ width: WIDTH, aspectRatio: 0.5626 }, imageStyles]}
              resizeMode="contain"
              testID="storyImageComponent"
              onLayout={(e) =>
                onImageLayout(Math.min(HEIGHT, e.nativeEvent.layout.height))
              }
              onLoad={() => onContentLoad()}
              {...imageProps}
            />
          ))}
      </View>
    </>
  )
}

export default memo(StoryImage)
