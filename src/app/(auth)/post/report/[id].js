import { Stack, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScrollView, Text, View, XStack, YStack } from "tamagui";
import { Feather } from '@expo/vector-icons'

export default function Page() {
    const { id } = useLocalSearchParams()

    const reportTypes = [
        { name: 'unlike', title: 'I just don\'t like it' },
        { name: 'spam', title: 'It\'s spam' },
        { name: 'sensitive', title: 'Nudity or sexual activity' },
        { name: 'abusive', title: 'Bullying or harassment' },
        { name: 'underage', title: 'I think this account is underage' },
        { name: 'violence', title: 'Violence or dangerous organizations' },
        { name: 'copyright', title: 'Copyright infringement' },
        { name: 'impersonation', title: 'Impersonation' },
        { name: 'scam', title: 'Scam or fraud' },
        { name: 'terrorism', title: 'Terrorism or terrorism-related content' },
    ]

    const RenderOption = ({title}) => (
        <XStack 
            px="$5" 
            py="$3"
            bg="white"
            borderTopWidth={1} 
            borderColor="$gray7"
            justifyContent="space-between"
            alignItems="center">
            <Text fontSize="$5">{title}</Text>
            <Feather name="chevron-right" size={20} color="#ccc" />
        </XStack>
    )

    return (
        <SafeAreaView flex={1} edges={['bottom']}>
            <Stack.Screen
                options={{
                    title: 'Report Post',
                    headerBackTitle: 'Back',
                }}
            />
            <ScrollView flexGrow={1}>
                <YStack p="$5" bg="white" gap="$3">
                    <Text fontSize="$7" fontWeight="bold">Why are you reporting this post?</Text>
                    <Text fontSize="$5" color="$gray9">Your report is anonymous, except if you're reporting an intellectual property infringement. If someone is in immediate danger, call the local emergency services - don't wait.</Text>
                </YStack>
                { reportTypes.map((r) => (<RenderOption key={r.name} title={r.title} />))}
                {/* <RenderOption title="I just don't like it" />
                <RenderOption title="It's spam" />
                <RenderOption title="Nudity or sexual activity" />
                <RenderOption title="Hate speech or symbols" />
                <RenderOption title="Violence or dangerous organizations" />
                <RenderOption title="Bullying or harassment" />
                <RenderOption title="I think this account is underage" />
                <RenderOption title="Copyright infringement" /> */}
            </ScrollView>
        </SafeAreaView>
    )
}