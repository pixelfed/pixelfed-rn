import { Feather } from '@expo/vector-icons'
import { useQuery } from '@tanstack/react-query'
import { Link, Stack, useFocusEffect, useRouter } from 'expo-router'
import { useCallback, useMemo, useRef, useState } from 'react'
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Pressable,
  RefreshControl,
  SafeAreaView,
} from 'react-native'
import ImageComponent from 'src/components/ImageComponent'
import { getTrendingPopularPosts, getTrendingPostsV1 } from 'src/lib/api'
import { Text, useTheme, View } from 'tamagui'

const SCREEN_WIDTH = Dimensions.get('screen').width
const NUM_COLUMNS = 3

const getThemeValue = (theme, path, fallback = null) => {
  try {
    return path.split('.').reduce((obj, key) => obj?.[key], theme) || fallback
  } catch {
    return fallback
  }
}

const isValidPost = (post) => {
  if (!post || typeof post !== 'object') return false
  if (!post.id) return false
  if (!Array.isArray(post.media_attachments) || post.media_attachments.length === 0)
    return false
  if (post.sensitive === true) return false
  if (
    typeof post.content_text === 'string' &&
    post.content_text.toLowerCase().includes('#nsfw')
  )
    return false

  return true
}

const getMediaUrl = (mediaAttachments, index = 0) => {
  try {
    return mediaAttachments?.[index]?.url || null
  } catch {
    return null
  }
}

const getBlurhash = (mediaAttachments, index = 0) => {
  try {
    return mediaAttachments?.[index]?.blurhash || ''
  } catch {
    return ''
  }
}

