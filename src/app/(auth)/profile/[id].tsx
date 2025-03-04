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
  unblockProfileById,
  unfollowAccountById,
  unmuteProfileById,
} from 'src/lib/api'
import { Storage } from 'src/state/cache'
import { Button, Separator, Text, View, YStack, ZStack } from 'tamagui'

import type { BottomSheetBackdropProps } from '@gorhom/bottom-sheet'
import { PixelfedBottomSheetModal } from 'src/components/BottomSheets'

const SCREEN_WIDTH = Dimensions.get('screen').width

export default function ProfileScreen() {
  const navigation = useNavigation()
  const { id, byUsername } = useLocalSearchParams<{ id: string; byUsername?: string }>()
  const queryClient = useQueryClient()
  const bottomSheetModalRef = useRef<BottomSheetModal | null>(null)
  const snapPoints = useMemo(() => ['50%', '55%'], [])
  // const toast = useToastController();
  const toastController = useToastController()

  const renderBackdrop: React.FC<BottomSheetBackdropProps> = useCallback(
    (props) => (
      <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={1} />
    ),
    []
  )

  const RenderItem = useCallback(({ item }) => {
    if (!item || !item.media_attachments) {
      return <View bg="$gray4"></View>
    }
    const forceSensitive = Storage.getBoolean('ui.forceSensitive') === true
    const med = item.media_attachments[0]
    const murl = med.url
    const isSensitive = item.sensitive
    const hasPreview = med.preview_url && !med.preview_url.endsWith('no-preview.png')

    if (isSensitive && !forceSensitive) {
      const bh =
        item.media_attachments[0]?.blurhash ?? 'U4Rfzst8?bt7ogayj[j[~pfQ9Goe%Mj[WBay'

      if (!bh || bh === 'U4Rfzst8?bt7ogayj[j[~pfQ9Goe%Mj[WBay') {
        return (
          <Link href={`/post/${item.id}`} asChild>
            <View flexShrink={1} style={{ borderWidth: 1, borderColor: 'white' }}>
              <ZStack w={SCREEN_WIDTH / 3 - 2} h={SCREEN_WIDTH / 3 - 2}>
                <View
                  style={{
                    flex: 1,
                    width: SCREEN_WIDTH / 3 - 2,
                    height: SCREEN_WIDTH / 3 - 2,
                    backgroundColor: 'black',
                  }}
                />
                <View p="$2" justifyContent="flex-end" alignItems="flex-end">
                  <Feather name="eye-off" size={20} color="white" />
                </View>
              </ZStack>
            </View>
          </Link>
        )
      }
      return (
        <Link href={`/post/${item.id}`} asChild>
          <View flexShrink={1} style={{ borderWidth: 1, borderColor: 'white' }}>
            <ZStack w={SCREEN_WIDTH / 3 - 2} h={SCREEN_WIDTH / 3 - 2}>
              <Blurhash
                blurhash={bh}
                style={{
                  flex: 1,
                  width: SCREEN_WIDTH / 3 - 2,
                  height: SCREEN_WIDTH / 3 - 2,
                }}
              />
              <View p="$2" justifyContent="flex-end" alignItems="flex-end">
                <Feather name="eye-off" size={20} color="white" />
              </View>
            </ZStack>
          </View>
        </Link>
      )
    }

    if (med?.type === 'video') {
      return (
        <Link href={`/post/${item.id}`} asChild>
          <View flexShrink={1} style={{ borderWidth: 1, borderColor: 'white' }}>
            <ZStack w={SCREEN_WIDTH / 3 - 2} h={SCREEN_WIDTH / 3 - 2}>
              {hasPreview && med.preview_url ? (
                <ImageComponent
                  style={{
                    width: SCREEN_WIDTH / 3 - 2,
                    height: SCREEN_WIDTH / 3 - 2,
                    backgroundColor: '#ddd',
                  }}
                  source={{
                    uri: med.preview_url,
                  }}
                  contentFit={'cover'}
                />
              ) : (
                <Blurhash
                  blurhash={med.blurhash}
                  style={{
                    flex: 1,
                    width: SCREEN_WIDTH / 3 - 2,
                    height: SCREEN_WIDTH / 3 - 2,
                  }}
                />
              )}
              <View p="$2" justifyContent="flex-end" alignItems="flex-end">
                <Feather name="video" size={20} color="white" />
              </View>
            </ZStack>
          </View>
        </Link>
      )
    }
    return item && item.media_attachments && item.media_attachments[0].url ? (
      <Link href={`/post/${item.id}`} asChild>
        <View flexShrink={1} style={{ borderWidth: 1, borderColor: 'white' }}>
          {item.sensitive && !forceSensitive ? (
            <ZStack w={SCREEN_WIDTH / 3 - 2} h={SCREEN_WIDTH / 3 - 2}>
              <Blurhash
                blurhash={item.media_attachments[0]?.blurhash}
                style={{
                  flex: 1,
                  width: SCREEN_WIDTH / 3 - 2,
                  height: SCREEN_WIDTH / 3 - 2,
                }}
              />
              <View p="$2" justifyContent="flex-end" alignItems="flex-end">
                <Feather name="eye-off" size={20} color="white" />
              </View>
            </ZStack>
          ) : (
            <ImageComponent
              placeholder={{ blurhash: item.media_attachments[0]?.blurhash || '' }}
              style={{
                width: SCREEN_WIDTH / 3 - 2,
                height: SCREEN_WIDTH / 3 - 2,
              }}
              source={{
                uri: item.media_attachments[0].url,
              }}
              contentFit={'cover'}
            />
          )}
          {item.pf_type === 'photo:album' ? (
            <View position="absolute" right={5} top={5}>
              <Feather name="columns" color="white" size={20} />
            </View>
          ) : null}

          {item.pf_type === 'video' ? (
            <View position="absolute" right={5} top={5}>
              <Feather name="video" color="white" size={20} />
            </View>
          ) : null}
        </View>
      </Link>
    ) : null
  }, [])

  const EmptyFeed = () => {
    if (!isFetched || isFetching) {
      return (
        <YStack flex={1} justifyContent="center" alignItems="center" gap="$5">
          <ActivityIndicator />
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
              <View p="$6" borderWidth={2} borderColor="black" borderRadius={100}>
                <Feather name="camera" size={50} />
              </View>
              <Text fontSize="$9">No Posts Yet</Text>
            </View>
          )}
        </YStack>
      </View>
    )
  }

  const blockMutation = useMutation({
    mutationFn: () => {
      return blockProfileById(userId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['getAccountRelationship'] })
      queryClient.invalidateQueries({ queryKey: ['blockedAccounts'] })
    },
  })

  const unblockMutation = useMutation({
    mutationFn: () => {
      return unblockProfileById(userId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['getAccountRelationship'] })
      queryClient.invalidateQueries({ queryKey: ['blockedAccounts'] })
    },
  })

  const muteMutation = useMutation({
    mutationFn: () => {
      return muteProfileById(userId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['getAccountRelationship'] })
      queryClient.invalidateQueries({ queryKey: ['mutedAccounts'] })
    },
  })

  const unmuteMutation = useMutation({
    mutationFn: () => {
      return unmuteProfileById(userId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['getAccountRelationship'] })
      queryClient.invalidateQueries({ queryKey: ['mutedAccounts'] })
    },
  })

  const followMutation = useMutation({
    mutationFn: () => {
      return followAccountById(userId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['getAccountRelationship'] })
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['getAccountById'] })
        queryClient.invalidateQueries({ queryKey: ['getAccountByUsername'] })
      }, 1000)
    },
  })

  const unfollowMutation = useMutation({
    mutationFn: () => {
      return unfollowAccountById(userId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['getAccountRelationship'] })
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['getAccountById'] })
        queryClient.invalidateQueries({ queryKey: ['getAccountByUsername'] })
      }, 1000)
    },
  })

  const onOpenMenu = () => {
    if (!user?.id) {
      return
    }
    bottomSheetModalRef.current?.present()
  }

  const menuGotoLink = async (action) => {
    bottomSheetModalRef.current?.close()

    if (action === 'report') {
      router.push('/profile/report/' + userId)
    }

    if (action === 'block') {
      Alert.alert(
        'Confirm Block',
        "Are you sure you want to block this account?\n\nThey won't be notified you blocked them. You can unblock them later.",
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Block',
            style: 'destructive',
            onPress: () => handleBlock(),
          },
        ]
      )
    }

    if (action === 'unblock') {
      Alert.alert('Confirm Unblock', 'Are you sure you want to unblock this account?', [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Unblock',
          style: 'destructive',
          onPress: () => handleUnblock(),
        },
      ])
    }

    if (action === 'mute') {
      Alert.alert(
        'Confirm Mute',
        "Are you sure you want to mute this account?\n\nThey won't be notified you muted them. You can unmute them later.",
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Mute',
            style: 'destructive',
            onPress: () => handleMute(),
          },
        ]
      )
    }

    if (action === 'unmute') {
      Alert.alert('Confirm Unmute', 'Are you sure you want to unmute this account?', [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Unmute',
          style: 'destructive',
          onPress: () => handleUnmute(),
        },
      ])
    }

    if (action === 'copyurl') {
      Clipboard.setString(user.url)
      toastController.show('Profile copied to clipboard', {
        from: 'bottom',
        preset: 'none',
        duration: 2500,
        haptic: 'success',
      })
    }

    if (action === 'share') {
      try {
        const result = await Share.share({
          message: user.url,
        })
      } catch (error: any) {
        Alert.alert(
          error?.message || 'share sheet failed to open and error had no message'
        )
      }
    }

    if (action === 'about') {
      router.push(`/profile/about/${userId}`)
    }
  }

  const handleBlock = () => {
    blockMutation.mutate()
  }

  const handleUnblock = () => {
    unblockMutation.mutate()
  }

  const handleMute = () => {
    muteMutation.mutate()
  }

  const handleUnmute = () => {
    unmuteMutation.mutate()
  }

  const handleFollow = () => {
    followMutation.mutate()
  }

  const handleUnfollow = () => {
    unfollowMutation.mutate()
  }

  const handleCancelFollowRequest = () => {
    unfollowMutation.mutate()
  }

  const handleOnShare = async () => {
    try {
      const result = await Share.share({
        message: user.url,
      })
    } catch (error: any) {
      Alert.alert(
        error?.message || 'sharing: error occured, but error message is missing'
      )
    }
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

  useEffect(() => {
    if (user && Platform.OS == 'android') {
      navigation.setOptions({
        headerTitle: user?.username,
        headerRight: () => (
          <Button chromeless p="$0" onPress={() => onOpenMenu()}>
            <Feather name={'more-vertical'} size={26} />
          </Button>
        ),
      })
    }
  }, [navigation, user])

  const { data: relationship, isError: relationshipError } = useQuery({
    queryKey: ['getAccountRelationship', userId],
    queryFn: getAccountRelationship,
    enabled: !!userId && !userError,
  })

  const { data: mutuals, isError: mutualsError } = useQuery({
    queryKey: ['getMutualFollowing', userId],
    queryFn: getMutualFollowing,
    enabled: !!relationship,
  })

  const RenderHeader = useCallback(
    () => (
      <ProfileHeader
        profile={user}
        relationship={relationship}
        openMenu={onOpenMenu}
        onFollow={() => handleFollow()}
        onUnfollow={() => handleUnfollow()}
        onCancelFollowRequest={() => handleCancelFollowRequest()}
        onShare={() => handleOnShare()}
        mutuals={mutuals}
      />
    ),
    [mutuals, user, relationship]
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
    queryKey: ['statusesById', user?.id],
    queryFn: async ({ pageParam }) => {
      const data = await getAccountStatusesById(user?.id, pageParam)
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
      let lowestId = lastPage.reduce((min, obj) => {
        if (obj.id < min) {
          return obj.id
        }
        return min
      }, lastPage[0].id)
      return lowestId
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
          <ActivityIndicator color={'#000'} />
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: 'white' }}>
      <Stack.Screen
        options={{
          headerShown: Platform.OS === 'android',
        }}
      />
      <FlatList
        data={flattenedData}
        keyExtractor={(item) => item.id.toString()}
        ListHeaderComponent={RenderHeader}
        renderItem={RenderItem}
        numColumns={3}
        showsVerticalScrollIndicator={false}
        onEndReached={() => {
          if (!userError && !isFetching && hasNextPage) {
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
      <PixelfedBottomSheetModal
        ref={bottomSheetModalRef}
        index={1}
        snapPoints={snapPoints}
        backdropComponent={renderBackdrop}
        keyboardBehavior={Platform.OS === 'ios' ? 'extend' : 'interactive'}
      >
        <BottomSheetScrollView>
          <Button
            size="$6"
            chromeless
            color="red"
            onPress={() => menuGotoLink(relationship?.muting ? 'unmute' : 'mute')}
          >
            {relationship?.muting ? 'Unmute' : 'Mute'}
          </Button>
          <Separator />
          <Button
            size="$6"
            chromeless
            color="red"
            onPress={() => menuGotoLink(relationship?.blocking ? 'unblock' : 'block')}
          >
            {relationship?.blocking ? 'Unblock' : 'Block'}
          </Button>
          <Separator />
          <Button size="$6" chromeless color="red" onPress={() => menuGotoLink('report')}>
            Report
          </Button>
          <Separator />
          <Button size="$6" chromeless onPress={() => menuGotoLink('about')}>
            About this account
          </Button>
          <Separator />
          <Button size="$6" chromeless onPress={() => menuGotoLink('copyurl')}>
            Copy profile URL
          </Button>
          <Separator />
          <Button size="$6" chromeless onPress={() => menuGotoLink('share')}>
            Share this profile
          </Button>
          <Separator />
          <Button
            size="$6"
            chromeless
            color="$gray8"
            onPress={() => bottomSheetModalRef.current?.close()}
          >
            Cancel
          </Button>
        </BottomSheetScrollView>
      </PixelfedBottomSheetModal>
    </SafeAreaView>
  )
}
