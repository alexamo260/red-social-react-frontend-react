import { useEffect, useRef, useState } from 'react'
import userAvatar from '../../assets/img/user.png'
import { useForm } from '../../hooks/useForm'
import { registerUser } from '../../api/backend'
import { LoadingIndicator } from '../common/LoadingIndicator'
import { Modal } from '../common/Modal'

export const Register = () => {
  const { form, changed, resetForm } = useForm({
    name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  })

  const [nameTouched, setNameTouched] = useState(false)
  const [usernameTouched, setUsernameTouched] = useState(false)
  const [emailTouched, setEmailTouched] = useState(false)
  const [passwordTouched, setPasswordTouched] = useState(false)
  const [confirmPasswordTouched, setConfirmPasswordTouched] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [avatar, setAvatar] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState('')
  const [modal, setModal] = useState(null)
  const avatarInputRef = useRef(null)
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)
  const nameError = nameTouched && form.name.trim().length === 0
  const usernameError = usernameTouched && form.username.trim().length === 0
  const emailError = emailTouched && !emailValid
  const passwordError = passwordTouched && form.password.length === 0
  const confirmPasswordError = confirmPasswordTouched && form.confirmPassword.length === 0
  const passwordsMismatch = confirmPasswordTouched
    && form.confirmPassword.length > 0
    && form.confirmPassword !== form.password
  const canRegister = form.name.trim().length > 0
    && form.username.trim().length > 0
    && emailValid
    && form.password.length > 0
    && form.confirmPassword.length > 0
    && form.password === form.confirmPassword

  useEffect(() => {
    if (!avatar) {
      setAvatarPreview('')
      return undefined
    }

    const previewUrl = URL.createObjectURL(avatar)
    setAvatarPreview(previewUrl)
    return () => URL.revokeObjectURL(previewUrl)
  }, [avatar])

  const handleAvatarChange = (event) => {
    const image = event.target.files?.[0]
    if (!image) return

    if (!image.type.startsWith('image/') || image.size > 5 * 1024 * 1024) {
      setModal({ type: 'error', message: 'Selecciona una imagen válida de hasta 5 MB.' })
      event.target.value = ''
      return
    }

    setAvatar(image)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!canRegister || isSubmitting) return

    setIsSubmitting(true)
    setModal(null)

    try {
      const result = await registerUser(form, avatar)
      resetForm()
      setAvatar(null)
      if (avatarInputRef.current) avatarInputRef.current.value = ''
      setNameTouched(false)
      setUsernameTouched(false)
      setEmailTouched(false)
      setPasswordTouched(false)
      setConfirmPasswordTouched(false)
      setShowPassword(false)
      setShowConfirmPassword(false)
      setModal({
        type: 'success',
        message: result.message || 'Usuario registrado correctamente.'
      })
    } catch (error) {
      setModal({
        type: 'error',
        message: error instanceof Error ? error.message : 'No se pudo completar el registro.'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <main className="login-page register-page">
        <section className="login-page__form-section">
        <header className="content__header">
            <h1 className="content__title">Regístrate</h1>
        </header>
        <div className="content__posts">
          <form className="form form--register" onSubmit={handleSubmit}>
            <div className="form__group form__group--register-avatar">
              <label>Foto de perfil (opcional)</label>
              <div className="register-avatar__controls">
                <img
                  className="profile-form__avatar"
                  src={avatarPreview || userAvatar}
                  alt="Vista previa de la foto de perfil"
                />
                <div className="profile-form__avatar-controls">
                  <input
                    ref={avatarInputRef}
                    className="visually-hidden profile-form__avatar-input"
                    id="register-avatar"
                    type="file"
                    name="avatar"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    disabled={isSubmitting}
                  />
                  <label className="profile-form__avatar-picker" htmlFor="register-avatar">
                    <i className="fa-solid fa-camera" aria-hidden="true"></i>
                    Elegir foto
                  </label>
                  <span className="profile-form__avatar-hint">Imagen de hasta 5 MB</span>
                </div>
              </div>
            </div>
            <div className="form__group">
              <label htmlFor="name">Nombre completo</label>
              <input
                type="text"
                id="name"
                name="name"
                value={form.name}
                onChange={changed}
                onBlur={() => setNameTouched(true)}
                aria-invalid={nameError}
                aria-describedby={nameError ? 'name-error' : undefined}
                required
              />
              <div className="form__error-slot">
                {nameError && (
                  <p className="form__error" id="name-error" role="alert">
                    El nombre es obligatorio.
                  </p>
                )}
              </div>
            </div>
            <div className="form__group">
              <label htmlFor="username">Nombre de usuario</label>
              <input
                type="text"
                id="username"
                name="username"
                value={form.username}
                onChange={changed}
                onBlur={() => setUsernameTouched(true)}
                aria-invalid={usernameError}
                aria-describedby={usernameError ? 'username-error' : undefined}
                required
              />
              <div className="form__error-slot">
                {usernameError && (
                  <p className="form__error" id="username-error" role="alert">
                    El nombre de usuario es obligatorio.
                  </p>
                )}
              </div>
            </div>
            <div className="form__group">
              <label htmlFor="email">Correo electrónico</label>
              <input
                type="email"
                id="email"
                name="email"
                value={form.email}
                onChange={changed}
                onBlur={() => setEmailTouched(true)}
                aria-invalid={emailError}
                aria-describedby={emailError ? 'email-error' : undefined}
                required
              />
              <div className="form__error-slot">
                {emailError && (
                  <p className="form__error" id="email-error" role="alert">
                    {form.email.trim() ? 'Introduce un correo electrónico válido.' : 'El correo electrónico es obligatorio.'}
                  </p>
                )}
              </div>
            </div>
            <div className="form__group">
              <label htmlFor="password">Contraseña</label>
              <div className="form__password-field">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  autoComplete="new-password"
                  value={form.password}
                  onChange={changed}
                  onBlur={() => setPasswordTouched(true)}
                  aria-invalid={passwordError}
                  aria-describedby={passwordError ? 'password-error' : undefined}
                  required
                />
                <button
                  className="form__password-toggle"
                  type="button"
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  aria-pressed={showPassword}
                  onClick={() => setShowPassword((isVisible) => !isVisible)}
                >
                  <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`} aria-hidden="true"></i>
                </button>
              </div>
              <div className="form__error-slot">
                {passwordError && (
                  <p className="form__error" id="password-error" role="alert">
                    La contraseña es obligatoria.
                  </p>
                )}
              </div>
            </div>
            <div className="form__group">
              <label htmlFor="confirm-password">Repetir contraseña</label>
              <div className="form__password-field">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirm-password"
                  name="confirmPassword"
                  autoComplete="new-password"
                  value={form.confirmPassword}
                  onChange={changed}
                  onBlur={() => setConfirmPasswordTouched(true)}
                  aria-invalid={confirmPasswordError || passwordsMismatch}
                  aria-describedby={confirmPasswordError || passwordsMismatch ? 'confirm-password-error' : undefined}
                  required
                />
                <button
                  className="form__password-toggle"
                  type="button"
                  aria-label={showConfirmPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  aria-pressed={showConfirmPassword}
                  onClick={() => setShowConfirmPassword((isVisible) => !isVisible)}
                >
                  <i className={`fa-solid ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`} aria-hidden="true"></i>
                </button>
              </div>
              <div className="form__error-slot">
                {(confirmPasswordError || passwordsMismatch) && (
                  <p className="form__error" id="confirm-password-error" role="alert">
                    {confirmPasswordError ? 'Repite la contraseña.' : 'Las contraseñas no coinciden.'}
                  </p>
                )}
              </div>
            </div>
            <button type="submit" className="form__submit" disabled={!canRegister || isSubmitting}>
              {isSubmitting
                ? <LoadingIndicator size="small" inline label="Registrando usuario" />
                : 'Registrarse'}
            </button>
          </form>
        </div>
        </section>

        <aside className="register-invitation" aria-labelledby="register-invitation-title">
          <span className="register-invitation__divider" aria-hidden="true">
            <i className="fa-solid fa-wave-square"></i>
          </span>
          <div className="register-invitation__content">
            <p className="register-invitation__eyebrow">
              <span>WAVELY</span> / NUEVA CUENTA
            </p>
            <h2 className="register-invitation__title" id="register-invitation-title">
              Lo que viene<br />
              <span>merece ser</span><br />
              compartido
            </h2>
            <p className="register-invitation__copy">
              Crea tu perfil y dale un lugar a tus ideas, fotos y momentos.
            </p>
            <div className="register-invitation__signature">
              <i className="fa-solid fa-id-card" aria-hidden="true"></i>
              <span>Tu perfil. Tus reglas</span>
            </div>
            <span className="register-invitation__bottom-divider" aria-hidden="true">
              <i className="fa-solid fa-wave-square"></i>
            </span>
          </div>
        </aside>
      </main>
        <Modal
          message={modal?.message}
          type={modal?.type}
          onClose={() => setModal(null)}
        />
    </>
  )
}
