import { Alert } from 'react-native'
import { Group, ScrollView, Separator, Text, XStack, YStack, Button } from 'tamagui'
import { Storage } from 'src/state/cache'
import React, { useLayoutEffect } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Stack, Link, useNavigation, type LinkProps } from 'expo-router'
import { useAuth, useUserCache } from '@state/AuthProvider'
import { openBrowserAsync } from 'src/utils'
import * as Application from 'expo-application'
import {
  GroupButtonContent,
  type GroupButtonContentProps,
} from 'src/components/common/GroupButtonContent'
import { useI18n } from 'src/hooks/useI18n'
export default function Page() {
  const navigation = useNavigation()
  const { t } = useI18n()

  const { username, locked } = useUserCache()
  const instance = Storage.getString('app.instance')
  const buildVersion = 74
  const version = Application.nativeApplicationVersion + '.' + buildVersion

  const { logout } = useAuth()

  const cacheClear = () => {
    logout()
  }

  const onFeedback = async () => {
    openBrowserAsync('https://github.com/pixelfed/pixelfed-rn/discussions')
  }

  const openLink = async (path: string) => {
    openBrowserAsync('https://' + instance + '/' + path)
  }

  const GroupButton = ({
    icon,
    title,
    path,
  }: GroupButtonContentProps & {
    path: string
  }) => (
    <Group.Item>
      <Link href={path as LinkProps<String>['href']} asChild>
        <Button bg="$gray1" justifyContent="flex-start" size="$5" px="$3">
          <GroupButtonContent icon={icon} title={title} iconColor="#666" />
        </Button>
      </Link>
    </Group.Item>
  )

  const GroupUrlButton = ({
    icon,
    title,
    path,
  }: GroupButtonContentProps & { path: string }) => (
    <Group.Item>
      <Button
        bg="$gray1"
        justifyContent="flex-start"
        size="$5"
        px="$3"
        onPress={() => openLink(path)}
      >
        <GroupButtonContent icon={icon} title={title} iconColor="red" />
      </Button>
    </Group.Item>
  )

  const handleLogOut = () => {
    Alert.alert(
      t('settingsScreen.logoutModal.title'),
      t('settingsScreen.logoutModal.message'),
      [
        {
          text: t('settingsScreen.logoutModal.cancel'),
        },
        {
          text: t('settingsScreen.logoutModal.confirm'),
          style: 'destructive',
          onPress: () => cacheClear(),
        },
      ]
    )
  }

  useLayoutEffect(() => {
    navigation.setOptions({ title: t('settingsScreen.settings') })
  }, [navigation])

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['bottom']}>
      <Stack.Screen
        options={{
          title: t('settingsScreen.settings'),
          headerBackTitle: 'Back',
        }}
      />
      <ScrollView flexShrink={1} showsVerticalScrollIndicator={false}>
        <YStack p="$5" gap="$5">
          <Group orientation="vertical" separator={<Separator borderColor="$gray2" />}>
            <GroupButton
              icon="user"
              title={t('settingsScreen.avatarBioAndDisplayName')}
              path="/settings/profile"
            />
          </Group>

          <Group orientation="vertical" separator={<Separator borderColor="$gray2" />}>
            {locked ? (
              <GroupButton
                icon="user-plus"
                title={t('settingsScreen.followRequests')}
                path="/profile/follow-requests/"
              />
            ) : null}
            <GroupButton
              icon="grid"
              title={t('settingsScreen.collections')}
              path="/collections/"
            />
            <GroupButton
              icon="tag"
              title={t('settingsScreen.followedHashtags')}
              path="/hashtag/followedTags"
            />
            <GroupButton
              icon="lock"
              title={t('settingsScreen.privacyAndRelationships')}
              path="/settings/privacy"
            />
          </Group>

          <Group orientation="vertical" separator={<Separator borderColor="$gray2" />}>
            <GroupButton
              icon="life-buoy"
              title={t('settingsScreen.accessibility')}
              path="/settings/accessibility/"
            />
            <GroupButton
              icon="droplet"
              title={t('settingsScreen.appearance')}
              path="/settings/appearance/"
            />
            <GroupButton
              icon="alert-triangle"
              title={t('settingsScreen.pushNotifications')}
              path="/settings/notifications/"
            />
          </Group>

          <Group orientation="vertical" separator={<Separator borderColor="$gray2" />}>
            <GroupButton
              icon="server"
              title={instance || ''}
              path="/settings/instance/"
            />
            <GroupButton
              icon="align-left"
              title={t('settingsScreen.legal')}
              path="/settings/legal/"
            />
            <GroupUrlButton
              icon="trash"
              title={t('settingsScreen.deleteAccount')}
              path="settings/remove/request/permanent"
            />
          </Group>

          <Group orientation="vertical" separator={<Separator borderColor="$gray2" />}>
            <GroupButton
              icon="globe"
              title={t('settingsScreen.language')}
              path="/settings/language/"
            />
          </Group>

          <Button bg="$gray1" justifyContent="flex-start" size="$5" px="$3">
            <XStack flexGrow={1} justifyContent="space-between" alignItems="center">
              <XStack alignItems="center" ml="$1" gap="$3">
                <Text fontSize="$6">{t('settingsScreen.version')}</Text>
              </XStack>
              <Text fontSize="$6" color="$gray9">
                {version}
              </Text>
            </XStack>
          </Button>

          <Button bg="$red4" mt="$2" onPress={() => handleLogOut()}>
            <Text>{t('settingsScreen.logoutUsername', { username })}</Text>
          </Button>
        </YStack>
      </ScrollView>
    </SafeAreaView>
  )
}
