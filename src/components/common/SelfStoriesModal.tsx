import { Feather } from '@expo/vector-icons'
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { Image } from 'expo-image'
import { useRouter } from 'expo-router'
import React, { useEffect, useState } from 'react'
import { Dimensions, FlatList, Platform, Pressable } from 'react-native'
import { useCustomAlert } from 'src/hooks/useCustomAlertProvider'
import { getStoryViewers, postStorySelfExpire } from 'src/lib/api'
import { Storage } from 'src/state/cache'
import { _timeAgo } from 'src/utils'
import {
  Avatar,
  Button,
  Circle,
  H2,
  H3,
  Paragraph,
  ScrollView,
  Separator,
  Sheet,
  Stack,
  Text,
  useTheme,
  XStack,
  YStack,
} from 'tamagui'
import StoriesExplanation from './StoriesExplanation'

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window')

const ONBOARDING_COMPLETED_KEY = 'ui+xs.v0.1.2.stories_onboarding_completed'
const STORIES_DISABLED_KEY = 'ui.hideStories'

interface Story {
  id: string
  url: string
  created_at: string
  viewed: boolean
  view_count: integer
}

interface Viewer {
  id: string
  username: string
  avatar: string
  display_name?: string
  viewed_at: string
}

interface SelfAvatarModalProps {
  isOpen: boolean
  stories: object
  onClose: () => void
  userAvatar: string
  username: string
  onAddStory: () => void
  onViewStories: () => void
  onDisableStories?: () => void
}

const FeatureCard: React.FC<{
  icon: string
  title: string
  description: string
  theme: any
}> = ({ icon, title, description, theme }) => (
  <YStack
    padding={20}
    backgroundColor={theme.background?.val?.secondary?.val}
    borderRadius={16}
    borderWidth={1}
    borderColor={theme.borderColor?.val?.default?.val}
    space={12}
    alignItems="center"
  >
    <Circle
      size={60}
      backgroundColor={theme.background?.val?.tertiary?.val}
      alignItems="center"
      justifyContent="center"
    >
      <Feather name={icon} size={24} color={theme.color?.val?.default?.val} />
    </Circle>
    <H3 color={theme.color?.val?.default?.val} textAlign="center" fontWeight="600">
      {title}
    </H3>
    <Paragraph
      color={theme.color?.val?.secondary?.val}
      textAlign="center"
      fontSize={14}
      lineHeight={20}
    >
      {description}
    </Paragraph>
  </YStack>
)

const OnboardingScreen: React.FC<{
  onGetStarted: () => void
  onDisable: () => void
  theme: any
  username: string
}> = ({ onGetStarted, onDisable, theme, username }) => (
  <YStack flex={1} paddingHorizontal={20}>
    <YStack alignItems="center" paddingTop={20} paddingBottom={30}>
      <Circle
        size={80}
        backgroundColor={theme.background?.val?.tertiary?.val}
        alignItems="center"
        justifyContent="center"
        marginBottom={20}
      >
        <Feather name="clock" size={36} color={theme.color?.val?.default?.val} />
      </Circle>

      <H2
        color={theme.color?.val?.default?.val}
        textAlign="center"
        fontWeight="700"
        marginBottom={8}
      >
        Welcome to Stories!
      </H2>

      <Paragraph
        color={theme.color?.val?.secondary?.val}
        textAlign="center"
        fontSize={16}
        lineHeight={22}
        paddingHorizontal={20}
      >
        Share moments that disappear in 24 hours with your followers on Pixelfed
      </Paragraph>
    </YStack>

    <ScrollView showsVerticalScrollIndicator={false} flex={1}>
      <YStack space={16} paddingBottom={20}>
        <FeatureCard
          icon="clock"
          title="24-Hour Stories"
          description="Your stories automatically disappear after 24 hours, perfect for sharing spontaneous moments"
          theme={theme}
        />

        <FeatureCard
          icon="users"
          title="Connect with Followers"
          description="Share behind-the-scenes content and daily highlights with people who follow you"
          theme={theme}
        />

        <FeatureCard
          icon="eye-off"
          title="Casual & Private"
          description="Stories feel more relaxed than posts - share freely without worrying about your main feed"
          theme={theme}
        />
      </YStack>
    </ScrollView>

    <YStack paddingBottom={40} space={12} paddingTop={20}>
      <Button
        size="$5"
        backgroundColor={theme.background?.val?.tertiary?.val}
        borderRadius={25}
        onPress={onGetStarted}
        pressStyle={{ scale: 0.98 }}
      >
        <XStack alignItems="center" space={12}>
          <Text color={theme.color?.val?.default?.val} fontWeight="bold" fontSize={16}>
            Get Started with Stories
          </Text>
        </XStack>
      </Button>

      <Button
        size="$4"
        backgroundColor="transparent"
        borderColor={theme.borderColor?.val?.default?.val}
        borderWidth={1}
        borderRadius={25}
        onPress={onDisable}
        pressStyle={{ scale: 0.98 }}
      >
        <XStack alignItems="center" space={8}>
          <Text color={theme.color?.val?.secondary?.val} fontWeight="500">
            Not interested - Hide Stories
          </Text>
        </XStack>
      </Button>

      <Paragraph
        color={theme.color?.val?.tertiary?.val}
        textAlign="center"
        fontSize={12}
        paddingTop={8}
      >
        You can always re-enable Stories later in the Appearance Settings
      </Paragraph>
    </YStack>
  </YStack>
)

