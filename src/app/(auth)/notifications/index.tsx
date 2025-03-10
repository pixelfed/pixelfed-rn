import Feather from '@expo/vector-icons/Feather'
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query'
import { Stack, useNavigation } from 'expo-router'
import { useEffect, useLayoutEffect, useState } from 'react'
import { ActivityIndicator, Dimensions, FlatList } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import RenderNotificationItem from 'src/components/notifications/RenderNotificationItem'
import { NotificationType, fetchNotifications } from 'src/lib/api'
import { _timeAgo } from 'src/utils'
import { Separator, Tabs, Text, View } from 'tamagui'

const SCREEN_WIDTH = Dimensions.get('screen').width

export default function NotificationsScreen() {
  const queryClient = useQueryClient()
  const navigation = useNavigation()
  useLayoutEffect(() => {
    navigation.setOptions({ title: 'Notifications', headerBackTitle: 'Back' })
  }, [navigation])

  const [activeTab, setActiveTab] = useState<NotificationType>(NotificationType.all)

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isFetching,
    isRefetching,
    error,
    refetch,
  } = useInfiniteQuery({
    queryKey: ['notifications', activeTab],
    queryFn: ({ queryKey: [_, tab], pageParam }) =>
      fetchNotifications(tab as NotificationType, pageParam),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    getPreviousPageParam: (firstPage) => firstPage.prevPage,
  })

  useEffect(() => {
    refetch()
  }, [activeTab, refetch])

  const handleTabChange = (value: string) => {
    queryClient.invalidateQueries(['notifications', value])
    setActiveTab(value as NotificationType)
  }

  const handleInfiniteScroll = (_: { distanceFromEnd: number }) => {
    if (isFetchingNextPage) {
      return
    }

    if (hasNextPage) {
      fetchNextPage()
    }
  }

  // Since refetching cause the refetch of all the pages sequentially (longer waits), !isRefetching avoid unmonting of the FlatList and
  // allow the user to see the past notifications in the meantime
  if (isFetching && !isFetchingNextPage && !isRefetching) {
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

  return (
    <SafeAreaView edges={['left', 'bottom']}>
      <Stack.Screen
        options={{
          title: 'Notifications',
          headerBackTitle: 'Back',
        }}
      />

      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        flexDirection="row"
        orientation="horizontal"
        overflow="hidden"
        width={SCREEN_WIDTH}
        bg="$gray5"
      >
        <Tabs.List flex={1}>
          <Tabs.Tab value={NotificationType.all} px="$0" flexGrow={1}>
            <Text fontSize="$2" fontWeight="bold" allowFontScaling={false}>
              All
            </Text>
          </Tabs.Tab>
          <Separator vertical borderColor="$gray5" />
          <Tabs.Tab value={NotificationType.mentions} px="$0" flexGrow={1}>
            <Feather name="at-sign" size={20} />
          </Tabs.Tab>
          <Separator vertical borderColor="$gray5" />
          <Tabs.Tab value={NotificationType.likes} px="$0" flexGrow={1}>
            <Feather name="heart" size={20} />
          </Tabs.Tab>
          <Separator vertical borderColor="$gray5" />
          <Tabs.Tab value={NotificationType.follows} px="$0" flexGrow={1}>
            <Feather name="user-plus" size={20} />
          </Tabs.Tab>
          <Separator vertical borderColor="$gray5" />
          <Tabs.Tab value={NotificationType.reblogs} px="$0" flexGrow={1}>
            <Feather name="refresh-cw" size={20} />
          </Tabs.Tab>
        </Tabs.List>
      </Tabs>

      <FlatList
        style={{ height: '100%' }}
        data={data?.pages.flatMap((page) => page.data)}
        ItemSeparatorComponent={() => <Separator borderColor="$gray5" />}
        renderItem={({ item }) => <RenderNotificationItem item={item} />}
        // In case of duplicates, discriminate the item with id_index avoid printing errors in console
        keyExtractor={(item, index) => `${item.id}_${index.toString()}`}
        onEndReached={handleInfiniteScroll}
        refreshing={isRefetching}
        onRefresh={() =>
          queryClient.invalidateQueries({
            queryKey: ['notifications'],
          })
        }
        onEndReachedThreshold={0.5}
        contentContainerStyle={{ flexGrow: 1 }}
        ListFooterComponent={() => (
          <View py="$6">
            {isFetchingNextPage ? <ActivityIndicator /> : null}
            {!hasNextPage ? (
              <Text ta="center">No more notifications for now!</Text>
            ) : null}
          </View>
        )}
      />
    </SafeAreaView>
  )
}
