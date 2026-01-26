import * as ImagePicker from 'expo-image-picker'
import { Stack, useLocalSearchParams, useRouter } from 'expo-router'
import mime from 'mime'
import React, { useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import ImageComponent from 'src/components/ImageComponent'
import { useProfileMutation } from 'src/hooks/mutations/useProfileMutation'
import { updateAvatar } from 'src/lib/api'
import { objectToForm } from 'src/requests'
import { useAuth } from 'src/state/AuthProvider'
import { Storage } from 'src/state/cache'
import { Text, useTheme } from 'tamagui'

const { width } = Dimensions.get('window')

const postRequest = async (
  domain: string,
  path: string,
  params = {},
  asForm = false,
  rawRes = false,
  _idempotency = false,
  appHeader = false
) => {
  let headers: Record<string, string> = {}
  const url = `https://${domain}/${path}`

  headers['Accept'] = 'application/json'
  headers['Content-Type'] = asForm ? 'multipart/form-data' : 'application/json'

  if (appHeader) {
    headers['X-PIXELFED-APP'] = '1'
  }

  const resp = await fetch(url, {
    method: 'POST',
    body: asForm ? objectToForm(params) : JSON.stringify(params),
    headers,
  })

  return rawRes ? resp : resp.json()
}

const VerificationStep = ({ onSubmit, isLoading, email, domain, updateCode }) => {
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const theme = useTheme()

  const handleSubmit = async () => {
    if (code.length !== 6) {
      setError('Please enter a valid 6-digit code')
      return
    }
    setError('')

    await postRequest(domain, 'api/auth/app-code-verify', {
      email: email,
      verify_code: code,
    })
      .then((res) => {
        if (res.status === 'success') {
          onSubmit(code)
          updateCode(code)
        } else {
          setError('Invalid code, please try again later')
        }
      })
      .catch((_err) => {
        setError('An error occured, please try again later')
      })
  }

  return (
    <View style={styles.stepContainer}>
      <Text style={styles.title} color={theme.color?.val.default.val}>
        Check your email
      </Text>
      <Text style={styles.subtitle} color={theme.color?.val.secondary.val}>
        We've sent a 6-digit code to{' '}
        <Text color={theme.color?.val.default.val} fontWeight="bold">
          {email}
        </Text>
      </Text>

      <TextInput
        style={styles.input}
        placeholder="000000"
        color={theme.color?.val.secondary.val}
        backgroundColor={theme.background?.val.default.val}
        borderColor={theme.borderColor?.val.default.val}
        placeholderTextColor="#666"
        keyboardType="number-pad"
        maxLength={6}
        value={code}
        onChangeText={setCode}
      />

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <TouchableOpacity
        style={[styles.button, { backgroundColor: theme.colorHover?.val.active.val }]}
        onPress={handleSubmit}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color={theme.color?.val.default.val} />
        ) : (
          <Text style={[styles.buttonText, { color: theme.color?.val.inverse.val }]}>
            Verify
          </Text>
        )}
      </TouchableOpacity>
    </View>
  )
}

