import { Alert, Share, Pressable, Platform, useWindowDimensions } from 'react-native'
import { Button, Separator, Text, View, XStack, YStack, ZStack } from 'tamagui'
import { Feather } from '@expo/vector-icons'
import FastImage from 'react-native-fast-image'
import React, { useCallback, useMemo, useRef, useState } from 'react'
import {
  _timeAgo,
  enforceLen,
  formatTimestamp,
  htmlToTextWithLineBreaks,
  openBrowserAsync,
  prettyCount,
} from 'src/utils'
import { Link, router } from 'expo-router'
import {
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetBackdrop,
  type BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet'
import Carousel, { Pagination } from 'react-native-reanimated-carousel'
import ReadMore from '../common/ReadMore'
import LikeButton from 'src/components/common/LikeButton'
import AutolinkText from 'src/components/common/AutolinkText'
import { Blurhash } from 'react-native-blurhash'
import { PressableOpacity } from 'react-native-pressable-opacity'
import VideoPlayer from './VideoPlayer'
import { Storage } from 'src/state/cache'
import {
  State,
  PinchGestureHandler,
  GestureDetector,
  Gesture,
} from 'react-native-gesture-handler'
import Animated, {
  runOnJS,
  type SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated'

import type {
  GestureEvent,
  HandlerStateChangeEvent,
  PinchGestureHandlerEventPayload,
} from 'react-native-gesture-handler'
import type {
  LoginUserResponse,
  MediaAttachment,
  Status,
  StatusLikedBy,
  Tag,
  Timestamp,
  Visibility,
} from 'src/lib/api-types'
import { useLikeMutation } from 'src/hooks/mutations/useLikeMutation'

const AnimatedFastImage = Animated.createAnimatedComponent(FastImage)

const ZoomableImage = ({ source, style }) => {
  const scale = useSharedValue(1)
  const savedScale = useSharedValue(1)
  const translateX = useSharedValue(0)
  const translateY = useSharedValue(0)
  const originX = useSharedValue(0)
  const originY = useSharedValue(0)

  const onGestureEvent = (event: GestureEvent<PinchGestureHandlerEventPayload>) => {
    const pinchScale = event.nativeEvent.scale
    const nextScale = savedScale.value * pinchScale
    const touchX = event.nativeEvent.focalX
    const touchY = event.nativeEvent.focalY

    if (scale.value === savedScale.value) {
      originX.value = touchX
      originY.value = touchY
    }

    const focalDeltaX = (touchX - originX.value) * (pinchScale - 1)
    const focalDeltaY = (touchY - originY.value) * (pinchScale - 1)

    scale.value = nextScale
    translateX.value = focalDeltaX
    translateY.value = focalDeltaY
  }

  const onHandlerStateChange = (
    event: HandlerStateChangeEvent<PinchGestureHandlerEventPayload>
  ) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      savedScale.value = scale.value
      scale.value = withSpring(1)
      savedScale.value = 1
      translateX.value = withSpring(0)
      translateY.value = withSpring(0)
    }
  }

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }))

  return (
    <PinchGestureHandler
      onGestureEvent={onGestureEvent}
      onHandlerStateChange={onHandlerStateChange}
    >
      <Animated.View>
        <AnimatedFastImage
          source={source}
          style={[style, animatedStyle]}
          resizeMode={FastImage.resizeMode.contain}
        />
      </Animated.View>
    </PinchGestureHandler>
  )
}

const AVATAR_WIDTH = 45

const Section = React.memo(({ children }: React.PropsWithChildren) => (
  <View px="$3" bg="white" borderTopWidth={1} borderBottomWidth={1} borderColor="$gray7">
    {children}
  </View>
))

const BorderlessSection = React.memo(({ children }: React.PropsWithChildren) => (
  <View px="$3" bg="white">
    {children}
  </View>
))

interface PostHeaderProps {
  avatar: string
  username: string
  displayName: string
  userId: string
  onOpenMenu: () => void
}

