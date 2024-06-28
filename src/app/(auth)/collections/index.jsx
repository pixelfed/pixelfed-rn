import { Link, Stack } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { ScrollView, Text, View, XStack, YStack, Button } from 'tamagui'
import { useQuery, useInfiniteQuery } from '@tanstack/react-query'
import { getSelfCollections } from 'src/lib/api'
import { FlatList } from 'react-native'
import FastImage from 'react-native-fast-image'
import { formatTimestamp } from 'src/utils'
import Feather from '@expo/vector-icons/Feather'

export default function Screen() {
  const RenderItem = ({ item }) => (
    <YStack px="$5" mb="$5">
      <YStack pt="$5" pb="$3" borderTopLeftRadius={20} borderTopRightRadius={20} gap="$1">
        <Text fontWeight="bold" fontSize="$8">
          {item.title ? item.title : 'Untitled Collection'}
          {item.items && item.items.length > 6 ? ` (${item.items.length})` : null}
        </Text>
        <XStack justifyContent="space-between">
          <Text fontSize="$4" color="$gray10">
            {item.description ? item.description : 'No description'}
          </Text>
          <Text fontSize="$4" color="$gray9">
            {formatTimestamp(item.updated_at)}
          </Text>
        </XStack>
      </YStack>
      {item.post_count === 0 || !item.items.length ? (
        <YStack bg="white" p="$5" borderWidth={1} borderColor="$gray4" borderRadius={20}>
          <Text textAlign="center" fontWeight={'bold'}>
            Empty collection
          </Text>
        </YStack>
      ) : (
        <YStack borderWidth={1} borderColor="$gray4" borderRadius={20}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {item.items.map((post, idx) => {
              return (
                <Link key={post.id} href={`/post/${post.id}`} asChild>
                  <View>
                    <FastImage
                      source={{ uri: post.media_attachments[0].url }}
                      style={{
                        width: 100,
                        height: 100,
                        borderRadius: 10,
                        marginRight: 10,
                      }}
                      resizeMode={FastImage.resizeMode.cover}
                    />
                  </View>
                </Link>
              )
            })}
          </ScrollView>
        </YStack>
      )}
    </YStack>
  )

  const Separator = () => <View h={10} />

  const RenderEmpty = () => (
    <View flexGrow={1} justifyContent="center" alignItems="center" py="$5">
      <YStack flexShrink={1} justifyContent="center" alignItems="center" gap="$5">
        <Feather name="inbox" size={70} />
        <Text fontSize="$7" allowFontScaling={false}>
          No collections found
        </Text>
      </YStack>
    </View>
  )

  const { data: collections } = useQuery({
    queryKey: ['getSelfCollections'],
    queryFn: getSelfCollections,
  })

  return (
    <SafeAreaView flex={1} edges={['bottom']}>
      <Stack.Screen
        options={{
          title: 'My Collections',
          headerBackTitle: 'Back',
        }}
      />

      <FlatList
        data={collections}
        renderItem={RenderItem}
        ItemSeparatorComponent={Separator}
        ListEmptyComponent={RenderEmpty}
        contentContainerStyle={{ flexGrow: 1 }}
      />
    </SafeAreaView>
  )
}
