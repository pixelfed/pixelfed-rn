import { FlatList, Dimensions, ActivityIndicator } from 'react-native'
import { ScrollView, Text, View, XStack, YStack, Button, Separator } from 'tamagui'
import { useCallback } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Stack, useLocalSearchParams, Link } from 'expo-router'
import {
  useQuery,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'
import {
  getHashtagByName,
  getHashtagByNameFeed,
  getHashtagRelated,
  followHashtag,
  unfollowHashtag,
} from 'src/lib/api'
import { prettyCount } from '../../../utils'
import FastImage from 'react-native-fast-image'
import { Feather } from '@expo/vector-icons'
import { Blurhash } from 'react-native-blurhash'

const SCREEN_WIDTH = Dimensions.get('screen').width
const IMAGE_WIDTH = SCREEN_WIDTH / 3 - 2

const RenderItem = ({ item }) =>
  item && item.media_attachments && item.media_attachments[0].url ? (
    <Link href={`/post/${item.id}`} asChild>
      <View flexShrink={1} style={{ borderWidth: 1, borderColor: 'white' }}>
        {item.media_attachments[0]?.blurhash ? (
          <Blurhash
            blurhash={item.media_attachments[0].blurhash}
            style={{
              flex: 1,
              position: 'absolute',
              width: IMAGE_WIDTH,
              height: IMAGE_WIDTH,
            }}
          />
        ) : null}
        <FastImage
          source={{
            uri: item.media_attachments[0].url,
          }}
          style={{
            width: IMAGE_WIDTH,
            height: IMAGE_WIDTH,
          }}
          resizeMode={FastImage.resizeMode.cover}
        />
      </View>
    </Link>
  ) : null

export default function Page() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const queryClient = useQueryClient()

  const RelatedTags = useCallback(
    ({ relatedTags }) =>
      relatedTags && relatedTags.length ? (
        <View px="$3" pb="$3">
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {relatedTags.map((tag) => (
              <Link key={tag.name} href={`/hashtag/${tag.name}`} asChild>
                <View bg="$gray6" px="$3" py="$2" mr="$2" borderRadius={10}>
                  <Text>{tag.name}</Text>
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
    },
  })

  const handleOnFollow = () => {
    followMutation.mutate('follow')
  }

  const handleOnUnfollow = () => {
    followMutation.mutate('unfollow')
  }

  const RenderEmpty = () => (
    <View flex={1}>
      <Separator borderColor="#ccc" />
      <YStack flexGrow={1} justifyContent="center" alignItems="center" gap="$3">
        <Feather name="alert-circle" size={40} color="#aaa" />
        <Text fontSize="$8">No posts with this tag.</Text>
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
      let lowestId = lastPage.reduce((min, obj) => {
        if (obj.id < min) {
          return obj.id
        }
        return min
      }, lastPage[0].id)
      return lowestId
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

  const Header = useCallback(
    ({ hashtag, feed, onUnfollow, onFollow }) => {
      return (
        <View>
          <View p="$4" flexShrink={1}>
            <XStack alignItems="center" gap="$4">
              <View w={100} h={100}>
                {feed?.pages[0].length ? (
                  <FastImage
                    source={{ uri: feed.pages[0][0].media_attachments[0].url }}
                    style={{
                      width: 100,
                      height: 100,
                      borderRadius: 100,
                      borderWidth: 1,
                      borderColor: '#eee',
                    }}
                    resizeMode={FastImage.resizeMode.cover}
                  />
                ) : (
                  <View w={100} h={100} borderRadius={100} bg="$gray6"></View>
                )}
              </View>
              <YStack flex={1} justifyContent="center" alignItems="center" gap="$2">
                <Text fontSize="$6" allowFontScaling={false}>
                  <Text fontWeight="bold">{prettyCount(hashtag?.count ?? 0)}</Text>{' '}
                  <Text color="$gray9">posts</Text>
                </Text>
                {hashtag?.count > 0 ? (
                  <>
                    {hashtag.following ? (
                      <Button
                        borderColor="$blue9"
                        h={35}
                        size="$5"
                        fontWeight="bold"
                        color="$blue9"
                        alignSelf="stretch"
                        onPress={onUnfollow}
                      >
                        Unfollow
                      </Button>
                    ) : (
                      <Button
                        bg="$blue9"
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
                        color="$gray9"
                        flexWrap="wrap"
                        allowFontScaling={false}
                      >
                        You are following this hashtag
                      </Text>
                    ) : (
                      <Text
                        fontSize="$2"
                        color="$gray9"
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
          <ActivityIndicator color={'#000'} />
        </View>
      </>
    )
  }

  if (error) {
    return (
      <View flexGrow={1}>
        <YStack justifyContent="center" alignItems="center" p="$4">
          <Text fontSize="$7">Oops! An Error Occured.</Text>
          <Text>{error?.message}</Text>
        </YStack>
      </View>
    )
  }

  return (
    <SafeAreaView edges={['left']}>
      <Stack.Screen
        options={{
          title: `#${id}`,
          headerBackTitle: 'Back',
        }}
      />
      {/* <Header hashtag={hashtag} feed={feed} /> */}
      <FlatList
        data={feed?.pages.flat()}
        extraData={hashtag}
        keyExtractor={(item, index) => item?.id}
        renderItem={RenderItem}
        numColumns={3}
        showsVerticalScrollIndicator={false}
        onEndReached={() => {
          if (hasNextPage) {
            if (!isFetching) {
              fetchNextPage()
            }
          }
        }}
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
        ListFooterComponent={
          isFetchingNextPage ? (
            <View p="$5">
              <ActivityIndicator />
            </View>
          ) : null
        }
        getItemLayout={(data, index) => {
          const column = index % 3
          const row = Math.floor(index / 3)

          return {
            length: IMAGE_WIDTH,
            offset: (IMAGE_WIDTH + 2) * column,
            index,
          }
        }}
      />
    </SafeAreaView>
  )
}
