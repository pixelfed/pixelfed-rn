import { router, useNavigation } from 'expo-router'
import { Text, View, Form, Button, YStack, Label, Input } from 'tamagui'

import { useSession } from '../state/ctx'
import { SafeAreaView } from 'react-native'
import { useState } from 'react'

export default function SignIn() {
  const { signIn } = useSession()
  const navigation = useNavigation()
  const [server, setServer] = useState('pixelfed.social')
  const [email, setEmail] = useState()
  const [password, setPassword] = useState()

  const handleLogin = () => {
    signIn(server, email, password)
  }

  return (
    <SafeAreaView style={{ flex: 1, justifyContent: 'flex-start', alignItems: 'center' }}>
      <Text fontSize={30}>Pixelfed Sign in</Text>
      <Form alignSelf="stretch" m="$5" gap="$5" onSubmit={handleLogin}>
        <YStack>
          <Label fontWeight={'bold'}>Server</Label>
          <Input
            size="$5"
            value={server}
            onChangeText={setServer}
            bg="white"
            borderWidth={2}
          />
        </YStack>

        <YStack>
          <Label fontWeight={'bold'}>Email</Label>
          <Input
            size="$5"
            value={email}
            bg="white"
            placeholder="Your account email address"
            onChangeText={setEmail}
            borderWidth={2}
          />
        </YStack>

        <YStack>
          <Label fontWeight={'bold'}>Password</Label>
          <Input
            size="$5"
            borderWidth={2}
            bg="white"
            value={password}
            placeholder="Your account password"
            onChangeText={setPassword}
            secureTextEntry={true}
          />
        </YStack>

        <Form.Trigger asChild>
          <Button theme="blue">Sign in</Button>
        </Form.Trigger>
      </Form>

      <Button chromeless onPress={() => navigation.goBack()}>
        Go back
      </Button>
    </SafeAreaView>
  )
}
