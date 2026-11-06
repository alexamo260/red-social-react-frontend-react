import React from 'react'
import { Link } from 'react-router-dom'
import { NavPublic } from './NavPublic'
import wavelyMark from '../../../assets/img/wavely-mark.svg'

export const HeaderPublic = () => {
  return (
    <header className="layout__navbar">

        <div className="navbar__header">
            <Link to="/login" className="navbar__title" aria-label="WAVELY Social, ir a Login">
              <span className="navbar__mark-shell" aria-hidden="true">
                <img src={wavelyMark} className="navbar__mark" alt="" />
              </span>
              <span className="navbar__brand-copy">
                <span className="navbar__brand-name">WAVELY</span>
                <span className="navbar__brand-social">Social</span>
              </span>
            </Link>
        </div>

        <NavPublic />

    </header>
  )
}
