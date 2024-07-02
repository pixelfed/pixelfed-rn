import { FlatList, Dimensions, ActivityIndicator } from 'react-native'
import { Image, Text, View, YStack, XStack } from 'tamagui'
import ProfileHeader from '@components/profile/ProfileHeader'
import { Storage } from 'src/state/cache'
import { queryApi } from 'src/requests'
import { useState, useEffect, useLayoutEffect } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Link, Stack, useLocalSearchParams, useNavigation } from 'expo-router'
import { useQuery, useInfiniteQuery } from '@tanstack/react-query'
import { getAccountById, getAccountFollowing } from 'src/lib/api'
import UserAvatar from 'src/components/common/UserAvatar'
import Feather from '@expo/vector-icons/Feather'

const SCREEN_WIDTH = Dimensions.get('screen').width

export default function FollowingScreen() {
  const { id } = useLocalSearchParams()
  const navigation = useNavigation()
  useLayoutEffect(() => {
    navigation.setOptions({ title: 'Following', headerBackTitle: 'Back' })
  }, [navigation])
  const RenderItem = ({ item }) => {
    return (
      <View p="$3">
        <Link href={`/profile/${item.id}`}>
          <XStack gap="$3" alignItems="center">
            <UserAvatar url={item.avatar} width={40} height={40} />
            <YStack>
              <Text fontSize="$3" color="$gray10">
                {item.display_name}
              </Text>
              <Text fontSize="$5" fontWeight="bold">
                @{item.acct}
              </Text>
            </YStack>
          </XStack>
        </Link>
      </View>
    )
  }

  const { data: profile } = useQuery({
    queryKey: ['getAccountById', id],
    queryFn: getAccountById,
  })

  const profileId = profile?.id

  const ItemSeparator = () => <View h={1} bg="$gray5"></View>

  const RenderEmpty = () => (
    <View flexGrow={1} justifyContent="center" alignItems="center" py="$5">
      <YStack flexShrink={1} justifyContent="center" alignItems="center" gap="$5">
        <Feather name="alert-circle" size={70} />
        <Text fontSize="$7" allowFontScaling={false}>
          No results found
        </Text>
      </YStack>
    </View>
  )

  const {
    status,
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
    queryKey: ['getAccountFollowing', profileId],
    queryFn: async ({ pageParam }) => {
      return await getAccountFollowing(profileId, pageParam)
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    getPreviousPageParam: (lastPage) => lastPage.prevPage,
    select: (data) => ({
      pages: [...data.pages].reverse(),
      pageParams: [...data.pageParams].reverse(),
    }),
    enabled: !!profile,
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
    <SafeAreaView flex={1} edges={['bottom']}>
      <Stack.Screen
        options={{
          title: 'Following',
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
        ListEmptyComponent={RenderEmpty}
        contentContainerStyle={{ flexGrow: 1 }}
        ListFooterComponent={() =>
          isFetchingPreviousPage ? <ActivityIndicator /> : null
        }
      />
    </SafeAreaView>
  )
}
