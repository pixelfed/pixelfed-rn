import { ActivityIndicator, Dimensions, FlatList, Pressable } from 'react-native'
import { Text, View, YStack, XStack, Input, Separator, Tabs, Button } from 'tamagui'
import { Stack, Link, useNavigation } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query'
import { fetchNotifications } from 'src/lib/api'
import UserAvatar from 'src/components/common/UserAvatar'
import RenderNotificationItem from 'src/components/notifications/RenderNotificationItem'
import { _timeAgo, enforceLen } from 'src/utils'
import { useEffect, useLayoutEffect, useState } from 'react'
import Feather from '@expo/vector-icons/Feather'

const SCREEN_WIDTH = Dimensions.get('screen').width

export default function NotificationsScreen() {
  const queryClient = useQueryClient()
  const navigation = useNavigation()
  useLayoutEffect(() => {
    navigation.setOptions({ title: 'Notifications', headerBackTitle: 'Back' })
  }, [navigation])

  const [activeTab, setActiveTab] = useState('all')

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
    refetch,
  } = useInfiniteQuery({
    queryKey: ['notifications', activeTab],
    queryFn: fetchNotifications,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    getPreviousPageParam: (lastPage) => lastPage.prevPage,
  })

  useEffect(() => {
    refetch()
  }, [activeTab, refetch])

  const handleTabChange = (value) => {
    queryClient.invalidateQueries(['notifications', value])
    setActiveTab(value)
  }

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

  return (
    <SafeAreaView edges={['left']}>
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
        <Tabs.List flex={1} separator={<Separator vertical borderColor="$gray5" />}>
          <Tabs.Tab value="all" px="$0" flexGrow={1}>
            <Tabs.Trigger value="all">
              <Text fontSize="$2" fontWeight="bold" allowFontScaling={false}>
                All
              </Text>
            </Tabs.Trigger>
          </Tabs.Tab>
          <Tabs.Tab value="mentions" px="$0" flexGrow={1}>
            <Tabs.Trigger value="mentions">
              <Feather name="at-sign" size={20} />
            </Tabs.Trigger>
          </Tabs.Tab>
          <Tabs.Tab value="likes" px="$0" flexGrow={1}>
            <Tabs.Trigger value="likes">
              <Feather name="heart" size={20} />
            </Tabs.Trigger>
          </Tabs.Tab>
          <Tabs.Tab value="follows" px="$0" flexGrow={1}>
            <Tabs.Trigger value="follows">
              <Feather name="user-plus" size={20} />
            </Tabs.Trigger>
          </Tabs.Tab>
          <Tabs.Tab value="reblogs" px="$0" flexGrow={1}>
            <Tabs.Trigger value="reblogs">
              <Feather name="refresh-cw" size={20} />
            </Tabs.Trigger>
          </Tabs.Tab>
        </Tabs.List>
      </Tabs>

      <FlatList
        data={data?.pages.flatMap((page) => page.data)}
        ItemSeparatorComponent={<Separator borderColor="$gray5" />}
        renderItem={({ item }) => <RenderNotificationItem item={item} />}
        onEndReached={() => {
          if (hasNextPage) fetchNextPage()
        }}
        refreshing={isFetching}
        onRefresh={() => queryClient.invalidateQueries({ queryKey: ['notifications'] })}
        onEndReachedThreshold={0.5}
        contentContainerStyle={{ flexGrow: 1 }}
        ListFooterComponent={() =>
          isFetchingNextPage ? (
            <View py="$10">
              <ActivityIndicator />
            </View>
          ) : (
            <View h={200}></View>
          )
        }
      />
    </SafeAreaView>
  )
}
