import { Stack, useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import {
  Separator,
  Text,
  View,
  XStack,
  YStack,
} from 'tamagui'
import { Feather } from '@expo/vector-icons'
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query'
import { adminInstances } from 'src/lib/api'
import { ActivityIndicator, FlatList } from 'react-native'
import { enforceLen, prettyCount, _timeAgo } from 'src/utils'
import { useState } from 'react'
import { PressableOpacity } from 'react-native-pressable-opacity'
import { useUserCache } from 'src/state/AuthProvider'

const keyExtractor = (_, index) => `instance-${_.id}-${index}`

export default function Page() {
  const router = useRouter()
  const {is_admin} = useUserCache()
  const [sort, setSort] = useState('desc')
  const [sortBy, setSortBy] = useState('id')
  const queryClient = useQueryClient()

  if (!is_admin) {
    router.back()
  }

  const RenderItem = ({ item }) => {
    return (
      <View px="$5" py="$3" bg="white">
        <XStack justifyContent="space-between" alignItems="center">
          <YStack>
            <Text fontSize="$6">{enforceLen(item.domain, 30, true, 'middle')}</Text>
            <XStack gap="$3" justifyContent="flex-start" alignItems="center">
              {item.software ? <Text color="$gray9">{item.software}</Text> : null}
            </XStack>
          </YStack>

          <XStack gap="$3">
            {item?.user_count ? (
              <YStack w={50} justifyContent="center" alignItems="center" gap={3}>
                <Text
                  fontSize="$3"
                  fontWeight="bold"
                  color="$gray9"
                  allowFontScaling={false}
                >
                  {prettyCount(item?.user_count)}
                </Text>
                <Feather name="user" size={14} color="#ccc" />
              </YStack>
            ) : null}
            {item?.last_crawled_at ? (
              <YStack w={50} justifyContent="center" alignItems="center" gap={3}>
                <Text
                  fontSize="$3"
                  fontWeight="bold"
                  color="$gray9"
                  allowFontScaling={false}
                >
                  {_timeAgo(item?.last_crawled_at)}
                </Text>
                <Feather name="clock" size={14} color="#ccc" />
              </YStack>
            ) : null}

            {/* { item?.status_count ? 
                        <YStack w={50} justifyContent="center" alignItems="center" gap={3}>
                            <Text fontSize="$3" fontWeight="bold" color="$gray9" allowFontScaling={false}>{ prettyCount(item?.status_count) }</Text>
                            <Feather name="image" size={14} color="#ccc" />
                        </YStack> 
                        : null } */}
          </XStack>
        </XStack>
      </View>
    )
  }

  const HeaderRight = () => (
    <PressableOpacity onPress={() => _toggleFilter()}>
      <Feather name="filter" size={24} />
    </PressableOpacity>
  )

  const _toggleFilter = () => {
    switch (sortBy) {
      case 'id':
        setSortBy('status_count')
        break
      case 'status_count':
        setSortBy('user_count')
        break
      case 'user_count':
        setSortBy('domain')
        break
      case 'domain':
        setSortBy('id')
        break
    }
    queryClient.invalidateQueries({ queryKey: ['instances'] })
  }

  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['instances'],
    queryFn: async (queryKey) => {
      return await adminInstances(queryKey, sort, sortBy)
    },
    initialPageParam: null,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    getPreviousPageParam: (lastPage) => lastPage.prevPage,
  })

  if (isFetching && !isFetchingNextPage) {
    return (
      <View p="$3">
        <ActivityIndicator />
      </View>
    )
  }

  if (error) {
    return (
      <View>
        <Text>{error.message}</Text>
      </View>
    )
  }

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['left']}>
      <Stack.Screen
        options={{
          title: 'Instances',
          headerBackTitle: 'Back',
          headerRight: HeaderRight,
        }}
      />
      <FlatList
        keyExtractor={keyExtractor}
        data={data?.pages.flatMap((page) => page.data)}
        renderItem={RenderItem}
        ItemSeparatorComponent={<Separator />}
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) fetchNextPage()
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
