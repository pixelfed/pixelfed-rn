import { Feather } from '@expo/vector-icons'
import { useQuery } from '@tanstack/react-query'
import { Link, Stack } from 'expo-router'
import { ActivityIndicator, FlatList } from 'react-native'
import FastImage from 'react-native-fast-image'
import { SafeAreaView } from 'react-native-safe-area-context'
import { getMutes } from 'src/lib/api'
import { Separator, Text, View, XStack, YStack } from 'tamagui'

export default function Page() {
  const RenderItem = ({ item }) => (
    <Link href={`/profile/${item.id}`} asChild>
      <XStack px="$5" py="$3" bg="white" alignItems="center" gap="$3" flexWrap="wrap">
        <FastImage
          source={{ uri: item?.avatar }}
          style={{
            width: 40,
            height: 40,
            borderRadius: 40,
            borderWidth: 1,
            borderColor: '#ccc',
          }}
        />
        <Text fontWeight={'bold'} flexShrink={1} maxWidth={'80%'}>
          {item.acct}
        </Text>
      </XStack>
    </Link>
  )

  const RenderSeparator = () => <Separator />

  const RenderEmpty = () => (
    <View flexGrow={1} justifyContent="center" alignItems="center" py="$5">
      <YStack flexShrink={1} justifyContent="center" alignItems="center" gap="$5">
        <Feather name="alert-circle" size={70} />
        <Text fontSize="$7" allowFontScaling={false}>
          No results found
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
    queryKey: ['mutedAccounts'],
    queryFn: getMutes,
  })

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['bottom']}>
      <Stack.Screen
        options={{
          title: 'Muted Accounts',
          headerBackTitle: 'Back',
        }}
      />
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
