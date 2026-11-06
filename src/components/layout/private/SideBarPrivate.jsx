import { useRef, useState } from 'react'
import userAvatar from '../../../assets/img/user.png'
import { getAvatarUrl } from '../../../helpers/avatar'
import { createPublication, uploadPublicationImage } from '../../../api/backend'
import { useSession } from '../../../context/SessionContext'
import { LoadingIndicator } from '../../common/LoadingIndicator'
import { Modal } from '../../common/Modal'

export const SideBarPrivate = () => {
    const { session, refreshCounters } = useSession()
    const { name, nick, token, counters, countersLoading, countersError } = session
    const nickLength = (nick || 'usuario').length
    const nickSizeClass = nickLength > 24
        ? ' aside__nickname--compact'
        : nickLength > 14 ? ' aside__nickname--long' : ''
    const profileImage = getAvatarUrl(session.user?.image, userAvatar)
    const [postText, setPostText] = useState('')
    const [image, setImage] = useState(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [modal, setModal] = useState(null)
    const imageInputRef = useRef(null)
    const showCounter = (value, label) => countersLoading
        ? <LoadingIndicator size="small" inline showText={false} label={`Cargando ${label}`} />
        : countersError ? '-' : value ?? 0

    const handleImageChange = (event) => {
        const selectedImage = event.target.files?.[0]
        if (!selectedImage) return

        if (!selectedImage.type.startsWith('image/')) {
            setImage(null)
            event.target.value = ''
            setModal({ type: 'error', message: 'Solo puedes subir archivos de imagen.' })
            return
        }

        if (selectedImage.size > 5 * 1024 * 1024) {
            setImage(null)
            event.target.value = ''
            setModal({ type: 'error', message: 'La imagen no puede superar los 5 MB.' })
            return
        }

        setImage(selectedImage)
    }

    const handleSubmit = async (event) => {
        event.preventDefault()
        if (!postText.trim() || isSubmitting) return

        setIsSubmitting(true)
        let publicationCreated = false

        try {
            const publication = await createPublication(postText.trim(), token)
            publicationCreated = true

            let type = 'success'
            let message = 'Publicación creada correctamente.'
            if (image) {
                try {
                    await uploadPublicationImage(publication._id, image, token)
                } catch (error) {
                    type = 'error'
                    message = `La publicación se guardó, pero no se pudo subir la imagen: ${error.message}`
                }
            }

            setPostText('')
            setImage(null)
            if (imageInputRef.current) imageInputRef.current.value = ''
            setModal({ type, message })
        } catch (error) {
            setModal({
                type: 'error',
                message: error instanceof Error ? error.message : 'No se pudo crear la publicación.'
            })
        } finally {
            if (publicationCreated) await refreshCounters()
            setIsSubmitting(false)
        }
    }

  return (
    <>
        <aside className="layout__aside">

            <header className="aside__header">
                <h1 className="aside__title">
                    <span className="aside__greeting">Hola,</span>
                    <span className={`aside__nickname${nickSizeClass}`} title={nick || 'usuario'}>{nick || 'usuario'}</span>
                </h1>
            </header>

            <div className="aside__container">

                <div className="aside__profile-info">

                    <div className="profile-info__general-info">
                        <div className="general-info__container-avatar">
                            <img src={profileImage} className="container-avatar__img" alt="Foto de perfil" />
                        </div>

                        <div className="general-info__container-names">
                            <p className="container-names__name" title={name || 'Usuario'}>{name || 'Usuario'}</p>
                            <p className="container-names__nickname" title={nick || 'usuario'}>{nick || 'usuario'}</p>
                        </div>
                    </div>

                    <div className="profile-info__stats">

                        <div className="stats__following">
                            <a href="#" className="following__link">
                                <span className="following__title">Siguiendo</span>
                                <span className="following__number">{showCounter(counters?.following, 'seguidos')}</span>
                            </a>
                        </div>
                        <div className="stats__following">
                            <a href="#" className="following__link">
                                <span className="following__title">Seguidores</span>
                                <span className="following__number">{showCounter(counters?.followers, 'seguidores')}</span>
                            </a>
                        </div>


                        <div className="stats__following">
                            <a href="#" className="following__link">
                                <span className="following__title">Publicaciones</span>
                                <span className="following__number">{showCounter(counters?.publications, 'publicaciones')}</span>
                            </a>
                        </div>


                    </div>
                </div>


                <div className="aside__container-form">

                    <form className="container-form__form-post" onSubmit={handleSubmit}>

                        <div className="form-post__inputs">
                            <label htmlFor="post" className="form-post__label">¿Qué estás pensando hoy?</label>
                            <textarea
                                id="post"
                                name="post"
                                className="form-post__textarea"
                                value={postText}
                                onChange={(event) => setPostText(event.target.value)}
                                required
                            />
                        </div>

                        <div className="form-post__inputs">
                            <input
                                ref={imageInputRef}
                                id="image"
                                type="file"
                                name="image"
                                className="visually-hidden form-post__file-input"
                                accept="image/*"
                                onChange={handleImageChange}
                            />
                            <label htmlFor="image" className="form-post__file-picker">
                                <i className="fa-solid fa-camera" aria-hidden="true"></i>
                                Sube una imagen
                            </label>
                            {image && <span className="form-post__file-name">{image.name}</span>}
                        </div>

                        <button type="submit" className="form-post__btn-submit" disabled={!postText.trim() || isSubmitting}>
                            {isSubmitting
                                ? <LoadingIndicator size="small" inline label="Publicando" />
                                : 'Publicar'}
                        </button>

                    </form>

                </div>

            </div>

        </aside>
                <Modal
                        message={modal?.message}
                        type={modal?.type}
                        onClose={() => setModal(null)}
                />
    </>
  )
}
