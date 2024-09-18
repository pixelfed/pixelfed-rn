import { Alert, Dimensions, Share, StyleSheet, Pressable, Platform } from 'react-native'
import { Button, Group, Separator, Text, View, XStack, YStack, ZStack } from 'tamagui'
import { Feather, Ionicons } from '@expo/vector-icons'
import FastImage from 'react-native-fast-image'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
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
} from '@gorhom/bottom-sheet'
import Carousel, { ICarouselInstance, Pagination } from 'react-native-reanimated-carousel'
import { useSharedValue } from 'react-native-reanimated'
import ReadMore from '../common/ReadMore'
import LikeButton from 'src/components/common/LikeButton'
import AutolinkText from 'src/components/common/AutolinkText'
import { Blurhash } from 'react-native-blurhash'
import Video, { VideoRef } from 'react-native-video'
import { PressableOpacity } from 'react-native-pressable-opacity'
import { BlurView } from '@react-native-community/blur'
import VideoPlayer from './VideoPlayer'
import ReadMoreAndroid from '../common/ReadMoreAndroid'
import { Storage } from 'src/state/cache'

const SCREEN_WIDTH = Dimensions.get('screen').width
const AVATAR_WIDTH = 45

const Section = React.memo(({ children }) => (
  <View px="$3" bg="white" borderTopWidth={1} borderBottomWidth={1} borderColor="$gray7">
    {children}
  </View>
))

const BorderlessSection = React.memo(({ children }) => (
  <View px="$3" bg="white">
    {children}
  </View>
))

const PostHeader = React.memo(({ avatar, username, displayName, userId, onOpenMenu }) => (
  <Section>
    <XStack
      flexGrow={1}
      justifyContent="flex-between"
      alignSelf="stretch"
      alignItems="center"
      py="$2"
    >
      <View flexGrow={1}>
        <Link
          href={{
            pathname: '/profile/[id]',
            params: { id: userId },
          }}
          asChild
        >
          <Pressable flexGrow={1}>
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
                <Text fontWeight="bold" fontSize="$5">
                  {enforceLen(username, 20, true)}
                </Text>
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
))

