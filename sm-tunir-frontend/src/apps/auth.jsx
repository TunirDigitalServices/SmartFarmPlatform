import React from 'react'
import { Outlet } from 'react-router-dom'

export default function auth() {
  return (
    <div>
      <Outlet/>
    </div>
  )
}