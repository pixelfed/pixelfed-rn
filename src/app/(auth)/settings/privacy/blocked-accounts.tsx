import { Feather } from '@expo/vector-icons'
import { useQuery } from '@tanstack/react-query'
import { Stack } from 'expo-router'
import { ActivityIndicator, FlatList } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import ImageComponent from 'src/components/ImageComponent'
import { getBlocks } from 'src/lib/api'
import { Separator, Text, View, XStack, YStack, useTheme } from 'tamagui'

export default function Page() {
  const theme = useTheme();

  const RenderItem = ({ item }) => (
    <XStack px="$5" py="$3" bg={theme.background.val.secondary.val} alignItems="center" gap="$3" flexWrap="wrap">
      <ImageComponent
        source={{ uri: item?.avatar }}
        style={{
          width: 40,
          height: 40,
          borderRadius: 40,
          borderWidth: 1,
          borderColor: '#ccc',
        }}
      />
      <Text fontWeight={'bold'} flexShrink={1} maxWidth={'80%'} color={theme.color.val.default.val} >
        {item.acct}
      </Text>
    </XStack>
  )

  const RenderSeparator = () => <Separator borderColor={theme.borderColor?.val.default.val} />

  const RenderEmpty = () => (
    <View flexGrow={1} justifyContent="center" alignItems="center" py="$5">
      <YStack flexShrink={1} justifyContent="center" alignItems="center" gap="$5">
        <Feather name="alert-circle" size={70} color={theme.color?.val.tertiary.val} />
        <Text fontSize="$7" allowFontScaling={false} color={theme.color?.val.default.val}>
          You are not blocking any accounts
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
    queryKey: ['blockedAccounts'],
    queryFn: getBlocks,
  })

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['bottom']}>
      <Stack.Screen
        options={{
          title: 'Blocked Accounts',
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
