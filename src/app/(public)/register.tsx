import { Stack, router, useNavigation } from 'expo-router'
import { Text, View, Form, Button, YStack, Label, Input, Image, XStack } from 'tamagui'
import { useAuth } from '@state/AuthProvider'
import { ActivityIndicator, FlatList, SafeAreaView } from 'react-native'
import { useState } from 'react'
import { StatusBar } from 'expo-status-bar'
import { useQuery, useInfiniteQuery } from '@tanstack/react-query'
import { getOpenServers } from 'src/lib/api'
import { prettyCount } from 'src/utils'

export default function Register() {
    const { data } = useQuery({
        queryKey: ['openServers'],
        queryFn: getOpenServers,
      })

    const RenderItem = ({item}) => (
        <View mx="$3" mb="$4" borderWidth={1} borderColor="$gray6" borderRadius={20}>
            <XStack gap="$3" alignItems='center'>
                <Image
                    source={{uri: item.header_thumbnail}}
                    width={100}
                    height={50}
                    borderRadius={20}
                />
                <YStack gap="$1" flexGrow={1}>
                    <Text fontSize="$7">{ item.domain }</Text>
                    <Text fontSize="$2" color="$gray10">{ prettyCount(item.user_count) } users</Text>
                </YStack>
                <Text pr="$3" color="$blue8" fontWeight={'bold'}>Join</Text>
            </XStack>
        </View>
    )

    return (
        <SafeAreaView edges={['top']}>
            <StatusBar style="dark" />
            <Stack.Screen
                options={{headerShown: false}}
            />
            <View justifyContent='center' alignItems='center' mb="$5">
                <Text fontSize={30} mt="$6" letterSpacing={-1}>
                    Select a community to join
                </Text>
            </View>

            <FlatList
                data={data}
                renderItem={RenderItem}
                contentContainerStyle={{flexGrow: 1}}
            />
        </SafeAreaView>
    )
}