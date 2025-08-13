import { Feather, Ionicons } from '@expo/vector-icons'
import {
  BottomSheetBackdrop,
  type BottomSheetModal,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet'
import * as Haptics from 'expo-haptics'
import { Image } from 'expo-image'
import { Link, router } from 'expo-router'
import React, { useCallback, useMemo, useRef, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  Share,
  useWindowDimensions,
} from 'react-native'
import { Blurhash } from 'react-native-blurhash'
import {
  Gesture,
  GestureDetector,
  PinchGestureHandler,
} from 'react-native-gesture-handler'
import { PressableOpacity } from 'react-native-pressable-opacity'
import Animated, {
  runOnJS,
  type SharedValue,
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated'
import Carousel, { Pagination } from 'react-native-reanimated-carousel'
import AutolinkText, { onMentionPressMethod } from 'src/components/common/AutolinkText'
import LikeButton from 'src/components/common/LikeButton'
import ImageComponent from 'src/components/ImageComponent'
import { useBookmarkMutation } from 'src/hooks/mutations/useBookmarkMutation'
import { useLikeMutation } from 'src/hooks/mutations/useLikeMutation'
import type {
  LoginUserResponse,
  MediaAttachment,
  Status,
  StatusLikedBy,
  Tag,
  Timestamp,
  Visibility,
} from 'src/lib/api-types'
import { Storage } from 'src/state/cache'
import {
  _timeAgo,
  enforceLen,
  formatTimestamp,
  htmlToTextWithLineBreaks,
  openBrowserAsync,
  prettyCount,
} from 'src/utils'
import {
  Button,
  Circle,
  Separator,
  Text,
  useTheme,
  useThemeName,
  View,
  XStack,
  YStack,
  ZStack,
} from 'tamagui'
import { PixelfedBottomSheetModal } from '../common/BottomSheets'
import ReadMore from '../common/ReadMore'
import VideoPlayer from './VideoPlayer'

const AnimatedFastImage = Animated.createAnimatedComponent(Image)

const ZoomableImage = ({ source, placeholder, style }) => {
  const scale = useSharedValue(1)
  const savedScale = useSharedValue(1)
  const translateX = useSharedValue(0)
  const translateY = useSharedValue(0)
  const originX = useSharedValue(0)
  const originY = useSharedValue(0)

  const pinchGestureHandler = useAnimatedGestureHandler({
    onActive: (event) => {
      const pinchScale = event.scale
      const nextScale = savedScale.value * pinchScale
      const touchX = event.focalX
      const touchY = event.focalY

      if (scale.value === savedScale.value) {
        originX.value = touchX
        originY.value = touchY
      }

      const focalDeltaX = (touchX - originX.value) * (pinchScale - 1)
      const focalDeltaY = (touchY - originY.value) * (pinchScale - 1)

      scale.value = nextScale
      translateX.value = focalDeltaX
      translateY.value = focalDeltaY
    },
    onEnd: () => {
      savedScale.value = scale.value
      scale.value = withSpring(1)
      savedScale.value = 1
      translateX.value = withSpring(0)
      translateY.value = withSpring(0)
    },
  })

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }))

  return (
    <PinchGestureHandler onGestureEvent={pinchGestureHandler}>
      <Animated.View>
        <AnimatedFastImage
          source={source}
          placeholder={placeholder}
          style={[style, animatedStyle]}
          cachePolicy="memory"
          priority="high"
          contentFit={'contain'}
        />
      </Animated.View>
    </PinchGestureHandler>
  )
}

const AVATAR_WIDTH = 45

const Section = React.memo(({ children }: React.PropsWithChildren) => {
  const theme = useTheme()
  return (
    <View px="$3" py="$1" backgroundColor={theme.background?.val.default.val}>
      {children}
    </View>
  )
})

const SectionTopBorder = React.memo(({ children }: React.PropsWithChildren) => {
  const theme = useTheme()
  return (
    <View
      px="$3"
      backgroundColor={theme.background?.val.default.val}
      borderTopWidth={1}
      borderBottomWidth={0}
      borderColor={theme.borderColor.val.default.val}
    >
      {children}
    </View>
  )
})

const BorderlessSection = React.memo(({ children }: React.PropsWithChildren) => {
  const theme = useTheme()
  return (
    <View px="$3" backgroundColor={theme.background?.val.default.val}>
      {children}
    </View>
  )
})

interface PostHeaderProps {
  avatar: string
  username: string
  displayName: string
  userId: string
  onOpenMenu: () => void
}