const PostHeader = React.memo(
  ({ avatar, username, displayName, userId, onOpenMenu }: PostHeaderProps) => (
    <Section>
      <XStack
        flexGrow={1}
        justifyContent="space-between"
        alignSelf="stretch"
        alignItems="center"
        py="$2"
      >
        <View flexGrow={1}>
          <Link href={`/profile/${userId}`} asChild>
            <Pressable>
              <XStack gap="$3" alignItems="center" flexGrow={1}>
                <FastImage
                  source={{ uri: avatar }}
                  style={{
                    width: AVATAR_WIDTH,
                    height: AVATAR_WIDTH,
                    borderRadius: AVATAR_WIDTH,
                    borderWidth: 1,
                    borderColor: '#eee',
                  }}
                />
                <YStack gap={3}>
                  <XStack gap="$2" alignItems="center">
                    <Text fontWeight="bold" fontSize="$5">
                      {enforceLen(username, 20, true)}
                    </Text>
                  </XStack>
                  <Text fontWeight="300" fontSize="$3" color="$gray9">
                    {enforceLen(displayName, 25, true)}
                  </Text>
                </YStack>
              </XStack>
            </Pressable>
          </Link>
        </View>
        <Pressable onPress={() => onOpenMenu()}>
          <View px="$3">
            <Feather
              name={Platform.OS === 'ios' ? 'more-horizontal' : 'more-vertical'}
              size={25}
            />
          </View>
        </Pressable>
      </XStack>
    </Section>
  )
)

interface PostMediaProps {
  media: Array<MediaAttachment>
  post: Status
}

const PostMedia = React.memo(({ media, post }: PostMediaProps) => {
  const mediaUrl = media[0].url
  const [showSensitive, setSensitive] = useState(false)
  const { width } = useWindowDimensions()
  const forceSensitive = Storage.getBoolean('ui.forceSensitive') == true
  const height = media[0].meta?.original?.width
    ? width * (media[0].meta?.original?.height / media[0].meta?.original.width)
    : 430

  if (!forceSensitive && post.sensitive && !showSensitive) {
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
            <Separator />
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

  const mediaList = post.media_attachments.slice(0, 10)

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
            <Separator />

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
          </YStack>
        </YStack>
      </ZStack>
    )
  }

  return (
    <YStack zIndex={1}>
      <Carousel
        onConfigurePanGesture={(gestureChain) => gestureChain.activeOffsetX([-10, 10])}
        width={width}
        height={height}
        vertical={false}
        onProgressChange={progress}
        data={mediaList}
        renderItem={({ index }) => {
          const media = mediaList[0]
          return (
            <FastImage
              style={{
                width: width,
                height: height,
                backgroundColor: '#000',
              }}
              source={{ uri: mediaList[index].url }}
              resizeMode={FastImage.resizeMode.contain}
            />
          )
        }}
      />
      <Pagination.Basic
        progress={progress}
        data={mediaList}
        dotStyle={{ backgroundColor: 'rgba(0,0,0,0.16)', borderRadius: 50 }}
        activeDotStyle={{ backgroundColor: '#408DF6', borderRadius: 50 }}
        containerStyle={{
          gap: 2,
          position: 'absolute',
          bottom: 0,
          marginBottom: -30,
          zIndex: 10,
        }}
        size={8}
      />
    </YStack>
  )
})

interface PostActionsProps {
  hasLiked: boolean
  hasShared: boolean
  likesCount: number
  likedBy: StatusLikedBy | null
  sharesCount: number
  onOpenComments: () => void
  post: Status
  progress: SharedValue<number>
  handleLike: () => void
  showAltText: boolean
  commentsCount: number
  onBookmark: () => void
  hasBookmarked: boolean
  onShare: () => void
}

