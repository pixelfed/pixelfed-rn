import { Stack, useNavigation, useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Text, View } from 'tamagui'
import { getSelfLikes } from 'src/lib/api'
import { ActivityIndicator, FlatList } from 'react-native'
import { useInfiniteQuery } from '@tanstack/react-query'
import FeedPost from 'src/components/post/FeedPost'
import { useCallback, useLayoutEffect } from 'react'
import { Storage } from 'src/state/cache'
import { useLikeMutation } from 'src/hooks/mutations/useLikeMutation'

export default function LikesScreen() {
  const router = useRouter()
  const navigation = useNavigation()
  useLayoutEffect(() => {
    navigation.setOptions({ title: 'My Likes', headerBackTitle: 'Back' })
  }, [navigation])
  const { handleLike } = useLikeMutation()
  const userJson = Storage.getString('user.profile')
  const user = JSON.parse(userJson)
  const renderItem = useCallback(
    ({ item }) => (
      <FeedPost
        post={item}
        user={user}
        onOpenComments={() => onOpenComments(item.id)}
        onLike={() => handleLike(item.id, item.favourited)}
        onDeletePost={() => onDeletePost(item.id)}
        onBookmark={() => onBookmark(item.id)}
        isLikeFeed={true}
        likedAt={item?.liked_at}
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
    <SafeAreaView flex={1} edges={['left']}>
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
        ListFooterComponent={() =>
          isFetchingNextPage ? <ActivityIndicator /> : <View h={200} />
        }
      />
    </SafeAreaView>
  )
}
