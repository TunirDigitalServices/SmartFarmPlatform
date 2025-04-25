import React from 'react'
import { Link } from 'react-router-dom'

const Permission = () => {
  return (
      <div className="main-content-container px-4 pb-4 container-fluid">
          <div className="error">
              <div className="error__content">
                  <h2>403</h2>
                  <h3>Access Denied!</h3>
                  <p> You Don’t Have Permission To Access </p>
                  <Link to="/">
                      <button className="btn btn-primary btn-pill">← Go Back</button>
                  </Link>
              </div>
          </div>
      </div>
  )
}

export default Permission