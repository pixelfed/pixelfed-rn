import Feather from '@expo/vector-icons/Feather'
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query'
import { Stack, useNavigation } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useEffect, useLayoutEffect, useState } from 'react'
import { ActivityIndicator, Dimensions, FlatList } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import RenderNotificationItem from 'src/components/notifications/RenderNotificationItem'
import { fetchNotifications } from 'src/lib/api'
import { _timeAgo } from 'src/utils'
import { Separator, Tabs, Text, View, useTheme } from 'tamagui'

const SCREEN_WIDTH = Dimensions.get('screen').width

export default function NotificationsScreen() {
  const queryClient = useQueryClient()
  const navigation = useNavigation()
  const theme = useTheme()
  useLayoutEffect(() => {
    navigation.setOptions({ title: 'Notifications', headerBackTitle: 'Back' })
  }, [navigation])

  const [activeTab, setActiveTab] = useState('all')

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
    queryFn: fetchNotifications,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    getPreviousPageParam: (firstPage) => firstPage.prevPage,
  })

  useEffect(() => {
    refetch()
  }, [activeTab, refetch])

  const handleTabChange = (value) => {
    queryClient.invalidateQueries(['notifications', value])
    setActiveTab(value)
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
        <ActivityIndicator color={theme.color?.val.default.val} />
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
        bg={theme.background?.val.tertiary.val}
      >
        <Tabs.List flex={1}>
          <Tabs.Tab
            value="all"
            px="$0"
            flexGrow={1}
            bg={theme.background?.val.tertiary.val}
          >
            <Text
              fontSize="$2"
              fontWeight="bold"
              allowFontScaling={false}
              color={
                activeTab === 'all'
                  ? theme.colorHover?.val.hover.val
                  : theme.color?.val.default.val
              }
            >
              All
            </Text>
          </Tabs.Tab>
          <Separator vertical borderColor={theme.borderColor?.val.default.val} />
          <Tabs.Tab
            value="mentions"
            px="$0"
            flexGrow={1}
            bg={theme.background?.val.tertiary.val}
          >
            <Feather
              name="at-sign"
              size={20}
              color={
                activeTab === 'mentions'
                  ? theme.colorHover?.val.hover.val
                  : theme.color?.val.default.val
              }
            />
          </Tabs.Tab>
          <Separator vertical borderColor={theme.borderColor?.val.default.val} />
          <Tabs.Tab
            value="likes"
            px="$0"
            flexGrow={1}
            bg={theme.background?.val.tertiary.val}
          >
            <Feather
              name="heart"
              size={20}
              color={
                activeTab === 'likes'
                  ? theme.colorHover?.val.hover.val
                  : theme.color?.val.default.val
              }
            />
          </Tabs.Tab>
          <Separator vertical borderColor={theme.borderColor?.val.default.val} />
          <Tabs.Tab
            value="follows"
            px="$0"
            flexGrow={1}
            bg={theme.background?.val.tertiary.val}
          >
            <Feather
              name="user-plus"
              size={20}
              color={
                activeTab === 'follows'
                  ? theme.colorHover?.val.hover.val
                  : theme.color?.val.default.val
              }
            />
          </Tabs.Tab>
          <Separator vertical borderColor={theme.borderColor?.val.default.val} />
          <Tabs.Tab
            value="reblogs"
            px="$0"
            flexGrow={1}
            bg={theme.background?.val.tertiary.val}
          >
            <Feather
              name="refresh-cw"
              size={20}
              color={
                activeTab === 'reblogs'
                  ? theme.colorHover?.val.hover.val
                  : theme.color?.val.default.val
              }
            />
          </Tabs.Tab>
        </Tabs.List>
      </Tabs>

      <FlatList
        style={{ height: '100%' }}
        data={data?.pages.flatMap((page) => page.data)}
        ItemSeparatorComponent={() => (
          <Separator borderColor={theme.borderColor?.val.default.val} />
        )}
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
            {isFetchingNextPage ? (
              <ActivityIndicator color={theme.color?.val.default.val} />
            ) : null}
            {!hasNextPage ? (
              <Text ta="center" color={theme.color?.val.default.val}>
                No more notifications for now!
              </Text>
            ) : null}
          </View>
        )}
      />
    </SafeAreaView>
  )
}
