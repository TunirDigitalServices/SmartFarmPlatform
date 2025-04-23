import React from 'react'
import logo from "../../assets/images/Logo smart farm1.jpg"
import LoginIcon from '@mui/icons-material/Login';

import {
  MDBInput,
  MDBCheckbox,
}
  from 'mdb-react-ui-kit';
import { useNavigate } from 'react-router';
import LanguageInput from '../../components/commun/LanguageInput';
function Login() {
  const navigate=useNavigate()
  return (
    <div class="col-md-6 col-lg-7 d-flex align-items-center">
      <div class="card-body p-4 p-lg-5 text-black">

        <form>
          <LanguageInput/>

          <div
            className="d-flex  align-items-center mb-3 pb-1"
            style={{ textAlign: 'center' }}
          >
            <img alt="logo" src={logo} width={150} />
            <LoginIcon style={{ marginTop: '8px', color: '#666' }} />
          </div>


          <MDBInput wrapperClass='mb-4' label='Email address' id='form1' type='email' />

          <MDBInput wrapperClass='mb-4' label='Email address' id='form1' type='email' />
          <div className="d-flex justify-content-between  mb-4">
            <div className="mb-2 text-muted">
              <MDBCheckbox
                name="flexCheck"
                value=""
                id="flexCheckDefault"
                label="Remember me"
              />
            </div>
            <a href="!#" className='text-muted'>Forgot password?</a>
          </div>
          <div class="pt-1 mb-4">
            <button data-mdb-button-init data-mdb-ripple-init class="btn btn-lg btn-block text-light" type="button" style={{ background: "#25A6B8" }}>Login</button>
          </div>


          <p className="mb-5 pb-lg-2 text-muted" >Don't have an account? <a onClick={()=>navigate("/sign-up")}
            style={{ color: "#25a6b8",cursor:"pointer" }}>Register here</a></p>
          <div className="small d-flex justify-content-between" style={{color:"#25a6b8",cursor:"pointer"}}>
            <small onClick={()=>navigate('/terms')} className="me-3">Terms & Conditions</small>
            <small onClick={()=>navigate('/privacty')} >Privacy Policy</small>
          </div>
        </form>

      </div>
    </div>
  )
}

export default Login