const PostHeader = React.memo(
  ({ avatar, username, displayName, userId, onOpenMenu }: PostHeaderProps) => {
    const theme = useTheme()
    return (
      <Section>
        <XStack
          flexGrow={1}
          justifyContent="space-between"
          alignSelf="stretch"
          alignItems="center"
          py="$2"
        >
          <View flexGrow={1}>
            <Link 
              accessible={true}
              accessibilityRole="link"
              accessibilityHint="Tap to go to profile"
              href={`/profile/${userId}`} 
              asChild>
              <Pressable>
                <XStack gap="$3" alignItems="center" flexGrow={1}>
                  <ImageComponent
                    source={{ uri: avatar }}
                    style={{
                      width: AVATAR_WIDTH,
                      height: AVATAR_WIDTH,
                      borderRadius: AVATAR_WIDTH,
                      borderWidth: 1,
                      borderColor: theme.borderColor.val.default.val,
                    }}
                  />
                  <YStack gap={3}>
                    <XStack gap="$2" alignItems="center">
                      <Text
                        fontWeight="bold"
                        fontSize="$5"
                        color={theme.color.val.default.val}
                      >
                        {enforceLen(username, 20, true)}
                      </Text>
                    </XStack>
                    {displayName && displayName.length && (
                      <Text
                        fontWeight="300"
                        fontSize="$3"
                        color={theme.color.val.secondary.val}
                      >
                        {enforceLen(displayName, 25, true)}
                      </Text>
                    )}
                  </YStack>
                </XStack>
              </Pressable>
            </Link>
          </View>
          <Pressable 
            accessible={true}
            accessibilityLabel="Options" 
            accessibilityRole="button"
            onPress={() => onOpenMenu()}
            hitSlop={{ top: 10, bottom: 10 }}
          >
            <View px="$3">
              <Feather
                name={Platform.OS === 'ios' ? 'more-horizontal' : 'more-vertical'}
                size={25}
                color={theme.color.val.default.val}
              />
            </View>
          </Pressable>
        </XStack>
      </Section>
    )
  }
)

interface PostMediaProps {
  media: Array<MediaAttachment>
  post: Status
}

const PostMedia = React.memo(({ media, post }: PostMediaProps) => {
  const mediaUrl = media[0].url
  const [showSensitive, setSensitive] = useState(false)
  const { width } = useWindowDimensions()
  const theme = useTheme()
  const forceSensitive = Storage.getBoolean('ui.forceSensitive') == true
  const height = media[0].meta?.original?.width
    ? width * (media[0].meta?.original?.height / media[0].meta?.original.width)
    : 430

  if (!forceSensitive && post.sensitive && !showSensitive) {
    return (
      <ZStack w={width} h={height}>
        <YStack justifyContent="center" alignItems="center" flexGrow={1}>
          <YStack
            justifyContent="center"
            alignItems="center"
            flexGrow={1}
            m="$3"
            gap="$5"
          >
            <Feather name="eye-off" size={40} color="white" />
            <Text fontSize="$5" color="white" allowFontScaling={false}>
              This post contains sensitive or mature content
            </Text>
          </YStack>
          <YStack w={width} flexShrink={1}>
            <Separator borderColor={theme.borderColor?.val.default.val} />
            <PressableOpacity onPress={() => setSensitive(true)}>
              <View p="$4" justifyContent="center" alignItems="center">
                <Text
                  fontSize="$4"
                  color="white"
                  fontWeight={'bold'}
                  allowFontScaling={false}
                >
                  Tap to view
                </Text>
              </View>
            </PressableOpacity>
            <Separator borderColor={theme.borderColor?.val.default.val} />
          </YStack>
        </YStack>
      </ZStack>
    )
  }

  if (post.pf_type === 'video') {
    return <VideoPlayer source={mediaUrl} height={height} videoId={post.id} />
  }

  return (
    <View flex={1} borderBottomWidth={1} borderBottomColor="$gray5" zIndex={100}>
      <ZoomableImage
        placeholder={{ blurhash: media[0]?.blurhash || '', width: width, height: height }}
        source={{ uri: mediaUrl }}
        style={{ width: width, height: height, backgroundColor: '#000' }}
      />
    </View>
  )
})

const calculateHeight = (item: MediaAttachment, width: number) => {
  if (item.meta?.original?.width) {
    return width * (item.meta.original.height / item.meta.original.width)
  }
  return 500
}

interface PostAlbumMediaProps {
  media: Array<MediaAttachment>
  post: Status
  progress: SharedValue<number>
}

