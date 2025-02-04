import { Link, router, useNavigation, useRouter } from 'expo-router'
import {
  Text,
  View,
  Form,
  Button,
  YStack,
  Image,
  Label,
  Input,
  Separator,
  XStack,
  Adapt,
  Select,
  Sheet,
} from 'tamagui'
import { useAuth } from '@state/AuthProvider'
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  SafeAreaView,
  TextInput,
} from 'react-native'
import { useEffect, useState, useMemo, useCallback } from 'react'
import { StatusBar } from 'expo-status-bar'
import Feather from '@expo/vector-icons/Feather'
import { FormSelect } from 'src/components/form/Select'
import { getOpenServers } from 'src/lib/api'
import { useQuery } from '@tanstack/react-query'
import * as WebBrowser from 'expo-web-browser'
import { Storage } from 'src/state/cache'

const ServerItem = React.memo(
  ({ item, index, selectedServer }) => (
    <View>
      <Separator />
      <Select.Item index={index} value={item.domain} py="$3" alignItems="center">
        <YStack flexGrow={1} py="$2">
          <XStack justifyContent="space-between" alignItems="center" gap="$5">
            <Select.ItemText
              flexWrap="wrap"
              fontSize="$6"
              fontWeight={selectedServer === item.domain ? 'bold' : 'normal'}
            >
              {item.domain}
            </Select.ItemText>
            {item.mobile_registration && item.domain != selectedServer && (
              <Feather name="user-plus" size={24} color="#51a2ff" />
            )}
            <Select.ItemIndicator marginLeft="auto">
              <Feather name="check" size={16} color="#7ccf00" />
            </Select.ItemIndicator>
          </XStack>
        </YStack>
      </Select.Item>
    </View>
  ),
  (prevProps, nextProps) => {
    return (
      prevProps.selectedServer === nextProps.selectedServer &&
      prevProps.item.domain === nextProps.item.domain
    )
  }
)

const SelectContent = React.memo(({ data, selectedServer }) => (
  <Select.Content zIndex={200000}>
    <Select.ScrollUpButton
      alignItems="center"
      justifyContent="center"
      position="relative"
      width="100%"
      height="$3"
    >
      <YStack zIndex={10}>
        <Feather name="chevron-up" size={20} />
      </YStack>
    </Select.ScrollUpButton>

    <Select.Viewport
      animation="quick"
      animateOnly={['transform', 'opacity']}
      enterStyle={{ o: 0, y: -10 }}
      exitStyle={{ o: 0, y: 10 }}
    >
      <Select.Group>
        <Select.Label>Select a server</Select.Label>
        {data?.map((item, i) => (
          <ServerItem
            key={item.domain}
            item={item}
            index={i}
            selectedServer={selectedServer}
          />
        ))}
        <View h={50}></View>
      </Select.Group>
    </Select.Viewport>

    <Select.ScrollDownButton
      alignItems="center"
      justifyContent="center"
      position="relative"
      width="100%"
      height="$3"
    >
      <YStack zIndex={10}>
        <Feather name="chevron-down" size={20} />
      </YStack>
    </Select.ScrollDownButton>
  </Select.Content>
))

