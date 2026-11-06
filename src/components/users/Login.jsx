import { useLayoutEffect, useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { loginUser as loginUserRequest } from '../../api/backend'
import { useSession } from '../../context/SessionContext'
import { useForm } from '../../hooks/useForm'
import { LoadingIndicator } from '../common/LoadingIndicator'
import { Modal } from '../common/Modal'

export const Login = () => {
  const { form, changed } = useForm({
    email: '',
    password: ''
  })
  const navigate = useNavigate()
  const location = useLocation()
  const { session, login, clearMessage } = useSession()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [modal, setModal] = useState(null)
  const [skipSessionRedirect, setSkipSessionRedirect] = useState(false)

  useLayoutEffect(() => {
    const message = location.state?.sessionMessage || session.message
    if (message) {
      setModal((currentModal) => currentModal || { type: 'info', message })
      clearMessage()
    }

    if (location.state?.sessionMessage) {
      navigate(location.pathname, { replace: true, state: null })
    }
  }, [clearMessage, location.pathname, location.state, navigate, session.message])

  const loginUser = async (event) => {
    event.preventDefault()
    if (isSubmitting) return

    setIsSubmitting(true)
    try {
      const result = await loginUserRequest(form)
      if (!result.token) {
        throw new Error('El backend no devolvió un token de sesión.')
      }

      setSkipSessionRedirect(true)
      login(result.token, result.user)
      setModal({
        type: 'success',
        message: result.message || 'Has iniciado sesión correctamente.'
      })
    } catch (error) {
      setModal({
        type: 'error',
        message: error instanceof Error ? error.message : 'No se pudo iniciar sesión.'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const closeModal = () => {
    const loginSucceeded = modal?.type === 'success'
    setModal(null)
    if (loginSucceeded) navigate('/social/feed')
  }

  if (session.token && !skipSessionRedirect) {
    return <Navigate to="/social/feed" replace />
  }

  return (
    <>
      <main className="login-page">
        <section className="login-page__form-section">
          <header className="content__header">
            <h1 className="content__title">Iniciar sesión</h1>
          </header>
          <div className="content__posts">
            <form className="login__form" onSubmit={loginUser}>
              <div className="form__group">
                <label htmlFor="email">Email:</label>
                <input type="email" id="email" name="email" value={form.email} onChange={changed} required />
              </div>
              <div className="form__group">
                <label htmlFor="password">Contraseña:</label>
                <div className="form__password-field">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={form.password}
                    onChange={changed}
                    autoComplete="current-password"
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
              </div>
              <button className="login__submit" type="submit" disabled={isSubmitting} aria-busy={isSubmitting}>
                {isSubmitting
                  ? <LoadingIndicator size="small" inline label="Iniciando sesión" />
                  : <>
                      <span>Iniciar sesión</span>
                      <i className="fa-solid fa-arrow-right" aria-hidden="true"></i>
                    </>}
              </button>
            </form>
          </div>
        </section>

        <aside className="login-welcome" aria-labelledby="login-welcome-title">
          <p className="login-welcome__eyebrow">
            <i className="fa-solid fa-wave-square" aria-hidden="true"></i>
            WAVELY SOCIAL
          </p>
          <h2 className="login-welcome__title" id="login-welcome-title">
            <span>Tus vibes</span><br />
            <span>Tu gente</span><br />
            <span>Tus momentos</span>
          </h2>
          <p className="login-welcome__copy">
            Una red social para compartir lo que te mueve, tal como lo vives
          </p>
          <div className="login-welcome__signature">
            <i className="fa-solid fa-camera-retro" aria-hidden="true"></i>
            <span>Comparte tu mundo</span>
          </div>
        </aside>
      </main>
      <Modal
        message={modal?.message}
        type={modal?.type}
        onClose={closeModal}
      />
    </>
  )
}
