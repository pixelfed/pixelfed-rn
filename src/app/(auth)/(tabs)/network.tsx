import { useCallback, useEffect, useState, useRef, useMemo } from 'react'
import { FlatList, StyleSheet, Pressable, ActivityIndicator } from 'react-native'
import { Text, View, XStack, Select, Adapt, Sheet, Button, YStack } from 'tamagui'
import FeedPost from 'src/components/post/FeedPost'
import { StatusBar } from 'expo-status-bar'
import { Feather } from '@expo/vector-icons'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Link, Stack, useRouter } from 'expo-router'
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchNetworkFeed,
  likeStatus,
  unlikeStatus,
  deleteStatusV1,
  postBookmark,
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
import UserAvatar from 'src/components/common/UserAvatar'
import { useVideo } from 'src/hooks/useVideoProvider'

export default function HomeScreen() {
  const router = useRouter()
  const queryClient = useQueryClient()

  const [replyId, setReplyId] = useState(null)
  const [sheetType, setSheetType] = useState('comments')
  const bottomSheetModalRef = useRef<BottomSheetModal>(null)
  const snapPoints = useMemo(() => ['55%', '80%'], [])

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
        onOpenComments={() => onOpenComments}
        onLike={() => handleLike}
        onDeletePost={() => onDeletePost}
        onBookmark={() => onBookmark(item.id)}
      />
    ),
    [data]
  )

  const keyExtractor = useCallback((item) => item.id.toString(), [])

  const onBookmark = (id) => {
    bookmarkMutation.mutate(id)
  }

  const onDeletePost = (id) => {
    deletePostMutation.mutate(id)
  }

  const deletePostMutation = useMutation({
    mutationFn: async (id) => {
      return await deleteStatusV1(id)
    },
    onSuccess: (data, variables) => {
      queryClient.setQueryData(['fetchNetworkFeed'], (oldData) => {
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

  const likeMutation = useMutation({
    mutationFn: async (handleLike) => {
      return handleLike.type === 'like'
        ? await likeStatus(handleLike)
        : await unlikeStatus(handleLike)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fetchNetworkFeed'] })
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
    isError,
    error,
  } = useInfiniteQuery({
    queryKey: ['fetchNetworkFeed'],
    initialPageParam: null,
    queryFn: fetchNetworkFeed,
    refetchOnWindowFocus: false,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    getPreviousPageParam: (lastPage) => lastPage.prevPage,
  })

  if (isFetching && !isFetchingNextPage && !isRefetching) {
    return (
      <View flexGrow={1} mt="$5">
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
      <FeedHeader title="Network" />
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
      </BottomSheetModal>
      <FlatList
        data={data?.pages.flatMap((page) => page.data)}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        maxToRenderPerBatch={3}
        refreshing={isRefetching}
        onRefresh={refetch}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<EmptyFeed />}
        onViewableItemsChanged={onViewRef}
        viewabilityConfig={viewConfigRef.current}
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) fetchNextPage()
        }}
        onEndReachedThreshold={0.5}
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