export default function DiscoverScreen() {
  const router = useRouter()
  const theme = useTheme()
  const [refreshing, setRefreshing] = useState(false)
  const [hasError, setHasError] = useState(false)
  const flatListRef = useRef(null)

  const backgroundColor = getThemeValue(theme, 'background.val.default.val', '#FFFFFF')
  const tertiaryBackgroundColor = getThemeValue(
    theme,
    'background.val.tertiary.val',
    '#F5F5F5'
  )
  const textColor = getThemeValue(theme, 'color.val.default.val', '#000000')
  const dangerColor = getThemeValue(theme, 'color.val.danger.val', '#FF0000')
  const tertiaryColor = getThemeValue(theme, 'color.val.tertiary.val', '#666666')

  const {
    data: popularTodayPosts,
    isPending: popularTodayPostsPending,
    isError: popularTodayPostsIsError,
    error: popularTodayPostsError,
    refetch: refetchPopularTodayPosts,
  } = useQuery({
    queryKey: ['getTrendingPopularPosts'],
    queryFn: async () => {
      try {
        const result = await getTrendingPopularPosts()
        return Array.isArray(result) ? result : []
      } catch (error) {
        console.error('Error fetching popular posts:', error)
        throw error
      }
    },
    retry: 3,
    retryDelay: 1000,
  })

  const {
    data: trendingData,
    isPending: trendingDataPending,
    isError: trendingDataIsError,
    error: trendingDataError,
    refetch: refetchTrendingData,
  } = useQuery({
    queryKey: ['getTrendingPostsV1'],
    queryFn: async () => {
      try {
        const result = await getTrendingPostsV1()
        return result && typeof result === 'object' ? result : { posts: [] }
      } catch (error) {
        console.error('Error fetching trending posts:', error)
        throw error
      }
    },
    retry: 3,
    retryDelay: 1000,
  })

  const trendingFediversePosts = Array.isArray(trendingData?.posts)
    ? trendingData.posts
    : []

  const gridPosts = useMemo(() => {
    try {
      const posts1 = Array.isArray(popularTodayPosts) ? popularTodayPosts : []
      const posts2 = Array.isArray(trendingFediversePosts) ? trendingFediversePosts : []

      const combinedPosts = [...posts1, ...posts2]
      const uniquePosts = new Map()

      for (const post of combinedPosts) {
        if (isValidPost(post)) {
          if (!uniquePosts.has(post.id)) {
            uniquePosts.set(post.id, post)
          }
        }
      }

      return Array.from(uniquePosts.values())
    } catch (error) {
      console.error('Error processing grid posts:', error)
      setHasError(true)
      return []
    }
  }, [popularTodayPosts, trendingFediversePosts])

  useFocusEffect(
    useCallback(() => {
      setHasError(false)

      if (flatListRef.current && gridPosts.length > 0) {
        try {
          flatListRef.current.scrollToOffset({ offset: 0, animated: true })
        } catch (error) {
          console.warn('Error scrolling to top:', error)
        }
      }

      if (!popularTodayPostsPending && !trendingDataPending && !hasError) {
        Promise.all([
          refetchPopularTodayPosts().catch((err) =>
            console.error('Refetch popular posts error:', err)
          ),
          refetchTrendingData().catch((err) =>
            console.error('Refetch trending data error:', err)
          ),
        ]).catch((err) => {
          console.error('Focus refetch error:', err)
          setHasError(true)
        })
      }
    }, [
      popularTodayPostsPending,
      trendingDataPending,
      refetchPopularTodayPosts,
      refetchTrendingData,
      hasError,
      gridPosts?.length,
    ])
  )

  const isLoading = popularTodayPostsPending || trendingDataPending
  const fetchError = popularTodayPostsError || trendingDataError

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    setHasError(false)

    try {
      await Promise.allSettled([refetchPopularTodayPosts(), refetchTrendingData()])
    } catch (error) {
      console.error('Error refreshing data:', error)
      setHasError(true)
    } finally {
      setRefreshing(false)
    }
  }, [refetchPopularTodayPosts, refetchTrendingData])

  const RenderGridPostItem = useCallback(
    ({ item }) => {
      const itemCellWidth = SCREEN_WIDTH / NUM_COLUMNS

      try {
        if (!isValidPost(item)) {
          return <View width={itemCellWidth} height={itemCellWidth} />
        }

        const mediaUrl = getMediaUrl(item.media_attachments)
        const blurhash = getBlurhash(item.media_attachments)

        if (!mediaUrl) {
          return <View width={itemCellWidth} height={itemCellWidth} />
        }

        return (
          <Link 
            accessible={true}
            accessibilityLabel={`Picture by ${item.acct}`} // todo: test this - is this the correct field? 
            accessibilityRole="image"
            accessibilityHint="Tap to view post"
            href={`/post/${encodeURIComponent(item.id)}`} 
            asChild
          >
            <Pressable>
              <View width={itemCellWidth} height={itemCellWidth * 1.5} p="$0.5">
                <View
                  flex={1}
                  overflow="hidden"
                  backgroundColor={tertiaryBackgroundColor}
                >
                  <ImageComponent
                    placeholder={{ blurhash }}
                    source={{ uri: mediaUrl }}
                    style={{ width: '100%', height: '100%' }}
                    contentFit="cover"
                    onError={(error) => {
                      console.warn('Image load error for post:', item.id, error)
                    }}
                  />
                </View>
              </View>
            </Pressable>
          </Link>
        )
      } catch (error) {
        console.error('Error rendering grid item:', error, item)
        return <View width={itemCellWidth} height={itemCellWidth} />
      }
    },
    [tertiaryBackgroundColor]
  )

  const keyExtractor = useCallback((item, index) => {
    try {
      return item?.id?.toString() || `post-${index}-${Date.now()}`
    } catch {
      return `post-${index}-${Date.now()}`
    }
  }, [])

  const handleSearchPress = useCallback(() => {
    try {
      router.push('/search')
    } catch (error) {
      console.error('Navigation error:', error)
    }
  }, [router])

  if (isLoading) {
    return (
      <SafeAreaView flex={1} style={{ backgroundColor }}>
        <Stack.Screen options={{ title: 'Explore', headerBackTitle: 'Back' }} />
        <View flexGrow={1} justifyContent="center" alignItems="center">
          <ActivityIndicator size="large" color={textColor} />
        </View>
      </SafeAreaView>
    )
  }

  if (fetchError || hasError) {
    return (
      <SafeAreaView flex={1} style={{ backgroundColor }}>
        <Stack.Screen options={{ title: 'Explore', headerBackTitle: 'Back' }} />
        <View flexGrow={1} justifyContent="center" alignItems="center" p="$4">
          <Text color={dangerColor} fontSize="$5" textAlign="center" mb="$4">
            {fetchError?.message || 'Something went wrong loading content'}
          </Text>
          <Pressable
            onPress={onRefresh}
            style={{
              backgroundColor: textColor,
              paddingHorizontal: 20,
              paddingVertical: 10,
              borderRadius: 8,
            }}
          >
            <Text color={backgroundColor} fontWeight="600">
              Try Again
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView
      flex={1}
      edges={['top', 'bottom', 'left', 'right']}
      style={{ backgroundColor }}
    >
      <Stack.Screen
        options={{
          title: 'Explore',
          headerBackTitle: 'Back',
          headerRight: () => (
            <Pressable
              accessible={true} 
              accessibilityLabel="Search" 
              accessibilityRole="button"
              onPress={handleSearchPress}
              style={{ marginRight: 10 }}
              hitSlop={10}
            >
              <Feather name="search" size={24} color={tertiaryColor} />
            </Pressable>
          ),
        }}
      />
      {Array.isArray(gridPosts) && gridPosts.length > 0 ? (
        <FlatList
          ref={flatListRef}
          data={gridPosts}
          renderItem={RenderGridPostItem}
          keyExtractor={keyExtractor}
          numColumns={NUM_COLUMNS}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={textColor}
              colors={[textColor]}
            />
          }
          onError={(error) => {
            console.error('FlatList error:', error)
            setHasError(true)
          }}
          removeClippedSubviews={false}
          maxToRenderPerBatch={15}
          windowSize={5}
          initialNumToRender={20}
          scrollEventThrottle={16}
        />
      ) : (
        <View flexGrow={1} justifyContent="center" alignItems="center" p="$4">
          <Text color={textColor} fontSize="$4" textAlign="center">
            No posts available right now
          </Text>
        </View>
      )}
    </SafeAreaView>
  )
}
