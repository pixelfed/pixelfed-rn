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
import { useState, useEffect } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Stack, useLocalSearchParams } from 'expo-router'
import { Feather } from '@expo/vector-icons'
import { useAuth } from '@state/AuthProvider'

export default function Page() {
  const [user, setUser] = useState()

  useEffect(() => {
    const userJson = JSON.parse(Storage.getString('user.profile'))
    setUser(userJson)
  }, [])

  const cacheClear = () => {
    logout()
  }

  const { logout, isLoading } = useAuth()

  const GroupButton = ({ icon, title, path }) => (
    <Group.Item>
      <Button bg="$gray1" justifyContent="start" size="$5">
        <XStack flexGrow={1} justifyContent="space-between" alignItems="center">
          <XStack alignItems="center" gap="$3">
            <Feather name={icon} size={17} />
            <Text fontSize="$6">{title}</Text>
          </XStack>
          <Feather name="chevron-right" size={20} color="#ccc" />
        </XStack>
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
      <ScrollView flexShrink={1}>
        <View p="$5">
          <Group orientation="vertical" separator={<Separator borderColor="$gray2" />}>
            <Group.Item>
              <Button bg="$gray1" justifyContent="start" size="$5">
                <XStack alignItems="center" gap="$3">
                  <Feather name="user" size={20} />
                  <Text fontSize="$6">My Profile</Text>
                </XStack>
              </Button>
            </Group.Item>
            <GroupButton icon="aperture" title="Avatar" path="/settings/avatar" />
            <GroupButton icon="edit-3" title="Account" path="/settings/security" />
            {/* <GroupButton 
                        icon='shield'
                        title='Security'
                        path='/settings/security'
                    /> */}
            <GroupButton icon="lock" title="Privacy" path="/settings/security" />
          </Group>

          <Button bg="$red4" mt="$5" onPress={() => handleLogOut()}>
            <Text>Log out {'@' + user?.username}</Text>
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
