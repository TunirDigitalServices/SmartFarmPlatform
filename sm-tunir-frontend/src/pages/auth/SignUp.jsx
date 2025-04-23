import React from 'react';
import logo from "../../assets/images/Logo smart farm1.jpg";
import LoginIcon from '@mui/icons-material/Login';
import {
  MDBInput,
  MDBCheckbox,
  MDBBtn
} from 'mdb-react-ui-kit';
import LanguageInput from '../../components/commun/LanguageInput';
import { useNavigate } from 'react-router';

function SignUp() {
  const navigate=useNavigate()
  return (
    <div className="col-md-6 col-lg-7 d-flex align-items-center">
      <div className="card-body p-4 p-lg-5 text-black">

        <form>
         <LanguageInput/>
         

          {/* Logo and Icon */}
          <div className="d-flex align-items-center mb-3 pb-1" style={{ textAlign: 'center' }}>
            <img alt="logo" src={logo} width={150} />
            <LoginIcon style={{ marginTop: '8px', color: '#666' }} />
          </div>

          {/* Sign-Up Fields */}
          <div className="row mb-4">
            <div className="col-md-6">
              <MDBInput label='Full Name' id='name' type='text' />
            </div>
            <div className="col-md-6">
              <MDBInput label='Email Address' id='email' type='email' />
            </div>
          </div>
          <div className="row mb-4">
            <div className="col-md-6">
              <MDBInput label='Password' id='password' type='password' />
            </div>
            <div className="col-md-6">
              <MDBInput label='Confirm Password' id='confirmPassword' type='password' />
            </div>
          </div>
          <MDBInput wrapperClass='mb-4' label='Phone Number' id='phone' type='tel' />

          {/* Select Offer */}
          <div className="mb-4">
            <label htmlFor="offer" className="form-label">Select Offer</label>
            <select className="form-select" id="offer">
              <option value="freemium">Freemium</option>
              <option value="premium">Premium</option>
            </select>
          </div>

          {/* Terms & Conditions Checkbox */}
          <div className='text-muted mb-4'>
            <MDBCheckbox
              name="termsCheck"
              id="termsCheck"
              label="I agree to all Terms & Conditions"
              className="mb-4 "
            />
          </div>
          {/* Sign Up Button */}
          <div className="pt-1 mb-4">
            <MDBBtn color="info" size="lg" className="btn-block text-light">Sign Up</MDBBtn>
          </div>

          {/* Terms & Privacy Links */}
          <div className="small d-flex justify-content-between" style={{color:"#25a6b8",cursor:"pointer"}}>
            <small onClick={()=>navigate('/terms')} className="me-3">Terms & Conditions</small>
            <small onClick={()=>navigate('/privacty')} >Privacy Policy</small>
          </div>
        </form>

      </div>
    </div>
  );
}

export default SignUp;
