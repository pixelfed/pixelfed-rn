import { useCallback, useEffect, useState, useRef, useMemo } from 'react'
import {
  FlatList,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Dimensions,
} from 'react-native'
import { Text, View, XStack, Select, Adapt, Sheet, YStack, Separator } from 'tamagui'
import FeedPost from 'src/components/post/FeedPost'
import { StatusBar } from 'expo-status-bar'
import { Feather } from '@expo/vector-icons'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Link, Stack } from 'expo-router'
import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { getStatusRepliesById } from 'src/lib/api'
import FeedHeader from 'src/components/common/FeedHeader'
import { Storage } from 'src/state/cache'
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetBackdrop,
  BottomSheetFooter,
  BottomSheetFlatList,
  BottomSheetTextInput,
} from '@gorhom/bottom-sheet'
import UserAvatar from '../common/UserAvatar'
import { _timeAgo } from 'src/utils'

const SCREEN_WIDTH = Dimensions.get('screen').width

export default function CommentFeed({ id }) {
  const [commentText, setComment] = useState()
  const renderItem = useCallback(
    ({ item }) => (
      <View style={styles.itemContainer}>
        <YStack flexShrink={1}>
          <XStack flexShrink={1}>
            <XStack gap="$3" flexGrow={1}>
              <UserAvatar url={item.account.avatar} width={30} height={30} />

              <YStack flexGrow={1} maxWidth={SCREEN_WIDTH - 150} gap={4}>
                <XStack gap="$2">
                  <Text fontSize="$3" fontWeight="bold">
                    {item.account.acct}
                  </Text>
                  <Text fontSize="$3" color="$gray9">
                    {_timeAgo(item.created_at)}
                  </Text>
                </XStack>
                <Text flexWrap="wrap" fontSize="$4">
                  {item.content_text}
                </Text>
                {/* <Pressable>
                  <Text mt="$2" fontWeight="bold" fontSize="$3" color="$gray9">
                    Reply
                  </Text>
                </Pressable> */}
              </YStack>
            </XStack>
            <YStack justifyContent="center" alignItems="center" gap="$1">
              <Feather name="heart" size={15} />
              {item.favourites_count ? (
                <Text fontSize="$3">{item.favourites_count}</Text>
              ) : null}
            </YStack>
          </XStack>
          {item.replies_count ? (
            <Pressable>
              <XStack>
                <Text>———</Text>
                <Text>View {item.replies_count} more replies</Text>
              </XStack>
            </Pressable>
          ) : null}
        </YStack>
      </View>
    ),
    []
  )

  const RenderHeader = useCallback(() => {
    return (
      <YStack mt="$1" mb="$3">
        <XStack pb="$4" justifyContent="center">
          <Text fontSize="$7" fontWeight={'bold'}>
            Comments
          </Text>
        </XStack>
        <Separator borderColor="$gray5" />
      </YStack>
    )
  }, [])

  const {
    data,
    fetchNextPage,
    fetchPreviousPage,
    hasNextPage,
    hasPreviousPage,
    isFetchingNextPage,
    isFetching,
    isError,
    error,
  } = useInfiniteQuery({
    queryKey: ['getStatusRepliesById', id],
    initialPageParam: null,
    queryFn: async ({ pageParam }) => {
      const data = await getStatusRepliesById(id, 0)
      return data
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    getPreviousPageParam: (lastPage) => lastPage.prevPage,
  })

  if (isFetching && !isFetchingNextPage) {
    return (
      <View flexGrow={1} mt="$5">
        <ActivityIndicator color={'#000'} />
      </View>
    )
  }

  if (isError && error) {
    return (
      <View flexGrow={1}>
        <Text>Error</Text>
      </View>
    )
  }
  return (
    <>
      <BottomSheetFlatList
        data={data?.pages.flatMap((page) => page.data)}
        keyExtractor={(i) => i?.id}
        renderItem={renderItem}
        ListHeaderComponent={RenderHeader}
        contentContainerStyle={styles.contentContainer}
      />
      <BottomSheetTextInput
        style={styles.input}
        value={commentText}
        onChangeText={setComment}
        multiline={true}
        placeholder="Add a comment..."
      />
    </>
  )
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 200,
  },
  contentContainer: {
    backgroundColor: 'white',
  },
  itemContainer: {
    width: SCREEN_WIDTH,
    padding: 15,
    marginBottom: 0,
    backgroundColor: '#fff',
  },
  input: {
    flexShrink: 1,
    alignItems: 'center',
    marginTop: 5,
    marginHorizontal: 15,
    marginBottom: 30,
    borderRadius: 10,
    minHeight: 50,
    fontSize: 20,
    lineHeight: 35,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(151, 151, 151, 0.25)',
    backgroundColor: 'rgba(151, 151, 151, 0.05)',
  },
})
