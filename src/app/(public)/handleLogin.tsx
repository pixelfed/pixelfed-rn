import Feather from '@expo/vector-icons/Feather'
import { useAuth } from '@state/AuthProvider'
import { useQuery } from '@tanstack/react-query'
import { useLocalSearchParams, useRouter } from 'expo-router'
import * as WebBrowser from 'expo-web-browser'
import React, { useState, useEffect, useRef } from 'react'
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  Pressable,
  ScrollView as RNScrollView,
  TouchableWithoutFeedback,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { getOpenServers } from 'src/lib/api'
import { Button, Input, Text, View, XStack, YStack, useTheme } from 'tamagui'

export default function LoginScreen() {
  const params = useLocalSearchParams<{ server: string }>()

  const [server, setServer] = useState(params.server || 'pixelfed.social')
  const [loading, setLoading] = useState(false)
  const [searchValue, setSearchValue] = useState('')
  const [isValidDomain, setIsValidDomain] = useState(false)
  const [selectedOption, setSelectedOption] = useState(0)
  const scrollViewRef = useRef(null)
  const inputRef = useRef(null)
  const { login } = useAuth()
  const router = useRouter()
  const theme = useTheme()

  const navigateBack = () => {
    router.back()
  }

  useEffect(() => {
    if (params.server) {
      setServer(params.server)
      setSelectedOption(1)
    }
  }, [params.server])

  const { data: serversData, isLoading: loadingServers } = useQuery({
    queryKey: ['openServers'],
    queryFn: async () => {
      try {
        const res = await getOpenServers()
        return res
      } catch (error) {
        console.error('Error fetching servers:', error)
        return []
      }
    },
  })

  const filteredServers = React.useMemo(() => {
    if (!serversData || !searchValue) return []

    const query = searchValue.toLowerCase()
    return serversData
      .filter((s) => s.domain.toLowerCase().includes(query))
      .slice(0, 3)
      .map((s) => s.domain)
  }, [serversData, searchValue])

  const validateDomain = (domain) => {
    // Regular expression to validate domain format
    // This checks for a valid domain structure with at least one dot and valid characters
    const domainRegex = /^([a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/
    return domainRegex.test(domain)
  }

  const handleSearchInputChange = (text) => {
    setSearchValue(text)

    // Validate if the entered text is a valid domain
    const valid = validateDomain(text)
    setIsValidDomain(valid)

    // If it's a valid domain, update the server state
    if (valid) {
      setServer(text)
    }
  }

  const handleOptionSelect = (option) => {
    setSelectedOption(option)
    if (option === 0) {
      setServer('pixelfed.social')
      setSearchValue('')
      setIsValidDomain(false)
    } else {
      setServer('')
      setIsValidDomain(false)
      setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
    }
  }

  const handleSuggestionSelect = (suggestion) => {
    setServer(suggestion)
    setSearchValue(suggestion)
    setIsValidDomain(true)
    Keyboard.dismiss()
    login(suggestion, 'read write follow push')
  }

  const handleLogin = async () => {
    if (!server) {
      Alert.alert('Error', 'Please enter a server domain')
      return
    }

    setLoading(true)
    try {
      login(server, 'read write follow push')
    } catch (error) {
      Alert.alert('Login Failed', 'An error occurred during authentication')
    } finally {
      setLoading(false)
    }
  }

  const navigateToSignup = () => {
    router.push('/handleSignup')
  }

  const handleFindInstance = async () => {
    await WebBrowser.openAuthSessionAsync(
      'https://recovery.pixelfed.org/forgot-instance',
      'pixelfed://login'
    ).then((res) => {
      if (res.type === 'success' && res.url) {
        setSelectedOption(1)
        const parsedUrl = new URL(res.url)
        const searchParams = new URLSearchParams(parsedUrl.search)
        const curDomain = searchParams.get('domain')
        setServer(curDomain)
        setSearchValue(curDomain)
        setIsValidDomain(validateDomain(curDomain))
        login(curDomain, 'read write follow push')
      } else {
        // todo: handle error
      }
    })
  }

  const showHelpInfo = () => {
    Alert.alert(
      'About Pixelfed',
      "Pixelfed is a free and open-source photo sharing platform, similar to Instagram but decentralized.\n\nServers (or 'instances') are independently operated communities that connect to the larger Fediverse network. Each server has its own rules, moderators, and focus, but users can interact across servers.\n\npixelfed.social is the main instance, but you can join any Pixelfed server or even self-host your own.",
      [
        { text: 'Close', style: 'cancel' },
        {
          text: 'More Info',
          onPress: () => WebBrowser.openBrowserAsync('https://pixelfed.org'),
        },
      ]
    )
  }

  if (loadingServers) {
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
          contentContainerStyle={{
            flexGrow: 1,
          }}
          keyboardShouldPersistTaps="handled"
          onScroll={() => Keyboard.dismiss()}
        >
          <YStack px="$4" pt="$4" pb="$6" space="$4" flexGrow={1} minHeight="100%">
            <XStack justifyContent="space-between" alignItems="center">
              <Pressable onPress={navigateBack}>
                <Feather
                  name="arrow-left"
                  size={24}
                  color={theme.color?.val.default.val}
                />
              </Pressable>
              <YStack alignItems="center" space="$6">
                <Text fontSize={28} fontWeight="500" color={theme.color?.val.default.val}>
                  Log in
                </Text>
              </YStack>
              <Pressable onPress={showHelpInfo}>
                <Feather
                  name={'help-circle'}
                  size={24}
                  color={theme.color?.val.default.val}
                />
              </Pressable>
            </XStack>

            <YStack mt="$6" space="$4">
              <Pressable
                onPress={() => handleOptionSelect(0)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  padding: 16,
                  borderWidth: 1,
                  borderColor:
                    selectedOption === 0 ? '#3F8FF7' : theme.borderColor?.val.default.val,
                  borderRadius: 8,
                  backgroundColor: theme.background?.val.secondary.val,
                }}
              >
                <View
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 12,
                    borderWidth: 2,
                    borderColor: selectedOption === 0 ? '#3F8FF7' : '#666',
                    marginRight: 12,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  {selectedOption === 0 && (
                    <View
                      style={{
                        width: 12,
                        height: 12,
                        borderRadius: 6,
                        backgroundColor: '#3F8FF7',
                      }}
                    />
                  )}
                </View>
                <Text color={theme.color?.val.default.val} fontSize="$6">
                  Log in to pixelfed.social
                </Text>
              </Pressable>

              <View
                style={{
                  borderWidth: 1,
                  borderColor:
                    selectedOption === 1 ? '#3F8FF7' : theme.borderColor?.val.default.val,
                  borderRadius: 8,
                  overflow: 'hidden',
                  backgroundColor: theme.background?.val.secondary.val,
                }}
              >
                <Pressable
                  onPress={() => handleOptionSelect(1)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    padding: 16,
                  }}
                >
                  <View
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 12,
                      borderWidth: 2,
                      borderColor: selectedOption === 1 ? '#3F8FF7' : '#666',
                      marginRight: 12,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    {selectedOption === 1 && (
                      <View
                        style={{
                          width: 12,
                          height: 12,
                          borderRadius: 6,
                          backgroundColor: '#3F8FF7',
                        }}
                      />
                    )}
                  </View>
                  <Text color={theme.color?.val.default.val} fontSize="$6">
                    Enter the name of your instance
                  </Text>
                </Pressable>

                {selectedOption === 1 && (
                  <View style={{ padding: 16, paddingTop: 0 }}>
                    <Input
                      ref={inputRef}
                      style={{
                        borderWidth: 1,
                        padding: 12,
                        marginTop: 12,
                      }}
                      borderColor={theme.borderColor?.val.default.val}
                      color={theme.color?.val.default.val}
                      backgroundColor={theme.background?.val.default.val}
                      size="$6"
                      placeholder="pixelfed.example.com"
                      placeholderTextColor="#666"
                      value={searchValue}
                      onChangeText={handleSearchInputChange}
                      autoCapitalize="none"
                      autoCorrect={false}
                    />

                    {/* Server Suggestions */}
                    {filteredServers.length > 0 && (
                      <View style={{ marginTop: 8 }}>
                        {filteredServers.map((suggestion) => (
                          <Pressable
                            key={suggestion}
                            onPress={() => handleSuggestionSelect(suggestion)}
                            style={{ paddingVertical: 12 }}
                          >
                            <Text
                              color={theme.colorHover?.val.active.val}
                              fontSize="$6"
                              fontWeight="bold"
                            >
                              {suggestion}
                            </Text>
                          </Pressable>
                        ))}
                      </View>
                    )}

                    {/* Valid domain but not in suggestions */}
                    {isValidDomain && searchValue && filteredServers.length === 0 && (
                      <View style={{ marginTop: 8 }}>
                        <Text color="white" fontSize="$6" style={{ paddingVertical: 12 }}>
                          Continue with{' '}
                          <Text color="#3F8FF7" fontWeight="bold">
                            {searchValue}
                          </Text>
                        </Text>
                      </View>
                    )}
                  </View>
                )}
              </View>
            </YStack>

            <XStack gap="$2">
              <Text fontSize="$6" color={theme.color?.val.secondary.val}>
                Forgot your instance?
              </Text>
              <Pressable onPress={handleFindInstance}>
                <Text
                  fontSize="$6"
                  color={theme.colorHover?.val.hover.val}
                  fontWeight="bold"
                >
                  Find it
                </Text>
              </Pressable>
            </XStack>

            <View style={{ flex: 1 }} />

            <YStack mt="$4" alignItems="center" gap="$3">
              <XStack gap="$2">
                <Text fontSize="$6" color={theme.color?.val.secondary.val}>
                  Don't have an account yet?
                </Text>
                <Pressable onPress={navigateToSignup}>
                  <Text
                    fontSize="$6"
                    color={theme.colorHover?.val.hover.val}
                    fontWeight="bold"
                  >
                    Sign up
                  </Text>
                </Pressable>
              </XStack>
            </YStack>

            <Button
              my="$2"
              backgroundColor={theme.colorHover?.val.hover.val}
              theme="blue"
              themeInverse={true}
              color="white"
              size="$5"
              fontSize={18}
              fontWeight="bold"
              borderRadius={8}
              height={50}
              onPress={handleLogin}
              disabled={
                loading ||
                !(selectedOption === 0 || (selectedOption === 1 && isValidDomain))
              }
              opacity={
                !(selectedOption === 0 || (selectedOption === 1 && isValidDomain))
                  ? 0.5
                  : 1
              }
            >
              {loading ? <ActivityIndicator color="white" /> : 'Continue'}
            </Button>
          </YStack>
        </RNScrollView>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  )
}
