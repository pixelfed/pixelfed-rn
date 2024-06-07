import { Link, Stack } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { getFollowedTags } from 'src/lib/api'
import { Image, ScrollView, Text, View, XStack, YStack, Button } from 'tamagui'
import { useQuery, useInfiniteQuery } from '@tanstack/react-query'
import { FlatList, Dimensions, ActivityIndicator } from 'react-native'

export default function Screen() {
  const RenderItem = ({ item }) => (
    <Link href={`/hashtag/${item.name}`} asChild>
      <View p="$5" bg="white">
        <Text fontSize="$6">#{item.name}</Text>
      </View>
    </Link>
  )

  const Separator = () => <View h={1} borderBottomWidth={0.1} borderColor="$gray3" />
  const {
    data: feed,
    isPending,
    error,
  } = useQuery({
    queryKey: ['getFollowedTags'],
    queryFn: getFollowedTags,
  })

  if (isPending) {
    return (
      <>
        <Stack.Screen
          options={{
            title: 'Loading',
            headerBackTitle: 'Back',
          }}
        />
        <View flexGrow={1} mt="$5">
          <ActivityIndicator color={'#000'} />
        </View>
      </>
    )
  }

  if (error) {
    return (
      <View flexGrow={1}>
        <Text>Error</Text>
      </View>
    )
  }

  return (
    <SafeAreaView flex={1} edges={['bottom']}>
      <Stack.Screen
        options={{
          title: 'Followed Hashtags',
          headerBackTitle: 'Back',
        }}
      />

      <FlatList data={feed} renderItem={RenderItem} ItemSeparatorComponent={Separator} />
    </SafeAreaView>
  )
}
