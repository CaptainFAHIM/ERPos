import React from 'react'
import { Outlet } from "react-router-dom"

import ThemeProvider from '../ThemeProvider/ThemeProvider'
import UpdatesPanel from '../UpdatesPanel/UpdatesPanel'

function Layout() {
  return (
    <ThemeProvider>
      <Outlet/>
      <UpdatesPanel/>
    </ThemeProvider>
  )
}

export default Layout
