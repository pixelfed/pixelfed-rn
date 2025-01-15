import { FlatList, ActivityIndicator } from 'react-native'
import {
  Separator,
  Text,
  View,
  XStack,
  YStack,
} from 'tamagui'
import { getAdminUsers } from 'src/lib/api'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Stack, Link } from 'expo-router'
import { Feather } from '@expo/vector-icons'
import { prettyCount, _timeAgo, enforceLen } from 'src/utils'
import {
  useInfiniteQuery,
} from '@tanstack/react-query'
import UserAvatar from 'src/components/common/UserAvatar'

const keyExtractor = (_, index) => `user-${_.id}`

export default function Screen() {

  const RenderItem = ({ item }) => (
    <Link href={`/admin/users/show/${item.id}`} asChild>
      <View px="$5" py="$3" bg="white">
        <XStack alignItems="center" gap="$3">
          <UserAvatar url={item.avatar} size="$3" />
          <YStack gap={3}>
            <Text fontSize="$6">{item.username}</Text>
            <XStack gap="$3">
              <Text color="$gray9">{enforceLen(item.name, 10, true)}</Text>
              <Separator vertical />
              <XStack alignItems="center" gap={4}>
                <Feather name="users" color="#ccc" />
                <Text color="$gray9" fontSize={10} allowFontScaling={false}>
                  {prettyCount(item.followers_count)}
                </Text>
              </XStack>
              <Separator vertical />
              <XStack alignItems="center" gap={4}>
                <Feather name="user-plus" color="#ccc" />
                <Text color="$gray9" fontSize={10} allowFontScaling={false}>
                  {prettyCount(item.following_count)}
                </Text>
              </XStack>
              <Separator vertical />
              <XStack alignItems="center" gap={4}>
                <Feather name="clock" color="#ccc" />
                <Text color="$gray9" fontSize={10} allowFontScaling={false}>
                  {_timeAgo(item.created_at)}
                </Text>
              </XStack>
            </XStack>
          </YStack>
        </XStack>
      </View>
    </Link>
  )

  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: ['users'],
    queryFn: async ({ pageParam }) => {
      return await getAdminUsers(pageParam)
    },
    initialPageParam: null,
    getNextPageParam: (lastPage) => lastPage.nextPage,
  })

  if (status === 'pending' && !isFetchingNextPage) {
    return <ActivityIndicator />
  }

  if (status === 'error') {
    return <Text>{error?.message}</Text>
  }

  return (
    <SafeAreaView edges={['bottom']}>
      <Stack.Screen
        options={{
          title: 'Users',
          headerBackTitle: 'Back',
        }}
      />
      <FlatList
        keyExtractor={keyExtractor}
        data={data?.pages.flatMap((page) => page.data)}
        renderItem={RenderItem}
        contentContainerStyle={{ flexGrow: 1 }}
        ItemSeparatorComponent={<Separator />}
        onEndReached={() => {
          if (!isFetching && hasNextPage && !isFetchingNextPage) fetchNextPage()
        }}
        ListFooterComponent={() =>
          isFetchingNextPage ? (
            <View p="$3">
              <ActivityIndicator />
            </View>
          ) : null
        }
        onEndReachedThreshold={0.5}
      />
    </SafeAreaView>
  )
}