const DetailsStep = ({ onSubmit, isLoading, domain, code, email, setLoading }) => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()
  const theme = useTheme()

  const handleSubmit = async () => {
    if (!username || !password || !displayName) {
      setError('All fields are required')
      return
    }
    setError('')
    setLoading(true)

    try {
      await postRequest(domain, 'api/auth/onboarding', {
        email: email,
        verify_code: code,
        username: username,
        name: displayName,
        password: password,
      })
        .then((res) => {
          if (res.status === 'success') {
            const tokenCreatedAt = new Date().toISOString().split('.')[0] + 'Z'
            const domain = res.domain
            const authToken = res.access_token
            Storage.set('app.token', res.access_token)
            Storage.set('app.refresh_token', res.refresh_token)
            Storage.set('app.token_created_at', tokenCreatedAt)
            Storage.set('app.expires_in', res.expires_in.toString())
            Storage.set('app.client_id', res.client_id.toString())
            Storage.set('app.client_secret', res.client_secret)
            Storage.set('app.instance', res.domain)
            Storage.set('app.name', 'Pixelfed')
            Storage.set('app.redirect_uri', 'pixelfed://login')
            onSubmit({ username, password, displayName, domain, authToken })
          } else {
            Alert.alert('Error', 'Invalid code, please try again later')
            router.back()
          }
        })
        .catch((_err) => {
          Alert.alert('Error', 'Invalid code, please try again later')
          router.back()
        })
    } catch (_error) {
      setError('An error occured.')
    }
  }

  return (
    <View style={styles.stepContainer}>
      <Text style={[styles.title, { color: theme.color?.val.default.val }]}>
        Complete your profile
      </Text>
      <Text style={[styles.subtitle, { color: theme.color?.val.secondary.val }]}>
        Choose how you'll appear in the community
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Username"
        placeholderTextColor="#666"
        backgroundColor={theme.background?.val.tertiary.val}
        borderColor={theme.borderColor?.val.default.val}
        color={theme.color?.val.default.val}
        autoCapitalize="none"
        autoComplete="off"
        maxLength={30}
        value={username}
        onChangeText={setUsername}
      />

      <Text
        style={[
          styles.subtitle,
          { fontSize: 14, marginTop: -10, color: theme.color?.val.tertiary.val },
        ]}
      >
        Username must be 2-30 characters long, start/end with a letter or number, contain
        at least one letter, and may include a single dash, underscore, or period.
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Display name"
        placeholderTextColor="#666"
        backgroundColor={theme.background?.val.tertiary.val}
        borderColor={theme.borderColor?.val.default.val}
        color={theme.color?.val.default.val}
        autoCapitalize="none"
        autoComplete="off"
        maxLength={30}
        value={displayName}
        onChangeText={setDisplayName}
      />

      <Text
        style={[
          styles.subtitle,
          { fontSize: 14, marginTop: -10, color: theme.color?.val.tertiary.val },
        ]}
      >
        Display names can be up to 30 characters long.
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#666"
        backgroundColor={theme.background?.val.tertiary.val}
        borderColor={theme.borderColor?.val.default.val}
        color={theme.color?.val.default.val}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <Text
        style={[
          styles.subtitle,
          { fontSize: 14, marginTop: -10, color: theme.color?.val.tertiary.val },
        ]}
      >
        Pick a secure password that is 8 characters or longer.
      </Text>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <TouchableOpacity
        style={[styles.button, { backgroundColor: theme.colorHover?.val.hover.val }]}
        onPress={handleSubmit}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color={theme.color?.val.inverse.val} />
        ) : (
          <Text style={[styles.buttonText, { color: theme.color?.val.inverse.val }]}>
            Create Account
          </Text>
        )}
      </TouchableOpacity>
    </View>
  )
}

const WelcomeStep = ({ onSubmit, isLoading, domain }) => {
  const [avatar, setAvatar] = useState(null)
  const [avatarPayload, setAvatarPayload] = useState(null)
  const [bio, setBio] = useState('')
  const [error, setError] = useState('')
  const theme = useTheme()

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
      setAvatar(result.assets[0].uri)
      let image = result.assets[0]
      const name = image.uri.split('/').slice(-1)[0]
      const payload = {
        uri: Platform.OS === 'ios' ? image.uri.replace('file://', '') : image.uri,
        type: mime.getType(image.uri),
        name: name,
      }
      setAvatarPayload(payload)
    }
  }

  const handleSubmit = async () => {
    setError('')
    try {
      onSubmit(avatarPayload, bio.length > 0 ? bio : false)
    } catch (_error) {
      setError('Failed to update profile. Please try again.')
    }
  }

  const handleSkip = () => {
    onSubmit()
  }

  return (
    <View style={styles.stepContainer}>
      <Text style={[styles.title, { color: theme.color?.val.default.val }]}>
        Welcome to Pixelfed!
      </Text>
      <Text style={[styles.subtitle, { color: theme.color?.val.tertiary.val }]}>
        Let's personalize your profile
      </Text>

      <TouchableOpacity onPress={pickImage} style={styles.avatarContainer}>
        {avatar ? (
          <ImageComponent source={{ uri: avatar }} style={styles.avatar} />
        ) : (
          <View
            style={[
              styles.avatarPlaceholder,
              { borderColor: theme.borderColor?.val.default.val },
            ]}
          >
            <Text
              style={[
                styles.avatarPlaceholderText,
                { color: theme.color?.val.tertiary.val },
              ]}
            >
              Add Photo
            </Text>
          </View>
        )}
      </TouchableOpacity>

      <View style={styles.bioContainer}>
        <TextInput
          style={[styles.input, styles.bioInput]}
          placeholder="Write a short bio..."
          placeholderTextColor="#666"
          backgroundColor={theme.background?.val.tertiary.val}
          borderColor={theme.borderColor?.val.default.val}
          color={theme.color?.val.default.val}
          multiline
          maxLength={150}
          value={bio}
          onChangeText={setBio}
        />
        <Text
          style={[styles.characterCount, bio.length >= 150 && styles.characterCountLimit]}
        >
          {bio.length}/150
        </Text>
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <TouchableOpacity
        style={[styles.button, { backgroundColor: theme.colorHover?.val.hover.val }]}
        onPress={handleSubmit}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color={theme.color?.val.inverse.val} />
        ) : (
          <Text style={[styles.buttonText, { color: theme.color?.val.inverse.val }]}>
            Complete Profile
          </Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.skipButton}
        onPress={handleSkip}
        disabled={isLoading}
      >
        <Text style={[styles.skipButtonText, { color: theme.color?.val.tertiary.val }]}>
          Skip for now
        </Text>
      </TouchableOpacity>
    </View>
  )
}

