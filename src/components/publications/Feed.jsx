import { useEffect, useState } from 'react'
import userAvatar from '../../assets/img/user.png'
import { deletePublication as deletePublicationRequest, getPublicationsByUser, getPublicationsFeed } from '../../api/backend'
import { useSession } from '../../context/SessionContext'
import { getAvatarUrl } from '../../helpers/avatar'
import { ImageLightbox } from '../common/ImageLightbox'
import { LoadingIndicator } from '../common/LoadingIndicator'
import { Modal } from '../common/Modal'

const formatRelativeDate = (date) => {
    const timestamp = new Date(date).getTime()
    if (!Number.isFinite(timestamp)) return ''

    const difference = (timestamp - Date.now()) / 1000
    const units = [
        ['year', 31536000],
        ['month', 2592000],
        ['week', 604800],
        ['day', 86400],
        ['hour', 3600],
        ['minute', 60]
    ]
    const relativeTime = new Intl.RelativeTimeFormat('es', { numeric: 'auto' })

    for (const [unit, seconds] of units) {
        if (Math.abs(difference) >= seconds) {
            return relativeTime.format(Math.round(difference / seconds), unit)
        }
    }

    return relativeTime.format(Math.round(difference), 'second')
}

const PublicationCards = ({ publications, fallbackAuthor, onDelete, deletingPublicationId, onOpenImage }) => publications.map((publication) => {
    const author = publication.user && typeof publication.user === 'object'
        ? publication.user
        : fallbackAuthor || {}
    const authorName = author.name || author.nick || 'Usuario'
    const authorAvatar = getAvatarUrl(author.image, userAvatar)

    return (
        <article className="posts__post" key={publication._id}>
            <div className="post__container">
                <div className="post__image-user">
                    <img className="post__user-image" src={authorAvatar} alt={`Foto de ${authorName}`} />
                </div>
                <div className="post__body">
                    <div className="post__user-info">
                        <span className="user-info__name">{authorName}</span>
                        {author.nick && <span className="user-info__divider">@{author.nick}</span>}
                        <time className="user-info__create-date" dateTime={publication.createdAt}>
                            {formatRelativeDate(publication.createdAt)}
                        </time>
                    </div>
                    <p className="post__content">{publication.text}</p>
                    {publication.file && (
                        <button
                            className="publication__image-trigger"
                            type="button"
                            aria-label="Ampliar imagen de la publicación"
                            onClick={() => onOpenImage({
                                src: `/api/show-image-publication/${encodeURIComponent(publication.file)}`,
                                alt: `Imagen de la publicación de ${authorName}`
                            })}
                        >
                            <img
                                className="publication__image"
                                src={`/api/show-image-publication/${encodeURIComponent(publication.file)}`}
                                alt=""
                                loading="lazy"
                            />
                        </button>
                    )}
                </div>
            </div>
            {onDelete && (
                <div className="post__buttons">
                    <button
                        className="post__button"
                        type="button"
                        aria-label="Eliminar publicación"
                        title="Eliminar publicación"
                        disabled={deletingPublicationId === publication._id}
                        onClick={() => onDelete(publication._id)}
                    >
                        <i
                            className={`fa-solid ${deletingPublicationId === publication._id ? 'fa-spinner fa-spin' : 'fa-trash-can'}`}
                            aria-hidden="true"
                        ></i>
                    </button>
                </div>
            )}
        </article>
    )
})

