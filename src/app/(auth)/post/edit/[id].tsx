import { useQuery } from '@tanstack/react-query'
import { router, Stack, useLocalSearchParams, useNavigation } from 'expo-router'
import React, { useCallback, useLayoutEffect, useMemo, useState } from 'react'
import {
  ActivityIndicator,
  Dimensions,
  Keyboard,
  Platform,
  StyleSheet,
} from 'react-native'
import { PressableOpacity } from 'react-native-pressable-opacity'
import { SafeAreaView } from 'react-native-safe-area-context'
import UserAvatar from 'src/components/common/UserAvatar'
import { Switch } from 'src/components/form/Switch'
import ImageComponent from 'src/components/ImageComponent'
import { editPostMedia, getInstanceV1, getStatusById, putEditPost } from 'src/lib/api'
import { useUserCache } from 'src/state/AuthProvider'
import { ScrollView, Text, TextArea, useTheme, View, XStack, YStack } from 'tamagui'

const SCREEN_HEIGHT = Dimensions.get('screen').height

const RenderItem = React.memo(({ item, onUpdateMediaAlt }) => {
  const theme = useTheme()
  return (
    <XStack m="$3" gap="$3">
      {item.type === 'image' ? (
        <ImageComponent
          placeholder={{ blurhash: item?.blurhash || '' }}
          source={{ uri: item.url }}
          style={{ width: 100, height: 160, borderRadius: 5 }}
          contentFit={'cover'}
        />
      ) : (
        <View w={100} h={160} bg="$gray8"></View>
      )}
      <YStack flexGrow={1} width="70%" gap="$2">
        <Text fontSize="$3" allowFontScaling={false} color={theme.color?.val.default.val}>
          Media Alt Text
        </Text>

        <TextArea
          size="$4"
          fontSize={Platform.OS === 'ios' ? '$7' : '$5'}
          borderWidth={1}
          borderColor={theme.borderColor?.val.default.val}
          color={theme.color?.val.default.val}
          flexGrow={1}
          defaultValue={item.description}
          onChangeText={(text) => onUpdateMediaAlt(item.id, text)}
          maxLength={1000}
          backgroundColor={theme.background?.val.tertiary.val}
          numberOfLines={4}
          rows={4}
          multiline={true}
          textAlignVertical="top"
          placeholder="Add descriptive alt text to describe your media here..."
          placeholderTextColor={'#ccc'}
        />

        <XStack justifyContent="flex-end" alignItems="center">
          <Text color={theme.color?.val.tertiary.val}>
            {item?.description ? item?.description?.length : '0'}/1000
          </Text>
        </XStack>
      </YStack>
    </XStack>
  )
})

