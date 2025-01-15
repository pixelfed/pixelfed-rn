import { ActivityIndicator, Alert, Pressable, Linking } from 'react-native'
import { Group, ScrollView, Separator, Text, View, XStack, YStack, Button } from 'tamagui'
import { Storage } from 'src/state/cache'
import { getAdminUser } from 'src/lib/api'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Stack, useLocalSearchParams, useRouter } from 'expo-router'
import { Feather } from '@expo/vector-icons'
import { prettyCount, _timeAgo, enforceLen, formatTimestamp } from 'src/utils'
import { useQuery } from '@tanstack/react-query'
import UserAvatar from 'src/components/common/UserAvatar'
import { PressableOpacity } from 'react-native-pressable-opacity'

export default function Screen() {
  const { id } = useLocalSearchParams()
  const router = useRouter()
  const instance = Storage.getString('app.instance')

  const gotoProfile = () => {
    const pid = account?.data.profile_id
    router.navigate('/profile/' + pid)
  }

  const gotoManage = () => {
    const pid = account?.data.id
    const url = `https://${instance}/i/admin/users/show/${pid}`
    Linking.openURL(url)
  }

  const RenderUserCard = () => (
    <View px="$5" py="$3" bg="white" borderRadius={10}>
      <XStack alignItems="center" gap="$3" justifyContent="space-between">
        <XStack alignItems="center" gap="$3">
          <UserAvatar url={account?.data.avatar} size="$3" />
          <YStack gap={5}>
            <XStack alignItems="center" gap="$2">
              <Text fontSize="$6" fontWeight={'bold'}>
                @{account?.data.username}
              </Text>
              {account?.data.is_private ? (
                <XStack gap="$1">
                  <Feather name="lock" color="red" />
                  <Text color="red">Private Account</Text>
                </XStack>
              ) : null}
            </XStack>
            <YStack>
              <Text color="$gray9">{account?.data.name}</Text>
            </YStack>
          </YStack>
        </XStack>
        <PressableOpacity onPress={() => gotoProfile()}>
          <Text color="$blue9" fontWeight={'bold'}>
            View
          </Text>
        </PressableOpacity>
      </XStack>
    </View>
  )

  const RenderListItem = ({ title, value }) => (
    <Group.Item>
      <XStack flexGrow={1} p="$3" justifyContent="space-between">
        <Text color="$gray10">{title}</Text>
        <Text fontWeight="bold">{value}</Text>
      </XStack>
    </Group.Item>
  )

  const RenderListItemCheck = ({ title, value, checked, onPressValue }) => (
    <Group.Item>
      <XStack flexGrow={1} p="$3" justifyContent="space-between" alignItems="center">
        <Text color="$gray10">{title}</Text>
        <Pressable onPress={() => Alert.alert(title, onPressValue)}>
          <XStack gap={5} alignItems="center">
            <Text fontWeight="bold">{value}</Text>
            <Feather name="check-circle" color="green" size={16} />
          </XStack>
        </Pressable>
      </XStack>
    </Group.Item>
  )

  const {
    data: account,
    status,
    error,
  } = useQuery({
    queryKey: ['getAdminUser', id],
    queryFn: async () => {
      return await getAdminUser(id)
    },
  })

  if (status === 'pending') {
    return <ActivityIndicator />
  }

  if (status === 'error') {
    return <Text>{error?.message}</Text>
  }

  return (
    <SafeAreaView edges={['bottom']}>
      <Stack.Screen
        options={{
          title: 'User',
          headerBackTitle: 'Back',
        }}
      />
      <ScrollView>
        <YStack p="$3" gap="$2">
          <RenderUserCard />

          <YStack bg="white" borderRadius={10} overflow="hidden">
            <Group
              orientation="horizontal"
              separator={<Separator borderColor="$gray2" vertical />}
            >
              <RenderListItem
                title="Posts"
                value={prettyCount(account?.data.statuses_count)}
              />
              <RenderListItem
                title="Followers"
                value={prettyCount(account?.data.followers_count)}
              />
              <RenderListItem
                title="Following"
                value={prettyCount(account?.data.following_count)}
              />
            </Group>
          </YStack>
          <YStack bg="white" borderRadius={10} overflow="hidden">
            <Group orientation="vertical" separator={<Separator borderColor="$gray2" />}>
              {account?.data.email_verified_at ? (
                <RenderListItemCheck
                  title="Email"
                  value={enforceLen(account?.data.email, 40, true)}
                  onPressValue={account?.data.email}
                />
              ) : (
                <RenderListItem
                  title="Email"
                  value={enforceLen(account?.data.email, 40, true)}
                />
              )}
              <Group
                orientation="horizontal"
                separator={<Separator borderColor="$gray2" vertical />}
              >
                <RenderListItem
                  title="Joined"
                  value={formatTimestamp(account?.data.created_at)}
                />
                {account?.data.last_active_at ? (
                  <RenderListItem
                    title="Active"
                    value={formatTimestamp(account?.data.last_active_at)}
                  />
                ) : null}
              </Group>

              {account?.meta.account.website ? (
                <RenderListItem
                  title="Website"
                  value={enforceLen(account?.meta.account.website, 25, true)}
                />
              ) : null}

              {account?.meta.account.note_text ? (
                <RenderListItem
                  title="Bio"
                  value={enforceLen(account?.meta.account.note_text, 25, true)}
                />
              ) : null}
            </Group>
          </YStack>
          <Button
            theme="red"
            bg="$red9"
            color="white"
            fontWeight="bold"
            onPress={() => gotoManage()}
          >
            Manage Account
          </Button>
        </YStack>
      </ScrollView>
    </SafeAreaView>
  )
}
