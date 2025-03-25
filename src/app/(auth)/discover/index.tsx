import { useQuery } from '@tanstack/react-query'
import { Link, Stack, useRouter } from 'expo-router'
import { ActivityIndicator, Dimensions, FlatList, SafeAreaView } from 'react-native'
import ImageComponent from 'src/components/ImageComponent'
import UserAvatar from 'src/components/common/UserAvatar'
import {
  getTrendingHashtags,
  getTrendingPopularPosts,
  getTrendingPostsV1,
} from 'src/lib/api'
import { enforceLen, prettyCount } from 'src/utils'
import { ScrollView, Text, View, YStack, useTheme } from 'tamagui'

const SCREEN_WIDTH = Dimensions.get('screen').width

export default function DiscoverScreen() {
  const router = useRouter()
  const theme = useTheme()

  const RenderTags = ({ item }) => (
    <Link href={`/hashtag/${item.hashtag}`} asChild>
      <View
        bg={theme.background?.val.tertiary.val}
        py="$2"
        px="$3"
        borderRadius={5}
        mr="$2"
      >
        <Text fontWeight="bold" color={theme.color?.val.default.val}>
          {item.name}
        </Text>
      </View>
    </Link>
  )

  const AccountPartial = ({ item }) => (
    <Link href={`/profile/${item.id}`} asChild>
      <YStack
        px="$6"
        py="$3"
        borderWidth={1}
        borderColor={theme.borderColor?.val.default.val}
        borderRadius={10}
        justifyContent="center"
        alignItems="center"
        gap="$3"
        mr="$3"
      >
        <UserAvatar url={item.avatar} size="$3" />
        <YStack justifyContent="center" alignItems="center" gap="$2">
          <Text fontSize="$5" fontWeight="bold" color={theme.color?.val.default.val}>
            {item.username}
          </Text>
          <Text fontSize="$2" color={theme.color?.val.tertiary.val}>
            {prettyCount(item.followers_count)} Followers
          </Text>
        </YStack>
      </YStack>
    </Link>
  )
  const RenderAccounts = ({ item, index }) => <AccountPartial item={item} />

  const RenderTrendingPosts = ({ item }) => {
    return (
      <Link href={`/post/${item.id}`} asChild>
        <YStack justifyContent="center" alignItems="center" gap="$2" mr="$3">
          <View
            borderRadius={10}
            borderWidth={1}
            borderColor={theme.borderColor?.val.default.val}
            overflow="hidden"
            bg={theme.background?.val.tertiary.val}
          >
            <ImageComponent
              placeholder={{ blurhash: item.media_attachments[0]?.blurhash || '' }}
              source={{ uri: item.media_attachments[0].url }}
              style={{ width: SCREEN_WIDTH / 1.3, height: SCREEN_WIDTH / 1.3 }}
              contentFit={'cover'}
            />
            <Text
              color={theme.color?.val.default.val}
              alignSelf="center"
              fontWeight={'bold'}
              fontSize="$1"
              allowFontScaling={false}
              py={4}
            >
              {enforceLen(item.account.acct, 15, true, 'end')}
            </Text>
          </View>
        </YStack>
      </Link>
    )
  }

  const RenderPosts = ({ item }) => (
    <Link href={`/post/${item.id}`} asChild>
      <YStack justifyContent="center" alignItems="center" gap="$2" mr="$3">
        <View
          borderRadius={10}
          borderWidth={1}
          borderColor={theme.borderColor?.val.default.val}
          overflow="hidden"
          bg={theme.background?.val.tertiary.val}
        >
          <ImageComponent
            placeholder={{ blurhash: item.media_attachments[0]?.blurhash || '' }}
            source={{
              uri: item.media_attachments[0].url,
            }}
            style={{
              width: 160,
              height: 160,
            }}
            contentFit="cover"
          />
          <Text
            color={theme.color?.val.default.val}
            alignSelf="center"
            fontWeight={'bold'}
            fontSize="$1"
            allowFontScaling={false}
            py={4}
          >
            {enforceLen(item.account.acct, 13, true, 'end')}
          </Text>
        </View>
      </YStack>
    </Link>
  )

  const {
    isPending,
    isError,
    data: hashtags,
    error,
  } = useQuery({
    queryKey: ['getTrendingHashtags'],
    queryFn: getTrendingHashtags,
  })

  const { data: posts, isPending: isPopularPostsPending } = useQuery({
    queryKey: ['getTrendingPopularPosts'],
    queryFn: getTrendingPopularPosts,
    enabled: !!hashtags,
  })

  const { data: trendingPosts, isPending: isTrendingPostsPending } = useQuery({
    queryKey: ['getTrendingPostsV1'],
    queryFn: getTrendingPostsV1,
    enabled: !!hashtags,
  })

  if (isPending || isPopularPostsPending || isTrendingPostsPending) {
    return (
      <View flexGrow={1} justifyContent="center" alignItems="center" py="$10">
        <ActivityIndicator />
      </View>
    )
  }

  if (isError) {
    return (
      <View>
        <Text>Error: {error.message}</Text>
      </View>
    )
  }
  return (
    <SafeAreaView
      flex={1}
      edges={['top', 'bottom']}
      style={{ backgroundColor: theme.background?.val.default.val }}
    >
      <Stack.Screen
        options={{
          title: 'Explore',
        }}
      />
      <ScrollView flexGrow={1}>
        {hashtags && hashtags.length ? (
          <View ml="$5" mt="$5">
            <YStack pb="$4" gap="$3">
              <Text
                fontSize="$6"
                allowFontScaling={false}
                color={theme.color?.val.secondary.val}
              >
                Trending tags
              </Text>
              <FlatList
                data={hashtags}
                renderItem={RenderTags}
                showsHorizontalScrollIndicator={false}
                horizontal
              />
            </YStack>
          </View>
        ) : null}

        {trendingPosts && trendingPosts.accounts ? (
          <View ml="$5" mt="$5">
            <YStack pb="$4" gap="$3">
              <Text
                fontSize="$6"
                allowFontScaling={false}
                color={theme.color?.val.secondary.val}
              >
                Popular accounts
              </Text>
              <FlatList
                data={trendingPosts.accounts}
                renderItem={RenderAccounts}
                showsHorizontalScrollIndicator={false}
                horizontal
              />
            </YStack>
          </View>
        ) : null}

        {posts && posts.length ? (
          <View ml="$5" mt="$5">
            <YStack pb="$4" gap="$3">
              <Text
                fontSize="$6"
                allowFontScaling={false}
                color={theme.color?.val.secondary.val}
              >
                Trending today
              </Text>
              <FlatList
                data={posts}
                renderItem={RenderPosts}
                showsHorizontalScrollIndicator={false}
                horizontal
              />
            </YStack>
          </View>
        ) : null}

        {trendingPosts && trendingPosts.posts ? (
          <View ml="$5" mt="$5">
            <YStack pb="$4" gap="$3">
              <Text
                fontSize="$6"
                allowFontScaling={false}
                color={theme.color?.val.secondary.val}
              >
                Popular around the fediverse
              </Text>
              <FlatList
                data={trendingPosts.posts}
                renderItem={RenderTrendingPosts}
                horizontal
              />
            </YStack>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  )
}
