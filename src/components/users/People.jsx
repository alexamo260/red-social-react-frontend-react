import { useEffect, useState } from 'react'
import userAvatar from '../../assets/img/user.png'
import { followUser, getUsers, unfollowUser } from '../../api/backend'
import { useSession } from '../../context/SessionContext'
import { getAvatarUrl } from '../../helpers/avatar'
import { LoadingIndicator } from '../common/LoadingIndicator'
import { Modal } from '../common/Modal'

export const People = () => {
  const { session, refreshCounters } = useSession()
  const [users, setUsers] = useState([])
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [followingIds, setFollowingIds] = useState(() => new Set())
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [pendingUserId, setPendingUserId] = useState(null)
  const [modal, setModal] = useState(null)

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearch(search.trim())
      setPage(1)
    }, 1000)

    return () => window.clearTimeout(timeoutId)
  }, [search])

  useEffect(() => {
    let isActive = true

    const loadUsers = async () => {
      setIsLoading(true)
      try {
        const result = await getUsers(page, debouncedSearch, session.token)
        if (!isActive) return

        setUsers(result.users || [])
        setFollowingIds(new Set((result.followInfo?.following || []).map(String)))
        setPages(result.pages || 1)
      } catch (error) {
        if (isActive) {
          setModal({
            type: 'error',
            message: error instanceof Error ? error.message : 'No se pudieron cargar los usuarios.'
          })
        }
      } finally {
        if (isActive) setIsLoading(false)
      }
    }

    loadUsers()
    return () => {
      isActive = false
    }
  }, [page, debouncedSearch, session.token])

  const toggleFollow = async (targetUserId) => {
    if (pendingUserId) return

    setPendingUserId(targetUserId)
    const isFollowing = followingIds.has(String(targetUserId))
    try {
      if (isFollowing) {
        await unfollowUser(targetUserId, session.token)
      } else {
        await followUser(targetUserId, session.token)
      }

      setFollowingIds((currentIds) => {
        const nextIds = new Set(currentIds)
        if (isFollowing) nextIds.delete(String(targetUserId))
        else nextIds.add(String(targetUserId))
        return nextIds
      })
      await refreshCounters()
    } catch (error) {
      setModal({
        type: 'error',
        message: error instanceof Error ? error.message : 'No se pudo actualizar el seguimiento.'
      })
    } finally {
      setPendingUserId(null)
    }
  }

  return (
    <>
      <header className="content__header">
        <h1 className="content__title">Gente</h1>
      </header>
      <div className="content__posts">
        <label className="people__search">
          <span>Buscar por nombre o nick</span>
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Nombre o nick"
          />
        </label>
        {isLoading && (
          <div className="people__loading-state">
            <LoadingIndicator label="Cargando usuarios" />
          </div>
        )}
        {!isLoading && users.length === 0 && (
          <p className="people__status">
            {debouncedSearch ? 'No se encontraron personas con ese nombre o nick.' : 'No hay más usuarios para mostrar.'}
          </p>
        )}
        {!isLoading && users.length > 0 && (
          <ul className="people__list">
            {users.map((user) => {
              const targetUserId = String(user._id)
              const isFollowing = followingIds.has(targetUserId)

              return (
                <li className="people__item" key={targetUserId}>
                  <img className="people__avatar" src={getAvatarUrl(user.image, userAvatar)} alt="" />
                  <div className="people__identity">
                    <p className="people__name">{user.name}</p>
                    <p className="people__nick">@{user.nick}</p>
                  </div>
                  <button
                    className="content__button people__follow-button"
                    type="button"
                    disabled={pendingUserId === targetUserId}
                    onClick={() => toggleFollow(targetUserId)}
                  >
                    {pendingUserId === targetUserId
                      ? <LoadingIndicator size="small" inline label="Actualizando seguimiento" />
                      : isFollowing ? 'Dejar de seguir' : 'Seguir'}
                  </button>
                </li>
              )
            })}
          </ul>
        )}
        {pages > 1 && (
          <div className="people__pagination">
            <button type="button" className="content__button" disabled={page <= 1 || isLoading} onClick={() => setPage((current) => current - 1)}>
              Anterior
            </button>
            <span>Página {page} de {pages}</span>
            <button type="button" className="content__button" disabled={page >= pages || isLoading} onClick={() => setPage((current) => current + 1)}>
              Siguiente
            </button>
          </div>
        )}
      </div>
      <Modal message={modal?.message} type={modal?.type} onClose={() => setModal(null)} />
    </>
  )
}