import Feather from '@expo/vector-icons/Feather'
import { useAuth } from '@state/AuthProvider'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import React, { useState, useRef, useEffect } from 'react'
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  Pressable,
  TouchableWithoutFeedback,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Button, Input, Text, View, XStack, YStack } from 'tamagui'

export default function VerificationCodeScreen() {
  const router = useRouter()
  const { server } = useLocalSearchParams()
  const { login } = useAuth()

  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const emailInputRef = useRef(null)

  const navigateBack = () => {
    router.back()
  }

  const handleSubmit = async () => {
    if (!email.trim()) {
      setError('Please enter your email address')
      emailInputRef.current?.focus()
      return
    }

    setLoading(true)
    setError('')

    try {
      const params = {
        domain: server,
        email: email,
        expires_in: 14400,
        status: 'success',
      }
      const q = new URLSearchParams(params)
      const finalPath = `/verifyEmail?${q.toString()}`
      router.push(finalPath)
    } catch (error) {
      console.error('Error verifying code:', error)
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView
        style={{
          backgroundColor: 'black',
          flexGrow: 1,
        }}
        edges={['top']}
      >
        <StatusBar style="light" />

        <YStack px="$4" pt="$4" pb="$6" space="$4" flexGrow={1}>
          <XStack alignItems="center">
            <Pressable onPress={navigateBack}>
              <Feather name="arrow-left" size={24} color="white" />
            </Pressable>
            <Text
              fontSize="$6"
              fontWeight="bold"
              color="white"
              textAlign="center"
              flex={1}
            >
              Sign Up Verification
            </Text>
            <View width={24} />
          </XStack>

          <YStack space="$6" mt="$6">
            <YStack>
              <Text fontSize="$5" fontWeight="bold" color="white" mb="$2">
                Enter Verification Details
              </Text>
              <Text color="$gray5" mb="$4">
                Please enter the email you used to sign up.
              </Text>
            </YStack>

            <YStack space="$4">
              <YStack space="$2">
                <Text color="$gray5">Email Address</Text>
                <Input
                  ref={emailInputRef}
                  size="$4"
                  borderWidth={1}
                  borderColor="$gray8"
                  borderRadius={8}
                  backgroundColor="#111"
                  color="white"
                  placeholder="your@email.com"
                  placeholderTextColor="#666"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </YStack>
            </YStack>

            {error ? (
              <Text color="$red9" fontSize="$4" textAlign="center">
                {error}
              </Text>
            ) : null}

            <Button
              backgroundColor="$blue9"
              color="white"
              size="$5"
              fontWeight="bold"
              onPress={handleSubmit}
              disabled={loading}
              mt="$4"
            >
              {loading ? <ActivityIndicator color="white" /> : 'Verify Account'}
            </Button>

            <View alignItems="center">
              <Text color="$gray6" fontSize="$3" textAlign="center" mt="$2">
                Didn't receive a code?
              </Text>
              <Pressable onPress={navigateBack}>
                <Text color="$blue9" fontWeight="bold" fontSize="$3" mt="$2">
                  Go back to signup and request a new code
                </Text>
              </Pressable>
            </View>
          </YStack>
        </YStack>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  )
}
