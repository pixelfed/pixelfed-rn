import { Feather } from '@expo/vector-icons'
import { useAuth } from '@state/AuthProvider'
import { useQuery } from '@tanstack/react-query'
import { Stack, useRouter } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import React, { useState, useMemo } from 'react'
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Keyboard,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
} from 'react-native'
import FastImage from 'react-native-fast-image'
import { PressableOpacity } from 'react-native-pressable-opacity'
import { getOpenServers } from 'src/lib/api'
import { enforceLen, prettyCount } from 'src/utils'
import { Button, Image, Text, View, XStack, YStack } from 'tamagui'

export default function Register() {
  const { data } = useQuery({
    queryKey: ['openServersSelector'],
    queryFn: getOpenServers,
  })

  const router = useRouter()

  const { login, isLoading } = useAuth()

  const [searchQuery, setSearchQuery] = useState('')

  const handleLogin = (server) => {
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

  const RenderItem = ({ item }) => (
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
        {item.user_count > 200 ? (
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
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: 'black' }}>
      <StatusBar style="light" />
      <Stack.Screen options={{ headerShown: false }} />
      <View justifyContent="center" alignItems="center" mb="$5">
        <Text fontSize={30} mt="$6" letterSpacing={-1} color="white">
          Select your server
        </Text>

        <Text fontSize={17} px="$5" pt="$3" letterSpacing={-0.1} color="$gray9">
          Pixelfed servers are like neighborhoods in a global photo-sharing community.
          Each server has its own community and style, but you can connect with people
          from any server.
        </Text>
      </View>

      <View mx="$3" mb="$3">
        <Button
          size="$5"
          themeInverse={true}
          borderRadius={30}
          onPress={() => manualLogin()}
        >
          <Text
            textAlign="center"
            color="$blue9"
            allowFontScaling={false}
            fontSize="$3"
            fontWeight={300}
            py="$2"
          >
            Tap here to login with a custom server
          </Text>
        </Button>
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

const styles = {
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
}
