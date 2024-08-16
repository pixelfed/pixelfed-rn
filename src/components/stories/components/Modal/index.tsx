import React, { forwardRef, memo, useEffect, useImperativeHandle, useState } from 'react'
import { type GestureResponderEvent, Modal, Pressable } from 'react-native'
import Animated, {
  cancelAnimation,
  interpolate,
  runOnJS,
  useAnimatedGestureHandler,
  useAnimatedReaction,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated'
import {
  HEIGHT,
  LONG_PRESS_DURATION,
  STORY_ANIMATION_DURATION,
  WIDTH,
} from '../../core/constants'
import type {
  GestureContext,
  StoryModalProps,
  StoryModalPublicMethods,
} from '../../core/dto/componentsDTO'
import GestureHandler from './gesture'
import StoryList from '../List'
import ModalStyles from './Modal.styles'

const StoryModal = forwardRef<StoryModalPublicMethods, StoryModalProps>(
  (
    {
      stories,
      seenStories,
      duration,
      videoDuration,
      storyAvatarSize,
      textStyle,
      containerStyle,
      backgroundColor,
      videoProps,
      closeIconColor,
      modalAnimationDuration = STORY_ANIMATION_DURATION,
      storyAnimationDuration = STORY_ANIMATION_DURATION,
      hideElementsOnLongPress,
      onLoad,
      onShow,
      onHide,
      onSeenStoriesChange,
      onSwipeUp,
      onStoryStart,
      onStoryEnd,
      footerComponent,
      ...props
    },
    ref
  ) => {
    const [visible, setVisible] = useState(false)

    const x = useSharedValue(0)
    const y = useSharedValue(HEIGHT)
    const animation = useSharedValue(0)
    const currentStory = useSharedValue(stories[0]?.stories[0]?.id)
    const paused = useSharedValue(false)
    const durationValue = useSharedValue(duration)
    const isLongPress = useSharedValue(false)
    const hideElements = useSharedValue(false)
    const lastViewed = useSharedValue<{ [key: string]: number }>({})

    const userIndex = useDerivedValue(() => Math.round(x.value / WIDTH))
    const storyIndex = useDerivedValue(() =>
      stories[userIndex.value]?.stories.findIndex(
        (story) => story.id === currentStory.value
      )
    )
    const userId = useDerivedValue(() => stories[userIndex.value]?.id)
    const previousUserId = useDerivedValue(() => stories[userIndex.value - 1]?.id)
    const nextUserId = useDerivedValue(() => stories[userIndex.value + 1]?.id)
    const previousStory = useDerivedValue(() =>
      storyIndex.value !== undefined
        ? stories[userIndex.value]?.stories[storyIndex.value - 1]?.id
        : undefined
    )
    const nextStory = useDerivedValue(() =>
      storyIndex.value !== undefined
        ? stories[userIndex.value]?.stories[storyIndex.value + 1]?.id
        : undefined
    )

    const animatedStyles = useAnimatedStyle(() => ({ top: y.value }))
    const backgroundAnimatedStyles = useAnimatedStyle(() => ({
      opacity: interpolate(y.value, [0, HEIGHT], [1, 0]),
      backgroundColor,
    }))

    const onClose = () => {
      'worklet'

      y.value = withTiming(HEIGHT, { duration: modalAnimationDuration }, () =>
        runOnJS(setVisible)(false)
      )
      lastViewed.value = {}
      cancelAnimation(animation)
    }

    const stopAnimation = () => {
      'worklet'

      cancelAnimation(animation)
    }

    const startAnimation = (resume = false, newDuration?: number) => {
      'worklet'

      if (newDuration) {
        durationValue.value = newDuration
      } else {
        newDuration = durationValue.value
      }

      if (resume) {
        newDuration -= animation.value * newDuration
      } else {
        animation.value = 0

        if (userId.value !== undefined && currentStory.value !== undefined) {
          runOnJS(onSeenStoriesChange)(userId.value, currentStory.value)
        }

        if (userId.value !== undefined && storyIndex.value! >= 0) {
          lastViewed.value = {
            ...lastViewed.value,
            [userId.value]: storyIndex.value ?? 0,
          }
        }
      }

      animation.value = withTiming(1, { duration: newDuration })
    }

    const scrollTo = (
      id: string,
      animated = true,
      sameUser = false,
      previousUser?: string
    ) => {
      'worklet'

      const newUserIndex = stories.findIndex((story) => story.id === id)
      const newX = newUserIndex * WIDTH

      x.value = animated ? withTiming(newX, { duration: storyAnimationDuration }) : newX

      if (sameUser) {
        startAnimation(true)

        return
      }

      if (onStoryEnd && animated) {
        runOnJS(onStoryEnd)(previousUser ?? userId.value, currentStory.value)
      }

      const newStoryIndex =
        lastViewed.value[id] !== undefined
          ? lastViewed.value[id]!
          : (stories[newUserIndex]?.stories.findIndex(
              (story) => story.id === seenStories.value[id]
            ) ?? 0) + 1
      const userStories = stories[newUserIndex]?.stories
      const newStory = userStories?.[newStoryIndex]?.id ?? userStories?.[0]?.id
      currentStory.value = newStory

      if (onStoryStart) {
        runOnJS(onStoryStart)(id, newStory)
      }
    }

    const toNextStory = (value = true) => {
      'worklet'

      if (!value) {
        return
      }

      if (!nextStory.value) {
        if (nextUserId.value) {
          scrollTo(nextUserId.value)
        } else {
          onClose()
        }
      } else {
        if (onStoryEnd) {
          runOnJS(onStoryEnd)(userId.value, currentStory.value)
        }

        if (onStoryStart) {
          runOnJS(onStoryStart)(userId.value, nextStory.value)
        }

        animation.value = 0
        currentStory.value = nextStory.value
      }
    }

    const toPreviousStory = () => {
      'worklet'

      if (!previousStory.value) {
        if (previousUserId.value) {
          scrollTo(previousUserId.value)
        } else {
          return false
        }
      } else {
        if (onStoryEnd) {
          runOnJS(onStoryEnd)(userId.value, currentStory.value)
        }

        if (onStoryStart) {
          runOnJS(onStoryStart)(userId.value, previousStory.value)
        }

        animation.value = 0
        currentStory.value = previousStory.value
      }

      return true
    }

    const show = (id: string) => {
      setVisible(true)
      scrollTo(id, false)
    }

    const onGestureEvent = useAnimatedGestureHandler({
      onStart: (e, ctx: GestureContext) => {
        ctx.x = x.value
        ctx.userId = userId.value
      },
      onActive: (e, ctx) => {
        if (
          ctx.x === x.value &&
          (ctx.vertical || Math.abs(e.velocityX) < Math.abs(e.velocityY))
        ) {
          ctx.vertical = true
          y.value = e.translationY / 2
        } else {
          ctx.moving = true
          x.value = Math.max(
            0,
            Math.min(ctx.x + -e.translationX, WIDTH * (stories.length - 1))
          )
        }
      },
      onFinish: (e, ctx) => {
        if (ctx.vertical) {
          if (e.translationY > 100) {
            onClose()
          } else {
            if (e.translationY < -100 && onSwipeUp) {
              runOnJS(onSwipeUp)(
                stories[userIndex.value]?.id,
                stories[userIndex.value]?.stories[storyIndex.value ?? 0]?.id
              )
            }

            y.value = withTiming(0)
            startAnimation(true)
          }
        } else if (ctx.moving) {
          const diff = x.value - ctx.x
          let newX

          if (Math.abs(diff) < WIDTH / 4) {
            newX = ctx.x
          } else {
            newX =
              diff > 0
                ? Math.ceil(x.value / WIDTH) * WIDTH
                : Math.floor(x.value / WIDTH) * WIDTH
          }

          const newUserId = stories[Math.round(newX / WIDTH)]?.id
          if (newUserId !== undefined) {
            scrollTo(newUserId, true, newUserId === ctx.userId, ctx.userId)
          }
        }

        ctx.moving = false
        ctx.vertical = false
        ctx.userId = undefined
        hideElements.value = false
      },
    })

    const onPressIn = () => {
      stopAnimation()
      paused.value = true
    }

    const onLongPress = () => {
      isLongPress.value = true
      hideElements.value = hideElementsOnLongPress ?? false
    }

    const onPressOut = () => {
      if (!isLongPress.value) {
        return
      }

      hideElements.value = false
      isLongPress.value = false
      paused.value = false
      startAnimation(true)
    }

    const onPress = ({ nativeEvent: { locationX } }: GestureResponderEvent) => {
      hideElements.value = false

      if (isLongPress.value) {
        onPressOut()

        return
      }

      if (locationX < WIDTH / 2) {
        const success = toPreviousStory()

        if (!success) {
          startAnimation(true)
        }
      } else {
        toNextStory()
      }

      paused.value = false
    }

    useImperativeHandle(
      ref,
      () => ({
        show,
        hide: onClose,
        pause: () => {
          stopAnimation()
          paused.value = true
        },
        resume: () => {
          startAnimation(true)
          paused.value = false
        },
        getCurrentStory: () => ({ userId: userId.value, storyId: currentStory.value }),
        goToPreviousStory: toPreviousStory,
        goToNextStory: toNextStory,
      }),
      [userId.value, currentStory.value]
    )

    useEffect(() => {
      if (visible) {
        if (currentStory.value !== undefined) {
          onShow?.(currentStory.value)
        }
        onLoad?.()

        y.value = withTiming(0, { duration: modalAnimationDuration })
      } else if (currentStory.value !== undefined) {
        onHide?.(currentStory.value)
      }
    }, [visible])

    useAnimatedReaction(
      () => animation.value,
      (res, prev) => res !== prev && toNextStory(res === 1),
      [animation.value]
    )

    return (
      <Modal
        visible={visible}
        transparent
        animationType="none"
        testID="storyRNModal"
        onRequestClose={onClose}
      >
        <GestureHandler onGestureEvent={onGestureEvent}>
          <Animated.View style={ModalStyles.container} testID="storyModal">
            <Pressable
              onPressIn={onPressIn}
              onPress={onPress}
              onLongPress={onLongPress}
              onPressOut={onPressOut}
              delayLongPress={LONG_PRESS_DURATION}
              style={ModalStyles.container}
            >
              <Animated.View
                style={[ModalStyles.bgAnimation, backgroundAnimatedStyles]}
              />
              <Animated.View
                style={[ModalStyles.absolute, animatedStyles, containerStyle]}
              >
                {stories?.map((story, index) => (
                  <StoryList
                    {...story}
                    index={index}
                    x={x}
                    activeUser={userId}
                    activeStory={currentStory}
                    progress={animation}
                    seenStories={seenStories}
                    onClose={onClose}
                    onLoad={(value) => {
                      onLoad?.()
                      startAnimation(undefined, value !== undefined ? value : duration)
                    }}
                    avatarSize={storyAvatarSize}
                    textStyle={textStyle}
                    paused={paused}
                    videoProps={videoProps}
                    closeColor={closeIconColor}
                    hideElements={hideElements}
                    videoDuration={videoDuration}
                    key={story.id}
                    {...props}
                  />
                ))}
              </Animated.View>
            </Pressable>
            {footerComponent && footerComponent}
          </Animated.View>
        </GestureHandler>
      </Modal>
    )
  }
)

export default memo(StoryModal)
