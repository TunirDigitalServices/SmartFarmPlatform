import React, { useEffect } from 'react'
import svg from "../assets/images/404.svg"
import { useNavigate } from 'react-router'

function NotFound() {
  const navigate = useNavigate()

  return (
    <>
      <div className="cont-404">
        <img src={svg} alt="svg" />
        <button onClick={()=>navigate('/')}>Back to Home</button>
      </div>
    </>
  )
}

export default NotFound