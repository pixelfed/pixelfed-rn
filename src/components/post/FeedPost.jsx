import { Dimensions, Pressable } from 'react-native'
import { Button, Group, Separator, Text, View, XStack, YStack } from 'tamagui'
import { Feather } from '@expo/vector-icons'
import FastImage from 'react-native-fast-image'
import React, { useCallback, useEffect, useMemo, useRef } from 'react'
import { formatTimestamp, openBrowserAsync } from '../../utils'
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
                source={{uri: avatar}}
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
                  {username}
                </Text>
                <Text fontWeight="300" fontSize="$3" color="$gray9">
                  {displayName}
                </Text>
              </YStack>
            </XStack>
          </Pressable>
        </Link>
      </View>
      <Pressable onPress={() => onOpenMenu()}>
        <View px="$3">
          <Feather name="more-horizontal" size={25} />
        </View>
      </Pressable>
    </XStack>
  </Section>
))

const PostMedia = React.memo(({ media, post }) => {
  const mediaUrl = media[0].url
  const height = media[0].meta?.original?.width
    ? SCREEN_WIDTH * (media[0].meta?.original?.height / media[0].meta?.original.width)
    : 430

  if (post.pf_type === 'video') {
    return (
      <View
        flex={1}
        alignItems="center"
        justifyContent="center"
        bg="#000"
        borderBottomWidth={1}
        borderBottomColor="$gray5"
        p="$5"
        minHeight={300}
      >
        {/* temp until video player implemented */}
        <Button
          fontWeight="bold"
          bg="$blue9"
          color="white"
          onPress={() => openBrowserAsync(post.url)}
        >
          View video
        </Button>
      </View>
    )
  }
  return (
    <View flex={1} borderBottomWidth={1} borderBottomColor="$gray5">
      <FastImage
        style={{ width: SCREEN_WIDTH, height: height, backgroundColor: '#000' }}
        source={{uri:mediaUrl}}
        resizeMode={FastImage.resizeMode.contain}
      />
    </View>
  )
})

