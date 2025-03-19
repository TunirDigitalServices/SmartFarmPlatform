import React, { useState } from 'react'
import { useTranslation } from "react-i18next";
import { Link } from 'react-router-dom';
import { Col, Row, Card, CardBody, CardHeader, Container } from 'shards-react';

const Terms = () => {
    const [local, setLocal] = useState(localStorage.getItem("local") || "en");
    const { t, i18n } = useTranslation();

    const changeLanguageHandler = async (e) => {
        const languageValue = e.target.value
        i18n.changeLanguage(languageValue);
        localStorage.setItem("local", languageValue)
        setLocal(languageValue)
    }

    return (
        <Container fluid className="main-content-container px-4">
            <Row noGutters className="page-header p-4 d-flex justify-content-center align-items-center">
                <Col lg='8' md='12' sm='12'>
                    <Card>
                        <CardHeader>
                            <div className="col-lg-12 text-right p-0">
                                <select value={local} className="custom-select" style={{ width: 70 }} onChange={changeLanguageHandler}>
                                    <option value="en">En</option>
                                    <option value="fr">Fr</option>
                                </select>
                            </div>
                            <Link to="/Register"

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

                        </CardHeader>
                        <CardBody>
                            <h4 className='text-center font-weight-bold'>{t('termes_conditions')}</h4>
                            <p style={{ fontSize: 13, padding: 8 }}>
                                    {t('Terms')}
                                
                            </p>

                        </CardBody>
                    </Card>
                </Col>
            </Row>
        </Container>
    )
}

export default Terms