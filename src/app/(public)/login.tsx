import { Link, router, useNavigation } from 'expo-router'
import {
  Text,
  View,
  Form,
  Button,
  YStack,
  Label,
  Input,
  Separator,
  XStack,
} from 'tamagui'
import { useAuth } from '@state/AuthProvider'
import { ActivityIndicator, SafeAreaView } from 'react-native'
import { useEffect, useState } from 'react'
import { StatusBar } from 'expo-status-bar'

export default function Login() {
  const [server, setServer] = useState('pixelfed.social')
  const [loading, setLoading] = useState(true)

  const { login, isLoading } = useAuth()

  const handleLogin = () => {
    login(server)
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  return (
    <SafeAreaView style={{ flex: 1, justifyContent: 'flex-start', alignItems: 'center' }}>
      <StatusBar style="dark" />
      {isLoading || loading ? (
        <View m="$5">
          <ActivityIndicator />
        </View>
      ) : (
        <>
          <Text fontSize={30} mt="$6" letterSpacing={-1}>
            Pixelfed Sign in
          </Text>
          <Form alignSelf="stretch" mx="$5" gap="$5" onSubmit={handleLogin}>
            <YStack>
              <Label fontWeight={'bold'}>Server</Label>
              <Input
                size="$6"
                value={server}
                onChangeText={setServer}
                bg="white"
                borderWidth={2}
              />
            </YStack>

            <Form.Trigger asChild>
              <Button theme="blue" size="$6" bg="$blue9" color="white" fontWeight="bold">
                Sign in
              </Button>
            </Form.Trigger>
          </Form>
          <YStack m="$5" flexDirection="row">
            <Separator borderColor="$gray8" borderWidth={0.3} />
          </YStack>
          <YStack mx="$5" flexGrow={1} flexDirection="row">
            <Link href="/selectServer" asChild>
              <Button
                size="$6"
                theme="blue"
                bg="$blue4"
                borderColor="$blue6"
                color="$blue9"
                flexGrow={1}
              >
                Select Server
              </Button>
            </Link>
          </YStack>
        </>
      )}
    </SafeAreaView>
  )
}
