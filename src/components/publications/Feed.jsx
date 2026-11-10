import { useEffect, useState } from 'react'
import userAvatar from '../../assets/img/user.png'
import {
    deletePublication as deletePublicationRequest,
    editPublication as editPublicationRequest,
    getPublicationsByUser,
    getPublicationsFeed,
    likePublication as likePublicationRequest,
    unlikePublication as unlikePublicationRequest
} from '../../api/backend'
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

const PublicationCards = ({
    publications,
    fallbackAuthor,
    currentUserId,
    allowManage = false,
    onDelete,
    deletingPublicationId,
    onOpenImage,
    onLike,
    likingPublicationIds,
    editingPublicationId,
    editText,
    onEditTextChange,
    onStartEdit,
    onCancelEdit,
    onSaveEdit,
    savingPublicationId
}) => publications.map((publication) => {
    const author = publication.user && typeof publication.user === 'object'
        ? publication.user
        : fallbackAuthor || {}
    const authorName = author.name || author.nick || 'Usuario'
    const authorAvatar = getAvatarUrl(author.image, userAvatar)
    const isOwnPublication = String(author._id || author.id || publication.user) === String(currentUserId)
    const isEditing = editingPublicationId === publication._id

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
                    {isEditing ? (
                        <textarea
                            className="post__edit-textarea"
                            value={editText}
                            onChange={(event) => onEditTextChange(event.target.value)}
                            aria-label="Editar texto de la publicación"
                            rows={3}
                        />
                    ) : (
                        <p className="post__content">{publication.text}</p>
                    )}
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
            <div className="post__buttons">
                <button
                    className={`post__like-button${publication.likedByMe ? ' post__like-button--active' : ''}`}
                    type="button"
                    aria-label={publication.likedByMe ? 'Retirar me gusta' : 'Me gusta'}
                    aria-pressed={Boolean(publication.likedByMe)}
                    disabled={likingPublicationIds.has(publication._id)}
                    onClick={() => onLike(publication)}
                >
                    <i className={`fa-${publication.likedByMe ? 'solid' : 'regular'} fa-heart`} aria-hidden="true"></i>
                    <span>{publication.likedByMe ? 'Te gusta' : 'Me gusta'}</span>
                    <span className="post__like-count">{publication.likesCount || 0}</span>
                </button>
                {isOwnPublication && allowManage && (
                    <div className="post__owner-actions">
                        {isEditing ? (
                            <>
                                <button
                                    className="content__button post__edit-save"
                                    type="button"
                                    disabled={!editText.trim() || savingPublicationId === publication._id}
                                    onClick={() => onSaveEdit(publication._id)}
                                >
                                    {savingPublicationId === publication._id ? 'Guardando...' : 'Guardar'}
                                </button>
                                <button className="content__button post__edit-cancel" type="button" onClick={onCancelEdit}>
                                    Cancelar
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    className="post__button post__button--edit"
                                    type="button"
                                    aria-label="Editar publicación"
                                    title="Editar publicación"
                                    onClick={() => onStartEdit(publication)}
                                >
                                    <i className="fa-solid fa-pen" aria-hidden="true"></i>
                                </button>
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
                            </>
                        )}
                    </div>
                )}
            </div>
        </article>
    )
})

