import { useInfiniteQuery } from '@tanstack/react-query'
import { Stack, useNavigation, useRouter } from 'expo-router'
import { useCallback, useLayoutEffect } from 'react'
import { ActivityIndicator, FlatList } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import FeedPost from 'src/components/post/FeedPost'
import { getSelfLikes } from 'src/lib/api'
import { useUserCache } from 'src/state/AuthProvider'
import { Text, View, useTheme } from 'tamagui'
import Feather from '@expo/vector-icons/Feather'

export default function LikesScreen() {
  const navigation = useNavigation()
  const router = useRouter()
  const theme = useTheme();

  useLayoutEffect(() => {
    navigation.setOptions({ title: 'My Likes', headerBackTitle: 'Back' })
  }, [navigation])

  const onOpenComments = (id) => {
    router.push(`/post/comments/${id}`)
  }

  const user = useUserCache()
  const renderItem = useCallback(
    ({ item }) => (
      <FeedPost
        post={item}
        user={user}
        handleLikeProfileId={true}
        onOpenComments={() => onOpenComments(item.id)}
        onDeletePost={() => onDeletePost(item.id)}
        isLikeFeed={true}
        likedAt={item?.liked_at}
      />
    ),
    []
  )

  const EmptyLikesList = () => (
    <View flex={1} justifyContent="center" alignItems="center" py="$12">
      <View p="$6" borderWidth={2} borderColor={theme.borderColor?.val.default.val} borderRadius={100}>
        <Feather name="heart" size={40} color={theme.color?.val.tertiary.val} />
      </View>
      <Text fontSize={18} fontWeight="600" mt="$4" textAlign="center" color={theme.color?.val.default.val}>
        No Liked Posts Found
      </Text>
      <Text fontSize={16} mt="$2" textAlign="center" color={theme.color?.val.tertiary.val}>
        Posts you like will appear here
      </Text>
    </View>
  )

  const likes = data?.pages.flatMap((page) => page.data) || []
  const hasNoLikes = !isFetching && likes.length === 0
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
    queryKey: ['getSelfLikes'],
    initialPageParam: null,
    queryFn: getSelfLikes,
    refetchOnWindowFocus: false,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    getPreviousPageParam: (lastPage) => lastPage.prevPage,
  })

  if (isFetching && !isFetchingNextPage && !isRefetching) {
    return (
      <View flexGrow={1} mt="$5" py="$5" justifyContent="center" alignItems="center">
        <ActivityIndicator color={theme.color?.val.default.val} />
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
    <SafeAreaView edges={['left']}>
      <Stack.Screen
        options={{
          title: 'My Likes',
          headerBackTitle: 'Back',
        }}
      />
      <FlatList
        data={data?.pages.flatMap((page) => page.data)}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) fetchNextPage()
        }}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={hasNoLikes ? <EmptyLikesList /> : null}
        ListFooterComponent={() =>
          isFetchingNextPage ? <ActivityIndicator color={theme.color?.val.default.val} /> : <View h={200} />
        }
      />
    </SafeAreaView>
  )
}
