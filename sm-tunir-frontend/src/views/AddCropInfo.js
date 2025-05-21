import React, { useEffect, useState } from "react";

import { useTranslation } from "react-i18next";
import { Container, Row, Col, Form, Card, InputGroup, Button } from 'react-bootstrap';
import PageTitle from '../components/common/PageTitle';
import swal from "sweetalert";
import api from '../api/api';
import FarmSelect from "../components/FarmSelect";
import { useLocation, useNavigate } from "react-router";

export default function AddCropInfo() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();


    const { fieldId, fieldName, zoneId, zoneName } = location.state || {};
    console.log(zoneId, zoneName);

    const [validated, setValidated] = useState(false);
    const [listCrop, setListCrop] = useState([])
    const [allVarieties, setAllVarieties] = useState([])
    const [listIrrigations, setListIrrigations] = useState([])
    const [listSoil, setListSoil] = useState([])
    const [checked, setChecked] = useState(false)
    const [zones, setZones] = useState([]);
    // const [selectedField, setSelectedField] = useState(null);
    const [fields, setFields] = useState([])

    const [cropData, setCropData] = useState({
        field_uid: fieldId ? fieldId : "",
        zone_uid: zoneId ? zoneId : "",
        cropType: "",
        variety: '',
        cropVariety: [],
        Profondeur: "",
        days: "",
        plantingDate: "",
        growingDate: "",
        rootDepth: "",
        ecartInter: "",
        ecartIntra: "",
        density: "",
        ruPratique: "",
        kcList: [],
        surface: ""
    })
    useEffect(() => {
        const getCropType = async () => {
            try {
                await api.get('/croptype/list-crop')
                    .then(response => {
                        if (response) {
                            let dataCrop = response.data.Croptype
                            setListCrop(dataCrop)
                        }
                    })

            } catch (error) {
                console.log(error)
            }
        }
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
        const getIrrigations = async () => {
            try {
                await api.get('/irrigations/get-irrigations')
                    .then(response => {
                        if (response) {
                            let dataIrrig = response.data.Irrigations
                            setListIrrigations(dataIrrig)
                        }
                    })

            } catch (error) {
                console.log(error)
            }
        }
        const getVarieties = async () => {
            try {
                await api.get('/varieties/get-varieties')
                    .then(response => {
                        if (response.data.type === "success") {
                            let listVarieties = response.data.Varieties
                            setAllVarieties(listVarieties)

                        }
                    }).catch(error => {
                        console.log(error)
                    })

            } catch (error) {
                console.log(error)
            }
        }
        getVarieties()
        getIrrigations()
        getSoils()
        getCropType()
    }, [])

    useEffect(() => {
        const getDataFields = async () => {
            if (cropData.field_uid) {
                await api.post('/field', { field_uid: cropData.field_uid }).then(res => {

                    console.log(res.data.field.zones, "--------------res");
                    setZones(res.data.field.zones)
                    // setCrops(Crops)

                })
            }

        }
        getDataFields()
    }, [cropData.field_uid])
    const handleVarietyPick = (e) => {
        e.preventDefault();
        const variety = allVarieties.find(

            (variety) => variety.id == e.target.value

        )

        if (variety) {
            setCropData({
                ...cropData,
                variety: variety.id,

            });
        }
    };
    const handleCropPick = (e) => {
        e.preventDefault()
        // props.handleCropType(e)

        const crop = listCrop.find(
            (crop) => crop.id == e.target.value
        );
        if (e.target.value !== '') {
            setCropData(prev => ({
                ...prev,
                cropType: crop.id,
                ruPratique: crop.practical_fraction,
                days: crop.total,
                rootDepth: crop.root_max,
                plantingDate: crop.plant_date.slice(0, 11).replace('T', ''),
            }));

        }
        let varieties = []
        if (crop) {
            const variety = allVarieties.map((variety) => {
                if (variety.crop_id === crop.id) {
                    varieties.push({
                        varietyId: variety.id,
                        variety: variety.crop_variety
                    })
                }
            });

            setCropData({
                ...cropData,
                cropType: crop.id,
                variety: crop.crop_variety,
                cropVariety: varieties,
                rootDepth: crop.root_max,
                ruPratique: crop.practical_fraction,
                days: crop.total,
                plantingDate: crop.plant_date.slice(0, 11).replace('T', ''),
                kcList: crop.all_kc
            });


        }
    };

    const addCrop = () => {

        let data = {
            zone_uid: cropData.zone_uid ? cropData.zone_uid : zoneId,
            field_uid: cropData.field_uid ? cropData.field_uid : fieldId,
            croptype_id: cropData.cropType,
            previous_type: cropData.previous_type,
            plantingDate: cropData.plantingDate,
            rootDepth: cropData.rootDepth,
            days: cropData.days,
            crop_variety_id: cropData.variety,
            practical_fraction: cropData.ruPratique,
            density: cropData.density,
            ecart_inter: cropData.ecartInter,
            ecart_intra: cropData.ecartIntra,
            surface: cropData.surface,
            growingDate: cropData.growingDate,

        }

        api.post('/crop/add-crop', data)
            .then(res => {
                if (res.data.type && res.data.type == "danger") {
                    swal(`Error`, {
                        icon: "error",
                    });
                }
                if (res.data.type && res.data.type == "success") {
                    // swal(`${t('crop_added')}`, {
                    //     icon: "success",
                    // });
                    setValidated(false);
                    console.log(res.data);

                    swal({
                        title: `${t('crop_added')}`,
                        text: "Would you like to continue to create an irrigation type ?",
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


                            navigate('/add-irrigation', { state: { fieldId, fieldName, zoneId, zoneName } });
                        }
                    })

                }
            })
            .catch((err) => {
                swal(`Error`, {
                    icon: "error",
                });


            });
    }
    const handleSubmit = async (event) => {
        event.preventDefault()
        const form = event.currentTarget;
        if (form.checkValidity() === false) {

            event.stopPropagation();
            setValidated(true);

        } else {
            await addCrop();
            setValidated(false);
            form.reset();

        }

        setValidated(true);
    };

    console.log("zone_uid from API:", zones);

    return (
        <Container className="p-md-5 p-3">
            <Row className='pb-2'>
                <PageTitle subtitle={`${t('crop_info')}`} className="mb-1" />
                <Card className="bg-light border-0 rounded shadow-sm ">
                    <Card.Body>
                        <p style={{ fontSize: '16px', lineHeight: '1.5', margin: '0' }}>
                            To add your crop type configuration, please provide the appropriate details and associate it with the appropriate field and soil type. This will help us to provide personalized recommendations for managing your crops and achieving optimal yields.
                        </p>


                    </Card.Body>
                    <Form noValidate validated={validated} onSubmit={handleSubmit} className="p-md-5 p-3">
                        <Row className="mb-3 gap-3 justify-content-between">
                            <Form.Group as={Col} md="4" controlId="validationCustom01">
                                <Form.Label>{t('crop_type')} *</Form.Label>
                                <Form.Select
                                    onChange={handleCropPick}
                                    placeholder={t('crop_type')}
                                    value={cropData.cropType}


                                >
                                    <option value="">Select Crop</option>
                                    {
                                        listCrop.map(crop => {
                                            return (
                                                <option value={crop.id}>{crop.crop}</option>

                                            )
                                        })
                                    }
                                </Form.Select>
                                <Form.Control.Feedback type="invalid">
                                    Please select a crop type.
                                </Form.Control.Feedback>
                                <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} md="3" controlId="validationCustom02">
                                <Form.Label>{t('crop_variety')}</Form.Label>
                                <Form.Select value={cropData.variety} onChange={handleVarietyPick} >
                                    <option value="">{t('crop_variety')}</option>
                                    {
                                        cropData.cropVariety.map(variety => (
                                            <option value={variety.varietyId}>{variety.variety}</option>
                                        ))
                                    }
                                </Form.Select>
                                <input type="checkbox" name="Autre" id="check" onClick={() => setChecked(!checked)} /> {t('other')}
                                {
                                    checked
                                        ?

                                        <Form.Control

                                            value={cropData.variety || ""}
                                            placeholder={t('crop_variety')}
                                            id="cropVariety"
                                            onChange={e => setCropData({ ...cropData, variety: e.target.value })}
                                        />

                                        :
                                        null
                                }

                                <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                                <Form.Control.Feedback type="invalid">
                                    Please select the crop variety.
                                </Form.Control.Feedback>
                            </Form.Group>


                            <Form.Group as={Col} md="4" controlId="validationCustom03" className="mt-2">
                                <Form.Label>{t('crop_field')} *</Form.Label>
                                {/* <Form.Select
                                    value={cropData.field_uid}
                                    onChange={e => setCropData({ ...cropData, field_uid: e.target.value })}
                                    placeholder={t('crop_zone')}


                                >
                                    <option>{t('select_field')}</option>
                                    {
                                        fields.map((item, indx) => {
                                            return <option value={item.Uid}>{item.title}</option>
                                        })
                                    }
                                </Form.Select> */}
                                <FarmSelect defaultval={{ value: fieldId, label: fieldName }} url='/field/search-all-fields' onChange={selected => setCropData({ ...cropData, field_uid: selected?.value || '' })} placeholder={"Search fields..."} />

                                <Form.Control.Feedback type="invalid">
                                    Please select the crop field.
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Row>
                        <Row className="mb-3 gap-3 justify-content-between">
                            <Form.Group as={Col} md="4" controlId="validationCustomUsername">
                                <Form.Label>{t('crop_zone')} *</Form.Label>
                                <Form.Select
                                    value={cropData.zone_uid}
                                    onChange={e => setCropData({ ...cropData, zone_uid: e.target.value })}
                                    placeholder={t('crop_zone')}


                                >
                                    <option>{t('select_zone')}</option>


                                    {
                                        zones.map(zone => {
                                            console.log(zone.uid, "zone.Uid");

                                            return <option value={zone.uid}>{zone.name}</option>

                                        })
                                    }

                                </Form.Select>

                                <Form.Control.Feedback type="invalid">
                                    Please choose the crop zone.
                                </Form.Control.Feedback>

                            </Form.Group>
                            <Form.Group as={Col} md="3" controlId="validationCustom03" className="mt-3">
                                <Form.Label className="m-0">{t('surface')} (m²)</Form.Label>
                                <Form.Control type="number" value={cropData.surface} onChange={e => setCropData({ ...cropData, surface: e.target.value })} placeholder={t('surface')}
                                />
                                <Form.Control.Feedback type="invalid">
                                    Please provide the surface .
                                </Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} md="4" controlId="validationCustom04" className="mt-2">
                                <Form.Label>{t('depth')} (m) *</Form.Label>
                                <Form.Control type="number" value={cropData.rootDepth} onChange={e => setCropData({ ...cropData, rootDepth: e.target.value })} placeholder={t('depth')}


                                />
                                <Form.Control.Feedback type="invalid">
                                    Please provide the depth.
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Row>
                        <Row className="mb-3 gap-3 justify-content-between">

                            <Form.Group as={Col} md="4" controlId="validationCustom03" className="mt-3">
                                <Form.Label className="m-0">{t('Days')} *</Form.Label>
                                <Form.Control type="number" value={cropData.days} onChange={e => setCropData({ ...cropData, days: e.target.value })} placeholder={t('Days')} />

                                <Form.Control.Feedback type="invalid">
                                    Please provide the days .
                                </Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} md="3" controlId="validationCustom05" className="mt-2">
                                <Form.Label>{t('planting_date')} *</Form.Label>
                                <Form.Control type="date" value={cropData.growingDate} onChange={e => setCropData({ ...cropData, growingDate: e.target.value })} />

                                <Form.Control.Feedback type="invalid">
                                    Please provide the plantingDate.
                                </Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} md="4" controlId="validationCustom06" className="mt-3">
                                <Form.Label className="m-0">{t('growing_season')}</Form.Label>
                                <Form.Control type="date" value={cropData.plantingDate} onChange={e => setCropData({ ...cropData, plantingDate: e.target.value })} id='days' />


                                <Form.Control.Feedback type="invalid">
                                    Please provide the growing season .
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Row>

                        <Row className="mb-3 gap-3 justify-content-between">
                            <Form.Group as={Col} md="4" controlId="validationCustom05" className="mt-2">
                                <Form.Label>{t('fraction_pratique')} (%) *</Form.Label>
                                <Form.Control type="number" value={cropData.ruPratique} onChange={e => setCropData({ ...cropData, ruPratique: e.target.value })} placeholder={t('fraction_pratique')}


                                />
                                <Form.Control.Feedback type="invalid">
                                    Please provide the fraction pratique.
                                </Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} md="3" controlId="validationCustom06" className="mt-3">
                                <Form.Label className="m-0">{t('ecart_inter')} (m)</Form.Label>
                                <Form.Control type="number" value={cropData.ecartInter} onChange={e => setCropData({ ...cropData, ecartInter: e.target.value })} placeholder={t('ecart_inter')}
                                />


                                <Form.Control.Feedback type="invalid">
                                    Please provide the ecartInter .
                                </Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} md="4" controlId="validationCustom05" className="mt-2">
                                <Form.Label>{t('ecart_intra')} (m)</Form.Label>
                                <Form.Control type="number" value={cropData.ecartIntra} onChange={e => setCropData({ ...cropData, ecartIntra: e.target.value })} placeholder={t('ecart_intra')}
                                />
                                <Form.Control.Feedback type="invalid">
                                    Please provide the fraction pratique.
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Row>
                        <Row className="mb-3 gap-3 justify-content-between">

                            <Form.Group as={Col} md="4" controlId="validationCustom06" className="mt-3">
                                <Form.Label className="m-0">{t('densité')} (plants/ha)</Form.Label>
                                <Form.Control type="number" value={cropData.density} onChange={e => setCropData({ ...cropData, density: e.target.value })} placeholder={t('densité')}
                                />


                                <Form.Control.Feedback type="invalid">
                                    Please provide the density .
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