const PostAlbumMedia = React.memo(({ media, post, progress }: PostAlbumMediaProps) => {
  const [showSensitive, setSensitive] = useState(false)
  const { width } = useWindowDimensions()
  const height = media.reduce((max, item) => {
    const height = calculateHeight(item, width)
    return height > max ? height : max
  }, 0)
  const theme = useTheme()
  const themeName = useThemeName()
  const dotColor = themeName == 'dark' ? 'rgba(255, 255, 255, 0.20)' : 'rgba(0,0,0,0.11)'
  const mediaList = post.media_attachments.slice(0, 25)

  if (post.sensitive && !showSensitive) {
    return (
      <ZStack w={width} h={height}>
        <Blurhash
          blurhash={media[0]?.blurhash || ''}
          style={{
            flex: 1,
            width: width,
            height: height,
          }}
        />
        <YStack justifyContent="center" alignItems="center" flexGrow={1}>
          <YStack justifyContent="center" alignItems="center" flexGrow={1} gap="$3">
            <Feather name="eye-off" size={55} color="white" />
            <Text fontSize="$7" color="white">
              This post contains sensitive or mature content
            </Text>
          </YStack>
          <YStack w={width} flexShrink={1}>
            <Separator borderColor={theme.borderColor?.val.default.val} />

            <PressableOpacity onPress={() => setSensitive(true)}>
              <View p="$4" justifyContent="center" alignItems="center">
                <Text
                  fontSize="$4"
                  color="white"
                  fontWeight={'bold'}
                  allowFontScaling={false}
                >
                  Tap to view
                </Text>
              </View>
            </PressableOpacity>
            <Separator borderColor={theme.borderColor?.val.default.val} />
          </YStack>
        </YStack>
      </ZStack>
    )
  }

  return ( // todo: make image carousel accessible by screen readers
    <YStack zIndex={1}>
      <Carousel
        onConfigurePanGesture={(gestureChain) =>
          gestureChain.activeOffsetX([-10, 10]).runOnJS(true)
        }
        width={width}
        height={height}
        vertical={false}
        onProgressChange={progress}
        data={mediaList}
        renderItem={({ index }) => {
          return (
            <ZoomableImage
              placeholder={{
                blurhash: mediaList[index]?.blurhash || '',
                width: width,
                height: height,
              }}
              style={{
                width: width,
                height: height,
                backgroundColor: '#000',
              }}
              source={{ uri: mediaList[index].url }}
            />
          )
        }}
      />
      <Pagination.Basic
        progress={progress}
        data={mediaList}
        dotStyle={{ backgroundColor: dotColor, borderRadius: 50 }}
        activeDotStyle={{ backgroundColor: '#408DF6', borderRadius: 50 }}
        containerStyle={{
          gap: 2,
          position: 'absolute',
          bottom: 0,
          marginBottom: -10,
          zIndex: 10,
        }}
        size={7}
      />
    </YStack>
  )
})

interface PostActionsProps {
  hasLiked: boolean
  hasShared: boolean
  likesCount: number
  isLikePending: boolean
  likedBy: StatusLikedBy | null
  sharesCount: number
  onOpenComments: () => void
  post: Status
  progress: SharedValue<number>
  handleLike: () => void
  showAltText: boolean
  commentsCount: number
  hasBookmarked: boolean
  isLikeFeed: boolean
  onShare: () => void
}

