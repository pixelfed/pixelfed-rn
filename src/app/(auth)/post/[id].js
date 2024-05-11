import { FlatList, Dimensions, ActivityIndicator } from 'react-native'
import { Image, ScrollView, Text, View, YStack } from 'tamagui'
import ProfileHeader from '@components/profile/ProfileHeader'
import { Storage } from 'src/state/cache'
import { queryApi } from 'src/requests'
import { useState, useEffect } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Stack, useLocalSearchParams } from 'expo-router'
import { useQuery, useInfiniteQuery } from '@tanstack/react-query'
import { getStatusById, getAccountStatusesById } from 'src/lib/api'
import FeedPost from 'src/components/post/FeedPost'

export default function Page() {
  const { id } = useLocalSearchParams()

  const { isPending, isFetching, isError, data, error } = useQuery({
    queryKey: ['todos', id],
    queryFn: getStatusById,
  })

  if (isPending) {
    return (
      <View flexGrow={1} mt="$5">
        <ActivityIndicator color={'#000'} />
      </View>
    )
  }

  if (isError) {
    return <Text>Error: {error.message}</Text>
  }

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['bottom']}>
      <Stack.Screen
        options={{
          title: 'Post',
          headerBackTitle: 'Back',
        }}
      />
      <ScrollView flexShrink={1}>
        <FeedPost post={data} />
      </ScrollView>
    </SafeAreaView>
  )
}
