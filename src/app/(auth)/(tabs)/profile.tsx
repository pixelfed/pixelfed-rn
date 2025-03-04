import ProfileHeader from '@components/profile/ProfileHeader'
import Feather from '@expo/vector-icons/Feather'
import { useInfiniteQuery } from '@tanstack/react-query'
import { Link } from 'expo-router'
import { ActivityIndicator, Alert, Dimensions, FlatList, Share } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import ImageComponent from 'src/components/ImageComponent'
import { getAccountStatusesById } from 'src/lib/api'
import { useQuerySelfProfile } from 'src/state/AuthProvider'
import { View } from 'tamagui'

const SCREEN_WIDTH = Dimensions.get('screen').width

export default function ProfileScreen() {
  const { user, isFetching } = useQuerySelfProfile()

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

  const {
    status,
    fetchStatus,
    data: feed,
    fetchNextPage,
    hasNextPage,
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
      const data = await getAccountStatusesById(userId, { max_id: pageParam })
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

  const RenderItem = ({ item }) =>
    item && item.media_attachments[0].url ? (
      <Link href={`/post/${item.id}`}>
        <View flexShrink={1} style={{ borderWidth: 1, borderColor: 'white' }}>
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
          {item.pf_type === 'photo:album' ? (
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
        <ActivityIndicator color={'#000'} />
      </View>
    )
  }

  return (
    <SafeAreaView edges={['top']} flex={1}>
      {isFetching && (
        <View flexGrow={1}>
          <ActivityIndicator color={'#000'} />
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
        showsVerticalScrollIndicator={false}
        onEndReached={() => {
          if (!isFetching && hasNextPage) fetchNextPage()
        }}
        onEndReachedThreshold={0.5}
        ListFooterComponent={() =>
          isFetchingNextPage ? (
            <View p="$5">
              <ActivityIndicator />
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  )
}
