import { Feather } from '@expo/vector-icons'
import { Link, useRouter } from 'expo-router'
import { useCallback, useState } from 'react'
import {
  Dimensions,
  type Insets,
  Modal,
  Platform,
  Pressable,
  TouchableWithoutFeedback,
  useWindowDimensions,
} from 'react-native'
import { PressableOpacity } from 'react-native-pressable-opacity'
import AutolinkText, { onMentionPressMethod } from 'src/components/common/AutolinkText'
import ReadMore from 'src/components/common/ReadMore'
import UserAvatar from 'src/components/common/UserAvatar'
import { enforceLen, openBrowserAsync, prettyCount } from 'src/utils'
import {
  Avatar,
  Button,
  Separator,
  Spinner,
  Text,
  useTheme,
  View,
  XStack,
  YStack,
} from 'tamagui'
import BlockingProfile from './actionButtons/BlockingProfile'
import EditProfile from './actionButtons/EditProfile'
import FollowingProfile from './actionButtons/FollowingProfile'
import FollowProfile from './actionButtons/FollowProfile'
import FollowRequested from './actionButtons/FollowRequested'

const SCREEN_WIDTH = Dimensions.get('screen').width

import type { Relationship } from 'src/lib/api-types'
import { useUserCache } from 'src/state/AuthProvider'
import ZoomableImage from '../common/ZoomableImage'

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
  onUnblock: () => void
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
  onUnblock,
  mutuals,
}: ProfileHeaderProps) {
  const router = useRouter()
  const [usernameTruncated, setUsernameTruncated] = useState(profile?.acct?.length > 40)
  const [modalVisible, setModalVisible] = useState(false)
  const { width: windowWidth } = useWindowDimensions()
  const imageWidth = windowWidth * (70 / 100)

  const theme = useTheme()
  const { id: selfId } = useUserCache()

  const onHashtagPress = (tag: string) => {
    router.push(`/hashtag/${tag}`)
  }

  const onMentionPress = (tag: string) => {
    router.push(`/profile/0?byUsername=${tag.slice(1)}`)
  }

  const onSendMessage = () => {
    router.push(
      `/chats/conversation/${profile.id.toString()}?id=${profile.id.toString()}}`
    )
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

  const ShowMenuBar = () => {
    if (isSelf || selfId == profile?.id) {
      return true
    }

    if (profile?.locked == false) {
      return true
    }

    if (relationship && relationship.following) {
      return true
    }

    return false
  }

  const ActionButton = () => {
    if (isSelf || selfId == profile?.id) {
      return <EditProfile onPress={() => onGotoSettings()} />
    }

    if (relationship && relationship.requested) {
      return <FollowRequested onPress={() => onCancelFollowRequest()} />
    }
    if (relationship && relationship.blocking) {
      return <BlockingProfile onPress={() => onUnblock()} />
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
      return (
        <FollowProfile
          onPress={() => onFollow()}
          userId={profile?.id}
          isLocked={profile?.locked}
        />
      )
    }
    return (
      <XStack w="100%" my="$3" gap="$2">
        <Button
          theme="light"
          bg="$blue9"
          size="$4"
          color="white"
          fontWeight="bold"
          fontSize="$6"
          flexGrow={1}
          disabled={true}
          icon={<Spinner color="white" />}
        ></Button>
      </XStack>
    )
  }

  const _openWebsite = async () => {
    await openBrowserAsync(profile?.website)
  }

  const RenderGuestHeader = () =>
    Platform.OS === 'ios' ? (
      <XStack
        bg={theme.background?.val.default.val}
        w="100%"
        justifyContent="space-between"
        alignItems="center"
        gap="$10"
      >
        <View>
          <Pressable
            onPress={() => router.back()}
            hitSlop={{ left: 10, right: 26, top: 20, bottom: 10 }}
          >
            <XStack alignItems="center" gap="$5">
              <Feather
                name="chevron-left"
                size={26}
                color={theme.color?.val.default.val}
              />
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
                color={theme.color?.val.default.val}
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
              color={theme.color?.val.default.val}
            >
              {enforceLen(profile?.acct ?? 'User', 15, true)}
            </Text>
          )}
        </View>
        <View>
          <XStack alignItems="center" gap="$5">
            {selfId == profile?.id ? (
              <PressableOpacity 
                accessible={true}
                accessibilityLabel="Share"
                accessibilityHint="Share link to this profile"
                accessibilityRole="button"
                hitSlop={18} 
                onPress={() => onShare()}
              >
                <Feather name="share" size={24} color={theme.color?.val.default.val} />
              </PressableOpacity>
            ) : (
              <PressableOpacity 
                accessible={true}
                accessibilityLabel="Options"
                accessibilityHint="Open options menu"
                accessibilityRole="button"
                hitSlop={18} 
                onPress={() => openMenu()}
              >
                <Feather
                  name={Platform.OS === 'ios' ? 'more-horizontal' : 'more-vertical'}
                  size={26}
                  color={theme.color?.val.default.val}
                />
              </PressableOpacity>
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
      bg={theme.background?.val.default.val}
      my={Platform.OS === 'android' ? '$4' : '$2'}
    >
      <Text
        flexShrink={1}
        fontWeight="bold"
        fontSize={26}
        allowFontScaling={false}
        flexWrap="wrap"
        color={theme.color?.val.default.val}
      >
        {profile?.acct ?? 'User'}
      </Text>

      <XStack alignItems="center" gap="$5">
        <PressableOpacity 
          accessible={true}
          accessibilityLabel="Share"
          accessibilityHint="Share link to this profile"
          accessibilityRole="button"
          hitSlop={12} 
          onPress={() => onShare()}
        >
          <Feather name="share" size={23} color={theme.color?.val.default.val} />
        </PressableOpacity>
        <PressableOpacity 
          accessible={true}
          accessibilityLabel="Settings"
          accessibilityRole="button"
          hitSlop={10}
          onPress={() => router.push('/settings')}
        >
          <Feather name="menu" size={30} color={theme.color?.val.default.val} />
        </PressableOpacity>
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
          <Text
            fontSize="$2"
            allowFontScaling={false}
            color={theme.color?.val.secondary.val}
          >
            Followed by{' '}
          </Text>
          {top3.map((t, index) => (
            <Link 
              accessible={true}
              accessibilityLabel="Open profile"
              accessibilityRole="link"
              key={index} 
              href={`/profile/${t.id}`}
            >
              <XStack>
                <Text
                  fontWeight="bold"
                  fontSize="$3"
                  allowFontScaling={false}
                  color={theme.color?.val.default.val}
                >
                  {t.username}
                </Text>
                <Text
                  fontSize="$3"
                  allowFontScaling={false}
                  color={theme.color?.val.secondary.val}
                >
                  {renderMutualSeparator(index)}
                </Text>
              </XStack>
            </Link>
          ))}
          {top3.length === 3 && mutuals.length > 3 ? (
            <Link 
              accessible={true}
              accessibilityLabel="Open profile"
              accessibilityRole="link"
              href={`/profile/followers/${profile?.id}`}
            >
              <Text
                fontSize="$3"
                allowFontScaling={false}
                color={theme.color?.val.default.val}
              >
                and{' '}
                <Text fontWeight="bold" color={theme.color?.val.default.val}>
                  {mutuals.length - top3.length} others
                </Text>
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
          onMentionPress={onMentionPressMethod(onMentionPress, profile.url)}
        />
      </ReadMore>
    ),
    [profile]
  )

  const TabsHitSlop: Insets = { left: 25, right: 25, bottom: 12, top: 13 }

  return (
    <View flex={1} bg={theme.background?.val.default.val}>
      {modalVisible && (
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            background: '#333',
          }}
        >
          <Modal
            animationType="fade"
            visible={modalVisible}
            transparent={true}
            onRequestClose={() => setModalVisible(false)}
          >
            <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
              <View
                style={{
                  flex: 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: 'rgba(0, 0, 0, 0.7)',
                }}
              >
                <ZoomableImage
                  source={{ uri: profile?.avatar }}
                  style={{
                    width: imageWidth,
                    height: imageWidth,
                    backgroundColor: profile?.local ? '$gray5' : '$gray3',
                    borderRadius: imageWidth,
                  }}
                />
              </View>
            </TouchableWithoutFeedback>
          </Modal>
        </View>
      )}
      <View mx="$4" mt={Platform.OS === 'ios' ? '$3' : 0}>
        {isSelf ? <RenderSelfHeader /> : <RenderGuestHeader />}

        <XStack w="100%" justifyContent="space-between" alignItems="center" mt="$3">
          <Pressable onPress={() => setModalVisible(true)} hitSlop={4}>
            <View style={{ borderRadius: 100, overflow: 'hidden' }}>
              <Avatar
                circular
                size={SCREEN_WIDTH > 400 ? '$10' : '$8'}
                borderWidth={1}
                borderColor={theme.borderColor?.val.default.val}
              >
                <Avatar.Image src={profile?.avatar} />
                <Avatar.Fallback backgroundColor="$gray4" />
              </Avatar>
            </View>
          </Pressable>

          <XStack gap={SCREEN_WIDTH > 400 ? '$7' : '$5'} mx="$5" alignItems="flex-start">
            <YStack alignItems="center" gap="$1">
              <View>
                <Text
                  fontWeight="bold"
                  fontSize="$5"
                  allowFontScaling={false}
                  color={theme.color?.val.default.val}
                >
                  {prettyCount(profile?.statuses_count ? profile.statuses_count : 0)}
                </Text>
                <Text
                  fontSize="$2"
                  allowFontScaling={false}
                  color={theme.color?.val.secondary.val}
                >
                  Posts
                </Text>
              </View>
            </YStack>

            {profile && profile.id ? (
              <PressableOpacity 
                accessible={true}
                accessibilityHint="Opens following list"
                accessibilityRole="button"
                hitSlop={9}
                onPress={() => router.push(`/profile/following/${profile?.id}`)}
              >
                <YStack alignItems="center" gap="$1">
                  <Text
                    fontWeight="bold"
                    fontSize="$5"
                    allowFontScaling={false}
                    color={theme.color?.val.default.val}
                  >
                    {prettyCount(profile?.following_count ? profile.following_count : 0)}
                  </Text>
                  <Text
                    fontSize="$2"
                    allowFontScaling={false}
                    color={theme.color?.val.secondary.val}
                  >
                    Following
                  </Text>
                </YStack>
              </PressableOpacity>
            ) : (
              <YStack alignItems="center" gap="$1">
                <Text
                  fontWeight="bold"
                  fontSize="$5"
                  allowFontScaling={false}
                  color={theme.color?.val.default.val}
                >
                  0
                </Text>
                <Text
                  fontSize="$2"
                  allowFontScaling={false}
                  color={theme.color?.val.secondary.val}
                >
                  Following
                </Text>
              </YStack>
            )}

            {profile && profile.id ? (
              <PressableOpacity 
                accessible={true}
                accessibilityHint="Opens followers list"
                accessibilityRole="button"
                hitSlop={9}
                onPress={() => router.push(`/profile/followers/${profile?.id}`)}
              >
                <YStack alignItems="center" gap="$1">
                  <Text
                    fontWeight="bold"
                    fontSize="$5"
                    allowFontScaling={false}
                    color={theme.color?.val.default.val}
                  >
                    {prettyCount(profile?.followers_count ? profile.followers_count : 0)}
                  </Text>
                  <Text
                    fontSize="$2"
                    allowFontScaling={false}
                    color={theme.color?.val.secondary.val}
                  >
                    Followers
                  </Text>
                </YStack>
              </PressableOpacity>
            ) : (
              <YStack alignItems="center" gap="$1">
                <Text
                  fontWeight="bold"
                  fontSize="$6"
                  allowFontScaling={false}
                  color={theme.color?.val.default.val}
                >
                  0
                </Text>
                <Text
                  fontSize="$3"
                  allowFontScaling={false}
                  color={theme.color?.val.secondary.val}
                >
                  Followers
                </Text>
              </YStack>
            )}
          </XStack>
        </XStack>

        <YStack w="100%" mt="$3" gap={5}>
          <XStack gap="$2" alignItems="center">
            <Text
              fontSize="$6"
              fontWeight={'bold'}
              flexWrap="wrap"
              color={theme.color?.val.default.val}
            >
              {profile?.display_name}
            </Text>
            {profile?.locked && (
              <Feather
                name="lock"
                size={14}
                color={theme.color?.val.secondary.val}
                style={{ marginLeft: -5 }}
              />
            )}
            {relationship && relationship?.muting ? (
              <View
                borderWidth={1}
                borderColor={theme.borderColor?.val.default.val}
                borderRadius={5}
                px={10}
                py={3}
              >
                <Text
                  color={theme.color?.val.secondary.val}
                  fontWeight="bold"
                  fontSize="$2"
                >
                  Muted
                </Text>
              </View>
            ) : null}
            {profile && profile?.is_admin ? (
              <View bg="$red9" borderRadius={5} px={10} py={3}>
                <Text
                  color={theme.color?.val.default.val}
                  fontWeight="bold"
                  fontSize="$2"
                >
                  Admin
                </Text>
              </View>
            ) : null}
          </XStack>
          {profile && !profile?.local ? (
            <XStack mt={-5} alignItems="center" gap={1}>
              <Feather name="at-sign" color="#888" />
              <Text
                color={theme.color?.val.default.val}
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
            <PressableOpacity 
              accessible={true}
              accessibilityLabel="User's website"
              accessibilityRole="link"
              onPress={() => _openWebsite()}
            >
              <XStack alignItems="center" gap="$1">
                <Text
                  fontSize="$5"
                  fontWeight={'bold'}
                  color={theme.colorHover?.val.active.val}
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
          <Separator borderColor={theme.borderColor?.val.default.val} />
          <XStack justifyContent="space-around" px="$5" py="$3" mb="$1">
            <Feather 
              accessible={true}
              accessibilityLabel="Photo grid view"
              accessibilityRole="tab"
              accessibilityState={{ selected: true }}
              name="grid" 
              size={20} 
              color={theme.color?.val.default.val} 
            />

            <PressableOpacity 
              accessible={true}
              accessibilityLabel="Go to profile feed"
              accessibilityRole="button"
              onPress={() => gotoProfileFeed()}
              hitSlop={TabsHitSlop}
            >
              <Feather name="list" size={20} color="#999" />
            </PressableOpacity>

            <PressableOpacity 
              accessible={true}
              accessibilityLabel="Go to my liked posts"
              accessibilityRole="button"
              onPress={() => gotoSelfLikes()}
              hitSlop={TabsHitSlop}
            >
              <Feather name="heart" size={20} color="#999" />
            </PressableOpacity>

            <PressableOpacity 
              accessible={true}
              accessibilityLabel="Go to my bookmarked posts"
              accessibilityRole="button"
              onPress={() => gotoBookmarks()}
              hitSlop={TabsHitSlop}
            >
              <Feather name="bookmark" size={20} color="#999" />
            </PressableOpacity>
          </XStack>
        </>
      ) : (
        <>
          <Separator borderColor={theme.borderColor?.val.default.val} />
          {ShowMenuBar() && (
            <XStack justifyContent="space-around" px="$5" py="$3" mb="$1">
              <Feather 
                accessible={true}
                accessibilityLabel="Photo grid view"
                accessibilityRole="tab"
                accessibilityState={{ selected: true }}
                name="grid" 
                size={20} 
                color={theme.color?.val.default.val} 
              />

              <PressableOpacity 
                accessible={true}
                accessibilityLabel="Go to profile feed"
                accessibilityRole="button"
                onPress={() => gotoProfileFeed()}
              >
                <Feather name="list" size={20} color="#999" />
              </PressableOpacity>
            </XStack>
          )}
        </>
      )}
    </View>
  )
}
