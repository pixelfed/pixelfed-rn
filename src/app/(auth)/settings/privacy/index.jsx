import { Link, Stack } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { ScrollView, Text, View, Group, Button, XStack, YStack, Separator } from 'tamagui'
import { Feather } from '@expo/vector-icons'

export default function Page() {
  const GroupButton = ({ icon, title, path, iconColor = '#000' }) => (
    <Group.Item>
      <Link href={path} asChild>
        <Button bg="$gray1" justifyContent="start" size="$5" px="$0">
          <XStack flexGrow={1} justifyContent="space-between" alignItems="center">
            <XStack alignItems="center" gap="$3" pl="$5">
              <Feather name={icon} color={iconColor} size={17} />
              <Text fontSize="$6">{title}</Text>
            </XStack>
            <Feather name="chevron-right" size={20} color="#ccc" />
          </XStack>
        </Button>
      </Link>
    </Group.Item>
  )

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['bottom']}>
      <Stack.Screen
        options={{
          title: 'Privacy Settings',
          headerBackTitle: 'Back',
        }}
      />
      <ScrollView flexShrink={1}>
        <YStack p="$5" gap="$3">
          <Group orientation="vertical" separator={<Separator borderColor="$gray2" />}>
            <GroupButton
              icon="lock"
              title="Account Privacy"
              path="/settings/privacy/privacy-settings"
            />
          </Group>

          <Group orientation="vertical" separator={<Separator borderColor="$gray2" />}>
            <GroupButton
              icon="user-minus"
              title="Muted Accounts"
              path="/settings/privacy/muted-accounts"
            />
            <GroupButton
              icon="user-x"
              iconColor="red"
              title="Blocked Accounts"
              path="/settings/privacy/blocked-accounts"
            />
            <GroupButton
              icon="external-link"
              title="Blocked Domains"
              path="/settings/avatar"
            />
          </Group>
        </YStack>
      </ScrollView>
    </SafeAreaView>
  )
}
