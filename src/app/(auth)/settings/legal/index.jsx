import {
  Group,
  ScrollView,
  Separator,
  Text,
  XStack,
  YStack,
  Button,
} from 'tamagui'
import { Storage } from 'src/state/cache'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Stack } from 'expo-router'
import { Feather } from '@expo/vector-icons'
import { openBrowserAsync } from '../../../../utils'

export default function Screen() {
  const instance = Storage.getString('app.instance')

  const openLink = async (path) => {
    await openBrowserAsync(`https://${instance}/${path}`)
  }

  const GroupButton = ({ icon, title, path }) => (
    <Group.Item>
      <Button
        onPress={() => openLink(path)}
        bg="$gray1"
        justifyContent="start"
        size="$5"
        px="$3"
      >
        <XStack flexGrow={1} justifyContent="space-between" alignItems="center">
          <XStack alignItems="center" ml="$1" gap="$3">
            <Feather name={icon} size={17} color="#666" />
            <Text fontSize="$6">{title}</Text>
          </XStack>
          <Feather name="chevron-right" size={20} color="#ccc" />
        </XStack>
      </Button>
    </Group.Item>
  )
  return (
    <SafeAreaView flex={1} edges={['bottom']}>
      <Stack.Screen
        options={{
          title: 'Legal',
          headerBackTitle: 'Back',
        }}
      />

      <ScrollView flexShrink={1}>
        <YStack p="$5" gap="$5">
          <Group orientation="vertical" separator={<Separator borderColor="$gray2" />}>
            <GroupButton icon="align-left" title="Privacy Policy" path="e/privacy" />
            <GroupButton icon="align-left" title="Terms of Service" path="e/terms" />
          </Group>
        </YStack>
      </ScrollView>
    </SafeAreaView>
  )
}
