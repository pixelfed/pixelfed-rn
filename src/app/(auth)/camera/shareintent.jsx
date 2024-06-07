import { StyleSheet, Dimensions, ScrollView } from "react-native";
import { Button, Image, Text, View, YStack, XStack } from "tamagui";

import { Stack, useRouter } from "expo-router";
import { useShareIntentContext } from "expo-share-intent";
import { SafeAreaView } from "react-native-safe-area-context";

const SCREEN_WIDTH = Dimensions.get('screen').width

export default function ShareIntent() {
  const router = useRouter();
  const { 
    hasShareIntent, 
    shareIntent, 
    error, 
    resetShareIntent 
  } = useShareIntentContext();

  const shareToPost = () => {
    const payload = shareIntent?.files.map(f => {
      return {
        uri: f.path,
        width: f.width,
        height: f.height,
        size: f.size,
        mime: f.mimeType
      }
    })
    router.push({ pathname: '/camera/preview', params: { id: JSON.stringify(payload[0]) } })
  }



  return (
    <SafeAreaView flex={1} edges={['bottom']} style={{backgroundColor: 'white'}}>
        <Stack.Screen
            options={{
                title: "Share",
                headerBackTitle: 'Back',
            }}
        />
        <View style={styles.container}>
        {!hasShareIntent && <Text>No Share intent detected</Text>}

          {shareIntent?.files?.map((file) => (
            <View key={file.path} style={styles.imageWrapper}>
              <Image
                source={{ uri: file.path }}
                style={[styles.image]}
              />
            </View>
          ))}
        <YStack w={SCREEN_WIDTH} p="$5" gap="$3" flexShrink={1}>
          <Text style={[styles.error]}>{error}</Text>

          <Button bg="$blue9" color="white" size="$6" fontWeight="bold" onPress={() => shareToPost()}>Share as Post</Button>
          {/* <Button bg="$blue9" color="white" size="$6" fontWeight="bold">Share to Group</Button> */}
          {/* <XStack gap="$3">
            <Button flexGrow={1} bg="$blue9" color="white" size="$5" fontWeight="bold">Share to Story</Button>
            <Button bg="$blue9" color="white" size="$5" fontWeight="bold">Share to Collection</Button>
          </XStack> */}
        </YStack>
        </View>
        <YStack w={SCREEN_WIDTH} p="$5" gap="$2" flexShrink={1}>
          <XStack gap="$3" mt="$2">
            {hasShareIntent && (
              <Button flexGrow={1} size="$3" onPress={() => resetShareIntent()} fontWeight="bold">Cancel</Button>
            )}
            {/* <Button size="$3" onPress={() => router.replace("/")} fontWeight="bold">Go home</Button> */}
          </XStack>
        </YStack>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: SCREEN_WIDTH - 100,
    height: 200,
    resizeMode: "cover",
    flexShrink: 1,
  },
  imageWrapper: {
    width: SCREEN_WIDTH - 100,
    height: 200,
    borderColor: '#eee',
    borderWidth: 1,
    borderRadius: 10,
    overflow: 'hidden',
    padding: 5,
  },
  gap: {
    marginBottom: 20,
  },
  error: {
    color: "red",
  },
});