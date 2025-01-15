import { Stack, useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Text, YStack, Button, Separator } from 'tamagui'
import { Feather } from '@expo/vector-icons'

export default function Page() {
  const router = useRouter()

  return (
    <SafeAreaView style={{ backgroundColor: 'white' }}>
      <Stack.Screen
        options={{
          title: 'Report Sent',
          headerBackTitle: 'Back',
        }}
      />
      <YStack flexGrow={1} justifyContent="center" alignItems="center" px="$6" gap="$9">
        <Text fontSize="$9" fontWeight="bold">
          Reported Post
        </Text>
        <Feather name="check-circle" color="#10b981" size={100} />
        <Text fontSize="$8" color="black" textAlign="center">
          Thanks for keeping our community safe!
        </Text>
      </YStack>
      <YStack
        flexShrink={1}
        justifyContent="center"
        alignItems="flex-start"
        p="$6"
        gap="$3"
      >
        <Text fontSize="$6" color="rgba(0,0,0,0.4)" textAlign="left">
          All reports are subject to review by our mod team.
        </Text>
        <Text fontSize="$4" color="rgba(0,0,0,0.25)" textAlign="left">
          Please be aware that making false reports could lead to the suspension of your
          account. If our mod team needs additional information, they may contact you.
        </Text>
      </YStack>
      <YStack flexShrink={1} justifyContent="center" alignItems="center" gap="$5">
        <Separator alignSelf="stretch" />
        <Button
          mx="$6"
          onPress={() => router.back()}
          alignSelf="stretch"
          bg="$blue9"
          color="white"
          fontWeight="bold"
          size="$5"
        >
          Go back
        </Button>
      </YStack>
    </SafeAreaView>
  )
}
