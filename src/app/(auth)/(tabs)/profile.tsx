import { FlatList, Dimensions, ActivityIndicator, Share, Alert } from 'react-native'
import { Image, View } from 'tamagui'
import ProfileHeader from '@components/profile/ProfileHeader'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Link } from 'expo-router'
import { useInfiniteQuery } from '@tanstack/react-query'
import { getAccountStatusesById } from 'src/lib/api'
import Feather from '@expo/vector-icons/Feather'
import { Blurhash } from 'react-native-blurhash'
import { useQuerySelfProfile } from 'src/state/AuthProvider'

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
          {item.media_attachments[0]?.blurhash ? (
            <Blurhash
              blurhash={item.media_attachments[0]?.blurhash}
              style={{
                flex: 1,
                position: 'absolute',
                width: SCREEN_WIDTH / 3 - 2,
                height: SCREEN_WIDTH / 3 - 2,
              }}
            />
          ) : null}
          <Image
            source={{
              uri: item.media_attachments[0].url,
              width: SCREEN_WIDTH / 3 - 2,
              height: SCREEN_WIDTH / 3 - 2,
            }}
            resizeMode="cover"
          />
          {item.pf_type === 'photo:album' ? (
            <View position="absolute" right={5} top={5}>
              <Feather name="columns" color="white" size={20} />
            </View>
          ) : null}
        </View>
      </Link>
    ) : null

  return (
    <SafeAreaView edges={['top']} style={{ flexGrow: 1 }}>
      {isFetching && <ActivityIndicator color={'#000'} />}
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
