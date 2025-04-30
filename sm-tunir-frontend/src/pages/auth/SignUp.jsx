import React, { useState } from "react";
import PropTypes from "prop-types";
import { Link, useNavigate } from "react-router-dom";
import api from '../../api/api'
import Notifications ,{notify} from 'react-notify-toast';
import swal from 'sweetalert';
import { useTranslation } from "react-i18next";
import { Container, Row, Col, Card } from 'react-bootstrap';
import Background from '../../assets/images/background-signup.png';
import logo from "../../assets/images/Logo smart farm1.jpg"

export const Register = ({ setToken }) => {


  const [hasAccepted, setAccepted] = useState(false);

  const navigate = useNavigate();


  const [name,setName] = useState("");
  const [num,setNum] = useState("");
  const [email,setEmail] = useState("");
  const [password , setPassword] = useState("");
  const [confirmPass , setConfirmPass] = useState(""); 

  const [sendEmail,setSendEmail] = useState(false); 
  const [ local, setLocal ] =  useState(localStorage.getItem("local")||"en");

  const [nameError,setNameErr] = useState("");
  const [emailError ,setEmailErr] = useState("");
  const [mdpError , setPassErr] = useState("");
  const [confMdpErr , setconfMdpErr] = useState("");
  const [offerType , setOfferType] = useState("");
  const [role , setRole] = useState("ROLE_USER");
  const { t, i18n } = useTranslation();

  // const [user,setUser] = useState({
  //   name : "",
  //   email : "",
  //   password : "" ,
  //   confirmPass : "",
  // })

  // const [errors , setErr] =useState({
    // nameError : "",
    // emailError :"",
    // passErr:"",
  // })



 const validate = () => {
    let nameError = '';
    let emailError = '';
    let mdpError = '';
    let confMdpErr = '';
    if (!name) {
      nameError = 'Username cannot be blank!';
      setNameErr(nameError)
    }
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
      mdpError = 'Cannot be less 6 character!';
      setPassErr(mdpError)
     }
     if (password != confirmPass) {
      confMdpErr = `Values don't match`;
      setconfMdpErr(confMdpErr)
     }
     if (emailError ||  nameError || mdpError || confMdpErr ) {
      setEmailErr(emailError);
      setNameErr(nameError);
      setPassErr(mdpError);
      setconfMdpErr(confMdpErr)
      return false;
    }
      return true;
  };

 const handleSubmit = (event) =>{
    event.preventDefault()
    
    const isValid = validate();
    console.log("Validation Result:", isValid);
    if(isValid) {
        handleRegister()
       
    }else{
      return false;
    }
 } 


  const handleRegister = async () => {

    console.log("Handle Register Triggered");

    let data = {
      name : name,
      email: email,
      phone_number:num, 
      password: password,
      confirmPassword : confirmPass ,
      offer_type : offerType,
      role: role
    }
    if(role === "ROLE_SUPPLIER"){
      data.offer_type = '2'
    }
      await  api.post('/signup' ,data)
        .then(res => {
          if(res.data.type && res.data.type == "danger") {
            swal({
              icon: 'error',
              title: 'Oops...',
              text: res.data.message
            })
            return false;
          }
          if(res.data.type && res.data.type == "warnning") {
            swal({
              icon: 'warning',
              title: 'Oops...',
              text: res.data.message
            })
            setSendEmail(true , resetForm())
          }
          if(res.data.type && res.data.type === "success") {
            swal({
              icon: 'success',
              title: 'OK',
              text: 'Email sent, check your inbox to confirm'
            }).then(() => {
              // Redirect after user closes the alert
              navigate('/');
            });
          
            setSendEmail(true);
            resetForm();
          }
          
          }).catch(() => {
            swal({
              icon: 'error',
              title: 'Oops...',
              text: 'error_add_user'
            })
            return false;
          })
        }
        const resetForm = () => {
          setNameErr('')
          setEmailErr('')
          setPassErr('')
          setName("");
          setEmail("");
          setNum('')
          setPassword("");
          setConfirmPass("");
          setOfferType("");

          setTimeout(() => {
            setSendEmail(false)
          }, 3000);
        }


        const changeLanguageHandler = async (e) => {
          const languageValue = e.target.value
          i18n.changeLanguage(languageValue);
          localStorage.setItem("local",languageValue)
          setLocal(languageValue)
        }
  return (

<Container fluid className="main-content-container p-4">
<Row className="d-flex justify-content-center align-items-center">
  <Col lg="8" md="12" sm="12">
    <Card className="p-4">
    <Row>
    <Col lg="5" md="12" sm="12" className="border-right" style={{backgroundImage: `url(${Background})`}} >
    <div className="pt-5" >
              <div
              >
                <img
                  style={{ width: "100%" }}
                  // width="80%"mar
                  // height="80%"
                  src={logo}
                  alt="Smart Farm"
                />
              </div>
              <h4 style={{fontFamily: "'Satisfy', cursive",color:"#25A6B8",textAlign:"center"}}>{t('agriculture_intelligente')}</h4>
            </div>
      </Col>
      <Col lg="7" md="12" sm="12" >
        <div className="d-flex justify-content-end ">
               <select value={local} className="custom-select" style={{width: 70}} onChange={changeLanguageHandler}>
                  <option value="en">En</option>
                  <option value="fr">Fr</option>
                  <option value="it">It</option>
                  <option value="ar">Ar</option>

                </select>
        </div>
        <h3 style={{textAlign:"center"}}>{t('Sign up')}</h3>
        <div className="text-center mt-2 font-weight-light">
                 <span>{t('already_account')} </span> 
                  <Link to="/" 
                    style={{ color: "#0daaa2" }}>
                    {t('sign_in')}
                  </Link>
                </div>
        {/* <div className={`mb-0 alert alert-danger fade ${msgError.displayMsg}`} role="alert"><i class="fa fa-info mx-2"></i>{msgError.msg}</div> */}

                      <form className="pt-3 px-4">
                        <Row>
                          <Col lg="6" md="12" sm="12">
                              <div className="form-group">
                              <input
                                  value={name}
                                  type="text"
                                  style={{background:"transparent",  padding: "7px 0",width: "100%",
                                  border: "0",
                                  borderBottom: "1px solid #25A6B8",
                                  outline: "0",
                                  fontSize: "1.1rem"}}
                                  // className={`${nameError ? 'is-invalid' : ""}`} 
                                  placeholder={t('name')}
                                  onChange={(e) =>setName(e.target.value)}
                                />
                                <div className="invalid-feedback">{nameError}</div>
                              </div>
                              <div className="form-group">
                                <input
                                value={email}
                                  type="email"
                                  style={{background:"transparent",  padding: "7px 0",width: "100%",
                                  border: "0",
                                  borderBottom: "1px solid #25A6B8",
                                  outline: "0",
                                  fontSize: "1.1rem"}}
                                  // className={`form-control form-control-lg ${emailError ? "is-invalid" : ""}`}
                                  placeholder={t('email')}
                                  onChange={(e) =>setEmail(e.target.value)}

                                />
                                <div className="invalid-feedback">{emailError}</div>

                              </div>
                          
                          </Col>
                          <Col lg="6" md="12" sm="12">
                              <div className="form-group">
                                <input
                                value={password}
                                  type="password"
                                  style={{background:"transparent",  padding: "7px 0",width: "100%",
                                  border: "0",
                                  borderBottom: "1px solid #25A6B8",
                                  outline: "0",
                                  fontSize: "1.1rem"}}
                                  // className={`form-control form-control-lg ${mdpError ? "is-invalid" : ""}`}
                                  placeholder={t('Password')}
                                  onChange={(e) =>setPassword(e.target.value)}

                                />
                                <div className="invalid-feedback">{mdpError}</div>
                              </div>
                              <div className="form-group">
                                <input
                                value={confirmPass}
                                  type="password"
                                  style={{background:"transparent",  padding: "7px 0",width: "100%",
                                  border: "0",
                                  borderBottom: "1px solid #25A6B8",
                                  outline: "0",
                                  fontSize: "1.1rem"}}
                                  // className={`form-control form-control-lg ${confMdpErr ? "is-invalid" : ""}`}
                                  placeholder={t('ConfirmPassword')}
                                  onChange={(e) =>setConfirmPass(e.target.value)}

                                />
                                <div className="invalid-feedback">{confMdpErr}</div>
                              </div>
                          </Col>
                        </Row>
                          <Row>
                                 <Col lg="6" md="12" sm="12">
                                 <div className="form-group">
                                        <input
                                          value={num}
                                          type="tel"
                                          onKeyPress={(e) => {
                                            if (!/[0-9]/.test(e.key)) {
                                              e.preventDefault();
                                            }
                                          }}
                                          style={{background:"transparent",  padding: "7px 0",width: "100%",
                                          border: "0",
                                          borderBottom: "1px solid #25A6B8",
                                          outline: "0",
                                          fontSize: "1.1rem"}}
                                          // className='form-control form-control-lg'
                                          placeholder={t('num')}
                                          onChange={(e) =>{setNum(e.target.value)}}

                                        />
                                        <div className="invalid-feedback">{''}</div>

                                      </div>

                                 </Col> 
                                 <Col lg="6" md="12" sm="12">
                                 {
                                    role === "ROLE_USER"
                                    ?
                                    <div className="form-group">
                                    <select  
                                  style={{background:"transparent",  padding: "7px 0",width: "100%",
                                  border: "0",
                                  borderBottom: "1px solid #25A6B8",
                                  outline: "0",
                                  fontSize: "1.1rem"}} 
                                  // className="form-control form-control-lg"
                                   value={offerType} 
                                   onChange={(e) =>  setOfferType(e.target.value)}>
                                      <option value="" selected disabled>{t('select_offer')}</option>
                                      <option value="1">{t('gratuit')}</option>
                                      <option value="2">{t('payante')}</option>
                                    </select>
                                  </div>
                                    :
                                    null
                                  }
                                 </Col>
                            </Row>          
                <div className="mb-4">
                  <div className="form-check">
                    <label className="form-check-label text-muted">
                      <input
                        onClick={() => setAccepted(!hasAccepted)}
                        type="checkbox"
                        className="form-check-input"
                        required
                      />
                      <i className="input-helper"></i>{t('i_agree')}
                    </label>
                  </div>
                </div>
                <div className="mt-3">
                    <button
                      className="btn btn-block  btn-lg font-weight-medium auth-form-btn"
                      style={{color : 'white', backgroundColor : '#27A6B7'}}
                      onClick={
                        handleSubmit
                      }
                    >
                      {t('Sign up')}
                    </button>
                </div>
                <div className="text-center d-flex justify-content-between align-items-center mt-4 font-weight-light">
                  <Link to="/Terms" 
                    style={{ color: "#0daaa2" }}>
                    {t('Terms & Conditions')}
                  </Link>
                  <Link to="/Privacy" 
                    style={{ color: "#0daaa2" }}>
                    {t('Privacy Policy')}
                  </Link>
                </div>
              </form>
      </Col>


  </Row>
    </Card>
  
  </Col>
</Row>

</Container>
  );
};

Register.propTypes = {
  setToken: PropTypes.func.isRequired
};

export default Register;
