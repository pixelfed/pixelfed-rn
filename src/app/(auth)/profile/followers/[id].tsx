import Feather from '@expo/vector-icons/Feather'
import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { Link, Stack, useLocalSearchParams, useNavigation } from 'expo-router'
import { useLayoutEffect } from 'react'
import { ActivityIndicator, FlatList } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import UserAvatar from 'src/components/common/UserAvatar'
import { getAccountById, getAccountFollowers } from 'src/lib/api'
import { Text, View, XStack, YStack } from 'tamagui'

export default function FollowersScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const navigation = useNavigation()
  useLayoutEffect(() => {
    navigation.setOptions({ title: 'Followers', headerBackTitle: 'Back' })
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
    queryFn: () => getAccountById(id),
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
    queryKey: ['getAccountFollowers', profileId],
    queryFn: async ({ pageParam }) => {
      return await getAccountFollowers(profileId, pageParam)
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
    <SafeAreaView edges={['bottom']}>
      <Stack.Screen
        options={{
          title: 'Followers',
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
