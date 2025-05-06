import React, { useState, useEffect } from "react";
import api from '../../api/api'
import countryState from '../../data/gistfile.json'
import {
  Card,
  ListGroup,
  ListGroupItem,
  Row,
  Col,
  Form,
  Button
} from "react-bootstrap";
import { useTranslation } from "react-i18next";


export default function UserAccountDetails() {
  const [name,setName] = useState("")
  const [email,setEmail] = useState("")
  const [address,setAddress] = useState("")
  const [city,setCity] = useState("")
  const [country,setCountry] = useState("")
  const [zip_code,setZipCode] = useState("")
  const [description,setDescription] = useState("")

  const [other , setOther] = useState("");
  
  const [allCountry,setAllCountry] = useState([])
  const [allStates,setAllStates] = useState([])

  const [toggle , setToggle] = useState(false)

  const [password , setPassword] = useState("");
  const [newPassword , setNewPassword] = useState("");
  const [confirmPass , setConfirmPass] = useState(""); 

  const [currentMdpError ,setCurrentPassErr] = useState("");
  const [newMdpError , setNewPassErr] = useState("");
  const [confMdpErr , setconfMdpErr] = useState("");



  const [msgServer,setMsgServer] = useState("")
  const [classMsg,setClassMsg] = useState("")
  const [displayMsg,setDisplayMsg] = useState("hide")
  const [iconMsg,setIconMsg] = useState("info")

  let listcountry = []
  let liststateSelectedCountry = []

  const [errorMsg,setErrorMsg] = useState({nameError:"", emailError: ""})
  const { t, i18n } = useTranslation();

  useEffect(() => {
    const fetchData = async () => {

      countryState.countries.map((item, indx) => {
        listcountry.push(item.country)
      })
      setAllCountry(listcountry)


    await api.get('/profil').then(res => {
      const newData = res.data;
      setName(newData.result.name)
      setEmail(newData.result.email)
      setAddress(newData.result.address)
      setCity(newData.result.city)
      setOther(newData.result.city)
      setCountry(newData.result.country)
      setZipCode(newData.result.zip_code)
      setDescription(newData.result.description)
      countryState.countries.map((item, indx) => {
        if(item.country == newData.result.country) {
          countryState.countries[indx].states.map((state, i) => {
            liststateSelectedCountry.push(state)
          })
        }
      })
      setAllStates(liststateSelectedCountry)


    });
    
    

    };
    fetchData();
    }, []);


    const validate = () => {
      let nameError = '';
      let emailError = ''
      if (!name || name == "") {
        nameError = 'not_empty';
        setErrorMsg({nameError: nameError, emailError: ""});
        return false;
      }

      if (!email || email == "") {
        emailError = 'not_empty_mail';
        setErrorMsg({nameError: "", emailError: emailError});
        return false;
      }

      setErrorMsg({nameError: "", emailError:""})
      
      return true;
      
    };
    const handleCountry = async (country) =>{
      setCountry(country);

      allCountry.map((item, indx) => {
        if(item == country) {
          countryState.countries[indx].states.map((state, i) => {
            liststateSelectedCountry.push(state)
          })
        }
      })
      setAllStates(liststateSelectedCountry)
    }
    

    const handleSubmit = (event) =>{
      event.preventDefault()
      const isValid = validate();
      if(isValid) {
        handlSaveProfil()
      }else{
        return false;
      }
    }
    const handlSaveProfil = () =>{

      let dataPost = {
        name :name,
        email: email,
        address: address,
        city : city ,
        country : country,
        zip_code : zip_code,
        description : description
      }
      api.post('/edit-profil' ,dataPost)
        .then(res => {
          if(res.data.type && res.data.type == "danger") {
            setMsgServer(res.data.message);
            setClassMsg("danger");
            setDisplayMsg("show");
            setIconMsg("info");
          }
          if(res.data.type && res.data.type == "success") {
            let user = JSON.parse(localStorage.getItem("user"));
            user.name = name;
            user.email = email;
            localStorage.setItem("user", JSON.stringify(user));

            setMsgServer(res.data.message);
            setClassMsg("success");
            setDisplayMsg("show");
            setIconMsg("check");
            window.location.reload();
          }
          }).catch(() => {
            setMsgServer("error_save_change");
            setClassMsg("success");
            setDisplayMsg("show");
            setIconMsg("check");
          })
    }


    //Handle Change Password 


    const validatePass = () => {
      let currentMdpError = '';
      let newMdpError = '';
      let confMdpErr = '';
      if (password.length < 6) {
        currentMdpError = 'Current Password Error !';
        setCurrentPassErr(currentMdpError)
       }
       if (newPassword.length < 6) {
        newMdpError = 'Password cannot be less 6 character!';
        setNewPassErr(newMdpError)
       }
       if (newPassword != confirmPass) {
        confMdpErr = `Passwords don't match`;
        setconfMdpErr(confMdpErr)
       }
       if (currentMdpError  || newMdpError || confMdpErr ) {
        setCurrentPassErr(currentMdpError);
        setNewPassErr(newMdpError);
        setconfMdpErr(confMdpErr)
        return false;
      }
        return true;
    };







    const handleSubmitPass = (e) => {
      e.preventDefault();
      let isValid = validatePass()
      if(isValid){
        handleChangePass();

      }else {
        return false
      }
    }
  
   const handleChangePass = () => {
      
      let data ={
        password : password,
        newPassword : newPassword,
        confirmNewPassword : confirmPass
      }
      api.post('/profil/changepassword',data)
      .then(res => {
        if(res.data.type && res.data.type == "danger") {
          setMsgServer(res.data.message);
          setClassMsg("danger");
          setDisplayMsg("show");
          setIconMsg("info");
        }
        if(res.data.type && res.data.type == "success") {
          setMsgServer(res.data.message,resetForm());
          setClassMsg("success");
          setDisplayMsg("show");
          setIconMsg("check");
        }
        }).catch(() => {
          setMsgServer("error_save_change");
          setClassMsg("danger");
          setDisplayMsg("show");
          setIconMsg("info");
        })

    }


    const resetForm = () => {
      setPassword("");
      setNewPassword("");
      setConfirmPass("");

      setTimeout(() => {
        setDisplayMsg('hide');
      }, 3000);
    }

  return (

    
  <Card small className="mb-4">
    <Card.Header className="border-bottom">
      <h6 className="m-0"></h6>
    </Card.Header>
    <ListGroup flush>
      <ListGroupItem className="p-3">
      <div className={`mb-0 alert alert-${classMsg} fade ${displayMsg}`}>
        <i class={`fa fa-${iconMsg} mx-2`}></i> {t(msgServer)}
      </div>
        <Row>
          <Col>
            <Form>
              <Row form className="gap-4">
                {/* First Name */}
                <Col md="5" className="form-group">
                  <label htmlFor="feFirstName">{t('name')}</label>
                  <Form.Control
                    id="feFirstName"
                    placeholder={t('name')}
                    className={errorMsg.nameError =='' ? '' : 'is-invalid'}
                    value={name}
                    onChange={(e) => {setName(e.target.value)}}
                  />
                  <div className="invalid-feedback" >{errorMsg.nameError}</div>
                </Col>
                {/* Email */}
                <Col md="6" className="form-group">
                  <label htmlFor="feEmail">{t('email')}</label>
                  <Form.Control
                    type="email"
                    id="feEmail"
                    placeholder={t('email')}
                    className={errorMsg.emailError =='' ? '' : 'is-invalid'}
                    value={email}
                    onChange={(e) => {setEmail(e.target.value)}}
                    autoComplete="email"
                  />
                  <div className="invalid-feedback" >{errorMsg.emailError}</div>
                </Col>
              </Row>
              <Form.Group>
                <label htmlFor="feAddress">{t('address')}</label>
                <Form.Control
                  id="feAddress"
                  placeholder={t('address')}
                  value={address}
                  onChange={(e) => {setAddress(e.target.value)}}
                />
              </Form.Group>
              <Row form className="gap-2 mt-3">
                {/* State */}
                <Col md="4" className="form-group">
                  <label htmlFor="feInputState">{t('state')}</label>
                  <Form.Select id="feInputState" value={country} onChange={(e) => handleCountry(e.target.value)}>
                    <option>Choose...</option>

                    {
                       allCountry.map((country, i) => {

                        return (
                          <option>{country}</option>
                        )
                      })

                    }
                  </Form.Select>
                </Col>
                {/* City */}
                <Col md="5" className="form-group">
                  <label htmlFor="feCity">{t('city')}</label>
                  <Form.Select
                    id="feCity"
                    placeholder={t('city')}
                    value={city}
                    onChange={(e) => {setCity(e.target.value)}}
                    style={{height:"38px"}}
                  >
                    <option>{other}</option>
                    {
                      allStates.map((state, i) => {

                        return (
                          <option>{state}</option>
                        )
                      })
                    }
                    </Form.Select>
                      <input type="checkbox" name="Autre" id="check" onClick={() => setToggle(!toggle)} /> {t('other')}

                        {
                          toggle 
                          ?

                          <Form.Control 
                          
                          placeholder={t('city')}
                          onChange={(e) => {setCity(e.target.value)}}
                          />

                          :
                          ''
                        }
                      
                </Col>
                {/* Zip Code */}
                <Col md="2" className="form-group">
                  <label htmlFor="feZipCode">{t('zip')}</label>
                  <Form.Control
                    id="feZipCode"
                    placeholder={t('zip')}
                    value={zip_code}
                    onChange={(e) => {setZipCode(e.target.value)}}
                    style={{height:"38px"}}

                  />
                </Col>
              </Row>
              <Row form>
                {/* Description */}
                <Col md="12" className="form-group">
                  <label htmlFor="feDescription">{t('desc')}</label>
                  <Form.Control as="textarea" id="feDescription" rows="5" onChange={(e) => {setDescription(e.target.value)}} value={description} /> 
                </Col>
              </Row>
              <Button theme="accent" onClick={handleSubmit}>{t('update_btn')}</Button>
            </Form>
          </Col>
        </Row>
        <hr />
        <Row form className="p-1">
          <Form>
                    <h5 className="pb-3 pt-3">{t('pass_change')}</h5>      
            <Row form className="gap-2">    
                    <Col md="4" className="form-group">
                     <label htmlFor="feCurrentPassword">{t('current_pass')}</label>
                      <Form.Control
                        type="password"
                        id="feCurrentPassword"
                        placeholder={t('current_pass')}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={`form-control form-control-md ${currentMdpError ? "is-invalid" : ""}`}

                      />
                        <div className="invalid-feedback">{currentMdpError}</div>
                    </Col>
                    <Col md="3" className="form-group">
                      <label htmlFor="feNewPassword">{t('new_pass')}</label>
                      <Form.Control
                        type="password"
                        id="feNewPassword"
                        placeholder={t('new_pass')}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className={`form-control form-control-md ${newMdpError ? "is-invalid" : ""}`}

                      />
                        <div className="invalid-feedback">{newMdpError}</div>

                    </Col>
                    <Col md="4" className="form-group">
                      <label htmlFor="feConfNewPass">{t('conf_pass')} </label>
                      <Form.Control
                        type="password"
                        id="feConfNewPass"
                        placeholder={t('conf_pass')}
                        value={confirmPass}
                        onChange={(e)=> setConfirmPass(e.target.value)}
                        className={`form-control form-control-md ${confMdpErr ? "is-invalid" : ""}`}

                      />
                        <div className="invalid-feedback">{confMdpErr}</div>

                    </Col>            
            </Row>
            <Button theme="accent" onClick={handleSubmitPass}>{t('change_btn')}</Button>
          </Form>
        </Row>
      </ListGroupItem>
    </ListGroup>
  </Card>
  )
  };