const PostActions = React.memo(
  ({
    post,
    hasLiked,
    likesCount,
    isLikePending,
    hasShared,
    sharesCount,
    commentsCount,
    progress,
    showAltText,
    hasBookmarked,
    handleLike,
    onShare,
    onOpenComments,
    isLikeFeed,
  }: PostActionsProps) => {
    const hasAltText =
      post?.media_attachments?.length > 0 &&
      (post?.media_attachments[0]?.description?.trim().length || 0) > 0
    const onShowAlt = () => {
      const idx = Math.floor(progress?.value ?? 0)
      Alert.alert(
        'Alt Text',
        post?.media_attachments[idx].description ??
          'Media was not tagged with any alt text.'
      )
    }
    const theme = useTheme()
    const [shareCountCache, setShareCount] = useState(sharesCount)
    const [hasSharedCache, setShared] = useState(hasShared)

    const { handleBookmark, isBookmarkPending } = useBookmarkMutation()
    const handleBookmarkAction = useCallback(() => {
      handleBookmark(post.id, !hasBookmarked)
    }, [post.id, post.bookmarked, handleBookmark])

    const handleOnShare = () => {
      const labelText = hasSharedCache ? 'Unshare' : 'Share'
      Alert.alert(
        `Confirm ${labelText}`,
        `Are you sure you want to ${labelText.toLowerCase()} this post to your followers?`,
        [
          {
            text: 'Cancel',
          },
          {
            text: labelText,
            style: 'default',
            onPress: () => {
              if (hasSharedCache) {
                if (shareCountCache) {
                  setShareCount(shareCountCache - 1)
                } else {
                  setShareCount(0)
                }
                setShared(false)
              } else {
                if (shareCountCache) {
                  setShareCount(shareCountCache + 1)
                } else {
                  setShareCount(1)
                }
                setShared(true)
              }
              onShare()
            },
          },
        ]
      )
    }

    return (
      <BorderlessSection>
        <YStack pt="$3" pb="$2" px="$2" gap={10}>
          <XStack gap="$4" justifyContent="space-between">
            <XStack gap="$5">
              <XStack justifyContent="center" alignItems="center" gap="$2">
                <LikeButton hasLiked={hasLiked} handleLike={handleLike} />
                {isLikePending ? (
                  <ActivityIndicator color={theme.color?.val.default.val} />
                ) : null}
                {!isLikePending && likesCount ? (
                  <Link 
                    accessible={true}
                    accessibilityLabel=`${prettyCount(likesCount)} likes`
                    accessibilityRole="link"
                    accessibilityHint="Tap to show who liked this post" // is it good to have this? probably need at least something to indicate what clicking it does.
                    href={`/post/likes/${post.id}`}
                    asChild
                  >
                    <Pressable hitSlop={{ left: 5, right: 20, top: 12, bottom: 12 }}>
                      <Text
                        fontWeight={'bold'}
                        allowFontScaling={false}
                        color={theme.color?.val.secondary.val}
                      >
                        {prettyCount(likesCount)}
                      </Text>
                    </Pressable>
                  </Link>
                ) : null}
              </XStack>
              <Pressable 
                accessible={true}
                accessibilityLabel="Comments" 
                accessibilityRole="button"
                onPress={() => onOpenComments()}
                hitSlop={{ top: 4, bottom: 4, left: 4, right: commentsCount ? 4 : 25 }}
              >
                  <XStack justifyContent="center" alignItems="center" gap="$2">
                  <Feather
                    name="message-circle"
                    size={30}
                    color={theme.color?.val.default.val}
                  />
                  {commentsCount ? (
                    <Text
                      accessible={true}
                      accessibilityLabel=`${prettyCount(commentsCount)} comments`
                      accessibilityRole="text"
                      fontWeight={'bold'}
                      allowFontScaling={false}
                      fontSize="$2"
                      color={theme.color?.val.secondary.val}
                    >
                      {prettyCount(commentsCount)}
                    </Text>
                  ) : null}
                </XStack>
              </Pressable>
            </XStack>
            <XStack gap="$4">
              {post.visibility === 'public' ? (
                <XStack justifyContent="center" alignItems="center" gap="$2">
                  <PressableOpacity
                    accessible={true}
                    accessibilityLabel="Repost"
                    accessibilityRole="button"
                    onPress={() => handleOnShare()}
                    style={{ marginRight: 5 }}
                    hitSlop={6}
                  >
                    <Feather
                      name="refresh-cw"
                      size={28}
                      color={hasSharedCache ? 'gold' : theme.color?.val.default.val}
                    />
                  </PressableOpacity>
                  {sharesCount ? (
                    <Link
                      accessible={true}
                      accessibilityLabel=`Reposted ${prettyCount(shareCountCache)} times`
                      accessibilityRole="link"
                      accessibilityHint="Tap to show who reposted this" // same concern as above
                      href={`/post/shares/${post.id}`}
                      asChild
                    >
                      <Pressable hitSlop={{ left: 5, right: 20, top: 12, bottom: 12 }}>
                        <Text
                          fontWeight={'bold'}
                          allowFontScaling={false}
                          color={theme.color?.val.secondary.val}
                        >
                          {prettyCount(shareCountCache)}
                        </Text>
                      </Pressable>
                    </Link>
                  ) : null}
                </XStack>
              ) : null}
              {!isLikeFeed && isBookmarkPending ? (
                <ActivityIndicator color={theme.color?.val.default.val} />
              ) : null}
              {!isBookmarkPending && !isLikeFeed ? (
                <PressableOpacity onPress={() => handleBookmarkAction()} hitSlop={4}>
                  <XStack gap="$4">
                    {hasBookmarked ? (
                      <Ionicons
                        name="bookmark"
                        size={30}
                        color={theme.color?.val.default.val}
                      />
                    ) : (
                      <Feather
                        name="bookmark"
                        size={30}
                        color={theme.color?.val.default.val}
                      />
                    )}
                  </XStack>
                </PressableOpacity>
              ) : null}
              {showAltText && hasAltText ? (
                <PressableOpacity 
                  accessible={true}
                  accessibilityLabel="Show alt text"
                  accessibilityRole="button"
                  onPress={() => onShowAlt()}>
                  <XStack
                    bg={theme.color?.val.default.val}
                    px="$3"
                    py={4}
                    borderRadius={5}
                  >
                    <Text
                      color={theme.color?.val.inverse.val}
                      fontSize="$5"
                      fontWeight="bold"
                    >
                      ALT
                    </Text>
                  </XStack>
                </PressableOpacity>
              ) : null}
            </XStack>
          </XStack>
        </YStack>
      </BorderlessSection>
    )
  }
)

