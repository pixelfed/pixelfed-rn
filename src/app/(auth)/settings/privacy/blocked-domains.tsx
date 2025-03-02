import { Feather } from '@expo/vector-icons'
import { useQuery } from '@tanstack/react-query'
import { Stack } from 'expo-router'
import { ActivityIndicator, FlatList } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { getDomainBlocks } from 'src/lib/api'
import { Separator, Text, View, XStack, YStack } from 'tamagui'

export default function Page() {
  const RenderItem = ({ item }) => {
    return (
      <XStack p="$5" bg="white" alignItems="center" gap="$3" flexWrap="wrap">
        <Text fontSize="$7" fontWeight={'bold'} flexWrap="wrap">
          {item}
        </Text>
      </XStack>
    )
  }

  const RenderSeparator = () => <Separator />

  const RenderEmpty = () => (
    <View flexGrow={1} justifyContent="center" alignItems="center" py="$5">
      <YStack flexShrink={1} justifyContent="center" alignItems="center" gap="$5">
        <Feather name="alert-circle" size={70} />
        <Text fontSize="$7" allowFontScaling={false}>
          You are not blocking any domains
        </Text>
      </YStack>
    </View>
  )

  const RenderLoading = () => (
    <View flexGrow={1} justifyContent="center" alignItems="center" py="$5">
      <YStack flexShrink={1} justifyContent="center" alignItems="center">
        <ActivityIndicator size="large" />
      </YStack>
    </View>
  )

  const { isPending, isError, data, error } = useQuery({
    queryKey: ['blockedDomains'],
    queryFn: getDomainBlocks,
  })

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['bottom']}>
      <Stack.Screen
        options={{
          title: 'Blocked Domains',
          headerBackTitle: 'Back',
        }}
      />
      <View p="$5">
        <Text>
          To add or delete blocked domains, navigate to Privacy Settings from a web
          browser.
        </Text>
      </View>
      <FlatList
        data={data}
        renderItem={RenderItem}
        ItemSeparatorComponent={RenderSeparator}
        ListEmptyComponent={isPending ? RenderLoading : RenderEmpty}
        contentContainerStyle={{ flexGrow: 1 }}
      />
    </SafeAreaView>
  )
}
