import { useMemo } from 'react'
import { openBrowserAsync } from 'src/utils'
import { Text, useTheme } from 'tamagui'

const linkRegex =
  /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/g
const mentionRegex = /@[.\w]+(?:@\w+\.\w+(?:\.\w+)*)?/g
const hashtagRegex = /#[\p{L}\p{N}]+(?:[\p{L}\p{N}_-]*[\p{L}\p{N}])?/gu

export interface Part {
  type: 'text' | 'mention' | 'hashtag' | 'link'
  value: string
}

export interface Match extends Part {
  type: 'mention' | 'hashtag' | 'link'
  index: number
}

export function parseText(text: string) {
  const matches: Match[] = []
  let match: RegExpExecArray | null
  let linkRangeIndices: { start: number; end: number }[] = []

  while ((match = linkRegex.exec(text)) !== null) {
    matches.push({ type: 'link', value: match[0], index: match.index })
    linkRangeIndices.push({ start: match.index, end: match.index + match[0].length })
  }

  while ((match = mentionRegex.exec(text)) !== null) {
    // make sure it does not parse parts of links
    // for we check that the previous character needs to be a whitespace or the beginning of the text
    if (match.index == 0 || [' ', '\n'].includes(text[match.index - 1])) {
      matches.push({ type: 'mention', value: match[0], index: match.index })
    }
  }

  while ((match = hashtagRegex.exec(text)) !== null) {
    let matchIndex = (match as RegExpExecArray).index
    // make sure it does not parse parts of links
    if (
      linkRangeIndices.findLastIndex(
        ({ start, end }) => matchIndex > start && matchIndex < end
      ) === -1
    ) {
      matches.push({ type: 'hashtag', value: match[0], index: match.index })
    }
  }

  matches.sort((a, b) => a.index - b.index)

  return matches
}

export function getTextParts(text: string, matches: Match[]) {
  let lastIndex = 0
  const parts: Part[] = []

  matches.forEach((match) => {
    if (lastIndex < match.index) {
      parts.push({ type: 'text', value: text.slice(lastIndex, match.index) })
    }
    parts.push({ type: match.type, value: match.value })
    lastIndex = match.index + match.value.length
  })

  if (lastIndex < text?.length) {
    parts.push({ type: 'text', value: text.slice(lastIndex) })
  }

  return parts
}

interface AutolinkTextProps {
  text: string
  onMentionPress: (mention: string, is_local_mention: boolean) => void
  onHashtagPress: (hashtag: string) => void
}

interface AutolinkTextPropsWithUsername extends AutolinkTextProps {
  username: string
  onUsernamePress: () => void
}

export default function AutolinkText(
  props: AutolinkTextProps | AutolinkTextPropsWithUsername
) {
  const { text, onMentionPress, onHashtagPress } = props

  const { username, onUsernamePress } = props as AutolinkTextPropsWithUsername

  const theme = useTheme()
  const matches = useMemo(() => parseText(text), [text])

  const parts = useMemo(() => getTextParts(text, matches), [text, matches])

  return (
    <Text fontSize="$5" color={theme.color?.val.default.val}>
      {username ? (
        <Text
          fontSize="$5"
          fontWeight="bold"
          color={theme.color?.val.default.val}
          onPress={() => onUsernamePress()}
        >
          {username}{' '}
        </Text>
      ) : null}
      {parts &&
        parts.map((part, index) => {
          if (part.type === 'mention') {
            return (
              <Text
                key={index}
                onPress={() =>
                  onMentionPress(part.value, part.value.lastIndexOf('@') === 0)
                }
                fontSize="$5"
                color={theme.colorHover.val.active.val}
              >
                {part.value}
              </Text>
            )
          }

          if (part.type === 'hashtag') {
            return (
              <Text
                key={index}
                onPress={() => onHashtagPress(part.value.slice(1))}
                fontSize="$5"
                color={theme.colorHover.val.active.val}
              >
                {part.value}
              </Text>
            )
          }

          if (part.type === 'link') {
            return (
              <Text
                key={index}
                onPress={() => openBrowserAsync(part.value)}
                fontSize="$5"
                color={theme.colorHover.val.active.val}
              >
                {part.value}
              </Text>
            )
          }

          return (
            <Text key={index} fontSize="$5" color={theme.color?.val.default.val}>
              {part.value}
            </Text>
          )
        })}
    </Text>
  )
}

export function onMentionPressMethod(
  gotoUsernameProfile: (username: string) => void,
  authorAccountUrl: string
) {
  return (mention: string, is_username_local: boolean) => {
    let username = mention
    if (is_username_local) {
      const authors_homeserver = new URL(authorAccountUrl).hostname
      username = `${mention}@${authors_homeserver}`
    }
    gotoUsernameProfile(username)
  }
}
