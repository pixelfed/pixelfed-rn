import { Dimensions } from 'react-native'
import { Text, View, XStack, YStack } from 'tamagui'
import { Feather } from '@expo/vector-icons'
import { Image } from 'expo-image'
import React, { useCallback, useEffect, useMemo } from 'react'
import { formatTimestamp } from '../../utils'

const SCREEN_WIDTH = Dimensions.get('screen').width
const AVATAR_WIDTH = 40

const Section = React.memo(({ children }) => (
  <View px="$3" bg="white" borderTopWidth={1} borderBottomWidth={1} borderColor="$gray7">
    {children}
  </View>
))

const BorderlessSection = React.memo(({ children }) => (
  <View px="$3" bg="white">
    {children}
  </View>
))

const PostHeader = React.memo(({ avatar, username, displayName }) => (
  <Section>
    <XStack
      flexGrow={1}
      justifyContent="flex-between"
      alignSelf="stretch"
      alignItems="center"
      py="$3"
    >
      <XStack gap="$3" alignItems="center" flexGrow={1}>
        <Image
          source={avatar}
          style={{
            width: AVATAR_WIDTH,
            height: AVATAR_WIDTH,
            borderRadius: AVATAR_WIDTH,
          }}
        />
        <YStack gap={1}>
          <Text fontWeight="bold" fontSize="$6">
            {username}
          </Text>
          <Text fontWeight="300" fontSize="$4" color="$gray9">
            {displayName}
          </Text>
        </YStack>
      </XStack>
      <Feather name="more-horizontal" size={25} />
    </XStack>
  </Section>
))

const PostMedia = React.memo(({ mediaUrl }) => (
  <View flex={1} minHeight={500} borderBottomWidth={1} borderBottomColor="$gray5">
    <Image
      style={{ width: SCREEN_WIDTH, height: '100%' }}
      source={mediaUrl}
      contentFit="resize"
    />
  </View>
))

const PostActions = React.memo(
  ({ hasLiked, hasShared, likesCount, likedBy, sharesCount }) => (
    <BorderlessSection>
      <YStack pt="$3" pb="$2" gap="$3">
        <XStack gap="$4" justifyContent="space-between">
          <XStack gap="$5">
            <Feather name="heart" size={26} />
            <Feather name="message-circle" size={26} />
            <Feather name="refresh-cw" size={26} />
          </XStack>
          <XStack gap="$4">
            <Feather name="bookmark" size={26} />
          </XStack>
        </XStack>
        <XStack justifyContent="space-between">
          {likesCount ? (
            likedBy && likesCount > 1 ? (
              <XStack>
                <Text fontSize="$5">Liked by </Text>
                <Text fontWeight="bold" fontSize="$5">
                  {likedBy.username}
                </Text>
                <Text fontSize="$5"> and </Text>
                <Text fontWeight="bold" fontSize="$5">
                  {likesCount - 1} {likesCount - 1 > 1 ? 'others' : 'other'}
                </Text>
              </XStack>
            ) : (
              <Text fontWeight="bold" fontSize="$5">
                {likesCount} {likesCount > 1 ? 'Likes' : 'Like'}
              </Text>
            )
          ) : (
            <View flexGrow={1}></View>
          )}
          {likesCount && sharesCount ? (
            <Text fontWeight="bold" fontSize="$5">
              {sharesCount} {sharesCount > 1 ? 'Shares' : 'Share'}
            </Text>
          ) : null}
        </XStack>
      </YStack>
    </BorderlessSection>
  )
)

const PostCaption = React.memo(({ username, caption, commentsCount, createdAt }) => {
  const timeAgo = formatTimestamp(createdAt)
  return (
    <BorderlessSection>
      <YStack gap="$3" pb="$3">
        <XStack flexWrap="wrap" pr="$3">
          <Text fontSize={17} lineHeight={24}>
            <Text fontWeight="bold">{username}</Text> {caption.replaceAll('\n\n', ' ')}
          </Text>
        </XStack>
        {commentsCount ? (
          <Text color="$gray10" fontSize="$5">
            View all {commentsCount} comments
          </Text>
        ) : null}
        <XStack alignItems="center" gap="$2">
          <Feather name="clock" color="#ccc" />
          <Text color="$gray9">{timeAgo}</Text>
        </XStack>
      </YStack>
    </BorderlessSection>
  )
})

export default function FeedPost({ post }) {
  return (
    <View flex={1} style={{ width: SCREEN_WIDTH }}>
      <PostHeader
        avatar={post.account.avatar}
        username={post.account.username}
        displayName={post.account.display_name}
      />
      <PostMedia mediaUrl={post.media_attachments[0].url} />
      <PostActions
        hasLiked={false}
        hasShared={false}
        likesCount={post.favourites_count}
        likedBy={post.liked_by}
        sharesCount={post.reblogs_count}
      />
      <PostCaption
        username={post.account.username}
        caption={post.content_text}
        commentsCount={post.reply_count}
        createdAt={post.created_at}
      />
    </View>
  )
}
