import { View, Text, XStack, Image, YStack, Button, Separator } from 'tamagui'
import { Feather } from '@expo/vector-icons'
import { formatTimestampMonthYear, prettyCount } from '../../utils'
import { Link } from 'expo-router'
import { Pressable } from 'react-native'
import EditProfile from './actionButtons/EditProfile'
import FollowingProfile from './actionButtons/FollowingProfile'
import FollowProfile from './actionButtons/FollowProfile'
import BlockingProfile from './actionButtons/BlockingProfile'
import ReadMore from '../common/ReadMore'

export default function ProfileHeader({ profile, isSelf = false, relationship = false }) {
  const _prettyCount = (num) => {
    if (!num) {
      return 0
    }
    if (typeof num == 'string') {
      num = Number(num)
    }
    return num.toLocaleString('en-CA', { compactDisplay: 'short', notation: 'compact' })
  }

  const ActionButton = () => {
    if (isSelf) {
      return <EditProfile />
    }

    if (relationship && relationship.blocking) {
      return <BlockingProfile />
    }
    if (relationship && relationship.following) {
      return <FollowingProfile />
    }
    if (relationship && !relationship.following) {
      return <FollowProfile />
    }
  }

  return (
    <View flex={1} mx="$4" mt="$3">
      <XStack w="100%" justifyContent="space-between" alignItems="center">
        <Link href={{ screen: '', action: 'goBack' }} asChild>
          <Pressable>
            <XStack alignItems="center" gap="$5">
              <Feather name="chevron-left" size={26} />
            </XStack>
          </Pressable>
        </Link>

        <Text fontWeight="bold" fontSize={20}>
          {profile?.acct}
        </Text>

        <XStack alignItems="center" gap="$5">
          {isSelf ? (
            <Link href="/settings">
              <Feather name="menu" size={26} />
            </Link>
          ) : (
            <Feather name="more-horizontal" size={20} />
          )}
        </XStack>
      </XStack>

      <XStack w="100%" justifyContent="space-between" alignItems="center" mt="$3">
        <View style={{ borderRadius: 100, overflow: 'hidden' }}>
          <Image source={{ width: 90, height: 90, uri: profile?.avatar }} />
        </View>

        <XStack gap="$7" mx="$5">
          {/* <YStack alignItems="center" gap="$1">
            <Text fontWeight="bold" fontSize="$6">
              {_prettyCount(49182)}
            </Text>
            <Text fontSize="$3">Likes</Text>
          </YStack> */}

          <YStack alignItems="center" gap="$1">
            <Text fontWeight="bold" fontSize="$6">
              {prettyCount(profile ? profile.statuses_count : 0)}
            </Text>
            <Text fontSize="$3">Posts</Text>
          </YStack>

          <Link href={`/profile/following/${profile?.id}`}>
            <YStack alignItems="center" gap="$1">
              <Text fontWeight="bold" fontSize="$6">
                {prettyCount(profile ? profile.following_count : 0)}
              </Text>
              <Text fontSize="$3">Following</Text>
            </YStack>
          </Link>

          <Link href={`/profile/followers/${profile?.id}`}>
            <YStack alignItems="center" gap="$1">
              <Text fontWeight="bold" fontSize="$6">
                {prettyCount(profile ? profile.followers_count : 0)}
              </Text>
              <Text fontSize="$3">Followers</Text>
            </YStack>
          </Link>
        </XStack>
      </XStack>

      <YStack w="100%" mt="$3" gap={5}>
        <Text fontSize="$6" fontWeight={'bold'}>
          {profile?.display_name}
        </Text>
        {/* <Text fontSize="$6" fontWeight={'bold'} color="$gray9" letterSpacing={-0.4}>
          {profile?.local ? '@' + profile?.acct + '@pixelfed.social' : profile?.acct}
        </Text> */}
        {profile?.note_text && profile?.note_text.trim().length ? (
          <ReadMore numberOfLines={2} renderRevealedFooter={() => <></>}>
            <Text fontSize={14} fontWeight={400} letterSpacing={0.001}>
              {profile?.note_text &&
                profile?.note.replaceAll('&amp;', '&').replaceAll(/(<([^>]+)>)/gi, '')}
            </Text>
          </ReadMore>
        ) : null}

        {profile?.website && profile?.website.trim().length ? (
          <XStack alignItems="center" gap="$1">
            <Text fontSize="$5" fontWeight={'bold'} color="$blue9" letterSpacing={-0.34}>
              {profile?.website?.replaceAll('https://', '')}
            </Text>
          </XStack>
        ) : null}

        {profile?.local ? (
          <Text
            mt="$3"
            fontSize="$3"
            fontWeight={600}
            color="$gray10"
            letterSpacing={-0.4}
          >
            Joined {formatTimestampMonthYear(profile?.created_at)}
          </Text>
        ) : null}
      </YStack>

      <ActionButton />

      <YStack>
        <XStack mt="$1" mb="$3" justifyContent="space-around">
          <Feather name="grid" size={24} />
          {/* <Feather name="film" size={24} color="#ccc" /> */}
          <Feather name="list" size={24} color="#bbb" />
          {/* <Feather name="layers" size={24} color="#ccc" /> */}
          <Feather name="message-square" size={24} color="#bbb" />
          {/* <Feather name="tag" size={24} color="#ccc" /> */}
          {/* <Feather name="map" size={24} color="#ccc" /> */}
        </XStack>
      </YStack>
    </View>
  )
}
