import Feather from '@expo/vector-icons/Feather'
import { useAuth } from '@state/AuthProvider'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'expo-router'
import * as WebBrowser from 'expo-web-browser'
import React, { useEffect, useRef, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  Animated,
  Keyboard,
  Pressable,
  ScrollView as RNScrollView,
  TouchableWithoutFeedback,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { getRegisterServers } from 'src/lib/api'
import type { OpenServer } from 'src/lib/api-types'
import { prettyCount } from 'src/utils'
import { Button, Image, ScrollView, Text, useTheme, View, XStack, YStack } from 'tamagui'

export default function SignupScreen() {
  const [server, setServer] = useState('pixelfed.social')
  const [loading, setLoading] = useState(false)
  const [showInfo, setShowInfo] = useState(false)
  const [_showServerInfo, _setShowServerInfo] = useState(false)
  const [_hasAttemptedSignup, setHasAttemptedSignup] = useState(false)
  const [signupEmail, setSignupEmail] = useState('')
  const infoHeight = useRef(new Animated.Value(0)).current
  const scrollViewRef = useRef(null)
  const { login } = useAuth()
  const router = useRouter()
  const theme = useTheme()

  // Animation for info section
  useEffect(() => {
    Animated.timing(infoHeight, {
      toValue: showInfo ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start()
  }, [showInfo])

  const { data: serversData, isLoading: loadingServers } = useQuery({
    queryKey: ['getRegisterServers'],
    queryFn: async () => {
      try {
        const res = await getRegisterServers()
        return res
      } catch (_error) {
        return [
          {
            domain: 'pixelfed.social',
            header_thumbnail: 'https://pixelfed.org/storage/servers/header.png',
            version: '0.12.4',
            short_description:
              'The original Pixelfed instance, operated by the main developer @dansup',
            rules: [],
            user_count: 420069,
            last_seen_at: getNowTimestamp(),
          },
        ]
      }
    },
  })

  const getNowTimestamp = () => {
    const now = new Date()
    const year = now.getUTCFullYear()
    const month = String(now.getUTCMonth() + 1).padStart(2, '0')
    const day = String(now.getUTCDate()).padStart(2, '0')
    const hours = String(now.getUTCHours()).padStart(2, '0')
    const minutes = String(now.getUTCMinutes()).padStart(2, '0')
    const seconds = String(now.getUTCSeconds()).padStart(2, '0')
    const milliseconds = String(now.getUTCMilliseconds()).padStart(3, '0') + '000'

    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${milliseconds}Z`
  }

  const filteredServers = React.useMemo(() => {
    if (!serversData)
      return [
        {
          domain: 'pixelfed.social',
          header_thumbnail: 'https://pixelfed.org/storage/servers/header.png',
          version: '0.12.4',
          short_description:
            'The original Pixelfed instance, operated by the main developer @dansup',
          rules: [],
          user_count: 420069,
          last_seen_at: getNowTimestamp(),
        },
      ]

    return [...serversData]
      .filter((s) => Object.hasOwn(s, 'user_count'))
      .sort((a, b) => (b as OpenServer).user_count - (a as OpenServer).user_count)
      .slice(0, 10)
  }, [serversData])

  const handleServerSelect = (serverDomain) => {
    setServer(serverDomain)
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true })
    }, 100)
  }

  const handleSignup = async () => {
    if (!server) {
      Alert.alert('Error', 'Please select a server')
      return
    }

    setLoading(true)
    try {
      setHasAttemptedSignup(true)

      const result = await WebBrowser.openAuthSessionAsync(
        `https://${server}/i/app-email-verify`,
        'pixelfed://verifyEmail'
      )

      if (result.type === 'success') {
        const urlParams = new URLSearchParams(new URL(result.url).search)
        const email = urlParams.get('email')
        if (email) {
          setSignupEmail(email)
        }

        handleDeepLink(server, result.url)
      } else {
      }
    } catch (_error) {
      Alert.alert('Signup Error', 'An error occurred during the signup process')
    } finally {
      setLoading(false)
    }
  }

  const handleDeepLink = (domain: string, url: string) => {
    const parsedUrl = new URL(url)
    const _path = parsedUrl.pathname.substring(2)
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

  const handleResendVerification = async () => {
    if (!server) {
      Alert.alert('Error', 'Please select a server first')
      return
    }

    setLoading(true)
    try {
      await WebBrowser.openAuthSessionAsync(
        `https://${server}/i/app-email-resend?email=${encodeURIComponent(signupEmail)}`,
        'pixelfed://verifyEmail'
      ).then((res) => {
        if (res.type === 'success') {
          Alert.alert('Success', 'Verification email has been resent')
        } else {
        }
      })
    } catch (_error) {
      Alert.alert('Error', 'Failed to resend verification email')
    } finally {
      setLoading(false)
    }
  }

  const navigateToVerificationCode = () => {
    if (!server) {
      Alert.alert('Error', 'Please select a server first')
      return
    }

    router.push({
      pathname: '/verificationCode',
      params: { server },
    } as Parameters<typeof router.push>[0])
  }

  const navigateToLogin = () => {
    router.push('/handleLogin')
  }

  const navigateBack = () => {
    router.back()
  }

  const toggleInfo = () => {
    setShowInfo(!showInfo)
  }

  if (loadingServers) {
    return (
      <SafeAreaView
        style={{
          backgroundColor: theme.background?.val.default.val,
          flexGrow: 1,
          justifyContent: 'center',
          alignItems: 'center',
        }}
        edges={['top']}
      >
        <ActivityIndicator color="white" size="large" />
      </SafeAreaView>
    )
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView
        style={{
          backgroundColor: theme.background?.val.default.val,
          flexGrow: 1,
        }}
        edges={['top']}
      >
        <RNScrollView
          ref={scrollViewRef}
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          onScroll={() => Keyboard.dismiss()}
        >
          <YStack px="$4" pt="$4" pb="$6" space="$4" flexGrow={1} minHeight="100%">
            <XStack justifyContent="space-between" alignItems="center">
              <Pressable 
                accessible={true}
                accessibilityLabel="Navigate back" 
                accessibilityRole="button"
                onPress={navigateBack}
              >
                <Feather
                  name="arrow-left"
                  size={24}
                  color={theme.color?.val.default.val}
                />
              </Pressable>
              <Text fontSize={28} fontWeight="500" color={theme.color?.val.default.val}>
                Sign Up
              </Text>
              <Pressable
                accessible={true}
                accessibilityLabel={showInfo ? "Hide help screen" : "Show help screen"} 
                accessibilityRole="button" 
                onPress={toggleInfo}
              >
                <Feather
                  name={showInfo ? 'x' : 'help-circle'}
                  size={24}
                  color={theme.color?.val.default.val}
                />
              </Pressable>
            </XStack>

            <Animated.View
              style={{
                overflow: 'hidden',
                maxHeight: infoHeight.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 200],
                }),
                opacity: infoHeight,
                marginBottom: infoHeight.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 16],
                }),
              }}
            >
              <View
                tabIndex={0}
                aria-live="polite"
                borderRadius="$4"
                p="$4"
                bg={theme.background?.val.secondary.val}
                borderColor={theme.borderColor?.val.default.val}
                borderWidth={1}
              >
                <Text
                  fontSize="$3"
                  color={theme.color?.val.default.val}
                  mb="$3"
                  allowFontScaling={false}
                >
                  Pixelfed is a decentralized photo sharing platform. To join, you'll need
                  to:
                </Text>
                <Text
                  fontSize="$3"
                  color={theme.color?.val.secondary.val}
                  mb="$2"
                  allowFontScaling={false}
                >
                  • Choose a server
                </Text>
                <Text
                  fontSize="$3"
                  color={theme.color?.val.secondary.val}
                  mb="$2"
                  allowFontScaling={false}
                >
                  • Provide your email address for a verification code
                </Text>
                <Text
                  fontSize="$3"
                  color={theme.color?.val.secondary.val}
                  mb="$2"
                  allowFontScaling={false}
                >
                  • Return to this app to finish signing up
                </Text>
                <Text
                  fontSize="$3"
                  color={theme.color?.val.secondary.val}
                  mt="$2"
                  allowFontScaling={false}
                >
                  Your account will work across all of Pixelfed, regardless of which
                  server you join
                </Text>
              </View>
            </Animated.View>

            <YStack space="$3">
              <Text fontSize="$5" fontWeight="bold" color={theme.color?.val.default.val}>
                Choose a Server to Join
              </Text>

              <View
                borderWidth={1}
                borderColor={theme.borderColor?.val.default.val}
                borderRadius={10}
                p="$3"
              >
                <YStack space="$3" maxHeight={200}>
                  <ScrollView>
                    {filteredServers.length > 0 ? (
                      filteredServers.map((item) => (
                        <Pressable
                          key={item.domain}
                          onPress={() => handleServerSelect(item.domain)}
                          accessibilityRole="menuitem"
                          accessibilityState={{ selected: server === item.domain }}
                          style={({ pressed }) => [
                            {
                              opacity: pressed ? 0.7 : 1,
                              backgroundColor:
                                server === item.domain
                                  ? theme.background?.val.tertiary.val
                                  : 'transparent',
                              borderRadius: 8,
                              padding: 12,
                              marginBottom: 8,
                            },
                          ]}
                        >
                          <XStack justifyContent="space-between" alignItems="center">
                            <Text
                              color={
                                server === item.domain
                                  ? theme.color?.val.default.val
                                  : theme.color?.val.tertiary.val
                              }
                              fontSize="$5"
                              fontWeight={server === item.domain ? 'bold' : 'normal'}
                            >
                              {item.domain}
                            </Text>
                            <Text fontSize="$3" color={theme.color?.val.tertiary.val}>
                              {prettyCount(item.user_count)} users
                            </Text>
                          </XStack>
                        </Pressable>
                      ))
                    ) : (
                      <Text
                        color={theme.color?.val.default.val}
                        textAlign="center"
                        py="$3"
                      >
                        No servers with open registration found
                      </Text>
                    )}
                  </ScrollView>
                </YStack>
              </View>
            </YStack>

            {server && (
              <Button
                accessibilityState = {{ disabled: loading }}
                backgroundColor={theme.colorHover?.val.hover.val}
                color="white"
                size="$5"
                fontWeight="bold"
                onPress={handleSignup}
                disabled={loading}
                icon={
                  !loading ? (
                    <Feather name="user-plus" size={18} color="white" />
                  ) : undefined
                }
              >
                {loading ? <ActivityIndicator color="white" /> : `Sign Up on ${server}`}
              </Button>
            )}

            {/* Verification Options */}

            <YStack space="$2" mt="$2" gap="$3">
              <XStack justifyContent="center" space="$2">
                <Pressable 
                  accessible={true}
                  accessibilityRole="button"
                  onPress={handleResendVerification}>
                  <Text
                    color={theme.colorHover?.val.active.val}
                    fontWeight="bold"
                    fontSize="$6"
                  >
                    Resend email verification
                  </Text>
                </Pressable>
              </XStack>

              <XStack justifyContent="center" space="$2">
                <Pressable 
                  accessible={true}
                  accessibilityRole="button"
                  onPress={navigateToVerificationCode}
                >
                  <Text
                    color={theme.colorHover?.val.active.val}
                    fontWeight="bold"
                    fontSize="$6"
                  >
                    I have a verification code
                  </Text>
                </Pressable>
              </XStack>
            </YStack>

            <View flexGrow={1} />

            <XStack justifyContent="center" space="$2" mt="$4">
              <Text color={theme.color?.val.tertiary.val}>Already have an account?</Text>
              <Pressable onPress={navigateToLogin}>
                <Text color={theme.colorHover?.val.active.val} fontWeight="bold">
                  Log In
                </Text>
              </Pressable>
            </XStack>

            <View alignItems="center" opacity={0.6}>
              <Image
                source={require('../../../assets/icon.png')}
                width={60}
                height={60}
                borderRadius={60}
              />
              <Text color={theme.color?.val.tertiary.val} mt="$2" textAlign="center">
                Ad-Free Photo Sharing. For Everyone.
              </Text>
            </View>
            <View h={20}></View>
          </YStack>
        </RNScrollView>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  )
}
