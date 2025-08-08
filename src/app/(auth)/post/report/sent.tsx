import { Feather } from '@expo/vector-icons'
import { Stack, useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Button, Separator, Text, useTheme, YStack } from 'tamagui'

export default function Page() {
  const router = useRouter()
  const theme = useTheme()

  return (
    <SafeAreaView style={{ backgroundColor: theme.background?.val.default.val }}>
      <Stack.Screen
        options={{
          title: 'Report Sent',
          headerBackTitle: 'Back',
        }}
      />
      <YStack flexGrow={1} justifyContent="center" alignItems="center" px="$6" gap="$9">
        <Text fontSize="$9" fontWeight="bold" color={theme.color?.val.default.val}>
          Reported Post
        </Text>
        <Feather name="check-circle" color="#10b981" size={100} />
        <Text fontSize="$8" color={theme.color?.val.default.val} textAlign="center">
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
        <Text fontSize="$6" color={theme.color?.val.secondary.val} textAlign="left">
          All reports are subject to review by our mod team.
        </Text>
        <Text fontSize="$4" color={theme.color?.val.secondary.val} textAlign="left">
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
          bg={theme.colorHover.val.active.val}
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
