import { Feather } from '@expo/vector-icons'
import { useQuery } from '@tanstack/react-query'
import { Link, Stack, useRouter } from 'expo-router'
import { useMemo } from 'react'
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Pressable,
  SafeAreaView,
} from 'react-native'
import ImageComponent from 'src/components/ImageComponent'
import { getTrendingPopularPosts, getTrendingPostsV1 } from 'src/lib/api'
import { Text, useTheme, View, YStack } from 'tamagui'

const SCREEN_WIDTH = Dimensions.get('screen').width
const NUM_COLUMNS = 3

export default function DiscoverScreen() {
  const router = useRouter()
  const theme = useTheme()

  const {
    data: popularTodayPosts,
    isPending: popularTodayPostsPending,
    isError: popularTodayPostsIsError,
    error: popularTodayPostsError,
  } = useQuery({
    queryKey: ['getTrendingPopularPosts'],
    queryFn: getTrendingPopularPosts,
  })

  const {
    data: trendingData,
    isPending: trendingDataPending,
    isError: trendingDataIsError,
    error: trendingDataError,
  } = useQuery({
    queryKey: ['getTrendingPostsV1'],
    queryFn: getTrendingPostsV1,
  })

  const popularAccounts = trendingData?.accounts
  const trendingFediversePosts = trendingData?.posts

  const gridPosts = useMemo(() => {
    const posts1 = popularTodayPosts || []
    const posts2 = trendingFediversePosts || []

    const combinedPosts = [...posts1, ...posts2]
    const uniquePosts = new Map()

    for (const post of combinedPosts) {
      if (
        post &&
        post.id &&
        post.media_attachments &&
        post.media_attachments.length > 0
      ) {
        if (!uniquePosts.has(post.id)) {
          uniquePosts.set(post.id, post)
        }
      }
    }
    return Array.from(uniquePosts.values())
  }, [popularTodayPosts, trendingFediversePosts])

  const isLoading = popularTodayPostsPending || trendingDataPending
  const fetchError = popularTodayPostsError || trendingDataError

  const RenderGridPostItem = ({ item }: { item: any }) => {
    const itemCellWidth = SCREEN_WIDTH / NUM_COLUMNS

    if (!item.media_attachments || item.media_attachments.length === 0) {
      return <View width={itemCellWidth} height={itemCellWidth} />
    }

    return (
      <Link href={`/post/${item.id}`} asChild>
        <Pressable>
          <View width={itemCellWidth} height={itemCellWidth * 1.5} p="$0.5">
            <View flex={1} overflow="hidden" bg={theme.background?.val.tertiary.val}>
              <ImageComponent
                placeholder={{ blurhash: item.media_attachments[0]?.blurhash || '' }}
                source={{ uri: item.media_attachments[0].url }}
                style={{ width: '100%', height: '100%' }}
                contentFit="cover"
              />
            </View>
          </View>
        </Pressable>
      </Link>
    )
  }

  const _ListHeader = () => (
    <YStack>
      {hashtags && hashtags.length > 0 && (
        <View m="$3" mb="$4">
          <Text
            fontSize="$6"
            fontWeight="bold"
            color={theme.color?.val.secondary.val}
            mb="$3"
            ml="$2"
          >
            Tags
          </Text>
          <FlatList
            data={hashtags}
            renderItem={RenderTagItem}
            keyExtractor={(tag) => tag.hashtag}
            showsHorizontalScrollIndicator={false}
            horizontal
          />
        </View>
      )}

      {popularAccounts && popularAccounts.length > 0 && (
        <View m="$3" mb="$4">
          <Text
            fontSize="$6"
            fontWeight="bold"
            color={theme.color?.val.secondary.val}
            mb="$3"
            ml="$2"
          >
            Accounts
          </Text>
          <FlatList
            data={popularAccounts}
            renderItem={RenderAccountItem}
            keyExtractor={(account) => account.id.toString()}
            showsHorizontalScrollIndicator={false}
            horizontal
          />
        </View>
      )}
    </YStack>
  )

  if (isLoading) {
    return (
      <SafeAreaView
        flex={1}
        style={{ backgroundColor: theme.background?.val.default.val }}
      >
        <Stack.Screen options={{ title: 'Explore', headerBackTitle: 'Back' }} />
        <View flexGrow={1} justifyContent="center" alignItems="center">
          <ActivityIndicator size="large" />
        </View>
      </SafeAreaView>
    )
  }

  if (fetchError) {
    return (
      <SafeAreaView
        flex={1}
        style={{ backgroundColor: theme.background?.val.default.val }}
      >
        <Stack.Screen options={{ title: 'Explore', headerBackTitle: 'Back' }} />
        <View flexGrow={1} justifyContent="center" alignItems="center" p="$4">
          <Text color={theme.color?.val.danger.val} fontSize="$5" textAlign="center">
            Error loading content: {fetchError.message}
          </Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView
      flex={1}
      edges={['top', 'bottom', 'left', 'right']}
      style={{ backgroundColor: theme.background?.val.default.val }}
    >
      <Stack.Screen
        options={{
          title: 'Explore',
          headerBackTitle: 'Back',
          headerRight: () => (
            <Pressable onPress={() => router.push('/search')} style={{ marginRight: 10 }}>
              <Feather
                name="search"
                size={24}
                color={theme.color?.val.tertiary.val || 'black'}
              />
            </Pressable>
          ),
        }}
      />
      <FlatList
        data={gridPosts}
        renderItem={RenderGridPostItem}
        keyExtractor={(item, index) => item.id?.toString() || `post-${index}`}
        numColumns={NUM_COLUMNS}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  )
}
