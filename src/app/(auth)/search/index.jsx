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
import { useState } from 'react'
import UserAvatar from 'src/components/common/UserAvatar'
import { prettyCount } from 'src/utils'
import Feather from '@expo/vector-icons/Feather'

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

  const RenderItem = ({ item }) => {
    if (item._type === 'account') {
      return (
        <View p="$3" bg="white">
          <XStack alignItems="center" gap="$3">
            <Link href={`/profile/${item.id}`} asChild>
              <Pressable>
                <UserAvatar url={item.avatar} />
              </Pressable>
            </Link>
            <YStack gap={4}>
              <XStack alignItems="center">
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
              </XStack>
              <XStack>
                <Text color="$gray9" fontSize="$3">
                  {prettyCount(item.followers_count)} Followers
                </Text>
              </XStack>
            </YStack>
          </XStack>
        </View>
      )
    }

    if (item._type === 'hashtag') {
      return (
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
      )
    }
  }

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
          ListFooterComponent={() =>
            isFetching ? <ActivityIndicator /> : <View h={200} />
          }
        />
      </View>
    </SafeAreaView>
  )
}
