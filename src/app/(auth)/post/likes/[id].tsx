import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { Link, Stack, useLocalSearchParams } from 'expo-router'
import { ActivityIndicator, FlatList } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import UserAvatar from 'src/components/common/UserAvatar'
import { getStatusById, getStatusLikes } from 'src/lib/api'
import { Text, View, XStack, YStack } from 'tamagui'

export default function Page() {
  const { id } = useLocalSearchParams<{ id: string }>()

  const RenderItem = ({ item }) => {
    return (
      <View p="$3" bg="white">
        <Link href={`/profile/${item.id}`}>
          <XStack gap="$3" alignItems="center">
            <UserAvatar url={item.avatar} />
            <YStack flexShrink={1} gap="$1">
              <Text fontSize="$3" color="$gray9" flexWrap="wrap">
                {item.display_name}
              </Text>
              <Text
                fontSize={item.acct.length > 40 ? '$4' : '$5'}
                fontWeight="bold"
                flexWrap="wrap"
              >
                @{item.acct}
              </Text>
            </YStack>
          </XStack>
        </Link>
      </View>
    )
  }

  const { data: status } = useQuery({
    queryKey: ['getStatusById', id],
    queryFn: () => getStatusById(id),
  })

  const statusId = status?.id

  const ItemSeparator = () => <View h={1} bg="$gray5"></View>

  const {
    fetchStatus,
    data: feed,
    fetchNextPage,
    fetchPreviousPage,
    hasNextPage,
    hasPreviousPage,
    isFetchingNextPage,
    isFetchingPreviousPage,
    isFetching,
    isError,
    error,
  } = useInfiniteQuery({
    queryKey: ['getStatusLikes', statusId],
    queryFn: ({ pageParam }) => getStatusLikes(statusId, pageParam),
    initialPageParam: '',
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    getPreviousPageParam: (lastPage) => lastPage.prevCursor,
    select: (data) => ({
      pages: [...data.pages].reverse(),
      pageParams: [...data.pageParams].reverse(),
    }),
    enabled: !!status,
  })

  if (isFetching && !isFetchingPreviousPage) {
    return (
      <View flexGrow={1} mt="$5">
        <ActivityIndicator color={'#000'} />
      </View>
    )
  }

  if (error) {
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
          title: status ? 'Likes (' + status.favourites_count + ')' : 'Likes',
          headerBackTitle: 'Back',
        }}
      />
      <FlatList
        data={feed?.pages.flatMap((page) => page.data)}
        renderItem={RenderItem}
        keyExtractor={(item, index) => item.id.toString()}
        ItemSeparatorComponent={ItemSeparator}
        showsVerticalScrollIndicator={false}
        onEndReached={() => {
          if (hasPreviousPage && !isFetchingPreviousPage) fetchPreviousPage()
        }}
        onEndReachedThreshold={0.5}
        ListFooterComponent={() =>
          isFetchingPreviousPage ? <ActivityIndicator /> : null
        }
      />
    </SafeAreaView>
  )
}
