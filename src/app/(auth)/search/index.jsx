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
import ReadMore from '../../../components/common/ReadMore'
import { formatTimestampMonthYear, postCountLabel } from '../../../utils'

export default function SearchScreen() {
  const [query, setQuery] = useState('')

  const { data, isLoading, isError, error, isFetching } = useQuery({
    queryKey: ['search', query],
    queryFn: () => searchQuery(query),
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
          <Link href={`/profile/${item.id}`} asChild>
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

                      {/* { !item.local ? <View bg="$gray3" px={5} py={4} borderRadius={5}>
                            <Text fontSize="$2" fontWeight="bold" color="#999">{getDomain(item.url)}</Text>
                          </View> : null } */}
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

    if (item._type === 'hashtag') {
      return (
        <Link href={`/hashtag/${item.name}`} asChild>
          <View p="$3" bg="white">
            <XStack alignItems="center" gap="$3">
              <View
                w={50}
                h={50}
                borderRadius={50}
                bg="$gray3"
                justifyContent="center"
                alignItems="center"
              >
                <Feather name="hash" size={30} color="#000" />
              </View>
              <YStack gap={4}>
                <Text fontSize="$6" fontWeight="bold">
                  {item.name}
                </Text>
                <XStack>
                  <Text color="$gray9" fontSize="$3">
                    {prettyCount(item.count)} posts
                  </Text>
                </XStack>
              </YStack>
            </XStack>
          </View>
        </Link>
      )
    }

    if (item._type === 'status') {
      return (
        <View p="$3" bg="white">
          <Link href={`/post/${item.id}`} asChild>
            <Pressable>
              <XStack alignItems="center" gap="$3">
                <UserAvatar url={item.account.avatar} width={40} height={40} />
                <YStack flexGrow={1} gap={4}>
                  <XStack
                    alignItems="center"
                    flexWrap="wrap"
                    whiteSpace="break-all"
                    overflow="hidden"
                  >
                    <ReadMore numberOfLines={2} renderRevealedFooter={() => <></>}>
                      <Text fontSize="$6" fontWeight="bold">
                        {item.account.username}
                      </Text>

                      {!item.account.local ? (
                        <Text fontSize="$6" color="$gray9">
                          @{getDomain(item.account.url)}
                        </Text>
                      ) : null}
                    </ReadMore>
                  </XStack>
                  <XStack gap="$2" alignItems="center">
                    <Text color="black" fontSize="$2">
                      Post
                    </Text>
                    <Text color="$gray8">·</Text>
                    <Text color="$gray9" fontSize="$2">
                      {prettyCount(item.favourites_count)} likes
                    </Text>
                    <Text color="$gray8">·</Text>
                    <Text color="$gray9" fontSize="$2">
                      {prettyCount(item.reply_count)} comments
                    </Text>
                    <Text color="$gray8">·</Text>
                    <Text color="$gray9" fontSize="$2">
                      Created {formatTimestampMonthYear(item.created_at)}
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
          title: 'Search',
          headerBackTitle: 'Back',
        }}
      />
      <View>
        <Input
          placeholder="Search by hashtag, profile or url"
          m="$3"
          onChangeText={(text) => setQuery(text)}
          value={query}
          bg="white"
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
