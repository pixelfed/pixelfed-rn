import React, { useState, useMemo } from 'react'
import { StyleSheet } from 'react-native'
import { Text, View, Button, YStack, XStack } from 'tamagui'
import {
  FlatList,
  Keyboard,
  ListRenderItemInfo,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
} from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { useQuery } from '@tanstack/react-query'
import { Stack, useRouter } from 'expo-router'
import { useAuth } from '@state/AuthProvider'
import { Feather } from '@expo/vector-icons'
import { getOpenServers } from 'src/lib/api'
import { enforceLen, prettyCount } from 'src/utils'
import FastImage from 'react-native-fast-image'
import { PressableOpacity } from 'react-native-pressable-opacity'
import { PixelfedServer } from 'src/lib/api-types'

export default function Register() {
  const { data } = useQuery({
    queryKey: ['openServers'],
    queryFn: getOpenServers,
  })

  const router = useRouter()

  const { login, isLoading } = useAuth()

  const [searchQuery, setSearchQuery] = useState('')

  const handleLogin = (server: string) => {
    login(server)
  }

  const manualLogin = () => {
    router.push('/manualLogin')
  }

  const filteredData = useMemo(() => {
    if (!data) return []
    return data.filter((item) =>
      item.domain.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [data, searchQuery])

  const RenderItem = ({ item }: ListRenderItemInfo<PixelfedServer>) => (
    <Button
      onPress={() => handleLogin(item.domain)}
      px="$2"
      mb="$3"
      size="$5"
      bg="$gray12"
      borderWidth={1}
      borderRadius={40}
      borderColor="$gray12"
    >
      <XStack
        gap="$3"
        justifyContent="space-between"
        alignItems="center"
        overflow="hidden"
      >
        {item.user_count > 1400 ? (
          <FastImage
            source={{ uri: item.header_thumbnail }}
            style={{ width: 100, height: 40, borderRadius: 20 }}
          />
        ) : (
          <FastImage
            source={require('../../../assets/icon.png')}
            style={{ width: 40, height: 40, borderRadius: 20 }}
          />
        )}
        <YStack gap="$1" flexGrow={1}>
          <Text
            fontSize={item.domain.length > 20 ? '$5' : '$6'}
            fontWeight="bold"
            flexWrap="wrap"
            color="white"
          >
            {enforceLen(item.domain, 30, true, 'middle')}
          </Text>
          <XStack gap="$2">
            <Text fontSize="$3" color="$gray5">
              {prettyCount(item.user_count)} users
            </Text>

            <Text fontSize="$3" color="$gray10">
              v{enforceLen(item.version, 20, true)}
            </Text>
          </XStack>
        </YStack>
        <Text pr="$3" color="$blue8" fontWeight={'bold'}>
          Login
        </Text>
      </XStack>
    </Button>
  )

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'black' }}>
      <StatusBar style="light" />
      <Stack.Screen options={{ headerShown: false }} />
      <View justifyContent="center" alignItems="center" mb="$5">
        <Text fontSize={30} mt="$6" letterSpacing={-1} color="white">
          Select your server
        </Text>
      </View>
      <View style={styles.searchContainer}>
        <Feather name="search" size={20} color="#000" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search servers..."
          value={searchQuery}
          placeholderTextColor={'#999'}
          onChangeText={setSearchQuery}
        />
        {searchQuery ? (
          <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
            <Feather name="x" size={20} color="#ccc" />
          </TouchableOpacity>
        ) : null}
      </View>

      <View mx="$3" mb="$3">
        <PressableOpacity onPress={() => manualLogin()}>
          <Text
            textAlign="center"
            color="$gray9"
            allowFontScaling={false}
            fontSize="$3"
            fontWeight="bold"
            py="$2"
          >
            Tap here to login with a server domain
          </Text>
        </PressableOpacity>
      </View>
      <FlatList
        data={filteredData}
        renderItem={RenderItem}
        ListFooterComponent={<View h={100} />}
        onScroll={() => Keyboard.dismiss()}
        contentContainerStyle={{
          flexGrow: 1,
          marginHorizontal: 10,
          backgroundColor: '#000',
        }}
        keyExtractor={(item) => item.domain}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    marginBottom: 10,
    position: 'relative',
    backgroundColor: '#000',
  },
  searchInput: {
    flex: 1,
    fontSize: 19,
    height: 50,
    borderColor: '#444',
    borderWidth: 1,
    borderRadius: 30,
    paddingLeft: 50,
    paddingRight: 50,
    color: '#fff',
    backgroundColor: '#000',
  },
  searchIcon: {
    position: 'absolute',
    left: 30,
    zIndex: 2,
    color: '#999',
  },
  clearButton: {
    position: 'absolute',
    right: 30,
    zIndex: 2,
  },
})
