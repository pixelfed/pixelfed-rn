import { ListItem, ScrollView, YGroup } from 'tamagui'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Stack } from 'expo-router'
import { availableLocales } from 'src/lib/i18n'
import React from 'react'
import { Feather } from '@expo/vector-icons'
import { useI18n } from 'src/hooks/useI18n'
export default function Screen() {
  const { locale, setLocale, t, getLocaleLabel } = useI18n()

  const availableLocalesWithLabels = availableLocales
    .map((locale) => ({
      label: getLocaleLabel(locale),
      value: locale,
    }))
    .sort((a, b) => a.label.translated.localeCompare(b.label.translated))

  return (
    <SafeAreaView edges={['bottom']}>
      <Stack.Screen
        options={{
          title: t('settingsScreen.language'),
          headerBackTitle: 'Back',
        }}
      />

      <ScrollView flexShrink={1}>
        <YGroup>
          {availableLocalesWithLabels.map(({ value, label }) => (
            <YGroup.Item key={value}>
              <ListItem
                onPress={() => {
                  setLocale(value)
                }}
                title={label.translated}
                subTitle={label.original}
                iconAfter={
                  value === locale ? (
                    <Feather name="check-circle" color="green" size={16} />
                  ) : undefined
                }
              />
            </YGroup.Item>
          ))}
        </YGroup>
      </ScrollView>
    </SafeAreaView>
  )
}
