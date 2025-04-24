import React, { useState } from 'react'
import logo from "../../assets/images/Logo smart farm1.jpg"
import { Container, Row, Col, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router';
import PropTypes from "prop-types";
import Background from '../../assets/images/background-signup.png';

import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
function Login() {
  const [credentials, setCredentials] = useState({ email: "", pwd: "" });
  const [rememberMe, setRM] = useState(false);
  const [msgError, setMsgError] = useState({ msg: "", displayMsg: "hide" });
  const [JWT, setJWT] = useState(null);
  const [RfreshJWT, setRefreshJWT] = useState(null);
  const [local, setLocal] = useState(localStorage.getItem("local") || "en");
  const { t, i18n } = useTranslation();



  const handleSubmit = async (e) => {
    e.preventDefault();
    LoginApi();
  };
  const navigate = useNavigate()

  const LoginApi = async () => {
    var requestOptions = {
      method: "POST",
      headers: { 'Content-Type': 'application/json' },
      redirect: "follow",
      body: JSON.stringify({ password: credentials.pwd, email: credentials.email })
    };
    await fetch(`${process.env.REACT_APP_BASE_URL}/login`, requestOptions)
      .then(response => response.json())
      .then(result => {

        //setJWT(result.token);
        var data = result.result;
        if (result.errors) {
          let errorsData = result.errors
          errorsData.map((item, indx) => {
            setMsgError({ msg: item.msg, displayMsg: "show" })
          })
        }
        if (result.type && result.type == "danger") {
          console.log(result.status)
          if (result.status === "400") {
            setMsgError({ msg: "Invalid password. Please try again.", displayMsg: "show" });
          } else if (result.status === "404") {
            setMsgError({ msg: "Unauthorized. Please check your credentials.", displayMsg: "show" });
          }
          else {
            setMsgError({ msg: "An unexpected error occurred. Please try again later.", displayMsg: "show" });
          }
        }
        if (data) {
          localStorage.setItem("user", JSON.stringify({ "email": data.email, "name": data.name, "id": data.uid, "role": data.role, "offer_type": data.offer_type, "avatar": data.upload_file_name, "has_command": data.has_command }));
          localStorage.setItem("token", JSON.stringify({ "token": result.token }))
          localStorage.setItem("refreshToken", result.refreshToken)
          // localStorage.setItem("local","en")

          if (data.role == "ROLE_ADMIN") {
            navigate("/admin/users")

          } else if (data.role == "ROLE_USER" && data.offer_type == '2') {
            navigate("/")
          } else if (data.role == "ROLE_USER" && data.offer_type == '1') {
            navigate("/Dashboard")

          }
          window.location.reload();
        }

      })
      .catch(error => {
        console.error("Login failed:", error.message);
        setMsgError({ msg: "Login failed. Please try again later.", displayMsg: "show" });
      });
  };
  const changeLanguageHandler = async (e) => {
    const languageValue = e.target.value
    i18n.changeLanguage(languageValue);
    localStorage.setItem("local", languageValue)
    setLocal(languageValue)
  }
  return (
    <Container fluid className="main-content-container p-4">
      <Row className="d-flex justify-content-center align-items-center">
        <Col lg="8" md="12" sm="12">
          <Card className="p-4">
            <Row>
              <Col lg="5" md="12" sm="12" className="border-right" style={{ backgroundImage: `url(${Background})`, backgroundRepeat: "no-repeat" }} >
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
                  <h4 style={{ fontFamily: "'Satisfy', cursive", color: "#25A6B8", textAlign: "center" }}>{t('agriculture_intelligente')}</h4>
                </div>
              </Col>
              <Col lg="7" md="12" sm="12" >
                <div className="d-flex justify-content-end ">
                  <select value={local} className="custom-select "  onChange={changeLanguageHandler}>
                    <option value="en">En</option>
                    <option value="fr">Fr</option>
                    <option value="it">It</option>
                    <option value="ar">Ar</option>

                  </select>
                </div>
                <div className={`mb-0 alert alert-danger fade ${msgError.displayMsg}`} role="alert"><i class="fa fa-info mx-2"></i>{msgError.msg}</div>
                <h3 style={{ textAlign: "center" }}>{t('sign_in')}</h3>
                <div className=" mt-2 font-weight-light text-center">
                  <span> {t('have_account')} </span>
                  <Link to="/sign-up"
                    style={{ color: "#0daaa2" }}>
                    {t('Sign up')}
                  </Link>
                </div>
                <form className="pt-3">
                  <div className="form-group mb-3">
                    <input
                      type="email"
                      style={{
                        background: "transparent", padding: "7px 0", width: "100%",
                        border: "0",
                        borderBottom: "1px solid #25A6B8",
                        outline: "0",
                        fontSize: "1.1rem"
                      }}
                      // className="form-control form-control-lg"
                      placeholder={t('email')}
                      onChange={e =>
                        setCredentials({ ...credentials, email: e.target.value })
                      }
                    />
                  </div>
                  <div className="form-group mb-5">
                    <input
                      type="password"
                      style={{
                        background: "transparent", padding: "7px 0", width: "100%",
                        border: "0",
                        borderBottom: "1px solid #25A6B8",
                        outline: "0",
                        fontSize: "1.1rem"
                      }}
                      // className="form-control form-control-lg"
                      placeholder={t('Password')}
                      onChange={e =>
                        setCredentials({ ...credentials, pwd: e.target.value })
                      }
                    />
                  </div>
                  <div className="my-3">
                    <button
                      style={{ color: 'white', backgroundColor: '#27A6B7' }}
                      className="btn btn-block  btn-lg font-weight-medium auth-form-btn"

                      onClick={
                        handleSubmit
                      }
                    >
                      {t('sign_in')}
                    </button>
                  </div>
                  <div className="my-4 d-flex justify-content-between align-items-center">
                    <div className="form-check">
                      <label className="form-check-label text-muted">
                        <input
                          onClick={() => {
                            localStorage.setItem("RememberMe", !rememberMe);
                            setRM(!rememberMe);
                          }}
                          type="checkbox"
                          className="form-check-input"
                        />
                        <i className="input-helper"></i>
                        {t('keep_me')}
                      </label>
                    </div>
                    <Link to="/forget-password" style={{ color: "#0daaa2" }}>{t('forgot_pass')} </Link>
                  </div>

                </form>

              </Col>
            </Row>
          </Card>

        </Col>
      </Row>

    </Container>
  )
}
Login.propTypes = {
  setToken: PropTypes.func.isRequired
};

export default Login