export default function Login() {
  const [server, setServer] = useState('pixelfed.social')
  const [customServer, setCustomServer] = useState('')
  const [openRegistrations, setOpenServers] = useState([])
  const { login, isLoading } = useAuth()
  const router = useRouter()

  const serverInfo = () => {
    Alert.alert(
      'About Servers',
      'Pixelfed is a decentralized platform of servers, you can join and use any server.\n\nPixelfed.social is the flagship server, operated by Pixelfed.org'
    )
  }

  const { data, isLoading: loading } = useQuery({
    queryKey: ['openServers'],
    queryFn: async () => {
      try {
        const res = await getOpenServers()
        let filtered = res.slice(0, 20)
        let openReg = res
          .filter((s) => s.mobile_registration)
          .map((s) => s.domain)
          .slice(0, 20)
        setOpenServers(openReg)

        // Check if pixelfed.social exists in the response
        const hasPixelFed = filtered.some((server) => server.domain === 'pixelfed.social')

        if (!hasPixelFed) {
          // If pixelfed.social isn't in the response, add it at the beginning
          filtered.unshift({ domain: 'pixelfed.social' })
          // Remove last item if we're over 20 items
          if (filtered.length > 20) {
            filtered.pop()
          }
        }

        // Add 'Other' at the end
        filtered.push({ domain: 'Other' })
        return filtered
      } catch (error) {
        // Fallback data if the request fails
        return [{ domain: 'pixelfed.social' }, { domain: 'Other' }]
      }
    },
    placeholderData: [{ domain: 'pixelfed.social' }, { domain: 'Other' }],
  })

  const handleLogin = useCallback(() => {
    if (server === 'Other') {
      router.push('/selectServer')
      return
    }
    login(server)
  }, [server, login])

  const handleRegister = useCallback(async () => {
    try {
      await WebBrowser.openAuthSessionAsync(
        `https://${server}/i/app-email-verify`,
        'pixelfed://verifyEmail'
      ).then((res) => {
        console.log(res)
        if (res.type === 'success') {
          handleDeepLink(server, res.url)
        } else {
          // todo: handle error
        }
      })
    } catch (error) {
      console.error('Error opening verification page:', error)
    }
  }, [server])

  const handleDeepLink = (domain, url) => {
    const parsedUrl = new URL(url)
    const path = parsedUrl.pathname.substring(2)
    const searchParams = new URLSearchParams(parsedUrl.search)
    const params = {
      domain: domain,
      email: searchParams.get('email'),
      expires_in: Number.parseInt(searchParams.get('expires_in')),
      status: searchParams.get('status'),
    }
    const q = new URLSearchParams(params)
    router.push(`/verifyEmail?${q.toString()}`)
  }

  const clearStorage = () => {
    Storage.clearAll()
  }

  const SheetComponent = useMemo(
    () => (
      <Sheet
        modal
        dismissOnSnapToBottom
        animationConfig={{
          type: 'spring',
          damping: 20,
          mass: 1.2,
          stiffness: 250,
        }}
      >
        <Sheet.Frame>
          <Sheet.ScrollView>
            <Adapt.Contents />
          </Sheet.ScrollView>
        </Sheet.Frame>
        <Sheet.Overlay
          animation="lazy"
          enterStyle={{ opacity: 0 }}
          exitStyle={{ opacity: 0 }}
        />
      </Sheet>
    ),
    []
  )

  if (isLoading || loading) {
    return (
      <SafeAreaView
        style={{
          backgroundColor: 'black',
          flexGrow: 1,
          justifyContent: 'center',
          alignItems: 'center',
        }}
        edges={['top']}
      >
        <StatusBar style="light" />
        <View m="$5">
          <ActivityIndicator color="white" />
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView
      style={{
        backgroundColor: 'black',
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
      }}
      edges={['top']}
    >
      <StatusBar style="light" />
      <YStack flexGrow={1} w="100%" px="$5">
        <View flexGrow={1} justifyContent="center" alignItems="center">
          <Pressable onPress={() => clearStorage()}>
            <Image
              source={require('../../../assets/icon.png')}
              width={140}
              height={140}
            />
          </Pressable>
        </View>

        <YStack space="$4" mb="$5">
          <YStack>
            <XStack alignItems="center" justifyContent="space-between" gap="$4">
              <Label miw={80} fontSize="$5" color="$gray9">
                <XStack gap="$3" alignItems="center">
                  <Pressable onPress={() => serverInfo()}>
                    <Feather name="info" color="#ccc" size={20} />
                  </Pressable>
                  <Text color="$gray5">Server</Text>
                </XStack>
              </Label>
              <Select value={server} onValueChange={setServer} disablePreventBodyScroll>
                <Select.Trigger
                  width={220}
                  iconAfter={<Feather name="chevron-down" />}
                  backgroundColor="black"
                  borderColor="#aaa"
                  borderWidth={1}
                  themeInverse={true}
                  color="#aaa"
                >
                  <Select.Value placeholder="Select an option" color="#aaa" />
                </Select.Trigger>

                <Adapt when="sm" platform="touch">
                  {SheetComponent}
                </Adapt>

                <SelectContent data={data} selectedServer={server} />
              </Select>
            </XStack>
          </YStack>

          {server === 'custom' && (
            <XStack alignItems="center" space="$2">
              <Feather name="link" size={20} color="white" />
              <Input
                flex={1}
                value={customServer}
                onChangeText={setCustomServer}
                placeholder="Enter custom server URL"
                placeholderTextColor="$gray8"
                borderWidth={1}
                borderColor="white"
                backgroundColor="black"
                color="white"
                focusStyle={{
                  borderColor: '$gray8',
                }}
              />
            </XStack>
          )}

          <XStack space="$3">
            <Button
              size="$5"
              theme="gray"
              themeInverse={true}
              color="white"
              fontWeight="bold"
              flexGrow={1}
              onPress={handleLogin}
            >
              Login
            </Button>

            {server && openRegistrations.includes(server) && (
              <Button
                size="$5"
                theme="gray"
                color="white"
                bg="$blue9"
                fontWeight="bold"
                flexGrow={1}
                onPress={handleRegister}
              >
                Sign Up
              </Button>
            )}
          </XStack>
        </YStack>
      </YStack>
    </SafeAreaView>
  )
}
