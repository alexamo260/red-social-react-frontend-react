import React, { useLayoutEffect } from 'react'
import { Feed } from '../components/publications/Feed'
import { Routes, Route, BrowserRouter, Navigate, useLocation } from 'react-router-dom'
import { LayoutPublic } from '../components/layout/public/LayoutPublic'
import { LayoutPrivate } from '../components/layout/private/LayoutPrivate'
import { Login } from '../components/users/Login'
import { Register } from '../components/users/Register'
import { People } from '../components/users/People'
import { Profile } from '../components/users/Profile'
import { MessagesPrivate } from '../components/layout/private/MessagesPrivate'
import { NotFound } from '../components/errors/NotFound'
import { useSession } from '../context/SessionContext'

const ScrollToTop = () => {
  const { pathname } = useLocation()

  useLayoutEffect(() => {
    const scrollContainer = document.querySelector('.layout__body')
    if (scrollContainer) scrollContainer.scrollTop = 0
  }, [pathname])

  return null
}

const RequireSession = ({ children }) => {
  const { session } = useSession()

  if (!session.token) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ sessionMessage: session.message || 'Inicia sesión para continuar.' }}
      />
    )
  }

  return children
}

const RedirectAuthenticated = ({ children }) => {
  const { session } = useSession()

  if (session.token) {
    return <Navigate to="/social/feed" replace />
  }

  return children
}

export const Routing = () => {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>

        <Route path="/" element={<LayoutPublic />}>
            <Route index element={<Login />} />
            <Route path="login" element={<Login />} />
            <Route
              path="register"
              element={
                <RedirectAuthenticated>
                  <Register />
                </RedirectAuthenticated>
              }
            />
            <Route path="*" element={<NotFound />} />
        </Route>

        <Route
          path="/social"
          element={
            <RequireSession>
              <LayoutPrivate />
            </RequireSession>
          }
        >
            <Route index element={<Feed />} />
            <Route path="feed" element={<Feed />} />
            <Route path="people" element={<People />} />
            <Route path="messages" element={<MessagesPrivate />} />
            <Route path="profile" element={<Profile />} />
        </Route>

      </Routes>
    </BrowserRouter>
  )
}
