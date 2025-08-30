import * as Linking from 'expo-linking'
import { router, useSegments } from 'expo-router'
import * as WebBrowser from 'expo-web-browser'
import { createContext, useCallback, useEffect } from 'react'
import { useContext, useState } from 'react'
import { Alert, Platform } from 'react-native'
import { get, loginPreflightCheck, postForm, verifyCredentials } from 'src/requests'
import { Storage } from './cache'
import { setGlobalLogoutFunction } from 'src/lib/api-context'

import { useQuery } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { getAccountById } from 'src/lib/api'
import type { Account, LoginUserResponse } from 'src/lib/api-types'

type User = {
  server: string
  token: string
}

type AuthProvider = {
  isLoading: boolean
  user: User | null
  login: (server: string, enabledScopes: string) => Promise<boolean>
  logout: () => void
  setUser: (newValue: User | null) => void
  userCache: LoginUserResponse | null
  loadUserCacheFromStorage: () => void
  handleRegistration: (server: string, token: string) => void
  invalidateCredentialsCache: () => void
}

// Cache credentials verification for 7 days (in milliseconds)
const CREDENTIALS_CACHE_DURATION = 7 * 24 * 60 * 60 * 1000

function isCredentialsCacheValid(): boolean {
  const lastVerified = Storage.getNumber('app.credentials_verified_at')
  if (!lastVerified) return false

  const now = Date.now()
  return now - lastVerified < CREDENTIALS_CACHE_DURATION
}

function markCredentialsAsVerified(): void {
  Storage.set('app.credentials_verified_at', Date.now())
}

function invalidateCredentialsCache(): void {
  Storage.delete('app.credentials_verified_at')
}

function useProtectedRoute(user: User | null, setUser: any, setIsLoading: any) {
  const segments = useSegments()

  useEffect(() => {
    const checkToken = async () => {
      try {
        const token = Storage.getString('app.token')
        const server = Storage.getString('app.instance')

        if (token && server && !user) {
          // Check if we have valid cached credentials
          if (isCredentialsCacheValid()) {
            // Use cached credentials without API call
            setUser({
              server: server,
              token: token,
            })
            setIsLoading(false)
            return
          }

          // Cache expired or doesn't exist, verify with server
          try {
            const userInfo = await verifyCredentials(server, token)
            if (userInfo) {
              markCredentialsAsVerified()
              setUser({
                server: server,
                token: token,
              })
            } else {
              // Invalid credentials
              invalidateCredentialsCache()
              setIsLoading(false)
            }
          } catch (error) {
            // Network error or server issues - use cached credentials if available
            const lastVerified = Storage.getNumber('app.credentials_verified_at')
            if (lastVerified) {
              console.warn(
                'Could not verify credentials with server, using cached state:',
                error
              )
              setUser({
                server: server,
                token: token,
              })
            } else {
              console.error(
                'No cached credentials and server verification failed:',
                error
              )
            }
            setIsLoading(false)
          }
        } else {
          setIsLoading(false)
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
  login: () => Promise.resolve(false),
  logout: () => {},
  setUser: (newValue: User | null) => {},
  userCache: null,
  loadUserCacheFromStorage: () => {},
  handleRegistration: () => {},
  invalidateCredentialsCache: () => {},
})

export function useAuth() {
  if (!useContext(AuthContext)) {
    throw new Error('useAuth must be used within a <AuthProvider />')
  }

  return useContext(AuthContext)
}

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [userCache, setUserCache] = useState<LoginUserResponse | null>(null)

  const loadUserCacheFromStorage = useCallback(() => {
    let saved = Storage.getString('user.profile')
    setUserCache(saved ? JSON.parse(saved) : null)
  }, [])

  useEffect(() => {
    loadUserCacheFromStorage()
  }, [loadUserCacheFromStorage])

  const handleRegistration = async (server: string, token: string) => {
    const profile = await verifyCredentials(server, token)

    if (profile) {
      markCredentialsAsVerified()
      setUserCache(profile)
      Storage.set('user.profile', JSON.stringify(profile))
      setUser({
        server,
        token,
      })
      return true
    }

    return false
  }

  const login = async (server: string, enabledScopes: string) => {
    const precheck = await loginPreflightCheck(server)
    const url = 'https://' + server
    if (!precheck) {
      return false
    }

    const REDIRECT_URI = Linking.createURL('login')
    let app
    const formBody = {
      client_name: 'Pixelfed for ' + (Platform.OS == 'android' ? 'Android' : 'iOS'),
      redirect_uris: REDIRECT_URI,
      scopes: enabledScopes,
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
        `&scope=${enabledScopes.split(' ').join('+')}` +
        `&redirect_uri=${REDIRECT_URI}` +
        `&response_type=code`,
      REDIRECT_URI,
      { showInRecents: true }
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

    if (queryParams?.message || queryParams?.error) {
      Alert.alert('Error', queryParams.message || queryParams.error)
      return
    }

    const instance = Storage.getString('app.instance')
    if (!instance) {
      throw new Error('instance missing')
    }
    const api = `https://${instance}`
    const clientId = Storage.getString('app.client_id')
    const clientSecret = Storage.getString('app.client_secret')

    const tokenRequestBody = {
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: REDIRECT_URI,
      grant_type: 'authorization_code',
      code: queryParams?.code,
      scope: 'read write follow push admin:read admin:write',
    }

    const token = await postForm(`${api}/oauth/token`, tokenRequestBody).then((resp) =>
      resp.json()
    )

    Storage.set('app.token', token.access_token)
    Storage.set('app.refresh_token', token.refresh_token)
    Storage.set('app.token_created_at', token.created_at)
    Storage.set('app.expires_in', token.expires_in)

    const profile: LoginUserResponse = await get(
      `${api}/api/v1/accounts/verify_credentials`,
      token.access_token,
      { _pe: 1 }
    ).then((resp: any) => resp.json())

    Storage.set('user.profile', JSON.stringify(profile))
    markCredentialsAsVerified()
    setUserCache(profile)

    setUser({
      server: instance,
      token: token.access_token,
    })

    return true
  }

  const logout = () => {
    setIsLoading(true)
    Storage.clearAll()
    setUser(null)
    setUserCache(null)
    setIsLoading(false)
  }

  // Register global logout function for ApiContext 401/403 handling
  useEffect(() => {
    setGlobalLogoutFunction(logout)
  }, [logout])

  useProtectedRoute(user, setUser, setIsLoading)

  return (
    <AuthContext.Provider
      value={{
        isLoading,
        user,
        login,
        logout,
        userCache,
        loadUserCacheFromStorage,
        handleRegistration,
        setUser,
        invalidateCredentialsCache,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useUserCache() {
  const { userCache } = useContext(AuthContext)
  if (!userCache) {
    throw new Error('Error: user info not available')
  }
  return userCache
}

export function useQuerySelfProfile() {
  const { userCache, loadUserCacheFromStorage } = useAuth()
  if (!userCache) {
    throw new Error('userCache not set')
  }

  const {
    data: user,
    isFetching,
    isFetchedAfterMount,
  } = useQuery<Account>({
    queryKey: ['profileById', userCache.id],
    queryFn: () => getAccountById(userCache.id),
    placeholderData: userCache,
  })

  useEffect(() => {
    if (user && isFetchedAfterMount) {
      Storage.set('user.profile', JSON.stringify({ ...userCache, ...user }))
      loadUserCacheFromStorage()
    }
  }, [user, isFetchedAfterMount])

  return { user, isFetching }
}
