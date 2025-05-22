import React, { useEffect, useState } from "react";


import { Container, Row, Col, Card, Dropdown, Form } from 'react-bootstrap';
// import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';

import PageTitle from "../components/common/PageTitle";
import { useTranslation } from "react-i18next";
import CompositeSoil from "../components/FieldSettingForms/compositeSoilForm";
import api from '../api/api';
import FarmSelect from "../components/FarmSelect";
import swal from "sweetalert";
import { useLocation, useNavigate } from "react-router";




export default function SoilInfo() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();


    const { fieldId, fieldName } = location.state || {};
    const [validated, setValidated] = useState(false);
    const [isStandardSoil, setSoilType] = useState(true);
    const [listSoils, setListSoil] = useState([])
    const [fields, setFields] = useState([])
    const [farms, setFarms] = useState([]);

    const [soilParams, setSoilParams] = useState({
        soilProperty: "",
        soilType: "",
        field_uid: fieldId ? fieldId : "",
        zone_uid: "",
        name: "",
        RUmax: "",
        effPluie: "",
    })



    const addZone = () => {

        let data = {
            soilProperty: soilParams.soilProperty,
            field_uid: soilParams.field_uid ? soilParams.field_uid : fieldId,
            zone_uid: soilParams.zone_uid,
            name: soilParams.name,
            RUmax: soilParams.RUmax,
            effPluie: soilParams.effPluie,
            soiltype_id:soilParams.soilType
        }
        console.log(data,"data");
        
        api.post('/zone/add-zone', data)
            .then(res => {
                if (res.data.type && res.data.type == "danger") {

                    swal({
                        title: 'Cannot add soil',
                        icon: "error",

                    });
                }
                if (res.data.type && res.data.type == "success") {
                    setValidated(false);

                    // swal({
                    //     title: 'Soil added',
                    //     icon: "success",
                    //     text: 'Soil added successfully '

                    // });
                    swal({
                        title: "Soil added",
                        text: "Would you like to continue to create a crop ?",
                        icon: "success",
                        buttons: {
                            cancel: "No",
                            confirm: {
                                text: "Yes",
                                value: true,
                            }
                        }
                    }).then((willContinue) => {
                        if (willContinue) {

                            const zoneId = res.data.zone.uid;
                            const zoneName = res.data.zone.name;
                            console.log(zoneName, "zn");

                            navigate('/add-crop-info', { state: { fieldId, fieldName, zoneId, zoneName } });
                        }
                    });
                    setSoilParams({
                        soilProperty: "",
                        soilType: "",
                        field_uid: fieldId ? fieldId : "",
                        zone_uid: "",
                        name: "",
                        RUmax: "",
                        effPluie: "",
                    })
                }
                // getDataFields()

            })
            .catch((err) => {

                console.log(err)

            });
    }


    const handleSubmit = async (event) => {
        event.preventDefault()
        const form = event.currentTarget;
        if (form.checkValidity() === false) {

            event.stopPropagation();
            setValidated(true);

        } else {
             await addZone();
             setValidated(false);
             form.reset();
            console.log(soilParams,"sp");
            
        }

        setValidated(true);
    };
    const handleSoilPick = (e) => {
        e.preventDefault()
        const selectedSoil = listSoils.find(
            (soil) => soil.soil == e.target.value
        );
        console.log(selectedSoil,"selected soil");
        
        if (selectedSoil) {
          setSoilParams((prevState) => ({
            ...prevState,
            soilType: selectedSoil.id,
            RUmax: selectedSoil.ru,
            effPluie: selectedSoil.rain_eff,
        }));

        }
       
    };
    const soilTypeForm = () => {
        if (isStandardSoil == true)
            return (
                null

            );
        else {
            return (
                <CompositeSoil />
            );
        }
    };
    const getSoils = async () => {
        try {
            await api.get('/soils/get-soils')
                .then(response => {
                    let listSoils = response.data.Soils
                    setListSoil(listSoils)

                }).catch(error => {
                    console.log(error)
                })

        } catch (error) {
            console.log(error)
        }
    }
    useEffect(() => {

        getSoils()
    }, [])
    return (
        <Container className="p-md-5 p-3">
            <Row className='pb-2'>
                <PageTitle subtitle={`${t('soil_info')}`} className="mb-1" />
                <Card className="bg-light border-0 rounded shadow-sm ">
                    <Card.Body>
                        <p style={{ fontSize: '16px', lineHeight: '1.5', margin: '0' }}>
                            "To add your soil type configuration, please provide the appropriate details and associate it with the appropriate field. This will help us to provide accurate recommendations for managing your crops."
                        </p>


                    </Card.Body>
                    <Form noValidate validated={validated} onSubmit={handleSubmit} className="p-md-5 p-3">
                        <Row className="mb-3 gap-3 justify-content-between">
                            <Form.Group as={Col} md="6" controlId="validationCustom03" className="mt-2">
                                <Form.Label>{t('name_field')} *</Form.Label>
                                {/* <Form.Select
                                    value={soilParams.field_uid}
                                    onChange={e => setSoilParams({ ...soilParams, field_uid: e.target.value })}
                                    placeholder={t('name_field')}


                                >
                                    <option value="">{t('select_field')}</option>
                                    {fields.map((item, index) => {
                                        return <option value={item.Uid}>{item.title}</option>;
                                    })}
                                </Form.Select> */}
                                <FarmSelect defaultval={{ value: fieldId, label: fieldName }} url='/field/search-all-fields' placeholder={"Search fields..."} onChange={selected => setSoilParams({ ...soilParams, field_uid: selected?.value || '' })} />

                                <Form.Control.Feedback type="invalid">
                                    Please select a field.
                                </Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} md="5" controlId="validationCustom01">
                                <Form.Label>{t('soil_zone')} *</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={soilParams.name}
                                    placeholder={t('soil_zone')}
                                    required
                                    onChange={e => setSoilParams({ ...soilParams, name: e.target.value })}


                                />
                                <Form.Control.Feedback type="invalid">
                                    Please provide a soil zone.
                                </Form.Control.Feedback>
                                <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                            </Form.Group>

                        </Row>
                        <Row className="mb-3 gap-3 justify-content-between">

                            <Form.Group as={Col} md="6" controlId="validationCustom02">
                                <Form.Label>{t('soil_type')}</Form.Label>
                                <Form.Select
                                    value={soilParams.soilType}
                                    onChange={handleSoilPick}

                                >
                                    <option value="">{t('select_soil')}</option>
                                    {
                                        listSoils.map((item, index) => {
                                            return <option value={item.soil} >{item.soil}</option>;

                                        })
                                    }
                                </Form.Select>
                                <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                                <Form.Control.Feedback type="invalid">
                                    Please select soil type.
                                </Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} md="5" controlId="validationCustomUsername">
                                <Form.Label>{t('soil_prop')} *</Form.Label>


                                <Form.Select
                                    onChange={evt => {

                                        setSoilType(!isStandardSoil);

                                    }}


                                >
                                    <option selected={isStandardSoil}>Standard</option>
                                    <option selected={!isStandardSoil}>Composite</option>
                                </Form.Select>
                                <Form.Control.Feedback type="invalid">
                                    Please choose a soil prop.
                                </Form.Control.Feedback>

                            </Form.Group>
                        </Row>

                        <Row form>
                            {soilTypeForm()}
                        </Row>
                        <Row className="mb-3 gap-3 justify-content-between">
                            <Form.Group as={Col} md="6" controlId="validationCustom03" className="mt-2">

                                <Form.Label>{t('efficacité_pluie')} (%) *</Form.Label>
                                <Form.Control
                                    type="number" value={soilParams.effPluie} onChange={e => setSoilParams({ ...soilParams, effPluie: e.target.value })} placeholder={t('efficacité_pluie')}
                                    required

                                />

                                <Form.Control.Feedback type="invalid">
                                    Please provide Rain Efficiency (%) .
                                </Form.Control.Feedback>



                            </Form.Group>
                            <Form.Group as={Col} md="5" controlId="validationCustom03" className="mt-2">

                                <Form.Label>RU max (mm/m) *</Form.Label>
                                <Form.Control
                                    type="number" value={soilParams.RUmax} onChange={e => setSoilParams({ ...soilParams, RUmax: e.target.value })} placeholder="RU max"
                                    required

                                />


                                <Form.Control.Feedback type="invalid">
                                    Please provide RU max .
                                </Form.Control.Feedback>


                            </Form.Group>
                        </Row>
                        <div className="d-flex justify-content-end">

                            <Button type="submit mt-4">Submit form</Button>
                        </div>
                    </Form>
                </Card>
            </Row>


        </Container>
    )
}
