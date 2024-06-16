import { Stack, router, useNavigation } from 'expo-router'
import { Text, View, Form, Button, YStack, Label, Input, Image, XStack } from 'tamagui'
import { useAuth } from '@state/AuthProvider'
import { ActivityIndicator, FlatList, SafeAreaView } from 'react-native'
import { useState } from 'react'
import { StatusBar } from 'expo-status-bar'
import { useQuery, useInfiniteQuery } from '@tanstack/react-query'
import { getOpenServers } from 'src/lib/api'
import { enforceLen, prettyCount } from 'src/utils'

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
      px="$2"
      mb="$3"
      size="$5"
      borderWidth={1}
      borderRadius={40}
      borderColor="$gray6"
    >
      <XStack
        gap="$3"
        justifyContent="space-between"
        alignItems="center"
        overflow="hidden"
      >
        {item.user_count > 100 ? (
          <Image
            source={{ uri: item.header_thumbnail }}
            width={100}
            height={40}
            borderRadius={20}
          />
        ) : (
          <Image
            source={require('../../../assets/icon.png')}
            width={40}
            height={40}
            borderRadius={20}
          />
        )}
        <YStack gap="$1" flexGrow={1}>
          <Text
            fontSize={item.domain.length > 20 ? '$5' : '$6'}
            fontWeight="bold"
            flexWrap="wrap"
          >
            {enforceLen(item.domain, 30, true, 'middle')}
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
        ListFooterComponent={<View h={100} />}
        contentContainerStyle={{ flexGrow: 1, marginHorizontal: 10 }}
      />
    </SafeAreaView>
  )
}
