import { ActivityIndicator, FlatList, SafeAreaView, Dimensions } from 'react-native'
import { Text, YStack, ZStack, Button, ScrollView, View, XStack, Image } from 'tamagui'
import { Storage } from 'src/state/cache'
import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  getTrendingHashtags,
  getTrendingPopularAccounts,
  getTrendingPopularPosts,
  getTrendingPostsV1,
} from 'src/lib/api'
import { Link } from 'expo-router'
import UserAvatar from 'src/components/common/UserAvatar'
import { enforceLen, prettyCount } from 'src/utils'
import FastImage from 'react-native-fast-image'

const SCREEN_WIDTH = Dimensions.get('screen').width
export default function DiscoverScreen() {
  const RenderTags = ({ item }) => (
    <Link href={`/hashtag/${item.hashtag}`} asChild>
      <View bg="$gray3" py="$2" px="$3" borderRadius={5} mr="$2">
        <Text fontWeight="bold">{item.name}</Text>
      </View>
    </Link>
  )

  const AccountPartial = ({ item }) => (
    <Link href={`/profile/${item.id}`} asChild>
      <YStack
        px="$6"
        py="$3"
        borderWidth={1}
        borderColor="$gray5"
        borderRadius={10}
        justifyContent="center"
        alignItems="center"
        gap="$3"
        mr="$3"
      >
        <UserAvatar url={item.avatar} size="$3" />
        <YStack justifyContent="center" alignItems="center" gap="$2">
          <Text fontSize="$5" fontWeight="bold">
            {item.username}
          </Text>
          <Text fontSize="$2" color="$gray9">
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
          <View borderRadius={10} overflow="hidden">
            <FastImage
              source={{ uri: item.media_attachments[0].url }}
              style={{ width: SCREEN_WIDTH / 1.3, height: SCREEN_WIDTH / 1.3 }}
              resizeMode={FastImage.resizeMode.cover}
            />
            <Text
              position="absolute"
              zIndex={3}
              color="white"
              bottom={10}
              left={10}
              fontWeight={'bold'}
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
        <View borderRadius={10} overflow="hidden">
          <Image
            source={{
              uri: item.media_attachments[0].url,
              width: 160,
              height: 160,
            }}
            resizeMode="cover"
          />
          <Text
            position="absolute"
            zIndex={3}
            color="white"
            bottom={10}
            left={10}
            fontWeight={'bold'}
          >
            {enforceLen(item.account.acct, 15, true, 'end')}
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
    <SafeAreaView flex={1} edges={['top']} style={{ backgroundColor: '#fff' }}>
      <ScrollView>
        <YStack px="$5" py="$3">
          <Text fontSize="$10" fontWeight="bold" letterSpacing={-1.4}>
            Discover
          </Text>
        </YStack>
        {hashtags && hashtags.length ? (
          <View ml="$5" mt="$5">
            <YStack pb="$4" gap="$3">
              <Text fontSize="$6" allowFontScaling={false}>
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
              <Text fontSize="$6" allowFontScaling={false}>
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
              <Text fontSize="$6" allowFontScaling={false}>
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
              <Text fontSize="$6" allowFontScaling={false}>
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
