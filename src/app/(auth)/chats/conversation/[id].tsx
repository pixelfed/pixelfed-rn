import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, Stack, useLocalSearchParams, useNavigation, useRouter } from 'expo-router'
import { useCallback, useEffect, useLayoutEffect, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  type AlertButton,
  Pressable,
  useWindowDimensions,
} from 'react-native'
import {
  Bubble,
  Composer,
  GiftedChat,
  InputToolbar,
  Send,
} from 'react-native-gifted-chat'
import { SafeAreaView } from 'react-native-safe-area-context'
import { deleteChatMessage, fetchChatThread, sendChatMessage } from 'src/lib/api'
import { _timeAgo, enforceLen } from 'src/utils'
import { Text, View, YStack, useTheme } from 'tamagui'

import { Feather } from '@expo/vector-icons'
import { useUserCache } from 'src/state/AuthProvider'

import type { BubbleProps, IMessage } from 'react-native-gifted-chat'

function renderBubble<TMessage extends IMessage>(props: BubbleProps<TMessage>) {
  const theme = useTheme()
  return (
    <Bubble
      {...props}
      textStyle={{
        left: { color: theme.color?.val.default.val },
        right: { color: 'white' },
      }}
      wrapperStyle={{
        left: { backgroundColor: theme.background?.val.tertiary.val },
        right: { backgroundColor: '#0081f1' },
      }}
    />
  )
}

export default function Page() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const queryClient = useQueryClient()
  const navigation = useNavigation()
  const [recipientUsername, setUsername] = useState('')
  const [messages, setMessages] = useState([])
  const [isReloading, setReloading] = useState(false)
  const [isTyping, setTyping] = useState(false)
  const selfUser = useUserCache()
  const { width } = useWindowDimensions()
  const theme = useTheme()

  const formattedUsername = useCallback(() => {
    if (!recipientUsername || !recipientUsername.length) {
      return
    }
    if (recipientUsername.startsWith('@')) {
      return recipientUsername
    }

    return `@${recipientUsername}`
  }, [recipientUsername])

  const HeaderTitle = () => (
    <YStack w="100%" justifyContent="center" alignItems="center">
      <Text fontSize="$6" fontWeight="bold" color={theme.color?.val.default.val}>
        Direct Message
      </Text>
      <Link href={`/profile/${id}`} asChild>
        <Text fontSize="$4" color={theme.color?.val.tertiary.val}>
          {enforceLen(formattedUsername(), 40, true)}
        </Text>
      </Link>
    </YStack>
  )
  useEffect(() => {
    navigation.setOptions({
      headerTitle: () => <HeaderTitle />,
      headerBackTitle: 'Back',
    })
  }, [navigation, recipientUsername])

  const onSend = (messages) => {
    sendMutation.mutate(messages)
  }

  const sendMutation = useMutation({
    mutationFn: async (message) => {
      try {
        const res = await sendChatMessage(id, message[0].text)

        if (typeof res.error !== 'undefined') {
          throw new Error(res.error)
        }

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
      } catch (err: any) {
        Alert.alert('Failed to send message', err?.message || err)
      }
    },
    onError: (err) => {
      Alert.alert('Failed to send message', err.message)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (message: IMessage) => {
      setMessages(messages.filter((a) => a['_id'] !== message['_id']))
      return await deleteChatMessage(message['reportId'])
    },
  })

  const onLongPress = (ctx: unknown, message: IMessage) => {
    const isSelf = message.user['_id'] == selfUser.id
    let opts: AlertButton[] = []

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
        onPress: () => confirmDelete(message),
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

  const confirmDelete = (message: IMessage) => {
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

        if (msg.type === 'link') {
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

      setUsername(data.username)
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
    <SafeAreaView
      style={{ flex: 1, backgroundColor: theme.background?.val.default.val }}
      edges={['bottom']}
    >
      <Stack.Screen
        options={{
          headerBackTitle: 'Back',
          headerRight: () =>
            isReloading ? (
              <ActivityIndicator color={theme.color?.val.default.val} />
            ) : (
              <Pressable onPress={() => reloadChat()}>
                <Feather
                  name="refresh-cw"
                  size={25}
                  color={theme.color?.val.default.val}
                />
              </Pressable>
            ),
        }}
      />
      <GiftedChat
        messages={messages}
        renderBubble={renderBubble}
        infiniteScroll
        scrollToBottom
        messagesContainerStyle={{
          backgroundColor: theme.background?.val.default.val,
          paddingBottom: 20,
        }}
        user={{
          _id: selfUser.id,
          name: selfUser.username,
          avatar: selfUser.avatar,
        }}
        onSend={(messages) => onSend(messages)}
        maxInputLength={500}
        lightboxProps={{
          activeProps: {
            style: {
              flex: 1,
              resizeMode: 'contain',
              width,
            },
          },
        }}
        textInputStyle={{
          backgroundColor: theme.background.val.tertiary.val,
          color: theme.color.val.default.val,
        }}
        renderComposer={(props) => (
          <Composer
            {...props}
            textInputStyle={{
              backgroundColor: theme.background.val.tertiary.val,
              color: theme.color.val.default.val,
              borderColor: theme.background.val.tertiary.val,
              borderWidth: 1,
            }}
            composerHeight={50}
            containerStyle={{
              backgroundColor: theme.background.val.tertiary.val,
              borderTopWidth: 0,
              borderTopColor: 'transparent',
            }}
          />
        )}
        renderInputToolbar={(props) => (
          <InputToolbar
            {...props}
            containerStyle={{
              backgroundColor: theme.background.val.tertiary.val,
              borderTopWidth: 0,
              marginHorizontal: 10,
              borderRadius: 10,
              borderTopColor: 'transparent',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          />
        )}
        isTyping={isTyping}
        onLongPress={(ctx, message) => onLongPress(ctx, message)}
        renderSend={(props) => {
          return (
            <Send {...props}>
              <View style={{ marginRight: 10, flex: 1, alignItems: 'center' }}>
                <Feather name="send" size={30} color="#0081f1" />
              </View>
            </Send>
          )
        }}
      />
    </SafeAreaView>
  )
}
