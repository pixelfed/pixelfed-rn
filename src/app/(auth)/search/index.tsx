import { useQuery } from '@tanstack/react-query'
import { Link, Stack, useLocalSearchParams } from 'expo-router'
import { ActivityIndicator, FlatList, Keyboard, Pressable } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Input, Text, View, XStack, YStack } from 'tamagui'

import Feather from '@expo/vector-icons/Feather'
import { useCallback, useState } from 'react'
import UserAvatar from 'src/components/common/UserAvatar'
import { searchQuery } from 'src/lib/api'
import { getDomain, prettyCount } from 'src/utils'
import ReadMore from '../../../components/common/ReadMore'
import { formatTimestampMonthYear, postCountLabel } from '../../../utils'

export default function SearchScreen() {
  const { initialQuery } = useLocalSearchParams<{ initialQuery?: string }>()

  const [query, setQuery] = useState(initialQuery || '')

  const { data, isLoading, isError, error, isFetching } = useQuery({
    queryKey: ['search', query],
    queryFn: () => searchQuery(query),
    keepPreviousData: true,
  })

  if (isLoading && !isFetching) {
    return <Text>Loading...</Text>
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
        <View p="$3" bg="white">
          <Link href={`/profile/${item.id}`} asChild>
            <Pressable>
              <XStack alignItems="center" gap="$3">
                <UserAvatar url={item.avatar} width={40} height={40} />
                <YStack flexGrow={1} gap={4} w="50%">
                  <XStack alignItems="center" gap="$2" flexWrap="wrap">
                    <Text fontSize="$6" fontWeight="bold">
                      {item.username}
                    </Text>

                    {!item.local ? (
                      <View bg="$gray3" px={5} py={4} borderRadius={5}>
                        <Text fontSize="$2" fontWeight="bold" color="#999">
                          {getDomain(item.url)}
                        </Text>
                      </View>
                    ) : null}
                  </XStack>
                  <XStack gap="$2" alignItems="center">
                    <Text color="$gray9" fontSize="$2">
                      {prettyCount(item.followers_count)} Followers
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
          <View px="$4" py="$3" bg="white">
            <XStack alignItems="center" gap="$4">
              <View
                w={30}
                h={30}
                borderRadius={50}
                bg="$gray3"
                justifyContent="center"
                alignItems="center"
              >
                <Feather name="hash" size={20} color="#000" />
              </View>
              <XStack
                flexGrow={1}
                gap={4}
                flexWrap="wrap"
                justifyContent="space-between"
                alignItems="center"
              >
                <Text fontSize="$6" w="70%" fontWeight="bold" flexWrap="wrap">
                  {item.name}
                </Text>
                <XStack>
                  <Text color="$gray9" fontSize="$3">
                    {prettyCount(item.count)} posts
                  </Text>
                </XStack>
              </XStack>
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
          autoCorrect={false}
          autoComplete="off"
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
