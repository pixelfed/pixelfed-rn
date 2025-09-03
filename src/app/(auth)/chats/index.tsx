import Feather from '@expo/vector-icons/Feather'
import { useInfiniteQuery } from '@tanstack/react-query'
import { Link, Stack, useNavigation, useRouter } from 'expo-router'
import { useCallback, useLayoutEffect } from 'react'
import { ActivityIndicator, FlatList } from 'react-native'
import { PressableOpacity } from 'react-native-pressable-opacity'
import { SafeAreaView } from 'react-native-safe-area-context'
import UserAvatar from 'src/components/common/UserAvatar'
import { getConversations } from 'src/lib/api'
import { useUserCache } from 'src/state/AuthProvider'
import { _timeAgo, enforceLen } from 'src/utils'
import { Separator, Text, useTheme, View, XStack, YStack } from 'tamagui'

export default function Page() {
  const selfUser = useUserCache()
  const navigation = useNavigation()
  const theme = useTheme()
  const router = useRouter()
  useLayoutEffect(() => {
    navigation.setOptions({ title: 'Direct Messages', headerBackTitle: 'Back' })
  }, [navigation])

  const keyExtractor = useCallback((item) => item?.id, [])

  const {
    data,
    fetchNextPage,
    fetchPreviousPage,
    hasNextPage,
    hasPreviousPage,
    isFetchingNextPage,
    isFetchingPreviousPage,
    isRefetching,
    refetch,
    isFetching,
    status,
    isError,
    error,
  } = useInfiniteQuery({
    queryKey: ['getConversations'],
    queryFn: getConversations,
    initialPageParam: 0,
    refetchOnWindowFocus: false,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    getPreviousPageParam: (lastPage) => lastPage.prevPage,
  })

  if (isFetching && !isFetchingNextPage && !isFetchingPreviousPage && !isRefetching) {
    return (
      <View flexGrow={1} mt="$5">
        <ActivityIndicator color={'#000'} />
      </View>
    )
  }

  if (isError) {
    return <Text>Error: {error?.message}</Text>
  }

  const HeaderRight = () => (
    <XStack gap="$3">
        <PressableOpacity hitSlop={10} onPress={() => router.push('/chats/search')}>
          <Feather name="plus" size={25} color="#0091ff" />
        </PressableOpacity>
      {/* <Feather name="settings" size={25} color="#0091ff" /> */}
    </XStack>
  )

  const RenderItem = ({ item }) => {
    let isSelf = selfUser.id == item.last_status?.account?.id
    let content = ''
    let cotype = item.last_status?.pf_type
    let cotext = item.last_status?.content_text

    if (cotype === 'text') {
      if (cotext) {
        let conlen = cotext.length
        content = conlen > 30 ? cotext.slice(0, 30) + '...' : cotext
      }
    }

    if (cotype === 'story:reply') {
      content = isSelf ? 'You replied to their story' : 'Replied to your story'
    }

    if (cotype === 'story:reaction') {
      content = isSelf ? 'You replied to their story' : 'Replied to your story'
    }

    if (cotype === 'photo') {
      content = isSelf ? 'You sent a photo' : 'Sent a photo'
    }

    if (cotype === 'photo:album') {
      content = isSelf ? 'You sent multiple photos' : 'Sent multiple photos'
    }
    return (
      <View p="$3" bg={theme.background?.val.default.val}>
        <Link href={`/chats/conversation/${item.accounts[0].id}`}>
          <XStack alignItems="center" gap="$3">
            <UserAvatar url={item.accounts[0].avatar} size="$3" />

            <YStack flexGrow={1} gap={4}>
              <Text fontSize="$5" fontWeight="bold" color={theme.color?.val.default.val}>
                {enforceLen(item.accounts[0].acct, 40, true)}
              </Text>
              <XStack gap="$2" alignItems="center">
                <Text
                  fontSize="$2"
                  allowFontScaling={false}
                  flexWrap="wrap"
                  color={isSelf ? '#999' : theme.color?.val.tertiary.val}
                  fontWeight={isSelf ? 'normal' : 'bold'}
                >
                  {content}
                </Text>
                <Text
                  fontSize="$2"
                  allowFontScaling={false}
                  color={theme.color?.val.tertiary.val}
                >
                  ·
                </Text>
                <Text fontSize="$2" allowFontScaling={false} color="#aaa">
                  {_timeAgo(item.last_status.created_at)} ago
                </Text>
              </XStack>
            </YStack>
          </XStack>
        </Link>
      </View>
    )
  }

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['left']}>
      <Stack.Screen
        options={{
          title: 'Direct Messages',
          headerBackTitle: 'Back',
          headerRight: HeaderRight,
        }}
      />
      <FlatList
        data={data.pages.flatMap((page) => page.data)}
        keyExtractor={keyExtractor}
        renderItem={RenderItem}
        refreshing={isRefetching}
        onRefresh={refetch}
        ItemSeparatorComponent={() => (
          <Separator borderColor={theme.borderColor?.val.default.val} />
        )}
        onEndReached={() => {
          if (hasNextPage && !isFetching && !isFetchingNextPage) fetchNextPage()
        }}
        onEndReachedThreshold={0.5}
        ListFooterComponent={() =>
          isFetching || isFetchingNextPage || isFetchingPreviousPage || isRefetching ? (
            <View h={200} justifyContent="center" alignItems="center">
              <ActivityIndicator />
            </View>
          ) : (
            <View h={200}></View>
          )
        }
      />
    </SafeAreaView>
  )
}
