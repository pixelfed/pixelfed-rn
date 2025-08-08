import { Link, Stack } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import {
  GroupButtonContent,
  type GroupButtonContentProps,
} from 'src/components/common/GroupButtonContent'
import { Button, Group, ScrollView, Separator, useTheme, YStack } from 'tamagui'

export default function Page() {
  type GroupButtonProps = Pick<
    GroupButtonContentProps,
    'icon' | 'title' | 'iconColor'
  > & { path: string }
  const theme = useTheme()

  const GroupButton = ({ icon, title, path, iconColor = '#000' }: GroupButtonProps) => (
    <Group.Item>
      <Link href={path} asChild>
        <Button
          bg={theme.background?.val.default.val}
          justifyContent="flex-start"
          size="$5"
          px="$0"
        >
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
          <Group
            orientation="vertical"
            borderWidth={1}
            borderColor={theme.borderColor?.val.default.val}
            separator={<Separator borderColor={theme.borderColor?.val.default.val} />}
          >
            <GroupButton
              icon="lock"
              title="Account Privacy"
              path="/settings/privacy/privacy-settings"
            />
          </Group>

          <Group
            orientation="vertical"
            borderWidth={1}
            borderColor={theme.borderColor?.val.default.val}
            separator={<Separator borderColor={theme.borderColor?.val.default.val} />}
          >
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
