import { BottomSheetBackdrop, type BottomSheetModal } from '@gorhom/bottom-sheet'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Stack, router, useLocalSearchParams, useNavigation } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useCallback, useLayoutEffect, useMemo, useRef } from 'react'
//@ts-check
import { ActivityIndicator, Platform } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import FeedPost from 'src/components/post/FeedPost'
import { deleteStatusV1, getStatusById, reblogStatus, unreblogStatus } from 'src/lib/api'
import { useUserCache } from 'src/state/AuthProvider'
import { ScrollView, Text, View, useTheme } from 'tamagui'

export default function Page() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const navigation = useNavigation()
  const theme = useTheme()
  useLayoutEffect(() => {
    navigation.setOptions({ title: 'Post', headerBackTitle: 'Back' })
  }, [navigation])
  const user = useUserCache()
  const queryClient = useQueryClient()

  const onOpenComments = (id: string) => {
    router.push(`/post/comments/${id}`)
  }

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
    <SafeAreaView
      style={{ flex: 1, backgroundColor: theme.background.val.default.val }}
      edges={['bottom']}
    >
      <Stack.Screen
        options={{
          title: 'Post',
          headerBackTitle: 'Back',
        }}
      />
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
