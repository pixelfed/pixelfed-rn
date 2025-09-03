import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import Constants from 'expo-constants'
import * as Device from 'expo-device'
import * as Notifications from 'expo-notifications'
import { useCallback, useEffect, useState } from 'react'
import { ActivityIndicator, Platform, Alert } from 'react-native'
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
  const [updatingKeys, setUpdatingKeys] = useState(new Set())
  const theme = useTheme()

  useEffect(() => {
    registerForPushNotificationsAsync()
      .then((token) => setExpoPushToken(token ?? ''))
      .catch((error: any) => setExpoPushToken(`${error}`))
  }, [])

  const mutation = useMutation({
    mutationFn: async ({ type, value, optimisticKey }) => {
      if (type === 'disable') {
        return await pushStateDisable()
      }
      if (type === 'enable') {
        return await pushStateUpdate({
          notify_enabled: true,
          token: expoPushToken,
        })
      }
      
      const updatePayload = {
        notify_enabled: true,
        token: expoPushToken,
        [type]: value,
      }
      
      return await pushStateUpdate(updatePayload)
    },
    onMutate: async ({ type, value, optimisticKey }) => {
      await queryClient.cancelQueries({ queryKey: ['pushState'] })
      
      const previousState = queryClient.getQueryData(['pushState'])
      
      queryClient.setQueryData(['pushState'], (old) => ({
        ...old,
        [type]: value
      }))
      
      setUpdatingKeys(prev => new Set([...prev, optimisticKey]))
      
      return { previousState, optimisticKey }
    },
    onError: (err, { optimisticKey }, context) => {
      if (context?.previousState) {
        queryClient.setQueryData(['pushState'], context.previousState)
      }
      
      Alert.alert(
        'Update Failed', 
        'Unable to update notification setting. Please try again.',
        [{ text: 'OK' }]
      )
    },
    onSettled: (_, __, { optimisticKey }) => {
      setUpdatingKeys(prev => {
        const newSet = new Set(prev)
        newSet.delete(optimisticKey)
        return newSet
      })
      
      queryClient.invalidateQueries({ queryKey: ['pushState'] })
    },
  })

  const toggleMainState = useCallback((val) => {
    const type = val ? 'enable' : 'disable'
    const optimisticKey = 'notify_enabled'
    
    mutation.mutate({
      type: val ? 'notify_enabled' : 'disable',
      value: val,
      optimisticKey
    })
  }, [mutation])

  const toggleNotificationSetting = useCallback((settingType, value) => {
    mutation.mutate({
      type: settingType,
      value,
      optimisticKey: settingType
    })
  }, [mutation])

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
      <View flex={1} justifyContent="center" alignItems="center">
        <ActivityIndicator color={theme.color?.val.default.val} />
      </View>
    )
  }

  if (status === 'error') {
    return (
      <View flex={1} justifyContent="center" alignItems="center" p="$4">
        <Text color="$red10" textAlign="center" mb="$4">
          {error?.message || 'Failed to load settings'}
        </Text>
      </View>
    )
  }

  const notificationSettings = [
    {
      key: 'notify_follow',
      title: 'New Follower',
      description: 'jappleseed started following you'
    },
    {
      key: 'notify_like',
      title: 'Likes', 
      description: 'jappleseed liked your post'
    },
    {
      key: 'notify_comment',
      title: 'Comments',
      description: 'jappleseed commented on your post'
    },
    {
      key: 'notify_mention',
      title: 'Mentions',
      description: 'jappleseed mentioned you in a post'
    }
  ]

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
          <View position="relative">
            <Switch
              size="$3"
              checked={pushStateRes.notify_enabled}
              onCheckedChange={toggleMainState}
              disabled={updatingKeys.has('notify_enabled')}
            >
              <Switch.Thumb animation="quicker" />
            </Switch>
            {updatingKeys.has('notify_enabled') && (
              <View 
                position="absolute"
                top={-2}
                left={-2}
                right={-2}
                bottom={-2}
                justifyContent="center"
                alignItems="center"
                bg="rgba(255,255,255,0.8)"
                borderRadius="$2"
              >
                <ActivityIndicator size="small" />
              </View>
            )}
          </View>
        </XStack>

        <YStack
          m="$3"
          borderColor={theme.borderColor?.val.default.val}
          borderWidth={1}
          borderRadius={10}
          overflow="hidden"
        >
          {notificationSettings.map((setting, index) => (
            <View key={setting.key}>
              <XStack
                py="$3"
                px="$4"
                bg={theme.background?.val.tertiary.val}
                justifyContent="space-between"
                opacity={(!pushStateRes.notify_enabled || !pushStateRes.has_token) ? 0.5 : 1}
              >
                <YStack maxWidth="75%" gap="$2">
                  <Text
                    fontSize="$5"
                    fontWeight={'bold'}
                    color={theme.color?.val.default.val}
                  >
                    {setting.title}
                  </Text>
                  <Text fontSize="$3" color={theme.color?.val.secondary.val}>
                    {setting.description}
                  </Text>
                </YStack>
                
                <View position="relative">
                  <Switch
                    size="$3"
                    disabled={
                      !pushStateRes.notify_enabled || 
                      !pushStateRes.has_token || 
                      updatingKeys.has(setting.key)
                    }
                    checked={pushStateRes[setting.key]}
                    onCheckedChange={(val) => toggleNotificationSetting(setting.key, val)}
                  >
                    <Switch.Thumb animation="quicker" />
                  </Switch>
                  
                  {updatingKeys.has(setting.key) && (
                    <View 
                      position="absolute"
                      top={-2}
                      left={-2}
                      right={-2}
                      bottom={-2}
                      justifyContent="center"
                      alignItems="center"
                      bg="rgba(255,255,255,0.8)"
                      borderRadius="$2"
                    >
                      <ActivityIndicator size="small" />
                    </View>
                  )}
                </View>
              </XStack>
              
              {index < notificationSettings.length - 1 && (
                <Separator borderColor={theme.borderColor?.val.default.val} />
              )}
            </View>
          ))}
        </YStack>
      </ScrollView>
    )
  }

  return <RenderActivePanel />
}