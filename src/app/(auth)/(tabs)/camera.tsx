import { Feather } from '@expo/vector-icons'
import {
  BottomSheetBackdrop,
  type BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetTextInput,
  BottomSheetView,
} from '@gorhom/bottom-sheet'
import { useToastController } from '@tamagui/toast'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import * as FileSystem from 'expo-file-system'
import * as ImageManipulator from 'expo-image-manipulator'
import * as ImagePicker from 'expo-image-picker'
import { Stack, useNavigation, useRouter } from 'expo-router'
import { useShareIntentContext } from 'expo-share-intent'
import mime from 'mime'
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  Linking,
  type ListRenderItemInfo,
  Platform,
  StyleSheet,
} from 'react-native'
import { FlatList } from 'react-native-gesture-handler'
import { PressableOpacity } from 'react-native-pressable-opacity'
import ImageComponent from 'src/components/ImageComponent'
import { PixelfedBottomSheetModal } from 'src/components/common/BottomSheets'
import UserAvatar from 'src/components/common/UserAvatar'
import { Switch } from 'src/components/form/Switch'
import {
  getComposeSettings,
  getInstanceV1,
  getSelfAccount,
  postNewStatus,
  uploadMediaV2,
} from 'src/lib/api'
import type { UploadV2ErrorResponse, UploadV2Response } from 'src/lib/api-types'
import { useUserCache } from 'src/state/AuthProvider'
import { Storage } from 'src/state/cache'
import {
  Button,
  ScrollView,
  Separator,
  Text,
  TextArea,
  View,
  XStack,
  YStack,
  ZStack,
  useTheme,
} from 'tamagui'

type MediaAsset = {
  path: string
  type: string | undefined
  altText: string | null
  originalPath?: string
}

const MAX_IMAGE_SIZE_MB = 5
const MAX_IMAGE_WIDTH = 4096
const MEDIA_EDIT_KEY = 'ui.mediaEdit'

