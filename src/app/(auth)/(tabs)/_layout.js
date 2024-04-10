import { useAuth } from '@state/AuthProvider'
import { Link, Tabs, Redirect } from 'expo-router'
import { Pressable } from 'react-native'
import { Text } from 'tamagui'
import { Feather } from '@expo/vector-icons'

export default function AppLayout() {
  const { user, logout } = useAuth();

  // Only require authentication within the (app) group's layout as users
  // need to be able to access the (auth) group and sign in again.
  if (!user) {
    return <Redirect href="/login" />
  }
  return (
    <Tabs>
      <Tabs.Screen
        name="index"
        options={{
          tabBarShowLabel: false,
          headerShown: false,
          tabBarIcon: ({ color }) => <Feather name="home" size={26} />,
        }}
      />

      <Tabs.Screen
        name="search"
        options={{
          tabBarShowLabel: false,
          headerShown: false,
          tabBarIcon: ({ color }) => <Feather name="search" size={26} />,
        }}
      />

      <Tabs.Screen
        name="camera"
        options={{
          tabBarShowLabel: false,
          headerShown: false,
          tabBarIcon: ({ color }) => <Feather name="plus-square" size={26} />,
        }}
      />

      <Tabs.Screen
        name="discover"
        options={{
          tabBarShowLabel: false,
          headerShown: false,
          tabBarIcon: ({ color }) => <Feather name="compass" size={26} />,
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          tabBarShowLabel: false,
          headerShown: false,
          tabBarIcon: ({ color }) => <Feather name="user" size={26} />,
        }}
      />
    </Tabs>
  )
}