export const Feed = () => {
    const { session, refreshCounters } = useSession()
    const [publications, setPublications] = useState([])
    const [myPublications, setMyPublications] = useState([])
    const [page, setPage] = useState(1)
    const [pages, setPages] = useState(1)
    const [activeTab, setActiveTab] = useState('publications')
    const [isLoading, setIsLoading] = useState(true)
    const [isLoadingMine, setIsLoadingMine] = useState(true)
    const [deletingPublicationId, setDeletingPublicationId] = useState(null)
    const [likingPublicationIds, setLikingPublicationIds] = useState(() => new Set())
    const [editingPublicationId, setEditingPublicationId] = useState(null)
    const [editText, setEditText] = useState('')
    const [savingPublicationId, setSavingPublicationId] = useState(null)
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

    const updatePublicationLists = (publicationId, update) => {
        setPublications((current) => current.map((publication) =>
            publication._id === publicationId ? { ...publication, ...update } : publication
        ))
        setMyPublications((current) => current.map((publication) =>
            publication._id === publicationId ? { ...publication, ...update } : publication
        ))
    }

    const handleToggleLike = async (publication) => {
        if (likingPublicationIds.has(publication._id)) return

        setLikingPublicationIds((current) => new Set(current).add(publication._id))
        try {
            const result = publication.likedByMe
                ? await unlikePublicationRequest(publication._id, session.token)
                : await likePublicationRequest(publication._id, session.token)
            updatePublicationLists(publication._id, {
                likesCount: result.likesCount,
                likedByMe: result.likedByMe
            })
        } catch (error) {
            setModal({
                type: 'error',
                message: error instanceof Error ? error.message : 'No se pudo actualizar el me gusta.'
            })
        } finally {
            setLikingPublicationIds((current) => {
                const next = new Set(current)
                next.delete(publication._id)
                return next
            })
        }
    }

    const startEditingPublication = (publication) => {
        setEditingPublicationId(publication._id)
        setEditText(publication.text || '')
    }

    const handleSaveEdit = async (publicationId) => {
        if (!editText.trim() || savingPublicationId) return

        setSavingPublicationId(publicationId)
        try {
            const updatedPublication = await editPublicationRequest(publicationId, editText.trim(), session.token)
            updatePublicationLists(publicationId, updatedPublication)
            setEditingPublicationId(null)
            setEditText('')
            setModal({ type: 'success', message: 'Publicación actualizada correctamente.' })
        } catch (error) {
            setModal({
                type: 'error',
                message: error instanceof Error ? error.message : 'No se pudo editar la publicación.'
            })
        } finally {
            setSavingPublicationId(null)
        }
    }

    const handleDeletePublication = async (publicationId) => {
        if (deletingPublicationId) return

        setDeletingPublicationId(publicationId)
        try {
            await deletePublicationRequest(publicationId, session.token)
            setMyPublications((current) => current.filter((publication) => publication._id !== publicationId))
            setPublications((current) => current.filter((publication) => publication._id !== publicationId))
            await refreshCounters()
            setModal({ type: 'success', message: 'Publicación eliminada correctamente.' })
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
      </header>

            <div className="feed__tabbar">
              <div className="feed__tabs" role="tablist" aria-label="Secciones de publicaciones">
                <button
                    id="feed-tab-publications"
                    className={`feed__tab${activeTab === 'publications' ? ' feed__tab--active' : ''}`}
                    type="button"
                    role="tab"
                    aria-selected={activeTab === 'publications'}
                    aria-controls="feed-publications-panel"
                    onClick={() => setActiveTab('publications')}
                >
                    Publicaciones
                </button>
                <button
                    id="feed-tab-mine"
                    className={`feed__tab${activeTab === 'mine' ? ' feed__tab--active' : ''}`}
                    type="button"
                    role="tab"
                    aria-selected={activeTab === 'mine'}
                    aria-controls="feed-mine-panel"
                    onClick={() => setActiveTab('mine')}
                >
                    Mis publicaciones
                </button>
                            </div>
                            {activeTab === 'publications' && (
                                <button className="content__button feed__refresh-button" type="button" onClick={refreshFeed} disabled={isLoading}>
                                        <i className={`fa-solid fa-arrows-rotate${isLoading ? ' fa-spin' : ''}`} aria-hidden="true"></i>
                                        Actualizar
                                </button>
                            )}
            </div>

            {activeTab === 'publications' && (
            <div id="feed-publications-panel" role="tabpanel" aria-labelledby="feed-tab-publications" aria-busy={isLoading}>
              <div className="content__posts">
                {isLoading && publications.length === 0 && <LoadingIndicator label="Cargando publicaciones" />}
                {!isLoading && publications.length === 0 && (
                    <p className="feed__status">Todavía no hay publicaciones.</p>
                )}
                    <PublicationCards
                        publications={publications}
                        currentUserId={userId}
                        onOpenImage={setSelectedImage}
                        onLike={handleToggleLike}
                        likingPublicationIds={likingPublicationIds}
                        editingPublicationId={editingPublicationId}
                        editText={editText}
                        onEditTextChange={setEditText}
                        onStartEdit={startEditingPublication}
                        onCancelEdit={() => { setEditingPublicationId(null); setEditText('') }}
                        onSaveEdit={handleSaveEdit}
                        savingPublicationId={savingPublicationId}
                        onDelete={requestDeletePublication}
                        deletingPublicationId={deletingPublicationId}
                    />
          </div>

            {publications.length > 0 && page < pages && (
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
            </div>
            )}

            {activeTab === 'mine' && (
            <section id="feed-mine-panel" className="feed__own-publications" role="tabpanel" aria-labelledby="feed-tab-mine" aria-busy={isLoadingMine}>
                <div className="content__posts" aria-busy={isLoadingMine}>
                    {isLoadingMine && <LoadingIndicator label="Cargando tus publicaciones" />}
                    {!isLoadingMine && myPublications.length === 0 && (
                        <p className="feed__status">Todavía no has publicado nada.</p>
                    )}
                    {!isLoadingMine && (
                        <PublicationCards
                            publications={myPublications}
                            fallbackAuthor={session.user}
                            currentUserId={userId}
                            allowManage
                            onDelete={requestDeletePublication}
                            deletingPublicationId={deletingPublicationId}
                            onOpenImage={setSelectedImage}
                            onLike={handleToggleLike}
                            likingPublicationIds={likingPublicationIds}
                            editingPublicationId={editingPublicationId}
                            editText={editText}
                            onEditTextChange={setEditText}
                            onStartEdit={startEditingPublication}
                            onCancelEdit={() => { setEditingPublicationId(null); setEditText('') }}
                            onSaveEdit={handleSaveEdit}
                            savingPublicationId={savingPublicationId}
                        />
                    )}
                </div>
            </section>
            )}

            <Modal {...modal} onClose={() => setModal(null)} />
            <ImageLightbox
                src={selectedImage?.src}
                alt={selectedImage?.alt}
                onClose={() => setSelectedImage(null)}
            />
    </>
  )
}
