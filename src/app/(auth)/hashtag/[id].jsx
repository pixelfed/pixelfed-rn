import { FlatList, Dimensions, ActivityIndicator } from 'react-native'
import { Image, ScrollView, Text, View, XStack, YStack, Button } from 'tamagui'
import ProfileHeader from '@components/profile/ProfileHeader'
import { Storage } from 'src/state/cache'
import { queryApi } from 'src/requests'
import { useState, useEffect, useCallback } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Stack, useLocalSearchParams, router, Link } from 'expo-router'
import { useQuery, useInfiniteQuery } from '@tanstack/react-query'
import { getHashtagByName, getHashtagByNameFeed } from 'src/lib/api'

const SCREEN_WIDTH = Dimensions.get('screen').width

export default function Page() {
  const { id } = useLocalSearchParams()

  const { data: hashtag } = useQuery({
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
        return p.pf_type == 'photo' && p.media_attachments.length
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
    enabled: !!hashtag,
  })

  if (isFetching && !isFetchingNextPage) {
    return (
      <View flexGrow={1} mt="$5">
        <ActivityIndicator color={'#000'} />
      </View>
    )
  }

  if (error) {
    return (
      <View flexGrow={1}>
        <Text>Error</Text>
      </View>
    )
  }

  const RenderItem = ({ item }) =>
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
    ) : null

  const Header = () => (
    <View p="$4">
      <XStack alignItems="center" gap="$4">
        <View w={100} h={100} borderRadius={100} bg="$gray6"></View>
        <YStack flexShrink={1} justifyContent="center" alignItems="center" gap="$2">
          <Text fontSize="$6">
            <Text fontWeight="bold">1M+</Text> <Text color="$gray9">posts</Text>
          </Text>
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
          <Text fontSize="$4" color="$gray9" flexWrap="wrap">
            Follow to see posts like these in your home feed
          </Text>
        </YStack>
      </XStack>
    </View>
  )

  return (
    <SafeAreaView edges={['bottom']}>
      <Stack.Screen
        options={{
          title: `#${id}`,
          headerBackTitle: 'Back',
        }}
      />
      <Header />
      <FlatList
        data={feed?.pages.flatMap((page) => page)}
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
