import { useEffect, useRef, useState } from 'react'
import userAvatar from '../../assets/img/user.png'
import { getUserProfile, updateUserProfile, uploadUserAvatar } from '../../api/backend'
import { useSession } from '../../context/SessionContext'
import { getAvatarUrl } from '../../helpers/avatar'
import { LoadingIndicator } from '../common/LoadingIndicator'
import { Modal } from '../common/Modal'

const profileFields = ['name', 'nick', 'email']

const getProfileFields = (user = {}) => ({
  name: user.name || '',
  nick: user.nick || '',
  email: user.email || ''
})

export const Profile = () => {
  const { session, updateUser } = useSession()
  const [profile, setProfile] = useState(session.user)
  const [form, setForm] = useState(() => getProfileFields(session.user))
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [selectedAvatar, setSelectedAvatar] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState('')
  const [modal, setModal] = useState(null)
  const avatarInputRef = useRef(null)
  const avatarSrc = avatarPreview || getAvatarUrl(profile?.image, userAvatar)

  useEffect(() => {
    if (!selectedAvatar) {
      setAvatarPreview('')
      return undefined
    }

    const previewUrl = URL.createObjectURL(selectedAvatar)
    setAvatarPreview(previewUrl)
    return () => URL.revokeObjectURL(previewUrl)
  }, [selectedAvatar])

  useEffect(() => {
    let isActive = true
    setIsLoading(true)

    getUserProfile(session.user.id, session.token)
      .then(({ user }) => {
        if (!isActive) return
        setProfile(user)
        setForm(getProfileFields(user))
      })
      .catch((error) => {
        if (isActive) {
          setModal({
            type: 'error',
            message: error instanceof Error ? error.message : 'No se pudo cargar el perfil.'
          })
        }
      })
      .finally(() => {
        if (isActive) setIsLoading(false)
      })

    return () => {
      isActive = false
    }
  }, [session.token, session.user.id])

  const startEditing = () => {
    setForm(getProfileFields(profile))
    setIsEditing(true)
  }

  const cancelEditing = () => {
    setForm(getProfileFields(profile))
    setSelectedAvatar(null)
    if (avatarInputRef.current) avatarInputRef.current.value = ''
    setIsEditing(false)
  }

  const handleAvatarChange = (event) => {
    const image = event.target.files?.[0]
    if (!image) return

    if (!image.type.startsWith('image/') || image.size > 5 * 1024 * 1024) {
      setModal({ type: 'error', message: 'Selecciona una imagen válida de hasta 5 MB.' })
      event.target.value = ''
      return
    }

    setSelectedAvatar(image)
  }

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((currentForm) => ({ ...currentForm, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!isEditing || isSaving) return

    setIsSaving(true)
    try {
      const result = await updateUserProfile(session.user.id, form, session.token)
      let updatedUser = result.user
      setProfile(updatedUser)
      setForm(getProfileFields(updatedUser))
      updateUser(updatedUser)

      if (selectedAvatar) {
        const avatarResult = await uploadUserAvatar(session.user.id, selectedAvatar, session.token)
        updatedUser = avatarResult.user
      }

      setProfile(updatedUser)
      setForm(getProfileFields(updatedUser))
      updateUser(updatedUser)
      setSelectedAvatar(null)
      if (avatarInputRef.current) avatarInputRef.current.value = ''
      setIsEditing(false)
      setModal({
        type: 'success',
        message: selectedAvatar ? 'Perfil y foto actualizados correctamente.' : result.message || 'Perfil actualizado correctamente.'
      })
    } catch (error) {
      setModal({
        type: 'error',
        message: error instanceof Error ? error.message : 'No se pudo guardar el perfil.'
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <>
      <header className="content__header">
        <h1 className="content__title">Mi Perfil</h1>
      </header>

      {isLoading ? (
        <div className="profile__loading-state">
          <LoadingIndicator label="Cargando perfil" />
        </div>
      ) : (
        <form className="profile-form" onSubmit={handleSubmit}>
          <div className="profile-form__avatar-section">
            <img className="profile-form__avatar" src={avatarSrc} alt={`Foto de ${profile?.name || 'perfil'}`} />
            <div className="profile-form__avatar-controls">
              {isEditing ? (
                <>
                  <input
                    ref={avatarInputRef}
                    className="visually-hidden profile-form__avatar-input"
                    id="profile-avatar"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    disabled={isSaving}
                  />
                  <label className="profile-form__avatar-picker" htmlFor="profile-avatar">
                    <i className="fa-solid fa-camera" aria-hidden="true"></i>
                    Cambiar foto
                  </label>
                  <span className="profile-form__avatar-hint">Imagen de hasta 5 MB</span>
                </>
              ) : (
                <span className="profile-form__avatar-hint">Foto de perfil</span>
              )}
            </div>
          </div>
          {profileFields.map((field) => (
            <div className="profile-form__field" key={field}>
              <label htmlFor={`profile-${field}`}>
                {field === 'name' ? 'Nombre completo' : field === 'nick' ? 'Nombre de usuario' : 'Correo electrónico'}
              </label>
              <input
                id={`profile-${field}`}
                name={field}
                type={field === 'email' ? 'email' : 'text'}
                value={form[field]}
                onChange={handleChange}
                readOnly={!isEditing || isSaving}
                required
              />
            </div>
          ))}

          <div className="profile-form__actions">
            {isEditing ? (
              <>
                <button className="profile-form__cancel" type="button" onClick={cancelEditing} disabled={isSaving}>
                  Cancelar
                </button>
                <button type="submit" disabled={isSaving}>
                  {isSaving
                    ? <LoadingIndicator size="small" inline label="Guardando perfil" />
                    : 'Guardar cambios'}
                </button>
              </>
            ) : (
              <button type="button" onClick={startEditing}>
                <i className="fa-solid fa-pen-to-square" aria-hidden="true"></i>
                Editar
              </button>
            )}
          </div>
        </form>
      )}

      <Modal message={modal?.message} type={modal?.type} onClose={() => setModal(null)} />
    </>
  )
}