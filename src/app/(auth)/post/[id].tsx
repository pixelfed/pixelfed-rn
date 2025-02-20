import { BottomSheetBackdrop, type BottomSheetModal } from '@gorhom/bottom-sheet'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Stack, router, useLocalSearchParams, useNavigation } from 'expo-router'
import { useCallback, useLayoutEffect, useMemo, useRef } from 'react'
//@ts-check
import { ActivityIndicator, Platform } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { PixelfedBottomSheetModal } from 'src/components/BottomSheets'
import CommentFeed from 'src/components/post/CommentFeed'
import FeedPost from 'src/components/post/FeedPost'
import { deleteStatusV1, getStatusById, reblogStatus, unreblogStatus } from 'src/lib/api'
import { useUserCache } from 'src/state/AuthProvider'
import { ScrollView, Text, View } from 'tamagui'

export default function Page() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const navigation = useNavigation()

  useLayoutEffect(() => {
    navigation.setOptions({ title: 'Post', headerBackTitle: 'Back' })
  }, [navigation])
  const user = useUserCache()
  const queryClient = useQueryClient()
  const bottomSheetModalRef = useRef<BottomSheetModal | null>(null)
  const snapPoints = useMemo(() => ['45%', '70%', '90%'], [])
  const renderBackdrop = useCallback(
    (props) => (
      <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={1} />
    ),
    []
  )
  const handleGotoProfile = (id: string) => {
    bottomSheetModalRef.current?.close()
    router.push(`/profile/${id}`)
  }

  const handleGotoHashtag = (id: string) => {
    bottomSheetModalRef.current?.close()
    router.push(`/hashtag/${id}`)
  }
  const onOpenComments = useCallback((id: string) => {
    bottomSheetModalRef.current?.present()
  }, [])

  const onShare = (id: string, state) => {
    shareMutation.mutate({ type: state == true ? 'unreblog' : 'reblog', id: id })
  }

  const shareMutation = useMutation({
    mutationFn: async (handleShare) => {
      return handleShare.type === 'reblog'
        ? await reblogStatus(handleShare)
        : await unreblogStatus(handleShare)
    },
  })

  const handleGotoUsernameProfile = (id: string) => {
    bottomSheetModalRef.current?.close()
    router.push(`/profile/0?byUsername=${id.slice(1)}`)
  }

  const handleShowLikes = (id: string) => {
    bottomSheetModalRef.current?.close()
    router.push(`/post/likes/${id}`)
  }

  const handleCommentReport = (id: string) => {
    bottomSheetModalRef.current?.close()
    router.push(`/post/report/${id}`)
  }

  const onDeletePost = (id: string) => {
    deletePostMutation.mutate(id)
  }

  const deletePostMutation = useMutation({
    mutationFn: async (id: string) => {
      return await deleteStatusV1(id)
    },
    onSuccess: (data, variables) => {
      router.replace('/')
    },
  })

  const { isPending, isError, data, error } = useQuery({
    queryKey: ['getStatusById', id],
    queryFn: () => getStatusById(id),
  })

  if (isPending) {
    return (
      <View flexGrow={1} mt="$5">
        <ActivityIndicator color={'#000'} />
      </View>
    )
  }

  if (isError) {
    return <Text>Error: {error?.message}</Text>
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }} edges={['bottom']}>
      <Stack.Screen
        options={{
          title: 'Post',
          headerBackTitle: 'Back',
        }}
      />
      <PixelfedBottomSheetModal
        ref={bottomSheetModalRef}
        index={2}
        snapPoints={snapPoints}
        backdropComponent={renderBackdrop}
        keyboardBehavior={Platform.OS === 'ios' ? 'extend' : 'interactive'}
        android_keyboardInputMode="adjustResize"
      >
        <CommentFeed
          id={id}
          user={user}
          showLikes={handleShowLikes}
          handleReport={handleCommentReport}
          gotoProfile={handleGotoProfile}
          gotoHashtag={handleGotoHashtag}
          gotoUsernameProfile={handleGotoUsernameProfile}
        />
      </PixelfedBottomSheetModal>
      <ScrollView flexShrink={1}>
        <FeedPost
          post={data}
          user={user}
          onOpenComments={onOpenComments}
          onDeletePost={onDeletePost}
          disableReadMore={true}
          isPermalink={true}
          onShare={() => onShare(data?.id, data?.reblogged)}
        />
      </ScrollView>
    </SafeAreaView>
  )
}
