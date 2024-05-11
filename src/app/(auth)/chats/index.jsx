import { FlatList, Dimensions, ActivityIndicator } from 'react-native'
import { Avatar, Image, ScrollView, Text, View, YStack, XStack, Separator } from 'tamagui'
import ProfileHeader from '@components/profile/ProfileHeader'
import { Storage } from 'src/state/cache'
import { queryApi } from 'src/requests'
import { useState, useEffect } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Stack, useLocalSearchParams } from 'expo-router'
import { useQuery, useInfiniteQuery } from '@tanstack/react-query'
import { getConversations, getAccountStatusesById } from 'src/lib/api'
import { _timeAgo } from '../../../utils'

export default function Page() {
  const { isPending, isFetching, isError, data, error } = useQuery({
    queryKey: ['getConversations'],
    queryFn: getConversations,
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

  const RenderItem = ({ item }) => {
    let content = ''
    let cotext = item.last_status?.content_text
    if (cotext) {
      let conlen = cotext.length
      content = conlen > 30 ? cotext.slice(0, 30) + '...' : cotext
    }
    return (
      <View p="$3">
        <XStack alignItems="center" gap="$3">
          <Avatar circular size="$6">
            <Avatar.Image src={item.accounts[0].avatar} />
          </Avatar>

          <YStack flexGrow={1} gap={4}>
            <Text fontSize="$6" fontWeight="bold">
              {item.accounts[0].username}
            </Text>
            <XStack gap="$2" alignItems="center">
              <Text fontSize="$5" flexWrap="wrap" color="$gray9">
                {content}
              </Text>
              <Text color="$gray9">·</Text>
              <Text color="$gray9">{_timeAgo(item.last_status.created_at)} ago</Text>
            </XStack>
          </YStack>
        </XStack>
      </View>
    )
  }

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['bottom']}>
      <Stack.Screen
        options={{
          title: 'Chats',
          headerBackTitle: 'Back',
        }}
      />
      <FlatList
        data={data}
        renderItem={RenderItem}
        ItemSeparatorComponent={<Separator borderColor="$gray5" />}
      />
    </SafeAreaView>
  )
}
