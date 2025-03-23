import { Feather } from '@expo/vector-icons'
import { FlashList } from '@shopify/flash-list'
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { Link, Stack, useLocalSearchParams } from 'expo-router'
import { memo, useCallback, useMemo } from 'react'
import { ActivityIndicator, Dimensions, FlatList } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import ImageComponent from 'src/components/ImageComponent'
import {
  followHashtag,
  getHashtagByName,
  getHashtagByNameFeed,
  getHashtagRelated,
  unfollowHashtag,
} from 'src/lib/api'
import { Button, ScrollView, Separator, Text, View, XStack, YStack, useTheme } from 'tamagui'
import { prettyCount } from '../../../utils'

const SCREEN_WIDTH = Dimensions.get('screen').width
const IMAGE_WIDTH = SCREEN_WIDTH / 3 - 2
const IMAGE_HEIGHT = IMAGE_WIDTH
const ITEM_HEIGHT = IMAGE_HEIGHT

const RenderItem = memo(({ item }) => {
  if (!item?.media_attachments?.[0]?.url) return null
  const theme = useTheme();
  return (
    <Link href={`/post/${item.id}`} asChild>
      <View flexShrink={1} style={{ borderWidth: 1, borderColor: theme.borderColor?.val.default.val }}>
        <ImageComponent
          placeholder={{ blurhash: item.media_attachments[0]?.blurhash || '' }}
          source={{
            uri: item.media_attachments[0].url,
          }}
          style={{
            width: IMAGE_WIDTH,
            height: IMAGE_HEIGHT,
          }}
          contentFit={'cover'}
        />
      </View>
    </Link>
  )
})

const ListFooter = memo(({ loading }) => {
  const theme = useTheme();
  return loading ? (
    <View p="$5">
      <ActivityIndicator color={theme.color?.val.default.val} />
    </View>
  ) : null
})


