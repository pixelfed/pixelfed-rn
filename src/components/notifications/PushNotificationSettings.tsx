import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import Constants from 'expo-constants'
import * as Device from 'expo-device'
import * as Notifications from 'expo-notifications'
import { useEffect, useState } from 'react'
import { ActivityIndicator, Platform } from 'react-native'
import { Switch } from 'src/components/form/Switch'
import {
  pushState,
  pushStateCompare,
  pushStateDisable,
  pushStateUpdate,
} from 'src/lib/api'
import { ScrollView, Separator, Text, useTheme, View, XStack, YStack } from 'tamagui'

function handleRegistrationError(errorMessage: string) {
  alert(errorMessage)
  throw new Error(errorMessage)
}

async function registerForPushNotificationsAsync() {
  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    })
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync()
    let finalStatus = existingStatus
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync()
      finalStatus = status
    }
    if (finalStatus !== 'granted') {
      handleRegistrationError(
        'Permission not granted to get push token for push notification!'
      )
      return
    }
    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId
    if (!projectId) {
      handleRegistrationError('Project ID not found')
    }
    try {
      const pushTokenString = (
        await Notifications.getExpoPushTokenAsync({
          projectId,
        })
      ).data
      return pushTokenString
    } catch (e: unknown) {
      handleRegistrationError(`${e}`)
    }
  } else {
    handleRegistrationError('Must use physical device for push notifications')
  }
}

