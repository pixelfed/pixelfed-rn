import Feather from '@expo/vector-icons/Feather'
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs'
import { useQuery } from '@tanstack/react-query'
import { Link, Stack, useLocalSearchParams } from 'expo-router'
import { useCallback, useState } from 'react'
import { ActivityIndicator, FlatList, Keyboard, Pressable } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import UserAvatar from 'src/components/common/UserAvatar'
import { searchQuery } from 'src/lib/api'
import { getDomain, prettyCount } from 'src/utils'
import { Input, Text, useTheme, View, XStack, YStack } from 'tamagui'
import { formatTimestampMonthYear } from '../../../utils'

const Tab = createMaterialTopTabNavigator()

const RenderEmptyResults = ({ message = 'No results found' }) => {
  const theme = useTheme()
  return (
    <View flex={1} flexGrow={1} justifyContent="center" alignItems="center" py="$5">
      <YStack justifyContent="center" alignItems="center" gap="$5">
        <Feather name="alert-circle" size={50} color={theme.color?.val.default.val} />
        <Text fontSize="$6" color={theme.color?.val.secondary.val}>
          {message}
        </Text>
      </YStack>
    </View>
  )
}

const AccountResultsTab = ({ accounts, isFetching, query }) => {
  const theme = useTheme()
  const RenderAccountItem = useCallback(
    ({ item }) => (
      <View p="$3" bg={theme.background?.val.default.val}>
        <Link href={`/profile/${item.id}`} asChild>
          <Pressable>
            <XStack alignItems="center" gap="$3">
              <UserAvatar url={item.avatar} width={40} height={40} />
              <YStack flexGrow={1} gap={4} w="50%">
                <XStack alignItems="center" gap="$2" flexWrap="wrap">
                  <Text
                    fontSize="$6"
                    fontWeight="bold"
                    color={theme.color?.val.default.val}
                  >
                    {item.username}
                  </Text>

                  {!item.local ? (
                    <View bg="$gray3" px={5} py={4} borderRadius={5}>
                      <Text
                        fontSize="$2"
                        fontWeight="bold"
                        color={theme.color?.val.tertiary.val}
                      >
                        {getDomain(item.url)}
                      </Text>
                    </View>
                  ) : null}
                </XStack>
                <XStack gap="$2" alignItems="center">
                  <Text color={theme.color?.val.secondary.val} fontSize="$2">
                    {prettyCount(item.followers_count)} Followers
                  </Text>
                  <Text color={theme.color?.val.tertiary.val}>·</Text>
                  <Text color={theme.color?.val.secondary.val} fontSize="$2">
                    {item.local ? 'Joined' : 'First seen'}{' '}
                    {formatTimestampMonthYear(item.created_at)}
                  </Text>
                </XStack>
              </YStack>
            </XStack>
          </Pressable>
        </Link>
      </View>
    ),
    []
  )

  const EmptyAccountsList = () =>
    query && query.length && !isFetching ? (
      <RenderEmptyResults message="No accounts found" />
    ) : null

  return (
    <View flex={1}>
      <FlatList
        data={accounts}
        renderItem={RenderAccountItem}
        ItemSeparatorComponent={() => <View h={1} bg="$gray4" />}
        onScrollBeginDrag={() => Keyboard.dismiss()}
        ListEmptyComponent={EmptyAccountsList}
        ListFooterComponent={() =>
          isFetching ? (
            <View mt="$3">
              <ActivityIndicator />
            </View>
          ) : (
            <View h={200} />
          )
        }
      />
    </View>
  )
}

const HashtagResultsTab = ({ hashtags, isFetching, query }) => {
  const theme = useTheme()

  const RenderHashtagItem = useCallback(
    ({ item }) => (
      <Link href={`/hashtag/${item.name}`} asChild>
        <View px="$4" py="$3" bg={theme.background?.val.default.val}>
          <XStack alignItems="center" gap="$4">
            <View
              w={30}
              h={30}
              borderRadius={50}
              bg={theme.background?.val.tertiary.val}
              justifyContent="center"
              alignItems="center"
            >
              <Feather name="hash" size={20} color={theme.color?.val.tertiary.val} />
            </View>
            <XStack
              flexGrow={1}
              gap={4}
              flexWrap="wrap"
              justifyContent="space-between"
              alignItems="center"
            >
              <Text
                fontSize="$6"
                w="70%"
                fontWeight="bold"
                flexWrap="wrap"
                color={theme.color?.val.default.val}
              >
                {item.name}
              </Text>
              <XStack>
                <Text color={theme.color?.val.tertiary.val} fontSize="$3">
                  {prettyCount(item.count)} posts
                </Text>
              </XStack>
            </XStack>
          </XStack>
        </View>
      </Link>
    ),
    []
  )

  const EmptyHashtagsList = () =>
    query && query.length && !isFetching ? (
      <RenderEmptyResults message="No hashtags found" />
    ) : null

  return (
    <View flex={1}>
      <FlatList
        data={hashtags}
        renderItem={RenderHashtagItem}
        ItemSeparatorComponent={() => (
          <View h={1} bg={theme.background?.val.tertiary.val} />
        )}
        onScrollBeginDrag={() => Keyboard.dismiss()}
        ListEmptyComponent={EmptyHashtagsList}
        ListFooterComponent={() =>
          isFetching ? (
            <View mt="$3">
              <ActivityIndicator />
            </View>
          ) : (
            <View h={200} />
          )
        }
      />
    </View>
  )
}

