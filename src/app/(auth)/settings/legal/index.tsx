import { Group, ScrollView, Separator, YStack, Button } from 'tamagui'
import { Storage } from 'src/state/cache'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Stack } from 'expo-router'
import { openBrowserAsync } from '../../../../utils'
import {
  GroupButtonContent,
  type GroupButtonContentProps,
} from 'src/components/common/GroupButtonContent'
import React from 'react'

export default function Screen() {
  const instance = Storage.getString('app.instance')

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
        bg="$gray1"
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
          <Group orientation="vertical" separator={<Separator borderColor="$gray2" />}>
            <GroupButton icon="align-left" title="Privacy Policy" path="e/privacy" />
            <GroupButton icon="align-left" title="Terms of Service" path="e/terms" />
          </Group>
        </YStack>
      </ScrollView>
    </SafeAreaView>
  )
}
