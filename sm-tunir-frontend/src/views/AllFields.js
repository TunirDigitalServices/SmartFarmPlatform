import React, { useState, useEffect } from 'react'
import { Container, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom'
import api from '../api/api'
import moment from 'moment'
import { useTranslation } from "react-i18next";

const AllFields = ({ filteredFields, sensorsData, crops }) => {
    const navigate = useNavigate()

    const [fieldStatus, setFS] = useState({
        resultState: 0, state: ''
    })

    const { t, i18n } = useTranslation();

    useEffect(() => {
        sensorsData.map(sensors => {
            let MV1 = sensors.mv1;
            let MV2 = sensors.mv2;
            let MV3 = sensors.mv3;
            let result = (Number(MV1) + Number(MV2) + Number(MV3)) / 3
            if ((MV1 !== '0.000') && (MV2 !== '0.000') && (MV3 !== '0.000')) {
                setFS({ resultState: result, state: 'Full' })
            }
            if ((MV1 !== '0.000') && (MV2 !== '0.000') && (MV3 === '0.000')) {
                setFS({ resultState: result, state: 'Optimal' })
            }
            if ((MV1 === '0.000') && (MV2 === '0.000') && (MV3 === '0.000')) {
                setFS({ resultState: result, state: 'Critical' })
            }
        })

    }, [sensorsData])

    const routeToField = (fieldUid) => {
        if (fieldUid) {
            localStorage.setItem(
                "Field",
                fieldUid
            );
            navigate(`/Fields/${fieldUid}`)
            // window.location.reload()
        }
    }
    const calculateLeftPosition = (value) => {
        const minValue = 22;
        const maxValue = 60;
        const adjustedValue = Math.max(minValue, Math.min(maxValue, parseFloat(value)));
        return `calc(${adjustedValue}% - 6px)`;
    };


    const returnBL = (charge) => {
        if ((Number(charge) >= 90)) {
            return <i className="fas fa-battery-full"></i>;
        } else if ((Number(charge) < 90) && (Number(charge) > 70)) {
            return <i className="fas fa-battery-three-quarters"></i>;
        } else if (Number(charge) === 50) {
            return <i className="fas fa-battery-half"></i>;
        } else if ((Number(charge) > 40) && (Number(charge) < 50)) {
            return <i className="fas fa-battery-quarter"></i>;
        } else {
            return <i className="fas fa-battery-empty"></i>;
        }
    };
    return (
        <Container >

            <Row className='gap-3 justify-content-center'>
                {
                    filteredFields.map(field => {
                        let cropT = ''
                        crops.map(crop => {
                            if (crop.fieldId === field.id) {
                                cropT = crop.type
                            }
                        })
                        let msg = ""
                        if (field.sensors == 0) msg = "Please use the app to install/register a sensor."
                        return (
                            <Col lg="4" md="6" sm="6">
                                <div className="sensor w-100">
                                    <div className="sensorHeader">
                                        <div className="sensorNameWrapper">
                                            <p onClick={() => routeToField(field.uid)} style={{ fontSize: "1.2rem" }}>{field.name}</p>
                                        </div>
                                    </div>
                                    <hr />
                                    <div>
                                        <div className="plantWrapper">
                                            {
                                                cropT == ""
                                                    ?
                                                    null
                                                    :
                                                    <div className="plant mt-3">

                                                        <i className="fas fa-seedling"></i>
                                                        <p style={{ marginLeft: 5 }}>{cropT}</p>
                                                    </div>
                                            }
                                        </div>
                                        <p style={{ textAlign: "center", color: "#7e7e7e", fontSize: "1rem" }}>
                                            {msg}
                                        </p>

                                    </div>
                                    {
                                        field.sensors.map(sensor => {
                                            let mv1, mv2, mv3 = ''
                                            let charge = ''
                                            let signal = ''
                                            sensorsData.map(data => {
                                                if (data.code === sensor.code) {
                                                    mv1 = data.mv1
                                                    mv2 = data.mv2
                                                    mv3 = data.mv3
                                                    charge = data.charge
                                                    signal = data.signal
                                                }
                                            })
                                            return (
                                                <>
                                                    <div className="sensorBody border p-2 rounded m-1">

                                                        <div className='text-center d-flex flex-wrap justify-content-between align-items-center'>
                                                            <p>QR: {sensor.code}</p>
                                                            <div className="sensorInfo">
                                                                <div>
                                                                    <p style={{ marginLeft: 2, marginRight: 2 }}>
                                                                        {parseInt(signal).toFixed(0)}%
                                                                    </p>
                                                                    <i className="fas fa-signal"></i>
                                                                </div>
                                                                <div>
                                                                    <p style={{ marginLeft: 2, marginRight: 2 }}>
                                                                        {parseInt(charge).toFixed(0)}%
                                                                    </p>
                                                                    {returnBL(charge)}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        {/* <section className="ProgressBarWrapper">
                                                            <div className="stats-dates">
                                                                <p style={{ fontSize: 13 }}>{t('niveau')} 1</p>
                                                                <div className="Marker-tomorrow" style={{ left: calculateLeftPosition(mv1) }}>
                                                                    <svg _ngcontent-pxc-c161="" xmlns="http://www.w3.org/2000/svg" width="11" height="13" viewBox="0 0 14 17" class="drop-element ng-star-inserted" style={{ left: `calc(90% - 6px)` }}><g _ngcontent-pxc-c161="" fill="none"><path _ngcontent-pxc-c161="" d="M7.8 0.4L7.5 0 7.1 0.4C6.9 0.7 1.1 7.3 1.1 11.9 1.1 15.1 4 17.6 7.5 17.6 11 17.6 13.8 15.1 13.8 11.9 13.8 7.3 8.1 0.7 7.8 0.4Z" fill="#FE3C65" class="drop" style={{ fill: "rgb(16, 201, 160)" }}></path><path _ngcontent-pxc-c161="" d="M13.8 11.9C13.8 7.3 8.1 0.7 7.8 0.4L7.5 0 7.1 0.4C7 0.6 5 2.8 3.4 5.5 2.2 7.6 1.1 9.9 1.1 11.9 1.1 15.1 4 17.6 7.5 17.6 11 17.6 13.8 15.1 13.8 11.9Z" stroke="#FFF"></path></g></svg>
                                                                </div>
                                                                <div className="Segment1"></div>
                                                            </div>
                                                            <div className="stats-dates">
                                                                <span style={{ fontSize: 13 }}>{t('niveau')} 2</span>

                                                                <div className='Marker' style={{ left: calculateLeftPosition(mv2) }}>
                                                                    <svg _ngcontent-pxc-c161="" xmlns="http://www.w3.org/2000/svg" width="14" height="17" viewBox="0 0 14 17" class="drop-element ng-star-inserted"><g _ngcontent-pxc-c161="" fill="none"><path _ngcontent-pxc-c161="" d="M7.8 0.4L7.5 0 7.1 0.4C6.9 0.7 1.1 7.3 1.1 11.9 1.1 15.1 4 17.6 7.5 17.6 11 17.6 13.8 15.1 13.8 11.9 13.8 7.3 8.1 0.7 7.8 0.4Z" fill="#FE3C65" class="drop" style={{ fill: "rgb(16, 201, 160)" }}></path><path _ngcontent-pxc-c161="" d="M13.8 11.9C13.8 7.3 8.1 0.7 7.8 0.4L7.5 0 7.1 0.4C7 0.6 5 2.8 3.4 5.5 2.2 7.6 1.1 9.9 1.1 11.9 1.1 15.1 4 17.6 7.5 17.6 11 17.6 13.8 15.1 13.8 11.9Z" stroke="#FFF"></path></g></svg>
                                                                </div>

                                                                <div className="Segment2" style={{ marginRight: '-5px' }}></div>
                                                            </div>
                                                            <div className="stats-dates">
                                                                <p style={{ fontSize: 13 }}>{t('niveau')} 3</p>

                                                                <div className="Marker-yesterday" style={{ left: calculateLeftPosition(mv3) }}>
                                                                    <svg _ngcontent-pxc-c161="" xmlns="http://www.w3.org/2000/svg" width="11" height="13" viewBox="0 0 14 17" class="drop-element ng-star-inserted" style={{ left: "calc(59.7044% - 6px)" }}><g _ngcontent-pxc-c161="" fill="none"><path _ngcontent-pxc-c161="" d="M7.8 0.4L7.5 0 7.1 0.4C6.9 0.7 1.1 7.3 1.1 11.9 1.1 15.1 4 17.6 7.5 17.6 11 17.6 13.8 15.1 13.8 11.9 13.8 7.3 8.1 0.7 7.8 0.4Z" fill="#FE3C65" class="drop" style={{ fill: "rgb(16, 201, 160)" }}></path><path _ngcontent-pxc-c161="" d="M13.8 11.9C13.8 7.3 8.1 0.7 7.8 0.4L7.5 0 7.1 0.4C7 0.6 5 2.8 3.4 5.5 2.2 7.6 1.1 9.9 1.1 11.9 1.1 15.1 4 17.6 7.5 17.6 11 17.6 13.8 15.1 13.8 11.9Z" stroke="#FFF"></path></g></svg>
                                                                </div>
                                                                <div className="Segment3"></div>
                                                            </div>
                                                            <div className="status">
                                                                <div>{t('Critical')}</div>
                                                                <div style={{ color: "#26cc94" }}>{t('Optimal')}</div>
                                                                <div>{t('Full')}</div>
                                                            </div>
                                                        </section> */}
                                                        <div className="pt-2">
                                                            <div className="ProgressBarWrapper">
                                                                <div className="stats-dates">
                                                                    <span style={{ fontSize: 14 }}>{t('niveau')} 1</span>
                                                                    <div className="Marker-tomorrow" >
                                                                        <svg
                                                                            xmlns="http://www.w3.org/2000/svg"
                                                                            width="11"
                                                                            height="13"
                                                                            viewBox="0 0 14 17"
                                                                            className="drop-element ng-star-inserted"
                                                                        >
                                                                            <g fill="none">
                                                                                <path
                                                                                    d="M7.8 0.4L7.5 0 7.1 0.4C6.9 0.7 1.1 7.3 1.1 11.9 1.1 15.1 4 17.6 7.5 17.6 11 17.6 13.8 15.1 13.8 11.9 13.8 7.3 8.1 0.7 7.8 0.4Z"
                                                                                    fill="#FE3C65"
                                                                                    className="drop"
                                                                                    style={{ fill: "rgb(16, 201, 160)" }}
                                                                                ></path>
                                                                                <path
                                                                                    d="M13.8 11.9C13.8 7.3 8.1 0.7 7.8 0.4L7.5 0 7.1 0.4C7 0.6 5 2.8 3.4 5.5 2.2 7.6 1.1 9.9 1.1 11.9 1.1 15.1 4 17.6 7.5 17.6 11 17.6 13.8 15.1 13.8 11.9Z"
                                                                                    stroke="#FFF"
                                                                                ></path>
                                                                            </g>
                                                                        </svg>
                                                                    </div>
                                                                    <div
                                                                        style={{
                                                                            opacity: "0.2",
                                                                            width: "80%",
                                                                            height: "20px",
                                                                            position: "relative",
                                                                            margin: "0px 0px 0px 10px",
                                                                            backgroundImage: "linear-gradient(90deg, #ff2866, #f98c66, #bfba2e, #26cc94, #00c7a8, #00b7bc, #00a0db)",
                                                                        }}
                                                                    ></div>
                                                                </div>
                                                                <div className="stats-dates " style={{ margin: "-5px 0px" }}>
                                                                    <span style={{ fontSize: 14 }}>{t('niveau')} 2</span>
                                                                    <div className="Marker" >
                                                                        <svg
                                                                            xmlns="http://www.w3.org/2000/svg"
                                                                            width="14"
                                                                            height="17"
                                                                            viewBox="0 0 14 17"
                                                                            className="drop-element ng-star-inserted"
                                                                        >
                                                                            <g fill="none">
                                                                                <path
                                                                                    d="M7.8 0.4L7.5 0 7.1 0.4C6.9 0.7 1.1 7.3 1.1 11.9 1.1 15.1 4 17.6 7.5 17.6 11 17.6 13.8 15.1 13.8 11.9 13.8 7.3 8.1 0.7 7.8 0.4Z"
                                                                                    fill="#FE3C65"
                                                                                    className="drop"
                                                                                    style={{ fill: "rgb(16, 201, 160)" }}
                                                                                ></path>
                                                                                <path
                                                                                    d="M13.8 11.9C13.8 7.3 8.1 0.7 7.8 0.4L7.5 0 7.1 0.4C7 0.6 5 2.8 3.4 5.5 2.2 7.6 1.1 9.9 1.1 11.9 1.1 15.1 4 17.6 7.5 17.6 11 17.6 13.8 15.1 13.8 11.9Z"
                                                                                    stroke="#FFF"
                                                                                ></path>
                                                                            </g>
                                                                        </svg>
                                                                    </div>
                                                                    <div
                                                                        style={{
                                                                            margin: "0px 0px 0px 10px",
                                                                            width: "80%",
                                                                            height: "20px",
                                                                            backgroundImage: "linear-gradient(to right, #ff2866, #f98c66, #bfba2e, #26cc94, #00c7a8, #00b7bc, #00a0db)",
                                                                        }}
                                                                    ></div>
                                                                </div>
                                                                <div className="stats-dates">
                                                                    <span style={{ fontSize: 14 }}>{t('niveau')} 3</span>
                                                                    <div className="Marker-yesterday" >
                                                                        <svg
                                                                            xmlns="http://www.w3.org/2000/svg"
                                                                            width="11"
                                                                            height="13"
                                                                            viewBox="0 0 14 17"
                                                                            className="drop-element ng-star-inserted"
                                                                        >
                                                                            <g fill="none">
                                                                                <path
                                                                                    d="M7.8 0.4L7.5 0 7.1 0.4C6.9 0.7 1.1 7.3 1.1 11.9 1.1 15.1 4 17.6 7.5 17.6 11 17.6 13.8 15.1 13.8 11.9 13.8 7.3 8.1 0.7 7.8 0.4Z"
                                                                                    fill="#FE3C65"
                                                                                    className="drop"
                                                                                    style={{ fill: "rgb(16, 201, 160)" }}
                                                                                ></path>
                                                                                <path
                                                                                    d="M13.8 11.9C13.8 7.3 8.1 0.7 7.8 0.4L7.5 0 7.1 0.4C7 0.6 5 2.8 3.4 5.5 2.2 7.6 1.1 9.9 1.1 11.9 1.1 15.1 4 17.6 7.5 17.6 11 17.6 13.8 15.1 13.8 11.9Z"
                                                                                    stroke="#FFF"
                                                                                ></path>
                                                                            </g>
                                                                        </svg>
                                                                    </div>
                                                                    <div
                                                                        style={{
                                                                            opacity: "0.2",
                                                                            margin: "0px 0px 0px 10px",
                                                                            width: "80%",
                                                                            height: "20px",
                                                                            backgroundImage: "linear-gradient(to right, #ff2866, #f98c66, #bfba2e, #26cc94, #00c7a8, #00b7bc, #00a0db)",
                                                                        }}
                                                                    ></div>
                                                                </div>
                                                                <div className="status">
                                                                    <div>{t('Critical')}</div>
                                                                    <div style={{ color: "#26cc94" }}>{t('Optimal')}</div>
                                                                    <div>{t('Full')}</div>
                                                                </div>
                                                            </div>
                                                        </div>


                                                        <div className="sensorFooter">
                                                            <p>{t('last_reading')} :</p>
                                                            {
                                                                sensorsData.map(data => {
                                                                    let LastTime = ""
                                                                    if (data.code === sensor.code) {
                                                                        LastTime = moment(data.time).locale('fr').format('L, LT')

                                                                    }
                                                                    return (
                                                                        <p>{LastTime}</p>

                                                                    )
                                                                })
                                                            }
                                                        </div>
                                                    </div>
                                                </>
                                            )
                                        })
                                    }
                                </div>
                            </Col>

                        )
                    })
                }
            </Row>
        </Container>
    )
}

export default AllFields