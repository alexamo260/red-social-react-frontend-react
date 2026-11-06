import { useEffect, useState } from 'react'
import userAvatar from '../../../assets/img/user.png'
import { getPrivateMessages } from '../../../api/backend'
import { useSession } from '../../../context/SessionContext'
import { getAvatarUrl } from '../../../helpers/avatar'
import { LoadingIndicator } from '../../common/LoadingIndicator'

const formatMessageDate = (value) => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''

  return new Intl.DateTimeFormat('es-ES', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(date)
}

export const MessagesPrivate = () => {
  const { session } = useSession()
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isActive = true

    const loadMessages = async () => {
      setIsLoading(true)
      setError('')
      try {
        const result = await getPrivateMessages(session.token)
        if (isActive) setMessages(Array.isArray(result) ? result : [])
      } catch (loadError) {
        if (isActive) {
          setError(loadError instanceof Error ? loadError.message : 'No se pudieron cargar los mensajes.')
        }
      } finally {
        if (isActive) setIsLoading(false)
      }
    }

    loadMessages()
    return () => {
      isActive = false
    }
  }, [session.token])

  return (
    <>
      <header className="content__header">
        <h1 className="content__title">Mensajes privados</h1>
      </header>
      <div className="content__posts messages">
        <section className="messages__panel" aria-labelledby="messages-inbox-title">
          <h2 className="messages__heading" id="messages-inbox-title">Mis mensajes recibidos</h2>
          {isLoading && <LoadingIndicator label="Cargando mensajes" />}
          {!isLoading && error && <p className="messages__notice messages__notice--error" role="alert">{error}</p>}
          {!isLoading && !error && messages.length === 0 && (
            <p className="messages__empty">Todavía no has recibido mensajes privados.</p>
          )}
          {!isLoading && !error && messages.length > 0 && (
            <ul className="messages__list">
              {messages.map((message) => {
                const sender = message.sender && typeof message.sender === 'object' ? message.sender : {}
                const messageDate = formatMessageDate(message.createdAt)

                return (
                  <li className="messages__item" key={message._id}>
                    <div className="messages__item-header">
                      <img className="messages__avatar" src={getAvatarUrl(sender.image, userAvatar)} alt="" />
                      <div className="messages__sender">
                        <span className="messages__sender-name">{sender.name || sender.nick || 'Usuario'}</span>
                        {sender.nick && <span className="messages__sender-nick">@{sender.nick}</span>}
                      </div>
                      {messageDate && <time className="messages__date" dateTime={message.createdAt}>{messageDate}</time>}
                    </div>
                    <p className="messages__text">{message.text}</p>
                  </li>
                )
              })}
            </ul>
          )}
        </section>
      </div>
    </>
  )
}