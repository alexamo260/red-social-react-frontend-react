import React from 'react'
import { NavPrivate } from './NavPrivate'
import wavelyMark from '../../../assets/img/wavely-mark.svg'
import { Link } from 'react-router-dom'

export const HeaderPrivate = () => {
  return (
    <header className="layout__navbar">

        <div className="navbar__header">
            <Link to="/login" className="navbar__title" aria-label="WAVELY Social, inicio">
              <span className="navbar__mark-shell" aria-hidden="true">
                <img src={wavelyMark} className="navbar__mark" alt="" />
              </span>
              <span className="navbar__brand-copy">
                <span className="navbar__brand-name">WAVELY</span>
                <span className="navbar__brand-social">Social</span>
              </span>
            </Link>
        </div>

        <NavPrivate />

    </header>
  )
}
