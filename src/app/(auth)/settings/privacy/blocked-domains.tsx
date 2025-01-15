import { Stack } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Text, View, XStack, YStack, Separator } from 'tamagui'
import { Feather } from '@expo/vector-icons'
import { useQuery } from '@tanstack/react-query'
import { getDomainBlocks } from 'src/lib/api'
import { FlatList } from 'react-native'

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
        ListEmptyComponent={RenderEmpty}
        contentContainerStyle={{ flexGrow: 1 }}
      />
    </SafeAreaView>
  )
}
