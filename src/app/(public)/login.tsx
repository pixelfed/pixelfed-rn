import Feather from '@expo/vector-icons/Feather'
import { useAuth } from '@state/AuthProvider'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import * as WebBrowser from 'expo-web-browser'
import React from 'react'
import { useCallback, useMemo, useState } from 'react'
import { ActivityIndicator, Alert, Pressable } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import FastImage from 'react-native-fast-image'
import { Switch } from 'src/components/form/Switch'
import { getOpenServers } from 'src/lib/api'
import type { GetOpenServersServer } from 'src/lib/api-types'
import { Storage } from 'src/state/cache'
import { prettyCount } from 'src/utils'
import {
  Adapt,
  Button,
  Image,
  Input,
  Label,
  Select,
  Separator,
  Sheet,
  Text,
  View,
  XStack,
  YStack,
} from 'tamagui'

const SCOPE_DESCRIPTIONS = {
  read: 'Full read access to your account',
  write: 'Full write access to your account',
  follow: 'Ability to follow other profiles',
  push: 'Receive your push notifications',
  'admin:read': 'Read all data on the server',
  'admin:read:domain_blocks': 'Read sensitive information of all domain blocks',
  'admin:write': 'Modify all data on the server',
  'admin:write:domain_blocks': 'Perform moderation actions on domain blocks',
}

const ApiScopesSheet = ({
  isOpen,
  onClose,
  scopes,
  onToggleScope,
}: {
  isOpen: boolean
  onClose: () => void
  scopes: ApiScopes
  onToggleScope: (scope: keyof ApiScopes, enabled: boolean) => void
}) => {
  const renderScopeGroup = (
    title: string,
    scopeFilter: (scope: keyof ApiScopes) => boolean
  ) => (
    <YStack space="$3">
      <Text fontSize="$5" fontWeight="bold" color="$gray11">
        {title}
      </Text>
      {Object.entries(scopes)
        .filter(([scope]) => scopeFilter(scope as keyof ApiScopes))
        .map(([scope, enabled]) => (
          <XStack key={scope} justifyContent="space-between" alignItems="center" py="$2">
            <YStack flex={1} pr="$4" gap="$2">
              <Text fontSize="$5" color="$gray12" fontWeight={'bold'}>
                {scope}
              </Text>
              <Text fontSize="$3" color="$gray11">
                {SCOPE_DESCRIPTIONS[scope as keyof typeof SCOPE_DESCRIPTIONS]}
              </Text>
            </YStack>
            <Switch
              checked={enabled}
              onCheckedChange={(checked) =>
                onToggleScope(scope as keyof ApiScopes, checked)
              }
            >
              <Switch.Thumb animation="quicker" />
            </Switch>
          </XStack>
        ))}
    </YStack>
  )

  return (
    <Sheet open={isOpen} onOpenChange={onClose} snapPoints={[85]}>
      <Sheet.Frame backgroundColor="$gray1">
        <Sheet.Handle />
        <Sheet.ScrollView>
          <YStack px="$4" space="$6" mt="$4">
            <Text fontSize="$6" fontWeight="bold" color="$gray12">
              API Permissions
            </Text>

            {renderScopeGroup(
              'Account Permissions',
              (scope) => !scope.startsWith('admin:')
            )}

            {renderScopeGroup('Admin Permissions', (scope) => scope.startsWith('admin:'))}
          </YStack>
        </Sheet.ScrollView>
      </Sheet.Frame>
      <Sheet.Overlay />
    </Sheet>
  )
}

type ApiScopes = {
  read: boolean
  write: boolean
  follow: boolean
  push: boolean
  'admin:read': boolean
  'admin:read:domain_blocks': boolean
  'admin:write': boolean
  'admin:write:domain_blocks': boolean
}

