import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { Link, Stack, useLocalSearchParams } from 'expo-router'
import { ActivityIndicator, FlatList } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import UserAvatar from 'src/components/common/UserAvatar'
import { getStatusById, getStatusReblogs } from 'src/lib/api'
import { Text, View, XStack, YStack, useTheme } from 'tamagui'

export default function Page() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const theme = useTheme()

  const RenderItem = ({ item }) => {
    return (
      <View p="$3">
        <Link href={`/profile/${item.id}`}>
          <XStack gap="$3" alignItems="center">
            <UserAvatar url={item.avatar} />
            <YStack flexShrink={1} gap="$1">
              <Text fontSize="$4" color={theme.color?.val.tertiary.val} flexWrap="wrap">
                {item.display_name}
              </Text>
              <Text
                fontSize={item.acct.length > 40 ? '$4' : '$5'}
                fontWeight="bold"
                flexWrap="wrap"
                color={theme.color?.val.default.val}
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

  const ItemSeparator = () => <View h={1} bg={theme.background?.val.tertiary.val}></View>

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
    queryKey: ['getStatusReblogs', statusId],
    queryFn: async ({ pageParam }) => {
      return await getStatusReblogs(statusId, pageParam)
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    getPreviousPageParam: (lastPage) => lastPage.prevPage,
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
          title: status ? 'Shares (' + status.reblogs_count + ')' : 'Shares',
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
          isFetchingPreviousPage ? <ActivityIndicator color={theme.color?.val.default.val} /> : null
        }
      />
    </SafeAreaView>
  )
}
