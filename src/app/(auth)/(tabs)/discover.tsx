import { ActivityIndicator, FlatList, SafeAreaView } from 'react-native'
import { Text, YStack, ZStack, Button, ScrollView, View, XStack, Image } from 'tamagui'
import { Storage } from 'src/state/cache'
import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  getTrendingHashtags,
  getTrendingPopularAccounts,
  getTrendingPopularPosts,
  getTrendingPostsV1,
} from 'src/lib/api'
import { Link } from 'expo-router'
import UserAvatar from 'src/components/common/UserAvatar'
import { enforceLen, prettyCount } from 'src/utils'
import FastImage from 'react-native-fast-image'

export default function DiscoverScreen() {
  const cacheClear = () => {
    Storage.clearAll()
  }

  const RenderTags = ({ item }) => (
    <Link href={`/hashtag/${item.hashtag}`} asChild>
      <View bg="$gray3" py="$2" px="$3" borderRadius={5} mr="$2">
        <Text fontWeight="bold">{item.name}</Text>
      </View>
    </Link>
  )

  const AccountPartial = ({item}) => (
    <Link href={`/profile/${item.id}`} asChild>
      <YStack
        px="$6"
        py="$2"
        borderWidth={1}
        borderColor="$gray5"
        borderRadius={10}
        justifyContent="center"
        alignItems="center"
        gap="$3"
        mr="$3"
      >
        <UserAvatar url={item.avatar} size="$3" />
        <YStack justifyContent="center" alignItems="center" gap="$2">
          <Text fontSize="$5" fontWeight="bold">
            {item.username}
          </Text>
          <Text fontSize="$2" color="$gray9">
            {prettyCount(item.followers_count)} Followers
          </Text>
        </YStack>
      </YStack>
    </Link>
  )
  const RenderAccounts = ({ item, index }) => (
    index == 0 ? 
    <>
      <View flex={1} flexDirection='row' gap="$3">
        <View bg="black" p="$5" borderRadius={10} justifyContent='center' alignContent='center'>
          <Text color="white" fontSize={14} allowFontScaling={false} fontFamily={'system'} fontWeight={'600'} letterSpacing={-0.5}>Popular</Text>
          <Text color="white" fontSize={14} allowFontScaling={false} fontFamily={'system'} fontWeight={'600'} letterSpacing={-0.5}>Accounts</Text>
        </View>
        <AccountPartial item={item} />
      </View> 
    </> : 
    <AccountPartial item={item} />
  )

  const RenderPosts = ({ item }) => (
    <Link href={`/post/${item.id}`} asChild>
      <YStack justifyContent="center" alignItems="center" gap="$2" mr="$3">
        <View borderRadius={10} overflow="hidden">
          <Image
            source={{
              uri: item.media_attachments[0].url,
              width: 160,
              height: 210,
            }}
            resizeMode="cover"
          />
          <Text position='absolute' zIndex={3} color="white" bottom={10} left={10} fontWeight={'bold'}>{ enforceLen(item.account.acct, 15, true, 'end') }</Text>
        </View>
      </YStack>
    </Link>
  )

  const {
    isPending,
    isError,
    data: hashtags,
    error,
  } = useQuery({
    queryKey: ['getTrendingHashtags'],
    queryFn: getTrendingHashtags,
  })

  const { data: accounts, isPending: isPopularAccountsPending } = useQuery({
    queryKey: ['getTrendingPopularAccounts'],
    queryFn: getTrendingPopularAccounts,
    enabled: !!hashtags,
  })

  const { data: posts, isPending: isPopularPostsPending } = useQuery({
    queryKey: ['getTrendingPopularPosts'],
    queryFn: getTrendingPopularPosts,
    enabled: !!accounts,
  })

  if (isPending || isPopularAccountsPending || isPopularPostsPending ) {
    return <View flexGrow={1} justifyContent='center' alignItems='center' py="$10"><ActivityIndicator /></View>
  }

  if (isError) {
    return (
      <View>
        <Text>Error: {error.message}</Text>
      </View>
    )
  }
  return (
    <SafeAreaView flex={1} edges={['left']} style={{ backgroundColor: '#fff' }}>
      <ScrollView>
        <YStack px="$5" py="$3">
          <Text fontSize="$10" fontWeight="bold" letterSpacing={-1.4}>
            Discover
          </Text>
          {/* <Button onPress={() => console.log(Storage.getString('app.token'))}>
            Token
          </Button>
          <Button onPress={() => console.log(Storage.clearAll())}>Purge All</Button> */}
        </YStack>
        <View ml="$5" mb="$0">
          <YStack pb="$4" gap="$3">
            {/* <XStack justifyContent="space-between" alignItems="center">
              <Text fontSize="$5" color="$gray9">
                Trending Hashtags
              </Text>
            </XStack> */}
            <FlatList
              data={hashtags}
              renderItem={RenderTags}
              showsHorizontalScrollIndicator={false}
              horizontal
            />
          </YStack>
        </View>

        <View ml="$5" mb="$0">
          <YStack pb="$4" gap="$3">
            {/* <XStack justifyContent="space-between" alignItems="center">
              <Text fontSize="$5" color="$gray9">
                Trending Accounts
              </Text>
            </XStack> */}
            <FlatList
              data={accounts}
              renderItem={RenderAccounts}
              showsHorizontalScrollIndicator={false}
              horizontal
            />
          </YStack>
        </View>

        <View ml="$5">
          <YStack pb="$4" gap="$3">
            {/* <XStack justifyContent="space-between" alignItems="center">
              <Text fontSize="$5" color="$gray9">
                Trending Posts
              </Text>
            </XStack> */}
            <FlatList
              data={posts}
              renderItem={RenderPosts}
              showsHorizontalScrollIndicator={false}
              horizontal
            />
          </YStack>
        </View>

        {/* <View mx="$5" mb="$4" bg="black" borderRadius={10}>
          <ZStack minHeight={190} gap="$3" justifyContent='flex-end'>
              <FastImage
                source={{uri: 'https://pxscdn.com/public/m/_v2/618207790902380453/3b17271c9-2ea36d/8QZjjoyk7NIS/Tq8gkA7XmrgObeoe87rKpSXa66bGHSIx83UeI28l.png'}}
                style={{width: '100%', height: 190, borderRadius: 10}}
              />
              <Text p="$3" color="white" fontWeight={'light'} fontSize="$9" letterSpacing={-1.15}>Photo of the week</Text>
          </ZStack>
        </View> */}

        {/* <XStack mx="$5" gap="$4" overflow='hidden'>
          <View flexShrink={1} bg="black" borderRadius={10}>
            <YStack minHeight={100} p="$4" gap="$1" justifyContent='flex-start'>
                <Text color="white" fontWeight={'light'} fontSize="$9" letterSpacing={-0.95}>Spotlight</Text>
                <Text fontSize="$7" flexWrap='wrap' color="$gray10">#cats, #catsOfPixelfed</Text>
            </YStack>
          </View>
          <View flexGrow={1} bg="black" borderRadius={10}>
            <YStack minHeight={100} p="$4" gap="$1" justifyContent='flex-start'>
                <Text color="white" fontWeight={'light'} fontSize="$9" letterSpacing={-0.95}>Top 100</Text>
                <Text fontSize="$7" flexWrap='wrap' color="$gray10">@dansup, @gargr...</Text>
            </YStack>
          </View>
        </XStack> */}
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
