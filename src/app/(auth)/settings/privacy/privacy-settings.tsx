import { useQuery, useQueryClient } from '@tanstack/react-query'
import { router, Stack } from 'expo-router'
import { ActivityIndicator, Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Switch } from 'src/components/form/Switch'
import { useProfileMutation } from 'src/hooks/mutations/useProfileMutation'
import { getSelfAccount } from 'src/lib/api'
import { Storage } from 'src/state/cache'
import { ScrollView, Separator, Text, useTheme, View, XStack, YStack } from 'tamagui'

interface RenderSwitchProps {
  title: string
  description: string
  initialValue: boolean
  onCheckedChange: (checked: boolean) => void
}

const RenderSwitch = (props: RenderSwitchProps) => {
  const theme = useTheme()
  return (
    <YStack>
      <XStack
        py="$3"
        px="$4"
        bg={theme.background?.val.default.val}
        justifyContent="space-between"
      >
        <YStack maxWidth="75%" gap="$2">
          <Text fontSize="$5" fontWeight={'bold'} color={theme.color?.val.default.val}>
            {props.title}
          </Text>
          <Text fontSize="$3" color={theme.color?.val.tertiary.val}>
            {props.description}
          </Text>
        </YStack>
        <Switch
          size="$3"
          defaultChecked={props.initialValue}
          onCheckedChange={props.onCheckedChange}
        >
          <Switch.Thumb animation="quicker" />
        </Switch>
      </XStack>
      <Separator borderColor={theme.borderColor?.val.default.val} />
    </YStack>
  )
}

export default function Page() {
  const instance = Storage.getString('app.instance')!.toLowerCase()
  const queryClient = useQueryClient()
  const theme = useTheme()

  const { profileMutation } = useProfileMutation({
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['getSelfAccount'] }),
  })

  const privateAccountSwitch = (checked: boolean) => {
    const warningMessage = !checked
      ? 'Are you sure you want to make your account public?'
      : 'Are you sure you want to make your account private?'
    Alert.alert('Confirm', warningMessage, [
      {
        text: 'Cancel',
        onPress: () => {
          router.back()
        },
        style: 'cancel',
      },
      {
        text: 'Confirm',
        onPress: () => {
          profileMutation.mutate({ locked: checked })
        },
        style: 'destructive',
      },
    ])
  }

  const {
    isPending,
    isLoading,
    isError,
    error,
    data: profile,
  } = useQuery({
    queryKey: ['getSelfAccount'],
    queryFn: getSelfAccount,
  })

  if (isPending || isLoading) {
    return (
      <View p="$4">
        <ActivityIndicator color={theme.color?.val.default.val} />
      </View>
    )
  }

  if (isError) {
    return (
      <View p="$4">
        <Text>Error: {error?.message}</Text>
      </View>
    )
  }

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['left']}>
      <Stack.Screen
        options={{
          title: 'Privacy',
          headerBackTitle: 'Back',
        }}
      />
      <ScrollView flexGrow={1}>
        <YStack gap="$1">
          <RenderSwitch
            title="Private Account"
            description="Limit your posts and account visibility to your followers, and curate new
                follow requests"
            initialValue={profile.locked}
            onCheckedChange={(checked) => privateAccountSwitch(checked)}
          />

          <RenderSwitch
            title="Hide Followers"
            description="Hide your followers collection, only you will be able to see who follows
                you"
            initialValue={!profile.settings.show_profile_follower_count}
            onCheckedChange={(checked) =>
              profileMutation.mutate({ show_profile_follower_count: !checked })
            }
          />

          <RenderSwitch
            title="Hide Following"
            description="Hide your following collection, only you will be able to see who you are
                following"
            initialValue={!profile.settings.show_profile_following_count}
            onCheckedChange={(checked) =>
              profileMutation.mutate({ show_profile_following_count: !checked })
            }
          />

          <RenderSwitch
            title="Allow Discovery"
            description="Allow your account and posts to be recommended to other accounts"
            initialValue={profile.settings.is_suggestable}
            onCheckedChange={(checked) =>
              profileMutation.mutate({ is_suggestable: checked })
            }
          />

          <RenderSwitch
            title="Filter DMs"
            description="Filter Direct Messages from accounts you don't follow"
            initialValue={!profile.settings.public_dm}
            onCheckedChange={(checked) => profileMutation.mutate({ public_dm: !checked })}
          />

          <RenderSwitch
            title="Disable Search Engine indexing"
            description="When your account is visible to search engines, your information can be
                crawled and stored by search engines"
            initialValue={!profile.settings.crawlable}
            onCheckedChange={(checked) => profileMutation.mutate({ crawlable: !checked })}
          />

          <RenderSwitch
            title="Disable embeds"
            description="Disable profile and post embeds to prevent you or others from embedding on
                other websites"
            initialValue={profile.settings.disable_embeds}
            onCheckedChange={(checked) =>
              profileMutation.mutate({ disable_embeds: checked })
            }
          />

          <RenderSwitch
            title="Atom Feed"
            description={`Enable your public Atom feed, available at ${instance}/users/${profile?.username}.atom`}
            initialValue={profile.settings.show_atom}
            onCheckedChange={(checked) => profileMutation.mutate({ show_atom: checked })}
          />
        </YStack>
      </ScrollView>
    </SafeAreaView>
  )
}
