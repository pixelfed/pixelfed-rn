import { useCallback, useEffect, useState } from 'react'
import { FlatList, StyleSheet, Pressable, ActivityIndicator } from 'react-native'
import { Text, View, XStack, Select, Adapt, Sheet, SheetContents } from 'tamagui'
import FeedPost from 'src/components/post/FeedPost'
import { StatusBar } from 'expo-status-bar'
import { Feather } from '@expo/vector-icons'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Link, Stack } from 'expo-router'
import { useInfiniteQuery } from '@tanstack/react-query'
import { fetchHomeFeed } from 'src/lib/api'
import FeedHeader from 'src/components/common/FeedHeader'
import { Storage } from 'src/state/cache'

const keyExtractor = (_, index) => `post-${_.id}-${index}`

export default function HomeScreen() {
  const {
    data,
    fetchNextPage,
    fetchPreviousPage,
    hasNextPage,
    hasPreviousPage,
    isFetchingNextPage,
    isFetching,
    isError,
    error,
  } = useInfiniteQuery({
    queryKey: ['homeFeed'],
    initialPageParam: null,
    queryFn: fetchHomeFeed,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    getPreviousPageParam: (lastPage) => lastPage.prevPage,
  })

  if (isFetching && !isFetchingNextPage) {
    return (
      <View flexGrow={1} mt="$5">
        <ActivityIndicator color={'#000'} />
      </View>
    )
  }

  if (error) {
    return (
      <View flexGrow={1}>
        <Text>Error</Text>
      </View>
    )
  }

  const user = JSON.parse(Storage.getString('user.profile'))

  const HeaderComponent = () => (
    <XStack
      px="$3"
      pb="$3"
      bg="white"
      justifyContent="space-between"
      alignItems="center"
      zIndex={100}
    >
      <XStack alignItems="center" gap="$1">
        <Text fontSize={30} fontWeight="bold" letterSpacing={-1}>
          Home
        </Text>
      </XStack>
      <XStack gap="$5">
        <Link href="/notifications" asChild>
          <Pressable>
            <Feather name="heart" size={26} />
          </Pressable>
        </Link>
        <Link href="/chats" asChild>
          <Pressable>
            <Feather name="mail" size={26} />
          </Pressable>
        </Link>
        <Feather name="plus-square" size={26} />
      </XStack>
    </XStack>
  )

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />
      <Stack.Screen options={{ headerShown: false }} />
      <FeedHeader title="Home" />
      <FlatList
        data={data?.pages.flatMap((page) => page.data)}
        keyExtractor={keyExtractor}
        renderItem={({ item }) => <FeedPost post={item} user={user} />}
        maxToRenderPerBatch={3}
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        onEndReached={() => {
          if (hasNextPage) fetchNextPage()
        }}
        onEndReachedThreshold={0.5}
        ListFooterComponent={() => (isFetchingNextPage ? <ActivityIndicator /> : null)}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
})
