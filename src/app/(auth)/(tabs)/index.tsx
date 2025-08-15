import { useFocusEffect } from '@react-navigation/native'
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { ErrorBoundaryProps } from 'expo-router'
import { Stack, useLocalSearchParams, useNavigation, useRouter } from 'expo-router'
import { useShareIntentContext } from 'expo-share-intent'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
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
  favouriteStatus,
  fetchHomeFeed,
  reblogStatus,
  unfavouriteStatus,
  unreblogStatus,
} from 'src/lib/api'
import type { Status } from 'src/lib/api-types'
import { useUserCache } from 'src/state/AuthProvider'
import { Button, Spinner, Text, useTheme, View, XStack } from 'tamagui'

const VIEW_CONFIG = { viewAreaCoveragePercentThreshold: 50 }
const FLAT_LIST_OPTIMIZATION = {
  maxToRenderPerBatch: 3,
  windowSize: 5,
  initialNumToRender: 3,
  updateCellsBatchingPeriod: 50,
  removeClippedSubviews: true,
  disableVirtualization: false,
  legacyImplementation: false,
}

const MemoizedFeedPost = React.memo(FeedPost, (prevProps, nextProps) => {
  return (
    prevProps.post.id === nextProps.post.id &&
    prevProps.user?.id === nextProps.user?.id &&
    prevProps.post.reblogged === nextProps.post.reblogged &&
    prevProps.post.favourited === nextProps.post.favourited &&
    prevProps.post.favourites_count === nextProps.post.favourites_count &&
    prevProps.post.reblogs_count === nextProps.post.reblogs_count
  )
})

const keyExtractor = (item: Status) => item?.id || ''

const LoadingIndicator = React.memo(({ color }: { color: string }) => (
  <View flexGrow={1} mt="$5" py="$5" justifyContent="center" alignItems="center">
    <ActivityIndicator color={color} />
  </View>
))

const FooterLoader = React.memo(() => <ActivityIndicator />)

