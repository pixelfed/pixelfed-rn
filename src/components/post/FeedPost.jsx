import { Alert, Dimensions, Share, StyleSheet, Pressable, Platform } from 'react-native'
import { Button, Group, Separator, Text, View, XStack, YStack, ZStack } from 'tamagui'
import { Feather, Ionicons } from '@expo/vector-icons'
import FastImage from 'react-native-fast-image'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  enforceLen,
  formatTimestamp,
  htmlToTextWithLineBreaks,
  openBrowserAsync,
} from 'src/utils'
import { Link, router } from 'expo-router'
import {
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetBackdrop,
} from '@gorhom/bottom-sheet'
import Carousel, { ICarouselInstance, Pagination } from 'react-native-reanimated-carousel'
import { useSharedValue, runOnJS } from 'react-native-reanimated'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import ReadMore from '../common/ReadMore'
import LikeButton from 'src/components/common/LikeButton'
import AutolinkText from 'src/components/common/AutolinkText'
import { Blurhash } from 'react-native-blurhash'
import Video, { VideoRef } from 'react-native-video'
import { PressableOpacity } from 'react-native-pressable-opacity'
import { BlurView } from '@react-native-community/blur'
import VideoPlayer from './VideoPlayer'

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
  const height = media[0].meta?.original?.width
    ? SCREEN_WIDTH * (media[0].meta?.original?.height / media[0].meta?.original.width)
    : 430

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
            <Pressable onPress={() => setSensitive(true)}>
              <View py={15} justifyContent="center" alignItems="center">
                <Text color="white" fontWeight={'bold'}>
                  Tap to view
                </Text>
              </View>
            </Pressable>
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

const PostAlbumMedia = ({ media, post, carouselRef, progress }) => {
  const mediaUrl = media[0].url
  const [showSensitive, setSensitive] = useState(false)
  const height = media[0].meta?.original?.width
    ? SCREEN_WIDTH * (media[0].meta?.original?.height / media[0].meta?.original.width)
    : 430

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
            <Button
              alignSelf="stretch"
              size="$5"
              color="white"
              onPress={() => setSensitive(true)}
              chromeless
            >
              Tap to view
            </Button>
          </YStack>
        </YStack>
      </ZStack>
    )
  }

  return (
    <>
      <Carousel
        ref={carouselRef}
        onConfigurePanGesture={(gestureChain) => gestureChain.activeOffsetX([-10, 10])}
        width={SCREEN_WIDTH}
        height={height}
        vertical={false}
        onProgressChange={progress}
        mode="parallax"
        modeConfig={{
          parallaxScrollingScale: 0.9,
          parallaxScrollingOffset: 50,
        }}
        data={post.media_attachments}
        renderItem={({ index }) => {
          const media = post.media_attachments[0]
          const height = media.meta?.original?.width
            ? SCREEN_WIDTH * (media.meta?.original?.height / media.meta?.original.width)
            : 500
          return (
            <FastImage
              style={{
                width: SCREEN_WIDTH,
                height: height,
                backgroundColor: '#000',
                zIndex: -2,
              }}
              source={{ uri: post.media_attachments[index].url }}
              resizeMode={FastImage.resizeMode.contain}
            />
          )
        }}
      />
      <Pagination.Basic
        progress={progress}
        data={post.media_attachments}
        dotStyle={{ backgroundColor: 'rgba(0,0,0,0.16)', borderRadius: 50 }}
        activeDotStyle={{ backgroundColor: '#408DF6', borderRadius: 50 }}
        containerStyle={{ gap: 5, marginTop: 10, marginBottom: -10, zIndex: 5 }}
        size={8}
      />
    </>
  )
}

