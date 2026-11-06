import React from 'react'
import { HeaderPublic } from './HeaderPublic'
import { FooterPublic } from './FooterPublic'
import { Outlet } from 'react-router-dom'

export const LayoutPublic = () => {
  return (
    <>
        <HeaderPublic />
        <div className="layout__body layout__body--public">
          <section className="layout__content">
            <Outlet />
          </section>
        </div>
        <FooterPublic />
    </>
  )
}