const StackedStoriesPreview: React.FC<{
  stories: Story[]
  onTap: () => void
}> = ({ stories, onTap }) => {
  const theme = useTheme()
  const maxVisible = 4
  const visibleStories = stories.slice(0, maxVisible)

  return (
    <Pressable onPress={onTap}>
      <Stack height={220} width={140} alignItems="center" justifyContent="center">
        {visibleStories.map((story, index) => (
          <Stack
            key={story.id}
            position="absolute"
            width={140 - index * 6}
            height={200 - index * 8}
            borderRadius={12}
            backgroundColor={theme.background?.val.default?.val}
            borderWidth={1}
            borderColor={theme.borderColor?.val.strong?.val}
            style={{
              transform: [
                { translateX: index * 12 - 18 },
                { translateY: index * 8 - 12 },
                { rotate: `${index * 4 - 6}deg` },
              ],
              zIndex: maxVisible - index,
            }}
          >
            <Image source={story.url} width="100%" height="100%" borderRadius={10} />
          </Stack>
        ))}
        {stories.length > maxVisible && (
          <Stack
            position="absolute"
            bottom={80}
            right={-60}
            backgroundColor={theme.background?.val?.default.val}
            borderRadius={20}
            paddingHorizontal={8}
            paddingVertical={4}
            borderWidth={2}
            borderColor={theme.borderColor?.val?.default.val}
            zIndex={10}
          >
            <Text color={theme.color?.val?.default.val} fontSize={12} fontWeight="bold">
              +{stories.length - maxVisible}
            </Text>
          </Stack>
        )}
      </Stack>
    </Pressable>
  )
}

