const BACKEND_DELAY_MS = 2000

const waitForBackendDelay = (delayMs = BACKEND_DELAY_MS) => new Promise((resolve) => {
  window.setTimeout(resolve, delayMs)
})

export const registerUser = async (form, avatar = null) => {
  const { name, username, email, password } = form

  await waitForBackendDelay()
  let options
  if (avatar) {
    const formData = new FormData()
    formData.append('name', name)
    formData.append('nick', username)
    formData.append('email', email)
    formData.append('password', password)
    formData.append('avatar', avatar)
    options = { method: 'POST', body: formData }
  } else {
    options = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, nick: username, email, password })
    }
  }

  const response = await fetch('/api/register-user', options)

  const result = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(result.message || 'No se pudo completar el registro.')
  }

  return result
}

export const loginUser = async ({ email, password }) => {
  await waitForBackendDelay()
  const response = await fetch('/api/login-user', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, password })
  })

  const result = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(result.message || 'No se pudo iniciar sesión.')
  }

  return result
}

export const getUserCounters = async (userId, token) => {
  return requestAuthenticated(`/api/counters/${encodeURIComponent(userId)}`, token, {}, 500)
}

export const getUserProfile = (userId, token) =>
  requestAuthenticated(`/api/profile/${encodeURIComponent(userId)}`, token)

export const updateUserProfile = (userId, userData, token) =>
  requestAuthenticated(`/api/edit-user/${encodeURIComponent(userId)}`, token, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData)
  })

export const uploadUserAvatar = (userId, image, token) => {
  const formData = new FormData()
  formData.append('avatar', image)

  return requestAuthenticated(`/api/upload-avatar/${encodeURIComponent(userId)}`, token, {
    method: 'POST',
    body: formData
  })
}

export const getPublicationsFeed = (page, token, filter = 'recent') =>
  requestAuthenticated(`/api/publications-feed/${page}?filter=${encodeURIComponent(filter)}`, token)

export const getPublicationsByUser = (userId, token) =>
  requestAuthenticated(`/api/list-publication-by-user/${encodeURIComponent(userId)}`, token)

export const deletePublication = (publicationId, token) =>
  requestAuthenticated(`/api/delete-publication/${encodeURIComponent(publicationId)}`, token, {
    method: 'DELETE'
  })

export const editPublication = (publicationId, text, token) =>
  requestAuthenticated(`/api/edit-publication/${encodeURIComponent(publicationId)}`, token, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text })
  })

export const likePublication = (publicationId, token) =>
  requestAuthenticated(`/api/like-publication/${encodeURIComponent(publicationId)}`, token, {
    method: 'POST'
  }, 0)

export const unlikePublication = (publicationId, token) =>
  requestAuthenticated(`/api/unlike-publication/${encodeURIComponent(publicationId)}`, token, {
    method: 'DELETE'
  }, 0)

const requestAuthenticated = async (url, token, options = {}, delayMs = BACKEND_DELAY_MS) => {
  if (delayMs > 0) await waitForBackendDelay(delayMs)
  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: token
    }
  })
  const result = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(result.message || result.error || 'No se pudo completar la petición.')
  }

  return result
}

export const getUsers = (page, search, token) =>
  requestAuthenticated(`/api/list-users/${page}?search=${encodeURIComponent(search)}`, token)

export const followUser = (userId, token) => requestAuthenticated('/api/save-follow', token, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ followed: userId })
}, 500)

export const unfollowUser = (userId, token) => requestAuthenticated('/api/unfollow', token, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ followed: userId })
}, 500)

export const getPrivateMessages = (token) => requestAuthenticated('/api/messages/inbox', token)

export const getFollowedUsers = (token) => requestAuthenticated('/api/messages/following', token)

export const sendPrivateMessage = (recipientId, text, token) => requestAuthenticated('/api/messages', token, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ recipientId, text })
})

export const createPublication = (text, token) => requestAuthenticated('/api/save-publication', token, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ text })
})

export const uploadPublicationImage = (publicationId, image, token) => {
  const formData = new FormData()
  formData.append('publication', image)

  return requestAuthenticated(`/api/upload-image-publication/${encodeURIComponent(publicationId)}`, token, {
    method: 'POST',
    body: formData
  })
}