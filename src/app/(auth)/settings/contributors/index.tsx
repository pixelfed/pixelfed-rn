import { router, Stack } from 'expo-router'
import React, { useCallback, useEffect, useState } from 'react'
import { PressableOpacity } from 'react-native-pressable-opacity'
import { SafeAreaView } from 'react-native-safe-area-context'
import {
  H4,
  H5,
  Input,
  ListItem,
  ScrollView,
  Separator,
  Text,
  useTheme,
  YGroup,
  YStack,
} from 'tamagui'

import newContributorsData from '../../../../../contributors.json'

const emojiMap = {
  'Double Platinum Sponsors': ' 💠💠',
  'Platinum Sponsors': ' 💠',
  'Diamond Sponsors': ' 💎',
}

export default function Screen() {
  const theme = useTheme()
  const [query, setQuery] = useState('')

  const contributors = newContributorsData[0] || {}

  const [searchedContributors, setSearchedContributors] = useState(contributors)

  useEffect(() => {
    if (!contributors) return

    if (query === '') {
      setSearchedContributors(contributors)
    } else {
      const newSearchedContributors = {}
      const lowerCasequery = query.toLowerCase()

      for (const key in contributors) {
        if (Object.hasOwn(contributors, key)) {
          const originalNamesArray = contributors[key]
          const matchingNames = []

          if (Array.isArray(originalNamesArray)) {
            for (const sponsor of originalNamesArray) {
              if (
                typeof sponsor.name === 'string' &&
                sponsor.name.toLowerCase().includes(lowerCasequery)
              ) {
                matchingNames.push(sponsor)
              }
            }
          }
          newSearchedContributors[key] = matchingNames
        }
      }
      setSearchedContributors(newSearchedContributors)
    }
  }, [query])

  const gotoUserProfile = useCallback((username: any) => {
    if (username !== '' && username !== undefined)
      router.push(`/profile/0?byUsername=${username}`)
  }, [])

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: theme.background?.val.default.val }}
      edges={['bottom']}
    >
      <Stack.Screen
        options={{
          title: 'Contributors',
          headerBackTitle: 'Back',
        }}
      />
      <H4 color={theme.color?.val.default.val} ml="$3" mt="$4">
        Our amazing sponsors ! 🎉
      </H4>
      <H5
        style={{ letterSpacing: -0.05 }}
        color={theme.color?.val.secondary.val}
        ml="$3"
        mt="$1"
      >
        Your support makes all the difference—thank you for helping us achieve our goals!
        🚀
      </H5>
      <Input
        placeholder="Search contributors"
        mx="$3"
        mt="$4"
        onChangeText={(text) => setQuery(text)}
        value={query}
        bg={theme.background?.val.tertiary.val}
        color={theme.color?.val.default.val}
        placeholderTextColor={theme.color?.val.tertiary.val}
        size="$5"
        borderRadius="$9"
      />
      <ScrollView flexShrink={1} showsVerticalScrollIndicator={false}>
        <YStack px="$5">
          {Object.entries(searchedContributors)
            .filter(([_, sponsors]) => sponsors.length > 0)
            .map(([sponsorType, sponsors]) => (
              <React.Fragment key={sponsorType}>
                <H5
                  style={{ letterSpacing: -0.05 }}
                  pt="$4"
                  pb="$1"
                  color={theme.color?.val.default.val}
                >
                  {sponsorType} {emojiMap[sponsorType]}
                </H5>
                <YGroup
                  borderWidth={1}
                  borderColor={theme.borderColor?.val.default.val}
                  borderRadius="$8"
                  separator={
                    <Separator borderColor={theme.borderColor?.val.default.val} />
                  }
                >
                  {sponsors.map((sponsor, index) => (
                    <PressableOpacity
                      key={`${sponsor.name}-${index}`}
                      onPress={() => gotoUserProfile(sponsor.pixelfedUser)}
                    >
                      <YGroup.Item>
                        <ListItem>
                          <YStack>
                            <Text
                              color={theme.color?.val.default.val}
                              numberOfLines={1}
                              ellipsizeMode="tail"
                            >
                              {sponsor.name}
                            </Text>
                            {sponsor.note && (
                              <Text
                                mt="$1.5"
                                fontSize={13}
                                color={theme.color?.val.secondary.val}
                                numberOfLines={1}
                                ellipsizeMode="tail"
                              >
                                {sponsor.note}
                              </Text>
                            )}
                          </YStack>
                        </ListItem>
                      </YGroup.Item>
                    </PressableOpacity>
                  ))}
                </YGroup>
              </React.Fragment>
            ))}
        </YStack>
      </ScrollView>
    </SafeAreaView>
  )
}
