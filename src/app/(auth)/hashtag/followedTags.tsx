import { Link, Stack } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { getFollowedTags } from 'src/lib/api'
import { Text, View, YStack } from 'tamagui'
import { useQuery } from '@tanstack/react-query'
import { FlatList, ActivityIndicator } from 'react-native'
import Feather from '@expo/vector-icons/Feather'

export default function Screen() {
  const RenderItem = ({ item }) => (
    <Link href={`/hashtag/${item.name}`} asChild>
      <View p="$5" bg="white">
        <Text fontSize="$6">#{item.name}</Text>
      </View>
    </Link>
  )

  const Separator = () => <View h={1} borderBottomWidth={0.1} borderColor="$gray3" />

  const RenderEmpty = () => (
    <View flexGrow={1} justifyContent="center" alignItems="center" py="$5">
      <YStack flexShrink={1} justifyContent="center" alignItems="center" gap="$5">
        <Feather name="alert-circle" size={70} />
        <Text fontSize="$7" allowFontScaling={false}>
          You are not following any hashtags
        </Text>
      </YStack>
    </View>
  )

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
    <SafeAreaView edges={['bottom']}>
      <Stack.Screen
        options={{
          title: 'Followed Hashtags',
          headerBackTitle: 'Back',
        }}
      />

      <FlatList
        data={feed}
        renderItem={RenderItem}
        ItemSeparatorComponent={Separator}
        ListEmptyComponent={RenderEmpty}
        contentContainerStyle={{ flexGrow: 1 }}
      />
    </SafeAreaView>
  )
}