export default function Page() {
  const queryClient = useQueryClient()
  const [expoPushToken, setExpoPushToken] = useState('')
  const theme = useTheme()

  useEffect(() => {
    registerForPushNotificationsAsync()
      .then((token) => setExpoPushToken(token ?? ''))
      .catch((error: any) => setExpoPushToken(`${error}`))
  }, [])

  const toggleState = (val) => {
    if (val == true) {
      mutation.mutate({ type: 'enable' })
    } else {
      mutation.mutate({ type: 'disable' })
    }
  }

  const mutation = useMutation({
    mutationFn: async (params) => {
      if (params.type === 'disable') {
        return await pushStateDisable()
      }
      if (params.type === 'enable') {
        return await pushStateUpdate({
          notify_enabled: true,
          token: expoPushToken,
        })
      }
      if (params.type === 'compare') {
        return await pushStateCompare({ expo_token: expoPushToken })
      }
      if (params.type === 'notify_like') {
        return await pushStateUpdate({
          notify_enabled: true,
          token: expoPushToken,
          notify_like: params.value,
        })
      }
      if (params.type === 'notify_follow') {
        return await pushStateUpdate({
          notify_enabled: true,
          token: expoPushToken,
          notify_follow: params.value,
        })
      }
      if (params.type === 'notify_like') {
        return await pushStateUpdate({
          notify_enabled: true,
          token: expoPushToken,
          notify_like: params.value,
        })
      }
      if (params.type === 'notify_mention') {
        return await pushStateUpdate({
          notify_enabled: true,
          token: expoPushToken,
          notify_mention: params.value,
        })
      }
      if (params.type === 'notify_comment') {
        return await pushStateUpdate({
          notify_enabled: true,
          token: expoPushToken,
          notify_comment: params.value,
        })
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pushState'] })
    },
  })

  const {
    data: pushStateRes,
    status,
    error,
  } = useQuery({
    queryKey: ['pushState'],
    queryFn: pushState,
  })

  if (status === 'pending') {
    return (
      <View>
        <ActivityIndicator color={theme.color?.val.default.val} />
      </View>
    )
  }

  if (status === 'error') {
    return (
      <View>
        <Text>{error?.message}</Text>
      </View>
    )
  }

  const RenderActivePanel = () => {
    return (
      <ScrollView flexShrink={1}>
        <XStack
          py="$4"
          px="$4"
          bg={theme.background?.val.tertiary.val}
          justifyContent="space-between"
          alignItems="center"
        >
          <YStack maxWidth="75%">
            <Text fontSize="$6" color={theme.color?.val.default.val}>
              Enable Push Notifications
            </Text>
          </YStack>
          <Switch
            size="$3"
            defaultChecked={pushStateRes.notify_enabled}
            value={pushStateRes.notify_enabled}
            onCheckedChange={(val) => toggleState(val)}
          >
            <Switch.Thumb animation="quicker" />
          </Switch>
        </XStack>

        <YStack
          m="$3"
          borderColor={theme.borderColor?.val.default.val}
          borderWidth={1}
          borderRadius={10}
          overflow="hidden"
        >
          <XStack
            py="$3"
            px="$4"
            bg={theme.background?.val.tertiary.val}
            justifyContent="space-between"
          >
            <YStack maxWidth="75%" gap="$2">
              <Text
                fontSize="$5"
                fontWeight={'bold'}
                color={theme.color?.val.default.val}
              >
                New Follower
              </Text>
              <Text fontSize="$3" color={theme.color?.val.secondary.val}>
                jappleseed started following you
              </Text>
            </YStack>
            <Switch
              size="$3"
              disabled={!pushStateRes.notify_enabled || !pushStateRes.has_token}
              defaultChecked={pushStateRes.notify_follow}
              onCheckedChange={(val) =>
                mutation.mutate({ type: 'notify_follow', value: val })
              }
            >
              <Switch.Thumb animation="quicker" />
            </Switch>
          </XStack>
          <Separator borderColor={theme.borderColor?.val.default.val} />
          <XStack
            py="$3"
            px="$4"
            bg={theme.background?.val.tertiary.val}
            justifyContent="space-between"
          >
            <YStack maxWidth="75%" gap="$2">
              <Text
                fontSize="$5"
                fontWeight={'bold'}
                color={theme.color?.val.default.val}
              >
                Likes
              </Text>
              <Text fontSize="$3" color={theme.color?.val.secondary.val}>
                jappleseed liked your post
              </Text>
            </YStack>
            <Switch
              size="$3"
              disabled={!pushStateRes.notify_enabled || !pushStateRes.has_token}
              defaultChecked={pushStateRes.notify_like}
              onCheckedChange={(val) =>
                mutation.mutate({ type: 'notify_like', value: val })
              }
            >
              <Switch.Thumb animation="quicker" />
            </Switch>
          </XStack>
          <Separator borderColor={theme.borderColor?.val.default.val} />
          <XStack
            py="$3"
            px="$4"
            bg={theme.background?.val.tertiary.val}
            justifyContent="space-between"
          >
            <YStack maxWidth="75%" gap="$2">
              <Text
                fontSize="$5"
                fontWeight={'bold'}
                color={theme.color?.val.default.val}
              >
                Comments
              </Text>
              <Text fontSize="$3" color={theme.color?.val.secondary.val}>
                jappleseed commented on your post
              </Text>
            </YStack>
            <Switch
              size="$3"
              disabled={!pushStateRes.notify_enabled || !pushStateRes.has_token}
              defaultChecked={pushStateRes.notify_comment}
              onCheckedChange={(val) =>
                mutation.mutate({ type: 'notify_comment', value: val })
              }
            >
              <Switch.Thumb animation="quicker" />
            </Switch>
          </XStack>
          <Separator borderColor={theme.borderColor?.val.default.val} />
          <XStack
            py="$3"
            px="$4"
            bg={theme.background?.val.tertiary.val}
            justifyContent="space-between"
          >
            <YStack maxWidth="75%" gap="$2">
              <Text
                fontSize="$5"
                fontWeight={'bold'}
                color={theme.color?.val.default.val}
              >
                Mentions
              </Text>
              <Text fontSize="$3" color={theme.color?.val.secondary.val}>
                jappleseed mentioned you in a post
              </Text>
            </YStack>
            <Switch
              size="$3"
              disabled={!pushStateRes.notify_enabled || !pushStateRes.has_token}
              defaultChecked={pushStateRes.notify_mention}
              onCheckedChange={(val) =>
                mutation.mutate({ type: 'notify_mention', value: val })
              }
            >
              <Switch.Thumb animation="quicker" />
            </Switch>
          </XStack>
        </YStack>
      </ScrollView>
    )
  }

  return <RenderActivePanel />
}