const StoryListItem: React.FC<{
  story: Story
  onDelete: (id: string) => void
  onStoryViews: (id: string) => void
}> = ({ story, onDelete, onStoryViews }) => {
  const theme = useTheme()
  const timeAgo = React.useMemo(() => {
    return _timeAgo(story.created_at)
  }, [story.created_at])

  return (
    <XStack
      padding={12}
      backgroundColor="$gray2"
      borderRadius={8}
      alignItems="center"
      space={12}
    >
      <Image source={{ uri: story.url }} width={60} height={80} borderRadius={6} />

      <YStack flex={1} space={4}>
        <XStack alignItems="center" justifyContent="space-between">
          <Text color={theme.color.val?.default.val} fontSize={16} fontWeight="normal">
            Shared {timeAgo} ago
          </Text>
          {!story.viewed && (
            <Text>
              <Circle size={8} backgroundColor={theme.background.val?.default.val} />
            </Text>
          )}
        </XStack>

        <XStack alignItems="center" space={4}>
          <Feather name="eye" size={14} color={theme.color?.val.tertiary.val} />
          <Text color={theme.color?.val.tertiary.val} fontSize={12}>
            {story?.view_count || 0} views
          </Text>
        </XStack>
      </YStack>

      <XStack space={8}>
        <Button
          size="$2"
          circular
          backgroundColor={theme.background?.val.tertiary.val}
          borderColor="$red9"
          onPress={() => onStoryViews(story.id)}
        >
          <Text>
            <Feather name="eye" size={16} color={theme.color?.val.default.val} />
          </Text>
        </Button>
        <Button
          size="$2"
          circular
          backgroundColor={theme.background?.val.tertiary.val}
          borderColor="$red9"
          onPress={() => onDelete(story.id)}
        >
          <Text>
            <Feather name="trash-2" size={16} color={theme.color?.val.default.val} />
          </Text>
        </Button>
      </XStack>
    </XStack>
  )
}

