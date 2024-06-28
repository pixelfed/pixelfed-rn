import { Link, router, Stack, useNavigation } from 'expo-router'
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
                headerShown: false
            }}
        />
        <StatusBar style="light" />

        <YStack w="100%" px="$5">
            <Text fontSize={30} my="$6" letterSpacing={-1} color="white">
                Pixelfed Sign in
            </Text>
            <Form gap="$5" onSubmit={handleLogin}>
            <YStack>
                <Label fontWeight={'bold'} color="$gray10">Server domain</Label>
                <Input
                size="$6"
                theme="dark"
                themeInverse={true}
                value={server}
                onChangeText={setServer}
                borderWidth={2}
                />
            </YStack>

            <Form.Trigger asChild>
                <Button theme="blue" size="$6" bg="$blue9" color="white" fontWeight="bold">
                Sign in
                </Button>
            </Form.Trigger>
            </Form>
        </YStack>
    </SafeAreaView>
  )
}
