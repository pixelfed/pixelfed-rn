import { View, Text, XStack, Image, YStack, Button, Separator, Avatar } from 'tamagui'
import { Feather } from '@expo/vector-icons'
import { enforceLen, formatTimestampMonthYear, prettyCount } from '../../utils'
import { Link } from 'expo-router'
import { Pressable } from 'react-native'
import EditProfile from './actionButtons/EditProfile'
import FollowingProfile from './actionButtons/FollowingProfile'
import FollowProfile from './actionButtons/FollowProfile'
import BlockingProfile from './actionButtons/BlockingProfile'
import FollowRequested from './actionButtons/FollowRequested'
import ReadMore from '../common/ReadMore'
import { useState } from 'react'

export default function ProfileHeader({
  profile,
  isSelf = false,
  relationship = false,
  openMenu,
  onFollow,
  onUnfollow,
  onCancelFollowRequest,
}) {
  const [usernameTruncated, setUsernameTruncated] = useState(profile?.acct?.length > 40)

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

    if (relationship && relationship.requested) {
      return <FollowRequested onPress={() => onCancelFollowRequest()}/>
    }
    if (relationship && relationship.blocking) {
      return <BlockingProfile />
    }
    if (relationship && relationship.following) {
      return <FollowingProfile onPress={() => onUnfollow()} />
    }
    if (relationship && !relationship.following) {
      return <FollowProfile onPress={() => onFollow()} />
    }
  }

  return (
    <View flex={1}>
      <View mx="$4" mt="$3">
        <XStack w="100%" justifyContent="space-between" alignItems="center" gap="$10">
          <Link href={{ screen: '', action: 'goBack' }} asChild>
            <Pressable>
              <XStack alignItems="center" gap="$5">
                <Feather name="chevron-left" size={26} />
              </XStack>
            </Pressable>
          </Link>

          {usernameTruncated ? (
            <Pressable onPress={() => setUsernameTruncated(false)}>
              <Text
                flexShrink={1}
                fontWeight="bold"
                fontSize={profile?.acct.length > 40 ? 15 : 20}
                flexWrap="wrap"
              >
                {enforceLen(profile?.acct, 35, true, 'middle')}
              </Text>
            </Pressable>
          ) : (
            <Text flexShrink={1} fontWeight="bold" fontSize={20} flexWrap="wrap">
              {profile?.acct ?? 'User'}
            </Text>
          )}

          <XStack alignItems="center" gap="$5">
            {isSelf ? (
              <Link href="/settings">
                <Feather name="menu" size={26} />
              </Link>
            ) : (
              <Button chromeless p="$0" onPress={() => openMenu()}>
                <Feather name="more-horizontal" size={26} />
              </Button>
            )}
          </XStack>
        </XStack>

        <XStack w="100%" justifyContent="space-between" alignItems="center" mt="$3">
          <View style={{ borderRadius: 100, overflow: 'hidden' }}>
            <Avatar circular size="$10" borderWidth={1} borderColor="$gray5">
              <Avatar.Image src={profile?.avatar} />
              <Avatar.Fallback backgroundColor="$gray4" />
            </Avatar>
          </View>

          <XStack gap="$7" mx="$5">
            <YStack alignItems="center" gap="$1">
              <Text fontWeight="bold" fontSize="$6">
                {prettyCount(profile?.statuses_count ? profile.statuses_count : 0)}
              </Text>
              <Text fontSize="$3">Posts</Text>
            </YStack>

            <Link href={`/profile/following/${profile?.id}`}>
              <YStack alignItems="center" gap="$1">
                <Text fontWeight="bold" fontSize="$6">
                  {prettyCount(profile?.following_count ? profile.following_count : 0)}
                </Text>
                <Text fontSize="$3">Following</Text>
              </YStack>
            </Link>

            <Link href={`/profile/followers/${profile?.id}`}>
              <YStack alignItems="center" gap="$1">
                <Text fontWeight="bold" fontSize="$6">
                  {prettyCount(profile?.followers_count ? profile.followers_count : 0)}
                </Text>
                <Text fontSize="$3">Followers</Text>
              </YStack>
            </Link>
          </XStack>
        </XStack>

        <YStack w="100%" mt="$3" gap={5}>
          <XStack gap="$2" alignItems="center">
            <Text fontSize="$6" fontWeight={'bold'}>
              {profile?.display_name}
            </Text>
            {relationship && relationship?.muting ? (
              <View borderWidth={1} borderColor="$red7" borderRadius={5} px={10} py={3}>
                <Text color="$red10" fontWeight="bold" fontSize="$2">
                  Muted
                </Text>
              </View>
            ) : null}
          </XStack>
          {/* <Text fontSize="$6" fontWeight={'bold'} color="$gray9" letterSpacing={-0.4}>
            {profile?.local ? '@' + profile?.acct + '@pixelfed.social' : profile?.acct}
          </Text> */}

          <ReadMore numberOfLines={2} renderRevealedFooter={() => <></>}>
            <Text fontSize={14} fontWeight={400} letterSpacing={0.001}>
              {profile?.note_text &&
                profile?.note.replaceAll('&amp;', '&').replaceAll(/(<([^>]+)>)/gi, '')}
            </Text>
          </ReadMore>

          {profile?.website && profile?.website.trim().length ? (
            <XStack alignItems="center" gap="$1">
              <Text
                fontSize="$5"
                fontWeight={'bold'}
                color="$blue9"
                letterSpacing={-0.34}
              >
                {profile?.website?.replaceAll('https://', '')}
              </Text>
            </XStack>
          ) : null}
        </YStack>

        <ActionButton />

      </View>
      <Separator />
    </View>
  )
}
