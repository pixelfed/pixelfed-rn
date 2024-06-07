import { Link, Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScrollView, Text, View, Group, Button, XStack, YStack, Separator } from "tamagui";
import { Feather } from '@expo/vector-icons'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getSelfAccount, updateCredentials } from 'src/lib/api';
import { ActivityIndicator, FlatList } from "react-native";
import FastImage from 'react-native-fast-image'
import { Storage } from 'src/state/cache'
import { Switch } from 'src/components/form/Switch'

export default function Page() {
    const instance = Storage.getString('app.instance').toLowerCase()
    // const profile = JSON.parse(Storage.getString('user.profile'))
    const queryClient = useQueryClient()

    const RenderSwitch = ({title, description, children}) => {
        return (<>
        <XStack py="$3" px="$4" bg='white' justifyContent="space-between">
            <YStack maxWidth='75%' gap="$2">
                <Text fontSize="$5" fontWeight={'bold'}>{title}</Text>
                <Text fontSize="$3" color="$gray9">{description}</Text>
            </YStack>
            {children}
        </XStack>
        <Separator />
        </>)
    }

    const mutation = useMutation({
        mutationFn: async (data) => {
            return await updateCredentials(data)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['getSelfAccount'] })
        }
    })

    const {
        isPending,
        isLoading,
        isError,
        error,
        data: profile
      } = useQuery({
        queryKey: ['getSelfAccount'],
        queryFn: getSelfAccount,
    })

    if (isPending || isLoading) {
        return <View p="$4"><ActivityIndicator /></View>
    }
    
    if (isError) {
        return (
            <View p="$4">
                <Text>Error: {error.message}</Text>
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
                    <XStack py="$3" px="$4" bg='white' justifyContent="space-between">
                        <YStack maxWidth='75%' gap="$2">
                            <Text fontSize="$5" fontWeight={'bold'}>Private Account</Text>
                            <Text fontSize="$3" color="$gray9">Limit your posts and account visibility to your followers, and curate new follow requests</Text>
                        </YStack>
                        <Switch 
                            size="$3" 
                            defaultChecked={profile.locked}
                            onCheckedChange={(checked) => mutation.mutate({locked: checked})}
                        >
                            <Switch.Thumb animation="quicker" />
                        </Switch>
                    </XStack>
                    <Separator />
                    <XStack py="$3" px="$4" bg='white' justifyContent="space-between">
                        <YStack maxWidth='75%' gap="$2">
                            <Text fontSize="$5" fontWeight={'bold'}>Hide Followers</Text>
                            <Text fontSize="$3" color="$gray9">Hide your followers collection, only you will be able to see who follows you</Text>
                        </YStack>
                        <Switch 
                            size="$3" 
                            defaultChecked={!profile.settings.show_profile_follower_count}
                            onCheckedChange={(checked) => mutation.mutate({show_profile_follower_count: !checked})}
                        >
                            <Switch.Thumb animation="quicker" />
                        </Switch>
                    </XStack>
                    <Separator />
                    <XStack py="$3" px="$4" bg='white' justifyContent="space-between">
                        <YStack maxWidth='75%' gap="$2">
                            <Text fontSize="$5" fontWeight={'bold'}>Hide Following</Text>
                            <Text fontSize="$3" color="$gray9">Hide your following collection, only you will be able to see who you are following</Text>
                        </YStack>
                        <Switch 
                            size="$3" 
                            defaultChecked={!profile.settings.show_profile_following_count}
                            onCheckedChange={(checked) => mutation.mutate({show_profile_following_count: !checked})}
                        >
                            <Switch.Thumb animation="quicker" />
                        </Switch>
                    </XStack>
                    <Separator />
                    <XStack py="$3" px="$4" bg='white' justifyContent="space-between">
                        <YStack maxWidth='75%' gap="$2">
                            <Text fontSize="$5" fontWeight={'bold'}>Allow Discovery</Text>
                            <Text fontSize="$3" color="$gray9">Allow your account and posts to be recommended to other accounts</Text>
                        </YStack>
                        <Switch 
                            size="$3" 
                            defaultChecked={profile.settings.crawlable}
                            onCheckedChange={(checked) => mutation.mutate({crawlable: checked})}
                        >
                            <Switch.Thumb animation="quicker" />
                        </Switch>
                    </XStack>
                    <Separator />
                    <XStack py="$3" px="$4" bg='white' justifyContent="space-between">
                        <YStack maxWidth='75%' gap="$2">
                            <Text fontSize="$5" fontWeight={'bold'}>Filter DMs</Text>
                            <Text fontSize="$3" color="$gray9">Filter Direct Messages from accounts you don't follow</Text>
                        </YStack>
                        <Switch 
                            size="$3" 
                            defaultChecked={!profile.settings.public_dm}
                            onCheckedChange={(checked) => mutation.mutate({public_dm: !checked})}
                        >
                            <Switch.Thumb animation="quicker" />
                        </Switch>
                    </XStack>
                    <Separator />
                    <XStack py="$3" px="$4" bg='white' justifyContent="space-between">
                        <YStack maxWidth='75%' gap="$2">
                            <Text fontSize="$5" fontWeight={'bold'}>Include public posts in search results</Text>
                            <Text fontSize="$3" color="$gray9">Your public posts may appear in search results on Pixelfed and Mastodon. People who have interacted with your posts may be able to search them regardless. Not available when your account is private</Text>
                        </YStack>
                        <Switch 
                            size="$3" 
                            defaultChecked={!profile.settings.indexable}
                            onCheckedChange={(checked) => mutation.mutate({indexable: !checked})}
                        >
                            <Switch.Thumb animation="quicker" />
                        </Switch>
                    </XStack>
                    <Separator />
                    <XStack py="$3" px="$4" bg='white' justifyContent="space-between">
                        <YStack maxWidth='75%' gap="$2">
                            <Text fontSize="$5" fontWeight={'bold'}>Disable Search Engine indexing</Text>
                            <Text fontSize="$3" color="$gray9">When your account is visible to search engines, your information can be crawled and stored by search engines</Text>
                        </YStack>
                        <Switch 
                            size="$3" 
                            defaultChecked={!profile.settings.crawlable}
                            onCheckedChange={(checked) => mutation.mutate({crawlable: !checked})}
                        >
                            <Switch.Thumb animation="quicker" />
                        </Switch>
                    </XStack>
                    <Separator />
                    <XStack py="$3" px="$4" bg='white' justifyContent="space-between">
                        <YStack maxWidth='75%' gap="$2">
                            <Text fontSize="$5" fontWeight={'bold'}>Disable embeds</Text>
                            <Text fontSize="$3" color="$gray9">Disable profile and post embeds to prevent you or others from embedding on other websites</Text>
                        </YStack>
                        <Switch 
                            size="$3" 
                            defaultChecked={profile.settings.disable_embeds}
                            onCheckedChange={(checked) => mutation.mutate({disable_embeds: checked})}
                        >
                            <Switch.Thumb animation="quicker" />
                        </Switch>
                    </XStack>
                    <Separator />
                    {/* <XStack py="$3" px="$4" bg='white' justifyContent="space-between">
                        <YStack maxWidth='75%' gap="$2">
                            <Text fontSize="$5" fontWeight={'bold'}>Block AI Crawlers</Text>
                            <Text fontSize="$3" color="$gray9">Block known AI crawlers from your profile and posts</Text>
                        </YStack>
                        <Switch 
                            size="$3" 
                            defaultChecked={true}
                            onCheckedChange={(checked) => mutation.mutate({disable_embeds: checked})}
                        >
                            <Switch.Thumb animation="quicker" />
                        </Switch>
                    </XStack>
                    <Separator /> */}
                    <XStack py="$3" px="$4" bg='white' justifyContent="space-between">
                        <YStack maxWidth='75%' gap="$2">
                            <Text fontSize="$5" fontWeight={'bold'}>Atom Feed</Text>
                            <Text fontSize="$3" color="$gray9">Enable your public Atom feed, available at {instance}/users/{profile?.username}.atom</Text>
                        </YStack>
                        <Switch size="$3" defaultChecked={true}>
                            <Switch.Thumb />
                        </Switch>
                    </XStack>
                </YStack>
            </ScrollView>
        </SafeAreaView>
    )
}