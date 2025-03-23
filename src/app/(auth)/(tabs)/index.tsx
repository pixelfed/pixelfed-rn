import { useFocusEffect } from '@react-navigation/native'
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { Stack, useLocalSearchParams, useNavigation, useRouter } from 'expo-router'
import type { ErrorBoundaryProps } from 'expo-router'
import { useShareIntentContext } from 'expo-share-intent'
import { StatusBar } from 'expo-status-bar'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  ActivityIndicator,
  FlatList,
  type ListRenderItemInfo,
  StyleSheet,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import EmptyFeed from 'src/components/common/EmptyFeed'
import ErrorFeed from 'src/components/common/ErrorFeed'
import FeedHeader from 'src/components/common/FeedHeader'
import FeedPost from 'src/components/post/FeedPost'
import { useVideo } from 'src/hooks/useVideoProvider'
import {
  deleteStatusV1,
  fetchHomeFeed,
  getSelfAccount,
  reblogStatus,
  unreblogStatus,
} from 'src/lib/api'
import type { Status } from 'src/lib/api-types'
import { useUserCache } from 'src/state/AuthProvider'
import { Button, Spinner, Text, View, XStack, YStack, useTheme } from 'tamagui'

export function ErrorBoundary(props: ErrorBoundaryProps) {
  const theme = useTheme()
  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 30,
        backgroundColor: theme.background?.val.default.val,
      }}
    >
      <Text fontSize="$8" allowFontScaling={false} color="red">
        Something went wrong!
      </Text>
      <Text color={theme.color?.val.default.val}>{props.error?.message}</Text>
      <Button
        theme="blue"
        size="$4"
        bg={theme.colorHover.val.hover.val}
        onPress={props.retry}
      >
        Try Again
      </Button>
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
  const theme = useTheme()

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
        refetch()
      })

      return unsubscribe
    }, [navigation])
  )

  const onOpenComments = (id: string) => {
    router.push(`/post/comments/${id}`)
  }

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

  const keyExtractor = useCallback((item) => item?.id, [])

  const onDeletePost = (id: string) => {
    deletePostMutation.mutate(id)
  }

  const deletePostMutation = useMutation({
    mutationFn: async (id: string) => {
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

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<Status>) => (
      <FeedPost
        key={`homep-${item.id}`}
        post={item}
        user={user}
        onOpenComments={() => onOpenComments(item.id)}
        onDeletePost={() => onDeletePost(item.id)}
        onShare={() => onShare(item.id, item.reblogged)}
      />
    ),
    [user, onOpenComments, onDeletePost, onShare]
  )

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
    isFetchingPreviousPage,
    isRefetching,
    refetch,
    isFetching,
    status,
    isError,
    error,
  } = useInfiniteQuery({
    queryKey: ['homeFeed'],
    queryFn: fetchHomeFeed,
    initialPageParam: 0,
    refetchOnWindowFocus: false,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    getPreviousPageParam: (lastPage) => lastPage.prevPage,
  })
  if (isFetching && !isFetchingNextPage && !isFetchingPreviousPage && !isRefetching) {
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

  const renderFeed = (data: Array<Status>) => {
    return (
      <FlatList
        ref={flatListRef}
        data={data}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        maxToRenderPerBatch={3}
        windowSize={5}
        removeClippedSubviews={true}
        initialNumToRender={5}
        updateCellsBatchingPeriod={50}
        refreshing={isRefetching}
        onRefresh={refetch}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={status === 'success' ? <EmptyFeed /> : <ErrorFeed />}
        onViewableItemsChanged={onViewRef}
        viewabilityConfig={viewConfigRef.current}
        onEndReached={() => {
          if (hasNextPage && !isFetching && !isFetchingNextPage) fetchNextPage()
        }}
        onEndReachedThreshold={0.5}
        ListFooterComponent={() => (isFetchingNextPage ? <ActivityIndicator /> : null)}
      />
    )
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background.val }]}
      edges={['top']}
    >
      <Stack.Screen options={{ headerShown: false }} />
      <FeedHeader title="Pixelfed" user={user} />
      {isPosting ? (
        <View p="$5">
          <XStack gap="$3">
            <Spinner color={theme.color?.val.default.val} />
            <Text
              fontSize="$5"
              allowFontScaling={false}
              color={theme.color?.val.default.val}
            >
              Uploading new post, please wait...
            </Text>
          </XStack>
        </View>
      ) : null}
      {renderFeed(data?.pages.flatMap((page) => page.data))}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
