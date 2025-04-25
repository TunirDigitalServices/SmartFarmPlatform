import React, { useState, useEffect } from 'react'
import { Col, Row, Button, Container, FormInput, FormGroup, Card, CardBody, CardHeader, FormSelect } from "shards-react"
import api from '../api/api';
import swal from 'sweetalert';
import { useHistory } from 'react-router-dom';

const AddUser = () => {

    const history = useHistory()

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPass, setConfirmPass] = useState("");

    const [sendEmail, setSendEmail] = useState(false);

    const [nameError, setNameErr] = useState("");
    const [emailError, setEmailErr] = useState("");
    const [mdpError, setPassErr] = useState("");
    const [confMdpErr, setconfMdpErr] = useState("");
    const [offerType, setOfferType] = useState(2);

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
            mdpError = 'Password cannot be less 6 character!';
            setPassErr(mdpError)
        }
        if (password != confirmPass) {
            confMdpErr = `Passwords don't match`;
            setconfMdpErr(confMdpErr)
        }
        if (emailError || nameError || mdpError || confMdpErr) {
            setEmailErr(emailError);
            setNameErr(nameError);
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
            handleRegister()

        } else {
            return false;
        }
    }
    const handleRegister = () => {

        let data = {
            name: name,
            email: email,
            password: password,
            confirmPassword: confirmPass,
            offer_type: offerType,
        }

        api.post('/supplier/add-user', data)
            .then(res => {
                if (res.data.type && res.data.type == "danger") {
                    swal({
                        icon: 'error',
                        title: 'Oops...',
                        text: res.data.message
                    })
                    return false;
                }
                if (res.data.type && res.data.type == "warnning") {
                    swal({
                        icon: 'warning',
                        title: 'Oops...',
                        text: res.data.message
                    })
                    setSendEmail(true, resetForm())
                }
                if (res.data.type && res.data.type == "success") {
                    swal({
                        icon: 'success',
                        title: 'OK',
                        text: 'Email sent check your inbox to confirm'
                    })
                    setSendEmail(true, resetForm())

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
        setName("");
        setEmail("");
        setPassword("");
        setConfirmPass("");
        setOfferType(2);

        setTimeout(() => {
            setSendEmail(false)
        }, 3000);
    }
    

    return (
        <>
            <Container fluid className="main-content-container py-4">
                <Card>
                    <CardHeader className="border-bottom">
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "flex-start",
                                width: "auto",
                                float: "left"
                            }}
                        >
                            <div>
                                <h6 className="m-0" style={{ textAlign: "left" }}>Add User</h6>{" "}
                            </div>
                        </div>
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "flex-end"
                            }}
                        >
                            <Button
                                // theme="success"
                                className="mb-2 mr-1 btn btn-success"
                                onClick={handleSubmit}
                            >
                                <i class={`fa fa-check mx-2`}></i>
                                save
                            </Button>
                            <Button
                                // theme="success"
                                className="mb-2 mr-1 btn btn-danger"
                                onClick={() => history.push('/supplier/users')}
                            >
                                <i class={`fa fa-times mx-2`}></i>
                                cancel
                            </Button>
                        </div>
                    </CardHeader>
                    <CardBody>
                        <Row form className="py-4">
                            <Col lg="6" md="12" sm="12" >
                                <FormGroup>
                                    <label htmlFor="name">Username</label>
                                    <FormInput
                                        id="name"
                                        placeholder="Name"
                                        className={`form-control ${nameError ? 'is-invalid' : ""}`}
                                        value={name}
                                        type="text"
                                        onChange={(e) =>setName(e.target.value)}
                                    />
                                    <div className="invalid-feedback">{nameError}</div>

                                </FormGroup>
                                <FormGroup>
                                    <label htmlFor="email">Email</label>
                                    <FormInput
                                        id="email"
                                        placeholder="Email"
                                        className={`form-control  ${emailError ? "is-invalid" : ""}`}
                                        type="email"
                                        value={email}
                                        onChange={(e) =>setEmail(e.target.value)}
                                    />
                                    <div className="invalid-feedback">{emailError}</div>

                                </FormGroup>
                                <FormGroup>
                                    <label htmlFor="password">Password</label>
                                    <FormInput
                                        type='password'
                                        placeholder="Password"
                                        id="password"
                                        value={password}
                                        className={`form-control ${mdpError ? "is-invalid" : ""}`}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />

                                    <div className="invalid-feedback">{mdpError}</div>

                                </FormGroup>
                                <FormGroup>
                                    <label htmlFor="Confirm Password">Confirm Password</label>
                                    <FormInput
                                        type='password'
                                        id="Confirm Password"
                                        placeholder="Confirm Password"
                                        value={confirmPass}
                                        className={`form-control ${confMdpErr ? "is-invalid" : ""}`}
                                        onChange={(e) => setConfirmPass(e.target.value)}
                                    />
                                    <div className="invalid-feedback">{confMdpErr}</div>

                                </FormGroup>

                            </Col>
                            <Col lg="6" md="12" sm="12">
                                <FormGroup>
                                    <label htmlFor="offer">Offer type</label>
                                    <FormSelect
                                        
                                        value={offerType}
                                        id="offer"
                                    >
                                      <option value="2">Payante</option>
                                    </FormSelect>
                                </FormGroup>
                            </Col>
                        </Row>
                    </CardBody>
                </Card>
            </Container>
        </>
    )
}

export default AddUser