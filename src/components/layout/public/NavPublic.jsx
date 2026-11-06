import React, { useState } from 'react'
import userAvatar from '../../../assets/img/user.png'
import { NavLink } from 'react-router-dom'

export const NavPublic = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
        <nav className={`navbar__container-lists${isMenuOpen ? ' is-open' : ''}`}>
                <button
                        className="navbar__menu-toggle"
                        type="button"
                        aria-label={isMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
                        aria-expanded={isMenuOpen}
                        aria-controls="public-navigation-menu"
                        onClick={() => setIsMenuOpen((isOpen) => !isOpen)}
                >
                        <i className={`fa-solid ${isMenuOpen ? 'fa-xmark' : 'fa-bars'}`} aria-hidden="true"></i>
                </button>

                <div id="public-navigation-menu" className="navbar__menu-content">
                    <ul className="container-lists__menu-list">
            <li className="menu-list__item">
                <NavLink to="/login" className="menu-list__link" onClick={() => setIsMenuOpen(false)}>
                    <i className="fa-solid fa-right-to-bracket"></i>
                    <span className="menu-list__title">Login</span>
                </NavLink>
            </li>

            <li className="menu-list__item">
                <NavLink to="/register" className="menu-list__link" onClick={() => setIsMenuOpen(false)}>
                    <i className="fa-solid fa-user-plus"></i>
                    <span className="menu-list__title">Registro</span>
                </NavLink>
            </li>
                    </ul>
                </div>

    </nav>
  )
}
