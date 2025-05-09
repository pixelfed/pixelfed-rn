import { useAuth } from '@state/AuthProvider'
import { Link, useRouter } from 'expo-router'
import { ActivityIndicator, Pressable } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Storage } from 'src/state/cache'
import { Button, Image, Text, View, XStack, YStack, useTheme } from 'tamagui'

export default function Login() {
  const { isLoading } = useAuth()
  const router = useRouter()
  const theme = useTheme()

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

  const toggleTheme = () => {
    const curTheme = Storage.getString('ui.theme') || 'light'
    const themeMap = {
      light: 'dark',
      dark: 'slateDark',
      slateDark: 'hotPink',
      hotPink: 'light',
      honey: 'honey',
    }
    Storage.set('ui.theme', themeMap[curTheme])
  }

  if (isLoading) {
    return (
      <SafeAreaView
        style={{
          backgroundColor: theme.background.val.default.val,
          flexGrow: 1,
          justifyContent: 'center',
          alignItems: 'center',
        }}
        edges={['top']}
      >
        <View m="$5">
          <ActivityIndicator color={theme.color?.val.default.val} />
        </View>
      </SafeAreaView>
    )
  }

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
      <YStack flexGrow={1} w="100%" px="$5">
        <View flexGrow={1} justifyContent="center" alignItems="center">
          <Pressable onPress={() => toggleTheme()} onLongPress={() => clearStorage()}>
            <Image
              source={require('../../../assets/icon.png')}
              width={140}
              height={140}
              borderRadius={140}
            />
          </Pressable>
          <Text
            color={theme.color.val.default.val}
            fontSize="$10"
            mt={10}
            fontWeight="bold"
          >
            Pixelfed
          </Text>
        </View>

        <YStack space="$4" mb="$5">
          <XStack space="$3" mb="$5">
            <Link href="handleLogin" asChild>
              <Button
                size="$5"
                theme="blue"
                themeInverse={true}
                color="white"
                bg={theme.colorHover.val.hover.val}
                fontWeight="bold"
                flexGrow={1}
              >
                Login
              </Button>
            </Link>

            <Link href="handleSignup" asChild>
              <Button
                size="$5"
                theme="gray"
                bg="white"
                color="black"
                px="$7"
                fontWeight="bold"
              >
                Sign Up
              </Button>
            </Link>
          </XStack>
        </YStack>
      </YStack>
    </SafeAreaView>
  )
}
