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




export default function SoilInfo() {
    const { t } = useTranslation();
    const [validated, setValidated] = useState(false);
    const [isStandardSoil, setSoilType] = useState(true);
    const [listSoils, setListSoil] = useState([])
    const [fields, setFields] = useState([])
    const [farms, setFarms] = useState([]);

    const [soilParams, setSoilParams] = useState({
        soilProperty: "",
        soilType: "",
        field_uid: "",
        zone_uid: "",
        name: "",
        RUmax: "",
        effPluie: "",
    })

 const addZone = () => {

    let data = {
      soilProperty: soilParams.soilProperty,
      field_uid: soilParams.field_uid,
      zone_uid: soilParams.zone_uid,
      name: soilParams.name,
      RUmax: soilParams.RUmax,
      effPluie: soilParams.effPluie,
    }
    api.post('/zone/add-zone', data)
      .then(res => {
        if (res.data.type && res.data.type == "danger") {
          swal({
            title: 'Cannot add soil',
            icon: "error",

          });
        }
        if (res.data.type && res.data.type == "success") {
          swal({
            title: 'Soil added',
            icon: "success",
            text: 'Soil added successfully '

          });
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
        } else {
            await addZone();
        }

        setValidated(true);
    };
    const handleSoilPick = (e) => {
        e.preventDefault()
        const soilType = listSoils.find(
            (soil) => soil.soil == e.target.value
        );
        if (e.target.value !== "") {
            setSoilParams({ effPluie: soilType.rain_eff })
            setSoilParams({ RUmax: soilType.ru })

        }
        if (typeof soilType !== "undefined") {
            setSoilParams({
                ...soilParams,
                soilType: soilType.soil,
                RUmax: soilType.ru,
                effPluie: soilType.rain_eff
            });

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
                                <FarmSelect url='/field/search-all-fields' placeholder={"Search fields..."} onChange={selected => setSoilParams({ ...soilParams, field_uid: selected?.value || '' })} />

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
                                    type="number" value={soilParams.effPluie} onChange={e => setSoilParams({ ...soilParams, effPluie: e.target.value })}  placeholder={t('efficacité_pluie')}
                                    required

                                />

                                <Form.Control.Feedback type="invalid">
                                    Please provide Rain Efficiency (%) .
                                </Form.Control.Feedback>



                            </Form.Group>
                            <Form.Group as={Col} md="5" controlId="validationCustom03" className="mt-2">

                                <Form.Label>RU max (mm/m) *</Form.Label>
                                <Form.Control
                                    type="number" value={soilParams.RUmax} onChange={e => setSoilParams({ ...soilParams, RUmax: e.target.value })}  placeholder="RU max"
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
