import { Feather } from '@expo/vector-icons'
import { Link, useRouter } from 'expo-router'
import { useCallback, useState } from 'react'
import { Dimensions, Platform, Pressable } from 'react-native'
import { PressableOpacity } from 'react-native-pressable-opacity'
import AutolinkText from 'src/components/common/AutolinkText'
import ReadMore from 'src/components/common/ReadMore'
import UserAvatar from 'src/components/common/UserAvatar'
import { enforceLen, openBrowserAsync, prettyCount } from 'src/utils'
import { Avatar, Button, Separator, Text, View, XStack, YStack } from 'tamagui'
import BlockingProfile from './actionButtons/BlockingProfile'
import EditProfile from './actionButtons/EditProfile'
import FollowProfile from './actionButtons/FollowProfile'
import FollowRequested from './actionButtons/FollowRequested'
import FollowingProfile from './actionButtons/FollowingProfile'
const SCREEN_WIDTH = Dimensions.get('screen').width
import type { Relationship } from 'src/lib/api-types'
import { useUserCache } from 'src/state/AuthProvider'

type todo = any

interface ProfileHeaderProps {
  profile: todo
  isSelf?: boolean
  relationship?: Relationship
  openMenu: () => void
  onFollow: () => void
  onShare: () => void
  onUnfollow: () => void
  onCancelFollowRequest: () => void
  mutuals: todo[]
}

