import Feather from '@expo/vector-icons/Feather'
import { useQuery } from '@tanstack/react-query'
import { Link, Stack } from 'expo-router'
import { ActivityIndicator, FlatList } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { getFollowedTags } from 'src/lib/api'
import { Text, useTheme, View, YStack } from 'tamagui'

export default function Screen() {
  const theme = useTheme()

  const RenderItem = ({ item }) => (
    <Link href={`/hashtag/${item.name}`} asChild>
      <View p="$5" bg={theme.background?.val.secondary.val}>
        <Text fontSize="$6" color={theme.color?.val.default.val}>
          #{item.name}
        </Text>
      </View>
    </Link>
  )

  const Separator = () => (
    <View
      h={1}
      borderBottomWidth={0.1}
      borderColor={theme.borderColor?.val.default.val}
    />
  )

  const RenderEmpty = () => (
    <View flexGrow={1} justifyContent="center" alignItems="center" py="$5">
      <YStack flexShrink={1} justifyContent="center" alignItems="center" gap="$5">
        <Feather name="alert-circle" size={70} color={theme.color?.val.tertiary.val} />
        <Text fontSize="$7" allowFontScaling={false} color={theme.color?.val.default.val}>
          No results found
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
          <ActivityIndicator color={theme.color?.val.default.val} />
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