export const SelfAvatarModal: React.FC<SelfAvatarModalProps> = ({
  isOpen,
  stories,
  onClose,
  userAvatar,
  username,
  onAddStory,
  onViewStories,
  onDisableStories,
}) => {
  const [showStoryList, setShowStoryList] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [showStoryViewers, setShowStoryViewers] = useState(false)
  const [selectedStoryId, setSelectedStoryId] = useState<string | null>(null)
  const queryClient = useQueryClient()
  const theme = useTheme()
  const alert = useCustomAlert()
  const router = useRouter()

  // Check onboarding status when modal opens
  useEffect(() => {
    if (isOpen) {
      const hasCompletedOnboarding = Storage.getBoolean(ONBOARDING_COMPLETED_KEY) ?? false
      const isStoriesDisabled = Storage.getBoolean(STORIES_DISABLED_KEY) ?? false

      // Show onboarding if not completed and stories not disabled
      if (!hasCompletedOnboarding && !isStoriesDisabled) {
        setShowOnboarding(true)
      } else {
        setShowStoryList(false)
        setShowStoryViewers(false)
      }
    }
  }, [isOpen])

  const deleteStoryMutation = useMutation({
    mutationFn: postStorySelfExpire,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['getStoryCarousel'] })
    },
  })

  const hasStories = stories?.length > 0
  const hasMaxStories = stories?.length == 20

  const handleCompleteOnboarding = () => {
    Storage.set(ONBOARDING_COMPLETED_KEY, true)
    setShowOnboarding(false)
  }

  const handleDisableStories = async () => {
    await alert.show(
      'Disable Stories',
      'Stories will be hidden from your interface. You can re-enable them anytime in the Appearance app settings.',
      'Disable',
      () => {
        Storage.set(STORIES_DISABLED_KEY, true)
        Storage.set(ONBOARDING_COMPLETED_KEY, true)
        onDisableStories?.()
        onClose()
        router.push('/profile')
      },
      {
        useNativeModal: true,
      }
    )
  }

  const handleAddStory = () => {
    onClose()
    onAddStory()
  }

  const handleViewStories = () => {
    onClose()
    onViewStories()
  }

  const handleDeleteStory = async (storyId: string) => {
    await alert.show(
      'Delete Story',
      'Are you sure you want to delete this story? This action cannot be undone.',
      'Delete',
      () => {
        setShowStoryList(false)
        deleteStoryMutation.mutate(storyId)
        onClose()
        console.log('story delete')
      },
      {
        useNativeModal: true,
      }
    )
  }

  const handleViewStoryViewers = (storyId: string) => {
    onClose()
    router.push(`story/viewers/${storyId}`)
  }

  const handleBackFromViewers = () => {
    setShowStoryViewers(false)
    setSelectedStoryId(null)
  }

  return (
    <Sheet
      modal
      open={isOpen}
      onOpenChange={onClose}
      snapPoints={showOnboarding ? [90] : [85]}
      dismissOnSnapToBottom={!showOnboarding}
      zIndex={100_000}
    >
      <Sheet.Overlay backgroundColor="rgba(0,0,0,0.8)" />
      <Sheet.Handle backgroundColor="$gray6" />

      <Sheet.Frame backgroundColor={theme.background?.val.default} padding={0}>
        {showOnboarding ? (
          <OnboardingScreen
            onGetStarted={handleCompleteOnboarding}
            onDisable={handleDisableStories}
            theme={theme}
            username={username}
          />
        ) : showStoryList ? (
          <YStack flex={1} paddingHorizontal={20}>
            <XStack alignItems="center" justifyContent="space-between" paddingTop={20}>
              <Button
                size="$3"
                circular
                backgroundColor="transparent"
                borderColor="transparent"
                onPress={() => setShowStoryList(false)}
              >
                <Feather
                  name="arrow-left"
                  size={20}
                  color={theme.color?.val?.tertiary.val}
                />
              </Button>

              <Text color={theme.color.val?.default.val} fontSize={18} fontWeight="bold">
                Your Stories
              </Text>

              <Stack width={40} />
            </XStack>

            <Separator borderColor={theme.borderColor?.val?.default?.val} my="$3" />

            <ScrollView showsVerticalScrollIndicator={false}>
              <YStack space={12} paddingBottom={100}>
                {stories.map((story) => (
                  <StoryListItem
                    key={story.id}
                    story={story}
                    onDelete={handleDeleteStory}
                    onStoryViews={handleViewStoryViewers}
                  />
                ))}
              </YStack>
            </ScrollView>
          </YStack>
        ) : (
          <YStack flex={1} paddingHorizontal={20}>
            <XStack
              alignItems="center"
              justifyContent="space-between"
              paddingVertical={20}
            >
              <Text color={theme.color?.val.default.val} fontSize={18} fontWeight="bold">
                Your Story
              </Text>

              <Button
                size="$3"
                circular
                backgroundColor="transparent"
                borderColor="transparent"
                onPress={onClose}
              >
                <Feather name="x" size={20} color={theme.color?.val.default.val} />
              </Button>
            </XStack>

            <YStack flex={1} alignItems="center" justifyContent="center" space={32}>
              {hasStories ? (
                <YStack alignItems="center" space={20}>
                  <StackedStoriesPreview
                    stories={stories}
                    onTap={() => setShowStoryList(true)}
                  />
                  <Pressable onPress={() => setShowStoryList(true)}>
                    <Text
                      color={theme.color?.val.tertiary.val}
                      fontSize={18}
                      textAlign="center"
                    >
                      Tap to manage your {stories.length} stor
                      {stories.length === 1 ? 'y' : 'ies'}
                    </Text>
                  </Pressable>
                </YStack>
              ) : (
                <StoriesExplanation />
              )}
            </YStack>

            <YStack paddingBottom={Platform.OS === 'android' ? 20 : 40} space={12}>
              {!hasMaxStories && (
                <Button
                  size="$4"
                  backgroundColor={theme.background?.val.tertiary.val}
                  borderColor="$blue11"
                  borderRadius={25}
                  onPress={handleAddStory}
                >
                  <XStack alignItems="center" space={8}>
                    <Feather name="plus" size={18} color={theme.color?.val.default.val} />
                    <Text color={theme.color?.val.default.val} fontWeight="bold">
                      Add to Story
                    </Text>
                  </XStack>
                </Button>
              )}

              {hasStories && (
                <Button
                  size="$4"
                  backgroundColor="transparent"
                  borderColor="$gray6"
                  borderRadius={25}
                  onPress={handleViewStories}
                >
                  <XStack alignItems="center" space={8}>
                    <Feather
                      name="eye"
                      size={18}
                      color={theme.color?.val.secondary.val}
                    />
                    <Text color={theme.color?.val.default.val} fontWeight="bold">
                      View Your Stories
                    </Text>
                  </XStack>
                </Button>
              )}
            </YStack>
          </YStack>
        )}
      </Sheet.Frame>
    </Sheet>
  )
}
