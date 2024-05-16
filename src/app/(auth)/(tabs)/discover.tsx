import { ActivityIndicator, FlatList, SafeAreaView } from 'react-native'
import { Text, YStack, Button, ScrollView, View, XStack, Image } from 'tamagui'
import { Storage } from 'src/state/cache'
import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getTrendingHashtags, getTrendingPopularAccounts, getTrendingPopularPosts } from 'src/lib/api'
import { Link } from 'expo-router'
import UserAvatar from 'src/components/common/UserAvatar'
import { prettyCount } from 'src/utils'

export default function DiscoverScreen() {
  const cacheClear = () => {
    Storage.clearAll()
  }

  const RenderTags = ({item}) => (
    <Link href={`/hashtag/${item.hashtag}`} asChild>
      <View bg="$gray3" py="$2" px="$3" borderRadius={5} mr="$2">
        <Text fontWeight="bold">{item.name}</Text>
      </View>
    </Link>
  )

  const RenderAccounts = ({item}) => (
    <Link href={`/profile/${item.id}`} asChild>
      <YStack 
        px="$6" 
        py="$8" 
        borderWidth={1} 
        borderColor="$gray5" 
        borderRadius={10} 
        justifyContent='center'
        alignItems='center'
        gap="$3"
        mr="$3">
        <UserAvatar url={item.avatar} width={70} height={70} />
        <YStack justifyContent='center' alignItems='center' gap="$2">
          <Text fontSize="$5" fontWeight="bold">{item.username}</Text>
          <Text fontSize="$2" color="$gray9">{ prettyCount(item.followers_count) } Followers</Text>
        </YStack>
      </YStack>
    </Link>
  )

  const RenderPosts = ({item}) => (
    <Link href={`/post/${item.id}`} asChild>
      <YStack 
        justifyContent='center' 
        alignItems='center' 
        gap="$2"
        mr="$3">
        <View borderRadius={10} overflow='hidden'>
          <Image
              source={{
                uri: item.media_attachments[0].url,
                width: 140,
                height: 210,
              }}
              resizeMode="cover"
            />
        </View>
        <Text fontSize="$3" color="$gray9">@{item.account.username}</Text>
      </YStack>
    </Link>
  )

  const { 
    isPending, 
    isError, 
    data: hashtags, 
    error 
  } = useQuery({
    queryKey: ['getTrendingHashtags'],
    queryFn: getTrendingHashtags,
  })

  const { 
    data: accounts, 
  } = useQuery({
    queryKey: ['getTrendingPopularAccounts'],
    queryFn: getTrendingPopularAccounts,
    enabled: !!hashtags
  })

  const { 
    data: posts, 
  } = useQuery({
    queryKey: ['getTrendingPopularPosts'],
    queryFn: getTrendingPopularPosts,
    enabled: !!accounts
  })
  if (isPending) {
    return <ActivityIndicator />
  }

  if (isError) {
    return <View><Text>Error: {error.message}</Text></View>
  }
  return (
    <SafeAreaView flex={1} style={{backgroundColor: "#fff"}}>
      <ScrollView>
        <YStack px="$5" py="$3">
          <Text fontSize="$10" fontWeight="bold">Discover</Text>
        </YStack>
        <View ml="$5" mb="$3">
          <YStack py="$4" gap="$3">
            <XStack justifyContent='space-between' alignItems='center'>
              <Text fontSize="$5" color="$gray9">Trending Hashtags</Text>
            </XStack>
            <FlatList
              data={hashtags}
              renderItem={RenderTags}
              showsHorizontalScrollIndicator={false}
              horizontal
              />
          </YStack>
        </View>

        <View ml="$5" mb="$3">
          <YStack py="$4" gap="$3">
            <XStack justifyContent='space-between' alignItems='center'>
              <Text fontSize="$5" color="$gray9">Trending Accounts</Text>
            </XStack>
            <FlatList
              data={accounts}
              renderItem={RenderAccounts}
              showsHorizontalScrollIndicator={false}
              horizontal
              />
          </YStack>
        </View>

        <View ml="$5">
          <YStack py="$4" gap="$3">
            <XStack justifyContent='space-between' alignItems='center'>
              <Text fontSize="$5" color="$gray9">Trending Posts</Text>
            </XStack>
            <FlatList
              data={posts}
              renderItem={RenderPosts}
              showsHorizontalScrollIndicator={false}
              horizontal
              />
          </YStack>
        </View>
        {/* <YStack flexGrow={1} alignSelf="stretch" m="$5" gap="$3">
          <Button
            theme="light"
            size="$6"
            bg="$red8"
            color="white"
            fontWeight="bold"
            onPress={() => cacheClear()}
          >
            Cache Clear
          </Button>
        </YStack> */}
      </ScrollView>
    </SafeAreaView>
  )
}
