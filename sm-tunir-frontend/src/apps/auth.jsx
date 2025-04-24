import React from 'react'
import background from "../assets/images/background-signup.png"
import logo from "../assets/images/Logo smart farm1.jpg"
import { Outlet } from 'react-router-dom'

export default function auth() {
  return (
     <section class="vh-100" >
             {/* <div class="container py-5 h-100">
               <div class="row d-flex justify-content-center align-items-center h-100">
                 <div class="col col-xl-10">
                   <div class="card" style={{ bordeRadius: "1rem" }}>
                     <div class="row g-0">
                       <div className="col-md-6 col-lg-5 d-none d-md-block" style={{ position: 'relative' }}>
                         <img
                           src={background}
                           alt="login form"
                           className="img-fluid"
                           style={{
                             borderRadius: '1rem',
                             objectFit: 'cover',
                             height: '100%',
                             width: '100%'
                           }}
                         />
                         <img
                           src={logo}
                           alt="Logo"
                           style={{
                             position: 'absolute',
                             top: '50%',
                             left: '50%',
                             transform: 'translate(-50%, -50%)',
                             width: '70%',
                             height: 'auto',
                             zIndex: 1
                           }}
                         />
                       </div>
                       <Outlet/>
                     </div>
                   </div>
                 </div>
               </div>
             </div> */}
             <Outlet/>
           </section>
  )
}