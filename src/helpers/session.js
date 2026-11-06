const sessionKeys = ['token', 'user', 'tokenExpiresAt']

const clearStoredSession = () => {
  sessionKeys.forEach((key) => {
    try {
      window.localStorage.removeItem(key)
    } catch {
      return
    }
  })
}

const decodeTokenPayload = (token) => {
  const payloadPart = token.split('.')[1]
  if (!payloadPart) throw new Error('Invalid token')

  const base64Payload = payloadPart.replace(/-/g, '+').replace(/_/g, '/')
  const paddedPayload = base64Payload.padEnd(Math.ceil(base64Payload.length / 4) * 4, '=')
  const binaryPayload = window.atob(paddedPayload)
  const payloadBytes = Uint8Array.from(binaryPayload, (character) => character.charCodeAt(0))
  return JSON.parse(new TextDecoder().decode(payloadBytes))
}

const normalizeUser = (user = {}, payload = {}) => ({
  id: user._id ?? user.id ?? payload.id ?? null,
  name: user.name ?? payload.name ?? null,
  nick: user.nick ?? payload.nick ?? null,
  email: user.email ?? payload.email ?? null,
  role: user.role ?? payload.role ?? null,
  image: user.image ?? payload.image ?? null
})

export const saveSession = (token, user) => {
  const payload = decodeTokenPayload(token)
  const expiresAt = Number(payload.exp) * 1000
  if (!Number.isFinite(expiresAt) || expiresAt <= Date.now()) {
    throw new Error('El token de sesión no es válido o ha caducado.')
  }

  const userData = normalizeUser(user, payload)

  try {
    window.localStorage.setItem('token', token)
    window.localStorage.setItem('user', JSON.stringify(userData))
    window.localStorage.setItem('tokenExpiresAt', String(expiresAt))
  } catch {
    clearStoredSession()
    throw new Error('No se pudo guardar la sesión en este navegador.')
  }

  return { token, user: userData, name: userData.name, nick: userData.nick, message: null }
}

export const clearSession = clearStoredSession

export const getSessionStatus = () => {
  try {
    const token = window.localStorage.getItem('token')
    if (!token) {
      clearStoredSession()
      return { token: null, user: null, name: null, nick: null, message: null }
    }

    let user = JSON.parse(window.localStorage.getItem('user') || 'null')
    let expiresAt = Number(window.localStorage.getItem('tokenExpiresAt'))

    if (!user || !expiresAt) {
      const payload = decodeTokenPayload(token)
      expiresAt = Number(payload.exp) * 1000
      user = normalizeUser({}, payload)
      window.localStorage.setItem('user', JSON.stringify(user))
      window.localStorage.setItem('tokenExpiresAt', String(expiresAt))
    }

    if (!Number.isFinite(expiresAt) || expiresAt <= Date.now()) {
      clearStoredSession()
      return {
        token: null,
        user: null,
        name: null,
        nick: null,
        message: 'Tu sesión ha caducado. Inicia sesión de nuevo.'
      }
    }

    return { token, user, name: user.name, nick: user.nick, message: null }
  } catch {
    clearStoredSession()
    return {
      token: null,
      user: null,
      name: null,
      nick: null,
      message: 'La sesión guardada no es válida. Inicia sesión de nuevo.'
    }
  }
}