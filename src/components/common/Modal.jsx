import { useEffect, useId, useRef } from 'react'

const modalTypes = {
  success: {
    title: 'Operación completada',
    icon: 'fa-circle-check'
  },
  error: {
    title: 'No se pudo completar la acción',
    icon: 'fa-circle-exclamation'
  },
  info: {
    title: 'Aviso',
    icon: 'fa-triangle-exclamation'
  }
}

export const Modal = ({
  message,
  type = 'info',
  title,
  onClose,
  onConfirm,
  confirmLabel = 'Aceptar',
  cancelLabel = 'Cancelar'
}) => {
  const dialogRef = useRef(null)
  const titleId = useId()
  const messageId = useId()
  const modalType = modalTypes[type] ? type : 'info'

  useEffect(() => {
    const dialog = dialogRef.current
    if (message && dialog && !dialog.open) {
      dialog.showModal()
    }
  }, [message])

  if (!message) return null

  const closeModal = () => dialogRef.current?.close()

  const confirmModal = () => {
    onConfirm?.()
    closeModal()
  }

  const handleDialogClick = (event) => {
    if (event.target !== event.currentTarget) return

    const bounds = event.currentTarget.getBoundingClientRect()
    const clickedOutside = event.clientX < bounds.left
      || event.clientX > bounds.right
      || event.clientY < bounds.top
      || event.clientY > bounds.bottom

    if (clickedOutside) closeModal()
  }

  return (
    <dialog
      ref={dialogRef}
      className={`app-modal app-modal--${modalType}`}
      aria-labelledby={titleId}
      aria-describedby={messageId}
      onClick={handleDialogClick}
      onClose={onClose}
    >
      <header className="app-modal__header">
        <span className="app-modal__icon" aria-hidden="true">
          <i className={`fa-solid ${modalTypes[modalType].icon}`}></i>
        </span>
        <h2 className="app-modal__title" id={titleId}>
          {title || modalTypes[modalType].title}
        </h2>
      </header>
      <p className="app-modal__message" id={messageId}>{message}</p>
      <div className="app-modal__actions">
        {onConfirm ? (
          <>
            <button className="app-modal__cancel" type="button" onClick={closeModal}>
              {cancelLabel}
            </button>
            <button className="app-modal__confirm" type="button" onClick={confirmModal}>
              {confirmLabel}
            </button>
          </>
        ) : (
          <button className="app-modal__close" type="button" onClick={closeModal}>
            Cerrar
          </button>
        )}
      </div>
    </dialog>
  )
}