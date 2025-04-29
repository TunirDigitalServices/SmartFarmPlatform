import React, { useState, useEffect } from 'react'
import { Container, Card, CardHeader, CardBody, ListGroup, ListGroupItem, Row, Col, Form, FormGroup, FormInput, FormSelect, FormTextarea, ButtonGroup, Button, Progress, Modal, ModalHeader, ModalBody, BreadcrumbItem, Breadcrumb, Nav, NavItem, NavLink } from "shards-react";
import { useTranslation } from "react-i18next";
import defaultAvatar from "../images/avatars/default-avatar.png"
import { useParams } from 'react-router-dom';
import api from '../api/api';
import swal from 'sweetalert';
import fieldImg from '../images/field.png'
import { Carousel } from "react-responsive-carousel";


const Recommendations = () => {
    const { t, i18n } = useTranslation();
    const params = useParams()
    let Uid = params.uid;
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [field, setField] = useState('')

    const [fieldList, setFieldList] = useState([])
    const [farms, setFarms] = useState([])

    const [titleErr, setTitleErr] = useState('')
    const [descriptionErr, setDescriptionErr] = useState('')

    const [descNotif, setDescriptionNotif] = useState('')
    const [object,setObject] = useState('')
    const [type,setType] = useState('Warning')


    const getFieldsByUser = async () => {
        let url = `/admin/user/${Uid}/fields`;
        await api.get(url)
            .then(response => {
                if (response.data.type === "success") {
                    let FarmsData = response.data.farms
                    setFarms(FarmsData);
                }

            }).catch(error => {
                console.log(error)
            })
    }

    const getFields = () => {
        let Fields = [];
        farms.map(item => {
            let fields = item.fields;
            if (fields) {
                fields.map(field => {
                    Fields.push({
                        title: field.name,
                        status: field.status,
                        description: field.description,
                        Uid: field.uid,
                        farm_id: field.farm_id,
                        Id: field.id
                    })
                })
            }
        })
        setFieldList(Fields)
    }
    useEffect(() => {
        getFields();
    }, [farms])

    useEffect(() => {
        getFieldsByUser();
    }, [])


    const addRecommendation = async () => {
        let data = {
            title: title,
            description: description,
            field_uid: field,
            user_uid: Uid
        }
        await api.post('/admin/add-recommendation', data)
            .then(response => {
                if (response.data.type === 'success') {
                    swal({
                        title: `${t('recommendation_added')}`,
                        icon: "success",
                    })
                    resetForm()
                }
                if (response.data.type === 'danger') {
                    swal({
                        title: `Error`,
                        icon: "error",
                    })
                }
            }).catch(err => {
                swal({
                    title: `Error`,
                    icon: "error",
                })
            })
    }


    const isValidate = () => {
        let titleErr = ''
        if (!title || title === '') {
            titleErr = 'Cannot be empty'
            setTitleErr(titleErr)
            return false
        }
        return true
    }

    const submitRecommendation = () => {
        let isValid = isValidate()
        if (isValid) {
            addRecommendation()
        }
    }

    const resetForm = () => {
        setTitle('')
        setDescription('')
        setField('')
    }

    const addNotif = async () => {
        let data = {
            object: object,
            type: type,
            description: descNotif,
            user_uid: Uid
        }
        await api.post('/admin/add-notification', data)
            .then(response => {
                if (response.data.type === 'success') {
                    swal({
                        title: `${t('notification_added')}`,
                        icon: "success",
                    })
                    resetForm()
                }
                if (response.data.type === 'danger') {
                    swal({
                        title: `Error`,
                        icon: "error",
                    })
                }
            }).catch(err => {
                swal({
                    title: `Error`,
                    icon: "error",
                })
            })
    }


    return (
        <>
            <Container className="py-4">
                <Carousel  showIndicators={true} showThumbs={false} showArrows={true} >
                    <Card>
                        <CardHeader className="border-bottom">
                            <div>
                                <h5>
                                    Recommendation Info

                                </h5>

                            </div>
                        </CardHeader>
                        <Row>
                            <Col lg="8" md="12" sm="12" className="border-right" >

                                <CardBody>
                                    <FormGroup>
                                        <label htmlFor="title">Title</label>
                                        <FormInput
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            id='title'
                                            placeholder="Title"
                                            className={`form-control ${titleErr ? 'is-invalid' : ""}`}

                                        />
                                        <div className="invalid-feedback">{titleErr}</div>
                                    </FormGroup>
                                    <FormGroup>
                                        <label htmlFor="feDescription">{t('desc')}</label>
                                        <FormTextarea
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            placeholder={t('desc')}
                                            id="feDescription"
                                            rows="5" />

                                    </FormGroup>
                                    <FormGroup className='m-2 px-2 d-flex justify-content-center align-items-center'>
                                        <Button onClick={submitRecommendation} outline theme="success" className="m-2">Save</Button>
                                        <Button outline theme="danger" className="m-2 ">Cancel</Button>
                                    </FormGroup>
                                </CardBody>
                            </Col>

                            <Col lg="4" md="12" sm="12" className='d-flex justify-content-around align-items-center flex-column' >
                                <div className="mb-3 mx-auto" style={{ height: "110px" }}>
                                    <img
                                        className="rounded-circle h-100"
                                        width="110"
                                        src={fieldImg}
                                    />
                                </div>
                                <FormGroup className='d-flex justify-content-center align-items-center flex-column'>
                                    <label htmlFor="field">Select Field</label>
                                    <FormSelect
                                        id='field'
                                        value={field}
                                        onChange={(e) => setField(e.target.value)}
                                    >
                                        <option value="">Select Field</option>
                                        {
                                            fieldList.map(field => {
                                                return <option value={field.Uid}>{field.title}</option>

                                            })
                                        }

                                    </FormSelect>
                                </FormGroup>
                            </Col>
                        </Row>
                    </Card>
                    <Card>
                        <CardHeader className="border-bottom">
                            <div>
                                <h5>
                                    Notifications Info

                                </h5>

                            </div>
                        </CardHeader>
                        <Row>
                            <Col lg="8" md="12" sm="12" className="border-right" >

                                <CardBody>
                                    <Row>
                                        <Col lg='6'  md="12" sm="12">
                                        <FormGroup>
                                            <label htmlFor="Object">Object</label>
                                            <FormInput
                                                value={object}
                                                onChange={(e) => setObject(e.target.value)}
                                                id='Object'
                                                placeholder="Object"
                                                className={`form-control ${titleErr ? 'is-invalid' : ""}`}

                                            />
                                            <div className="invalid-feedback">{titleErr}</div>
                                        </FormGroup>
                                        </Col>
                                        <Col lg='6'  md="12" sm="12">

                                        <FormGroup className='d-flex justify-content-center align-items-center flex-column'>
                                        <label htmlFor="type">Select Type</label>
                                        <FormSelect
                                            id='type'
                                            value={type}
                                            onChange={(e) => setType(e.target.value)}
                                        >
                                            <option value="Success">Success</option>
                                            <option value="Info">Info</option>
                                        </FormSelect>
                                    </FormGroup>
                                        </Col>

                                    </Row>
                                 
                                    <FormGroup>
                                        <label htmlFor="feDescription">{t('desc')}</label>
                                        <FormTextarea
                                            value={descNotif}
                                            onChange={(e) => setDescriptionNotif(e.target.value)}
                                            placeholder={t('desc')}
                                            id="feDescription"
                                            rows="5" />

                                    </FormGroup>
                                    <FormGroup className='m-2 px-2 d-flex justify-content-center align-items-center'>
                                        <Button onClick={addNotif} outline theme="success" className="m-2">Save</Button>
                                        <Button outline theme="danger" className="m-2 ">Cancel</Button>
                                    </FormGroup>
                                      
                                </CardBody>
                            </Col>

                            <Col lg="4" md="12" sm="12" className='d-flex justify-content-around align-items-center flex-column' >
                                <div className="mb-3 mx-auto" style={{ height: "110px" }}>
                                    <img
                                        className="rounded-circle h-100"
                                        width="110"
                                        src={fieldImg}
                                    />
                                </div>
                                {/* <FormGroup className='d-flex justify-content-center align-items-center flex-column'>
                                    <label htmlFor="field">Select Field</label>
                                    <FormSelect
                                        id='field'
                                        value={field}
                                        onChange={(e) => setField(e.target.value)}
                                    >
                                        {
                                            fieldList.map(field => {
                                                return <option value={field.Uid}>{field.title}</option>

                                            })
                                        }

                                    </FormSelect>
                                </FormGroup> */}
                            </Col>
                        </Row>
                    </Card>
                </Carousel>
            </Container>
        </>
    )
}

export default Recommendations