export const Feed = () => {
    const { session, refreshCounters } = useSession()
    const [publications, setPublications] = useState([])
    const [myPublications, setMyPublications] = useState([])
    const [page, setPage] = useState(1)
    const [pages, setPages] = useState(1)
    const [isLoading, setIsLoading] = useState(true)
    const [isLoadingMine, setIsLoadingMine] = useState(true)
    const [deletingPublicationId, setDeletingPublicationId] = useState(null)
    const [refreshVersion, setRefreshVersion] = useState(0)
    const [observedPublicationCount, setObservedPublicationCount] = useState(undefined)
    const [modal, setModal] = useState(null)
    const [selectedImage, setSelectedImage] = useState(null)
    const publicationCount = session.counters?.publications
    const userId = session.user?.id

    useEffect(() => {
        if (publicationCount === undefined) return

        if (observedPublicationCount === undefined) {
            setObservedPublicationCount(publicationCount)
            return
        }

        if (publicationCount !== observedPublicationCount) {
            setObservedPublicationCount(publicationCount)
            setPublications([])
            setPage(1)
            setRefreshVersion((version) => version + 1)
        }
    }, [observedPublicationCount, publicationCount])

    useEffect(() => {
        let isActive = true
        setIsLoading(true)

        getPublicationsFeed(page, session.token)
            .then((result) => {
                if (!isActive) return
                const newPublications = result.publications || []
                setPublications((current) => page === 1 ? newPublications : [...current, ...newPublications])
                setPages(Math.max(result.pages || 1, 1))
            })
            .catch((error) => {
                if (isActive) {
                    setModal({
                        type: 'error',
                        message: error instanceof Error ? error.message : 'No se pudieron cargar las publicaciones.'
                    })
                }
            })
            .finally(() => {
                if (isActive) setIsLoading(false)
            })

        return () => {
            isActive = false
        }
    }, [page, refreshVersion, session.token])

    useEffect(() => {
        if (!session.token || !userId) return undefined

        let isActive = true
        setIsLoadingMine(true)
        getPublicationsByUser(userId, session.token)
            .then((result) => {
                if (isActive) setMyPublications(result || [])
            })
            .catch((error) => {
                if (isActive) {
                    setModal({
                        type: 'error',
                        message: error instanceof Error ? error.message : 'No se pudieron cargar tus publicaciones.'
                    })
                }
            })
            .finally(() => {
                if (isActive) setIsLoadingMine(false)
            })

        return () => {
            isActive = false
        }
    }, [refreshVersion, session.token, userId])

    const refreshFeed = () => {
        setPublications([])
        setPage(1)
        setRefreshVersion((version) => version + 1)
    }

    const handleDeletePublication = async (publicationId) => {
        if (deletingPublicationId) return

        setDeletingPublicationId(publicationId)
        try {
            await deletePublicationRequest(publicationId, session.token)
            setMyPublications((current) => current.filter((publication) => publication._id !== publicationId))
            await refreshCounters()
        } catch (error) {
            setModal({
                type: 'error',
                message: error instanceof Error ? error.message : 'No se pudo eliminar la publicación.'
            })
        } finally {
            setDeletingPublicationId(null)
        }
    }

    const requestDeletePublication = (publicationId) => {
        setModal({
            type: 'info',
            title: 'Eliminar publicación',
            message: '¿Seguro que deseas borrar esta publicación?',
            confirmLabel: 'Aceptar',
            cancelLabel: 'Cancelar',
            onConfirm: () => handleDeletePublication(publicationId)
        })
    }

  return (
    <>
      <header className="content__header">
          <h1 className="content__title">Publicaciones</h1>
                    <button className="content__button feed__refresh-button" type="button" onClick={refreshFeed} disabled={isLoading}>
                        <i className={`fa-solid fa-arrows-rotate${isLoading ? ' fa-spin' : ''}`} aria-hidden="true"></i>
                        Actualizar
                    </button>
      </header>

            <div className="content__posts" aria-busy={isLoading}>
                {isLoading && publications.length === 0 && <LoadingIndicator label="Cargando publicaciones" />}
                {!isLoading && publications.length === 0 && (
                    <p className="feed__status">Todavía no hay publicaciones. Sigue a alguien o publica algo.</p>
                )}
                <PublicationCards publications={publications} onOpenImage={setSelectedImage} />
      </div>

            {page < pages && (
                <div className="content__container-btn">
                    <button
                        className="content__btn-more-post"
                        type="button"
                        disabled={isLoading}
                        onClick={() => setPage((current) => current + 1)}
                    >
                        {isLoading
                            ? <LoadingIndicator size="small" inline label="Cargando más publicaciones" />
                            : 'Ver más publicaciones'}
                    </button>
                </div>
            )}

            <section className="feed__own-publications">
                <header className="content__header">
                    <h2 className="content__title">Mis publicaciones</h2>
                </header>
                <div className="content__posts" aria-busy={isLoadingMine}>
                    {isLoadingMine && <LoadingIndicator label="Cargando tus publicaciones" />}
                    {!isLoadingMine && myPublications.length === 0 && (
                        <p className="feed__status">Todavía no has publicado nada.</p>
                    )}
                    {!isLoadingMine && (
                        <PublicationCards
                            publications={myPublications}
                            fallbackAuthor={session.user}
                            onDelete={requestDeletePublication}
                            deletingPublicationId={deletingPublicationId}
                            onOpenImage={setSelectedImage}
                        />
                    )}
                </div>
            </section>

            <Modal {...modal} onClose={() => setModal(null)} />
            <ImageLightbox
                src={selectedImage?.src}
                alt={selectedImage?.alt}
                onClose={() => setSelectedImage(null)}
            />
    </>
  )
}
