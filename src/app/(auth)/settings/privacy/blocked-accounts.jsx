import { Link, Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScrollView, Text, View, Group, Button, XStack, YStack, Separator } from "tamagui";
import { Feather } from '@expo/vector-icons'
import { useQuery } from '@tanstack/react-query'
import { getBlocks } from 'src/lib/api'
import { FlatList } from "react-native";
import FastImage from 'react-native-fast-image'

export default function Page() {
    const RenderItem = ({item}) => (
        <XStack px="$5" py="$3" bg="white" alignItems="center" gap="$3" flexWrap="wrap">
            <FastImage
                source={{uri: item?.avatar}}
                style={{width: 40, height: 40, borderRadius: 40, borderWidth: 1, borderColor: '#ccc'}}
            />
            <Text fontWeight={'bold'} flexShrink={1} maxWidth={'80%'}>{item.acct}</Text>
        </XStack>
    )

    const RenderSeparator = () => <Separator />

    const {isPending, isError, data, error} = useQuery({ 
        queryKey: ['blockedAccounts'], 
        queryFn: getBlocks 
    })

    return (
        <SafeAreaView style={{ flex: 1 }} edges={['bottom']}>
            <Stack.Screen
                options={{
                    title: 'Blocked Accounts',
                    headerBackTitle: 'Back',
                }}
            />
            <FlatList
                data={data}
                renderItem={RenderItem}
                ItemSeparatorComponent={RenderSeparator}
            />
        </SafeAreaView>
    )
}