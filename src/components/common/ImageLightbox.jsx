import { useEffect, useRef } from 'react'

export const ImageLightbox = ({ src, alt, onClose }) => {
  const dialogRef = useRef(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (src && dialog && !dialog.open) {
      dialog.showModal()
    }
  }, [src])

  if (!src) return null

  const closeLightbox = () => dialogRef.current?.close()

  const handleBackdropClick = (event) => {
    if (event.target !== event.currentTarget) return

    const bounds = event.currentTarget.getBoundingClientRect()
    const clickedOutside = event.clientX < bounds.left
      || event.clientX > bounds.right
      || event.clientY < bounds.top
      || event.clientY > bounds.bottom

    if (clickedOutside) closeLightbox()
  }

  return (
    <dialog
      ref={dialogRef}
      className="image-lightbox"
      aria-label={alt || 'Imagen ampliada'}
      onClick={handleBackdropClick}
      onClose={onClose}
    >
      <button
        className="image-lightbox__close"
        type="button"
        aria-label="Cerrar imagen ampliada"
        onClick={closeLightbox}
      >
        <i className="fa-solid fa-xmark" aria-hidden="true"></i>
      </button>
      <img className="image-lightbox__image" src={src} alt={alt || ''} />
    </dialog>
  )
}