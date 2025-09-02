import { useQueryClient } from '@tanstack/react-query'
import * as ImagePicker from 'expo-image-picker'
import { Link, Stack, useNavigation } from 'expo-router'
import mime from 'mime'
import { useLayoutEffect } from 'react'
import {
  ActivityIndicator,
  Alert,
  type AlertButton,
  Platform,
  StyleSheet,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { deleteAvatar, updateAvatar } from 'src/lib/api'
import { useQuerySelfProfile } from 'src/state/AuthProvider'
import {
  Avatar,
  Button,
  ScrollView,
  Separator,
  Text,
  useTheme,
  View,
  XStack,
  YStack,
  ZStack,
} from 'tamagui'

type LinkFieldProps = {
  label: string
  value: string | undefined
  placeholder: string
  path: string
  accessibilityHint: string | undefined
}

export default function ProfilePage() {
  const navigation = useNavigation()
  const theme = useTheme()
  useLayoutEffect(() => {
    navigation.setOptions({ title: 'Edit Profile', headerBackTitle: 'Back' })
  }, [navigation])

  const queryClient = useQueryClient()
  const { user, isFetching } = useQuerySelfProfile()

  const updateProfilePhoto = () => {
    const isDefault = user?.avatar.includes('default.')
    const buttons: AlertButton[] = isDefault
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
      buttons
    )
  }

  const _deleteProfilePhoto = async () => {
    await deleteAvatar().then((_res) => {
      queryClient.invalidateQueries({ queryKey: ['profileById'] })
    })
  }

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      exif: false,
      selectionLimit: 1,
      quality: 0.5,
      legacy: true,
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
      }).then((_res) => {
        queryClient.invalidateQueries({ queryKey: ['profileById'] })
      })
    }
  }

  const LinkField = ({ label, value, placeholder, path, accessibilityHint }: LinkFieldProps) => (
    <XStack px="$3" py="$3" alignItems="flex-start" justifyContent="center">
      <Text w="25%" fontSize="$5" color={theme.color.val.tertiary.val} paddingTop="$3">
        {label}
      </Text>

      <Link accessibilityHint={accessibilityHint || ""} href={path} asChild>
        <View
          flex={1}
          borderColor={theme.borderColor?.val.default.val}
          borderWidth={1}
          borderRadius="$4"
          flexDirection="row"
          pressStyle={styles.pressStyle}
        >
          <Text
            fontSize="$5"
            p="$3"
            color={theme.color?.val.secondary.val}
            style={value ? styles.fieldValue : styles.placeholder}
          >
            {value || placeholder}
          </Text>
        </View>
      </Link>
    </XStack>
  )

  return (
    <SafeAreaView
      style={[styles.background, { backgroundColor: theme.background?.val.default.val }]}
      edges={['bottom']}
    >
      <Stack.Screen
        options={{
          title: 'Edit Profile',
          headerBackTitle: 'Back',
        }}
      />
      <ZStack flex={1}>
        {isFetching && (
          <ActivityIndicator
            style={styles.activityIndicator}
            color={theme.color?.val.default.val}
          />
        )}

        <ScrollView flexShrink={1}>
          <XStack padding="$3" gap="$4" alignItems="center">
            <Avatar
              circular
              size="$10"
              borderWidth={1}
              borderColor={theme.borderColor?.val.default.val}
            >
              <Avatar.Image accessibilityLabel={user?.username} src={user?.avatar} />
              <Avatar.Fallback backgroundColor={theme.background?.val.tertiary.val} />
            </Avatar>

            <YStack>
              <Text style={styles.username} color={theme.color?.val.default.val}>
                @{user?.username}
              </Text>
              <Button
                p="$0"
                chromeless
                color={theme.colorHover.val.active.val}
                fontWeight="bold"
                onPress={() => updateProfilePhoto()}
              >
                {user?.avatar.endsWith('default.jpg')
                  ? 'Upload profile photo'
                  : 'Update or delete profile photo'}
              </Button>
            </YStack>
          </XStack>

          <Separator borderColor={theme.borderColor?.val.default.val} />

          <YStack gap="$1">
            <LinkField
              label="Name"
              value={user?.display_name}
              path="/settings/updateName"
              placeholder="Real name"
              accessibilityHint="Edit profile name"
            />
            <LinkField
              label="Bio"
              value={user?.note_text}
              path="settings/updateBio"
              placeholder="Profile description"
              accessibilityHint="Edit profile description"
            />

            <LinkField
              label="Website"
              value={user?.website}
              path="settings/updateWebsite"
              placeholder="https://"
              accessibilityHint="Edit profile website"
            />
          </YStack>
        </ScrollView>
      </ZStack>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  activityIndicator: {
    padding: 8,
  },
  background: {
    flex: 1,
  },
  username: {
    fontWeight: 'bold',
    fontSize: 18,
  },
  fieldValue: {
    flex: 1,
    flexWrap: 'wrap',
  },
  placeholder: {
    flex: 1,
    flexWrap: 'wrap',
    color: 'gray',
  },
  pressStyle: {
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
})
