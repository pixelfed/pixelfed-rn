import ProfileHeader from '@components/profile/ProfileHeader'
import Feather from '@expo/vector-icons/Feather'
import Entypo from '@expo/vector-icons/Entypo';
import { useInfiniteQuery } from '@tanstack/react-query'
import { Link } from 'expo-router'
import { ActivityIndicator, Alert, Dimensions, FlatList, Share } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import ImageComponent from 'src/components/ImageComponent'
import { getAccountStatusesById } from 'src/lib/api'
import { useQuerySelfProfile } from 'src/state/AuthProvider'
import { Text, View, YStack, useTheme } from 'tamagui'

const SCREEN_WIDTH = Dimensions.get('screen').width

export default function ProfileScreen() {
  const { user, isFetching } = useQuerySelfProfile()
  const theme = useTheme()

  const userId = user?.id

  const onShare = async () => {
    try {
      const result = await Share.share({
        message: user.url,
      })
    } catch (error: any) {
      Alert.alert(error?.message || 'onshare error: error message missing')
    }
  }

  const EmptyFeed = () => {
    if (isFetching) {
      return (
        <YStack flex={1} justifyContent="center" alignItems="center" gap="$5">
          <ActivityIndicator />
        </YStack>
      )
    }

    return (
      <View
        flexGrow={1}
        bg={theme.background?.val.default.val}
        borderTopWidth={1}
        borderColor={theme.borderColor?.val.default.val}
        alignItems="center"
        justifyContent="center"
      >
        <YStack
          h="100%"
          flexGrow={1}
          justifyContent="center"
          alignItems="center"
          gap="$5"
        >
          <View flexGrow={1} alignItems="center" justifyContent="center" gap="$4">
            <View
              p="$6"
              borderWidth={2}
              borderColor={theme.borderColor?.val.default}
              borderRadius={100}
            >
              <Feather name="camera" size={50} color={theme.color?.val.tertiary.val} />
            </View>
            <Text fontSize="$9" color={theme.color?.val.tertiary.val}>
              No Posts Yet
            </Text>
          </View>
        </YStack>
      </View>
    )
  }

  const {
    status,
    fetchStatus,
    data: feed,
    fetchNextPage,
    hasNextPage,
    refetch,
    isRefetching,
    hasPreviousPage,
    isFetchingNextPage,
    isFetching: isFeedFetching,
    isError,
    error,
  } = useInfiniteQuery({
    queryKey: ['statusesById', userId],
    queryFn: async ({ pageParam }) => {
      if (!userId) {
        throw new Error('getAccountStatusesById: user id missing')
      }
      const data = await getAccountStatusesById(userId, { max_id: pageParam, pinned: true })
      return data.filter((p) => {
        return (
          ['photo', 'photo:album', 'video'].includes(p.pf_type) &&
          p.media_attachments.length
        )
      })
    },
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

  const RenderItem = ({ item }) =>
    item && item.media_attachments[0].url ? (
      <Link key={item?.id} href={`/post/${item.id}`}>
        <View
          flexShrink={1}
          style={{ borderWidth: 1, borderColor: theme.borderColor?.val.default.val }}
        >
          <ImageComponent
            placeholder={{ blurhash: item.media_attachments[0]?.blurhash || '' }}
            source={{
              uri: item.media_attachments[0].url,
            }}
            style={{
              width: SCREEN_WIDTH / 3 - 2,
              height: SCREEN_WIDTH / 3 - 2,
            }}
            containFit="cover"
          />
          {item.pinned ? (
            <View
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 0.5,
                elevation: 1, // Android shadow
              }}
              position="absolute" right={5} top={5}>
              <Entypo name="pin" size={20} color="white" />
            </View>
          ) : null}
          {item.pf_type === 'photo:album' && !item.pinned ? (
            <View position="absolute" right={5} top={5}>
              <Feather name="columns" color="white" size={20} />
            </View>
          ) : null}
        </View>
      </Link>
    ) : null

  if (isFetching) {
    return (
      <View flexGrow={1} justifyContent="center" alignItems="center">
        <ActivityIndicator color={theme.color?.val.default.val} />
      </View>
    )
  }

  return (
    <SafeAreaView edges={['top']} flex={1}>
      {isFetching && (
        <View flexGrow={1}>
          <ActivityIndicator color={theme.color?.val.default.val} />
        </View>
      )}

      <FlatList
        data={feed?.pages.flat()}
        keyExtractor={(item, index) => item?.id.toString()}
        ListHeaderComponent={
          <ProfileHeader profile={user} isSelf={true} onShare={() => onShare()} />
        }
        renderItem={RenderItem}
        numColumns={3}
        refreshing={isRefetching}
        onRefresh={refetch}
        showsVerticalScrollIndicator={false}
        onEndReached={() => {
          if (!isFetching && hasNextPage) fetchNextPage()
        }}
        ListEmptyComponent={EmptyFeed}
        onEndReachedThreshold={0.5}
        ListFooterComponent={() =>
          isFetchingNextPage ? (
            <View p="$5">
              <ActivityIndicator color={theme.color?.val.default.val} />
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  )
}