const PostActions = React.memo(
  ({
    hasLiked,
    hasShared,
    likesCount,
    likedBy,
    sharesCount,
    onOpenComments,
    post,
    handleLike,
    onBookmark,
    hasBookmarked,
  }) => (
    <BorderlessSection>
      <YStack pt="$3" pb="$2" px="$2" gap={10}>
        <XStack gap="$4" justifyContent="space-between">
          <XStack gap="$5">
            <LikeButton hasLiked={hasLiked} handleLike={handleLike} />
            <Pressable onPress={() => onOpenComments()}>
              <Feather name="message-circle" size={30} />
            </Pressable>
            {/* <Feather name="refresh-cw" size={26} /> */}
          </XStack>
          {/* <PressableOpacity onPress={() => onBookmark()}>
            <XStack gap="$4">
              { hasBookmarked ?
                <Ionicons name="bookmark" size={30} /> :
                <Feather name="bookmark" size={30} />
              }
              </XStack>
          </PressableOpacity> */}
        </XStack>
        {likesCount || sharesCount ? (
          <XStack justifyContent="space-between" alignItems="flex-end">
            {likesCount ? (
              likedBy && likesCount > 1 ? (
                <Link href={`/post/likes/${post.id}`}>
                  <Text fontSize="$3">Liked by </Text>
                  <Text fontWeight="bold" fontSize="$3">
                    {enforceLen(likedBy.username, 12, true)}
                  </Text>
                  <Text fontSize="$3"> and </Text>
                  <Text fontWeight="bold" fontSize="$3">
                    {likesCount - 1} {likesCount - 1 > 1 ? 'others' : 'other'}
                  </Text>
                </Link>
              ) : (
                <Link href={`/post/likes/${post.id}`}>
                  <Text fontWeight="bold" fontSize="$3">
                    {likesCount} {likesCount > 1 ? 'Likes' : 'Like'}
                  </Text>
                </Link>
              )
            ) : (
              <View flexGrow={1}></View>
            )}
            {likesCount && sharesCount ? (
              <Link href={`/post/shares/${post.id}`}>
                <Text fontWeight="bold" fontSize="$3">
                  {sharesCount} {sharesCount > 1 ? 'Shares' : 'Share'}
                </Text>
              </Link>
            ) : null}
          </XStack>
        ) : null}
      </YStack>
    </BorderlessSection>
  )
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
    disableReadMore,
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
              />
            ) : (
              <ReadMore numberOfLines={3} renderRevealedFooter={() => <></>}>
                <AutolinkText
                  text={captionText}
                  username={username}
                  onHashtagPress={onHashtagPress}
                  onMentionPress={onMentionPress}
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
}) {
  const bottomSheetModalRef = useRef(null)
  const carouselRef = useRef(null)
  const progress = useSharedValue(0)
  const snapPoints = useMemo(() => ['45%', '50%'], [])
  const [tmpFav, setTmpFav] = useState(false)

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

  const onGotoShare = async () => {
    try {
      const result = await Share.share({
        message: post.url,
      })
    } catch (error) {}
  }

  const handleShowLike = () => {
    if (!post.favourited) {
      setTmpFav(true)
    }
    onLike()
  }

  const onSingleTap = () => {
    if (post.pf_type !== 'photo') {
      return
    }

    goToPost()
  }

  // const singleTap = Gesture.Tap()
  //     .numberOfTaps(1)
  //     .onStart(() => {
  //       runOnJS(onSingleTap)();
  //     });

  // const doubleTap = Gesture.Tap()
  //     .numberOfTaps(2)
  //     .onStart(() => {
  //       runOnJS(handleShowLike)();
  //     });

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
        <PostAlbumMedia
          media={post.media_attachments}
          post={post}
          carouselRef={carouselRef}
          progress={progress}
        />
      ) : post.media_attachments?.length === 1 ? (
        /*<GestureDetector gesture={Gesture.Exclusive(doubleTap, singleTap)}>*/
        <PostMedia media={post.media_attachments} post={post} />
        /*</GestureDetector>*/
      ) : null}
      <PostActions
        hasLiked={post.favourited}
        hasShared={false}
        post={post}
        hasBookmarked={post?.bookmarked}
        likesCount={post.favourites_count}
        likedBy={post.liked_by}
        sharesCount={post.reblogs_count}
        handleLike={() => onLike(post.id, post.favourited)}
        onOpenComments={() => onOpenComments(post.id)}
        onBookmark={() => onBookmark(post.id)}
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
      />
      <BottomSheetModal
        ref={bottomSheetModalRef}
        index={1}
        snapPoints={snapPoints}
        onChange={handleSheetChanges}
        backdropComponent={renderBackdrop}
      >
        <BottomSheetScrollView>
          <YStack p="$5" gap="$3">
            <XStack justifyContent="space-between" gap="$2"></XStack>

            <Group separator={<Separator />}>
              <Group.Item>
                <Button size="$5" justifyContent="start" onPress={() => onGotoShare()}>
                  <XStack alignItems="center" gap="$3">
                    <Feather name="share" size={20} color="#aaa" />
                    <Text fontSize="$5" allowFontScaling={false}>
                      Share
                    </Text>
                  </XStack>
                </Button>
              </Group.Item>
              <Group.Item>
                <Button size="$5" justifyContent="start" onPress={() => openInBrowser()}>
                  <XStack alignItems="center" gap="$3">
                    <Feather name="globe" size={20} color="#aaa" />
                    <Text fontSize="$5" allowFontScaling={false}>
                      Open in browser
                    </Text>
                  </XStack>
                </Button>
              </Group.Item>
              <Group.Item>
                <Button size="$5" justifyContent="start" onPress={() => onGotoAbout()}>
                  <XStack alignItems="center" gap="$3">
                    <Feather name="info" size={20} color="#aaa" />
                    <Text fontSize="$5" allowFontScaling={false}>
                      About this account
                    </Text>
                  </XStack>
                </Button>
              </Group.Item>
            </Group>
            <Group separator={<Separator />}>
              {!isPermalink ? (
                <Group.Item>
                  <Button size="$5" justifyContent="start" onPress={() => goToPost()}>
                    <XStack alignItems="center" gap="$3">
                      <Feather name="arrow-right-circle" size={20} color="#aaa" />
                      <Text fontSize="$5" allowFontScaling={false}>
                        View Post
                      </Text>
                    </XStack>
                  </Button>
                </Group.Item>
              ) : null}
              <Group.Item>
                <Button size="$5" justifyContent="start" onPress={() => goToProfile()}>
                  <XStack alignItems="center" gap="$3">
                    <Feather name="user" size={20} color="#aaa" />
                    <Text fontSize="$5" allowFontScaling={false}>
                      View Profile
                    </Text>
                  </XStack>
                </Button>
              </Group.Item>

              {user && user?.id != post?.account?.id ? (
                <Group.Item>
                  <Button size="$5" justifyContent="start" onPress={() => goToReport()}>
                    <XStack alignItems="center" gap="$3">
                      <Feather name="alert-circle" size={20} color="red" />
                      <Text fontSize="$5" color="$red9" allowFontScaling={false}>
                        Report
                      </Text>
                    </XStack>
                  </Button>
                </Group.Item>
              ) : null}
              {user && user?.id === post?.account?.id ? (
                <Group.Item>
                  <Button
                    size="$5"
                    justifyContent="start"
                    onPress={() => _onDeletePost(post.id)}
                  >
                    <XStack alignItems="center" gap="$3">
                      <Feather name="trash" size={20} color="red" />
                      <Text fontSize="$5" color="$red9" allowFontScaling={false}>
                        Delete Post
                      </Text>
                    </XStack>
                  </Button>
                </Group.Item>
              ) : null}
            </Group>
          </YStack>
        </BottomSheetScrollView>
      </BottomSheetModal>
    </View>
  )
}
