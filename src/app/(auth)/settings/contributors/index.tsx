import { Stack } from 'expo-router'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import {
    H5,
    H4,
    ListItem,
    ScrollView,
    Separator,
    YStack,
    useTheme,
    Text,
    YGroup,
} from 'tamagui'

export default function Screen() {
    const theme = useTheme()

    const contributors = {
        "Double Platinum Sponsor": ["Ben", "Perkins", "@onequest"],
        "Platinum Sponsors": ["Ghost", "Ani Betts"],
        "Diamond Sponsors": ["Revenni Inc",
            "Chris Graham",
            "Boomland Jenkins",
            "PrivacySafe.app",
            "Ma’moun Diraneyya",
            "Fedica",
            "iVeryAm"],
        "Gold Sponsors": ["dummy", "dummy", "dummy", "dummy", "dummy", "dummy", "dummy"],
        "Sponsors": ["dummy", "dummy", "dummy", "dummy", "dummy", "dummy"],
    }

    return (
        <SafeAreaView
            style={{ flex: 1, backgroundColor: theme.background?.val.default.val }}
            edges={['bottom']}
        >
            <Stack.Screen
                options={{
                    title: 'Contributors',
                    headerBackTitle: 'Back',
                }}
            />
            <ScrollView flexShrink={1} showsVerticalScrollIndicator={false}>
                <YStack p="$5" gap="$4">
                    <H4 textAlign="center" color={theme.color?.val.default.val} mb="$4">
                        A Heartfelt Thank You to Our Amazing Contributors!
                    </H4>
                    {Object.entries(contributors).map(([sponsorType, names]) => (
                        <YGroup borderWidth={1} borderColor={theme.borderColor?.val.default.val} key={sponsorType} borderRadius="$8"
                            separator={<Separator borderColor={theme.borderColor?.val.default.val} />}>
                            <YGroup.Item>
                                <ListItem jc="center">
                                    <H5 color={theme.color?.val.default.val}>{sponsorType}</H5>
                                </ListItem>
                            </YGroup.Item>
                            {names.map((name, index) => (
                                <YGroup.Item key={index}>
                                    <ListItem>
                                        <Text color={theme.color?.val.default.val} textAlign="center">
                                            {name}
                                        </Text>
                                    </ListItem>
                                </YGroup.Item>
                            ))}
                        </YGroup>
                    ))}
                </YStack>
            </ScrollView>
        </SafeAreaView>
    )
}
