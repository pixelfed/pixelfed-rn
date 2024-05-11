import { ActivityIndicator, FlatList, SafeAreaView, Pressable } from 'react-native'
import { Text, View, YStack, XStack, Input } from 'tamagui'
import { Stack, Link } from 'expo-router'
import { useInfiniteQuery } from '@tanstack/react-query'
import { fetchNotifications } from 'src/lib/api'
import UserAvatar from 'src/components/common/UserAvatar'
import { _timeAgo } from 'src/utils'

export default function NotificationsScreen() {
  const {
    data,
    fetchNextPage,
    fetchPreviousPage,
    hasNextPage,
    hasPreviousPage,
    isFetchingNextPage,
    isFetching,
    isError,
    error,
  } = useInfiniteQuery({
    queryKey: ['notifications'],
    queryFn: fetchNotifications,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    getPreviousPageParam: (lastPage) => lastPage.prevPage,
  })

  if (isFetching && !isFetchingNextPage) {
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

  const _msgText = (type) => {
    switch (type) {
      case 'like':
      case 'favourite':
        return 'liked a post.'

      case 'follow':
        return 'followed you.'

      case 'mention':
        return 'mentioned you.'

      case 'reblog':
        return 'shared your post.'

      default:
        return ' unknown notification type'
    }
  }

  const RenderItem = ({ item }) => (
    <View px="$4" py="$2">
      <XStack justifyContent="space-between" alignItems="center">
        <XStack gap="$3" alignItems="center">
          <Link href={`/profile/${item.account.id}`} asChild>
            <Pressable>
              <UserAvatar url={item.account.avatar} />
            </Pressable>
          </Link>

          <XStack>
            <Text fontWeight={'bold'}>{item.account.username} </Text>
            <Text>{_msgText(item.type)}</Text>
          </XStack>
        </XStack>

        <Text color="$gray9" fontWeight={'bold'} fontSize="$3">
          {_timeAgo(item.created_at)}
        </Text>
      </XStack>
    </View>
  )

  const ItemSeparator = () => <View h={1} bg="$gray5"></View>

  return (
    <SafeAreaView flex={1}>
      <Stack.Screen
        options={{
          title: 'Notifications',
          headerBackTitle: 'Back',
        }}
      />

      <FlatList
        data={data?.pages.flatMap((page) => page.data)}
        keyExtractor={(item, index) => item.id.toString()}
        ItemSeparatorComponent={ItemSeparator}
        renderItem={RenderItem}
        onEndReached={() => {
          if (hasNextPage) fetchNextPage()
        }}
        onEndReachedThreshold={0.5}
        ListFooterComponent={() => (isFetchingNextPage ? <ActivityIndicator /> : null)}
      />
    </SafeAreaView>
  )
}
