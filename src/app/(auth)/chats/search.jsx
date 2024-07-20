import { Link, Stack } from 'expo-router'
import { FlatList, ActivityIndicator, Keyboard, Pressable } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Text, View, YStack, Input, XStack } from 'tamagui'
import {
  useQuery,
  useQueryClient,
  useMutation,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'

import { searchQuery } from 'src/lib/api'
import { useCallback, useState } from 'react'
import UserAvatar from 'src/components/common/UserAvatar'
import { prettyCount } from 'src/utils'
import Feather from '@expo/vector-icons/Feather'
import ReadMore from 'src/components/common/ReadMore'
import { formatTimestampMonthYear, postCountLabel } from 'src/utils'
import { Storage } from 'src/state/cache'

export default function SearchScreen() {
  const [query, setQuery] = useState('')
  const userJson = Storage.getString('user.profile')
  const user = JSON.parse(userJson)

  const { data, isLoading, isError, error, isFetching } = useQuery({
    queryKey: ['search', query],
    queryFn: async () => {
      const res = await searchQuery(query)
      const filtered = res.filter((r) => {
        return r._type === 'account' && r.acct != user.acct
      })
      return filtered
    },
    keepPreviousData: true,
  })

  if (isLoading && !isFetching) {
    return <Text>Loading...</Text>
  }

  if (isError) {
    return <Text>Error: {error.message}</Text>
  }

  const getDomain = (url) => {
    let domain = new URL(url)
    return domain.hostname
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
        <View p="$3" bg="white">
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
                      <Text fontSize="$6" fontWeight="bold">
                        {item.username}
                      </Text>
                      {!item.local ? (
                        <Text fontSize="$6" color="$gray9">
                          @{getDomain(item.url)}
                        </Text>
                      ) : null}
                    </ReadMore>
                  </XStack>
                  <XStack gap="$2" alignItems="center">
                    <Text color="$gray9" fontSize="$2">
                      {prettyCount(item.followers_count)} Followers
                    </Text>
                    <Text color="$gray8">·</Text>
                    <Text color="$gray9" fontSize="$2">
                      {postCountLabel(item.statuses_count)}
                    </Text>
                    <Text color="$gray8">·</Text>
                    <Text color="$gray9" fontSize="$2">
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
          bg="white"
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