export default function Page() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const navigation = useNavigation()
  const [caption, setCaption] = useState('')
  const [isSensitive, setSensitive] = useState(false)
  const [media, setMedia] = useState([])
  const [spoilerText, setSpoiler] = useState('')
  const [showSpoiler, setShowSpoiler] = useState(false)
  const [isSaving, setSaving] = useState(false)
  const theme = useTheme()

  useLayoutEffect(() => {
    navigation.setOptions({ title: 'Edit Post', headerBackTitle: 'Back' })
  }, [navigation])

  const user = useUserCache()

  const HeaderRight = () => (
    <PressableOpacity onPress={() => _onUpdate()}>
      {isSaving ? (
        <ActivityIndicator color={theme.color?.val.default.val} />
      ) : (
        <Text
          fontSize="$5"
          allowFontScaling={false}
          fontWeight="bold"
          color={theme.colorHover?.val.active.val}
        >
          Save
        </Text>
      )}
    </PressableOpacity>
  )

  const _updateMediaAlt = useCallback((itemId, text) => {
    setMedia((prevMedia) =>
      prevMedia.map((m) => (m.id === itemId ? { ...m, description: text } : m))
    )
  }, [])

  const memoizedRenderItem = useMemo(
    () =>
      ({ item }) => <RenderItem item={item} onUpdateMediaAlt={_updateMediaAlt} />,
    [_updateMediaAlt]
  )

  const _onUpdate = async () => {
    setSaving(true)

    const ogMedia = data?.media_attachments
    const mediaChanges = media.filter((m) => {
      const ogm = ogMedia.filter((og) => og.id === m.id)[0]
      return m.description !== ogm.description
    })

    // TODO: error handling
    // TODO: invalidate react query cache of this post so it is updated in the UI
    await Promise.all(mediaChanges.map(updateMedia))
      .then(async (_res) => {
        return await putEditPost(data?.id, {
          status: caption,
          sensitive: isSensitive,
          media_ids: media.map((m) => m.id),
        })
      })
      .finally(() => {
        setSaving(false)
        router.back()
      })
  }

  const updateMedia = async (media) => {
    return await editPostMedia(media.id, media.description)
  }

  const { isPending, isLoading, isError, data, error } = useQuery({
    queryKey: ['getStatusById', id],
    queryFn: async () => {
      const res = await getStatusById(id)
      setCaption(res?.content_text)
      setSensitive(res?.sensitive)
      setMedia(res?.media_attachments)
      setSpoiler(res?.spoiler_text)
      return res
    },
  })

  const {
    isPending: serverConfigPending,
    isSuccess,
    isError: isServerError,
    data: serverConfig,
    error: serverError,
  } = useQuery({
    queryKey: ['cameraInstance'],
    queryFn: getInstanceV1,
    enabled: !!data,
  })

  if (isPending || serverConfigPending) {
    return <ActivityIndicator color={theme.color?.val.default.val} />
  }

  if (isPending || isLoading) {
    return (
      <View flexGrow={1} mt="$5">
        <ActivityIndicator color={theme.color?.val.default.val} />
      </View>
    )
  }

  if (isError) {
    return <Text>Error: {error?.message}</Text>
  }

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: theme.background?.val.default.val }}
      edges={['bottom']}
    >
      <Stack.Screen
        options={{
          title: 'Edit Post',
          headerBackTitle: 'Back',
          headerRight: HeaderRight,
        }}
      />
      <ScrollView onScroll={() => Keyboard.dismiss()}>
        <YStack p="$3" gap="$3">
          <XStack gap="$3" justifyContent="space-between" alignItems="center">
            <XStack gap="$3" alignItems="center">
              <UserAvatar url={user?.avatar} size="$3" />
              <Text
                fontSize={Platform.OS === 'ios' ? '$7' : '$5'}
                fontWeight="bold"
                color={theme.color?.val.default.val}
              >
                {user?.username}
              </Text>
            </XStack>
            <XStack justifyContent="flex-end" alignItems="center">
              <Text color={theme.color?.val.tertiary.val}>
                {caption ? caption?.length : '0'}/
                {serverConfig?.configuration.statuses.max_characters}
              </Text>
            </XStack>
          </XStack>

          <TextArea
            size="$4"
            fontSize={Platform.OS === 'ios' ? '$7' : '$5'}
            borderWidth={1}
            borderColor={theme.borderColor?.val.default.val}
            color={theme.color?.val.default.val}
            defaultValue={caption}
            onChangeText={setCaption}
            maxLength={serverConfig?.configuration.statuses.max_characters}
            backgroundColor={theme.background?.val.tertiary.val}
            numberOfLines={4}
            textAlignVertical="top"
            rows={4}
            multiline={true}
            placeholder="Share your moment..."
            placeholderTextColor={'#ccc'}
          />

          <XStack
            py="$3"
            px="$4"
            bg={theme.background?.val.secondary.val}
            borderRadius="$3"
            justifyContent="space-between"
          >
            <YStack maxWidth="70%" gap="$2">
              <Text
                fontSize="$4"
                fontWeight={'bold'}
                color={theme.color?.val.default.val}
              >
                Contains Sensitive Media
              </Text>
              <Text fontSize="$3" color={theme.color?.val.tertiary.val}>
                Applies a sensitive content warning.
              </Text>
            </YStack>

            <Switch
              size="$3"
              checked={isSensitive}
              onCheckedChange={(checked) =>
                !data?.sensitive ? setSensitive(checked) : null
              }
            >
              <Switch.Thumb animation="quicker" />
            </Switch>
          </XStack>

          {isSensitive ? (
            showSpoiler ? (
              <YStack gap="$1">
                <XStack justifyContent="space-between" alignItems="center" px="$3">
                  <Text alignSelf="center" allowFontScaling={false} fontWeight={'bold'}>
                    Custom content warning
                  </Text>
                  <PressableOpacity onPress={() => setShowSpoiler(false)}>
                    <Text color="$gray9" allowFontScaling={false}>
                      Hide
                    </Text>
                  </PressableOpacity>
                </XStack>
                <TextArea
                  size="$4"
                  fontSize={Platform.OS === 'ios' ? '$7' : '$5'}
                  borderWidth={1}
                  defaultValue={spoilerText}
                  onChangeText={setSpoiler}
                  maxLength={140}
                  backgroundColor={'white'}
                  numberOfLines={4}
                  textAlignVertical="top"
                  multiline={true}
                  placeholder="Set an optional spoiler content warning"
                  placeholderTextColor={'#ccc'}
                />
                <XStack justifyContent="flex-end" alignItems="center">
                  <Text color="$gray9">
                    {spoilerText && spoilerText?.length ? spoilerText?.length : '0'}/140
                  </Text>
                </XStack>
              </YStack>
            ) : (
              <PressableOpacity onPress={() => setShowSpoiler(true)}>
                <Text pl="$3" allowFontScaling={false} fontWeight={'bold'}>
                  Edit custom content warning
                </Text>
              </PressableOpacity>
            )
          ) : null}
        </YStack>

        <YStack>
          {media.map((item) => (
            <View key={`pe-media-${item.id}`}>{memoizedRenderItem({ item })}</View>
          ))}
        </YStack>
        <View h={SCREEN_HEIGHT / 2}></View>
      </ScrollView>
    </SafeAreaView>
  )
}

const _styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  added: {
    backgroundColor: '#F4FCF6',
    color: 'green',
  },
  removed: {
    backgroundColor: '#FCEFEF',
    color: '#D55453',
  },
})
