import { ActivityIndicator, FlatList, Pressable } from 'react-native'
import { Text, View, YStack, XStack, Input } from 'tamagui'
import { Stack, Link } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query'
import { fetchNotifications } from 'src/lib/api'
import UserAvatar from 'src/components/common/UserAvatar'
import RenderNotificationItem from 'src/components/notifications/RenderNotificationItem'
import { _timeAgo, enforceLen } from 'src/utils'

export default function NotificationsScreen() {
  const queryClient = useQueryClient()

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
      <View flexGrow={1} mt="$5" p="$3">
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

  const ItemSeparator = () => <View h={1} bg="$gray5"></View>

  return (
    <SafeAreaView edges={['left']}>
      <Stack.Screen
        options={{
          title: 'Notifications',
          headerBackTitle: 'Back',
        }}
      />

      <FlatList
        data={data?.pages.flatMap((page) => page.data)}
        ItemSeparatorComponent={ItemSeparator}
        renderItem={({item}) => <RenderNotificationItem item={item} />}
        onEndReached={() => {
          if (hasNextPage) fetchNextPage()
        }}
        refreshing={isFetching}
        onRefresh={() => queryClient.invalidateQueries({ queryKey: ['notifications'] })}
        onEndReachedThreshold={0.5}
        ListFooterComponent={() => (isFetchingNextPage ? <View py="$10"><ActivityIndicator /></View>: null)}
      />
    </SafeAreaView>
  )
}
