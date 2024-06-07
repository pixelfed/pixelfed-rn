import { ActivityIndicator } from 'react-native'
import {
  Button,
  Text,
  View,
  YStack,
  XStack,
  Tabs,
  Separator,
  SizableText,
  H5,
} from 'tamagui'
import { Feather } from '@expo/vector-icons'
import { CameraView, useCameraPermissions } from 'expo-camera/next'
import React, { useMemo, useState, useCallback, useRef } from 'react'
import { StyleSheet, TouchableOpacity } from 'react-native'
import { router } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function App() {
  const cameraRef = useRef(null)
  const [facing, setFacing] = useState('back')
  const [flash, setFlash] = useState('auto')
  const [permission, requestPermission] = useCameraPermissions()

  if (!permission) {
    // Camera permissions are still loading
    return <View />
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet
    return (
      <View flexGrow={1} justifyContent='center' alignItems='center'>
        <YStack flexGrow={1} gap="$5" justifyContent='center' alignItems='center'>
          <YStack gap="$3" justifyContent='center' alignItems='center'>
            <Text fontSize="$9" fontWeight="bold">
              Enable Camera
            </Text>
            <Text fontSize="$6">
              We need your permission to enable Pixelfed Camera
            </Text>
          </YStack>
          <Button 
            alignSelf="stretch" 
            mx="$5" 
            mb="$3" 
            bg="$blue9" 
            color="white" 
            borderRadius={20} 
            size="$6" 
            onPress={requestPermission}>
            Grant Permission
          </Button>
        </YStack>
        <YStack alignSelf="stretch" gap="$3" justifyContent='center' alignItems='center'>
          <Separator alignSelf="stretch" borderColor="$gray8" borderWidth={0.5} />
        </YStack>
      </View>
    )
  }

  function toggleCameraFacing() {
    setFacing((current) => (current === 'back' ? 'front' : 'back'))
  }

  function toggleFlash() {
    setFlash((current) => (current === 'on' ? 'off' : 'on'))
  }

  const takePicture = async () => {
    const r = await cameraRef.current?.takePictureAsync()
    console.log(r)
    router.push({ pathname: '/camera/preview', params: { id: JSON.stringify(r) } })
  }

  const TabsContent = (props) => {
    return (
      <Tabs.Content
        backgroundColor="$background"
        key="tab3"
        padding="$2"
        alignItems="center"
        justifyContent="center"
        flex={1}
        borderColor="$background"
        borderRadius="$2"
        borderWidth="$2"
        {...props}
      >
        {props.children}
      </Tabs.Content>
    )
  }

  return (
    <SafeAreaView flex={1} edges={['top']}>
      <Tabs
        defaultValue="tab1"
        orientation="horizontal"
        flexDirection="column"
        flexGrow={1}
        overflow="hidden"
      >
        <TabsContent value="tab1">
          <H5>New story</H5>
          <ActivityIndicator />
        </TabsContent>

        <TabsContent value="tab2">
          <View style={styles.container}>
            <CameraView
              ref={cameraRef}
              style={styles.camera}
              facing={facing}
              flash={flash}
              enableTorch={flash}
            >
              <View style={styles.buttonContainer}>
                <XStack gap="$6">
                  <TouchableOpacity style={styles.button} onPress={toggleCameraFacing}>
                    <Feather name="refresh-cw" color="white" size={30} />
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.button} onPress={takePicture}>
                    <View style={styles.captureWrapper}>
                      <View style={styles.captureInner}></View>
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.button} onPress={toggleFlash}>
                    <Feather
                      name={flash === 'off' ? 'zap-off' : 'zap'}
                      color="white"
                      size={30}
                    />
                  </TouchableOpacity>
                </XStack>
              </View>
            </CameraView>
          </View>
        </TabsContent>

        <TabsContent value="tab3">
          <H5>New story</H5>
        </TabsContent>
        <Separator />
        <Tabs.List disablePassBorderRadius="top">
          <Tabs.Tab flex={1} value="tab1">
            <SizableText size="$5">Camera Roll</SizableText>
          </Tabs.Tab>
          <Tabs.Tab flex={1} value="tab2">
            <SizableText size="$5">Camera</SizableText>
          </Tabs.Tab>
          <Tabs.Tab flex={1} value="tab3">
            <SizableText size="$5">Story</SizableText>
          </Tabs.Tab>
        </Tabs.List>
      </Tabs>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    padding: 0,
    margin: 0,
  },
  camera: {
    flex: 1,
    borderRadius: 10,
    overflow: 'hidden',
  },
  buttonContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    backgroundColor: 'transparent',
    margin: 64,
    gap: 30,
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  captureWrapper: {
    width: 60,
    height: 60,
    borderRadius: 60,
    borderWidth: 5,
    borderColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureInner: {
    width: 25,
    height: 25,
    borderRadius: 25,
    backgroundColor: '#fff',
  },
})
