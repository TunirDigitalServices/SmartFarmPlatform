import React, { useState } from 'react'
import { useEffect } from 'react'
import { Container, Row, Col, Card, CardHeader, CardBody, Form, FormGroup, FormCheckbox, FormInput, Button } from 'shards-react'
import api from '../api/api'
import axios from 'axios'
import Checkbox from './CheckBox'
import PageTitle from "../components/common/PageTitle";
import { useTranslation } from "react-i18next";
import Progress from 'react-circle-progress-bar'
import { useHistory } from 'react-router-dom'
import LoadingSpinner from '../components/common/LoadingSpinner'

const Commands = () => {

    const history = useHistory()
    const [isLoading, setIsLoading] = useState(true)
    const { t, i18n } = useTranslation();

    const [checked, setChecked] = useState('')
    // const [action, setAction] = useState('')


    const [equip, setEquip] = useState('')
    const [relays, setRelays] = useState([])
    const [state, setState] = useState()
    const [equipments, setEquipments] = useState([])


    const getCommands = async () => {

        let data = {
            "sf-token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiZW1haWwiOiJjbGllbnQxQGdtYWlsLmNvbSIsImZpcnN0X25hbWUiOm51bGwsImxhc3RfbmFtZSI6bnVsbCwicm9sZSI6ImNsaWVudCIsImlhdCI6MTY1ODMyNjk3NH0.iyP8NpXDo0KSzPpEtvbWa72MBZNUhvQSusAWuCZ_m8c"
        }
        await axios.get(`http://51.195.46.92:8080/api/commande/state/CBRD000000000001`, { headers: data })
            .then(response => {
                let relaysData = response.data.cboard.relays;
                setRelays(relaysData)
                setIsLoading(false)
            }).catch(err => {
                console.log(err)
            })

    }

    const getEquipments = () => {
        api.get('/equipment/equipments')
          .then(response => {
            let equipmentData = response.data
            setEquipments(equipmentData)
          }).catch(err => {
            console.log(err)
          })
      }

    const controlCommands = () => {
        let action = ''
        if (checked === true) {
            action = 'on'
        }
        if (checked === false) {
            action = 'off'

            // setAction('off')
        }

        let data = {
            "sf-token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiZW1haWwiOiJjbGllbnQxQGdtYWlsLmNvbSIsImZpcnN0X25hbWUiOm51bGwsImxhc3RfbmFtZSI6bnVsbCwicm9sZSI6ImNsaWVudCIsImlhdCI6MTY1ODMyNjk3NH0.iyP8NpXDo0KSzPpEtvbWa72MBZNUhvQSusAWuCZ_m8c"
        }
        axios.get(`http://51.195.46.92:8080/api/commande/do/CBRD000000000001/${equip}/${action}`, { headers: data })
            .then(response => {
                if (response.data.done === true) {
                    setTimeout(() => {
                        getCommands()

                    }, 1000)

                }

            }).catch(err => {
                console.log(err)
            })

    }

    useEffect(() => {
        controlCommands()
    }, [equip, checked])

    useEffect(() => {
        const interval = setInterval(() => {
            getCommands()
        }, 8000);
        return () => clearInterval(interval);
    }, [])

    useEffect(()=>{
        getEquipments()
    },[])

    return (
        <>
            <Container fluid className="main-content-container p-4">
                <Row noGutters className="page-header py-4">
                    <PageTitle
                        sm="4"
                        title={t('Commands')}
                        subtitle={t('overview')}
                        className="text-sm-left"
                    />
                </Row>
                <Row className='py-2 d-flex align-items-center justify-content-between'>
                    <Col lg='4' md='12' sm='12'>
                        <div className='d-flex align-items-center'>
                            <h4 className='mr-4'>Devices ({equipments.length})</h4>
                            <Button onClick={() => history.push('/AddEquipment')} outline pill theme="secondary">Add New</Button>
                        </div>
                    </Col>
                    <Col lg='3' md='12' sm='12'>
                        <FormInput
                            value=''
                            onChange={(e) => { }}
                            id="search"
                            placeholder="Search By Farm "
                        />
                    </Col>

                </Row>
                <Row>
                    <Col lg='8' md='12' sm='12'>
                        <Card>
                            <CardHeader className='d-flex align-items-center justify-content-around border-bottom'>
                                <Button outline pill theme="secondary">Manual Irrigation</Button>
                                <Button onClick={() => history.push('/Commands/planning')} outline pill theme="info">Controls Irrigation</Button>
                                <Button outline pill theme="primary">Smart Irrigation</Button>
                            </CardHeader>
                            {
                                isLoading

                                    ?

                                    <LoadingSpinner />

                                    :
                                    <CardBody>
                                        <div
                                            style={{
                                                width: "100%",
                                                height: "100%",
                                                display: "flex",
                                                flexDirection: "column",
                                                justifyContent: "center",
                                                alignItems: "center"
                                            }}
                                        >
                                            <Progress
                                                ballStrokeWidth={10}
                                            />
                                        </div>
                                        <Row className='d-flex justify-content-center align-items-center flex-column font-weight-bold'>
                                            <h5 style={{ color: '#333333' }}>Device 1</h5>
                                            <h6 style={{ color: '#232323', fontSize: 15 }}>CBRD000000000001</h6>
                                        </Row>
                                        <Row className='d-flex justify-content-center font-weight-light'>
                                            {
                                                relays.map((obj, index) => {

                                                    return (

                                                        <Row className='d-flex justify-content-center flex-column-reverse m-2' key={index}>
                                                            <Checkbox
                                                                // controlCommands={controlCommands}
                                                                obj={obj}
                                                                onChange={(item) => {

                                                                    setEquip(item.port)
                                                                    // setState(item.status)
                                                                    setChecked(item.status)
                                                                    setRelays(relays.map((d) => {
                                                                        return (
                                                                            d.port === item.port ? item : d
                                                                        )
                                                                    }))

                                                                }}
                                                            />
                                                        </Row>
                                                    )
                                                })

                                            }

                                        </Row>
                                    </CardBody>
                            }
                        </Card>
                    </Col>
                    <Col lg='4' md='12' sm='12'>
                        <Card>
                            <CardHeader className='border-bottom' >
                                <FormInput
                                    value=''
                                    onChange={(e) => { }}
                                    id="search"
                                    placeholder="Search By Code"
                                />
                            </CardHeader>
                            <CardBody>
                                {
                                    equipments.map(equip=>{
                                        return (
                                            <div className='d-flex align-items-center justify-content-between border-bottom py-2'>
                                                <h5>{equip.name}</h5>
                                                <button style={{ outline: 'none', border: 'none', background: 'transparent' }}> <i style={{ fontSize: 28 }} className='material-icons'> &#xe88e;</i></button>
                                            </div>

                                        )
                                    })
                                }
                                {/* <div className='d-flex align-items-center justify-content-between border-bottom py-2'>
                                    <h5>Device 2 </h5>
                                    <button style={{ outline: 'none', border: 'none', background: 'transparent' }}> <i style={{ fontSize: 28 }} className='material-icons'> &#xe88e;</i></button>
                                </div>
                                <div className='d-flex align-items-center justify-content-between border-bottom py-2'>
                                    <h5>Device 3 </h5>
                                    <button style={{ outline: 'none', border: 'none', background: 'transparent' }}> <i style={{ fontSize: 28 }} className='material-icons'> &#xe88e;</i></button>
                                </div>
                                <div className='d-flex align-items-center justify-content-between border-bottom py-2'>
                                    <h5>Device 4 </h5>
                                    <button style={{ outline: 'none', border: 'none', background: 'transparent' }}> <i style={{ fontSize: 28 }} className='material-icons'> &#xe88e;</i></button>
                                </div> */}
                            </CardBody>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </>
    )
}

export default Commands