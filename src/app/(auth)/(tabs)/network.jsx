import { useCallback, useEffect, useState } from 'react'
import { FlatList, StyleSheet, Pressable, ActivityIndicator } from 'react-native'
import { Text, View, XStack, Select, Adapt, Sheet, SheetContents } from 'tamagui'
import FeedPost from 'src/components/post/FeedPost'
import { StatusBar } from 'expo-status-bar'
import { Feather } from '@expo/vector-icons'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Link, Stack } from 'expo-router'
import { useInfiniteQuery } from '@tanstack/react-query'
import { fetchNetworkFeed } from 'src/lib/api'
import FeedHeader from 'src/components/common/FeedHeader'

const RenderPost = ({ item }) => <FeedPost post={item} />
const keyExtractor = (_, index) => `post-${_.id}-${index}`

export default function NetworkScreen() {
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
    queryKey: ['networkFeed'],
    initialPageParam: null,
    queryFn: fetchNetworkFeed,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    getPreviousPageParam: (lastPage) => lastPage.prevPage,
  })

  if (isFetching && !isFetchingNextPage) {
    return (
      <View flexGrow={1} mt="$5">
        <ActivityIndicator />
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

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />
      <Stack.Screen options={{ headerShown: false }} />
      <FeedHeader title="Network" />

      <FlatList
        data={data?.pages.flatMap((page) => page.data)}
        keyExtractor={keyExtractor}
        renderItem={RenderPost}
        maxToRenderPerBatch={3}
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
