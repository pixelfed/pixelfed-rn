import React, {
  forwardRef,
  useImperativeHandle,
  useState,
  useEffect,
  useRef,
  memo,
} from 'react'
import { useSharedValue } from 'react-native-reanimated'
import { Image, ScrollView } from 'react-native'
import StoryAvatar from '../Avatar'
import {
  clearProgressStorage,
  getProgressStorage,
  setProgressStorage,
} from '../../core/helpers/storage'
import type {
  PixelfedStoriesProps,
  PixelfedStoriesPublicMethods,
} from '../../core/dto/PixelfedStoriesDTO'
import type { ProgressStorageProps } from '../../core/dto/helpersDTO'
import {
  ANIMATION_DURATION,
  DEFAULT_COLORS,
  SEEN_LOADER_COLORS,
  STORY_AVATAR_SIZE,
  AVATAR_SIZE,
  BACKGROUND_COLOR,
  CLOSE_COLOR,
} from '../../core/constants'
import StoryModal from '../Modal'
import type { StoryModalPublicMethods } from '../../core/dto/componentsDTO'
import { YStack, Text } from 'tamagui'

const PixelfedStories = forwardRef<PixelfedStoriesPublicMethods, PixelfedStoriesProps>(
  (
    {
      stories,
      saveProgress = true,
      avatarBorderColors = DEFAULT_COLORS,
      avatarSeenBorderColors = SEEN_LOADER_COLORS,
      avatarSize = AVATAR_SIZE,
      storyAvatarSize = STORY_AVATAR_SIZE,
      listContainerStyle,
      avatarListContainerStyle,
      listContainerProps,
      avatarListContainerProps,
      animationDuration = ANIMATION_DURATION,
      backgroundColor = BACKGROUND_COLOR,
      showName = false,
      nameTextStyle,
      nameTextProps,
      videoAnimationMaxDuration,
      videoProps,
      closeIconColor = CLOSE_COLOR,
      isVisible = false,
      hideAvatarList = false,
      ...props
    },
    ref
  ) => {
    const [data, setData] = useState(stories)

    const seenStories = useSharedValue<ProgressStorageProps>({})
    const loadedStories = useSharedValue(false)
    const loadingStory = useSharedValue<string | undefined>(undefined)

    const modalRef = useRef<StoryModalPublicMethods>(null)

    const onPress = (id: string) => {
      loadingStory.value = id

      if (loadedStories.value) {
        modalRef.current?.show(id)
      }
    }

    const onLoad = () => {
      loadingStory.value = undefined
    }

    const onStoriesChange = async () => {
      seenStories.value = await (saveProgress ? getProgressStorage() : {})

      const promises = stories.map((story) => {
        const seenStoryIndex = story.stories.findIndex(
          (item) => item.id === seenStories.value[story.id]
        )
        const seenStory = story.stories[seenStoryIndex + 1] || story.stories[0]

        if (!seenStory) {
          return true
        }

        return seenStory.mediaType !== 'video'
          ? Image.prefetch((seenStory.source as any)?.uri ?? seenStory.sourceUrl)
          : true
      })

      await Promise.all(promises)

      loadedStories.value = true

      if (loadingStory.value) {
        onPress(loadingStory.value)
      }
    }

    const onSeenStoriesChange = async (user: string, value: string) => {
      if (!saveProgress) {
        return
      }

      if (seenStories.value[user]) {
        const userData = data.find((story) => story.id === user)
        const oldIndex = userData?.stories.findIndex(
          (story) => story.id === seenStories.value[user]
        )
        const newIndex = userData?.stories.findIndex((story) => story.id === value)

        if (oldIndex! > newIndex!) {
          return
        }
      }

      seenStories.value = await setProgressStorage(user, value)
    }

    useImperativeHandle(
      ref,
      () => ({
        spliceStories: (newStories, index) => {
          if (index === undefined) {
            setData([...data, ...newStories])
          } else {
            const newData = [...data]
            newData.splice(index, 0, ...newStories)
            setData(newData)
          }
        },
        spliceUserStories: (newStories, user, index) => {
          const userData = data.find((story) => story.id === user)

          if (!userData) {
            return
          }

          const newData =
            index === undefined
              ? [...userData.stories, ...newStories]
              : [...userData.stories]

          if (index !== undefined) {
            newData.splice(index, 0, ...newStories)
          }

          setData(
            data.map((value) =>
              value.id === user
                ? {
                    ...value,
                    stories: newData,
                  }
                : value
            )
          )
        },
        setStories: (newStories) => {
          setData(newStories)
        },
        clearProgressStorage,
        hide: () => modalRef.current?.hide(),
        show: (id) => {
          if (id) {
            onPress(id)
          } else if (data[0]?.id) {
            onPress(data[0]?.id)
          }
        },
        pause: () => modalRef.current?.pause()!,
        resume: () => modalRef.current?.resume()!,
        goToPreviousStory: () => modalRef.current?.goToPreviousStory()!,
        goToNextStory: () => modalRef.current?.goToNextStory()!,
        getCurrentStory: () => modalRef.current?.getCurrentStory()!,
      }),
      [data]
    )

    useEffect(() => {
      onStoriesChange()
    }, [data])

    useEffect(() => {
      setData(stories)
    }, [stories])

    useEffect(() => {
      if (isVisible && data[0]?.id) {
        modalRef.current?.show(data[0]?.id)
      } else {
        modalRef.current?.hide()
      }
    }, [isVisible])

    return (
      <>
        {!hideAvatarList && (
          <ScrollView
            horizontal
            {...listContainerProps}
            {...avatarListContainerProps}
            contentContainerStyle={[listContainerStyle, avatarListContainerStyle]}
            testID="storiesList"
          >
            {data.map(
              (story) =>
                story.renderAvatar?.() ??
                ((story.avatarSource || story.avatar) && (
                  <YStack
                    key={`avatar${story.id}`}
                    justifyContent="center"
                    alignItems="center"
                    gap="$1.5"
                  >
                    <StoryAvatar
                      {...story}
                      loadingStory={loadingStory}
                      seenStories={seenStories}
                      onPress={() => onPress(story.id)}
                      colors={avatarBorderColors}
                      seenColors={avatarSeenBorderColors}
                      size={avatarSize}
                      showName={showName}
                      nameTextStyle={nameTextStyle}
                      nameTextProps={nameTextProps}
                    />
                    <Text
                      fontSize="$1"
                      fontFamily={'system'}
                      fontWeight="500"
                      color={avatarSeenBorderColors[0]}
                      allowFontScaling={false}
                    >
                      {story.username}
                    </Text>
                  </YStack>
                ))
            )}
          </ScrollView>
        )}
        <StoryModal
          ref={modalRef}
          stories={data}
          seenStories={seenStories}
          duration={animationDuration}
          storyAvatarSize={storyAvatarSize}
          onLoad={onLoad}
          onSeenStoriesChange={onSeenStoriesChange}
          backgroundColor={backgroundColor}
          videoDuration={videoAnimationMaxDuration}
          videoProps={videoProps}
          closeIconColor={closeIconColor}
          {...props}
        />
      </>
    )
  }
)

export default memo(PixelfedStories)
