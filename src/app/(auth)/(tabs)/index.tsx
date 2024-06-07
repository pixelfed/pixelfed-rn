import { useCallback, useEffect, useState, useRef, useMemo } from 'react'
import { FlatList, StyleSheet, Pressable, ActivityIndicator } from 'react-native'
import { Text, View, XStack, Select, Adapt, Sheet, Button } from 'tamagui'
import FeedPost from 'src/components/post/FeedPost'
import { StatusBar } from 'expo-status-bar'
import { Feather } from '@expo/vector-icons'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Link, Stack, useRouter } from 'expo-router'
import { useInfiniteQuery } from '@tanstack/react-query'
import { fetchHomeFeed } from 'src/lib/api'
import FeedHeader from 'src/components/common/FeedHeader'
import { Storage } from 'src/state/cache'
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetBackdrop,
  BottomSheetFooter,
  BottomSheetTextInput,
} from '@gorhom/bottom-sheet'
import CommentFeed from 'src/components/post/CommentFeed'
import { useShareIntentContext } from 'expo-share-intent'
import UserAvatar from 'src/components/common/UserAvatar'
import Welcome from 'src/components/onboarding/Welcome'

const keyExtractor = (_, index) => `post-${_.id}-${index}`

export default function HomeScreen() {
  const router = useRouter()
  const { hasShareIntent } = useShareIntentContext()

  useEffect(() => {
    if (hasShareIntent) {
      router.replace({ pathname: 'camera/shareintent' })
    }
  }, [hasShareIntent])

  const [replyId, setReplyId] = useState(null)
  const [sheetType, setSheetType] = useState('comments')
  const bottomSheetModalRef = useRef<BottomSheetModal>(null)
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
  const seenWelcome = Storage.contains('user.welcome')

  const renderItem = useCallback(
    ({ item }) => <FeedPost post={item} user={user} onOpenComments={onOpenComments} />,
    []
  )

  const EmptyFeed = () => {
    return (
      <View>
        <Text>No posts found</Text>
      </View>
    )
  }

  const handleShowLikes = (id) => {
    bottomSheetModalRef.current?.close()
    router.push(`/post/likes/${id}`)
  }

  const handleGotoProfile = (id) => {
    bottomSheetModalRef.current?.close()
    router.push(`/profile/${id}`)
  }

  const handleCommentReport = (id) => {
    bottomSheetModalRef.current?.close()
    router.push(`/post/report/${id}`)
  }

  useEffect(() => {
    if (!seenWelcome) {
      setTimeout(() => {
        setSheetType('welcome')
      }, 500)
      setTimeout(() => {
        bottomSheetModalRef.current?.present()
      }, 1500)
    }
  }, [seenWelcome])

  const handleOnContinue = () => {
    setSheetType('comments')
    Storage.set('user.welcome', true)
    bottomSheetModalRef.current?.close()
  }

  const {
    data,
    fetchNextPage,
    fetchPreviousPage,
    hasNextPage,
    hasPreviousPage,
    isFetchingNextPage,
    isRefetching,
    refetch,
    isFetching,
    isError,
    error,
  } = useInfiniteQuery({
    queryKey: ['homeFeed'],
    initialPageParam: null,
    queryFn: fetchHomeFeed,
    refetchOnWindowFocus: false,
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
      <FeedHeader title="Home" />
      <BottomSheetModal
        ref={bottomSheetModalRef}
        index={1}
        snapPoints={snapPoints}
        onChange={handleSheetChanges}
        backdropComponent={renderBackdrop}
        keyboardBehavior={'extend'}
      >
        {sheetType === 'comments' ? (
          <CommentFeed
            id={replyId}
            showLikes={handleShowLikes}
            gotoProfile={handleGotoProfile}
            user={user}
            handleReport={handleCommentReport}
          />
        ) : null}
        {sheetType === 'welcome' ? <Welcome onContinue={handleOnContinue} /> : null}
      </BottomSheetModal>
      <FlatList
        data={data?.pages.flatMap((page) => page.data)}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        maxToRenderPerBatch={3}
        refreshing={isRefetching}
        onRefresh={refetch}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<EmptyFeed />}
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
  input: {
    flexShrink: 1,
    margin: 10,
    alignItems: 'center',
    borderRadius: 10,
    fontSize: 20,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(151, 151, 151, 0.25)',
    backgroundColor: 'rgba(151, 151, 151, 0.05)',
  },
  footerContainer: {
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  footerText: {
    textAlign: 'center',
    color: 'white',
    fontWeight: '800',
  },
})
