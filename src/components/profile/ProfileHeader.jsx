import { View, Text, XStack, Image, YStack, Button, Separator, Avatar } from 'tamagui'
import { Feather } from '@expo/vector-icons'
import {
  enforceLen,
  formatTimestampMonthYear,
  openBrowserAsync,
  prettyCount,
} from 'src/utils'
import { Link, router } from 'expo-router'
import { Dimensions, Pressable, Platform } from 'react-native'
import EditProfile from './actionButtons/EditProfile'
import FollowingProfile from './actionButtons/FollowingProfile'
import FollowProfile from './actionButtons/FollowProfile'
import BlockingProfile from './actionButtons/BlockingProfile'
import FollowRequested from './actionButtons/FollowRequested'
import ReadMore from 'src/components/common/ReadMore'
import AutolinkText from 'src/components/common/AutolinkText'
import { useState } from 'react'
import { PressableOpacity } from 'react-native-pressable-opacity'

const SCREEN_WIDTH = Dimensions.get('screen').width

export default function ProfileHeader({
  profile,
  isSelf = false,
  selfUser,
  relationship = false,
  openMenu,
  onFollow,
  onShare,
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

  const onHashtagPress = (tag) => {
    router.push(`/hashtag/${tag}`)
  }

  const onMentionPress = (tag) => {
    router.push(`/profile/0?byUsername=${tag.slice(1)}`)
  }

  const onSendMessage = () => {
    router.push(`/chats/conversation/${profile?.id}}`)
  }

  const onGotoSettings = () => {
    router.navigate(`/settings/profile`)
  }

  const ActionButton = () => {
    if (isSelf || selfUser?.id == profile?.id) {
      return <EditProfile onPress={() => onGotoSettings()} />
    }

    if (relationship && relationship.requested) {
      return <FollowRequested onPress={() => onCancelFollowRequest()} />
    }
    if (relationship && relationship.blocking) {
      return <BlockingProfile />
    }
    if (relationship && relationship.following) {
      return (
        <FollowingProfile
          onPress={() => onUnfollow()}
          onSendMessage={() => onSendMessage()}
        />
      )
    }
    if (relationship && !relationship.following) {
      return <FollowProfile onPress={() => onFollow()} />
    }
  }

  const _openWebsite = async () => {
    await openBrowserAsync(profile?.website)
  }

  const RenderGuestHeader = () => (
    <XStack w="100%" justifyContent="space-between" alignItems="center" gap="$10">
      <View>
        <Link href={{ screen: '', action: 'goBack' }} asChild>
          <Pressable>
            <XStack alignItems="center" gap="$5">
              <Feather name="chevron-left" size={26} />
            </XStack>
          </Pressable>
        </Link>
      </View>

      <View flexShrink={1}>
        {usernameTruncated ? (
          <Pressable onPress={() => setUsernameTruncated(false)}>
            <Text
              flexShrink={1}
              fontWeight="bold"
              fontSize={profile?.acct.length > 40 ? 15 : 18}
              flexWrap="wrap"
            >
              {enforceLen(profile?.acct, 35, true, 'middle')}
            </Text>
          </Pressable>
        ) : (
          <Text
            fontWeight="bold"
            fontSize={Platform.OS === 'ios' ? 18 : 15}
            flexWrap="wrap"
            adjustsFontSizeToFit={true}
            allowFontScaling={false}
          >
            {profile?.acct ?? 'User'}
          </Text>
        )}
      </View>
      <View>
        <XStack alignItems="center" gap="$5">
          {selfUser?.id == profile?.id ? (
            <Button chromeless p="$0" size="$2" onPress={() => onShare()}>
              <Feather name="share" size={23} />
            </Button>
          ) : (
            <Button chromeless p="$0" onPress={() => openMenu()}>
              <Feather
                name={Platform.OS === 'ios' ? 'more-horizontal' : 'more-vertical'}
                size={26}
              />
            </Button>
          )}
        </XStack>
      </View>
    </XStack>
  )

  const RenderSelfHeader = () => (
    <XStack w="100%" justifyContent="space-between" alignItems="center" gap="$10">
      <Text
        flexShrink={1}
        fontWeight="bold"
        fontSize={26}
        allowFontScaling={false}
        flexWrap="wrap"
      >
        {profile?.acct ?? 'User'}
      </Text>

      <XStack alignItems="center" gap="$5">
        <Button chromeless p="$0" size="$2" onPress={() => onShare()}>
          <Feather name="share" size={23} />
        </Button>
        <Link href="/settings">
          <Feather name="menu" size={30} />
        </Link>
      </XStack>
    </XStack>
  )

  return (
    <View flex={1}>
      <View mx="$4" mt="$3">
        {isSelf ? <RenderSelfHeader /> : <RenderGuestHeader />}

        <XStack w="100%" justifyContent="space-between" alignItems="center" mt="$3">
          <View style={{ borderRadius: 100, overflow: 'hidden' }}>
            <Avatar
              circular
              size={SCREEN_WIDTH > 400 ? '$10' : '$8'}
              borderWidth={1}
              borderColor="$gray5"
            >
              <Avatar.Image src={profile?.avatar} />
              <Avatar.Fallback backgroundColor="$gray4" />
            </Avatar>
          </View>

          <XStack gap={SCREEN_WIDTH > 400 ? '$7' : '$5'} mx="$5" alignItems="flex-start">
            <YStack alignItems="center" gap="$1">
              <Text fontWeight="bold" fontSize="$5" allowFontScaling={false}>
                {prettyCount(profile?.statuses_count ? profile.statuses_count : 0)}
              </Text>
              <Text fontSize="$2" allowFontScaling={false}>
                Posts
              </Text>
            </YStack>

            {profile && profile.id ? (
              <Link href={`/profile/following/${profile?.id}`} asChild>
                <YStack alignItems="center" gap="$1">
                  <Text fontWeight="bold" fontSize="$5" allowFontScaling={false}>
                    {prettyCount(profile?.following_count ? profile.following_count : 0)}
                  </Text>
                  <Text fontSize="$2" allowFontScaling={false}>
                    Following
                  </Text>
                </YStack>
              </Link>
            ) : (
              <YStack alignItems="center" gap="$1">
                <Text fontWeight="bold" fontSize="$5" allowFontScaling={false}>
                  0
                </Text>
                <Text fontSize="$2" allowFontScaling={false}>
                  Following
                </Text>
              </YStack>
            )}

            {profile && profile.id ? (
              <Link href={`/profile/followers/${profile?.id}`} asChild>
                <YStack alignItems="center" gap="$1">
                  <Text fontWeight="bold" fontSize="$5" allowFontScaling={false}>
                    {prettyCount(profile?.followers_count ? profile.followers_count : 0)}
                  </Text>
                  <Text fontSize="$2" allowFontScaling={false}>
                    Followers
                  </Text>
                </YStack>
              </Link>
            ) : (
              <YStack alignItems="center" gap="$1">
                <Text fontWeight="bold" fontSize="$6" allowFontScaling={false}>
                  0
                </Text>
                <Text fontSize="$3" allowFontScaling={false}>
                  Followers
                </Text>
              </YStack>
            )}
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
            {profile && profile?.is_admin ? (
              <View bg="$red9" borderRadius={5} px={10} py={3}>
                <Text color="white" fontWeight="bold" fontSize="$2">
                  Admin
                </Text>
              </View>
            ) : null}
          </XStack>

          <ReadMore numberOfLines={2} renderRevealedFooter={() => <></>}>
            <AutolinkText
              text={profile?.note
                ?.replaceAll('&amp;', '&')
                .replaceAll('\n\n', '\n')
                .replaceAll(/(<([^>]+)>)/gi, '')}
              username={false}
              onHashtagPress={onHashtagPress}
              onMentionPress={onMentionPress}
            />
          </ReadMore>

          {profile?.website && profile?.website.trim().length ? (
            <PressableOpacity onPress={() => _openWebsite()}>
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
            </PressableOpacity>
          ) : null}
        </YStack>

        <ActionButton />
      </View>
      <Separator />
    </View>
  )
}