interface PostCaptionProps {
  postId: string
  username: string
  caption: string
  commentsCount: number
  createdAt: Timestamp
  tags: Array<Tag>
  visibility: Visibility
  onOpenComments: () => void
  onHashtagPress: (tag: string) => void
  onMentionPress: (username: string, isLocalUsername: boolean) => void
  onUsernamePress: () => void
  disableReadMore: boolean
  editedAt: Timestamp | null
  isLikeFeed: boolean
  likedAt: Timestamp | null
}

const PostCaption = React.memo(
  ({
    postId,
    username,
    caption,
    commentsCount,
    createdAt,
    tags,
    visibility,
    onOpenComments,
    onHashtagPress,
    onMentionPress,
    onUsernamePress,
    disableReadMore,
    editedAt,
    isLikeFeed,
    likedAt,
  }: PostCaptionProps) => {
    const timeAgo = formatTimestamp(createdAt)
    const captionText = htmlToTextWithLineBreaks(caption)
    const theme = useTheme()
    return (
      <BorderlessSection>
        <YStack gap="$3" pt="$1" pb="$5" px="$2">
          <XStack flexWrap="wrap" pr="$3">
            {disableReadMore ? (
              <AutolinkText
                text={captionText}
                username={username}
                onHashtagPress={onHashtagPress}
                onMentionPress={onMentionPress}
                onUsernamePress={onUsernamePress}
              />
            ) : (
              <ReadMore numberOfLines={3}>
                <AutolinkText
                  text={captionText}
                  username={username}
                  onHashtagPress={onHashtagPress}
                  onMentionPress={onMentionPress}
                  onUsernamePress={onUsernamePress}
                />
              </ReadMore>
            )}
          </XStack>
          {commentsCount ? (
            <Pressable onPress={() => onOpenComments()}>
              <Text color={theme.color?.val.secondary.val} fontSize="$3">
                View all {commentsCount} comments
              </Text>
            </Pressable>
          ) : null}

          <XStack justifyContent="flex-start" alignItems="center" gap="$3">
            {visibility == 'public' ? (
              <XStack alignItems="center" gap="$2">
                <Text color={theme.color?.val.secondary.val} fontSize="$3">
                  Public
                </Text>
              </XStack>
            ) : null}
            {visibility == 'unlisted' ? (
              <XStack alignItems="center" gap="$2">
                <Text color={theme.color?.val.secondary.val} fontSize="$3">
                  Unlisted
                </Text>
              </XStack>
            ) : null}
            {visibility == 'private' ? (
              <XStack alignItems="center" gap="$2">
                <Feather name="lock" color={theme.color?.val.secondary.val} />
                <Text color={theme.color?.val.secondary.val} fontSize="$3">
                  Followers only
                </Text>
              </XStack>
            ) : null}
            <Link href={`/post/${postId}`} asChild>
              <XStack alignItems="center" gap="$2">
                <Feather name="clock" color={theme.color?.val.tertiary.val} />
                <Text color={theme.color?.val.secondary.val} fontSize="$3">
                  {timeAgo}
                </Text>
              </XStack>
            </Link>
            {editedAt ? (
              <Link href={`/post/history/${postId}`} asChild>
                <XStack alignItems="center" gap="$2">
                  <Feather name="edit" color={theme.color?.val.secondary.val} />
                  <Text color={theme.color?.val.secondary.val} fontSize="$3">
                    Last Edited {_timeAgo(editedAt)}
                  </Text>
                </XStack>
              </Link>
            ) : null}
            {isLikeFeed && likedAt ? (
              <XStack alignItems="center" gap="$2">
                <Feather name="heart" color="#ccc" />
                <Text color={theme.color?.val.secondary.val} fontSize="$3">
                  Liked {_timeAgo(likedAt)} ago
                </Text>
              </XStack>
            ) : null}
          </XStack>
        </YStack>
      </BorderlessSection>
    )
  }
)

interface FeedPostProps {
  post: Status
  user: LoginUserResponse
  onOpenComments: (id: string) => void
  onDeletePost: (id: string) => void
  disableReadMore?: boolean
  isPermalink?: boolean
  isLikeFeed?: boolean
  onShare: (id: string) => void
  handleLikeProfileId?: boolean
}

interface TextPostProps {
  post: Status
  onMentionPress: (username: string, isLocalUsername: boolean) => void
  username: string
  // TODO
}