export default function Camera() {
  const router = useRouter()
  const {
    hasShareIntent,
    shareIntent,
    error: intentError,
    resetShareIntent,
  } = useShareIntentContext()
  const userCache = useUserCache()
  const requireSelfAltText = Storage.getBoolean('ui.requireSelfAltText') == true
  const [captionInput, setCaption] = useState('')
  const [scope, setScope] = useState('public')
  const [isSensitive, setSensitive] = useState(false)
  const [media, setMedia] = useState<Array<MediaAsset>>([])
  const [mediaEdit, setMediaEdit] = useState(Storage.getBoolean(MEDIA_EDIT_KEY) == true)
  const [activeIndex, setActiveIndex] = useState(-1)
  const [curAltText, setCurAltText] = useState('')
  const [canPost, setCanPost] = useState(false)
  const [isPosting, setIsPosting] = useState(false)
  const [maxMediaLimit, setMaxMediaLimit] = useState(4)
  const toast = useToastController()
  const [isResizing, setIsResizing] = useState(false)
  const queryClient = useQueryClient()
  const theme = useTheme()
  const scopeLabel = {
    public: 'Anyone can view',
    unlisted: 'Unlisted from feeds',
    private: 'Only followers can see',
  }
  const scopeIcon = {
    public: 'globe',
    unlisted: 'eye-off',
    private: 'lock',
  }

  const resizeImageIfNeeded = async (uri: string): Promise<string> => {
    try {
      const fileInfo = await FileSystem.getInfoAsync(uri, { size: true })
      const fileSizeInMB = fileInfo.size / (1024 * 1024)

      if (fileSizeInMB <= MAX_IMAGE_SIZE_MB) {
        return uri
      }

      const manipResult = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: MAX_IMAGE_WIDTH } }],
        { compress: 0.85, format: ImageManipulator.SaveFormat.JPEG }
      )

      const newFileInfo = await FileSystem.getInfoAsync(manipResult.uri, { size: true })
      const newFileSizeInMB = newFileInfo.size / (1024 * 1024)

      return manipResult.uri
    } catch (error) {
      console.error('Error resizing image:', error)
      return uri
    }
  }

  const processImages = async (images: Array<MediaAsset>): Promise<Array<MediaAsset>> => {
    setIsResizing(true)
    const processedImages = await Promise.all(
      images.map(async (asset) => {
        if (asset.type === 'image') {
          const resizedUri = await resizeImageIfNeeded(asset.path)
          if (resizedUri !== asset.path) {
            return {
              ...asset,
              originalPath: asset.path,
              path: resizedUri,
            }
          }
        }
        return asset
      })
    )
    setIsResizing(false)
    return processedImages
  }

  useEffect(() => {
    if (shareIntent.files) {
      let file = shareIntent.files[0]
      const processSharedImage = async () => {
        const initialMedia = [{ path: file.path, type: 'image', altText: null }]
        const processedMedia = await processImages(initialMedia)
        setMedia(processedMedia)
        setCanPost(true)
      }

      processSharedImage()
    }
  }, [hasShareIntent])

  const navigation = useNavigation()
  useLayoutEffect(() => {
    navigation.setOptions({ title: 'New Post' })
  }, [navigation])

  const bottomSheetModalRef = useRef<BottomSheetModal>(null)
  const altTextRef = useRef<BottomSheetModal>(null)
  const snapPoints = useMemo(() => ['50%', '70%', '90%'], [])

  const handlePresentModalPress = useCallback(() => {
    bottomSheetModalRef.current?.present()
  }, [])

  const handleOnScroll = useCallback(() => {
    Keyboard.dismiss()
  }, [])

  const openAltText = (item: MediaAsset) => {
    const idx = media.map((m) => m.path).indexOf(item.path)
    setActiveIndex(idx)
    setCurAltText(item.altText || '')
    altTextRef.current?.present()
  }

  const handleSheetChanges = useCallback((_: number) => {}, [])

  const resetForm = () => {
    setCaption('')
    setScope('public')
    setSensitive(false)
    setMedia([])
    setMediaEdit(Storage.getBoolean(MEDIA_EDIT_KEY) == true)
    setActiveIndex(-1)
    setCurAltText('')
    setCanPost(false)
    setIsPosting(false)
  }

  const renderBackdrop = useCallback(
    (props) => (
      <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={1} />
    ),
    []
  )

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: !mediaEdit,
      selectionLimit: maxMediaLimit,
      allowsEditing: mediaEdit,
      aspect: [1, 1],
      quality: 1,
      orderedSelection: true,
      exif: false,
    })

    if (!result.canceled) {
      const newMedia: Array<MediaAsset> = result.assets.map((asset) => ({
        path: asset.uri,
        type: asset.type,
        altText: null,
      }))

      // Process and resize images if needed
      const processedMedia = await processImages(newMedia)
      setMedia([...media, ...processedMedia])
      setCanPost(true)
    }
  }

  const openCamera = async () => {
    let res = await ImagePicker.requestCameraPermissionsAsync()

    if (res && res.granted == false) {
      Alert.alert(
        'Camera Access Needed',
        'This app requires camera access to function properly. Please enable camera permissions in your device settings.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Open Settings',
            onPress: () => {
              if (Platform.OS === 'ios') {
                Linking.openURL('app-settings:')
              } else {
                Linking.openSettings()
              }
            },
          },
        ],
        { cancelable: true }
      )
      return
    }
    let result = await ImagePicker.launchCameraAsync()

    if (!result.canceled) {
      const newMedia: Array<MediaAsset> = [
        {
          path: result.assets[0].uri,
          type: result.assets[0].type,
          altText: null,
        },
      ]

      // Process and resize if needed
      const processedMedia = await processImages(newMedia)
      setMedia([...media, ...processedMedia])
      setCanPost(true)
    }
  }

  const toggleScope = () => {
    if (scope == 'public') {
      setScope('unlisted')
      return
    }

    if (scope == 'unlisted') {
      setScope('private')
      return
    }

    if (scope == 'private') {
      setScope('public')
      return
    }
  }

  const warningMessage = () => {
    if (!isSensitive && scope == 'public') {
      return
    }
    if (isSensitive) {
      if (scope == 'public') {
        return 'You marked this post as sensitive, it will be hidden behind a warning before media is displayed.'
      }
      if (scope == 'unlisted') {
        return 'You marked this post as sensitive and unlisted, it will be hidden from public timelines and behind a warning before media is displayed.'
      }
      if (scope == 'private') {
        return 'You marked this post as sensitive and private, it will only be shared to your followers and be hidden behind a warning before media is displayed.'
      }
    } else {
      if (scope == 'unlisted') {
        return 'You marked this post as unlisted, it will be hidden from public timelines.'
      }
      if (scope == 'private') {
        return 'You marked this post as private, it will only be shared to your followers.'
      }
    }
  }

  const saveAltText = () => {
    setMedia(
      media.map((m, idx) => {
        if (idx === activeIndex) {
          return { ...m, altText: curAltText }
        }
        return m
      })
    )
    setCurAltText('')
    altTextRef.current?.close()
  }

  const RenderMediaPreview = ({ item }: ListRenderItemInfo<MediaAsset>) => (
    <View m="$1">
      <YStack alignItems="center">
        {item.type === 'image' ? (
          <ZStack w={120} h={200}>
            <ImageComponent
              source={{ uri: item.path }}
              resizeMode={'cover'}
              style={{
                width: 120,
                height: 200,
                borderRadius: 10,
                borderWidth: 1,
                borderColor: theme.borderColor?.val.default.val,
              }}
            />
            {item?.altText?.length ? (
              <View
                position="absolute"
                opacity={0.5}
                ml={3}
                mb={3}
                bottom={0}
                py={3}
                px={5}
                borderRadius={10}
                bg="black"
                justifyContent="center"
                alignContent="center"
              >
                <Text
                  fontWeight="bold"
                  color="white"
                  allowFontScaling={false}
                  fontSize={8}
                >
                  ALT
                </Text>
              </View>
            ) : null}
            {item.originalPath ? (
              <View
                position="absolute"
                opacity={0.5}
                ml={3}
                mt={3}
                top={0}
                py={3}
                px={5}
                borderRadius={10}
                bg="black"
                justifyContent="center"
                alignContent="center"
              >
                <Text
                  fontWeight="bold"
                  color="white"
                  allowFontScaling={false}
                  fontSize={8}
                >
                  RESIZED
                </Text>
              </View>
            ) : null}
          </ZStack>
        ) : null}

        {item.type === 'video' ? (
          <View
            w={120}
            h={200}
            bg="$gray6"
            justifyContent="center"
            alignItems="center"
            borderRadius={10}
          >
            <Feather name="video" size={20} />
          </View>
        ) : null}

        <PressableOpacity onPress={() => mediaMenu(item)}>
          <Text color={theme.color?.val.default.val} my="$3">
            <Feather name="sliders" size={20} />
          </Text>
        </PressableOpacity>
      </YStack>
    </View>
  )

  const _removeMediaItem = (item: MediaAsset) => {
    const len = media.length
    setMedia(media.filter((m) => m.path !== item.path))
    setCanPost(len > 1)
  }

  const mediaMenu = (item: MediaAsset) => {
    Alert.alert('Manage Media', '', [
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => _removeMediaItem(item),
      },
      {
        text: 'Edit Alt Text',
        onPress: () => openAltText(item),
      },
      {
        text: 'Cancel',
        style: 'cancel',
      },
    ])
  }

  const HeaderLeft = () => (
    <View ml="$3">
      <PressableOpacity onPress={handlePresentModalPress}>
        <Feather name="settings" size={20} color={theme.color.val.tertiary.val} />
      </PressableOpacity>
    </View>
  )

  const HeaderRight = () => (
    <View mr="$3">
      {isPosting == true || isResizing ? (
        <ActivityIndicator />
      ) : canPost ? (
        <PressableOpacity onPress={() => _handlePost()}>
          <Text fontSize="$6" fontWeight="bold" color={theme.colorHover.val.hover.val}>
            Post
          </Text>
        </PressableOpacity>
      ) : (
        <Text
          fontSize="$6"
          fontWeight="bold"
          color={theme.colorHover.val.active.val}
          opacity={0.4}
        >
          Post
        </Text>
      )}
    </View>
  )

  const _handlePost = async () => {
    setIsPosting(true)

    if (requireSelfAltText == true) {
      const count = media
        .map((m) => {
          return m && m.altText && m.altText.length
        })
        .filter((r) => r).length

      if (count !== media.length) {
        Alert.alert(
          'Missing Alt Text',
          'You have enabled the requirement for alt text, and we found missing alt text. Please add alt text for each media to proceed.'
        )
        setIsPosting(false)
        return
      }
    }

    const uploads = media.map((cap) => {
      let uri = cap.path
      let name = cap.path.split('/').slice(-1)[0]
      return {
        description: cap.altText,
        file: {
          uri: Platform.OS === 'ios' ? uri.replace('file://', '') : uri,
          type: mime.getType(uri),
          name: name,
        },
      }
    })

    await Promise.all(uploads.map(uploadMediaToIds))
      .then((res) => {
        const hasSomeError = res.some((r) => r.error === true)

        if (hasSomeError) {
          const error = res.find((r) => r.error === true)

          if (error) {
            const data = error.data as UploadV2ErrorResponse
            throw new Error(data.errors.file[0])
          }

          throw new Error('An unknown error occurred.')
        }

        const resData = res as Array<{
          error: false
          data: UploadV2Response
        }>

        let postParams = {
          status: captionInput,
          media_ids: resData.map((r) => r.data.id),
          visibility: scope,
          sensitive: isSensitive,
        }

        return postParams
      })
      .then(async (params) => {
        return await postNewStatus(params)
      })
      .then((res) => {
        resetForm()
        router.replace('/?ref30=1')
        queryClient.invalidateQueries({
          queryKey: ['statusesById', userSelf?.id],
        })
      })
      .catch((err) => {
        setIsPosting(false)

        toast.show('Error uploading media', {
          message: err.message,
          native: false,
        })
      })
  }

  const uploadMediaToIds = async (capture: {
    description: string | null
    file: { uri: string; type: any; name: string }
  }): Promise<
    | {
        error: true
        data: UploadV2ErrorResponse
      }
    | {
        error: false
        data: UploadV2Response
      }
  > => {
    const res = await uploadMediaV2(
      capture.description
        ? {
            file: capture.file,
            description: capture.description,
          }
        : {
            file: capture.file,
          }
    )

    if (Object.hasOwn(res, 'errors')) {
      return {
        error: true,
        data: res as UploadV2ErrorResponse,
      }
    }
    return {
      error: false,
      data: res as UploadV2Response,
    }
  }

  const { data: userSelf } = useQuery({
    queryKey: ['getSelfAccount'],
    queryFn: getSelfAccount,
  })

  const {
    isPending,
    isSuccess,
    isError,
    data: serverConfig,
    error,
  } = useQuery({
    queryKey: ['cameraInstance'],
    queryFn: getInstanceV1,
    enabled: !!userSelf,
  })

  const {
    isPending: composePending,
    data: composeSettings,
    error: composeError,
  } = useQuery({
    queryKey: ['composeSettings'],
    queryFn: async () => {
      const res = await getComposeSettings()
      if (userSelf && userSelf?.locked) {
        setScope('private')
      } else {
        setScope(res.default_scope)
      }
      if (res.max_media_attachments) {
        setMaxMediaLimit(res.max_media_attachments)
      }
      res.max_altext_length = Number.parseInt(res.max_altext_length)
      return res
    },
    enabled: !!serverConfig,
  })

  if (isPending || composePending) {
    return <ActivityIndicator />
  }

  if (isError) {
    return <Text>Error: {error.message}</Text>
  }

  return (
    <View
      style={[styles.container, { backgroundColor: theme.background?.val.default.val }]}
    >
      <Stack.Screen
        options={{
          title: 'New Post',
          headerLeft: HeaderLeft,
          headerRight: HeaderRight,
        }}
      />
      {isPosting ? (
        <View
          flexGrow={1}
          bg={theme.background?.val.secondary.val}
          justifyContent="center"
          alignItems="center"
        >
          <YStack gap="$3">
            <ActivityIndicator color={theme.color?.val.default.val} />
            <Text color={theme.color?.val.default.val}>Posting, please wait...</Text>
          </YStack>
        </View>
      ) : isResizing ? (
        <View
          flexGrow={1}
          bg={theme.background?.val.secondary.val}
          justifyContent="center"
          alignItems="center"
        >
          <YStack gap="$3">
            <ActivityIndicator color={theme.color?.val.default.val} />
            <Text color={theme.color?.val.default.val}>
              Resizing images, please wait...
            </Text>
          </YStack>
        </View>
      ) : (
        <>
          <ScrollView onScroll={handleOnScroll}>
            <YStack px="$3" pt="$3" pb="$1">
              <XStack gap="$3" justifyContent="space-between" alignItems="center">
                <XStack gap="$3" alignItems="center">
                  <UserAvatar url={userCache?.avatar} size="$3" />
                  <Text
                    fontSize="$7"
                    fontWeight="bold"
                    color={theme.color?.val.default.val}
                  >
                    {userCache?.username}
                  </Text>
                </XStack>
                <XStack justifyContent="flex-end" alignItems="center">
                  <Text color={theme.color?.val.tertiary.val}>
                    {captionInput ? captionInput?.length : '0'}/
                    {serverConfig?.configuration.statuses.max_characters}
                  </Text>
                </XStack>
              </XStack>

              <YStack mt="$3">
                <TextArea
                  size="$4"
                  fontSize="$7"
                  borderWidth={1}
                  bg={theme.background?.val.tertiary.val}
                  color={theme.color?.val.default.val}
                  borderColor={theme.borderColor?.val.default.val}
                  value={captionInput}
                  onChangeText={setCaption}
                  maxLength={serverConfig?.configuration.statuses.max_characters}
                  numberOfLines={4}
                  multiline={true}
                  placeholder="Share your moment..."
                  placeholderTextColor={theme.color?.val.tertiary.val}
                />
              </YStack>

              {isSensitive || scope != 'public' ? (
                <View
                  mt="$2"
                  p="$3"
                  borderWidth={1}
                  borderRadius={10}
                  borderColor={theme.borderColor?.val.default.val}
                >
                  <Text
                    color={theme.color?.val.secondary.val}
                    fontWeight={'500'}
                    fontFamily={'system'}
                  >
                    {warningMessage()}
                  </Text>
                </View>
              ) : null}

              <XStack ml="$2" mt="$1" gap="$5" justifyContent="space-between">
                <XStack gap="$5">
                  {media &&
                  media.length <
                    serverConfig?.configuration.statuses.max_media_attachments ? (
                    <>
                      <Button p="$0" chromeless onPress={pickImage}>
                        <Feather
                          name="image"
                          size={24}
                          color={theme.color?.val.default.val}
                        />
                      </Button>
                      <Button p="$0" chromeless onPress={openCamera}>
                        <Feather
                          name="camera"
                          size={24}
                          color={theme.color?.val.default.val}
                        />
                      </Button>
                      {/* <Button p="$0" chromeless><Feather name="map-pin" size={24} /></Button> */}
                    </>
                  ) : null}
                  <Button p="$0" chromeless onPress={() => setSensitive(!isSensitive)}>
                    <Feather
                      name={isSensitive ? 'eye-off' : 'eye'}
                      size={24}
                      color={theme.color?.val.default.val}
                    />
                  </Button>
                </XStack>
                <Button p="$0" chromeless onPress={toggleScope}>
                  <Text
                    color={theme.color?.val.secondary.val}
                    fontSize="$3"
                    allowFontScaling={false}
                  >
                    {scopeLabel[scope]}
                  </Text>
                  <Feather
                    name={scopeIcon[scope]}
                    size={24}
                    allowFontScaling={false}
                    color={theme.color?.val.tertiary.val}
                  />
                </Button>
              </XStack>
            </YStack>
            <View ml="$3" mt="$3">
              {media && media.length ? (
                <>
                  <FlatList data={media} renderItem={RenderMediaPreview} horizontal />
                </>
              ) : (
                <View
                  p="$3"
                  bg="$gray2"
                  borderWidth={1}
                  borderColor={theme.borderColor?.val.default.val}
                  mr="$3"
                  borderRadius={10}
                  justifyContent="center"
                  alignItems="center"
                >
                  <XStack gap="$2" alignItems="center">
                    <Text
                      fontSize="$7"
                      lineHeight={30}
                      color={theme.color?.val.default.val}
                      allowFontScaling={false}
                    >
                      Tap
                    </Text>
                    <PressableOpacity onPress={pickImage}>
                      <Feather
                        name="image"
                        size={24}
                        color={theme.color?.val.default.val}
                      />
                    </PressableOpacity>
                    <Text
                      fontSize="$7"
                      lineHeight={30}
                      color={theme.color?.val.default.val}
                      allowFontScaling={false}
                    >
                      {' '}
                      or{' '}
                    </Text>
                    <PressableOpacity onPress={openCamera}>
                      <Feather
                        name="camera"
                        size={24}
                        color={theme.color?.val.default.val}
                      />
                    </PressableOpacity>
                    <Text
                      fontSize="$7"
                      lineHeight={30}
                      color={theme.color?.val.default.val}
                      allowFontScaling={false}
                    >
                      {' '}
                      to add media
                    </Text>
                  </XStack>
                </View>
              )}
            </View>
          </ScrollView>

          <PixelfedBottomSheetModal
            ref={bottomSheetModalRef}
            index={1}
            snapPoints={snapPoints}
            onChange={handleSheetChanges}
            backdropComponent={renderBackdrop}
            backgroundStyle={{ backgroundColor: theme.background.val.default.val }}
            handleIndicatorStyle={{ backgroundColor: theme.background.val.tertiary.val }}
          >
            <BottomSheetView
              style={[
                styles.contentContainer,
                { backgroundColor: theme.background?.val.default.val },
              ]}
            >
              <Text
                fontSize="$9"
                fontWeight="bold"
                px="$3"
                pb="$3"
                color={theme.color?.val.default.val}
              >
                Post Options
              </Text>
              <Separator borderColor={theme.borderColor?.val.default.val} />
              <XStack
                py="$3"
                px="$4"
                bg={theme.background?.val.default.val}
                justifyContent="space-between"
              >
                <YStack maxWidth="60%" gap="$2">
                  <Text
                    fontSize="$5"
                    fontWeight={'bold'}
                    color={theme.color?.val.default.val}
                  >
                    Enable Media Editor
                  </Text>
                  <Text fontSize="$3" color={theme.color?.val.secondary.val}>
                    Allows you to crop and resize photos using a square aspect ratio.
                    Disable to preserve native aspect ratio.
                  </Text>
                </YStack>
                <Switch
                  size="$3"
                  checked={mediaEdit}
                  onCheckedChange={(checked) => {
                    setMediaEdit(checked)
                    Storage.set(MEDIA_EDIT_KEY, checked)
                  }}
                >
                  <Switch.Thumb animation="quicker" />
                </Switch>
              </XStack>

              <Separator borderColor={theme.borderColor?.val.default.val} />
              <XStack
                py="$3"
                px="$4"
                bg={theme.background?.val.default.val}
                justifyContent="space-between"
              >
                <YStack maxWidth="60%" gap="$2">
                  <Text
                    fontSize="$5"
                    fontWeight={'bold'}
                    color={theme.color?.val.default.val}
                  >
                    Auto-Resize Large Images
                  </Text>
                  <Text fontSize="$3" color={theme.color?.val.secondary.val}>
                    Images larger than {MAX_IMAGE_SIZE_MB}MB will be automatically resized
                    to {MAX_IMAGE_WIDTH}px max width.
                  </Text>
                </YStack>
                <Text
                  fontSize="$5"
                  fontWeight={'bold'}
                  color={theme.color?.val.default.val}
                >
                  Enabled
                </Text>
              </XStack>
            </BottomSheetView>
          </PixelfedBottomSheetModal>
          <PixelfedBottomSheetModal
            ref={altTextRef}
            index={1}
            snapPoints={snapPoints}
            onChange={handleSheetChanges}
            backdropComponent={renderBackdrop}
            keyboardBehavior={Platform.OS === 'ios' ? 'extend' : 'interactive'}
            android_keyboardInputMode="adjustResize"
            backgroundStyle={{ backgroundColor: theme.background.val.default.val }}
            handleIndicatorStyle={{ backgroundColor: theme.background.val.tertiary.val }}
          >
            <BottomSheetScrollView
              style={[
                styles.contentContainer,
                { backgroundColor: theme.background?.val.default.val },
              ]}
            >
              <Text
                fontSize="$9"
                fontWeight="bold"
                px="$3"
                mb="$3"
                color={theme.color?.val.default.val}
              >
                Alt Text
              </Text>
              <Text color={theme.color?.val.tertiary.val} mb="$3">
                Add optional alt text to describe the media for visually impaired
              </Text>
              {media && activeIndex >= 0 && media[activeIndex] ? (
                <>
                  <ImageComponent
                    source={{ uri: media[activeIndex].path }}
                    style={{
                      width: '100%',
                      height: Keyboard.isVisible() ? 140 : 240,
                      marginBottom: 10,
                    }}
                    resizeMode={'contain'}
                  />
                </>
              ) : null}
              <BottomSheetTextInput
                style={styles.input}
                multiline={true}
                maxLength={composeSettings?.max_altext_length}
                borderColor={theme.borderColor.val.default.val}
                defaultValue={curAltText}
                color={theme.color?.val.default.val}
                onChangeText={setCurAltText}
                placeholder="Add optional alt text to describe the media for visually impaired"
                autoCapitalize="sentences"
                numberOfLines={4}
              />
              <YStack mt="$1" mb="$3">
                <XStack justifyContent="flex-end">
                  <Text color={theme.color?.val.tertiary.val} fontWeight="bold">
                    {curAltText && curAltText?.length ? curAltText.length : 0}/
                    {composeSettings?.max_altext_length}
                  </Text>
                </XStack>
              </YStack>
              <Button
                bg={theme.colorHover?.val.hover.val}
                color="white"
                size="$6"
                fontWeight="bold"
                mb="$3"
                onPress={() => saveAltText()}
              >
                Save
              </Button>
            </BottomSheetScrollView>
          </PixelfedBottomSheetModal>
        </>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    padding: 10,
  },
  input: {
    borderRadius: 10,
    fontSize: 18,
    lineHeight: 22,
    padding: 15,
    borderWidth: 0.33,
    minHeight: 130,
  },
})
