import { useCallback, useEffect, useState, useRef, useMemo } from 'react'
import { FlatList, StyleSheet, Pressable, ActivityIndicator } from 'react-native'
import { Text, View, XStack, Select, Adapt, Sheet, Button, Spinner } from 'tamagui'
import FeedPost from 'src/components/post/FeedPost'
import { StatusBar } from 'expo-status-bar'
import { Feather } from '@expo/vector-icons'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Link, Stack, useLocalSearchParams, useNavigation, useRouter } from 'expo-router'
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import {
  fetchHomeFeed,
  likeStatus,
  unlikeStatus,
  deleteStatusV1,
  postBookmark,
  getSelfAccount,
  reblogStatus,
  unreblogStatus,
  getStoryCarousel,
  getConfig,
} from 'src/lib/api'
import FeedHeader from 'src/components/common/FeedHeader'
import EmptyFeed from 'src/components/common/EmptyFeed'
import { Storage } from 'src/state/cache'
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetBackdrop,
  BottomSheetFooter,
  BottomSheetTextInput,
} from '@gorhom/bottom-sheet'
import CommentFeed from 'src/components/post/CommentFeed'
import { useShareIntentContext } from 'expo-share-intent'
import UserAvatar from 'src/components/common/UserAvatar'
import { useVideo } from 'src/hooks/useVideoProvider'
import { useFocusEffect } from '@react-navigation/native'
import PixelfedStories from 'src/components/stories'
import { _timeAgo } from 'src/utils'
import * as Burnt from 'burnt'

export function ErrorBoundary(props: ErrorBoundaryProps) {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',
      }}
    >
      <Text fontSize="$8" allowFontScaling={false} color="red">
        Something went wrong!
      </Text>
      <Text>{props.error?.message}</Text>
      <Text onPress={props.retry}>Try Again?</Text>
    </View>
  )
}

