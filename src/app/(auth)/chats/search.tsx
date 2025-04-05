import { useQuery } from '@tanstack/react-query'
import { Link, Stack } from 'expo-router'
import { ActivityIndicator, FlatList, Keyboard, Pressable } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Input, Text, View, XStack, YStack, useTheme } from 'tamagui'

import Feather from '@expo/vector-icons/Feather'
import { useCallback, useState } from 'react'
import ReadMore from 'src/components/common/ReadMore'
import UserAvatar from 'src/components/common/UserAvatar'
import { searchQuery } from 'src/lib/api'
import { useUserCache } from 'src/state/AuthProvider'
import { getDomain, prettyCount } from 'src/utils'
import { formatTimestampMonthYear, postCountLabel } from 'src/utils'

export default function SearchScreen() {
  const [query, setQuery] = useState('')
  const { acct } = useUserCache()
  const theme = useTheme()

  const { data, isLoading, isError, error, isFetching } = useQuery({
    queryKey: ['search', query],
    queryFn: async () => {
      const res = await searchQuery(query)
      const filtered = res.filter((r) => {
        return r._type === 'account' && r.acct != acct
      })
      return filtered
    },
    keepPreviousData: true,
  })

  if (isLoading && !isFetching) {
    return <ActivityIndicator color={theme.color?.val.default.val} />
  }

  if (isError) {
    return <Text>Error: {error?.message}</Text>
  }

  const EmptyResults = () =>
    query && query.length && !isFetching ? <RenderEmptyResults /> : null

  const RenderEmptyResults = () => (
    <View flexGrow={1} justifyContent="center" alignItems="center" py="$5">
      <YStack justifyContent="center" alignItems="center" gap="$5">
        <Feather name="alert-circle" size={60} />
        <Text fontSize="$9">No results found</Text>
      </YStack>
    </View>
  )

  const RenderItem = useCallback(({ item }) => {
    if (item._type === 'account') {
      return (
        <View p="$3" bg={theme.background?.val.secondary.val}>
          <Link href={`/chats/conversation/${item.id}`} asChild>
            <Pressable>
              <XStack alignItems="center" gap="$3">
                <UserAvatar url={item.avatar} width={40} height={40} />
                <YStack flexGrow={1} gap={4}>
                  {/* <Text fontSize="$3" color="$gray9">
                    {item.display_name}
                  </Text> */}
                  <XStack
                    alignItems="center"
                    flexWrap="wrap"
                    whiteSpace="break-all"
                    overflow="hidden"
                  >
                    <ReadMore numberOfLines={2} renderRevealedFooter={() => <></>}>
                      <Text
                        fontSize="$6"
                        fontWeight="bold"
                        color={theme.color?.val.default.val}
                      >
                        {item.username}
                      </Text>
                      {!item.local ? (
                        <Text fontSize="$6" color={theme.color?.val.tertiary.val}>
                          @{getDomain(item.url)}
                        </Text>
                      ) : null}
                    </ReadMore>
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
            </Pressable>
          </Link>
        </View>
      )
    }
  }, [])

  const RenderSeparator = () => <View h={1} bg="$gray4" />

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
          onChangeText={(text) => setQuery(text)}
          value={query}
          bg={theme.background?.val.tertiary.val}
          color={theme.color?.val.default.val}
          placeholderTextColor={theme.color?.val.tertiary.val}
          autoFocus={true}
          size="$6"
        />

        <FlatList
          data={data}
          renderItem={RenderItem}
          ItemSeparatorComponent={RenderSeparator}
          onScrollBeginDrag={() => Keyboard.dismiss()}
          ListEmptyComponent={EmptyResults}
          ListFooterComponent={() =>
            isFetching ? <ActivityIndicator /> : <View h={200} />
          }
        />
      </View>
    </SafeAreaView>
  )
}
