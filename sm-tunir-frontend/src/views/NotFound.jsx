import React, { useEffect } from 'react'
import svg from "../assets/images/404.svg"

function NotFound() {

  return (
    <>
      <div className="cont-404">
        <img src={svg} alt="svg" />
        <button>Back to Home</button>
      </div>
    </>
  )
}

export default NotFound