export default function HomeScreen() {
  const router = useRouter()
  const navigation = useNavigation()
  const flatListRef = useRef(null)
  const queryClient = useQueryClient()
  const { hasShareIntent } = useShareIntentContext()
  const params = useLocalSearchParams()
  const [isPosting, setIsPosting] = useState(false)
  const [storyLoadError, setStoryError] = useState('')
  const hideStories = Storage.getBoolean('ui.hideStories') == true

  useEffect(() => {
    if (hasShareIntent) {
      router.navigate('camera')
    }
  }, [hasShareIntent])

  useEffect(() => {
    if (params.ref30 === '1') {
      setIsPosting(true)
    }
    const timer = setTimeout(() => {
      if (params.ref30 === '1') {
        queryClient.invalidateQueries({ queryKey: ['homeFeed'] })
        router.setParams()
        setIsPosting(false)
      }
    }, 10000)

    return () => clearTimeout(timer)
  }, [params.ref30])

  useFocusEffect(
    useCallback(() => {
      const unsubscribe = navigation.addListener('tabPress', () => {
        flatListRef.current?.scrollToOffset({ animated: true, offset: 0 })
      })

      return unsubscribe
    }, [navigation])
  )

  const [replyId, setReplyId] = useState(null)
  const [sheetType, setSheetType] = useState('comments')
  const bottomSheetModalRef = useRef<BottomSheetModal>(null)
  const snapPoints = useMemo(() => ['50%', '70%'], [])

  const sref = useRef(null)

  const handlePresentModalPress = useCallback(() => {
    bottomSheetModalRef.current?.present()
  }, [])
  const handleSheetChanges = useCallback((index: number) => {}, [])
  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={1} />
    ),
    []
  )

  const onOpenComments = useCallback(
    (id) => {
      setReplyId(id)
      bottomSheetModalRef.current?.present()
    },
    [replyId]
  )

  const userJson = Storage.getString('user.profile')
  const user = JSON.parse(userJson)
  const { playVideo, currentVideoId } = useVideo()

  const onViewRef = useCallback(
    ({ viewableItems }) => {
      const visibleVideoId = viewableItems.find((item) => item.isViewable)?.item.id
      if (visibleVideoId && visibleVideoId !== currentVideoId) {
        // enable for autoplay
        // playVideo(visibleVideoId);
        playVideo(null)
      } else if (!visibleVideoId) {
        playVideo(null)
      }
    },
    [currentVideoId, playVideo]
  )

  const viewConfigRef = useRef({ viewAreaCoveragePercentThreshold: 50 })

  const renderItem = useCallback(
    ({ item }) => (
      <FeedPost
        post={item}
        user={user}
        onOpenComments={() => onOpenComments(item.id)}
        onLike={() => handleLike(item.id, item.favourited)}
        onDeletePost={() => onDeletePost(item.id)}
        onBookmark={() => onBookmark(item.id)}
        onShare={() => onShare(item.id, item.reblogged)}
      />
    ),
    [user]
  )

  const keyExtractor = useCallback((item) => item?.id, [])

  const onDeletePost = (id) => {
    deletePostMutation.mutate(id)
  }

  const deletePostMutation = useMutation({
    mutationFn: async (id) => {
      return await deleteStatusV1(id)
    },
    onSuccess: (data, variables) => {
      queryClient.setQueryData(['homeFeed'], (oldData) => {
        if (!oldData) return oldData

        const updatedPages = oldData.pages.map((page) => ({
          ...page,
          data: page.data.filter((post) => post.id != variables),
        }))

        return { ...oldData, pages: updatedPages }
      })
    },
  })

  const bookmarkMutation = useMutation({
    mutationFn: async (id) => {
      return await postBookmark(id)
    },
  })

  const onBookmark = (id) => {
    bookmarkMutation.mutate(id)
  }

  const onShare = (id, state) => {
    shareMutation.mutate({ type: state == true ? 'unreblog' : 'reblog', id: id })
  }

  const shareMutation = useMutation({
    mutationFn: async (handleShare) => {
      return handleShare.type === 'reblog'
        ? await reblogStatus(handleShare)
        : await unreblogStatus(handleShare)
    },
  })

  const likeMutation = useMutation({
    mutationFn: async (handleLike) => {
      return handleLike.type === 'like'
        ? await likeStatus(handleLike)
        : await unlikeStatus(handleLike)
    },
  })

  const handleLike = async (id, state) => {
    likeMutation.mutate({ type: state ? 'unlike' : 'like', id: id })
  }

  const handleShowLikes = (id) => {
    bottomSheetModalRef.current?.close()
    router.push(`/post/likes/${id}`)
  }

  const handleGotoProfile = (id) => {
    bottomSheetModalRef.current?.close()
    router.push(`/profile/${id}`)
  }

  const handleGotoUsernameProfile = (id) => {
    bottomSheetModalRef.current?.close()
    router.push(`/profile/0?byUsername=${id}`)
  }

  const gotoHashtag = (id) => {
    bottomSheetModalRef.current?.close()
    router.push(`/hashtag/${id}`)
  }

  const handleCommentReport = (id) => {
    bottomSheetModalRef.current?.close()
    router.push(`/post/report/${id}`)
  }

  const { data: serverConfig } = useQuery({
    queryKey: ['getConfig'],
    queryFn: getConfig,
  })

  const validConfig = serverConfig?.version
  const storiesEnabled = hideStories === false && serverConfig?.features?.stories

  const { data: userSelf } = useQuery({
    queryKey: ['getSelfAccount'],
    queryFn: async () => {
      const res = await getSelfAccount()
      return res
    },
    enabled: !!validConfig,
  })

  useEffect(() => {
    if (storyLoadError === 'error') {
      Burnt.alert({
        title: 'Error loading stories',
        preset: 'custom',
        message: 'Please try again later!',
        duration: 2.5,
        layout: {
          iconSize: {
            height: 50,
            width: 50,
          },
        },
        icon: {
          ios: {
            name: 'exclamationmark.triangle',
            color: 'red',
          },
        },
      })
    }
  }, [storyLoadError])

  const userId = userSelf?.id

  const {
    data,
    fetchNextPage,
    fetchPreviousPage,
    hasNextPage,
    hasPreviousPage,
    isFetchingNextPage,
    isRefetching,
    refetch,
    isFetching,
    status,
    isError,
    error,
  } = useInfiniteQuery({
    queryKey: ['homeFeed'],
    queryFn: fetchHomeFeed,
    initialPageParam: -1,
    enabled: !!validConfig && !!userId,
    refetchOnWindowFocus: false,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    getPreviousPageParam: (lastPage) => lastPage.prevPage,
  })

  const {
    data: stories,
    isFetching: storiesFetching,
    error: storyError,
  } = useQuery({
    queryKey: ['storyCarousel'],
    queryFn: async () => {
      try {
        const storiesRes = await getStoryCarousel()
        if (!storiesRes || !storiesRes.nodes || !Array.isArray(storiesRes.nodes)) {
          throw new Error('Invalid API response format for stories')
        }

        const storyFmt = storiesRes.nodes.map((sry) => ({
          id: sry.id,
          username: sry.user.username,
          avatar: sry.user.avatar,
          stories: sry.nodes.map((snode) => ({
            id: snode.id,
            source: { uri: snode.src },
            username: sry.user.username,
            mediaType: snode.type,
            duration: snode.duration,
            createdAt: _timeAgo(snode.created_at),
          })),
        }))

        return storyFmt
      } catch (error) {
        console.error('Error fetching stories:', error)
        setStoryError('error')
        throw error
      }
    },
    enabled:
      !!validConfig && !!storiesEnabled && storiesEnabled && data && status === 'success',
    retry: 2,
    retryDelay: 5000,
  })

  const RenderStories = useCallback(() => {
    return hideStories === false && stories && stories.length ? (
      <PixelfedStories
        stories={stories}
        avatarListContainerStyle={{ padding: 10, gap: 10 }}
        modalAnimationDuration={300}
      />
    ) : null
  }, [storiesFetching, stories, hideStories])

  if (isFetching && !isFetchingNextPage && !isRefetching) {
    return (
      <View flexGrow={1} mt="$5" py="$5" justifyContent="center" alignItems="center">
        <ActivityIndicator color={'#000'} />
      </View>
    )
  }

  if (isError && error) {
    return (
      <View flexGrow={1}>
        <Text>Error</Text>
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />
      <Stack.Screen options={{ headerShown: false }} />
      <FeedHeader title="Pixelfed" user={user} />
      {isPosting ? (
        <View p="$5">
          <XStack gap="$3">
            <Spinner />
            <Text fontSize="$5" allowFontScaling={false}>
              Uploading new post, please wait...
            </Text>
          </XStack>
        </View>
      ) : null}
      <BottomSheetModal
        ref={bottomSheetModalRef}
        index={1}
        snapPoints={snapPoints}
        onChange={handleSheetChanges}
        backdropComponent={renderBackdrop}
        keyboardBehavior={'extend'}
      >
        {sheetType === 'comments' ? (
          <CommentFeed
            id={replyId}
            showLikes={handleShowLikes}
            gotoProfile={handleGotoProfile}
            gotoUsernameProfile={handleGotoUsernameProfile}
            gotoHashtag={gotoHashtag}
            user={user}
            handleReport={handleCommentReport}
          />
        ) : null}
        {/* {sheetType === 'welcome' ? <Welcome onContinue={handleOnContinue} /> : null} */}
      </BottomSheetModal>
      <FlatList
        ref={flatListRef}
        data={data?.pages.flatMap((page) => page.data)}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        maxToRenderPerBatch={3}
        refreshing={isRefetching}
        onRefresh={refetch}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={status === 'success' ? <EmptyFeed /> : null}
        onViewableItemsChanged={onViewRef}
        viewabilityConfig={viewConfigRef.current}
        onEndReached={() => {
          if (hasNextPage && !isFetching && !isFetchingNextPage) fetchNextPage()
        }}
        onEndReachedThreshold={0.5}
        ListHeaderComponent={() => <RenderStories />}
        ListFooterComponent={() => (isFetchingNextPage ? <ActivityIndicator /> : null)}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  input: {
    flexShrink: 1,
    margin: 10,
    alignItems: 'center',
    borderRadius: 10,
    fontSize: 20,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(151, 151, 151, 0.25)',
    backgroundColor: 'rgba(151, 151, 151, 0.05)',
  },
  footerContainer: {
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  footerText: {
    textAlign: 'center',
    color: 'white',
    fontWeight: '800',
  },
})
