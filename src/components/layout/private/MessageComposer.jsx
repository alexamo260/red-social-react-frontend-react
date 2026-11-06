import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import userAvatar from '../../../assets/img/user.png'
import { getFollowedUsers, sendPrivateMessage } from '../../../api/backend'
import { useSession } from '../../../context/SessionContext'
import { getAvatarUrl } from '../../../helpers/avatar'
import { LoadingIndicator } from '../../common/LoadingIndicator'
import { Modal } from '../../common/Modal'

export const MessageComposer = () => {
  const { session } = useSession()
  const [followedUsers, setFollowedUsers] = useState([])
  const [recipientId, setRecipientId] = useState('')
  const [messageText, setMessageText] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState('')
  const [sendError, setSendError] = useState('')
  const [modal, setModal] = useState(null)

  useEffect(() => {
    let isActive = true

    const loadFollowedUsers = async () => {
      setIsLoading(true)
      setError('')
      try {
        const result = await getFollowedUsers(session.token)
        if (isActive) {
          const users = Array.isArray(result) ? result : []
          setFollowedUsers(users)
          setRecipientId(users[0]?._id ? String(users[0]._id) : '')
        }
      } catch (loadError) {
        if (isActive) {
          setError(loadError instanceof Error ? loadError.message : 'No se pudieron cargar las personas que sigues.')
        }
      } finally {
        if (isActive) setIsLoading(false)
      }
    }

    loadFollowedUsers()
    return () => {
      isActive = false
    }
  }, [session.token])

  const handleSendMessage = async (event) => {
    event.preventDefault()
    if (!recipientId || !messageText.trim() || isSending) return

    setIsSending(true)
    setSendError('')
    try {
      await sendPrivateMessage(recipientId, messageText.trim(), session.token)
      setMessageText('')
      setModal({ type: 'success', message: 'Mensaje enviado correctamente.' })
    } catch (sendError) {
      setSendError(sendError instanceof Error ? sendError.message : 'No se pudo enviar el mensaje.')
    } finally {
      setIsSending(false)
    }
  }

  return (
    <>
      <aside className="layout__aside messages__aside">
        <header className="messages__compose-header">
          <h2 className="messages__heading">Enviar mensaje privado</h2>
        </header>
        {isLoading && <LoadingIndicator label="Cargando personas que sigues" />}
        {!isLoading && error && <p className="messages__notice messages__notice--error" role="alert">{error}</p>}
        {!isLoading && !error && followedUsers.length === 0 && (
          <p className="messages__empty">
            Aún no sigues a nadie. Encuentra personas en <Link to="/social/people">Gente</Link> para escribirles.
          </p>
        )}
        {!isLoading && !error && followedUsers.length > 0 && (
          <form className="messages__form" onSubmit={handleSendMessage}>
            <fieldset className="messages__recipients">
              <legend>Elige destinatario</legend>
              <div className="messages__recipient-list">
                {followedUsers.map((user) => {
                  const userId = String(user._id)
                  const isSelected = recipientId === userId

                  return (
                    <label
                      className={`messages__recipient-option${isSelected ? ' is-selected' : ''}`}
                      key={userId}
                    >
                      <input
                        type="radio"
                        name="message-recipient"
                        value={userId}
                        checked={isSelected}
                        onChange={() => setRecipientId(userId)}
                        required
                      />
                      <img className="messages__avatar" src={getAvatarUrl(user.image, userAvatar)} alt="" />
                      <span className="messages__recipient-identity">
                        <span className="messages__recipient-nick">@{user.nick}</span>
                        <span className="messages__recipient-name">{user.name}</span>
                      </span>
                    </label>
                  )
                })}
              </div>
            </fieldset>
            <div className="messages__field">
              <label htmlFor="private-message">Mensaje</label>
              <textarea
                className="messages__textarea"
                id="private-message"
                value={messageText}
                onChange={(event) => setMessageText(event.target.value)}
                maxLength={2000}
                rows={4}
                placeholder="Escribe tu mensaje..."
                required
              />
            </div>
            <div className="messages__form-footer">
              <span className="messages__char-count">{messageText.length}/2000</span>
              <button
                className="content__button messages__send-button"
                type="submit"
                disabled={!recipientId || !messageText.trim() || isSending}
                aria-busy={isSending}
              >
                {isSending
                  ? <LoadingIndicator size="small" inline label="Enviando mensaje" />
                  : <><span>Enviar</span><i className="fa-regular fa-paper-plane" aria-hidden="true"></i></>}
              </button>
            </div>
            {sendError && <p className="messages__notice messages__notice--error" role="alert">{sendError}</p>}
          </form>
        )}
      </aside>
      <Modal message={modal?.message} type={modal?.type} onClose={() => setModal(null)} />
    </>
  )
}