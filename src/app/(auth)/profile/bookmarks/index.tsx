import Feather from '@expo/vector-icons/Feather'
import { useInfiniteQuery, useMutation } from '@tanstack/react-query'
import * as Haptics from 'expo-haptics'
//@ts-check
import { Stack, useNavigation, useRouter } from 'expo-router'
import { useCallback, useLayoutEffect } from 'react'
import { ActivityIndicator, FlatList } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import FeedPost from 'src/components/post/FeedPost'
import { getSelfBookmarks, reblogStatus, unreblogStatus } from 'src/lib/api'
import { useUserCache } from 'src/state/AuthProvider'
import { Text, View, useTheme } from 'tamagui'

export default function BookmarksScreen() {
  const navigation = useNavigation()
  const router = useRouter()
  const theme = useTheme()
  useLayoutEffect(() => {
    navigation.setOptions({ title: 'My Bookmarks', headerBackTitle: 'Back' })
  }, [navigation])
  const user = useUserCache()

  const onOpenComments = useCallback((id: string) => {
    router.push(`/post/comments/${id}`)
  }, [])

  const onShare = (id: string, state: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
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
    ({ item }) => (
      <FeedPost
        post={item}
        user={user}
        onOpenComments={() => onOpenComments(item.id)}
        onDeletePost={() => onDeletePost(item.id)}
        onShare={() => onShare(item.id, item.reblogged)}
      />
    ),
    []
  )
  const keyExtractor = useCallback((item) => item.id.toString(), [])

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
    queryKey: ['getSelfBookmarks'],
    initialPageParam: null,
    queryFn: getSelfBookmarks,
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

  // Check if there are no bookmarks to display
  const bookmarks = data?.pages.flatMap((page) => page.data) || []
  const hasNoBookmarks = !isFetching && bookmarks.length === 0

  // Render empty state
  const EmptyBookmarksList = () => (
    <View flex={1} justifyContent="center" alignItems="center" py="$12">
      <View
        p="$6"
        borderWidth={2}
        borderColor={theme.borderColor?.val.default.val}
        borderRadius={100}
      >
        <Feather name="bookmark" size={40} color={theme.color?.val.tertiary.val} />
      </View>
      <Text
        fontSize={18}
        fontWeight="600"
        mt="$4"
        textAlign="center"
        color={theme.color?.val.default.val}
      >
        No Bookmarks Found
      </Text>
      <Text
        fontSize={16}
        mt="$2"
        textAlign="center"
        color={theme.color?.val.tertiary.val}
      >
        Posts you bookmark will appear here
      </Text>
    </View>
  )

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['left']}>
      <Stack.Screen
        options={{
          title: 'My Bookmarks',
          headerBackTitle: 'Back',
        }}
      />
      <FlatList
        data={bookmarks}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) fetchNextPage()
        }}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={hasNoBookmarks ? <EmptyBookmarksList /> : null}
        ListFooterComponent={() =>
          isFetchingNextPage || isFetching ? (
            <ActivityIndicator color={theme.color?.val.default.val} />
          ) : (
            <View h={200} />
          )
        }
      />
    </SafeAreaView>
  )
}
