import { useCallback, useEffect, useState, useRef, useMemo } from 'react'
import { FlatList, StyleSheet, Pressable, ActivityIndicator } from 'react-native'
import { Text, View, XStack, Select, Adapt, Sheet } from 'tamagui'
import FeedPost from 'src/components/post/FeedPost'
import { StatusBar } from 'expo-status-bar'
import { Feather } from '@expo/vector-icons'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Link, Stack, useRouter } from 'expo-router'
import { useInfiniteQuery } from '@tanstack/react-query'
import { fetchNetworkFeed } from 'src/lib/api'
import FeedHeader from 'src/components/common/FeedHeader'
import { Storage } from 'src/state/cache'
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetBackdrop,
} from '@gorhom/bottom-sheet'
import CommentFeed from 'src/components/post/CommentFeed'

const keyExtractor = (_, index) => `post-${_.id}-${index}`

export default function NetworkScreen() {
  const router = useRouter()
  const [replyId, setReplyId] = useState(null)
  const bottomSheetModalRef = useRef(null)
  const snapPoints = useMemo(() => ['55%', '80%'], [])

  const handlePresentModalPress = useCallback(() => {
    bottomSheetModalRef.current?.present()
  }, [])
  const handleSheetChanges = useCallback((index: number) => {}, [])
  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={1} />
    ),
    []
  )

  const onOpenComments = useCallback(
    (id) => {
      setReplyId(id)
      bottomSheetModalRef.current?.present()
    },
    [replyId]
  )

  const userJson = Storage.getString('user.profile')
  const user = JSON.parse(userJson)

  const renderItem = useCallback(
    ({ item }) => <FeedPost post={item} user={user} onOpenComments={onOpenComments} />,
    []
  )

  const handleShowLikes = (id) => {
    bottomSheetModalRef.current?.close()
    router.push(`/post/likes/${id}`)
  }

  const handleCommentReport = (id) => {
    bottomSheetModalRef.current?.close()
    router.push(`/post/report/${id}`)
  }

  const {
    data,
    fetchNextPage,
    fetchPreviousPage,
    hasNextPage,
    hasPreviousPage,
    isFetchingNextPage,
    isFetching,
    isRefetching,
    refetch,
    isError,
    error,
  } = useInfiniteQuery({
    queryKey: ['fetchNetworkFeed'],
    initialPageParam: null,
    queryFn: fetchNetworkFeed,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    getPreviousPageParam: (lastPage) => lastPage.prevPage,
  })

  if (isFetching && !isFetchingNextPage && !isRefetching) {
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
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />
      <Stack.Screen options={{ headerShown: false }} />
      <FeedHeader title="Network" />
      <FlatList
        data={data?.pages.flatMap((page) => page.data)}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        refreshing={isRefetching}
        onRefresh={refetch}
        maxToRenderPerBatch={3}
        showsVerticalScrollIndicator={false}
        onEndReached={() => {
          if (hasNextPage) fetchNextPage()
        }}
        onEndReachedThreshold={0.5}
        ListFooterComponent={() => (isFetchingNextPage ? <ActivityIndicator /> : null)}
      />
      <BottomSheetModal
        ref={bottomSheetModalRef}
        index={1}
        snapPoints={snapPoints}
        onChange={handleSheetChanges}
        backdropComponent={renderBackdrop}
        keyboardBehavior={'extend'}
      >
        <CommentFeed
          id={replyId}
          showLikes={handleShowLikes}
          user={user}
          handleReport={handleCommentReport}
        />
      </BottomSheetModal>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
})
