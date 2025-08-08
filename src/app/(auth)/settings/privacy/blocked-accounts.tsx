import { Feather } from '@expo/vector-icons'
import { useQuery } from '@tanstack/react-query'
import { Stack } from 'expo-router'
import { ActivityIndicator, Alert, FlatList, Pressable } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import ImageComponent from 'src/components/ImageComponent'
import { getBlocks, unblockProfileById } from 'src/lib/api'
import { Separator, Text, useTheme, View, XStack, YStack } from 'tamagui'

export default function Page() {
  const theme = useTheme()

  const {
    isPending,
    isError,
    data,
    error,
    refetch: refetchBlocks,
  } = useQuery({
    queryKey: ['blockedAccounts'],
    queryFn: getBlocks,
  })

  const confirmUnblock = (item: any) => {
    Alert.alert('Unblock User', `Do you really want to unblock ${item.acct}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Unblock',
        style: 'destructive',
        onPress: async () => {
          try {
            await unblockProfileById(item.id)
            await refetchBlocks({ throwOnError: true })
          } catch (error) {
            console.log('unblocking failed', { user_id: item.id, error })
            Alert.alert(`Failed to unblock: ${error?.message}`)
          }
        },
      },
    ])
  }

  const RenderItem = ({ item }) => (
    <Pressable onPress={() => confirmUnblock(item)}>
      {({ hovered, pressed }) => (
        <XStack
          bg={hovered || pressed ? theme.background?.val.secondary.val : undefined}
          px="$5"
          alignItems="center"
          justifyContent="flex-start"
          gap="$3"
          py="$2.5"
          size="$6"
          flexWrap="wrap"
        >
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
          <Text
            fontWeight={'bold'}
            flexShrink={1}
            maxWidth={'80%'}
            color={theme.color.val.default.val}
          >
            {item.acct}
          </Text>
        </XStack>
      )}
    </Pressable>
  )

  const RenderSeparator = () => (
    <Separator borderColor={theme.borderColor?.val.default.val} />
  )

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
