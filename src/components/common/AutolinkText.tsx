import React, { useMemo } from 'react'
import { Text, useTheme } from 'tamagui'

const mentionRegex = /@\w+(?:@\w+\.\w+(?:\.\w+)*)?/g
const hashtagRegex = /#[\p{L}\p{N}]+(?:[\p{L}\p{N}_-]*[\p{L}\p{N}])?/gu

interface Part {
  type: 'text' | 'mention' | 'hashtag',
  value: string,
}

interface Match extends Part {
  type: 'mention' | 'hashtag',
  index: number
}

const parseText = (text: string) => {
  const matches: Match[] = []
  let match

  while ((match = mentionRegex.exec(text)) !== null) {
    matches.push({ type: 'mention', value: match[0], index: match.index })
  }

  while ((match = hashtagRegex.exec(text)) !== null) {
    matches.push({ type: 'hashtag', value: match[0], index: match.index })
  }

  matches.sort((a, b) => a.index - b.index)

  return matches
}

interface AutolinkTextProps {
  username: string,
  text: string,
  onMentionPress: (mention: string) => void,
  onHashtagPress: (hashtag: string) => void,
  onUsernamePress: () => void,
}

export default function AutolinkText({
  username,
  text,
  onMentionPress,
  onHashtagPress,
  onUsernamePress,
}:AutolinkTextProps){
  const theme = useTheme()
  const matches = useMemo(() => parseText(text), [text])

  const getTextParts = (text: string, matches: Match[]) => {
    let lastIndex = 0
    const parts: Part[] = []

    matches.forEach((match) => {
      if (lastIndex < match.index) {
        parts.push({ type: 'text', value: text.slice(lastIndex, match.index) })
      }
      parts.push(match)
      lastIndex = match.index + match.value.length
    })

    if (lastIndex < text?.length) {
      parts.push({ type: 'text', value: text.slice(lastIndex) })
    }

    return parts
  }

  const parts = useMemo(() => getTextParts(text, matches), [text, matches])

  return (
    <Text fontSize="$5">
      {username ? (
        <Text fontSize="$5" fontWeight="bold" onPress={() => onUsernamePress()}>
          {username}{' '}
        </Text>
      ) : null}
      {parts &&
        parts.map((part, index) => {
          if (part.type === 'mention') {
            return (
              <Text
                key={index}
                onPress={() => onMentionPress(`${part.value}`)}
                fontSize="$5"
                color={theme.blue9}
              >
                {part.value}
              </Text>
            )
          }

          if (part.type === 'hashtag') {
            return (
              <Text
                key={index}
                onPress={() => onHashtagPress(`${part.value.slice(1)}`)}
                fontSize="$5"
                color={theme.blue9}
              >
                {part.value}
              </Text>
            )
          }

          return (
            <Text key={index} fontSize="$5">
              {part.value}
            </Text>
          )
        })}
    </Text>
  )
}