const EmptyComponent = () => null

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
      <Text fontSize="$8" allowFontScaling={false} color={theme.color?.val.default.val}>
        Something went wrong!
      </Text>
      <Text color={theme.color?.val.default.val}>{props.error?.message}</Text>
      <Button
        size="$4"
        color={theme.color?.val.default.val}
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
  const flatListRef = useRef<FlatList>(null)
  const queryClient = useQueryClient()
  const { hasShareIntent } = useShareIntentContext()
  const params = useLocalSearchParams()
  const [isPosting, setIsPosting] = useState(false)
  const theme = useTheme()
  const user = useUserCache()
  const { playVideo, currentVideoId } = useVideo()

  useEffect(() => {
    if (hasShareIntent) {
      router.navigate('camera')
    }
  }, [hasShareIntent, router])

  useEffect(() => {
    if (params.ref30 === '1') {
      setIsPosting(true)
      const timer = setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['homeFeed'] })
        router.setParams()
        setIsPosting(false)
      }, 10000)

      return () => clearTimeout(timer)
    }
  }, [params.ref30, queryClient, router])

  useFocusEffect(
    useCallback(() => {
      const unsubscribe = navigation.addListener('tabPress', () => {
        flatListRef.current?.scrollToOffset({ animated: true, offset: 0 })
        refetch()
      })
      return unsubscribe
    }, [navigation])
  )

  const {
    data,
    fetchNextPage,
    hasNextPage,
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
    initialPageParam: 0,
    refetchOnWindowFocus: false,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    getPreviousPageParam: (lastPage) => lastPage.prevPage,
  })

  const deletePostMutation = useMutation({
    mutationFn: deleteStatusV1,
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: ['homeFeed'] })

      queryClient.setQueryData(['homeFeed'], (oldData: any) => {
        if (!oldData) return oldData

        return {
          ...oldData,
          pages: oldData.pages.map((page: any) => ({
            ...page,
            data: page.data.filter((post: Status) => post.id !== id),
          })),
        }
      })
    },
  })

  const likeMutation = useMutation({
    mutationFn: async ({ id, isLiked }: { id: string; isLiked: boolean }) => {
      return isLiked ? await unfavouriteStatus(id) : await favouriteStatus(id)
    },
    onMutate: async ({ id, isLiked }) => {
      await queryClient.cancelQueries({ queryKey: ['homeFeed'] })

      const previousData = queryClient.getQueryData(['homeFeed'])

      queryClient.setQueryData(['homeFeed'], (oldData: any) => {
        if (!oldData) return oldData

        return {
          ...oldData,
          pages: oldData.pages.map((page: any) => ({
            ...page,
            data: page.data.map((post: Status) => {
              if (post.id == id) {
                return {
                  ...post,
                  favourited: !!isLiked,
                  favourites_count: isLiked
                    ? Math.max(0, (post.favourites_count || 0) - 1)
                    : (post.favourites_count || 0) + 1,
                }
              }
              return post
            }),
          })),
        }
      })

      return { previousData }
    },
    onError: (_error, _variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(['homeFeed'], context.previousData)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['homeFeed'] })
    },
  })

  const shareMutation = useMutation({
    mutationFn: async ({ id, isShared }: { id: string; isShared: boolean }) => {
      return isShared ? await unreblogStatus(id) : await reblogStatus(id)
    },
    onMutate: async ({ id, isShared }) => {
      await queryClient.cancelQueries({ queryKey: ['homeFeed'] })

      const previousData = queryClient.getQueryData(['homeFeed'])

      queryClient.setQueryData(['homeFeed'], (oldData: any) => {
        if (!oldData) return oldData

        return {
          ...oldData,
          pages: oldData.pages.map((page: any) => ({
            ...page,
            data: page.data.map((post: Status) => {
              if (post.id === id) {
                return {
                  ...post,
                  reblogged: !isShared,
                  reblogs_count: isShared
                    ? Math.max(0, (post.reblogs_count || 0) - 1)
                    : (post.reblogs_count || 0) + 1,
                }
              }
              return post
            }),
          })),
        }
      })

      return { previousData }
    },
    onError: (_error, _variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(['homeFeed'], context.previousData)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['homeFeed'] })
    },
  })

  const onOpenComments = useCallback(
    (id: string) => {
      router.push(`/post/comments/${id}`)
    },
    [router]
  )

  const onDeletePost = useCallback(
    (id: string) => {
      deletePostMutation.mutate(id)
    },
    [deletePostMutation]
  )

  const onLike = useCallback(
    (id: string, isLiked: boolean) => {
      likeMutation.mutate({ id, isLiked })
    },
    [likeMutation]
  )

  const onShare = useCallback(
    (id: string, isShared: boolean) => {
      shareMutation.mutate({ id, isShared })
    },
    [shareMutation]
  )

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: any) => {
      const visibleVideoId = viewableItems.find((item: any) => item.isViewable)?.item.id
      if (visibleVideoId && visibleVideoId !== currentVideoId) {
        playVideo(null)
      } else if (!visibleVideoId) {
        playVideo(null)
      }
    },
    [currentVideoId, playVideo]
  )

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<Status>) => {
      if (!item?.id) return null

      return (
        <MemoizedFeedPost
          key={`homep-${item.id}`}
          post={item}
          user={user}
          onOpenComments={() => onOpenComments(item.id)}
          onDeletePost={() => onDeletePost(item.id)}
          onLike={() => onLike(item.id, item.favourited)}
          onShare={() => onShare(item.id, item.reblogged)}
        />
      )
    },
    [user, onOpenComments, onDeletePost, onLike, onShare]
  )

  const feedData = useMemo(() => {
    if (!data?.pages) return []
    return data.pages.flatMap((page) => page?.data ?? [])
  }, [data?.pages])

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetching && !isFetchingNextPage) {
      fetchNextPage()
    }
  }, [hasNextPage, isFetching, isFetchingNextPage, fetchNextPage])

  const ListEmptyComponent = useMemo(() => {
    return status === 'success' ? <EmptyFeed /> : null
  }, [status])

  const ListFooterComponent = useMemo(() => {
    return isFetchingNextPage ? FooterLoader : EmptyComponent
  }, [isFetchingNextPage])

  if (isFetching && !isFetchingNextPage && !isRefetching) {
    return <LoadingIndicator color={theme.color?.val.default.val} />
  }

  if (error || isError) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.background.val }]}
        edges={['top']}
      >
        <Stack.Screen options={{ headerShown: false }} />
        <FeedHeader title="Pixelfed" user={user} />
        <ErrorFeed />
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background.val }]}
      edges={['top']}
    >
      <Stack.Screen options={{ headerShown: false }} />
      <FeedHeader title="Pixelfed" user={user} />

      {isPosting && (
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
      )}

      <FlatList
        ref={flatListRef}
        data={feedData}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        {...FLAT_LIST_OPTIMIZATION}
        refreshing={isRefetching}
        onRefresh={refetch}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={ListEmptyComponent}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={VIEW_CONFIG}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        ListFooterComponent={ListFooterComponent}
        maintainVisibleContentPosition={{
          minIndexForVisible: 0,
        }}
      />
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
