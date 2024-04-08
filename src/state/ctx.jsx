import React from 'react'
import { useStorageState } from './useStorageState'
import { loginPreflightCheck, postForm } from '../requests'
import { Alert, Platform } from 'react-native'
import * as Linking from 'expo-linking'

const AuthContext = React.createContext({
  signIn: () => null,
  signOut: () => null,
  session: null,
  isLoading: false,
})

// This hook can be used to access the user info.
export function useSession() {
  const value = React.useContext(AuthContext)
  if (process.env.NODE_ENV !== 'production') {
    if (!value) {
      throw new Error('useSession must be wrapped in a <SessionProvider />')
    }
  }

  return value
}

export function SessionProvider(props) {
  const [[isLoading, session], setSession] = useStorageState('session')

  const handleLogin = async (server, email, password) => {
    const precheck = await loginPreflightCheck(server)
    const url = 'https://' + server
    if (!precheck) {
      return
    }

    const REDIRECT_URI = Linking.createURL('login')
    let app
    const formBody = {
      client_name: 'Pixelfed for ' + (Platform.OS == 'android' ? 'Android' : 'iOS'),
      redirect_uris: REDIRECT_URI,
      scopes: 'read write follow push admin:read admin:write',
      website: 'https://github.com/pixelfed/mobile-app',
    }
    app = await postForm(`${url}/api/v1/apps`, formBody)
      .then((resp) => resp.json())
      .then((res) => {
        res.instance = server
        return res
      })
    setSession('xxx')
  }

  return (
    <AuthContext.Provider
      value={{
        signIn: async (server, email, password) => {
          // Perform sign-in logic here
          await handleLogin(server, email, password)
        },
        signOut: () => {
          setSession(null)
        },
        session,
        isLoading,
      }}
    >
      {props.children}
    </AuthContext.Provider>
  )
}
