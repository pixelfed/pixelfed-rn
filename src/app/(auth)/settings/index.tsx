import { useAuth, useUserCache } from '@state/AuthProvider'
import * as Application from 'expo-application'
import { Link, Stack, useNavigation } from 'expo-router'
import React, { useState, useEffect, useLayoutEffect } from 'react'
import { Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import {
  GroupButtonContent,
  type GroupButtonContentProps,
} from 'src/components/common/GroupButtonContent'
import { Storage } from 'src/state/cache'
import { openBrowserAsync } from 'src/utils'
import { Button, Group, ScrollView, Separator, Text, XStack, YStack } from 'tamagui'

export default function Page() {
  const navigation = useNavigation()
  useLayoutEffect(() => {
    navigation.setOptions({ title: 'Settings' })
  }, [navigation])
  const { username, locked } = useUserCache()
  const instance = Storage.getString('app.instance')
  const buildVersion = 78
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
  }: GroupButtonContentProps & { path: string }) => (
    <Group.Item>
      <Link href={path} asChild>
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
    Alert.alert('Confirm', 'Are you sure you want to log out of this account?', [
      {
        text: 'Cancel',
      },
      {
        text: 'Log out',
        style: 'destructive',
        onPress: () => cacheClear(),
      },
    ])
  }
  return (
    <SafeAreaView style={{ flex: 1 }} edges={['bottom']}>
      <Stack.Screen
        options={{
          title: 'Settings',
          headerBackTitle: 'Back',
        }}
      />
      <ScrollView flexShrink={1} showsVerticalScrollIndicator={false}>
        <YStack p="$5" gap="$5">
          <Group orientation="vertical" separator={<Separator borderColor="$gray2" />}>
            <GroupButton
              icon="user"
              title="Avatar, Bio and Display Name"
              path="/settings/profile"
            />
          </Group>

          <Group orientation="vertical" separator={<Separator borderColor="$gray2" />}>
            {locked ? (
              <GroupButton
                icon="user-plus"
                title="Follow Requests"
                path="/profile/follow-requests/"
              />
            ) : null}
            <GroupButton icon="grid" title="Collections" path="/collections/" />
            <GroupButton
              icon="tag"
              title="Followed Hashtags"
              path="/hashtag/followedTags"
            />
            <GroupButton
              icon="lock"
              title="Privacy & Relationships"
              path="/settings/privacy"
            />
          </Group>

          <Group orientation="vertical" separator={<Separator borderColor="$gray2" />}>
            <GroupButton
              icon="life-buoy"
              title="Accessibility"
              path="/settings/accessibility/"
            />
            <GroupButton icon="droplet" title="Appearance" path="/settings/appearance/" />
            <GroupButton
              icon="alert-triangle"
              title="Push Notifications"
              path="/settings/notifications/"
            />
          </Group>

          <Group orientation="vertical" separator={<Separator borderColor="$gray2" />}>
            <GroupButton
              icon="server"
              title={instance || ''}
              path="/settings/instance/"
            />
            <GroupButton icon="align-left" title="Legal" path="/settings/legal/" />
            <GroupUrlButton
              icon="trash"
              title="Delete Account"
              path="settings/remove/request/permanent"
            />
          </Group>

          <Button bg="$gray1" justifyContent="flex-start" size="$5" px="$3">
            <XStack flexGrow={1} justifyContent="space-between" alignItems="center">
              <XStack alignItems="center" ml="$1" gap="$3">
                <Text fontSize="$6">Version</Text>
              </XStack>
              <Text fontSize="$6" color="$gray9">
                {version}
              </Text>
            </XStack>
          </Button>

          <Button bg="$red4" mt="$2" onPress={() => handleLogOut()}>
            <Text>Log out {'@' + username}</Text>
          </Button>
        </YStack>
      </ScrollView>
    </SafeAreaView>
  )
}
