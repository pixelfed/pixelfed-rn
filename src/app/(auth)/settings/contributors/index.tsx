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
    'Double Platinum Sponsors 💠💠': [
      {
        name: 'Ben Perkins, @onequest',
        note: 'onequest.me',
        pixelfedUser: 'https://pixey.org/onequest',
      },
    ],

    'Platinum Sponsors 💠': [
      {
        name: 'Ani Betts',
      },
      {
        name: 'Ghost',
        note: 'https://ghost.org',
        pixelfedUser: '',
      },
    ],

    'Diamond Sponsors 💎': [
      {
        name: 'Revenni Inc',
        note: 'revenni.com',
        pixelfedUser: '',
      },
      {
        name: 'Chris Graham',
        note: '',
        pixelfedUser: '',
      },
      {
        name: 'Boomland Jenkins',
        note: '',
        pixelfedUser: '',
      },
      {
        name: 'PrivacySafe.app',
        note: '',
        pixelfedUser: '',
      },
      {
        name: 'Ma’moun Diraneyya',
        note: '',
        pixelfedUser: '',
      },
      {
        name: 'Fedica',
        note: 'fedica.com',
        pixelfedUser: '',
      },
      {
        name: 'iVeryAm',
        note: '',
        pixelfedUser: '',
      },
      {
        name: 'Streeternity',
        note: '',
        pixelfedUser: '',
      },
    ],

    'Gold Sponsors': [
      {
        name: 'Fake Craig Mills',
        note: '',
        pixelfedUser: '',
      },
    ],

    Sponsors: [
      {
        name: 'Fake Sheena Maddox',
        note: '',
        pixelfedUser: '',
      },
    ],
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
            for (const sponsor of originalNamesArray) {
              if (
                typeof sponsor.name === 'string' &&
                sponsor.name.toLowerCase().includes(lowerCasequery)
              ) {
                matchingNames.push(sponsor)
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
      <H4 color={theme.color?.val.default.val} ml="$3" mt="$4">
        Our amazing sponsors ! 🎉
      </H4>
      <H5 color={theme.color?.val.secondary.val} ml="$3" mt="$2" mb="$3">
        Your support makes all the difference—thank you for helping us achieve our goals!
        🚀
      </H5>
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
            .filter(([_, sponsors]) => sponsors.length > 0)
            .map(([sponsorType, sponsors]) => (
              <>
                <H5 color={theme.color?.val.default.val}>{sponsorType}</H5>
                <YGroup
                  borderWidth={1}
                  borderColor={theme.borderColor?.val.default.val}
                  key={sponsorType}
                  borderRadius="$8"
                  separator={
                    <Separator borderColor={theme.borderColor?.val.default.val} />
                  }
                >
                  {sponsors.map((sponsor, index) => (
                    <YGroup.Item key={index}>
                      <ListItem>
                        <YStack mt="$1" my="$1" space="$1">
                          <Text
                            my={sponsor.note ? '' : '$2'}
                            color={theme.color?.val.default.val}
                          >
                            {sponsor.name}
                          </Text>
                          {sponsor.note && (
                            <Text
                              mt="$1"
                              fontSize={13}
                              color={theme.color?.val.secondary.val}
                            >
                              {sponsor.note}
                            </Text>
                          )}
                        </YStack>
                      </ListItem>
                    </YGroup.Item>
                  ))}
                </YGroup>
              </>
            ))}
        </YStack>
      </ScrollView>
    </SafeAreaView>
  )
}
