import { router, useNavigation } from 'expo-router'
import { Text, View, Form, Button, YStack, Label, Input } from 'tamagui'
import { useAuth } from '@state/AuthProvider'
import { ActivityIndicator, SafeAreaView } from 'react-native'
import { useState } from 'react'
import { StatusBar } from 'expo-status-bar'

export default function Login() {
  const navigation = useNavigation()
  const [server, setServer] = useState('pixelfed.social')

  const { login, isLoading } = useAuth()

  const handleLogin = () => {
    login(server)
  }

  return (
    <SafeAreaView style={{ flex: 1, justifyContent: 'flex-start', alignItems: 'center' }}>
      <Text fontSize={30} mt="$6" letterSpacing={-1}>
        Pixelfed Sign in
      </Text>
      {isLoading ? (
        <View m="$5">
          <ActivityIndicator />
        </View>
      ) : (
        <Form alignSelf="stretch" m="$5" gap="$5" onSubmit={handleLogin}>
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
      )}
    </SafeAreaView>
  )
}
