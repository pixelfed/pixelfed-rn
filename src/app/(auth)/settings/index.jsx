import { FlatList, Dimensions, ActivityIndicator, Alert } from 'react-native'
import {
  Group,
  Image,
  ScrollView,
  Separator,
  Text,
  View,
  XStack,
  YStack,
  Button,
} from 'tamagui'
import ProfileHeader from '@components/profile/ProfileHeader'
import { Storage } from 'src/state/cache'
import { queryApi } from 'src/requests'
import { useState, useEffect, useLayoutEffect } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Stack, useLocalSearchParams, Link, useNavigation } from 'expo-router'
import { Feather } from '@expo/vector-icons'
import { useAuth } from '@state/AuthProvider'
import { openBrowserAsync } from 'src/utils'
import * as Application from 'expo-application'

export default function Page() {
  const navigation = useNavigation()
  useLayoutEffect(() => {
    navigation.setOptions({ title: 'Settings' })
  }, [navigation])
  const [user, setUser] = useState()
  const instance = Storage.getString('app.instance')
  const buildVersion = 48
  const version = Application.nativeApplicationVersion + '.' + buildVersion

  useEffect(() => {
    const userJson = JSON.parse(Storage.getString('user.profile'))
    setUser(userJson)
  }, [])

  const cacheClear = () => {
    logout()
  }

  const { logout, isLoading } = useAuth()

  const onFeedback = async () => {
    openBrowserAsync('https://github.com/pixelfed/pixelfed-rn/discussions')
  }

  const GroupButton = ({ icon, title, path }) => (
    <Group.Item>
      <Link href={path} asChild>
        <Button bg="$gray1" justifyContent="start" size="$5" px="$3">
          <XStack flexGrow={1} justifyContent="space-between" alignItems="center">
            <XStack alignItems="center" ml="$1" gap="$3">
              <Feather name={icon} size={17} color="#666" />
              <Text fontSize="$6">{title}</Text>
            </XStack>
            <Feather name="chevron-right" size={20} color="#ccc" />
          </XStack>
        </Button>
      </Link>
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
            {user?.locked ? (
              <GroupButton
                icon="user-plus"
                title="Follow Requests"
                path="/profile/follow-requests/"
              />
            ) : null}
            {/* <GroupButton icon="archive" title="Archives" path="/settings/security" /> */}
            <GroupButton icon="grid" title="Collections" path="/collections/" />
            <GroupButton
              icon="tag"
              title="Followed Hashtags"
              path="/hashtag/followedTags"
            />
            {/* <GroupButton icon='shield' title='Security' path='/settings/security' /> */}
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
            {/* <GroupButton icon="camera" title="Media" path="/settings/media" /> */}
            {/* <GroupButton icon="shield" title="Security" path="/settings/security" /> */}
          </Group>

          <Group orientation="vertical" separator={<Separator borderColor="$gray2" />}>
            {/* <GroupButton
              icon="user-plus"
              title="Invite friends"
              path="/settings/invites/"
            /> */}
            <GroupButton icon="server" title={instance} path="/settings/instance/" />
            <GroupButton icon="align-left" title="Legal" path="/settings/legal/" />
            <Group.Item>
              <Button
                onPress={() => onFeedback()}
                bg="$gray1"
                justifyContent="start"
                size="$5"
                px="$3"
              >
                <XStack flexGrow={1} justifyContent="space-between" alignItems="center">
                  <XStack alignItems="center" ml="$1" gap="$3">
                    <Feather name="help-circle" size={17} color="#666" />
                    <Text fontSize="$6">Report an issue, or feedback</Text>
                  </XStack>
                  <Feather name="chevron-right" size={20} color="#ccc" />
                </XStack>
              </Button>
            </Group.Item>
          </Group>

          <Button bg="$gray1" justifyContent="start" size="$5" px="$3">
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
            <Text>Log out {'@' + user?.username}</Text>
          </Button>
        </YStack>
      </ScrollView>
    </SafeAreaView>
  )
}
