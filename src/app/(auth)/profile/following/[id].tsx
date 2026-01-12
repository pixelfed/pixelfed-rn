import Feather from '@expo/vector-icons/Feather'
import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { Link, Stack, useLocalSearchParams, useNavigation } from 'expo-router'
import { useLayoutEffect } from 'react'
import { ActivityIndicator, FlatList } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import UserAvatar from 'src/components/common/UserAvatar'
import { getAccountById, getAccountFollowing } from 'src/lib/api'
import { Text, useTheme, View, XStack, YStack } from 'tamagui'

export default function FollowingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const navigation = useNavigation()
  const theme = useTheme()

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
              <Text fontSize="$3" color={theme.color?.val.secondary.val}>
                {item.display_name}
              </Text>
              <Text fontSize="$5" fontWeight="bold" color={theme.color?.val.default.val}>
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

  const ItemSeparator = () => (
    <View h={1} backgroundColor={theme.borderColor?.val.default.val}></View>
  )

  const RenderEmpty = () => (
    <View flexGrow={1} justifyContent="center" alignItems="center" py="$5">
      <YStack justifyContent="center" alignItems="center" gap="$5">
        <Feather name="alert-circle" size={70} color={theme.color?.val.tertiary.val} />
        <Text fontSize="$7" allowFontScaling={false} color={theme.color?.val.default.val}>
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
    <SafeAreaView edges={['bottom']}>
      <Stack.Screen
        options={{
          title: 'Following',
          headerBackTitle: 'Back',
        }}
      />
      <FlatList
        data={feed?.pages.flatMap((page) => page.data)}
        renderItem={RenderItem}
        keyExtractor={(item, _index) => item.id.toString()}
        ItemSeparatorComponent={ItemSeparator}
        showsVerticalScrollIndicator={false}
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) fetchNextPage()
        }}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={RenderEmpty}
        contentContainerStyle={{ flexGrow: 1 }}
        ListFooterComponent={() =>
          isFetchingNextPage ? <ActivityIndicator /> : null
        }
      />
    </SafeAreaView>
  )
}
