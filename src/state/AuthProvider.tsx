import { type ReactNode, createContext, useEffect } from 'react'
import { useContext, useState } from 'react'
import { router, useSegments } from 'expo-router'
import { loginPreflightCheck, postForm, get } from '@requests'
import * as Linking from 'expo-linking'
import { Storage } from './cache.js'
import * as WebBrowser from 'expo-web-browser'
import { Platform, Alert } from 'react-native'
import { verifyCredentials } from 'src/requests.js'

type User = {
  server: string
  token: string
}

type AuthProvider = {
  isLoading: boolean
  user: User | null
  login: (server: string) => boolean
  logout: () => void
  setUser: User | null
}

function useProtectedRoute(user: User | null, setUser: any, setIsLoading: any) {
  const segments = useSegments()

  useEffect(() => {
    const checkToken = async () => {
      try {
        const token = Storage.getString('app.token')
        const server = Storage.getString('app.instance')
        if (token && !user) {
          const userInfo = await verifyCredentials(server, token)
          if (userInfo) {
            setUser({
              server: server,
              token: token,
            })
          } else {
            setIsLoading(false)
          }
        }
      } catch (error) {
        setIsLoading(false)
        console.error('Failed to fetch token from MMKV:', error)
      }
    }
    checkToken()

    const inAuthGroup = segments[0] === '(auth)'

    setTimeout(() => {
      setIsLoading(false)
    }, 1000)
    if (!user && inAuthGroup) {
      router.replace('/login')
    } else if (user && !inAuthGroup) {
      router.replace('/(auth)/(tabs)/')
    }
  }, [user, segments, setUser, setIsLoading])
}

export const AuthContext = createContext<AuthProvider>({
  isLoading: true,
  user: null,
  login: () => false,
  logout: () => {},
  setUser: () => {},
})

export function useAuth() {
  if (!useContext(AuthContext)) {
    throw new Error('useAuth must be used within a <AuthProvider />')
  }

  return useContext(AuthContext)
}

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState<Boolean>(true)

  const login = async (server: string) => {
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
      website: 'https://github.com/pixelfed/pixelfed-rn',
    }
    app = await postForm(`${url}/api/v1/apps`, formBody)
      .then((resp: any) => resp.json())
      .then((res: any) => {
        res.instance = server
        let app = res
        Storage.set('app.client_id', app.client_id)
        Storage.set('app.client_secret', app.client_secret)
        Storage.set('app.instance', app.instance)
        Storage.set('app.name', app.name)
        Storage.set('app.redirect_uri', app.redirect_uri)
        return res
      })

    await WebBrowser.openAuthSessionAsync(
      `${url}/oauth/authorize` +
        `?client_id=${app.client_id}` +
        `&scope=read+write+follow+push+admin:read+admin:write` +
        `&redirect_uri=${REDIRECT_URI}` +
        `&response_type=code`,
      REDIRECT_URI
    ).then((res) => {
      if (res.type === 'success') {
        return _loginCallback(res.url)
      }
    })

    return true
  }

  const _loginCallback = async (url: any) => {
    const { path, queryParams } = Linking.parse(url)
    const REDIRECT_URI = Linking.createURL('login')

    if (queryParams.error) {
      Alert.alert('Error', 'An error occured when attempting to log in.')
      return
    }

    const instance = Storage.getString('app.instance')
    const api = `https://${instance}`
    const clientId = Storage.getString('app.client_id')
    const clientSecret = Storage.getString('app.client_secret')

    const tokenRequestBody = {
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: REDIRECT_URI,
      grant_type: 'authorization_code',
      code: queryParams.code,
      scope: 'read write follow push admin:read admin:write',
    }

    const token = await postForm(`${api}/oauth/token`, tokenRequestBody).then((resp) =>
      resp.json()
    )

    Storage.set('app.token', token.access_token)
    Storage.set('app.refresh_token', token.refresh_token)
    Storage.set('app.token_created_at', token.created_at)
    Storage.set('app.expires_in', token.expires_in)

    const profile = await get(
      `${api}/api/v1/accounts/verify_credentials`,
      token.access_token,
      { _pe: 1 }
    ).then((resp: any) => resp.json())

    Storage.set('user.profile', JSON.stringify(profile))

    setUser({
      server: instance,
      token: token.access_token,
    })

    return true
  }

  const logout = () => {
    setUser(null)
  }

  useProtectedRoute(user, setUser, setIsLoading)

  return (
    <AuthContext.Provider value={{ isLoading, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
