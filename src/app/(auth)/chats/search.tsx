import Feather from '@expo/vector-icons/Feather'
import { useQuery } from '@tanstack/react-query'
import { Link, Stack } from 'expo-router'
import { useCallback, useState } from 'react'
import { ActivityIndicator, FlatList, Keyboard } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import UserAvatar from 'src/components/common/UserAvatar'
import { getMutualFollowers, searchQuery } from 'src/lib/api'
import { useUserCache } from 'src/state/AuthProvider'
import {
  formatTimestampMonthYear,
  getDomain,
  postCountLabel,
  prettyCount,
} from 'src/utils'
import { Input, Text, useTheme, View, XStack, YStack } from 'tamagui'

export default function SearchScreen() {
  const [query, setQuery] = useState('')
  const { acct } = useUserCache()
  const theme = useTheme()

  const {
    data: mutuals = [],
    isError: isMutualError,
    isLoading: isMutualsLoading,
  } = useQuery({
    queryKey: ['directComposeMutuals'],
    queryFn: async () => {
      try {
        const res = await getMutualFollowers()
        return res?.data || []
      } catch (error) {
        console.warn('Mutual followers endpoint not supported:', error)
        return []
      }
    },
    retry: false,
    staleTime: 5 * 60 * 1000,
  })

  const {
    data = [],
    isLoading,
    isError,
    error,
    isFetching,
  } = useQuery({
    queryKey: ['search', query],
    queryFn: async () => {
      const res = await searchQuery(query)
      return res.filter((r) => r._type === 'account' && r.acct !== acct)
    },
    keepPreviousData: true,
  })

  const dataSource = isLoading || (query?.length > 0 && data.length) ? data : mutuals

  const renderEmptyResults = useCallback(() => {
    if (!query || isFetching) return null
    return (
      <View flexGrow={1} justifyContent="center" alignItems="center" py="$5">
        <YStack justifyContent="center" alignItems="center" gap="$5">
          <Feather name="alert-circle" size={60} />
          <Text fontSize="$9">No results found</Text>
        </YStack>
      </View>
    )
  }, [query, isFetching])

  const renderItem = useCallback(
    ({ item }) => (
      <View p="$3" bg={theme.background?.val.secondary.val}>
        <Link href={`/chats/conversation/${item.id}`}>
          <XStack alignItems="center" gap="$3">
            <UserAvatar url={item.avatar} width={40} height={40} />
            <YStack flexGrow={1} gap={4}>
              <XStack w="100%" alignItems="center" flexWrap="wrap" overflow="hidden">
                <Text
                  fontSize="$6"
                  fontWeight="bold"
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  color={theme.color?.val.default.val}
                >
                  {item.username}
                </Text>
                {!item.local && (
                  <Text fontSize="$6" color={theme.color?.val.tertiary.val}>
                    @{getDomain(item.url)}
                  </Text>
                )}
              </XStack>
              <XStack gap="$2" alignItems="center">
                <Text color={theme.color?.val.tertiary.val} fontSize="$2">
                  {prettyCount(item.followers_count)} Followers
                </Text>
                <Text color={theme.color?.val.tertiary.val}>·</Text>
                <Text color={theme.color?.val.tertiary.val} fontSize="$2">
                  {postCountLabel(item.statuses_count)}
                </Text>
                <Text color={theme.color?.val.tertiary.val}>·</Text>
                <Text color={theme.color?.val.tertiary.val} fontSize="$2">
                  {item.local ? 'Joined' : 'First seen'}{' '}
                  {formatTimestampMonthYear(item.created_at)}
                </Text>
              </XStack>
            </YStack>
          </XStack>
        </Link>
      </View>
    ),
    [theme]
  )

  const renderSeparator = useCallback(() => <View h={1} bg="$gray4" />, [])

  if (isLoading && !isFetching) {
    return <ActivityIndicator color={theme.color?.val.default.val} />
  }

  if (isError) {
    return <Text>Error: {error?.message}</Text>
  }

  return (
    <SafeAreaView edges={['bottom']}>
      <Stack.Screen
        options={{
          title: 'New Direct Message',
          headerBackTitle: 'Back',
        }}
      />
      <View>
        <Input
          placeholder="Search by username, webfinger or url"
          m="$3"
          onChangeText={setQuery}
          value={query}
          bg={theme.background?.val.tertiary.val}
          color={theme.color?.val.default.val}
          placeholderTextColor={theme.color?.val.tertiary.val}
          autoFocus
          size="$6"
        />

        <FlatList
          data={dataSource}
          keyExtractor={(item) => String(item.id ?? item.acct)}
          renderItem={renderItem}
          ItemSeparatorComponent={renderSeparator}
          onScrollBeginDrag={() => Keyboard.dismiss()}
          ListEmptyComponent={renderEmptyResults}
          ListFooterComponent={() =>
            isFetching ? <ActivityIndicator /> : <View h={200} />
          }
        />
      </View>
    </SafeAreaView>
  )
}
