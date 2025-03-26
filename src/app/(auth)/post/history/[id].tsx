import { useQuery } from '@tanstack/react-query'
import { Stack, useLocalSearchParams, useNavigation } from 'expo-router'
import { useCallback, useLayoutEffect } from 'react'
import { ActivityIndicator, FlatList, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import ReadMore from 'src/components/common/ReadMore'
import { getStatusHistory } from 'src/lib/api'
import { _timeAgo, htmlToTextWithLineBreaks } from 'src/utils'
import { Separator, Text, View, XStack, YStack, useTheme } from 'tamagui'

export default function Page() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const navigation = useNavigation()
  const theme = useTheme()

  useLayoutEffect(() => {
    navigation.setOptions({ title: 'Post History', headerBackTitle: 'Back' })
  }, [navigation])

  const { isPending, isError, data, error } = useQuery({
    queryKey: ['getStatusHistory', id],
    queryFn: async () => {
      const res = await getStatusHistory(id)
      return res.reverse()
    },
  })

  const getDiff = (oldContent: string, newContent: string) => {
    const oldWords = oldContent.split(/\s+/)
    const newWords = newContent.split(/\s+/)
    const diff = []
    let i = 0
    let j = 0

    while (i < oldWords.length && j < newWords.length) {
      if (oldWords[i] === newWords[j]) {
        diff.push({ text: oldWords[i], type: 'same' })
        i++
        j++
      } else if (oldWords[i] !== newWords[j]) {
        diff.push({ text: oldWords[i], type: 'removed' })
        diff.push({ text: newWords[j], type: 'added' })
        i++
        j++
      }
    }

    while (i < oldWords.length) {
      diff.push({ text: oldWords[i], type: 'removed' })
      i++
    }
    while (j < newWords.length) {
      diff.push({ text: newWords[j], type: 'added' })
      j++
    }

    return diff
  }

  const HighlightedDiff = ({
    oldContent,
    newContent,
  }: { oldContent: string; newContent: string }) => {
    const diff = getDiff(oldContent, newContent)

    return (
      <>
        {diff.map((part, index) => (
          <Text
            key={index}
            flexWrap="wrap"
            fontSize="$3"
            allowFontScaling={false}
            color={theme.color?.val.default.val}
            style={[
              part.type === 'added' && styles.added,
              part.type === 'removed' && styles.removed,
            ]}
          >
            {part.text}
            <Text> </Text>
          </Text>
        ))}
      </>
    )
  }
  const RenderItem = useCallback(
    ({ item, index }) => {
      let prevData = index > 0 ? data[index - 1]?.content : null
      return (
        <View p="$5" bg={theme.background?.val.tertiary.val}>
          <YStack gap="$2">
            <XStack gap="$3" flexWrap="wrap">
              <Text fontWeight="bold" color={theme.color?.val.tertiary.val}>
                Version #{index + 1}
              </Text>
              <Text color={theme.color?.val.tertiary.val}>
                Post edited {_timeAgo(item?.created_at)}
              </Text>
            </XStack>
            {index > 0 ? (
              <ReadMore numberOfLines={3}>
                <HighlightedDiff
                  oldContent={htmlToTextWithLineBreaks(prevData)}
                  newContent={htmlToTextWithLineBreaks(item.content)}
                />
              </ReadMore>
            ) : (
              <ReadMore numberOfLines={3}>
                <Text
                  fontSize="$3"
                  allowFontScaling={false}
                  color={theme.color?.val.default.val}
                >
                  {htmlToTextWithLineBreaks(item.content)}
                </Text>
              </ReadMore>
            )}
          </YStack>
        </View>
      )
    },
    [data]
  )
  if (isPending) {
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
    <SafeAreaView style={{ flex: 1 }} edges={['bottom']}>
      <Stack.Screen
        options={{
          title: 'Post History',
          headerBackTitle: 'Back',
        }}
      />
      <FlatList data={data} renderItem={RenderItem} ItemSeparatorComponent={Separator} />
    </SafeAreaView>
  )
}
const styles = StyleSheet.create({
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
