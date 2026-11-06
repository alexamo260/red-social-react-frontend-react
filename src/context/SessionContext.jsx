import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { getUserCounters } from '../api/backend'
import { clearSession, getSessionStatus, saveSession } from '../helpers/session'

const SessionContext = createContext(null)

const emptySession = {
  token: null,
  user: null,
  name: null,
  nick: null,
  message: null
}

const withCountersState = (session) => ({
  ...session,
  counters: null,
  countersLoading: Boolean(session.token),
  countersError: null
})

export const SessionProvider = ({ children }) => {
  const [session, setSession] = useState(() => withCountersState(getSessionStatus()))
  const token = session.token
  const userId = session.user?.id

  const refreshCounters = useCallback(async () => {
    if (!token || !userId) return null

    setSession((current) => ({ ...current, countersLoading: true, countersError: null }))
    try {
      const counters = await getUserCounters(userId, token)
      setSession((current) => ({
        ...current,
        counters,
        countersLoading: false,
        countersError: null
      }))
      return counters
    } catch (error) {
      setSession((current) => ({
        ...current,
        counters: null,
        countersLoading: false,
        countersError: error instanceof Error ? error.message : 'No se pudieron cargar las estadísticas.'
      }))
      return null
    }
  }, [token, userId])

  useEffect(() => {
    if (token && userId) refreshCounters()
  }, [refreshCounters, token, userId])

  const login = (token, user) => {
    setSession(withCountersState(saveSession(token, user)))
  }

  const updateUser = (user) => {
    const updatedSession = saveSession(session.token, { ...session.user, ...user })
    setSession((current) => ({ ...current, ...updatedSession }))
  }

  const logout = (message = null) => {
    clearSession()
    setSession(withCountersState({ ...emptySession, message }))
  }

  const clearMessage = useCallback(() => {
    setSession((current) => ({ ...current, message: null }))
  }, [])

  return (
    <SessionContext.Provider value={{ session, login, updateUser, logout, clearMessage, refreshCounters }}>
      {children}
    </SessionContext.Provider>
  )
}

export const useSession = () => {
  const sessionContext = useContext(SessionContext)
  if (!sessionContext) {
    throw new Error('useSession debe utilizarse dentro de SessionProvider.')
  }

  return sessionContext
}