const TextPost = React.memo(
  ({
    post,
    avatar,
    username,
    handleLike,
    userId,
    onOpenMenu,
    disableReadMore,
    likesCount,
    caption,
    commentsCount,
    createdAt,
    onHashtagPress,
    onMentionPress,
    onUsernamePress,
    onOpenComments,
    hasLiked,
    isLikePending,
  }: TextPostProps) => {
    const timeAgo = formatTimestamp(createdAt)
    const captionText = htmlToTextWithLineBreaks(caption)
    const theme = useTheme()

    return ( // todo: add labels for buttons on these text posts.
      <SectionTopBorder>
        <XStack alignItems="flex-start" gap="$3" paddingVertical="$3">
          <Link href={`/profile/${userId}`} asChild>
            <Pressable>
              <Circle
                size={40}
                overflow="hidden"
                borderWidth={1}
                borderColor={theme.borderColor.val.default.val}
              >
                <ImageComponent
                  source={{ uri: avatar }}
                  style={{
                    width: AVATAR_WIDTH,
                    height: AVATAR_WIDTH,
                    borderRadius: AVATAR_WIDTH,
                    borderWidth: 1,
                    borderColor: '#eee',
                  }}
                />
              </Circle>
            </Pressable>
          </Link>
          <YStack flex={1}>
            {post.in_reply_to_id ? (
              <XStack>
                <Text color={theme.color.val.secondary.val}>In reply to this </Text>
                <Link href={`/post/${post.in_reply_to_id}`}>
                  <Text color={theme.colorHover.val.active.val} fontWeight="bold">
                    post
                  </Text>
                </Link>
              </XStack>
            ) : null}
            <XStack
              alignItems="center"
              paddingHorizontal="$1"
              justifyContent="space-between"
              flex={1}
              flexWrap="wrap"
            >
              <XStack alignItems="center" space="$2" flex={1}>
                <Text
                  fontWeight="bold"
                  fontSize={16}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  color={theme.color.val.default.val}
                >
                  {enforceLen(username, 20, true)}
                </Text>
                <Text
                  color={theme.color.val.secondary.val}
                  fontSize={14}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {timeAgo}
                </Text>
              </XStack>

              <Pressable onPress={() => onOpenMenu()}>
                <View px="$3">
                  <Feather
                    name={Platform.OS === 'ios' ? 'more-horizontal' : 'more-vertical'}
                    size={25}
                    color={theme.color.val.secondary.val}
                  />
                </View>
              </Pressable>
            </XStack>

            <YStack paddingHorizontal="$1" marginBottom="$2">
              <XStack flexWrap="wrap" pr="$3">
                {disableReadMore ? (
                  <AutolinkText
                    text={captionText}
                    username={''}
                    onHashtagPress={onHashtagPress}
                    onMentionPress={onMentionPress}
                    onUsernamePress={onUsernamePress}
                  />
                ) : (
                  <ReadMore numberOfLines={3}>
                    <AutolinkText
                      text={captionText}
                      username={''}
                      onHashtagPress={onHashtagPress}
                      onMentionPress={onMentionPress}
                      onUsernamePress={onUsernamePress}
                    />
                  </ReadMore>
                )}
              </XStack>
            </YStack>

            <YStack>
              <XStack alignItems="center" marginTop="$2">
                <XStack flex={1} alignItems="center" space="$6">
                  <XStack justifyContent="center" alignItems="center" gap="$2">
                    <LikeButton hasLiked={hasLiked} handleLike={handleLike} size={23} />
                    {isLikePending ? (
                      <ActivityIndicator color={theme.color.val.default.val} />
                    ) : null}
                    {!isLikePending && likesCount ? (
                      <Link href={`/post/likes/${post.id}`}>
                        <Text
                          fontWeight={'bold'}
                          allowFontScaling={false}
                          fontSize={13}
                          color={theme.color.val.secondary.val}
                        >
                          {prettyCount(likesCount)}
                        </Text>
                      </Link>
                    ) : null}
                  </XStack>

                  <XStack gap="$2" alignItems="center">
                    <Pressable onPress={() => onOpenComments()}>
                      <Feather
                        name="message-circle"
                        size={20}
                        color={theme.color?.val.default.val}
                      />
                    </Pressable>
                    <Text
                      fontSize={13}
                      fontWeight="bold"
                      color={theme.color?.val.secondary.val}
                    >
                      {prettyCount(commentsCount)}
                    </Text>
                  </XStack>
                </XStack>
              </XStack>
            </YStack>
          </YStack>
        </XStack>
      </SectionTopBorder>
    )
  }
)