const PostActions = React.memo(
  ({
    post,
    hasLiked,
    likesCount,
    likedBy,
    hasShared,
    sharesCount,
    commentsCount,
    progress,
    showAltText,
    hasBookmarked,
    handleLike,
    onShare,
    onOpenComments,
    onBookmark,
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

    const [shareCountCache, setShareCount] = useState(sharesCount)
    const [hasSharedCache, setShared] = useState(hasShared)

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
            style: 'destructive',
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
                {likesCount ? (
                  <Link href={`/post/likes/${post.id}`}>
                    <Text fontWeight={'bold'} allowFontScaling={false}>
                      {prettyCount(likesCount)}
                    </Text>
                  </Link>
                ) : null}
              </XStack>
              <XStack justifyContent="center" alignItems="center" gap="$2">
                <Pressable onPress={() => onOpenComments()}>
                  <Feather name="message-circle" size={30} />
                </Pressable>
                {commentsCount ? (
                  <Text fontWeight={'bold'} allowFontScaling={false} fontSize="$2">
                    {prettyCount(commentsCount)}
                  </Text>
                ) : null}
              </XStack>
            </XStack>
            <XStack gap="$2">
              {post.visibility === 'public' ? (
                <XStack justifyContent="center" alignItems="center" gap="$2">
                  <PressableOpacity
                    onPress={() => handleOnShare()}
                    style={{ marginRight: 5 }}
                  >
                    <Feather
                      name="refresh-cw"
                      size={28}
                      color={hasSharedCache ? 'gold' : 'black'}
                    />
                  </PressableOpacity>
                  {sharesCount ? (
                    <Link href={`/post/shares/${post.id}`}>
                      <Text fontWeight={'bold'} allowFontScaling={false}>
                        {prettyCount(shareCountCache)}
                      </Text>
                    </Link>
                  ) : null}
                </XStack>
              ) : null}
              {/* <PressableOpacity onPress={() => onBookmark()}>
                <XStack gap="$4">
                  { hasBookmarked ?
                    <Ionicons name="bookmark" size={30} /> :
                    <Feather name="bookmark" size={30} />
                  }
                  </XStack>
              </PressableOpacity> */}
              {showAltText && hasAltText ? (
                <PressableOpacity onPress={() => onShowAlt()}>
                  <XStack bg="black" px="$3" py={4} borderRadius={5}>
                    <Text color="white" fontSize="$5" fontWeight="bold">
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
  onMentionPress: (tag: string) => void
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

    return (
      <BorderlessSection>
        <YStack gap="$3" pt="$1" pb="$3" px="$2">
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
              <Text color="$gray10" fontSize="$3">
                View all {commentsCount} comments
              </Text>
            </Pressable>
          ) : null}

          <XStack justifyContent="flex-start" alignItems="center" gap="$3">
            {visibility == 'public' ? (
              <XStack alignItems="center" gap="$2">
                <Text color="$gray9" fontSize="$3">
                  Public
                </Text>
              </XStack>
            ) : null}
            {visibility == 'unlisted' ? (
              <XStack alignItems="center" gap="$2">
                <Text color="$gray9" fontSize="$3">
                  Unlisted
                </Text>
              </XStack>
            ) : null}
            {visibility == 'private' ? (
              <XStack alignItems="center" gap="$2">
                <Feather name="lock" color="#ccc" />
                <Text color="$gray9" fontSize="$3">
                  Followers only
                </Text>
              </XStack>
            ) : null}
            <Link href={`/post/${postId}`} asChild>
              <XStack alignItems="center" gap="$2">
                <Feather name="clock" color="#ccc" />
                <Text color="$gray9" fontSize="$3">
                  {timeAgo}
                </Text>
              </XStack>
            </Link>
            {editedAt ? (
              <Link href={`/post/history/${postId}`} asChild>
                <XStack alignItems="center" gap="$2">
                  <Feather name="edit" color="#ccc" />
                  <Text color="$gray9" fontSize="$3">
                    Last Edited {_timeAgo(editedAt)}
                  </Text>
                </XStack>
              </Link>
            ) : null}
            {isLikeFeed && likedAt ? (
              <XStack alignItems="center" gap="$2">
                <Feather name="heart" color="#ccc" />
                <Text color="$gray9" fontSize="$3">
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
  onBookmark: (id: string) => void
  disableReadMore?: boolean
  isPermalink?: boolean
  isLikeFeed?: boolean
  onShare: (id: string) => void
}

export default function FeedPost({
  post,
  user,
  onOpenComments,
  onDeletePost,
  onBookmark,
  disableReadMore = false,
  isPermalink = false,
  isLikeFeed = false,
  onShare,
}: FeedPostProps) {
  const { handleLike } = useLikeMutation()
  const bottomSheetModalRef = useRef<BottomSheetModal | null>(null)
  const progress = useSharedValue(0)
  const snapPoints = useMemo(() => ['45%', '65%'], [])
  const { width } = useWindowDimensions()
  const hideCaptions = Storage.getBoolean('ui.hideCaptions') == true
  const showAltText = Storage.getBoolean('ui.showAltText') == true

  const handlePresentModalPress = useCallback(() => {
    bottomSheetModalRef.current?.present()
  }, [])
  const handleSheetChanges = useCallback((index: number) => {}, [])
  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={1} />
    ),
    []
  )

  const [likeCount, setLikeCount] = useState(post?.favourites_count ?? 0)
  const [hasLiked, setLiked] = useState(post.favourited ?? false)

  // toggles 'hasLiked' value, updates states and calls mutation
  const handleLikeAction = () => {
    let currentHasLiked = !hasLiked

    setLiked(currentHasLiked)
    setLikeCount(currentHasLiked ? likeCount + 1 : likeCount - 1)

    handleLike(post?.id, currentHasLiked)
  }

  const handleDoubleTap = () => {
    // only allow liking with double tap, not unliking
    if (!hasLiked) {
      handleLikeAction()
    }
  }

  const doubleTap = Gesture.Tap()
    .maxDuration(250)
    .numberOfTaps(2)
    .onStart(() => {
      try {
        runOnJS(handleDoubleTap)()
      } catch (error) {
        console.error('Double tap error:', error)
      }
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
    } catch (error) {}
  }

  return (
    <View flex={1} style={{ width }}>
      <PostHeader
        avatar={post.account?.avatar}
        username={post.account?.acct}
        displayName={post.account?.display_name}
        userId={post.account?.id}
        onOpenMenu={() => handlePresentModalPress()}
      />
      {post.media_attachments?.length > 0 ? (
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
      ) : null}
      {!hideCaptions || isPermalink ? (
        <>
          <PostActions
            hasLiked={hasLiked}
            hasShared={post?.reblogged === true}
            hasBookmarked={post?.bookmarked === true}
            post={post}
            progress={progress}
            likesCount={post?.favourites_count}
            likedBy={post?.liked_by}
            sharesCount={post?.reblogs_count}
            showAltText={showAltText}
            commentsCount={post.replies_count}
            handleLike={handleLikeAction}
            onOpenComments={() => onOpenComments(post?.id)}
            onBookmark={() => onBookmark(post?.id)}
            onShare={() => onShare(post?.id)}
          />

          <PostCaption
            postId={post.id}
            username={post.account?.username}
            caption={post.content}
            commentsCount={post.replies_count}
            createdAt={post.created_at}
            tags={post.tags}
            visibility={post.visibility}
            disableReadMore={disableReadMore}
            onOpenComments={() => onOpenComments(post.id)}
            onHashtagPress={(tag) => onGotoHashtag(tag)}
            onMentionPress={(tag) => onGotoMention(tag)}
            onUsernamePress={() => goToProfile()}
            editedAt={post.edited_at}
            isLikeFeed={isLikeFeed}
            likedAt={post.liked_at}
          />
        </>
      ) : null}
      <BottomSheetModal
        ref={bottomSheetModalRef}
        index={1}
        snapPoints={snapPoints}
        onChange={handleSheetChanges}
        backdropComponent={renderBackdrop}
      >
        <BottomSheetScrollView>
          <Button size="$6" chromeless onPress={() => onGotoShare()}>
            Share
          </Button>
          <Separator />
          {!isPermalink ? (
            <>
              <Button size="$6" chromeless onPress={() => goToPost()}>
                View Post
              </Button>
              <Separator />
            </>
          ) : null}
          <Button size="$6" chromeless onPress={() => goToProfile()}>
            View Profile
          </Button>
          <Separator />
          <Button size="$6" chromeless onPress={() => onGotoAbout()}>
            About this account
          </Button>
          <Separator />
          <Button size="$6" chromeless onPress={() => openInBrowser()}>
            Open in browser
          </Button>
          <Separator />
          {user && user?.id != post?.account?.id ? (
            <>
              <Button size="$6" chromeless color="red" onPress={() => goToReport()}>
                Report
              </Button>
              <Separator />
            </>
          ) : null}
          {user && user?.id === post?.account?.id ? (
            <>
              <Button size="$6" chromeless onPress={() => _onEditPost(post.id)}>
                Edit Post
              </Button>
              <Separator />
              <Button
                size="$6"
                chromeless
                color="red"
                onPress={() => _onDeletePost(post.id)}
              >
                Delete Post
              </Button>
              <Separator />
            </>
          ) : null}
          <Button
            size="$6"
            chromeless
            color="$gray8"
            onPress={() => bottomSheetModalRef.current?.close()}
          >
            Cancel
          </Button>
        </BottomSheetScrollView>
      </BottomSheetModal>
    </View>
  )
}