// TODO split self profile and other user profile
// Why? because they have different required properties
export default function ProfileHeader({
  profile,
  isSelf = false,
  relationship,
  openMenu,
  onFollow,
  onShare,
  onUnfollow,
  onCancelFollowRequest,
  mutuals,
}: ProfileHeaderProps) {
  const router = useRouter()
  const [usernameTruncated, setUsernameTruncated] = useState(profile?.acct?.length > 40)

  const { id: selfId } = useUserCache()

  const onHashtagPress = (tag: string) => {
    router.push(`/hashtag/${tag}`)
  }

  const onMentionPress = (tag: string) => {
    router.push(`/profile/0?byUsername=${tag.slice(1)}`)
  }

  const onSendMessage = () => {
    router.push(`/chats/conversation/${profile?.id}}`)
  }

  const onGotoSettings = () => {
    router.navigate(`/settings/profile`)
  }

  const gotoSelfLikes = () => {
    router.navigate(`/profile/likes`)
  }

  const gotoBookmarks = () => {
    router.navigate(`/profile/bookmarks`)
  }

  const gotoProfileFeed = () => {
    router.push(`/profile/feed/${profile?.id}}`)
  }

  const ActionButton = () => {
    if (isSelf || selfId == profile?.id) {
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
      return <FollowProfile onPress={() => onFollow()} userId={profile?.id} />
    }
    return null
  }

  const _openWebsite = async () => {
    await openBrowserAsync(profile?.website)
  }

  const RenderGuestHeader = () =>
    Platform.OS === 'ios' ? (
      <XStack w="100%" justifyContent="space-between" alignItems="center" gap="$10">
        <View>
          <Pressable onPress={() => router.back()}>
            <XStack alignItems="center" gap="$5">
              <Feather name="chevron-left" size={26} />
            </XStack>
          </Pressable>
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
                {enforceLen(profile?.acct, 30, true, 'middle')}
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
              {enforceLen(profile?.acct ?? 'User', 15, true)}
            </Text>
          )}
        </View>
        <View>
          <XStack alignItems="center" gap="$5">
            {selfId == profile?.id ? (
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
    ) : null

  const RenderSelfHeader = () => (
    <XStack
      w="100%"
      justifyContent="space-between"
      alignItems="center"
      gap="$10"
      my={Platform.OS === 'android' ? '$4' : '$2'}
    >
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

  const renderMutualSeparator = (index: number) => {
    const top3 = mutuals.slice(0, 3)
    const totalLen = mutuals.length

    if (totalLen === 1) {
      return
    }

    if (totalLen === 3) {
      if (index != top3.length - 1) {
        return index === top3.length - 2 ? ' and ' : ', '
      }
      return ' '
    }

    if (totalLen < 4) {
      return index != top3.length - 1 ? ' and ' : ' '
    }
    return index != top3.length - 1 ? ', ' : ' '
  }

  const RenderMutuals = useCallback(() => {
    const top3 = mutuals.slice(0, 3)
    return (
      <XStack alignItems="center" gap="$2" mt="$3" mb="$1">
        <XStack gap={-10}>
          {top3.map((m) => (
            <UserAvatar key={m.id} url={m.avatar} size="$2" />
          ))}
        </XStack>
        <XStack maxWidth="80%" flexWrap="wrap">
          <Text fontSize="$2" allowFontScaling={false}>
            Followed by{' '}
          </Text>
          {top3.map((t, index) => (
            <Link key={index} href={`/profile/${t.id}`} asChild>
              <XStack>
                <Text fontWeight="bold" fontSize="$3" allowFontScaling={false}>
                  {t.username}
                </Text>
                <Text fontSize="$3" allowFontScaling={false}>
                  {renderMutualSeparator(index)}
                </Text>
              </XStack>
            </Link>
          ))}
          {top3.length === 3 && mutuals.length > 3 ? (
            <Link href={`/profile/followers/${profile?.id}`} asChild>
              <Text fontSize="$3" allowFontScaling={false}>
                and <Text fontWeight="bold">{mutuals.length - top3.length} others</Text>
              </Text>
            </Link>
          ) : null}
        </XStack>
      </XStack>
    )
  }, [mutuals])

  const RenderBio = useCallback(
    () => (
      <ReadMore numberOfLines={2} renderRevealedFooter={() => <></>}>
        <AutolinkText
          text={profile?.note
            ?.replaceAll('&amp;', '&')
            .replaceAll('\n\n', '\n')
            .replaceAll(/(<([^>]+)>)/gi, '')}
          onHashtagPress={onHashtagPress}
          onMentionPress={onMentionPress}
        />
      </ReadMore>
    ),
    [profile]
  )

  return (
    <View flex={1}>
      <View mx="$4" mt={Platform.OS === 'ios' ? '$3' : 0}>
        {isSelf ? <RenderSelfHeader /> : <RenderGuestHeader />}

        <XStack
          w="100%"
          justifyContent="space-between"
          alignItems="center"
          mt={Platform.OS === 'ios' ? '$3' : 0}
        >
          <View style={{ borderRadius: 100, overflow: 'hidden' }}>
            <Avatar
              circular
              size={SCREEN_WIDTH > 400 ? '$10' : '$8'}
              borderWidth={1}
              borderColor={profile?.local ? '$gray5' : '$gray3'}
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
              <Text fontSize="$2" allowFontScaling={false} color="$gray9">
                Posts
              </Text>
            </YStack>

            {profile && profile.id ? (
              <Link href={`/profile/following/${profile?.id}`} asChild>
                <YStack alignItems="center" gap="$1">
                  <Text fontWeight="bold" fontSize="$5" allowFontScaling={false}>
                    {prettyCount(profile?.following_count ? profile.following_count : 0)}
                  </Text>
                  <Text fontSize="$2" allowFontScaling={false} color="$gray9">
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
                  <Text fontSize="$2" allowFontScaling={false} color="$gray9">
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
            <Text fontSize="$6" fontWeight={'bold'} flexWrap="wrap">
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
          {profile && !profile?.local ? (
            <XStack mt={-5} alignItems="center" gap={1}>
              <Feather name="at-sign" color="#888" />
              <Text
                color="black"
                fontWeight={300}
                fontSize="$3"
                lineHeight={16}
                mb={1}
                allowFontScaling={false}
                flexWrap="wrap"
              >
                {enforceLen(profile?.acct, 50, true)}
              </Text>
            </XStack>
          ) : null}

          {profile?.note && profile?.note.length && <RenderBio />}

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

        {mutuals && mutuals.length ? (
          <View w="100%" flexGrow={1}>
            <RenderMutuals />
          </View>
        ) : (
          <View h={10}></View>
        )}

        <ActionButton />
      </View>

      {isSelf ? (
        <>
          <Separator borderColor="$gray6" />
          <XStack justifyContent="space-around" px="$5" py="$3" mb="$1">
            <Feather name="grid" size={20} />

            <PressableOpacity onPress={() => gotoProfileFeed()}>
              <Feather name="list" size={20} color="#999" />
            </PressableOpacity>

            <PressableOpacity onPress={() => gotoSelfLikes()}>
              <Feather name="heart" size={20} color="#999" />
            </PressableOpacity>

            <PressableOpacity onPress={() => gotoBookmarks()}>
              <Feather name="bookmark" size={20} color="#999" />
            </PressableOpacity>
          </XStack>
        </>
      ) : (
        <>
          <Separator borderColor="$gray6" />
          <XStack justifyContent="space-around" px="$5" py="$3" mb="$1">
            <Feather name="grid" size={20} />

            <PressableOpacity onPress={() => gotoProfileFeed()}>
              <Feather name="list" size={20} color="#999" />
            </PressableOpacity>
          </XStack>
        </>
      )}
    </View>
  )
}
