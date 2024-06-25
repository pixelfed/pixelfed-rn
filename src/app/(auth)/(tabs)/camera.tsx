import {
  Button,
  Text,
  View,
  YStack,
  XStack,
  TextArea,
  Tabs,
  Separator,
  SizableText,
  H5,
  ScrollView,
  ZStack,
} from 'tamagui'
import { Feather } from '@expo/vector-icons'
import { router, Stack, useFocusEffect, useRouter} from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { ActivityIndicator, StyleSheet, TouchableOpacity, Alert, Platform } from 'react-native'
import { Storage } from 'src/state/cache'
import UserAvatar from 'src/components/common/UserAvatar'
import { useState, useRef, useCallback, useMemo, useEffect } from 'react'
import * as ImagePicker from 'expo-image-picker';
import { FlatList } from 'react-native-gesture-handler'
import FastImage from 'react-native-fast-image'
import { PressableOpacity } from 'react-native-pressable-opacity'
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetBackdrop,
  BottomSheetTextInput,
} from '@gorhom/bottom-sheet';
import { Switch } from 'src/components/form/Switch'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getInstanceV1, getComposeSettings, uploadMediaV2, postNewStatus } from 'src/lib/api'
import mime from "mime";

export default function CameraScreen() {
  const router = useRouter()
  const userCache = JSON.parse(Storage.getString('user.profile'))
  const [captionInput, setCaption] = useState("")
  const [scope, setScope] = useState('public');
  const [isSensitive, setSensitive] = useState(false)
  const [media, setMedia] = useState([]);
  const [mediaEdit, setMediaEdit] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0)
  const [curAltext, setCurAltext] = useState("")
  const [canPost, setCanPost] = useState(false)
  const [isPosting, setIsPosting] = useState(false)
  const scopeLabel = {
    'public':   'Anyone can view',
    'unlisted': 'Unlisted from feeds',
    'private':  'Only followers can see'
  }
  const scopeIcon = {
    'public': 'globe',
    'unlisted': 'eye-off',
    'private': 'lock'
  }

  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const altTextRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ['25%', '50%'], []);

  const handlePresentModalPress = useCallback(() => {
    bottomSheetModalRef.current?.present();
  }, []);

  const openAltText = useCallback((item) => {
    const idx = media.map(m => m.path).indexOf(item.path)
    setActiveIndex(idx)
    setCurAltext(media[idx]?.alttext)
    altTextRef.current?.present();
  }, [activeIndex, curAltext]);

  const handleSheetChanges = useCallback((index: number) => {
    console.log('handleSheetChanges', index);
  }, []);

  const resetForm = () => {
    setCaption("")
    setScope("public")
    setSensitive(false)
    setMedia([])
    setMediaEdit(true)
    setActiveIndex(0)
    setCurAltext("")
    setCanPost(false)
    setIsPosting(false)
  }

  const renderBackdrop = useCallback(
		(props) => (
			<BottomSheetBackdrop
				{...props}
				disappearsOnIndex={-1}
				appearsOnIndex={1}
			/>
		),
		[]
	);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: mediaEdit,
      quality: 1,
    });

    if (!result.canceled) {
      setMedia([
        ...media, 
        { path: result.assets[0].uri, type: result.assets[0].type, alttext: null }
      ])
      setCanPost(true)
    }
  };

  const openCamera = async () => {
    Alert.alert("Camera unavailable", "You do not have permission to use the camera.")
  }

  const toggleScope = () => {
    if(scope == 'public') {
      setScope('unlisted')
      return;
    }

    if(scope == 'unlisted') {
      setScope('private')
      return;
    }

    if(scope == 'private') {
      setScope('public')
      return;
    }
  }

  const warningMessage = () => {
    if(!isSensitive && scope == 'public') {
      return
    }
    if(isSensitive) {
      if(scope == 'public') {
        return 'You marked this post as sensitive, it will be hidden behind a warning before media is displayed.'
      }
      if(scope == 'unlisted') {
        return 'You marked this post as sensitive and unlisted, it will be hidden from public timlines and behind a warning before media is displayed.'
      }
      if(scope == 'private') {
        return 'You marked this post as sensitive and private, it will only be shared to your followers and be hidden behind a warning before media is displayed.'
      }
    } else {
      if(scope == 'unlisted') {
        return 'You marked this post as unlisted, it will be hidden from public timlines.'
      }
      if(scope == 'private') {
        return 'You marked this post as private, it will only be shared to your followers.'
      }
    }
  }

  const saveAltText = () => {
    setMedia(
      media.map((m, idx) => {
        if(idx === activeIndex) {
          return {...m, alttext: curAltext }
        } else {
          return m
        }
      })
    )
    setCurAltext("")
    altTextRef.current?.close();
  }

  const RenderMediaPreview = ({item}) => (
    <View m="$1">
      <YStack alignItems="center">
        { item.type === 'image' ?
        <ZStack w={120} h={200}>
          <FastImage
            source={{uri: item.path}}
            resizeMode={FastImage.resizeMode.cover}
            style={{ width: 120, height: 200, borderRadius: 10, borderWidth: 1, borderColor: '#ccc'}}
            />
            {item?.alttext?.length ?
            <View position="absolute" opacity={0.5} ml={3} mb={3} bottom={0} py={3} px={5} borderRadius={10} bg="black" justifyContent='center' alignContent='center'><Text fontWeight="bold" color="white" allowFontScaling={false} fontSize={8}>ALT</Text></View>
            : null}
        </ZStack>
        : null} 

        { item.type === 'video' ?
          <View 
            w={120} 
            h={200} 
            bg="$gray6" 
            justifyContent='center'
            alignItems="center"
            borderRadius={10}>
            <Feather name="video" size={20} />
          </View>
        : null} 

        <PressableOpacity onPress={() => mediaMenu(item)}>
          <Text color="$gray9" my="$3">
            <Feather name="sliders" size={20} />
          </Text>
        </PressableOpacity>
      </YStack>
    </View>
  )

  const _removeMediaItem = (item) => {
    const len = media?.length
    setMedia(
      media.filter(m => m.path !== item.path)
    )
    setCanPost(len > 1)
  }

  const mediaMenu = (item) => {
    Alert.alert(
      'Manage Media',
      '',
      [
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => _removeMediaItem(item)
        },
        {
          text: 'Edit Alt Text',
          onPress: () => openAltText(item)
        },
        {
          text: 'Cancel',
          style: 'cancel'
        }
      ]
    )
  }

  const HeaderLeft = () => (
    <View ml="$3">
      <PressableOpacity onPress={handlePresentModalPress}>
        <Feather name="settings" size={20} />
      </PressableOpacity>
    </View>
  )

  const HeaderRight = () => (
    <View mr="$3">
      { isPosting == true ? <ActivityIndicator /> : (canPost ?
      <PressableOpacity onPress={() => _handlePost()}>
        <Text fontSize="$6" fontWeight="bold" color="$blue9">Post</Text>
      </PressableOpacity> :
      <Text fontSize="$6" fontWeight="bold" color="$blue7">Post</Text>)
      }
    </View>
  )

  const _handlePost = async () => {
    setIsPosting(true)

    const uploads = media.map(cap => {
      let uri = cap.path;
      let name = cap.path.split("/").slice(-1)[0];
      return {
        description: cap.alttext,
        file: {
            uri: Platform.OS === 'ios' ? uri.replace('file://', '') : uri,
            type: mime.getType(uri),
            name: name
        }
      }
    })

    await Promise.all(uploads.map(uploadMediaToIds))
    .then(res => {
      let postParams = {
        status: captionInput,
        media_ids: res.map(r => r.id),
        visibility: scope,
        sensitive: isSensitive
      }

      return postParams;
    }).then(async(params) => {
      return await postNewStatus(params);
    }).then(res => {
      resetForm()
      router.navigate('/?ref30=1')
    })
  }

  const uploadMediaToIds = async (capture) => {
    return await uploadMediaV2({ 
      file: capture.file,
      description: capture.description
    })
    .then(res => {
      return res;
    })
    .catch(err => {
    })
  }

  const { isPending, isSuccess, isError, data: serverConfig, error  } = useQuery({ 
    queryKey: ['cameraInstance'], 
    queryFn: getInstanceV1 
  })

  const { isPending: composePending, data: composeSettings, error: composeError } = useQuery({
    queryKey: ['composeSettings'],
    queryFn: async () => {
      const res = await getComposeSettings()
      setScope(res.default_scope)
      res.max_altext_length = parseInt(res.max_altext_length)
      return res
    },
    enabled: !!serverConfig
  })

  if (isPending || composePending) {
    return <ActivityIndicator />
  }

  if (isError) {
    return <Text>Error: {error.message}</Text>
  }

  return (
    <View style={styles.container}>
      <Stack.Screen 
         options={{ 
          title: "New Post",
          headerLeft: HeaderLeft,
          headerRight: HeaderRight
        }}
      />
      { isPosting ?
      <View flexGrow={1} bg="white" justifyContent='center' alignItems="center">
        <YStack gap="$3">
           <ActivityIndicator />
           <Text>Posting, please wait...</Text>
        </YStack>
      </View> : <>
      <ScrollView>
        <YStack px="$3" pt="$3" pb="$1">
          <XStack gap="$3" justifyContent="space-between" alignItems="center">
            <XStack gap="$3" alignItems="center">
              <UserAvatar url={userCache?.avatar} size="$3" />
              <Text fontSize="$7" fontWeight="bold">{ userCache?.username }</Text>
            </XStack>
            <XStack justifyContent="flex-end" alignItems="center">
              <Text color="$gray9">{captionInput ? captionInput?.length : '0'}/{ serverConfig?.configuration.statuses.max_characters }</Text>
            </XStack>
          </XStack>

          <YStack mt="$3">
            <TextArea
              size="$4"
              fontSize="$7"
              borderWidth={1}
              value={captionInput}
              onChangeText={setCaption}
              maxLength={serverConfig?.configuration.statuses.max_characters}
              backgroundColor={'white'}
              numberOfLines={4}
              placeholder="Share your moment..."
              placeholderTextColor={'#ccc'}
            />
          </YStack>

          { isSensitive || scope != 'public' ? 
            <View mt="$2" p="$3" bg="$yellow2" borderWidth={1} borderRadius={10} borderColor="$yellow3">
              <Text color="$yellow11" fontWeight={500} fontFamily={'system'}>{warningMessage()}</Text>
            </View>
          : null }

          <XStack ml="$2" mt="$1" gap="$5" justifyContent='space-between'>
            <XStack gap="$5">
              { media && media.length < serverConfig?.configuration.statuses.max_media_attachments ? <>
              <Button p="$0" chromeless onPress={pickImage}><Feather name="image" size={24} /></Button>
              <Button p="$0" chromeless onPress={openCamera}><Feather name="camera" size={24} /></Button>
              {/* <Button p="$0" chromeless><Feather name="map-pin" size={24} /></Button> */}
              </> : null}
              <Button p="$0" chromeless onPress={() => setSensitive(!isSensitive)}>
                <Feather name={isSensitive ? "eye-off" : "eye"} color={isSensitive ? "#bf9f00" : "black"} size={24} />
              </Button>
            </XStack>
            <Button p="$0" chromeless onPress={toggleScope}>
              <Text color={scope === 'private' ? "$yellow11" : "$gray9"} fontSize="$3" allowFontScaling={false}>{ scopeLabel[scope] }</Text>
              <Feather name={scopeIcon[scope]} size={24} allowFontScaling={false} />
            </Button>
          </XStack>

        </YStack>
        <View ml="$3" mt="$3">

          { media && media.length ? <>
          <FlatList
            data={media}
            renderItem={RenderMediaPreview}
            horizontal 
            />
          </> : 
          <View 
            p="$3" 
            bg="$gray3" 
            borderWidth={1} 
            borderColor="$gray6"
            mr="$3" 
            borderRadius={10}
            justifyContent='center'
            alignItems='center'>
            <Text fontSize="$7" lineHeight={30} color="$gray9">Tap  <Feather name="image" size={24} color="black" />  or  <Feather name="camera" size={24} color="black" />  to add media</Text>
          </View> }
        </View>
      </ScrollView>
      
      <BottomSheetModal
          ref={bottomSheetModalRef}
          index={1}
          snapPoints={snapPoints}
          onChange={handleSheetChanges}
          backdropComponent={renderBackdrop}
        >
        <BottomSheetView style={styles.contentContainer}>
          <Text fontSize="$9" fontWeight="bold" px="$3" pb="$3">Post Options</Text>
          <Separator />
          <XStack py="$3" px="$4" bg="white" justifyContent="space-between">
            <YStack maxWidth="60%" gap="$2">
              <Text fontSize="$5" fontWeight={'bold'}>
                Enable Media Editor
              </Text>
              <Text fontSize="$3" color="$gray9">
                Allows you to crop and resize photos using a square aspect ratio. Disable to preserve native aspect ratio.
              </Text>
            </YStack>
            <Switch size="$3" checked={mediaEdit} onCheckedChange={(checked) => setMediaEdit(checked)}>
              <Switch.Thumb animation="quicker" />
            </Switch>
          </XStack>
        </BottomSheetView>
      </BottomSheetModal>
      <BottomSheetModal
          ref={altTextRef}
          index={1}
          snapPoints={snapPoints}
          onChange={handleSheetChanges}
          backdropComponent={renderBackdrop}
        >
        <BottomSheetView style={styles.contentContainer}>
          <Text fontSize="$9" fontWeight="bold" px="$3" pb="$1">Alt Text</Text>
          <BottomSheetTextInput 
            style={styles.input}
            multiline={true}
            numberOfLines={4}
            maxLength={composeSettings?.max_altext_length}
            defaultValue={curAltext}
            onChangeText={setCurAltext}
            placeholder='Add optional alt text to describe the media for visually impaired'
          />
          <YStack mb="$3">
            <XStack justifyContent='flex-end'>
              <Text color="$gray9">{curAltext && curAltext?.length ? curAltext.length : 0}/{composeSettings?.max_altext_length}</Text>
            </XStack>
          </YStack>
          <Button bg="$blue9" color="white" size="$6" fontWeight='bold' onPress={() => saveAltText()}>Save</Button>
        </BottomSheetView>
      </BottomSheetModal>
      </>}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  contentContainer: {
		flex: 1,
    padding: 10,
	},
  input: {
    minHeight: 120,
    maxHeight: 200,
    marginTop: 8,
    marginBottom: 10,
    borderRadius: 10,
    fontSize: 18,
    lineHeight: 40,
    padding: 20,
    borderWidth: 0.33,
    borderColor: '#ccc',
    backgroundColor: 'white',
  },
})