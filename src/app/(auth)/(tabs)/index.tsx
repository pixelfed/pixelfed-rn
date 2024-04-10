import { useEffect, useState } from 'react'
import { FlatList, SafeAreaView } from 'react-native'
import { queryApi } from 'src/requests'
import { Text, View } from 'tamagui'
import FeedPost from '@components/post/FeedPost'

const RenderPost = ({ item }) => <FeedPost post={item} />
const keyExtractor = (_, index) => `post-${_.id}-${index}`

export default function HomeScreen() {
  const [feed, setFeed] = useState()

  useEffect(() => {
    const fetchFeed = async () => {
      await queryApi('api/v1/timelines/home', { _pe: true }).then((res) => {
        const filtered = res.filter((p) => p.pf_type === 'photo')
        setFeed(filtered)
      })
    }
    fetchFeed()
  }, [])

  return (
    <SafeAreaView alignItems="center">
      <Text fontSize={20}>Home</Text>

      <FlatList data={feed} keyExtractor={keyExtractor} renderItem={RenderPost} />
    </SafeAreaView>
  )
}
