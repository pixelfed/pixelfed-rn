import { Link, Stack } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { ScrollView, Group, YStack, Separator, Button } from 'tamagui'
import {
  GroupButtonContent,
  type GroupButtonContentProps,
} from 'src/components/common/GroupButtonContent'

export default function Page() {
  type GroupButtonProps = Pick<
    GroupButtonContentProps,
    'icon' | 'title' | 'iconColor'
  > & { path: string }

  const GroupButton = ({ icon, title, path, iconColor = '#000' }: GroupButtonProps) => (
    <Group.Item>
      <Link href={path} asChild>
        <Button bg="$gray1" justifyContent="flex-start" size="$5" px="$0">
          <GroupButtonContent
            icon={icon}
            title={title}
            iconColor={iconColor}
            spacing="privacy"
          />
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
              path="/settings/privacy/blocked-domains"
            />
          </Group>
        </YStack>
      </ScrollView>
    </SafeAreaView>
  )
}
