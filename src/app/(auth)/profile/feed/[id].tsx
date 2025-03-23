import ProfileHeader from '@components/profile/ProfileHeader'
import { Feather } from '@expo/vector-icons'
import {
  BottomSheetBackdrop,
  type BottomSheetModal,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet'
import Clipboard from '@react-native-clipboard/clipboard'
import { useToastController } from '@tamagui/toast'
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { Link, Stack, router, useLocalSearchParams, useNavigation } from 'expo-router'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Platform,
  Share,
} from 'react-native'
import { Blurhash } from 'react-native-blurhash'
import { SafeAreaView } from 'react-native-safe-area-context'
import ImageComponent from 'src/components/ImageComponent'
import {
  blockProfileById,
  followAccountById,
  getAccountById,
  getAccountByUsername,
  getAccountRelationship,
  getAccountStatusesById,
  getMutualFollowing,
  muteProfileById,
  reblogStatus,
  unblockProfileById,
  unfollowAccountById,
  unmuteProfileById,
  unreblogStatus,
} from 'src/lib/api'
import { Storage } from 'src/state/cache'
import { Button, Separator, Text, View, YStack, ZStack, useTheme } from 'tamagui'

import type { BottomSheetBackdropProps } from '@gorhom/bottom-sheet'
import { PixelfedBottomSheetModal } from 'src/components/common/BottomSheets'
import FeedPost from 'src/components/post/FeedPost'
import { useUserCache } from 'src/state/AuthProvider'
import { enforceLen } from 'src/utils'
import { StatusBar } from 'expo-status-bar'

const SCREEN_WIDTH = Dimensions.get('screen').width

export default function ProfileScreen() {
  const navigation = useNavigation()
  const { id, byUsername } = useLocalSearchParams<{ id: string; byUsername?: string }>()
  const queryClient = useQueryClient()
  const bottomSheetModalRef = useRef<BottomSheetModal | null>(null)
  // const toast = useToastController();
  const toastController = useToastController()
  const selfUser = useUserCache()
  const theme = useTheme();

  const onOpenComments = (id) => {
    router.push(`/post/comments/${id}`)
  }

  const onDeletePost = () => {}

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

  const EmptyFeed = () => {
    if (!isFetched || isFetching) {
      return (
        <YStack flex={1} justifyContent="center" alignItems="center" gap="$5">
          <ActivityIndicator color={theme.color?.val.default.val} />
        </YStack>
      )
    }

    if (!isFetching && !user?.id) {
      return (
        <YStack flexGrow={1} justifyContent="center" alignItems="center" gap="$5">
          <View p="$6" borderWidth={2} borderColor="$gray5" borderRadius={100}>
            <Feather name="alert-triangle" size={40} color="#aaa" />
          </View>
          <Text fontSize="$8">Account not found</Text>
        </YStack>
      )
    }
    return (
      <View flex={1} alignItems="center" justifyContent="center">
        <YStack
          h="100%"
          flexGrow={1}
          justifyContent="center"
          alignItems="center"
          gap="$5"
        >
          {user?.locked && !relationship?.following ? (
            <>
              <View p="$6" borderWidth={2} borderColor="black" borderRadius={100}>
                <Feather name="lock" size={40} />
              </View>
              <Text fontSize="$8">This account is private</Text>
            </>
          ) : (
            <View flexGrow={1} alignItems="center" justifyContent="center" gap="$4">
              <View p="$6" borderWidth={2} borderColor={theme.borderColor?.val.default} borderRadius={100}>
                <Feather name="camera" size={50} color={theme.color?.val.tertiary.val} />
              </View>
              <Text fontSize="$9" color={theme.color?.val.tertiary.val}>No Posts Yet</Text>
            </View>
          )}
        </YStack>
      </View>
    )
  }

  const { data: user, error: userError } = useQuery(
    byUsername !== undefined && id === '0'
      ? {
          queryKey: ['getAccountByUsername', byUsername],
          queryFn: () => getAccountByUsername(byUsername),
        }
      : {
          queryKey: ['getAccountById', id],
          queryFn: () => getAccountById(id),
        }
  )

  const userId = user?.id

  const RenderItem = useCallback(
    ({ item }: ListRenderItemInfo<Status>) => (
      <FeedPost
        key={`profile-feed-${item.id}`}
        post={item}
        user={selfUser}
        handleLikeProfileId={true}
        onOpenComments={() => onOpenComments(item.id)}
        onDeletePost={() => onDeletePost(item.id)}
        onShare={() => onShare(item.id, item.reblogged)}
      />
    ),
    [selfUser, user, onOpenComments, onDeletePost, onShare]
  )

  const {
    status,
    fetchStatus,
    data: feed,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isFetched,
    isFetching,
    isError,
    error,
  } = useInfiniteQuery({
    queryKey: ['statusesFeedById', user?.id],
    queryFn: async ({ pageParam }) => {
      const data = await getAccountStatusesById(user?.id, { max_id: pageParam })
      const res = data.filter((p) => {
        return (
          ['photo', 'photo:album', 'video'].includes(p.pf_type) &&
          p.media_attachments.length
        )
      })
      return res
    },
    maxPages: 80,
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages, lastPageParam) => {
      if (lastPage.length === 0) {
        return undefined
      }

      const lowestId = lastPage.reduce((min, post) => {
        return BigInt(post.id) < BigInt(min) ? post.id : min
      }, lastPage[0].id)

      return String(BigInt(lowestId) - 1n)
    },
    enabled: !!userId,
  })

  const flattenedData = useMemo(() => {
    if (!feed?.pages) return []
    return feed.pages.flat()
  }, [feed?.pages])

  if (userError) {
    return (
      <SafeAreaView edges={['top']}>
        <Stack.Screen
          options={{
            headerShown: true,
            title: byUsername || id,
            headerBackTitle: 'Back',
          }}
        />
        <View style={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text fontSize="$8">{userError.message}</Text>
          {byUsername && (
            <Button
              bg="$blue9"
              size="$5"
              color="white"
              marginBlockStart="$5"
              onPress={() =>
                router.push({ pathname: '/search', params: { initialQuery: byUsername } })
              }
            >{`Search for ${byUsername}`}</Button>
          )}
        </View>
      </SafeAreaView>
    )
  }

  if (status !== 'success' || (isFetching && !isFetchingNextPage)) {
    return (
      <SafeAreaView edges={['top']} flex={1}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator color={theme.color?.val.default.val} />
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView edges={['left']} style={{ flex: 1, backgroundColor: theme.background?.val.default.val }}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: () => (
            <YStack justifyContent="center" alignItems="center">
              {user && user.username && (
                <Text color={theme.color?.val.secondary.val}>{enforceLen(user?.acct, 30, true)}</Text>
              )}
              <Text fontSize="$6" fontWeight="bold" color={theme.color?.val.default.val}>
                Posts
              </Text>
            </YStack>
          ),
          headerBackTitle: 'Back',
        }}
      />
      <FlatList
        data={flattenedData}
        keyExtractor={(item) => item.id.toString()}
        renderItem={RenderItem}
        showsVerticalScrollIndicator={false}
        onEndReached={() => {
          if (!userError && !isFetching && !isFetchingNextPage && hasNextPage) {
            fetchNextPage()
          }
        }}
        onEndReachedThreshold={0.1}
        ListEmptyComponent={EmptyFeed}
        contentContainerStyle={{ flexGrow: 1 }}
        ListFooterComponent={() =>
          !userError && isFetched && isFetchingNextPage ? (
            <View p="$5">
              <ActivityIndicator />
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  )
}
