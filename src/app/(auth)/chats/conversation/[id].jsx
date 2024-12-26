import { FlatList, Dimensions, ActivityIndicator, Alert, Pressable } from 'react-native'
import { Avatar, Image, ScrollView, Text, View, YStack, XStack, Separator } from 'tamagui'
import ProfileHeader from '@components/profile/ProfileHeader'
import { Storage } from 'src/state/cache'
import { queryApi } from 'src/requests'
import { useState, useEffect, useCallback, useLayoutEffect } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Stack, useLocalSearchParams, useNavigation, useRouter } from 'expo-router'
import {
  useQuery,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'
import { fetchChatThread, sendChatMessage, deleteChatMessage } from 'src/lib/api'
import { _timeAgo, enforceLen } from 'src/utils'
import { GiftedChat, Bubble, Send } from 'react-native-gifted-chat'
import { Feather } from '@expo/vector-icons'

const renderBubble = (props) => {
  return (
    <Bubble
      {...props}
      textStyle={{ right: { color: 'white' } }}
      wrapperStyle={{ right: { backgroundColor: '#0081f1' } }}
    />
  )
}

export default function Page() {
  const { id } = useLocalSearchParams()
  const router = useRouter()
  const queryClient = useQueryClient()
  const navigation = useNavigation()
  useLayoutEffect(() => {
    navigation.setOptions({ title: 'Conversation', headerBackTitle: 'Back' })
  }, [navigation])
  const [messages, setMessages] = useState([])
  const [isReloading, setReloading] = useState(false)
  const [isTyping, setTyping] = useState(false)
  const selfUser = JSON.parse(Storage.getString('user.profile'))

  const onSend = (messages) => {
    sendMutation.mutate(messages)
  }

  const sendMutation = useMutation({
    mutationFn: async (message) => {
      const res = await sendChatMessage(id, message[0].text)
      const msg = {
        _id: res.id,
        id: res.id,
        createdAt: new Date(),
        sent: true,
        text: message[0].text,
        user: {
          _id: selfUser.id,
          name: selfUser.username,
          avatar: selfUser.avatar,
        },
      }
      setMessages((previousMessages) => GiftedChat.append(previousMessages, msg))
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (message) => {
      setMessages(messages.filter((a) => a['_id'] !== message['_id']))
      return await deleteChatMessage(message['reportId'])
    },
  })

  const onLongPress = (ctx, message) => {
    const isSelf = message.user['_id'] == selfUser.id
    let opts = []

    if (message?.text) {
      opts = [
        {
          text: 'Copy text',
          onPress: () => null,
        },
      ]
    }
    if (isSelf) {
      opts.push({
        text: 'Delete',
        onPress: () => _confirmDelete(message),
        style: 'destructive',
      })
    } else {
      opts.push({
        text: 'View Profile',
        onPress: () => router.push(`/profile/${message.user['_id']}`),
      })
    }
    Alert.alert('', 'Chat Options', [
      ...opts,
      {
        text: 'Close',
        style: 'cancel',
      },
    ])
  }

  const _confirmDelete = (message) => {
    Alert.alert('Confirm', 'Are you sure you want to delete this direct message?', [
      {
        text: 'Delete',
        onPress: () => deleteMutation.mutate(message),
        style: 'destructive',
      },
      {
        text: 'Close',
        style: 'cancel',
      },
    ])
  }

  const reloadChat = () => {
    setReloading(true)
    queryClient.invalidateQueries({ queryKey: ['fetchChat', id] })
  }

  const { data: feed, isLoading } = useQuery({
    queryKey: ['fetchChat', id],
    queryFn: async () => {
      const data = await fetchChatThread(id)
      const msgs = data.messages.map((msg) => {
        let chat = {
          _id: msg.id,
          id: msg.id,
          createdAt: msg.created_at,
          reportId: msg.reportId,
          user: {
            _id: data.id,
            name: data.username,
            avatar: data.avatar,
          },
        }

        if (msg.isAuthor) {
          chat.sent = true
          chat.user = {
            _id: selfUser.id,
            name: selfUser.username,
            avatar: selfUser.avatar,
          }
        } else {
          chat.received = true
          chat.user = {
            _id: data.id,
            name: data.username,
            avatar: data.avatar,
          }
        }

        if (['text', 'emoji'].includes(msg.type)) {
          chat.text = msg.text
        }

        if (['story:reply', 'story:comment', 'story:react'].includes(msg.type)) {
          chat.text = `Story Reply: "${enforceLen(msg.text, 8, true, 'middle')}"`
        }

        if (['photo', 'photos'].includes(msg.type)) {
          chat.image = msg.media

          if (msg.text) {
            chat.text = msg.text
          }
        }

        if(msg.type === 'link') {
          chat.text = msg.text
        }

        return chat
      })

      msgs.push({
        _id: '100101',
        system: true,
        text: 'Use caution when sharing sensitive data.',
      })

      msgs.push({
        _id: '100100',
        system: true,
        text: 'Direct conversation with ' + data.username,
      })

      setMessages(msgs)
      setReloading(false)
      return msgs
    },
  })

  if (isLoading) {
    return (
      <View p="$3">
        <ActivityIndicator />
      </View>
    )
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }} edges={['bottom']}>
      <Stack.Screen
        options={{
          title: 'Conversation',
          headerBackTitle: 'Back',
          headerRight: () =>
            isReloading ? (
              <ActivityIndicator />
            ) : (
              <Pressable onPress={() => reloadChat()}>
                <Feather name="refresh-cw" size={25} />
              </Pressable>
            ),
        }}
      />
      <GiftedChat
        messages={messages}
        renderBubble={renderBubble}
        infiniteScroll
        scrollToBottom
        messagesContainerStyle={{ backgroundColor: 'white' }}
        user={{
          _id: selfUser.id,
          name: selfUser.username,
          avatar: selfUser.avatar,
        }}
        onSend={(messages) => onSend(messages)}
        maxInputLength={500}
        isTyping={isTyping}
        onLongPress={(ctx, message) => onLongPress(ctx, message)}
        renderSend={(props) => {
          return (
            <Send {...props}>
              <View style={{ marginRight: 10, marginBottom: 5, alignItems: 'center' }}>
                <Feather name="send" size={30} color="#0081f1" />
              </View>
            </Send>
          )
        }}
      />
    </SafeAreaView>
  )
}
