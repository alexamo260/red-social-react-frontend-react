import React from 'react'
import { HeaderPrivate } from './HeaderPrivate'
import { FooterPublic } from '../public/FooterPublic'
import { Outlet, useMatch } from 'react-router-dom'
import { SideBarPrivate } from './SideBarPrivate'
import { MessageComposer } from './MessageComposer'

export const LayoutPrivate = () => {
  const isMessagesPage = Boolean(useMatch('/social/messages'))

  return (
    <>
        <HeaderPrivate />

        <div className="layout__body">
          <section className="layout__content">
            <Outlet />
          </section>

          {isMessagesPage ? <MessageComposer /> : <SideBarPrivate />}
        </div>

        <FooterPublic />
    </>
  )
}
