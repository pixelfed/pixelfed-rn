import { View, Text, XStack, Image, YStack, Button, Separator } from 'tamagui'
import { Feather } from '@expo/vector-icons'
import { formatTimestampMonthYear } from '../../utils'

export default function ProfileHeader({ profile }) {
  const _prettyCount = (num) => {
    if (!num) {
      return 0
    }
    if (typeof num == 'string') {
      num = Number(num)
    }
    return num.toLocaleString('en-CA', { compactDisplay: 'short', notation: 'compact' })
  }

  return (
    <View flex={1} mx="$4">
      <XStack w="100%" justifyContent="space-between" alignItems="center">
        <XStack alignItems="center" gap="$5">
          <Feather name="chevron-left" size={26} />
          <Feather name="share" size={20} opacity={0} />
        </XStack>

        <Text fontWeight="bold" fontSize={20}>
          {profile?.username}
        </Text>

        <XStack alignItems="center" gap="$5">
          <Feather name="bell" size={26} />
          <Feather name="more-horizontal" size={26} />
        </XStack>
      </XStack>

      <XStack w="100%" justifyContent="space-between" alignItems="center" mt="$3">
        <View style={{ borderRadius: 100, overflow: 'hidden' }}>
          <Image source={{ width: 90, height: 90, uri: profile?.avatar }} />
        </View>

        <XStack gap="$7" mx="$5">
          <YStack alignItems="center" gap="$1">
            <Text fontWeight="bold" fontSize="$7">
              {_prettyCount(profile?.statuses_count)}
            </Text>
            <Text fontSize="$5">Posts</Text>
          </YStack>

          <YStack alignItems="center" gap="$1">
            <Text fontWeight="bold" fontSize="$7">
              {_prettyCount(profile?.following_count)}
            </Text>
            <Text fontSize="$5">Following</Text>
          </YStack>

          <YStack alignItems="center" gap="$1">
            <Text fontWeight="bold" fontSize="$7">
              {_prettyCount(profile?.followers_count)}
            </Text>
            <Text fontSize="$5">Followers</Text>
          </YStack>
        </XStack>
      </XStack>

      <YStack w="100%" mt="$3" gap={5}>
        <Text fontSize="$6" fontWeight={'bold'}>
          {profile?.display_name}
        </Text>
        <Text fontSize="$6" fontWeight={600} color="$gray10" letterSpacing={-0.4}>
          {profile?.acct}@pixelfed.social
        </Text>
        <Text fontSize={17} fontWeight={400} letterSpacing={-0.2}>
          {profile?.note_text.replaceAll('\n', '')}
        </Text>

        <XStack alignItems="center" gap="$1">
          <Text fontSize="$6" fontWeight={'bold'} color="$blue9" letterSpacing={-0.34}>
            {profile?.website.replaceAll('https://', '')}
          </Text>
        </XStack>

        <Text fontSize="$4" fontWeight={600} color="$gray10" letterSpacing={-0.4}>
          Joined {formatTimestampMonthYear(profile?.created_at)}
        </Text>
      </YStack>

      <XStack w="100%" my="$3" gap="$2">
        <Button
          theme="light"
          bg="$gray7"
          size="$4"
          color="black"
          fontWeight="bold"
          fontSize="$6"
          flexGrow={1}
        >
          Edit profile
        </Button>

        {/* <Button 
                    theme="light" 
                    bg="$blue9"
                    size="$4"
                    color="white"
                    fontWeight="bold"
                    fontSize="$6"
                    flexGrow={1}
                    >
                    Follow
                </Button>

                <Button 
                    theme="light" 
                    bg="transparent"
                    size="$4"
                    borderWidth={1}
                    borderColor="$blue7"
                    color="$blue9"
                    fontWeight="bold"
                    fontSize="$6"
                    >
                    Message
                </Button> */}
      </XStack>

      <YStack>
        <XStack my="$3" justifyContent="space-around">
          <Feather name="grid" size={24} />
          <Feather name="film" size={24} color="#ccc" />
          <Feather name="user" size={24} color="#ccc" />
          {/* <Feather name="layers" size={24} color="#ccc"  /> */}
          {/* <Feather name="message-circle" size={24} /> */}
        </XStack>
      </YStack>
    </View>
  )
}
