import { useCallback, useEffect, useState, useRef, useMemo } from 'react'
import { FlatList, StyleSheet, Pressable, ActivityIndicator } from 'react-native'
import { Text, View, XStack, Select, Adapt, Sheet } from 'tamagui'
import FeedPost from 'src/components/post/FeedPost'
import { StatusBar } from 'expo-status-bar'
import { Feather } from '@expo/vector-icons'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Link, Stack } from 'expo-router'
import { useInfiniteQuery } from '@tanstack/react-query'
import { fetchHomeFeed } from 'src/lib/api'
import FeedHeader from 'src/components/common/FeedHeader'
import { Storage } from 'src/state/cache'
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetBackdrop,
} from '@gorhom/bottom-sheet'
import CommentFeed from 'src/components/post/CommentFeed'

const keyExtractor = (_, index) => `post-${_.id}-${index}`

export default function HomeScreen() {
  const [replyId, setReplyId] = useState(null);
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ['55%', '60%'], []);

  const handlePresentModalPress = useCallback(() => {
    bottomSheetModalRef.current?.present()
  }, [])
  const handleSheetChanges = useCallback((index: number) => {
    console.log('handleSheetChanges', index);
  }, []);
  const renderBackdrop = useCallback((props: any) => (
      <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={1} />
    ),[]
  )

  const onOpenComments = useCallback((id) => {
    setReplyId(id)
    bottomSheetModalRef.current?.present()
  }, [replyId])

  const userJson = Storage.getString('user.profile')
  const user = JSON.parse(userJson)

  const renderItem = useCallback(({item}) => (
    <FeedPost post={item} user={user} onOpenComments={onOpenComments} />
  ), []);

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
    queryKey: ['homeFeed'],
    initialPageParam: null,
    queryFn: fetchHomeFeed,
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
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />
      <Stack.Screen options={{ headerShown: false }} />
      <FeedHeader title="Home" />
      <BottomSheetModal
        ref={bottomSheetModalRef}
        index={1}
        snapPoints={snapPoints}
        onChange={handleSheetChanges}
        backdropComponent={renderBackdrop}
        keyboardBehavior={'extend'}
      >
        <CommentFeed id={replyId} />
      </BottomSheetModal>
      <FlatList
        data={data?.pages.flatMap((page) => page.data)}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        maxToRenderPerBatch={3}
        showsVerticalScrollIndicator={false}
        onEndReached={() => {
          if (hasNextPage) fetchNextPage()
        }}
        onEndReachedThreshold={0.5}
        ListFooterComponent={() => (isFetchingNextPage ? <ActivityIndicator /> : null)}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
})
