import React from 'react'
import background from "../assets/images/background-signup.png"
import logo from "../assets/images/Logo smart farm1.jpg"
import { Outlet } from 'react-router-dom'

export default function auth() {
  return (
     <section class="vh-100" >
             <Outlet/>
           </section>
  )
}