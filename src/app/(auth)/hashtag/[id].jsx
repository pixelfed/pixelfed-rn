import { FlatList, Dimensions, ActivityIndicator, ScrollViewBase } from 'react-native'
import { Image, ScrollView, Text, View, XStack, YStack, Button } from 'tamagui'
import ProfileHeader from '@components/profile/ProfileHeader'
import { Storage } from 'src/state/cache'
import { queryApi } from 'src/requests'
import { useState, useEffect, useCallback } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Stack, useLocalSearchParams, router, Link } from 'expo-router'
import { useQuery, useInfiniteQuery } from '@tanstack/react-query'
import { getHashtagByName, getHashtagByNameFeed, getHashtagRelated } from 'src/lib/api'
import { prettyCount } from '../../../utils'
import FastImage from 'react-native-fast-image'

const SCREEN_WIDTH = Dimensions.get('screen').width

export default function Page() {
  const { id } = useLocalSearchParams()

  const RenderItem = useCallback(
    ({ item }) =>
      item && item.media_attachments && item.media_attachments[0].url ? (
        <Link href={`/post/${item.id}`} asChild>
          <View flexShrink={1} style={{ borderWidth: 1, borderColor: 'white' }}>
            <Image
              source={{
                uri: item.media_attachments[0].url,
                width: SCREEN_WIDTH / 3 - 2,
                height: SCREEN_WIDTH / 3 - 2,
              }}
              resizeMode="cover"
            />
          </View>
        </Link>
      ) : null,
    []
  )

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
      return data.data.filter((p) => {
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
    enabled: !isPending,
  })

  const Header = useCallback(
    ({ hashtag, feed }) => {
      return (
        <View p="$4">
          <XStack alignItems="center" gap="$4">
            <View w={100} h={100}>
              {feed?.pages ? (
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
            <YStack flexGrow={1} justifyContent="center" alignItems="center" gap="$2">
              <Text fontSize="$6">
                <Text fontWeight="bold">{prettyCount(hashtag?.count)}</Text>{' '}
                <Text color="$gray9">posts</Text>
              </Text>
              {hashtag.following ? (
                <Button
                  borderColor="$blue9"
                  h={35}
                  size="$5"
                  fontWeight="bold"
                  color="$blue9"
                  alignSelf="stretch"
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
                >
                  Follow
                </Button>
              )}
              {hashtag.following ? (
                <Text fontSize="$4" color="$gray9" flexWrap="wrap">
                  You are following this hashtag
                </Text>
              ) : (
                <Text fontSize="$4" color="$gray9" flexWrap="wrap">
                  Follow to see posts like these in your home feed
                </Text>
              )}
            </YStack>
          </XStack>
        </View>
      )
    },
    [hashtag, feed]
  )

  const {
    data: related,
    isFetching: relatedIsFetching,
    isError: relatedIsError,
    error: relatedError,
  } = useQuery({
    queryKey: ['getHashtagRelated', id],
    queryFn: async ({ pageParam }) => {
      const data = await getHashtagRelated(id)
      return data.data
    },
  })

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

  if (error || relatedError) {
    return (
      <View flexGrow={1}>
        <Text>Error</Text>
      </View>
    )
  }

  return (
    <SafeAreaView edges={['bottom']}>
      <Stack.Screen
        options={{
          title: `#${id}`,
          headerBackTitle: 'Back',
        }}
      />
      <Header hashtag={hashtag} feed={feed} />
      <RelatedTags relatedTags={related} />
      <FlatList
        data={feed?.pages.flat()}
        extraData={hashtag}
        keyExtractor={(item, index) => item?.id}
        renderItem={RenderItem}
        numColumns={3}
        showsVerticalScrollIndicator={false}
        maxToRenderPerBatch={20}
        onEndReached={() => {
          if (hasNextPage) {
            if (!isFetching) {
              fetchNextPage()
            }
          }
        }}
        onEndReachedThreshold={0.9}
        ListFooterComponent={() =>
          isFetching || isFetchingNextPage ? (
            <View p="$5">
              <ActivityIndicator />
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  )
}
