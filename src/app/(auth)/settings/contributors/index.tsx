import { Stack } from 'expo-router'
import React from 'react'
import { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import {
  H4,
  H5,
  Input,
  ListItem,
  ScrollView,
  Separator,
  Text,
  YGroup,
  YStack,
  useTheme,
} from 'tamagui'

export default function Screen() {
  const theme = useTheme()
  const [query, setQuery] = useState('')

  const contributors = {
    'Double Platinum Sponsor': ['Ben', 'Perkins', '@onequest'],
    'Platinum Sponsors': ['Ghost', 'Ani Betts'],
    'Diamond Sponsors': [
      'Revenni Inc',
      'Chris Graham',
      'Boomland Jenkins',
      'PrivacySafe.app',
      'Ma’moun Diraneyya',
      'Fedica',
      'iVeryAm',
    ],
    'Gold Sponsors': ['dummy', 'dummy', 'dummy', 'dummy', 'dummy', 'dummy', 'dummy'],
    Sponsors: ['dummy', 'dummy', 'dummy', 'dummy', 'dummy', 'dummy'],
  }

  const [searchedContributors, setSearchedContributors] = useState(contributors)

  useEffect(() => {
    if (query === '') {
      setSearchedContributors(contributors)
    } else {
      const newSearchedContributors = {}

      const lowerCasequery = query.toLowerCase()

      for (const key in contributors) {
        if (Object.hasOwnProperty.call(contributors, key)) {
          const originalNamesArray = contributors[key]
          const matchingNames = []
          if (Array.isArray(originalNamesArray)) {
            for (const name of originalNamesArray) {
              if (
                typeof name === 'string' &&
                name.toLowerCase().includes(lowerCasequery)
              ) {
                matchingNames.push(name)
              }
            }
          }
          setSearchedContributors(newSearchedContributors)
          newSearchedContributors[key] = matchingNames
        }
      }
    }
  }, [query])

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
      <H4 textAlign="center" color={theme.color?.val.default.val} mt="$4" mb="$4">
        A Heartfelt Thank You to Our Amazing Contributors!
      </H4>
      <Input
        placeholder="Search contributors"
        m="$3"
        onChangeText={(text) => setQuery(text)}
        value={query}
        bg={theme.background?.val.tertiary.val}
        color={theme.color?.val.default.val}
        placeholderTextColor={theme.color?.val.tertiary.val}
        size="$5"
      />
      <ScrollView flexShrink={1} showsVerticalScrollIndicator={false}>
        <YStack p="$5" gap="$4">
          {Object.entries(searchedContributors)
            .filter(([sponsorType, names]) => names.length > 0)
            .map(([sponsorType, names]) => (
              <YGroup
                borderWidth={1}
                borderColor={theme.borderColor?.val.default.val}
                key={sponsorType}
                borderRadius="$8"
                separator={<Separator borderColor={theme.borderColor?.val.default.val} />}
              >
                <YGroup.Item>
                  <ListItem jc="center">
                    <H5 color={theme.color?.val.default.val}>{sponsorType}</H5>
                  </ListItem>
                </YGroup.Item>
                {names.map((name, index) => (
                  <YGroup.Item key={index}>
                    <ListItem>
                      <Text color={theme.color?.val.default.val} textAlign="center">
                        {name}
                      </Text>
                    </ListItem>
                  </YGroup.Item>
                ))}
              </YGroup>
            ))}
        </YStack>
      </ScrollView>
    </SafeAreaView>
  )
}
