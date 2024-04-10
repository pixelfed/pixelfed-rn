import { FlatList, SafeAreaView, Dimensions } from 'react-native'
import { Image, Text, View, YStack } from 'tamagui'
import ProfileHeader from '@components/profile/ProfileHeader'
import { Storage } from 'src/state/cache'
import { getJSON } from 'src/requests'
import { useState, useEffect } from 'react'

const SCREEN_WIDTH = Dimensions.get('screen').width

export default function ProfileScreen() {
  const [profile, setProfile] = useState()
  const [feed, setFeed] = useState()

  useEffect(() => {
    const p = Storage.getString('user.profile')
    const token = Storage.getString('app.token')

    const fetchProfile = async () => {
      await getJSON('https://pixelfed.social/api/v1/accounts/2/statuses', token).then(
        (res) => {
          setFeed(res)
        }
      )
    }

    fetchProfile()
    setProfile(JSON.parse(p))
  }, [])

  const RenderItem = ({ item }) => (
    <View flexShrink={1} style={{ borderWidth: 1, borderColor: 'white' }}>
      <Image
        source={{
          uri: item.media_attachments[0].url,
          width: SCREEN_WIDTH / 2 - 2,
          height: 300,
        }}
        resizeMode="cover"
      />
    </View>
  )

  return (
    <SafeAreaView flex={1} alignItems="center">
      <FlatList
        data={feed}
        ListHeaderComponent={<ProfileHeader profile={profile} />}
        renderItem={RenderItem}
        numColumns={2}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  )
}
