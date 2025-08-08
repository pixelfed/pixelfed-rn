import { Stack } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import {
  GroupButtonContent,
  type GroupButtonContentProps,
} from 'src/components/common/GroupButtonContent'
import { Storage } from 'src/state/cache'
import { Button, Group, ScrollView, Separator, useTheme, YStack } from 'tamagui'
import { openBrowserAsync } from '../../../../utils'

export default function Screen() {
  const instance = Storage.getString('app.instance')
  const theme = useTheme()

  const openLink = async (path: string) => {
    await openBrowserAsync(`https://${instance}/${path}`)
  }

  const GroupButton = ({
    icon,
    title,
    path,
  }: Pick<GroupButtonContentProps, 'icon' | 'title'> & { path: string }) => (
    <Group.Item>
      <Button
        onPress={() => openLink(path)}
        bg={theme.background?.val.secondary.val}
        justifyContent="flex-start"
        size="$5"
        px="$3"
      >
        <GroupButtonContent icon={icon} title={title} iconColor="#666" />
      </Button>
    </Group.Item>
  )

  return (
    <SafeAreaView edges={['bottom']}>
      <Stack.Screen
        options={{
          title: 'Legal',
          headerBackTitle: 'Back',
        }}
      />

      <ScrollView flexShrink={1}>
        <YStack p="$5" gap="$5">
          <Group
            orientation="vertical"
            separator={<Separator borderColor={theme.borderColor?.val.default.val} />}
          >
            <GroupButton icon="align-left" title="Privacy Policy" path="e/privacy" />
            <GroupButton icon="align-left" title="Terms of Service" path="e/terms" />
          </Group>
        </YStack>
      </ScrollView>
    </SafeAreaView>
  )
}
