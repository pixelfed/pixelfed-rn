import React, { useState, useMemo } from 'react'
import { Text, View, Button, YStack, Image, XStack } from 'tamagui'
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
} from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { useQuery } from '@tanstack/react-query'
import { Stack } from 'expo-router'
import { useAuth } from '@state/AuthProvider'
import { Feather } from '@expo/vector-icons'
import { getOpenServers } from 'src/lib/api'
import { enforceLen, prettyCount } from 'src/utils'

export default function Register() {
  const { data } = useQuery({
    queryKey: ['openServers'],
    queryFn: getOpenServers,
  })

  const { login, isLoading } = useAuth()

  const [searchQuery, setSearchQuery] = useState('')

  const handleLogin = (server) => {
    login(server)
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
      bg="$gray1"
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
      <View style={styles.searchContainer}>
        <Feather name="search" size={20} color="#000" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search servers..."
          value={searchQuery}
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
        contentContainerStyle={{ flexGrow: 1, marginHorizontal: 10 }}
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
  },
  searchInput: {
    flex: 1,
    fontSize: 19,
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 30,
    paddingLeft: 50,
    paddingRight: 50,
    backgroundColor: '#fff',
  },
  searchIcon: {
    position: 'absolute',
    left: 30,
    zIndex: 2,
  },
  clearButton: {
    position: 'absolute',
    right: 30,
    zIndex: 2,
  },
}
