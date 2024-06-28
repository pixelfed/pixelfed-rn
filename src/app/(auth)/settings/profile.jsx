import { FlatList, Dimensions, ActivityIndicator, Alert, Platform } from 'react-native'
import {
  Group,
  Image,
  ScrollView,
  Separator,
  Text,
  View,
  XStack,
  YStack,
  Button,
  Avatar,
} from 'tamagui'
import ProfileHeader from '@components/profile/ProfileHeader'
import { Storage } from 'src/state/cache'
import { queryApi } from 'src/requests'
import { useState, useEffect } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Stack, Link } from 'expo-router'
import { Feather } from '@expo/vector-icons'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getAccountById,
  getAccountStatusesById,
  updateAvatar,
  deleteAvatar,
} from 'src/lib/api'
import * as ImagePicker from 'expo-image-picker'
import mime from 'mime'

export default function Page() {
  const userCache = JSON.parse(Storage.getString('user.profile'))
  const queryClient = useQueryClient()

  const [newProfilePhoto, setProfilePhoto] = useState()
  const { data: user, isFetching } = useQuery({
    queryKey: ['profileById', userCache.id],
    queryFn: getAccountById,
  })

  if (isFetching) {
    return (
      <View>
        <ActivityIndicator />
      </View>
    )
  }

  const updateProfilePhoto = () => {
    const isDefault = user?.avatar.includes('default.')
    const opts = isDefault
      ? [
          {
            text: 'Add',
            onPress: () => pickImage(),
          },
          {
            text: 'Cancel',
            style: 'cancel',
          },
        ]
      : [
          {
            text: 'Change Photo',
            onPress: () => pickImage(),
          },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => _deleteProfilePhoto(),
          },
          {
            text: 'Cancel',
            style: 'cancel',
          },
        ]
    Alert.alert(
      isDefault ? 'Add Profile Photo' : 'Change Profile Photo',
      isDefault
        ? 'Select a photo from your camera roll for your profile photo.'
        : 'Upload a new photo or delete your existing photo.\n\nIt may take a few minutes to update.',
      opts
    )
  }

  const _deleteProfilePhoto = async () => {
    await deleteAvatar().then((res) => {
      queryClient.invalidateQueries({ queryKey: ['profileById'] })
    })
  }

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      exif: false,
      selectionLimit: 1,
      quality: 0.5,
    })

    if (!result.canceled) {
      let image = result.assets[0]
      const name = image.uri.split('/').slice(-1)[0]
      const payload = {
        uri: Platform.OS === 'ios' ? image.uri.replace('file://', '') : image.uri,
        type: mime.getType(image.uri),
        name: name,
      }
      await updateAvatar({
        avatar: payload,
      }).then((res) => {
        queryClient.invalidateQueries({ queryKey: ['profileById'] })
      })
    }
  }

  const LinkField = ({ label, value, placeholder, path, border }) => (
    <XStack px="$3" py="$3" alignItems="start" justifyContent="center">
      <Text w="30%" fontSize="$6" color="$gray9">
        {label}
      </Text>
      {path ? (
        <View
          w="70%"
          flexGrow={1}
          overflow="hidden"
          flexWrap="wrap"
          pb="$3"
          borderBottomWidth={border ? 1 : 0}
          borderBottomColor="$gray4"
        >
          <Link href={path}>
            <Text fontSize="$6" flexWrap="wrap">
              {value}
            </Text>
          </Link>
        </View>
      ) : (
        <View
          w="70%"
          flexGrow={1}
          overflow="hidden"
          flexWrap="wrap"
          pb="$3"
          borderBottomWidth={border ? 1 : 0}
          borderBottomColor="$gray4"
        >
          <Text fontSize="$6" flexWrap="wrap">
            {value}
          </Text>
        </View>
      )}
    </XStack>
  )

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }} edges={['bottom']}>
      <Stack.Screen
        options={{
          title: 'Edit Profile',
          headerBackTitle: 'Back',
        }}
      />
      <ScrollView flexShrink={1}>
        <YStack pt="$3" gap="$2" justifyContent="center" alignItems="center">
          <Avatar circular size="$10" borderWidth={1} borderColor="$gray6">
            <Avatar.Image accessibilityLabel={user?.username} src={user?.avatar} />
            <Avatar.Fallback backgroundColor="$gray6" />
          </Avatar>

          <Button
            p="0"
            chromeless
            color="$blue9"
            fontWeight="bold"
            onPress={() => updateProfilePhoto()}
          >
            {user?.avatar.endsWith('default.jpg')
              ? 'Upload profile photo'
              : 'Update or delete profile photo'}
          </Button>
        </YStack>

        <Separator />

        <YStack gap="$0" pt="$2">
          <LinkField
            label="Name"
            value={user?.display_name}
            placeholder="Your name"
            path="/settings/updateName"
            border={true}
          />
          <LinkField
            label="Username"
            value={user?.username}
            placeholder="Your username"
            path=""
            border={true}
          />
          {/* <LinkField
            label="Pronouns"
            value={user?.pronouns.join(', ')}
            placeholder="Your pronouns"
            path=""
            border={true}
          /> */}
          <LinkField
            label="Bio"
            value={user?.note_text ? user?.note_text.slice(0, 30) : null}
            placeholder="Your bio"
            path="settings/bio"
            border={true}
          />

          <LinkField
            label="Website"
            value={user?.website}
            placeholder="Add your website"
            path=""
            border={false}
          />
        </YStack>

        <Separator />
      </ScrollView>
    </SafeAreaView>
  )
}
