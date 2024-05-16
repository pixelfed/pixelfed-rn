import { useCallback, useEffect, useState } from 'react'
import { FlatList, StyleSheet, Pressable, ActivityIndicator } from 'react-native'
import { Text, View, XStack, Select, Adapt, Sheet, SheetContents } from 'tamagui'
import FeedPost from 'src/components/post/FeedPost'
import { StatusBar } from 'expo-status-bar'
import { Feather } from '@expo/vector-icons'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Link, Stack } from 'expo-router'
import { useInfiniteQuery } from '@tanstack/react-query'
import { fetchHomeFeed } from 'src/lib/api'

export default (FeedHeader = ({ title = 'Home' }) => {
  return (
    <XStack
      px="$3"
      pb="$3"
      bg="white"
      justifyContent="space-between"
      alignItems="center"
      zIndex={100}
      borderBottomWidth={0.5}
      borderBottomColor="$gray5"
    >
      <XStack alignItems="center" gap="$1">
        <Text fontSize={30} fontWeight="bold" letterSpacing={-1}>
          {title}
        </Text>
      </XStack>
      <XStack gap="$5">
        <Link href="/notifications" asChild>
          <Pressable>
            <Feather name="heart" size={26} />
          </Pressable>
        </Link>
        <Link href="/chats" asChild>
          <Pressable>
            <Feather name="mail" size={26} />
          </Pressable>
        </Link>
        <Link href="/search" asChild>
          <Pressable>
            <Feather name="search" size={26} />
          </Pressable>
        </Link>
      </XStack>
    </XStack>
  )
})