const FeedPost = React.memo(
  function FeedPost({
    post,
    user,
    onOpenComments,
    onDeletePost,
    disableReadMore = false,
    isPermalink = false,
    isLikeFeed = false,
    onShare,
    handleLikeProfileId = false,
  }: FeedPostProps) {
    const { handleLike, isLikePending } = useLikeMutation()
    const bottomSheetModalRef = useRef<BottomSheetModal | null>(null)
    const progress = useSharedValue(0)
    const snapPoints = useMemo(() => ['45%', '65%'], [])
    const { width } = useWindowDimensions()
    const hideCaptions = Storage.getBoolean('ui.hideCaptions') == true
    const showAltText = Storage.getBoolean('ui.showAltText') == true
    const theme = useTheme()

    const handlePresentModalPress = useCallback(() => {
      bottomSheetModalRef.current?.present()
    }, [])
    const handleSheetChanges = useCallback((_: number) => {}, [])
    const renderBackdrop = useCallback(
      (props: BottomSheetBackdropProps) => (
        <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={1} />
      ),
      []
    )

    const handleLikeAction = useCallback(() => {
      const shouldLike = !post.favourited
      handleLike(
        post.id,
        shouldLike,
        handleLikeProfileId ? post.account.id.toString() : ''
      )
    }, [post.id, post.favourited, post.favourites_count, handleLike])

    const handleDoubleTap = () => {
      // only allow liking with double tap, not unliking
      if (!post.favourited) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
        handleLikeAction()
      }
    }

    const doubleTap = Gesture.Tap()
      .maxDuration(250)
      .numberOfTaps(2)
      .onStart(() => {
        'worklet'
        runOnJS(handleDoubleTap)()
      })

    const _onDeletePost = (id: string) => {
      bottomSheetModalRef.current?.close()
      Alert.alert('Delete Post', 'Are you sure you want to delete this post?', [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => onDeletePost(id),
        },
      ])
    }

    const goToPost = () => {
      bottomSheetModalRef.current?.close()
      router.push(`/post/${post.id}`)
    }

    const goToProfile = () => {
      bottomSheetModalRef.current?.close()
      router.push(`/profile/${post.account.id}`)
    }

    const goToReport = () => {
      bottomSheetModalRef.current?.close()
      router.push(`/post/report/${post.id}`)
    }

    const openInBrowser = async () => {
      bottomSheetModalRef.current?.close()
      await openBrowserAsync(post.url || post.uri)
    }

    const onGotoHashtag = (tag: string) => {
      bottomSheetModalRef.current?.close()
      router.push(`/hashtag/${tag}`)
    }

    const onGotoMention = (tag: string) => {
      bottomSheetModalRef.current?.close()
      router.push(`/profile/0?byUsername=${tag}`)
    }

    const onGotoAbout = () => {
      bottomSheetModalRef.current?.close()
      router.push(`/profile/about/${post.account.id}`)
    }

    const _onEditPost = (id: string) => {
      bottomSheetModalRef.current?.close()
      router.push(`/post/edit/${id}`)
    }

    const onGotoShare = async () => {
      try {
        await Share.share({
          message: post.url || post.uri,
        })
      } catch (_error) {}
    }
    return (
      <View flex={1} style={{ width }}>
        {post.media_attachments?.length > 0 ? (
          <>
            <PostHeader
              avatar={post.account?.avatar}
              username={post.account?.acct}
              displayName={post.account?.display_name}
              userId={post.account?.id}
              onOpenMenu={() => handlePresentModalPress()}
            />

            <GestureDetector gesture={Gesture.Exclusive(doubleTap)}>
              {post.media_attachments.length > 1 ? (
                <PostAlbumMedia
                  media={post.media_attachments}
                  post={post}
                  progress={progress}
                />
              ) : (
                <PostMedia media={post.media_attachments} post={post} />
              )}
            </GestureDetector>
            {!hideCaptions || isPermalink ? (
              <>
                <PostActions
                  hasLiked={post.favourited}
                  hasShared={post?.reblogged === true}
                  hasBookmarked={post?.bookmarked === true}
                  isLikeFeed={isLikeFeed}
                  post={post}
                  progress={progress}
                  isLikePending={isLikePending}
                  likesCount={post?.favourites_count}
                  likedBy={post?.liked_by}
                  sharesCount={post?.reblogs_count}
                  showAltText={showAltText}
                  commentsCount={post.reply_count}
                  handleLike={handleLikeAction}
                  onOpenComments={() => onOpenComments(post?.id)}
                  onShare={() => onShare(post?.id)}
                />

                <PostCaption
                  postId={post.id}
                  username={post.account?.username}
                  caption={post.content}
                  commentsCount={post.reply_count}
                  createdAt={post.created_at}
                  tags={post.tags}
                  visibility={post.visibility}
                  disableReadMore={disableReadMore}
                  onOpenComments={() => onOpenComments(post.id)}
                  onHashtagPress={(tag) => onGotoHashtag(tag)}
                  onMentionPress={onMentionPressMethod(onGotoMention, post.account.url)}
                  onUsernamePress={() => goToProfile()}
                  editedAt={post.edited_at}
                  isLikeFeed={isLikeFeed}
                  likedAt={post.liked_at}
                />
              </>
            ) : null}
          </>
        ) : !hideCaptions || isPermalink ? (
          <TextPost
            post={post}
            avatar={post.account?.avatar}
            username={post.account?.acct}
            displayName={post.account?.display_name}
            userId={post.account?.id}
            disableReadMore={disableReadMore}
            hasLiked={post.favourited}
            isLikePending={isLikePending}
            likesCount={post?.favourites_count}
            caption={post.content}
            commentsCount={post.reply_count}
            createdAt={post.created_at}
            onOpenMenu={() => handlePresentModalPress()}
            onHashtagPress={(tag) => onGotoHashtag(tag)}
            onMentionPress={onMentionPressMethod(onGotoMention, post.account.url)}
            onUsernamePress={() => goToProfile()}
            onOpenComments={() => onOpenComments(post?.id)}
            handleLike={handleLikeAction}
          />
        ) : null}
        <PixelfedBottomSheetModal
          ref={bottomSheetModalRef}
          index={1}
          snapPoints={snapPoints}
          onChange={handleSheetChanges}
          backdropComponent={renderBackdrop}
          backgroundStyle={{ backgroundColor: theme.background.val.default.val }}
          handleIndicatorStyle={{ backgroundColor: theme.background.val.tertiary.val }}
        >
          <BottomSheetScrollView
            style={{ backgroundColor: theme.background?.val.default.val }}
          >
            <Button
              size="$6"
              chromeless
              onPress={() => onGotoShare()}
              color={theme.color?.val.default.val}
            >
              Share
            </Button>
            <Separator borderColor={theme.borderColor?.val.default.val} />
            {!isPermalink ? (
              <>
                <Button
                  size="$6"
                  chromeless
                  onPress={() => goToPost()}
                  color={theme.color?.val.default.val}
                >
                  View Post
                </Button>
                <Separator borderColor={theme.borderColor?.val.default.val} />
              </>
            ) : null}
            <Button
              size="$6"
              chromeless
              onPress={() => goToProfile()}
              color={theme.color?.val.default.val}
            >
              View Profile
            </Button>
            <Separator borderColor={theme.borderColor?.val.default.val} />
            <Button
              size="$6"
              chromeless
              onPress={() => onGotoAbout()}
              color={theme.color?.val.default.val}
            >
              About this account
            </Button>
            <Separator borderColor={theme.borderColor?.val.default.val} />
            <Button
              size="$6"
              chromeless
              onPress={() => openInBrowser()}
              color={theme.color?.val.default.val}
            >
              Open in browser
            </Button>
            <Separator borderColor={theme.borderColor?.val.default.val} />
            {user && user?.id != post?.account?.id ? (
              <>
                <Button size="$6" chromeless color="red" onPress={() => goToReport()}>
                  Report
                </Button>
                <Separator borderColor={theme.borderColor?.val.default.val} />
              </>
            ) : null}
            {user && user?.id === post?.account?.id ? (
              <>
                <Button
                  size="$6"
                  chromeless
                  onPress={() => _onEditPost(post.id)}
                  color={theme.color?.val.secondary.val}
                >
                  Edit Post
                </Button>
                <Separator borderColor={theme.borderColor?.val.default.val} />
                <Button
                  size="$6"
                  chromeless
                  color="red"
                  onPress={() => _onDeletePost(post.id)}
                >
                  Delete Post
                </Button>
                <Separator borderColor={theme.borderColor?.val.default.val} />
              </>
            ) : null}
            <Button
              size="$6"
              chromeless
              color={theme.color?.val.secondary.val}
              onPress={() => bottomSheetModalRef.current?.close()}
            >
              Cancel
            </Button>
          </BottomSheetScrollView>
        </PixelfedBottomSheetModal>
      </View>
    )
  },
  (prevProps, nextProps) => {
    // Custom comparison to prevent unnecessary re-renders
    return (
      prevProps.post.id === nextProps.post.id &&
      prevProps.post.favourited === nextProps.post.favourited &&
      prevProps.post.favourites_count === nextProps.post.favourites_count &&
      prevProps.post.reblogged === nextProps.post.reblogged &&
      prevProps.post.bookmarked === nextProps.post.bookmarked
    )
  }
)

export default FeedPost