export default function Login() {
  const [server, setServer] = useState('pixelfed.social')
  const [customServer, setCustomServer] = useState('')
  const [openRegistrations, setOpenServers] = useState<Array<String>>([])
  const [showApiSettings, setShowApiSettings] = useState(false)
  const [apiScopes, setApiScopes] = useState<ApiScopes>({
    read: true,
    write: true,
    follow: true,
    push: true,
    'admin:read': false,
    'admin:read:domain_blocks': false,
    'admin:write': false,
    'admin:write:domain_blocks': false,
  })
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
        let filtered: Array<GetOpenServersServer | { domain: string }> = res.slice(0, 20)
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
    // Include API scopes in login
    const enabledScopes = Object.entries(apiScopes)
      .filter(([_, enabled]) => enabled)
      .map(([scope]) => scope)
    if (!enabledScopes.includes('read')) {
      Alert.alert('Error', 'You need read access to use this app.')
      return
    }
    if (!enabledScopes.includes('write')) {
      Alert.alert('Error', 'You need write access to use this app.')
      return
    }
    login(server, enabledScopes.join(' '))
  }, [server, apiScopes, login])

  const handleRegister = useCallback(async () => {
    try {
      await WebBrowser.openAuthSessionAsync(
        `https://${server}/i/app-email-verify`,
        'pixelfed://verifyEmail'
      ).then((res) => {
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

  const handleDeepLink = (domain: string, url: string) => {
    const parsedUrl = new URL(url)
    const path = parsedUrl.pathname.substring(2)
    const searchParams = new URLSearchParams(parsedUrl.search)
    const params = {
      domain: domain,
      email: searchParams.get('email') ?? '',
      expires_in: Number.parseInt(searchParams.get('expires_in') ?? '0').toString(),
      status: searchParams.get('status') ?? '',
    }
    const q = new URLSearchParams(params)
    const finalPath = `/verifyEmail?${q.toString()}`
    router.push(finalPath as Parameters<typeof router.push>[0])
  }

  const clearStorage = () => {
    Storage.clearAll()
  }

  const toggleApiScope = useCallback((scope: keyof ApiScopes, enabled: boolean) => {
    setApiScopes((prev) => ({
      ...prev,
      [scope]: enabled,
    }))
  }, [])

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

      <Pressable
        onPress={() => setShowApiSettings(true)}
        style={{
          position: 'absolute',
          top: 60,
          right: 20,
          zIndex: 100,
        }}
      >
        <Feather name="settings" size={24} color="white" />
      </Pressable>

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
          {server !== 'pixelfed.social' && <ServerPreview data={data} server={server} />}
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

      <ApiScopesSheet
        isOpen={showApiSettings}
        onClose={() => setShowApiSettings(false)}
        scopes={apiScopes}
        onToggleScope={toggleApiScope}
      />
    </SafeAreaView>
  )
}

const ServerPreview = ({
  server,
  data,
}: { server: string; data?: Array<GetOpenServersServer | { domain: string }> }) => {
  const serverData = useMemo(() => {
    const thisServer = data?.find((s) => s.domain === server)

    if (!thisServer) {
      return {
        domain: server,
        header_thumbnail: null,
        short_description: 'No description available',
        user_count: 0,
      }
    }

    if (!Object.hasOwn(thisServer, 'user_count')) {
      return {
        ...thisServer,
        user_count: 0,
        header_thumbnail: null,
        short_description: 'No description available',
      }
    }

    const thisServerData = thisServer as GetOpenServersServer

    return {
      ...thisServerData,
      user_count: thisServerData.user_count ?? 0,
      header_thumbnail: thisServerData.header_thumbnail ?? null,
      short_description: thisServerData.short_description ?? 'No description available',
    }
  }, [data, server])

  return (
    <YStack p="$3" borderWidth={1} borderColor="#333" borderRadius={10}>
      {serverData.header_thumbnail && (
        <FastImage
          source={{
            uri: serverData.header_thumbnail,
            priority: FastImage.priority.normal,
          }}
          style={{ width: '100%', height: 120, borderRadius: 10 }}
          resizeMode={FastImage.resizeMode.cover}
        />
      )}
      <YStack mt="$3" gap="$2">
        <XStack justifyContent="space-between" alignItems="center">
          <Text color="$gray5" fontSize="$6" fontWeight="bold">
            {serverData.domain}
          </Text>
          <Text color="$gray5" fontSize="$4" fontWeight="bold">
            {prettyCount(serverData.user_count ?? 0)} Users
          </Text>
        </XStack>
        <Text color="$gray6" fontSize="$4" numberOfLines={2}>
          {serverData.short_description}
        </Text>
      </YStack>
    </YStack>
  )
}

const SelectContent = ({
  data,
  selectedServer,
}: {
  data?: Array<GetOpenServersServer | { domain: string }>
  selectedServer: string
}) => (
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
)

const ServerItem = React.memo(
  ({
    item,
    index,
    selectedServer,
  }: {
    item:
      | GetOpenServersServer
      | {
          domain: string
        }
    selectedServer: string
    index: number
  }) => (
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
            {Object.hasOwn(item, 'mobile_registration') &&
              (item as GetOpenServersServer).mobile_registration &&
              item.domain != selectedServer && (
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
