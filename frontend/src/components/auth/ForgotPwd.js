import React, { useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/api";
import Notifications , {notify} from 'react-notify-toast'
import { useTranslation } from "react-i18next";
import swal from 'sweetalert';



const ForgotPwd = () => {
  
  const [email , setEmail] = useState("")
  const [emailError ,setEmailErr] = useState("");
  
  const [sendEmail ,setSendEmail] = useState(false);

  const [ local, setLocal ] =  useState(localStorage.getItem("local")||"en");
  const { t, i18n } = useTranslation();
  


  const validate = () => {
    let emailError = '';

    if (!email) {
      emailError = 'Email cannot be blank!';
      setEmailErr(emailError)
     }
       else if (typeof email !== 'undefined') {
       var mailformat = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        if (!mailformat.test(email)) {
          emailError = 'Incorrect email format!';
          setEmailErr(emailError);
           }
      }
     if (emailError ) {
      setEmailErr(emailError);
      return false;
    }
      return true;
  };





  const handleSubmit = (event) =>{
    event.preventDefault();
    
    const isValid = validate();
    if(isValid) {
        handleFrgtPass();
       
    }else{
      return false;
    }
 } 


 const handleFrgtPass = () => {

  let data = {
    email : email
  }


    api.post('/forgot-password',data)
    .then(res => {
      if(res.data.type && res.data.type == "success") {
            
        swal({
          icon: 'success',
          title: 'OK',
          text: 'Email sent check your inbox to change password'
        })
        setSendEmail(true , resetForm())
      
      }
    }).catch((e) => {
      swal({
        icon: 'error',
        title: 'Oops...',
        text: 'Error'
      })
    });
 }


 const resetForm = () => {

  setEmail("");
  

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
    <div style={{ marginTop: 25 }}>
      <div className="d-flex align-items-center auth px-0">
        <div className="row w-100 mx-0">
          <div className="col-lg-4 mx-auto">
            <div className="card text-left py-5 px-4 px-sm-5">
            <div className="col-lg-12 text-right p-0">
                <select value={local} className="custom-select" style={{width: 70}} onChange={changeLanguageHandler}>
                  <option value="en">En</option>
                  <option value="fr">Fr</option>
                  <option value="it">It</option>
                  <option value="ar">Ar</option>

                </select>
              </div>
              <Link to="/Login" 

                style={{ color: "#0daaa2" }}
                >
                <p> Return</p>
              </Link>
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
                    src={require("../../images/Logo smart farm1.jpg")}
                    alt="Smart Farm"
                  />
                </div>
              </div>
              <h5  style={{ color: "#0daaa2" }}>{t('forgot_pwd?')}</h5>
              <p className="font-weight-light">
                  {t('forgot_pwd')}
              </p>
              <form className="pt-3">
                <div className="form-group">
                  <input
                    value={email}
                    type="email"
                    className={`form-control form-control-lg ${emailError ? "is-invalid" : ""}`}
                    placeholder="Email"
                    onChange={(e) =>setEmail(e.target.value)}

                  />
                    <div className="invalid-feedback">{emailError}</div>

                </div>
                <div className="mt-3">
                  <Link to="/Login">
                    <button onClick={handleSubmit} 
                        style={{color : 'white', backgroundColor : '#27A6B7'}}
                        className="btn btn-block  btn-lg font-weight-medium auth-form-btn"
                    >

                      {t('reset_link_btn')}
                    </button>
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      <Notifications />
    </div>
  );
};

export default ForgotPwd;