const PostResultsTab = ({ posts, isFetching, query }) => {
  const theme = useTheme()
  const RenderPostItem = useCallback(
    ({ item }) => (
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
                  <Text fontSize="$6" fontWeight="bold">
                    {item.account.username}
                  </Text>

                  {!item.account.local ? (
                    <Text fontSize="$6" color="$gray9">
                      @{getDomain(item.account.url)}
                    </Text>
                  ) : null}
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
    ),
    []
  )

  const EmptyPostsList = () =>
    query && query.length && !isFetching ? (
      <RenderEmptyResults message="No posts found" />
    ) : null

  return (
    <View flex={1}>
      <FlatList
        data={posts}
        renderItem={RenderPostItem}
        ItemSeparatorComponent={() => <View h={1} bg="$gray4" />}
        onScrollBeginDrag={() => Keyboard.dismiss()}
        ListEmptyComponent={EmptyPostsList}
        ListFooterComponent={() =>
          isFetching ? (
            <View mt="$3">
              <ActivityIndicator color={theme.color.val.default.val} />
            </View>
          ) : (
            <View h={200} />
          )
        }
      />
    </View>
  )
}

// Main Search Screen
export default function SearchScreen() {
  const { initialQuery } = useLocalSearchParams<{ initialQuery?: string }>()
  const [query, setQuery] = useState(initialQuery || '')
  const theme = useTheme()

  const { data, isLoading, isError, error, isFetching } = useQuery({
    queryKey: ['search', query],
    queryFn: () => searchQuery(query.toLowerCase()),
    keepPreviousData: true,
  })

  const accounts = data?.filter((item) => item._type === 'account') || []
  const hashtags = data?.filter((item) => item._type === 'hashtag') || []
  const posts = data?.filter((item) => item._type === 'status') || []

  if (isLoading && !isFetching) {
    return (
      <View mt="$4">
        <ActivityIndicator color={theme.color?.val.defaut.val} />
      </View>
    )
  }

  if (isError) {
    return <Text>Error: {error?.message}</Text>
  }

  return (
    <SafeAreaView edges={['bottom']} style={{ flex: 1 }}>
      <Stack.Screen
        options={{
          title: 'Search',
          headerBackTitle: 'Back',
        }}
      />
      <View flex={1}>
        <Input
          placeholder="Search by hashtag, profile or url"
          m="$3"
          onChangeText={(text) => setQuery(text)}
          value={query}
          bg={theme.background?.val.default.val}
          borderWidth={1}
          color={theme.color?.val.default.val}
          placeholderTextColor={theme.color?.val.tertiary.val}
          borderColor={theme.borderColor?.val.default.val}
          autoCorrect={false}
          autoComplete="off"
          autoFocus={true}
          size="$6"
        />

        <View flex={1}>
          <Tab.Navigator
            screenOptions={{
              tabBarLabelStyle: { fontSize: 12, fontWeight: 'bold' },
              tabBarIndicatorStyle: {
                backgroundColor: theme.background?.val.inverse.val,
              },
              tabBarStyle: {
                elevation: 0,
                shadowOpacity: 0,
                borderBottomColor: theme.borderColor?.val.default.val,
                borderBottomWidth: 1,
              },
            }}
          >
            <Tab.Screen name="Accounts" options={{ tabBarLabel: 'Accounts' }}>
              {() => (
                <AccountResultsTab
                  accounts={accounts}
                  isFetching={isFetching}
                  query={query}
                />
              )}
            </Tab.Screen>
            <Tab.Screen name="Hashtags" options={{ tabBarLabel: 'Hashtags' }}>
              {() => (
                <HashtagResultsTab
                  hashtags={hashtags}
                  isFetching={isFetching}
                  query={query}
                />
              )}
            </Tab.Screen>
            <Tab.Screen name="Posts" options={{ tabBarLabel: 'Posts' }}>
              {() => (
                <PostResultsTab posts={posts} isFetching={isFetching} query={query} />
              )}
            </Tab.Screen>
          </Tab.Navigator>
        </View>
      </View>
    </SafeAreaView>
  )
}