export default function Page() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const queryClient = useQueryClient()
  const theme = useTheme();

  const RelatedTags = useCallback(
    ({ relatedTags }) =>
      relatedTags && relatedTags.length ? (
        <View px="$3" pb="$3">
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {relatedTags.map((tag) => (
              <Link key={tag.name} href={`/hashtag/${tag.name}`} asChild>
                <View
                  bg="transparent"
                  px="$3"
                  py="$1.5"
                  mr="$2"
                  borderRadius={10}
                  borderWidth={1}
                  borderColor={theme.borderColor?.val.default.val}
                >
                  <Text color={theme.color?.val.secondary.val}>#{tag.name}</Text>
                </View>
              </Link>
            ))}
          </ScrollView>
        </View>
      ) : null,
    []
  )

  const RenderRelatedItem = useCallback(
    ({ item }) =>
      item && item.name ? (
        <View p="$3" borderWidth={1}>
          <Link href={`/hashtag/${item.name}`}>
            <View p="$3" borderWidth={1}>
              <Text fontSize="$5">{item.name}</Text>
            </View>
          </Link>
        </View>
      ) : null,
    []
  )

  const followMutation = useMutation({
    mutationFn: (action) => {
      return action === 'follow' ? followHashtag(id) : unfollowHashtag(id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['getHashtagByName'] })
      queryClient.invalidateQueries({ queryKey: ['getFollowedTags'] })
    },
  })

  const handleOnFollow = () => {
    followMutation.mutate('follow')
  }

  const handleOnUnfollow = () => {
    followMutation.mutate('unfollow')
  }

  const RenderEmpty = () => (
    <View flexGrow={1}>
      <Separator borderColor={theme.borderColor?.val.default.val} />
      <YStack h="100%" flexGrow={1} justifyContent="center" alignItems="center" padding="$4" gap="$3">
        <Feather name="alert-circle" size={40} color="#aaa" />
        <Text fontSize="$8" color={theme.color?.val.default.val}>No posts with this tag.</Text>
      </YStack>
    </View>
  )

  const { data: hashtag, isPending } = useQuery({
    queryKey: ['getHashtagByName', id],
    queryFn: getHashtagByName,
  })

  const {
    status,
    fetchStatus,
    data: feed,
    fetchNextPage,
    hasNextPage,
    hasPreviousPage,
    isFetchingNextPage,
    isFetching,
    isError,
    error,
  } = useInfiniteQuery({
    queryKey: ['getHashtagByNameFeed', id],
    queryFn: async ({ pageParam }) => {
      const data = await getHashtagByNameFeed(id, pageParam)

      return data.data?.filter((p) => {
        return p.pf_type == 'photo' && p.media_attachments.length && !p.sensitive
      })
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages, lastPageParam) => {
      if (lastPage.length === 0) {
        return undefined
      }

      const lowestId = lastPage.reduce((min, post) => {
        return BigInt(post.id) < BigInt(min) ? post.id : min
      }, lastPage[0].id)

      return String(BigInt(lowestId) - 1n)
    },
  })

  const {
    data: related,
    isFetching: relatedIsFetching,
    isError: relatedIsError,
    error: relatedError,
  } = useQuery({
    queryKey: ['getHashtagRelated', id],
    queryFn: async ({ pageParam }) => {
      const data = await getHashtagRelated(id)
      return data?.data
    },
    enabled: !!feed && !!hashtag,
  })

  const flattenedData = useMemo(() => {
    return feed?.pages.flat() || []
  }, [feed?.pages])

  const keyExtractor = useCallback((item) => item?.id.toString(), [])

  const getItemLayout = useCallback((data, index) => {
    const row = Math.floor(index / 3)
    return {
      length: ITEM_HEIGHT,
      offset: ITEM_HEIGHT * row,
      index,
    }
  }, [])

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetching) {
      fetchNextPage()
    }
  }, [hasNextPage, isFetching, fetchNextPage])

  const Header = useCallback(
    ({ hashtag, feed, onUnfollow, onFollow }) => {
      return (
        <View>
          <View p="$4" flexShrink={1}>
            <XStack alignItems="center" gap="$4">
              <View w={100} h={100}>
                {feed?.pages[0].length ? (
                  <ImageComponent
                    placeholder={{
                      blurhash: feed.pages[0][0]?.media_attachments[0]?.blurhash || '',
                    }}
                    source={{ uri: feed.pages[0][0].media_attachments[0].url }}
                    style={{
                      width: 100,
                      height: 100,
                      borderRadius: 100,
                      borderWidth: 1,
                      borderColor: theme.borderColor?.val.default.val,
                    }}
                    containFit={'cover'}
                  />
                ) : (
                  <View w={100} h={100} borderRadius={100} bg={theme.background?.val.tertiary.val}></View>
                )}
              </View>
              <YStack flex={1} justifyContent="center" alignItems="center" gap="$2">
                <Text fontSize="$6" allowFontScaling={false}>
                  <Text fontWeight="bold" color={theme.color?.val.default.val}>{prettyCount(hashtag?.count ?? 0)}</Text>{' '}
                  <Text color={theme.color?.val.default.val}>posts</Text>
                </Text>
                {hashtag?.count > 0 ? (
                  <>
                    {hashtag.following ? (
                      <Button
                        borderColor={theme.borderColor?.val.default.val}
                        h={35}
                        bg="transparent"
                        size="$5"
                        fontWeight="bold"
                        color={theme.color?.val.default.val}
                        alignSelf="stretch"
                        onPress={onUnfollow}
                      >
                        Unfollow
                      </Button>
                    ) : (
                      <Button
                        bg={theme.colorHover.val.active.val}
                        h={35}
                        size="$5"
                        color="white"
                        fontWeight="bold"
                        alignSelf="stretch"
                        onPress={onFollow}
                      >
                        Follow
                      </Button>
                    )}
                    {hashtag.following ? (
                      <Text
                        fontSize="$4"
                        color={theme.color?.val.tertiary.val}
                        flexWrap="wrap"
                        allowFontScaling={false}
                      >
                        You are following this hashtag
                      </Text>
                    ) : (
                      <Text
                        fontSize="$2"
                        color={theme.color?.val.tertiary.val}
                        flexWrap="wrap"
                        allowFontScaling={false}
                      >
                        Follow to see posts like these in your home feed
                      </Text>
                    )}
                  </>
                ) : null}
              </YStack>
            </XStack>
          </View>
          <RelatedTags relatedTags={related} />
        </View>
      )
    },
    [hashtag, feed, related]
  )

  if (isPending || (isFetching && !isFetchingNextPage)) {
    return (
      <>
        <Stack.Screen
          options={{
            title: `#${id}`,
            headerBackTitle: 'Back',
          }}
        />
        <View flexGrow={1} mt="$5">
          <ActivityIndicator color={theme.color?.val.default.val} />
        </View>
      </>
    )
  }

  if (error) {
    return (
      <View flexGrow={1}>
        <YStack justifyContent="center" alignItems="center" p="$4">
          <Text fontSize="$7" color={theme.color?.val.default.val}>Oops! An Error Occured.</Text>
          <Text color={theme.color?.val.secondary.val}>{error?.message}</Text>
        </YStack>
      </View>
    )
  }

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['left']}>
      <Stack.Screen
        options={{
          title: `#${id}`,
          headerBackTitle: 'Back',
        }}
      />
      {/* <Header hashtag={hashtag} feed={feed} /> */}
      <FlashList
        data={flattenedData}
        extraData={hashtag}
        keyExtractor={keyExtractor}
        renderItem={({ item }) => <RenderItem key={item?.id} item={item} />}
        horizontal={false}
        estimatedItemSize={IMAGE_HEIGHT}
        numColumns={3}
        showsVerticalScrollIndicator={false}
        maintainVisibleContentPosition={{ minIndexForVisible: 0 }}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.4}
        ListEmptyComponent={RenderEmpty}
        ListHeaderComponent={
          <Header
            hashtag={hashtag}
            feed={feed}
            onFollow={handleOnFollow}
            onUnfollow={handleOnUnfollow}
          />
        }
        ListFooterComponent={<ListFooter loading={isFetchingNextPage} />}
        getItemLayout={getItemLayout}
      />
    </SafeAreaView>
  )
}
