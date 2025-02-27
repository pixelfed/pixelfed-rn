import { BottomSheetBackdrop, type BottomSheetModal } from '@gorhom/bottom-sheet'
import { useInfiniteQuery, useMutation } from '@tanstack/react-query'
import * as Haptics from 'expo-haptics'
//@ts-check
import { Stack, useNavigation, useRouter } from 'expo-router'
import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { ActivityIndicator, FlatList, Platform } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { PixelfedBottomSheetModal } from 'src/components/common/BottomSheets'
import CommentFeed from 'src/components/post/CommentFeed'
import FeedPost from 'src/components/post/FeedPost'
import { getSelfBookmarks, reblogStatus, unreblogStatus } from 'src/lib/api'
import { useUserCache } from 'src/state/AuthProvider'
import { Text, View } from 'tamagui'

export default function BookmarksScreen() {
  const navigation = useNavigation()
  const router = useRouter()
  const [replyId, setReplyId] = useState<string | undefined>()
  useLayoutEffect(() => {
    navigation.setOptions({ title: 'My Bookmarks', headerBackTitle: 'Back' })
  }, [navigation])
  const user = useUserCache()

  const bottomSheetModalRef = useRef<BottomSheetModal>(null)
  const snapPoints = useMemo(
    () => (Platform.OS === 'ios' ? ['50%', '85%'] : ['64%', '65%', '66%']),
    []
  )

  const handleSheetChanges = useCallback((index: number) => {}, [])
  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={1} />
    ),
    []
  )

  const onOpenComments = useCallback(
    (id: string) => {
      setReplyId(id)
      bottomSheetModalRef.current?.present()
    },
    [replyId]
  )

  const onShare = (id: string, state: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    try {
      shareMutation.mutate({ type: state == true ? 'unreblog' : 'reblog', id: id })
    } catch (error) {
      console.error('Error occurred during share:', error)
    }
  }

  const handleShowLikes = (id) => {
    bottomSheetModalRef.current?.close()
    router.push(`/post/likes/${id}`)
  }

  const handleGotoProfile = (id: string) => {
    bottomSheetModalRef.current?.close()
    router.push(`/profile/${id}`)
  }

  const handleGotoUsernameProfile = (username: string) => {
    bottomSheetModalRef.current?.close()
    router.push(`/profile/0?byUsername=${username}`)
  }

  const gotoHashtag = (id: string) => {
    bottomSheetModalRef.current?.close()
    router.push(`/hashtag/${id}`)
  }

  const handleCommentReport = (id: string) => {
    bottomSheetModalRef.current?.close()
    router.push(`/post/report/${id}`)
  }

  const shareMutation = useMutation({
    mutationFn: async (handleShare) => {
      try {
        return handleShare.type === 'reblog'
          ? await reblogStatus(handleShare)
          : await unreblogStatus(handleShare)
      } catch (error) {
        console.error('Error within mutationFn:', error)
        throw error
      }
    },
    onError: (error) => {
      console.error('Error handled by share useMutation:', error)
    },
  })

  const renderItem = useCallback(
    ({ item }) => (
      <FeedPost
        post={item}
        user={user}
        onOpenComments={() => onOpenComments(item.id)}
        onDeletePost={() => onDeletePost(item.id)}
        onShare={() => onShare(item.id, item.reblogged)}
      />
    ),
    []
  )
  const keyExtractor = useCallback((item) => item.id.toString(), [])

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
    queryKey: ['getSelfBookmarks'],
    initialPageParam: null,
    queryFn: getSelfBookmarks,
    refetchOnWindowFocus: false,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    getPreviousPageParam: (lastPage) => lastPage.prevPage,
  })

  if (isFetching && !isFetchingNextPage && !isRefetching) {
    return (
      <View flexGrow={1} mt="$5" py="$5" justifyContent="center" alignItems="center">
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
    <SafeAreaView edges={['left']}>
      <Stack.Screen
        options={{
          title: 'My Bookmarks',
          headerBackTitle: 'Back',
        }}
      />
      <FlatList
        data={data?.pages.flatMap((page) => page.data)}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) fetchNextPage()
        }}
        onEndReachedThreshold={0.5}
        ListFooterComponent={() =>
          isFetchingNextPage ? <ActivityIndicator /> : <View h={200} />
        }
      />

      <PixelfedBottomSheetModal
        ref={bottomSheetModalRef}
        index={Platform.OS === 'ios' ? 1 : 0}
        keyboardBehavior={Platform.OS === 'ios' ? 'extend' : 'interactive'}
        android_keyboardInputMode="adjustResize"
        snapPoints={snapPoints}
        onChange={handleSheetChanges}
        backdropComponent={renderBackdrop}
      >
        <CommentFeed
          id={replyId}
          showLikes={handleShowLikes}
          gotoProfile={handleGotoProfile}
          gotoUsernameProfile={handleGotoUsernameProfile}
          gotoHashtag={gotoHashtag}
          user={user}
          handleReport={handleCommentReport}
        />
      </PixelfedBottomSheetModal>
    </SafeAreaView>
  )
}
