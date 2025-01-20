import { useCallback, useState, useRef, useMemo } from 'react'
import { FlatList, StyleSheet, ActivityIndicator, Platform } from 'react-native'
import { Text, View } from 'tamagui'
import FeedPost from 'src/components/post/FeedPost'
import { StatusBar } from 'expo-status-bar'
import { SafeAreaView } from 'react-native-safe-area-context'
import { type ErrorBoundaryProps, Stack, useNavigation, useRouter } from 'expo-router'
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import {
  fetchNetworkFeed,
  deleteStatusV1,
  postBookmark,
  getSelfAccount,
  reblogStatus,
  unreblogStatus,
} from 'src/lib/api'
import FeedHeader from 'src/components/common/FeedHeader'
import EmptyFeed from 'src/components/common/EmptyFeed'
import { BottomSheetModal, BottomSheetBackdrop } from '@gorhom/bottom-sheet'
import CommentFeed from 'src/components/post/CommentFeed'
import { useVideo } from 'src/hooks/useVideoProvider'
import { useFocusEffect } from '@react-navigation/native'
import { useLikeMutation } from 'src/hooks/mutations/useLikeMutation'
import { useUserCache } from 'src/state/AuthProvider'

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

  useFocusEffect(
    useCallback(() => {
      const unsubscribe = navigation.addListener('tabPress', () => {
        flatListRef.current?.scrollToOffset({ animated: true, offset: 0 })
      })

      return unsubscribe
    }, [navigation])
  )

  const [replyId, setReplyId] = useState(null)
  const bottomSheetModalRef = useRef<BottomSheetModal>(null)
  const snapPoints = useMemo(
    () => (Platform.OS === 'ios' ? ['50%', '70%', '90%'] : ['64%', '65%', '66%']),
    []
  )

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

  const user = useUserCache()
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

  const onDeletePost = (id: string) => {
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

  const onBookmark = (id: string) => {
    bookmarkMutation.mutate(id)
  }

  const onShare = (id: string, state) => {
    try {
      shareMutation.mutate({ type: state == true ? 'unreblog' : 'reblog', id: id })
    } catch (error) {
      console.error('Error occurred during share:', error)
    }
  }

  const shareMutation = useMutation({
    mutationFn: async (handleShare) => {
      try {
        return handleShare.type === 'reblog'
          ? await reblogStatus(handleShare)
          : await unreblogStatus(handleShare)
      } catch (error) {
        console.error('Error within mutationFn:', error)
        throw error
      }
    },
    onError: (error) => {
      console.error('Error handled by share useMutation:', error)
    },
  })

  const { handleLike } = useLikeMutation()

  const handleShowLikes = (id: string) => {
    bottomSheetModalRef.current?.close()
    router.push(`/post/likes/${id}`)
  }

  const handleGotoProfile = (id: string) => {
    bottomSheetModalRef.current?.close()
    router.push(`/profile/${id}`)
  }

  const handleGotoUsernameProfile = (id: string) => {
    bottomSheetModalRef.current?.close()
    router.push(`/profile/0?byUsername=${id}`)
  }

  const gotoHashtag = (id: string) => {
    bottomSheetModalRef.current?.close()
    router.push(`/hashtag/${id}`)
  }

  const handleCommentReport = (id: string) => {
    bottomSheetModalRef.current?.close()
    router.push(`/post/report/${id}`)
  }

  const { data: userSelf } = useQuery({
    queryKey: ['getSelfAccount'],
    queryFn: getSelfAccount,
  })

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
    isError,
    error,
  } = useInfiniteQuery({
    queryKey: ['fetchNetworkFeed'],
    queryFn: fetchNetworkFeed,
    initialPageParam: 0,
    enabled: !!userId,
    refetchOnWindowFocus: false,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    getPreviousPageParam: (lastPage) => lastPage.prevPage,
  })

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
      <FeedHeader title="Local Feed" user={user} />

      <BottomSheetModal
        ref={bottomSheetModalRef}
        snapPoints={snapPoints}
        onChange={handleSheetChanges}
        backdropComponent={renderBackdrop}
        index={Platform.OS === 'ios' ? 2 : 0}
        keyboardBehavior={Platform.OS === 'ios' ? 'extend' : 'interactive'}
        android_keyboardInputMode="adjustResize"
      >
        <CommentFeed
          id={replyId}
          showLikes={handleShowLikes}
          gotoProfile={handleGotoProfile}
          gotoUsernameProfile={handleGotoUsernameProfile}
          gotoHashtag={gotoHashtag}
          user={user}
          handleReport={handleCommentReport}
        />
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
