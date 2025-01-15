//@ts-check
import { ActivityIndicator, Platform } from 'react-native'
import { ScrollView, Text, View } from 'tamagui'
import { Storage } from 'src/state/cache'
import { useRef, useMemo, useCallback, useLayoutEffect } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Stack, useLocalSearchParams, router, useNavigation } from 'expo-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getStatusById,
  deleteStatusV1,
  reblogStatus,
  unreblogStatus,
} from 'src/lib/api'
import FeedPost from 'src/components/post/FeedPost'
import {
  BottomSheetModal,
  BottomSheetBackdrop,
} from '@gorhom/bottom-sheet'
import CommentFeed from 'src/components/post/CommentFeed'
import { useLikeMutation } from 'src/hooks/mutations/useLikeMutation'


export default function Page() {
  const { id } = useLocalSearchParams()
  const navigation = useNavigation()

  useLayoutEffect(() => {
    navigation.setOptions({ title: 'Post', headerBackTitle: 'Back' })
  }, [navigation])
  const user = JSON.parse(Storage.getString('user.profile'))
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
  const onOpenComments = useCallback((id) => {
    bottomSheetModalRef.current?.present()
  }, [])

  const { handleLike } = useLikeMutation({
    onSuccess: () => {
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['getStatusById'] })
      }, 1000)
    },
  })

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
    queryFn: getStatusById,
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
      <BottomSheetModal
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
      </BottomSheetModal>
      <ScrollView flexShrink={1}>
        <FeedPost
          post={data}
          user={user}
          onOpenComments={onOpenComments}
          onLike={handleLike}
          onDeletePost={onDeletePost}
          disableReadMore={true}
          isPermalink={true}
          onShare={() => onShare(data?.id, data?.reblogged)}
        />
      </ScrollView>
    </SafeAreaView>
  )
}