const SignUp = ({ navigation }) => {
  const params = useLocalSearchParams()
  const [code, setCode] = useState()
  const [currentStep, setCurrentStep] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [_email, _setEmail] = useState('')
  const { handleRegistration } = useAuth()
  const router = useRouter()
  const [authToken, setAuthToken] = useState(null)
  const [registeredDomain, setRegisteredDomain] = useState(null)
  const { profileMutation } = useProfileMutation({})
  const theme = useTheme()

  const slideAnim = React.useRef(new Animated.Value(0)).current

  const slideToNext = () => {
    Animated.timing(slideAnim, {
      toValue: -width * (currentStep + 1),
      duration: 300,
      useNativeDriver: true,
    }).start(() => {})
  }

  const handleVerificationSubmit = async (_code) => {
    setIsLoading(true)
    try {
      setCurrentStep(1)
      slideToNext()
    } catch (_error) {
    } finally {
      setIsLoading(false)
    }
  }

  const handleDetailsSubmit = async (details) => {
    setIsLoading(true)
    try {
      setAuthToken(details.authToken)
      setRegisteredDomain(details.domain)
      setCurrentStep(2)
      slideToNext()
    } catch (_error) {
    } finally {
      setIsLoading(false)
    }
  }

  const handleWelcomeSubmit = async (avatar = false, bio = false) => {
    setIsLoading(true)
    try {
      const updatePromises = []
      if (avatar) {
        updatePromises.push(updateAvatar({ avatar: avatar }))
      }
      if (bio && bio.length) {
        updatePromises.push(profileMutation.mutateAsync({ note: bio }))
      }
      if (updatePromises.length) {
        await Promise.all(updatePromises)
      }

      await handleRegistration(registeredDomain, authToken)

      router.replace('/(auth)/(tabs)/')
    } catch (_error) {
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background.val.default.val }]}
    >
      <Stack.Screen options={{ headerShown: false }} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Animated.View
              style={[
                styles.slider,
                {
                  transform: [{ translateX: slideAnim }],
                },
              ]}
            >
              <VerificationStep
                onSubmit={handleVerificationSubmit}
                isLoading={isLoading}
                email={params.email}
                domain={params.domain}
                updateCode={setCode}
              />

              <DetailsStep
                onSubmit={handleDetailsSubmit}
                setLoading={setIsLoading}
                isLoading={isLoading}
                email={params.email}
                domain={params.domain}
                code={code}
              />

              <WelcomeStep
                onSubmit={handleWelcomeSubmit}
                isLoading={isLoading}
                domain={registeredDomain}
              />
            </Animated.View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  container: {
    flex: 1,
  },
  slider: {
    flex: 1,
    flexDirection: 'row',
  },
  stepContainer: {
    width,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 32,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    fontSize: 16,
  },
  button: {
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    color: '#ff4444',
    marginBottom: 16,
  },
  avatarContainer: {
    alignSelf: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  avatarPlaceholderText: {
    fontSize: 16,
  },
  bioInput: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  skipButton: {
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  skipButtonText: {
    fontSize: 16,
  },
  bioContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  characterCount: {
    position: 'absolute',
    bottom: 0,
    right: 4,
    fontSize: 12,
  },
  characterCountLimit: {
    color: '#ff4444',
  },
})

export default SignUp
