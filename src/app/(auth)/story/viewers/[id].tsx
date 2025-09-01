import { Feather } from '@expo/vector-icons'
import { useInfiniteQuery } from '@tanstack/react-query'
import { Link, Stack, useLocalSearchParams, useNavigation, useRouter } from 'expo-router'
import type React from 'react'
import { useLayoutEffect, useMemo } from 'react'
import { ActivityIndicator, Alert, FlatList, Pressable } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { getStoryViewers, postStorySelfExpire } from 'src/lib/api'
import { _timeAgo } from 'src/utils'
import {
  Avatar,
  Button,
  Group,
  ScrollView,
  Separator,
  Text,
  useTheme,
  XStack,
  YStack,
} from 'tamagui'

interface Viewer {
  id: string
  username: string
  name?: string
  display_name?: string
  acct: string
  avatar: string
  viewed_at: string
}

export default function Page() {
  const navigation = useNavigation()
  const { id } = useLocalSearchParams()
  const router = useRouter()
  const theme = useTheme()

  useLayoutEffect(() => {
    navigation.setOptions({ title: 'Story Viewers' })
  }, [navigation])

  const onBack = () => {
    router.back()
  }

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
    refetch,
  } = useInfiniteQuery({
    queryKey: ['storyViewers', id],
    queryFn: ({ pageParam = null }) => getStoryViewers(id, pageParam),
    initialPageParam: null,
    getNextPageParam: (lastPage) => lastPage?.nextPage,
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  })

  const viewers = useMemo(() => {
    return data?.pages?.flatMap((page) => page.data) || []
  }, [data])

  const ViewerItem: React.FC<{
    viewer: Viewer
    theme: any
  }> = ({ viewer, theme }) => {
    const viewedAgo = useMemo(() => {
      return _timeAgo(viewer?.viewed_at)
    }, [viewer?.viewed_at])

    const router = useRouter()

    const gotoProfile = () => {
      router.push(`/profile/${viewer?.id}`)
    }

    return (
      <Pressable onPress={gotoProfile}>
        <XStack
          padding={12}
          alignItems="center"
          space={12}
          backgroundColor={theme.background?.val?.default?.val}
        >
          <Avatar circular size="$4">
            <Avatar.Image source={{ uri: viewer?.avatar }} />
            <Avatar.Fallback
              backgroundColor={theme.background?.val?.tertiary?.val}
              alignItems="center"
              justifyContent="center"
            >
              <Text color={theme.color?.val?.default?.val}>
                {viewer?.username?.charAt(0)?.toUpperCase() || '?'}
              </Text>
            </Avatar.Fallback>
          </Avatar>

          <YStack flex={1} gap={5}>
            <Text color={theme.color?.val?.default?.val} fontSize={14} fontWeight="600">
              {viewer?.name || viewer?.username}
            </Text>
            {viewer?.display_name && (
              <Text color={theme.color?.val?.secondary?.val} fontSize={16}>
                @{viewer?.acct}
              </Text>
            )}
            <Text color={theme.color?.val?.tertiary?.val} fontSize={12}>
              Viewed {viewedAgo} ago
            </Text>
          </YStack>
        </XStack>
      </Pressable>
    )
  }

  const renderViewer = ({ item }: { item: Viewer }) => (
    <ViewerItem viewer={item} theme={theme} />
  )

  const renderFooter = () => {
    if (isFetchingNextPage) {
      return (
        <YStack padding={20} alignItems="center">
          <ActivityIndicator size="small" color={theme.color?.val?.secondary?.val} />
          <Text color={theme.color?.val?.secondary?.val} fontSize={14} marginTop={8}>
            Loading more viewers...
          </Text>
        </YStack>
      )
    }

    if (!hasNextPage && viewers.length > 0) {
      return <YStack height={20} />
    }

    return null
  }

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }

  if (isLoading) {
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: theme.background?.val.default.val }}
        edges={['bottom']}
      >
        <Stack.Screen
          options={{
            title: 'Story Viewers',
            headerBackTitle: 'Back',
          }}
        />
        <YStack flex={1} alignItems="center" justifyContent="center" space={16}>
          <ActivityIndicator size="large" color={theme.color?.val?.secondary?.val} />
          <Text color={theme.color?.val?.secondary?.val}>Loading viewers...</Text>
        </YStack>
      </SafeAreaView>
    )
  }

  if (error) {
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: theme.background?.val.default.val }}
        edges={['bottom']}
      >
        <Stack.Screen
          options={{
            title: 'Story Viewers',
            headerBackTitle: 'Back',
          }}
        />
        <YStack
          flex={1}
          alignItems="center"
          justifyContent="center"
          space={16}
          padding={20}
        >
          <Feather
            name="alert-circle"
            size={48}
            color={theme.color?.val?.secondary?.val}
          />
          <Text color={theme.color?.val?.secondary?.val} textAlign="center">
            Failed to load story viewers
          </Text>
          <Text color={theme.color?.val?.tertiary?.val} textAlign="center" fontSize={14}>
            Please check your connection and try again
          </Text>
          <XStack space={12}>
            <Button
              size="$3"
              onPress={() => refetch()}
              backgroundColor={theme.background?.val?.tertiary?.val}
            >
              <Text color={theme.color?.val?.default?.val}>Retry</Text>
            </Button>
            <Button
              size="$3"
              onPress={onBack}
              backgroundColor={theme.background?.val?.tertiary?.val}
            >
              <Text color={theme.color?.val?.default?.val}>Go Back</Text>
            </Button>
          </XStack>
        </YStack>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: theme.background?.val.default.val }}
      edges={['bottom']}
    >
      <Stack.Screen
        options={{
          title: 'Story Viewers',
          headerBackTitle: 'Back',
        }}
      />
      {viewers.length === 0 ? (
        <YStack
          flex={1}
          alignItems="center"
          justifyContent="center"
          space={16}
          padding={20}
        >
          <Feather name="eye-off" size={48} color={theme.color?.val?.secondary?.val} />
          <Text color={theme.color?.val?.secondary?.val} textAlign="center">
            No viewers yet
          </Text>
          <Text color={theme.color?.val?.tertiary?.val} textAlign="center" fontSize={14}>
            When people view your story, they'll appear here
          </Text>
        </YStack>
      ) : (
        <FlatList
          data={viewers}
          keyExtractor={(item, index) => item?.id + '_index:' + index}
          renderItem={renderViewer}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
          ListFooterComponent={renderFooter}
          showsVerticalScrollIndicator={false}
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 20 }}
          ItemSeparatorComponent={() => (
            <Separator
              borderColor={theme.borderColor?.val?.default?.val}
              marginHorizontal={20}
            />
          )}
          maxToRenderPerBatch={10}
          windowSize={10}
          initialNumToRender={10}
        />
      )}
    </SafeAreaView>
  )
}
