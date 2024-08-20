import { FlatList, Dimensions, ActivityIndicator, Platform } from 'react-native'
import { Image, ScrollView, Text, View, YStack } from 'tamagui'
import ProfileHeader from '@components/profile/ProfileHeader'
import { Storage } from 'src/state/cache'
import { queryApi } from 'src/requests'
import { useState, useEffect, useRef, useMemo, useCallback, useLayoutEffect } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Stack, useLocalSearchParams, router, useNavigation } from 'expo-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getStatusById,
  getAccountStatusesById,
  likeStatus,
  unlikeStatus,
  deleteStatusV1,
  reblogStatus,
  unreblogStatus,
} from 'src/lib/api'
import FeedPost from 'src/components/post/FeedPost'
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetBackdrop,
} from '@gorhom/bottom-sheet'
import CommentFeed from 'src/components/post/CommentFeed'

export default function Page() {
  const { id } = useLocalSearchParams()
  const navigation = useNavigation()

  useLayoutEffect(() => {
    navigation.setOptions({ title: 'Post', headerBackTitle: 'Back' })
  }, [navigation])
  const user = JSON.parse(Storage.getString('user.profile'))
  const queryClient = useQueryClient()
  const bottomSheetModalRef = useRef(null)
  const snapPoints = useMemo(() => ['45%', '70%'], [])
  const renderBackdrop = useCallback(
    (props) => (
      <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={1} />
    ),
    []
  )
  const handleGotoProfile = (id) => {
    bottomSheetModalRef.current?.close()
    router.push(`/profile/${id}`)
  }

  const handleGotoHashtag = (id) => {
    bottomSheetModalRef.current?.close()
    router.push(`/hashtag/${id}`)
  }
  const onOpenComments = useCallback((id) => {
    bottomSheetModalRef.current?.present()
  }, [])

  const likeMutation = useMutation({
    mutationFn: async (handleLike) => {
      return handleLike.type === 'like'
        ? await likeStatus(handleLike)
        : await unlikeStatus(handleLike)
    },
    onSuccess: () => {
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['getStatusById'] })
      }, 1000)
    },
  })

  const onShare = (id, state) => {
    shareMutation.mutate({ type: state == true ? 'unreblog' : 'reblog', id: id })
  }

  const shareMutation = useMutation({
    mutationFn: async (handleShare) => {
      return handleShare.type === 'reblog'
        ? await reblogStatus(handleShare)
        : await unreblogStatus(handleShare)
    },
  })

  const handleLike = async (id, state) => {
    likeMutation.mutate({ type: state ? 'unlike' : 'like', id: id })
  }

  const handleGotoUsernameProfile = (id) => {
    bottomSheetModalRef.current?.close()
    router.push(`/profile/0?byUsername=${id.slice(1)}`)
  }

  const handleShowLikes = (id) => {
    bottomSheetModalRef.current?.close()
    router.push(`/post/likes/${id}`)
  }

  const handleCommentReport = (id) => {
    bottomSheetModalRef.current?.close()
    router.push(`/post/report/${id}`)
  }

  const onDeletePost = (id) => {
    deletePostMutation.mutate(id)
  }

  const deletePostMutation = useMutation({
    mutationFn: async (id) => {
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
    return <Text>Error: {error.message}</Text>
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
        index={1}
        snapPoints={snapPoints}
        backdropComponent={renderBackdrop}
        keyboardBehavior={ Platform.OS === 'ios' ? 'extend' : 'interactive' }
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
