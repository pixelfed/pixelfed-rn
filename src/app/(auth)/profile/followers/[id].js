import { FlatList, Dimensions } from 'react-native'
import { Image, Text, View, YStack } from 'tamagui'
import ProfileHeader from '@components/profile/ProfileHeader'
import { Storage } from 'src/state/cache'
import { queryApi } from 'src/requests'
import { useState, useEffect } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Stack, useLocalSearchParams } from 'expo-router'

const SCREEN_WIDTH = Dimensions.get('screen').width

export default function FollowersScreen() {
  const [profile, setProfile] = useState()
  const [feed, setFeed] = useState()
  const { id } = useLocalSearchParams()

  useEffect(() => {
    const p = Storage.getString('user.profile')
    const token = Storage.getString('app.token')

    const fetchProfile = async () => {
      await queryApi(`api/v1/accounts/${id}/followers`, { _pe: true }).then((res) => {
        if (res && res.length) {
          setFeed(res)
          setProfile(res[0].account)
        }
      })
    }

    fetchProfile()
  }, [])

  const RenderItem = ({ item }) => <Text>@{item.username}</Text>

  return (
    <SafeAreaView edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />
      {profile && feed ? (
        <FlatList
          data={feed}
          ListHeaderComponent={<ProfileHeader profile={profile} />}
          renderItem={RenderItem}
          numColumns={2}
          showsVerticalScrollIndicator={false}
        />
      ) : null}
    </SafeAreaView>
  )
}
