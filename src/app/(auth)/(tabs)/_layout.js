import { useAuth } from '@state/AuthProvider'
import { Link, Tabs, Redirect } from 'expo-router'
import { Pressable } from 'react-native'
import { Text, View } from 'tamagui'
import { Feather } from '@expo/vector-icons'

export default function AppLayout() {
  const { user, logout } = useAuth()

  // Only require authentication within the (app) group's layout as users
  // need to be able to access the (auth) group and sign in again.
  if (!user) {
    return <Redirect href="/login" />
  }
  return (
    <Tabs screenOptions={{initialRouteName:"index", backBehavior:"order"}}>
      <Tabs.Screen
        name="index"
        options={{
          tabBarShowLabel: false,
          headerShown: false,
          tabBarIcon: ({ color }) => <Feather name="home" size={26} color={color} />,
        }}
      />

      <Tabs.Screen
        name="network"
        options={{
          tabBarShowLabel: false,
          headerShown: false,
          tabBarIcon: ({ color }) => <Feather name="users" size={23} color={color} />,
        }}
      />

      <Tabs.Screen
        name="camera"
        options={{
          tabBarShowLabel: false,
          headerShown: true,
          tabBarIcon: ({ color }) => (
            <View bg="$gray4" px="$3" py={4} borderRadius={5}>
              <Feather name="plus" size={26} color={color} />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="discover"
        options={{
          tabBarShowLabel: false,
          headerShown: false,
          tabBarIcon: ({ color }) => <Feather name="compass" size={26} color={color} />,
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          tabBarShowLabel: false,
          headerShown: false,
          tabBarIcon: ({ color }) => <Feather name="user" size={26} color={color} />,
        }}
      />
    </Tabs>
  )
}
