import { FlatList, Dimensions, ActivityIndicator } from 'react-native'
import { Avatar, Image, ScrollView, Text, View, YStack, XStack, Separator } from 'tamagui'
import ProfileHeader from '@components/profile/ProfileHeader'
import { Storage } from 'src/state/cache'
import { queryApi } from 'src/requests'
import { useState, useEffect } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Link, Stack, useLocalSearchParams } from 'expo-router'
import { useQuery, useInfiniteQuery } from '@tanstack/react-query'
import { getConversations, getAccountStatusesById } from 'src/lib/api'
import { _timeAgo } from 'src/utils'
import UserAvatar from 'src/components/common/UserAvatar'

export default function Page() {
  const selfUser = JSON.parse(Storage.getString('user.profile'))

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
    let isSelf = selfUser.id == item.last_status?.account?.id
    let content = ''
    let cotype = item.last_status?.pf_type
    let cotext = item.last_status?.content_text

    if(cotype === 'text') {
      if (cotext) {
        let conlen = cotext.length
        content = conlen > 30 ? cotext.slice(0, 30) + '...' : cotext
      }
    }

    if(cotype === 'story:reply') {
      content = isSelf ? 'You replied to their story': 'Replied to your story'
    }

    if(cotype === 'story:reaction') {
      content = isSelf ? 'You replied to their story': 'Replied to your story'
    }

    if(cotype === 'photo') {
      content = isSelf ? 'You sent a photo': 'Sent a photo'
    }

    if(cotype === 'photo:album') {
      content = isSelf ? 'You sent multiple photos': 'Sent multiple photos'
    }
    return (
      <View p="$3">
        <Link href={`/chats/conversation/${item.accounts[0].id}`}>
          <XStack alignItems="center" gap="$3">
            <UserAvatar url={item.accounts[0].avatar} />
          
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
        </Link>
      </View>
    )
  }

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['left']}>
      <Stack.Screen
        options={{
          title: 'Chats',
          headerBackTitle: 'Back',
        }}
      />
      <FlatList
        data={data}
        renderItem={RenderItem}
        ItemSeparatorComponent={<Separator borderColor="$gray7" />}
      />
    </SafeAreaView>
  )
}
