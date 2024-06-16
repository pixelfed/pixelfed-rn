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

  const { login, isLoading } = useAuth()

  const handleLogin = (server) => {
    login(server)
  }

  const RenderItem = ({ item }) => (
    <Button
      onPress={() => handleLogin(item.domain)}
      px="$3"
      mb="$3"
      size="$5"
      borderWidth={1}
      borderColor="$gray6"
    >
      <XStack
        gap="$3"
        justifyContent="space-between"
        alignItems="center"
        overflow="hidden"
      >
        <Image
          source={{ uri: item.header_thumbnail }}
          width={100}
          height={40}
          borderRadius={20}
        />
        <YStack gap="$1" flexGrow={1}>
          <Text fontSize="$7" fontWeight="bold">
            {item.domain}
          </Text>
          <Text fontSize="$3" color="$gray12">
            {prettyCount(item.user_count)} users
          </Text>
        </YStack>
        <Text pr="$3" color="$blue9" fontWeight={'bold'}>
          Login
        </Text>
      </XStack>
    </Button>
  )

  return (
    <SafeAreaView edges={['top']}>
      <StatusBar style="dark" />
      <Stack.Screen options={{ headerShown: false }} />
      <View justifyContent="center" alignItems="center" mb="$5">
        <Text fontSize={30} mt="$6" letterSpacing={-1}>
          Select your server
        </Text>
      </View>

      <FlatList
        data={data}
        renderItem={RenderItem}
        contentContainerStyle={{ flexGrow: 1, marginHorizontal: 30 }}
      />
    </SafeAreaView>
  )
}
