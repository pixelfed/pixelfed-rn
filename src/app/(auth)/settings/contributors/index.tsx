import { Stack, router } from 'expo-router'
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
  YGroup,
  YStack,
  useTheme,
} from 'tamagui'

const newContributorsData = [
  {
    'Double Platinum Sponsors': [
      {
        name: 'Ben Perkins, @onequest',
        note: 'https://onequest.me',
        pixelfedUser: '@onequest@pixey.org',
      },
    ],
    'Platinum Sponsors': [
      {
        name: 'Ani Betts',
      },
      {
        name: 'Ghost',
        note: 'https://ghost.org',
        pixelfedUser: '',
      },
    ],
    'Diamond Sponsors': [
      {
        name: 'Revenni Inc',
        note: 'https://revenni.com',
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
        note: 'https://privacysafe.app',
        pixelfedUser: '',
      },
      {
        name: 'Ma’moun Diraneyya',
        note: '',
        pixelfedUser: '',
      },
      {
        name: 'Fedica',
        note: 'https://fedica.com',
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
        name: 'Sunken Castles, Evil Poodles',
        note: '',
        pixelfedUser: '',
      },
      {
        name: 'Studio MItte',
        note: '',
        pixelfedUser: '',
      },
      {
        name: 'Tramtrist',
        note: '',
        pixelfedUser: '',
      },
      {
        name: 'Charles Iliya Krempeaux',
        note: '@reiver',
        pixelfedUser: '',
      },
      {
        name: 'Boris van Hoytema',
        note: '',
        pixelfedUser: '',
      },
      {
        name: 'Wolfgang Maehr',
        note: '@njyo',
        pixelfedUser: '',
      },
      {
        name: 'Adam Wilbert',
        note: '',
        pixelfedUser: '',
      },
      {
        name: 'Strange Seawolf',
        note: '',
        pixelfedUser: '',
      },
      {
        name: 'Paulus Schoutsen',
        note: '',
        pixelfedUser: '',
      },
      {
        name: 'Ananas.eu',
        note: '',
        pixelfedUser: '',
      },
      {
        name: 'burrenperfumery',
        note: '',
        pixelfedUser: '',
      },
      {
        name: 'DBSnapper',
        note: '',
        pixelfedUser: '',
      },
      {
        name: 'Dan Tappan',
        note: '',
        pixelfedUser: '',
      },
      {
        name: 'Open Chapters',
        note: '',
        pixelfedUser: '',
      },
      {
        name: 'Evryway',
        note: '',
        pixelfedUser: '',
      },
      {
        name: 'The Daily Twerk',
        note: '',
        pixelfedUser: '',
      },
      {
        name: 'Justin Knol',
        note: '',
        pixelfedUser: '',
      },
      {
        name: 'Lester Ward',
        note: '',
        pixelfedUser: '',
      },
      {
        name: 'backroad.city',
        note: '',
        pixelfedUser: '',
      },
      {
        name: 'Jeffrey Paul',
        note: '',
        pixelfedUser: '',
      },
      {
        name: 'Bonn.digital',
        note: '',
        pixelfedUser: '',
      },
      {
        name: 'BjarkeSS',
        note: '',
        pixelfedUser: '',
      },
      {
        name: 'Antonios Chariton',
        note: '',
        pixelfedUser: '',
      },
      {
        name: 'MTJ Hendy',
        note: '',
        pixelfedUser: '',
      },
      {
        name: 'Robin Sorensen',
        note: '',
        pixelfedUser: '',
      },
      {
        name: 'nb',
        note: '',
        pixelfedUser: '',
      },
      {
        name: 'VP Computer Services Inc.',
        note: '',
        pixelfedUser: '',
      },
    ],
    Sponsors: [
      {
        name: 'Shlee (was here)',
        note: 'In all capacities in which they may exist.',
        pixelfedUser: '@shlee@pixelfed.au',
      },
      {
        name: 'Oliver Eichhorn',
        note: '',
        pixelfedUser: '',
      },
      {
        name: 'Will Shown',
        note: '',
        pixelfedUser: '',
      },
      {
        name: 'itsonlybrad',
        note: '',
        pixelfedUser: '',
      },
      {
        name: 'Jorge SoyDelBierzo',
        note: '',
        pixelfedUser: '',
      },
      {
        name: 'Alexandre Ignjatovic',
        note: '',
        pixelfedUser: '',
      },
      {
        name: 'Timothée Goguely',
        note: '',
        pixelfedUser: '',
      },
      {
        name: 'Mobian',
        note: '',
        pixelfedUser: '',
      },
      {
        name: 'Björn Láczay',
        note: '',
        pixelfedUser: '',
      },
      {
        name: 'Twistedpear',
        note: '',
        pixelfedUser: '',
      },
      {
        name: 'csgiles',
        note: '',
        pixelfedUser: '',
      },
      {
        name: 'Dave DeLong',
        note: '',
        pixelfedUser: '',
      },
      {
        name: 'Joshua Rose',
        note: '',
        pixelfedUser: '',
      },
      {
        name: 'Iotnerd',
        note: '@chaos.social',
        pixelfedUser: '',
      },
      {
        name: 'Josh Bernhard',
        note: '',
        pixelfedUser: '',
      },
      {
        name: 'Third Spruce Tree On the Left',
        note: '',
        pixelfedUser: '',
      },
      {
        name: 'Bryan Mitchell',
        note: '@PromptedInk',
        pixelfedUser: '',
      },
      {
        name: 'Vincent Picavet',
        note: '',
        pixelfedUser: '',
      },
      {
        name: 'Horst Thieme',
        note: '@ibigfoot',
        pixelfedUser: '',
      },
      {
        name: 'davetapley',
        note: '',
        pixelfedUser: '',
      },
      {
        name: 'Michael Kalus',
        note: '',
        pixelfedUser: '',
      },
      {
        name: 'Dave Rahardja',
        note: '',
        pixelfedUser: '',
      },
      {
        name: 'JMANIKAL',
        note: '',
        pixelfedUser: '',
      },
      {
        name: 'Mniot',
        note: '',
        pixelfedUser: '',
      },
      {
        name: 'JC Staudt',
        note: '',
        pixelfedUser: '',
      },
      {
        name: 'Brian Enigma',
        note: '',
        pixelfedUser: '',
      },
      {
        name: 'wiase',
        note: '@wiase',
        pixelfedUser: '',
      },
      {
        name: 'Carly "Karithina" Sheil',
        note: '',
        pixelfedUser: '',
      },
      {
        name: '50501chicago',
        note: '@masto.ai',
        pixelfedUser: '',
      },
      {
        name: 'HailSeitan',
        note: '',
        pixelfedUser: '',
      },
      {
        name: "Patrick O'Keefe",
        note: '',
        pixelfedUser: '',
      },
      {
        name: 'AlanH',
        note: '',
        pixelfedUser: '',
      },
      {
        name: 'Comrade',
        note: 'GO VEGAN',
        pixelfedUser: '',
      },
      {
        name: 'Jacob Tender',
        note: '',
        pixelfedUser: '',
      },
      {
        name: 'cnoceda',
        note: '@cnoceda',
        pixelfedUser: '',
      },
      {
        name: 'yatima_the_traveler',
        note: '',
        pixelfedUser: '',
      },
      {
        name: 'Mark Harviston',
        note: '',
        pixelfedUser: '',
      },
      {
        name: 'topazbytes',
        note: '',
        pixelfedUser: '',
      },
      {
        name: 'gheesh',
        note: '',
        pixelfedUser: '',
      },
      {
        name: 'Trae Palmer',
        note: '',
        pixelfedUser: '',
      },
      {
        name: 'Syniana',
        note: '',
        pixelfedUser: '',
      },
      {
        name: 'Karsten Janotta',
        note: '@karsten.janotta',
        pixelfedUser: '',
      },
      {
        name: 'RobinMonks.com',
        note: '',
        pixelfedUser: '',
      },
      {
        name: 'Cameron King',
        note: '',
        pixelfedUser: '',
      },
      {
        name: 'lucksidedown',
        note: '',
        pixelfedUser: '',
      },
      {
        name: 'Joe "madopal" Sislow',
        note: '',
        pixelfedUser: '',
      },
      {
        name: 'Timo Vesalainen',
        note: '',
        pixelfedUser: '',
      },
      {
        name: 'Kevin Yank',
        note: '',
        pixelfedUser: '',
      },
      {
        name: 'SFringer',
        note: '',
        pixelfedUser: '',
      },
      {
        name: 'Darren Ho',
        note: '',
        pixelfedUser: '',
      },
      {
        name: 'Jan Ferme',
        note: '',
        pixelfedUser: '',
      },
      {
        name: 'Cheng Soon Ong',
        note: '',
        pixelfedUser: '',
      },
      {
        name: 'Dan "DansNull" Long',
        note: '',
        pixelfedUser: '',
      },
      {
        name: 'Cameron Radmore',
        note: '',
        pixelfedUser: '',
      },
      {
        name: 'Joe Cravo',
        note: '',
        pixelfedUser: '',
      },
      {
        name: 'Lesley N-N',
        note: '',
        pixelfedUser: '',
      },
      {
        name: "Tristan 'ZDrilX' Zand",
        note: '',
        pixelfedUser: '',
      },
      {
        name: 'ImperatoMedia Productions',
        note: '',
        pixelfedUser: '',
      },
      {
        name: 'Luke Hanks',
        note: '',
        pixelfedUser: '',
      },
      {
        name: 'Frederick Ostrander',
        note: '',
        pixelfedUser: '',
      },
      {
        name: 'Wayne "the sane" Martin',
        note: '',
        pixelfedUser: '',
      },
      {
        name: 'Ole-Morten Duesund',
        note: '',
        pixelfedUser: '',
      },
      {
        name: 'Tanguy Fardet',
        note: '',
        pixelfedUser: '',
      },
      {
        name: 'Christoforus Benvenuto',
        note: '',
        pixelfedUser: '',
      },
      {
        name: 'Kunzkunst',
        note: '',
        pixelfedUser: '',
      },
      {
        name: 'manchicken',
        note: '',
        pixelfedUser: '',
      },
      {
        name: 'luc.eus',
        note: '',
        pixelfedUser: '',
      },
    ],
  },
]

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
        mb="$3"
      >
        Your support makes all the difference—thank you for helping us achieve our goals!
        🚀
      </H5>
      <Input
        placeholder="Search contributors"
        mx="$3"
        mt="$3"
        mb="$1"
        onChangeText={(text) => setQuery(text)}
        value={query}
        bg={theme.background?.val.tertiary.val}
        color={theme.color?.val.default.val}
        placeholderTextColor={theme.color?.val.tertiary.val}
        size="$5"
        borderRadius="$8"
      />
      <ScrollView flexShrink={1} showsVerticalScrollIndicator={false}>
        <YStack px="$5" py="$3">
          {Object.entries(searchedContributors)
            .filter(([_, sponsors]) => sponsors.length > 0)
            .map(([sponsorType, sponsors]) => (
              <>
                <H5
                  style={{ letterSpacing: -0.05 }}
                  pt="$2"
                  pb="$1"
                  color={theme.color?.val.default.val}
                >
                  {sponsorType} {emojiMap[sponsorType]}
                </H5>
                <YGroup
                  borderWidth={1}
                  borderColor={theme.borderColor?.val.default.val}
                  key={sponsorType}
                  borderRadius="$8"
                  separator={
                    <Separator borderColor={theme.borderColor?.val.default.val} />
                  }
                  mb="$2"
                >
                  {sponsors.map((sponsor, index) => (
                    <PressableOpacity
                      onPress={() => gotoUserProfile(sponsor.pixelfedUser)}
                    >
                      <YGroup.Item key={index}>
                        <ListItem>
                          <YStack my="$2">
                            <Text
                              my={sponsor.note ? '' : '$2'}
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
              </>
            ))}
        </YStack>
      </ScrollView>
    </SafeAreaView>
  )
}