const PostActions = React.memo(
  ({ hasLiked, hasShared, likesCount, likedBy, sharesCount, onOpenComments, post, handleLike }) => (
    <BorderlessSection>
      <YStack pt="$3" pb="$2" px="$2" gap={10}>
        <XStack gap="$4" justifyContent="space-between">
          <XStack gap="$5">
            <LikeButton
              hasLiked={hasLiked}
              handleLike={handleLike}
            />
            <Pressable onPress={() => onOpenComments()}>
              <Feather name="message-circle" size={26} />
            </Pressable>
            <Feather name="refresh-cw" size={26} />
          </XStack>
          <XStack gap="$4">
            <Feather name="bookmark" size={26} />
          </XStack>
        </XStack>
        { likesCount || sharesCount ?
        <XStack justifyContent="space-between">
          {likesCount ? (
            likedBy && likesCount > 1 ? (
              <Link href={`/post/likes/${post.id}`}>
                <XStack>
                  <Text fontSize="$3">Liked by </Text>
                  <Text fontWeight="bold" fontSize="$3">
                    {likedBy.username}
                  </Text>
                  <Text fontSize="$3"> and </Text>
                  <Text fontWeight="bold" fontSize="$3">
                    {likesCount - 1} {likesCount - 1 > 1 ? 'others' : 'other'}
                  </Text>
                </XStack>
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
            <Text fontWeight="bold" fontSize="$3">
              {sharesCount} {sharesCount > 1 ? 'Shares' : 'Share'}
            </Text>
          ) : null}
        </XStack> : null }
      </YStack>
    </BorderlessSection>
  )
)

const PostCaption = React.memo(
  ({ postId, username, caption, commentsCount, createdAt, tags, onOpenComments }) => {
    const timeAgo = formatTimestamp(createdAt)
    return (
      <BorderlessSection>
        <YStack gap="$3" pt="$1" pb="$3" px="$2">
          <XStack flexWrap="wrap" pr="$3">
              <Text
                fontSize="$5"
                selectable={true}
                multiline
                editable={false}
                suppressHighlighting={false}
                >
                <Text fontWeight="bold">{username}</Text> {caption?.replaceAll('\n\n', ' ')}
              </Text>
          </XStack>
          <XStack mt={-5} gap={5} flexWrap="wrap">
            { tags && tags.map((tag, idx) => (
              <Link key={tag.name} href={`/hashtag/${tag.name}`}>
                <View key={tag.name} bg="$gray3" p={5} borderRadius={5}>
                  <Text fontSize="$3" fontWeight="300">
                    #{tag.name}
                  </Text>
                </View>
              </Link>
            ))}
          </XStack>
          {commentsCount ? (
            <Pressable onPress={() => onOpenComments()}>
              <Text color="$gray10" fontSize="$3">
                View all {commentsCount} comments
              </Text>
            </Pressable>
          ) : null}
          <Link href={`/post/${postId}`}>
            <XStack alignItems="center" gap="$2">
              <Feather name="clock" color="#ccc" />
              <Text color="$gray9" fontSize="$3">
                {timeAgo}
              </Text>
              
            </XStack>
          </Link>
        </YStack>
      </BorderlessSection>
    )
  }
)

export default function FeedPost({ post, user, onOpenComments }) {
  const bottomSheetModalRef = useRef(null)
  const carouselRef = useRef(null)
  const progress = useSharedValue(0)
  // variables
  const snapPoints = useMemo(() => ['45%', '50%'], [])

  // callbacks
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

  const handleLike = async (id) => {
    console.log('like ' + id)
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
        <>
          <Carousel
            ref={carouselRef}
            width={SCREEN_WIDTH}
            onProgressChange={progress}
            height={SCREEN_WIDTH / 2}
            data={post.media_attachments}
            renderItem={({ index }) => {
              const media = post.media_attachments[0]
              const height = media.meta?.original?.width
                ? SCREEN_WIDTH *
                  (media.meta?.original?.height / media.meta?.original.width)
                : 430
              return (
                <View
                  style={{
                    flex: 1,
                    borderBottomWidth: 1,
                    borderColor: '#eee',
                    justifyContent: 'center',
                  }}
                >
                  <FastImage
                    style={{
                      width: SCREEN_WIDTH,
                      height: height,
                      backgroundColor: '#000',
                    }}
                    source={{uri:post.media_attachments[index].url}}
                    resizeMode={FastImage.resizeMode.contain}
                  />
                </View>
              )
            }}
          />
          <Pagination.Basic
            progress={progress}
            data={post.media_attachments}
            dotStyle={{ backgroundColor: 'rgba(0,0,0,0.16)', borderRadius: 50 }}
            activeDotStyle={{ backgroundColor: '#408DF6', borderRadius: 50 }}
            containerStyle={{ gap: 5, marginTop: 10, marginBottom: 0, zIndex: 3 }}
            size={8}
          />
        </>
      ) : post.media_attachments?.length === 1 ? (
        <PostMedia media={post.media_attachments} post={post} />
      ) : null}
      <PostActions
        hasLiked={false}
        hasShared={false}
        post={post}
        likesCount={post.favourites_count}
        likedBy={post.liked_by}
        sharesCount={post.reblogs_count}
        handleLike={() => handleLike(post.id)}
        onOpenComments={() => onOpenComments(post.id)}
      />
      <PostCaption
        postId={post.id}
        username={post.account?.username}
        caption={post.content_text}
        commentsCount={post.reply_count}
        createdAt={post.created_at}
        tags={post.tags}
        onOpenComments={() => onOpenComments(post.id)}
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
            <XStack justifyContent="space-between" gap="$2">
              <Button py="$3" w={100} h={70}>
                <YStack justifyContent="center" alignItems="center" gap="$2">
                  <Feather name="share" size={20} />
                  <Text>Share</Text>
                </YStack>
              </Button>
              <Button py="$3" h={70} flexGrow={1}>
                <YStack justifyContent="center" alignItems="center" gap="$2">
                  <Feather name="plus" size={20} />
                  <Text>Add</Text>
                </YStack>
              </Button>
              {/* { user && user?.id != post?.account.id ? <Button py="$3" h={70} flexGrow={1}>
                <YStack justifyContent='center' alignItems='center' gap="$2">
                  <Feather name="link" size={20} />
                  <Text>Report</Text>
                </YStack>
              </Button> : null } */}
              {user?.is_admin ? (
                <Button py="$3" w={100} h={70}>
                  <YStack justifyContent="center" alignItems="center" gap="$2">
                    <Feather name="shield" size={20} />
                    <Text>Moderate</Text>
                  </YStack>
                </Button>
              ) : null}
            </XStack>

            <Button onPress={() => openInBrowser()} size="$5" justifyContent="start">
              <XStack alignItems="center" gap="$3">
                <Feather name="link-2" size={20} color="#999" />
                <Text fontSize="$5">Open in browser</Text>
              </XStack>
            </Button>

            {/* <Button size="$5" justifyContent="start">
              <XStack alignItems="center" gap="$3">
                <Feather name="file-text" size={20} color="#999" />
                <Text fontSize="$5">Photo and location details</Text>
              </XStack>
            </Button> */}
            
            {/* <XStack gap="$2">

              <Button flexGrow={1} size="$5" justifyContent="start">
                <XStack alignItems="center" gap="$3">
                  <Feather name="thumbs-down" size={20} color="#999" />
                  <Text fontSize="$5">Not interested</Text>
                </XStack>
              </Button>

              <Button size="$5" justifyContent="start">
                <XStack alignItems="center" gap="$3">
                  <Feather name="info" size={20} color="#999" />
                  <Text fontSize="$5">About this account</Text>
                </XStack>
              </Button>
            </XStack> */}

            <Group separator={<Separator />}>
              <Group.Item>
                <Button size="$5" justifyContent="start" onPress={() => goToPost()}>
                  <XStack alignItems="center" gap="$3">
                    <Feather name="arrow-right-circle" size={20} color="#999" />
                    <Text fontSize="$5">View Post</Text>
                  </XStack>
                </Button>
              </Group.Item>
              <Group.Item>
                <Button size="$5" justifyContent="start" onPress={() => goToProfile()}>
                  <XStack alignItems="center" gap="$3">
                    <Feather name="arrow-right-circle" size={20} color="#999" />
                    <Text fontSize="$5">View Profile</Text>
                  </XStack>
                </Button>
              </Group.Item>
              {user && user?.id != post?.account?.id ? (
                <Group.Item>
                  <Button size="$5" justifyContent="start" onPress={() => goToReport()}>
                    <XStack alignItems="center" gap="$3">
                      <Feather name="alert-circle" size={20} color="red" />
                      <Text fontSize="$5" color="$red9">
                        Report
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
