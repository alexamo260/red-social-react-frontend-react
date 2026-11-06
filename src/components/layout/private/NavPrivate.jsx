import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import userAvatar from '../../../assets/img/user.png'
import { getAvatarUrl } from '../../../helpers/avatar'
import { useSession } from '../../../context/SessionContext'

export const NavPrivate = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const { session, logout } = useSession()
    const profileImage = getAvatarUrl(session.user?.image, userAvatar)

    const handleLogout = () => {
        logout('¡Hasta pronto!')
        setIsMenuOpen(false)
    }

  return (
        <nav className={`navbar__container-lists${isMenuOpen ? ' is-open' : ''}`}>
                <button
                        className="navbar__menu-toggle"
                        type="button"
                        aria-label={isMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
                        aria-expanded={isMenuOpen}
                        aria-controls="private-navigation-menu"
                        onClick={() => setIsMenuOpen((isOpen) => !isOpen)}
                >
                        <i className={`fa-solid ${isMenuOpen ? 'fa-xmark' : 'fa-bars'}`} aria-hidden="true"></i>
                </button>

                <div id="private-navigation-menu" className="navbar__menu-content">
                    <ul className="container-lists__menu-list">
                        <li className="menu-list__item">
                            <Link to="/social/feed" className="menu-list__link" onClick={() => setIsMenuOpen(false)}>
                                <i className="fa-solid fa-house"></i>
                                <span className="menu-list__title">Inicio</span>
                            </Link>
                        </li>

                        <li className="menu-list__item">
                            <Link to="/social/people" className="menu-list__link" onClick={() => setIsMenuOpen(false)}>
                                <i className="fa-solid fa-user"></i>
                                <span className="menu-list__title">Gente</span>
                            </Link>
                        </li>

                        <li className="menu-list__item">
                            <Link to="/social/messages" className="menu-list__link" onClick={() => setIsMenuOpen(false)}>
                                <i className="fa-regular fa-envelope"></i>
                                <span className="menu-list__title">Mensajes</span>
                            </Link>
                        </li>
                    </ul>

                    <ul className="container-lists__list-end">
                        <li className="list-end__item">
                            <Link to="/social/profile" className="list-end__link-image" onClick={() => setIsMenuOpen(false)}>
                                <img src={profileImage} className="list-end__img" alt="Imagen de perfil" />Mi Perfil
                            </Link>
                        </li>

                        <li className="list-end__item">
                            <Link
                                to="/login"
                                className="list-end__link list-end__link--logout"
                                onClick={handleLogout}
                            >
                                <i className="fa-solid fa-right-from-bracket"></i>
                                <span className="list-end__name">Cerrar sesión</span>
                            </Link>
                        </li>
                    </ul>
                </div>

    </nav>
  )
}