const PostMedia = React.memo(({ media, post }) => {
  const mediaUrl = media[0].url
  const [showSensitive, setSensitive] = useState(false)
  const forceSensitive = Storage.getBoolean('ui.forceSensitive') == true
  const height = media[0].meta?.original?.width
    ? SCREEN_WIDTH * (media[0].meta?.original?.height / media[0].meta?.original.width)
    : 430

  if (!forceSensitive && post.sensitive && !showSensitive) {
    return (
      <ZStack w={SCREEN_WIDTH} h={height}>
        <Blurhash
          blurhash={media[0]?.blurhash}
          style={{
            flex: 1,
            width: SCREEN_WIDTH,
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
          <YStack w={SCREEN_WIDTH} flexShrink={1}>
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
    <View flex={1} borderBottomWidth={1} borderBottomColor="$gray5">
      <FastImage
        style={{ width: SCREEN_WIDTH, height: height, backgroundColor: '#000' }}
        source={{ uri: mediaUrl }}
        resizeMode={FastImage.resizeMode.contain}
      />
    </View>
  )
})

const calculateHeight = (item) => {
  if (item.meta?.original?.width) {
    return SCREEN_WIDTH * (item.meta.original.height / item.meta.original.width)
  }
  return 500
}

const PostAlbumMedia = React.memo(({ media, post, progress }) => {
  const mediaUrl = media[0].url
  const [showSensitive, setSensitive] = useState(false)
  const height = media.reduce((max, item) => {
    const height = calculateHeight(item)
    return height > max ? height : max
  }, 0)

  const mediaList = post.media_attachments.slice(0, 10)

  if (post.sensitive && !showSensitive) {
    return (
      <ZStack w={SCREEN_WIDTH} h={height}>
        <Blurhash
          blurhash={media[0]?.blurhash}
          style={{
            flex: 1,
            width: SCREEN_WIDTH,
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
          <YStack w={SCREEN_WIDTH} flexShrink={1}>
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
        width={SCREEN_WIDTH}
        height={height}
        vertical={false}
        onProgressChange={progress}
        data={mediaList}
        renderItem={({ index }) => {
          const media = mediaList[0]
          return (
            <FastImage
              style={{
                width: SCREEN_WIDTH,
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

const PostActions = React.memo(
  ({
    hasLiked,
    hasShared,
    likesCount,
    likedBy,
    sharesCount,
    onOpenComments,
    post,
    progress,
    handleLike,
    showAltText,
    commentsCount,
    onBookmark,
    hasBookmarked,
    onShare,
  }) => {
    const hasAltText =
      post?.media_attachments?.length > 0 &&
      post?.media_attachments[0]?.description?.trim().length > 0
    const onShowAlt = () => {
      const idx = Math.floor(progress?.value ?? 0)
      Alert.alert(
        'Alt Text',
        post?.media_attachments[idx].description ??
          'Media was not tagged with any alt text.'
      )
    }

    const [likeCountCache, setLikeCount] = useState(likesCount)
    const [hasLikedCache, setLiked] = useState(hasLiked)

    const handleLikeCached = () => {
      if (hasLikedCache) {
        if (likesCount) {
          setLikeCount(likesCount - 1)
        } else {
          setLikeCount(0)
        }
        setLiked(false)
      } else {
        setLikeCount(likesCount + 1)
        setLiked(true)
      }
      handleLike()
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
                <LikeButton hasLiked={hasLiked} handleLike={handleLikeCached} />
                {likeCountCache ? (
                  <Link href={`/post/likes/${post.id}`}>
                    <Text fontWeight={'bold'} allowFontScaling={false}>
                      {prettyCount(likeCountCache)}
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
  }) => {
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
            ) : Platform.OS === 'ios' ? (
              <ReadMore numberOfLines={3} renderRevealedFooter={() => <></>}>
                <AutolinkText
                  text={captionText}
                  username={username}
                  onHashtagPress={onHashtagPress}
                  onMentionPress={onMentionPress}
                  onUsernamePress={onUsernamePress}
                />
              </ReadMore>
            ) : (
              <ReadMoreAndroid numberOfLines={3} renderRevealedFooter={() => <></>}>
                <AutolinkText
                  text={captionText}
                  username={username}
                  onHashtagPress={onHashtagPress}
                  onMentionPress={onMentionPress}
                  onUsernamePress={onUsernamePress}
                />
              </ReadMoreAndroid>
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

export default function FeedPost({
  post,
  user,
  onOpenComments,
  onLike,
  onDeletePost,
  onBookmark,
  disableReadMore = false,
  isPermalink = false,
  isLikeFeed = false,
  likedAt,
  onShare,
}) {
  const bottomSheetModalRef = useRef(null)
  const progress = useSharedValue(0)
  const snapPoints = useMemo(() => ['45%', '65%'], [])
  const hideCaptions = Storage.getBoolean('ui.hideCaptions') == true
  const showAltText = Storage.getBoolean('ui.showAltText') == true

  const handlePresentModalPress = useCallback(() => {
    bottomSheetModalRef.current?.present()
  }, [])
  const handleSheetChanges = useCallback((index) => {}, [])
  const renderBackdrop = useCallback(
    (props) => (
      <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={1} />
    ),
    []
  )

  const _onDeletePost = (id) => {
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
    await openBrowserAsync(post.url)
  }

  const onGotoHashtag = (tag) => {
    bottomSheetModalRef.current?.close()
    router.push(`/hashtag/${tag}`)
  }

  const onGotoMention = (tag) => {
    bottomSheetModalRef.current?.close()
    router.push(`/profile/0?byUsername=${tag}`)
  }

  const onGotoAbout = () => {
    bottomSheetModalRef.current?.close()
    router.push(`/profile/about/${post.account.id}`)
  }

  const _onEditPost = (id) => {
    bottomSheetModalRef.current?.close()
    router.push(`/post/edit/${id}`)
  }

  const onGotoShare = async () => {
    try {
      const result = await Share.share({
        message: post.url,
      })
    } catch (error) {}
  }

  return (
    <View flex={1} style={{ width: SCREEN_WIDTH }}>
      <PostHeader
        avatar={post.account?.avatar}
        username={post.account?.acct}
        displayName={post.account?.display_name}
        userId={post.account?.id}
        onOpenMenu={() => handlePresentModalPress()}
      />
      {post.media_attachments?.length > 1 ? (
        <PostAlbumMedia media={post.media_attachments} post={post} progress={progress} />
      ) : post.media_attachments?.length === 1 ? (
        <PostMedia media={post.media_attachments} post={post} />
      ) : null}
      {!hideCaptions || isPermalink ? (
        <>
          <PostActions
            hasLiked={post?.favourited}
            hasShared={post?.reblogged}
            post={post}
            progress={progress}
            hasBookmarked={post?.bookmarked}
            likesCount={post?.favourites_count}
            likedBy={post?.liked_by}
            sharesCount={post?.reblogs_count}
            showAltText={showAltText}
            commentsCount={post.reply_count}
            handleLike={() => onLike(post?.id, post?.favourited)}
            onOpenComments={() => onOpenComments(post?.id)}
            onBookmark={() => onBookmark(post?.id)}
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
            onMentionPress={(tag) => onGotoMention(tag)}
            onUsernamePress={() => goToProfile()}
            editedAt={post.edited_at}
            isLikeFeed={isLikeFeed}
            likedAt={likedAt}
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
