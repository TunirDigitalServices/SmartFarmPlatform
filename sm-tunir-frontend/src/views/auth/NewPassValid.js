import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../../api/api';
import Notifications, { notify } from 'react-notify-toast';
import swal from 'sweetalert';
import logo from "../../assets/images/Logo smart farm1.jpg"

const NewPassValid = () => {


  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPass, setConfirmPass] = useState("");

  const [sendEmail, setSendEmail] = useState(false);


  const [emailError, setEmailErr] = useState("");
  const [mdpError, setPassErr] = useState("");
  const [confMdpErr, setconfMdpErr] = useState("");
  const [errorMsg, setErrMsg] = useState(null)

  const [Validate, setValidate] = useState("");

  const [tokenValidPassword, setTknValidPass] = useState(false)



  const navigate = useNavigate()
  const params = useParams()
  let tokenToValid = params.ToValid


  useEffect(() => {
    const Validate = async () => {
      let response = await api.get(`/valid-forgot-password/${tokenToValid}`)
        .then(res => {
          setValidate(res)
          if (res.data.type && res.data.type == "success") {
            setTknValidPass(true)
          }
          if (res.data.type && res.data.type == "danger") {
            setErrMsg("error_link_change_password")
          }

        }).catch((e) => {
          setErrMsg("error_link_change_password")
        })

    }
    Validate()
  }, [])



  const validate = () => {
    let emailError = '';
    let mdpError = '';
    let confMdpErr = '';

    if (!email) {
      emailError = 'Email cannot be blank!';
      setEmailErr(emailError)
    }
    else if (typeof email !== 'undefined') {
      var mailformat = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      if (!mailformat.test(email)) {
        emailError = 'Incorrect email format!';
        setEmailErr(emailError)
      }
    }
    if (password.length < 6) {
      mdpError = 'Password cannot be less 6 character!';
      setPassErr(mdpError)
    }
    if (password != confirmPass) {
      confMdpErr = `Passwords don't match`;
      setconfMdpErr(confMdpErr)
    }
    if (emailError || mdpError || confMdpErr) {
      setEmailErr(emailError);
      setPassErr(mdpError);
      setconfMdpErr(confMdpErr)
      return false;
    }
    return true;
  };

  const handleSubmit = (event) => {
    event.preventDefault()

    const isValid = validate();
    if (isValid) {
      handleChangePass()

    } else {
      return false;
    }
  }



  const handleChangePass = () => {

    let data = {
      tokenValidPassword: tokenToValid,
      email: email,
      password: password,
      confirmPassword: confirmPass
    }

    api.post('/change-password', data)
      .then(res => {
        if (res.data.type && res.data.type == "success") {
          let msg = res.data.message
          swal({
            icon: 'success',
            title: 'OK',
            text: msg
          })
          setSendEmail(true, resetForm());
          navigate('/');
        }
        if (res.data.type && res.data.type == "danger") {
          alert('error change password')
        }
      }).catch((e) => {
        alert("error_link_account")
      })

  }


  const resetForm = () => {
    setEmail("");
    setPassword("");
    setConfirmPass("");

    setTimeout(() => {
      setSendEmail(false)

    }, 3000);
  }

  if (errorMsg == null) {

    return (

      <div style={{ marginTop: 25 }}>
        <div className="d-flex align-items-center auth px-0 h-100">
          <div className="row w-100 mx-0">
            <div className="col-lg-4 mx-auto">
              <div className="card text-left py-5 px-4 px-sm-5">
                <div className="brand-logo">
                  <div
                    style={{
                      height: 60,
                      width: "100%",
                      overflow: "hidden",
                      textAlign: "center"
                    }}
                  >
                    <img
                      id="main-logo"
                      className="d-inline-block align-top mr-1"
                      style={{ maxWidth: "200px", marginTop: -40 }}
                      src={logo}
                      alt="Smart Farm"
                    />
                  </div>
                </div>
                <h5 style={{ color: "#0daaa2" }}>Change Password </h5>
                <form className="pt-3">
                  <div className="form-group">
                    <input
                      value={email}
                      type="email"
                      className={`form-control form-control-lg ${emailError ? "is-invalid" : ""}`}
                      placeholder="Email"
                      onChange={(e) => setEmail(e.target.value)}
                    />
                    <div className="invalid-feedback">{emailError}</div>

                  </div>
                  <div className="form-group">
                    <input
                      value={password}
                      type="password"
                      className={`form-control form-control-lg ${mdpError ? "is-invalid" : ""}`}
                      placeholder="New password"
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <div className="invalid-feedback">{mdpError}</div>
                  </div>
                  <div className="form-group">
                    <input
                      value={confirmPass}
                      type="password"
                      className={`form-control form-control-lg ${confMdpErr ? "is-invalid" : ""}`}
                      placeholder="Confirm the new password"
                      onChange={(e) => setConfirmPass(e.target.value)}
                    />
                    <div className="invalid-feedback">{confMdpErr}</div>
                  </div>
                  <div className="mt-3">

                    <button
                      className="btn btn-block btn-primary btn-lg font-weight-medium auth-form-btn"
                      style={{
                        backgroundColor: "#0daaa2",
                        borderColor: "#0daaa2"
                      }}
                      onClick={handleSubmit}
                    >
                      Submit
                    </button>


                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
        <Notifications />

      </div>

    )
  } else {
    return (

      <div className='align-items-center auth px-0 h-100' style={{ textAlign: "center", marginTop: "58px" }}>
        <h3>
          <strong>{errorMsg}</strong>
        </h3>

        <Link to="/Login">
          Login
        </Link>
      </div>

    )
  }
}

export default NewPassValid