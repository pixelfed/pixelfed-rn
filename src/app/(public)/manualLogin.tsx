import { useAuth } from '@state/AuthProvider'
import {
  Link,
  Stack,
  router,
  useLocalSearchParams,
  useNavigation,
  useRouter,
} from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useEffect, useState } from 'react'
import { ActivityIndicator, SafeAreaView } from 'react-native'
import {
  Button,
  Form,
  Input,
  Label,
  Separator,
  Text,
  View,
  XStack,
  YStack,
} from 'tamagui'

export default function Login() {
  const params = useLocalSearchParams()
  const [server, setServer] = useState('')
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const { login, isLoading } = useAuth()

  const handleLogin = () => {
    login(server, params.enabledScopes)
  }

  return (
    <SafeAreaView
      style={{
        backgroundColor: 'black',
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'center',
      }}
    >
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <YStack w="100%" px="$5">
        <Text fontSize={30} my="$6" letterSpacing={-1} color="white">
          Pixelfed Sign in
        </Text>
        <Form gap="$5" onSubmit={handleLogin}>
          <YStack>
            <Label fontWeight={'bold'} color="$gray10">
              Server domain
            </Label>
            <Input
              size="$6"
              theme="dark"
              themeInverse={true}
              value={server}
              placeholder="pixelfed.social"
              onChangeText={setServer}
              autoCapitalize="none"
              borderWidth={2}
              autoFocus={true}
            />
          </YStack>

          <Form.Trigger asChild>
            <Button theme="blue" size="$6" bg="$blue9" color="white" fontWeight="bold">
              Sign in
            </Button>
          </Form.Trigger>
        </Form>
        <Button
          mt="$5"
          theme="dark"
          themeInverse={true}
          size="$3"
          onPress={() => router.back()}
        >
          Go back
        </Button>
      </YStack>
    </SafeAreaView>
  )
}
