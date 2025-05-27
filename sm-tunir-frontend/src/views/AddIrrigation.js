import React, { useEffect, useState } from "react";

import { useTranslation } from "react-i18next";
import { Container, Row, Col, Form, Card, Button } from 'react-bootstrap';
import PageTitle from '../components/common/PageTitle';
import swal from "sweetalert";
import api from '../api/api';
import PivotForm from "../components/FieldSettingForms/pivotForm";
import LateralForm from "../components/FieldSettingForms/lateralForm";
import DripForm from "../components/FieldSettingForms/dripForm";
import FarmSelect from "../components/FarmSelect";
import { useLocation } from "react-router";


export default function AddIrrigation() {
    const location = useLocation();


    const { zoneId, zoneName } = location.state || {};
    const [validated, setValidated] = useState(false);
    const [listIrrigations, setListIrrigations] = useState([])
    const [listCrop, setListCrop] = useState([])
    // const [zones, setZones] = useState([]);
    const [crops, setCrops] = useState([])
    // const [selectedZone, setSelectedZone] = useState(null)


    const [irrigData, setIrrigData] = useState({
        irrigType: "",
        zone_uid: zoneId ? zoneId : "",
        crop_uid: "",
        flowrate: "",
        irrigated_already: "",
        name: "",
        pivot_shape: "",
        irrigation_syst: "",
        pivot_length: "",
        pivot_coord: "",
        full_runtime: "",
        lateral: "",
        drippers: "",
        effIrrig: "",
        pumpFlow: "",
        pumpType: "",
        linesNumber: "",
        drippersSpacing: ""
    })
    const handleIrrigPick = (e) => {
        e.preventDefault();
        const irrigation = listIrrigations.find((irrigation) => {
            return irrigation.irrigation == e.target.value

        })
        setIrrigData({ irrigType: irrigation.irrigation })

        if (irrigation) {
            setIrrigData({
                ...irrigData,
                irrigType: irrigation.irrigation,
                effIrrig: irrigation.effIrrig
            });
        }
    };

    const { t } = useTranslation();



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

        getIrrigations()

        getCropType()
    }, [])
    useEffect(() => {
        const getZone = async () => {
            if (!irrigData.zone_uid) return;

            try {
                const response = await api.post('/zone', { zone_uid: irrigData.zone_uid });
                if (response && response.data?.zone?.field?.crops) {
                    setCrops(response.data.zone.field.crops);
                } else {
                    setCrops([]);
                }
            } catch (error) {
                console.error("Failed to fetch zone details:", error);
            }
        };

        getZone();
    }, [irrigData.zone_uid]);



    const irrigationMethodForm = () => {
        switch (irrigData.irrigType) {
            case `${t('Pivot')}`:
                return <PivotForm
                    handleFlowRate={(e) => setIrrigData({ ...irrigData, flowrate: e.target.value })}
                    handleIrrgSyst={(e) => setIrrigData({ ...irrigData, irrigation_syst: e.target.value })}
                    handleRunTime={(e) => setIrrigData({ ...irrigData, full_runtime: e.target.value })}
                    handlePivotCoord={(e) => setIrrigData({ ...irrigData, pivot_coord: e.target.value })}
                    handlePivotLength={(e) => setIrrigData({ ...irrigData, pivot_length: e.target.value })}
                    handlePivotShape={(e) => setIrrigData({ ...irrigData, pivot_shape: e.target.value })}
                    irrigation_syst={irrigData.irrigation_syst}
                    pivot_coord={irrigData.pivot_coord}
                    pivot_length={irrigData.pivot_length}
                    pivot_shape={irrigData.pivot_shape}
                    full_runtime={irrigData.full_runtime}
                    flowrate={irrigData.flowrate}
                    name={irrigData.name}
                />;
            case `${t('Lateral')}`:
                return <LateralForm
                    handleLateral={(e) => setIrrigData({ ...irrigData, lateral: e.target.value })}
                    handlePivotLength={(e) => setIrrigData({ ...irrigData, pivot_length: e.target.value })}
                    handleRunTime={(e) => setIrrigData({ ...irrigData, full_runtime: e.target.value })}
                    handleName={(e) => setIrrigData({ ...irrigData, name: e.target.value })}
                    handleFlowRate={(e) => setIrrigData({ ...irrigData, flowrate: e.target.value })}
                    full_runtime={irrigData.full_runtime}
                    flowrate={irrigData.flowrate}
                    name={irrigData.name}
                    pivot_length={irrigData.pivot_length}
                    lateral={irrigData.lateral}
                />;
            case `${t('None')}`:
                return null;
            default:
                return (
                    <DripForm
                        handleDrippers={(e) => setIrrigData({ ...irrigData, drippers: e.target.value })}
                        handleIrrigAlrd={(e) => setIrrigData({ ...irrigData, irrigated_already: e.target.value })}
                        handleFlowRate={(e) => setIrrigData({ ...irrigData, flowrate: e.target.value })}
                        handleDrippersSpacing={(e) => setIrrigData({ ...irrigData, drippersSpacing: e.target.value })}
                        flowrate={irrigData.flowrate}
                        drippers={irrigData.drippers}
                        irrigated_already={irrigData.irrigated_already}
                    />
                );
        }
    };

    const addIrrigation = () => {

        let data = {
            type: irrigData.irrigType,
            zone_uid: irrigData.zone_uid ? irrigData.zone_uid : zoneId,
            crop_uid: irrigData.crop_uid,
            flowrate: irrigData.flowrate,
            irrigated_already: irrigData.irrigated_already,
            name: irrigData.name,
            pivot_shape: irrigData.pivot_shape,
            irrigation_syst: irrigData.irrigation_syst,
            pivot_length: irrigData.pivot_length,
            pivot_coord: irrigData.pivot_coord,
            full_runtime: irrigData.full_runtime,
            lateral: irrigData.lateral,
            drippers: irrigData.drippers,
            effIrrig: irrigData.effIrrig,
            pumpFlow: irrigData.pumpFlow,
            pumpType: irrigData.pumpType,
            lines_number: irrigData.linesNumber,
            drippers_spacing: irrigData.drippersSpacing
        }
        console.log(data, "deyta");




        api.post('/irrigation/add-irrigation', data)
            .then(res => {

                if (res.data.type && res.data.type == "danger") {
                    swal(`Error`, {
                        icon: "error",
                    });
                }
                if (res.data.type && res.data.type == "success") {
                    setValidated(false);
                    setIrrigData({
                        irrigType: "",
                        zone_uid: zoneId ? zoneId : "",
                        crop_uid: "",
                        flowrate: "",
                        irrigated_already: "",
                        name: "",
                        pivot_shape: "",
                        irrigation_syst: "",
                        pivot_length: "",
                        pivot_coord: "",
                        full_runtime: "",
                        lateral: "",
                        drippers: "",
                        effIrrig: "",
                        pumpFlow: "",
                        pumpType: "",
                        linesNumber: "",
                        drippersSpacing: ""
                    });
                    swal(`${t('irrigation_added')}`, {
                        icon: "success",
                    });

                }
            })
            .catch((err) => {

                swal(`Error`, {
                    icon: "error",
                });

            });
    }
    // useEffect(() => {
    //     const getDataFields = async () => {
    //         await api.get('/field/fields').then(res => {
    //             const newData = res.data.farms;
    //             // setFarms(newData);
    //             let Fields = [];
    //             let Zones = [];
    //             let Crops = []
    //             newData.map(item => {
    //                 let fields = item.fields
    //                 if (fields) {
    //                     fields.map(itemfield => {
    //                         Fields.push({
    //                             title: itemfield.name,
    //                             status: itemfield.status,
    //                             description: itemfield.description,
    //                             Uid: itemfield.uid,
    //                             farm_id: itemfield.farm_id,
    //                             Latitude: itemfield.Latitude,
    //                             Longitude: itemfield.Longitude,
    //                             Id: itemfield.id
    //                         });
    //                         let zones = itemfield.zones;
    //                         let crops = itemfield.crops
    //                         if (crops) {
    //                             crops.map(crop => {
    //                                 Crops.push({
    //                                     type: crop.type,
    //                                     id: crop.id,
    //                                     Uid: crop.uid,
    //                                     fieldId: crop.field_id,
    //                                     zone_id: crop.zone_id,
    //                                     croptype_id: crop.croptype_id,
    //                                     croptype: crop.croptypes
    //                                 })
    //                             })
    //                         }
    //                         if (zones) {
    //                             zones.map(i => {
    //                                 Zones.push({
    //                                     Id: i.id,
    //                                     name: i.name,
    //                                     Uid: i.uid,
    //                                     source: i.source,
    //                                     description: i.description,
    //                                     field_id: i.field_id

    //                                 });
    //                             });
    //                         };
    //                     })
    //                 }
    //             });
    //             // setFields(Fields)
    //             setZones(Zones)
    //             // setCrops(Crops)

    //         })
    //     }
    //     getDataFields()
    // }, [])
    const handleSubmit = async (event) => {
        event.preventDefault()
        const form = event.currentTarget;
        if (form.checkValidity() === false) {

            event.stopPropagation();
            setValidated(true);

        } else {
            await addIrrigation();
            setValidated(false);
            form.reset();

        }

        setValidated(true);
    };

    return (
        <Container className="p-md-5 p-3">
            <Row className='pb-2'>
                <PageTitle subtitle={`${t('Irrigation_info')}`} className="mb-1" />
                <Card className="bg-light border-0 rounded shadow-sm ">
                    <Card.Body>
                        <p style={{ fontSize: '16px', lineHeight: '1.5', margin: '0' }}>
                            To add your irrigation type configuration, please provide the appropriate details and associate it with the appropriate crop type and soil type. This will help us to provide personalized recommendations for managing your crops and optimizing water usage.
                        </p>


                    </Card.Body>
                    <Form noValidate validated={validated} onSubmit={handleSubmit} className="p-md-5 p-3">
                        <Row className="mb-3 gap-3 justify-content-between">
                            <Form.Group as={Col} md="4" controlId="validationCustom01">
                                <Form.Label>{t('irrigation_zone')} *</Form.Label>
                                {/* <Form.Select
                                    value={irrigData.zone_uid}
                                    onChange={e => setIrrigData({ ...irrigData, zone_uid: e.target.value })}
                                    

                                >
                                    <option>{t('select_zone')}</option>

                                    {
                                        zones.map((item, indx) => {
                                            return <option value={item.Uid}>{item.name}</option>
                                        })
                                    }
                                </Form.Select> */}
                                <FarmSelect defaultval={{ value: zoneId, label: zoneName }} userUid="477" url='/zone/search-all-zones' onChange={selected => setIrrigData({ ...irrigData, zone_uid: selected?.value || '' })} placeholder={"Search zones..."} />

                                <Form.Control.Feedback type="invalid">
                                    Please provide the irrigation zone.
                                </Form.Control.Feedback>
                                <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} md="3" controlId="validationCustom02">
                                <Form.Label>{t('irrigation_crop')} *</Form.Label>
                                <Form.Select
                                    value={irrigData.crop_uid}
                                    onChange={e => setIrrigData({ ...irrigData, crop_uid: e.target.value })}
                                    required
                                >
                                    {console.log(crops, "cropsss")}

                                    <option value="">{t('select_crop')}</option>


                                    {

                                        crops.map(crop => {


                                            let cropType = ""
                                            listCrop.map(croptype => {
                                                if (croptype.id === crop.croptype_id) {
                                                    cropType = croptype.crop
                                                }
                                            })
                                            return <option value={crop.uid} >{cropType}</option>

                                        })
                                    }
                                </Form.Select>

                                <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                                <Form.Control.Feedback type="invalid">
                                    Please select the crop.
                                </Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} md="4" controlId="validationCustomUsername">
                                <Form.Label>{t('Irrigation_system_type')} *</Form.Label>


                                <Form.Select
                                    // className={props.typeErrorIrrig == '' ? '' : 'is-invalid'}
                                    value={irrigData.irrigType}
                                    onChange={evt => {
                                        handleIrrigPick(evt)
                                    }}
                                    required

                                >
                                    <option disabled selected value="">{t('select_irriagtion')}</option>
                                    {
                                        listIrrigations.map(item => {
                                            // if (item.value === irrigationMethod) {
                                            //   return <option value={item.value} selected={true}>{item.type}</option>;
                                            // } else {
                                            //   return <option value={item.value} selected={false}>{item.type}</option>;
                                            // }
                                            return <option value={item.irrigation} >{t(`${item.irrigation}`)}</option>;
                                        })
                                    }
                                </Form.Select>
                                <Form.Control.Feedback type="invalid">
                                    Please select the irrigation system type.
                                </Form.Control.Feedback>

                            </Form.Group>
                        </Row>
                        <Row className="mb-3 gap-3 justify-content-between">
                            <Form.Group as={Col} md="4" controlId="validationCustom03" className="mt-2">
                                <Form.Label>{t('efficience_irrigation')} (%) </Form.Label>
                                <Form.Control type="number" value={irrigData.effIrrig} onChange={e => setIrrigData({ ...irrigData, effIrrig: e.target.value })} placeholder={t('efficience_irrigation')}


                                />
                                <Form.Control.Feedback type="invalid">
                                    Please provide the efficience irrigation .
                                </Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} md="3" controlId="validationCustom03" className="mt-3">
                                <Form.Label className="m-0">{t('type_reseau')} *</Form.Label>
                                <Form.Control onBeforeInput={(e) => {
                                    if (/\d/.test(e.data)) {
                                        e.preventDefault();
                                    } // juste letters
                                }} required value={irrigData.pumpType} onChange={e => setIrrigData({ ...irrigData, pumpType: e.target.value })} placeholder={t('type_reseau')}
                                />
                                <Form.Control.Feedback type="invalid">
                                    Please provide reseau type.
                                </Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} md="4" controlId="validationCustom03" className="mt-2">
                                <Form.Label>{t('debit_reseau')} (l/s) *</Form.Label>
                                <Form.Control type="number" required value={irrigData.pumpFlow} onChange={e => setIrrigData({ ...irrigData, pumpFlow: e.target.value })} placeholder={t('debit_reseau')}
                                />
                                <Form.Control.Feedback type="invalid">
                                    Please provide the debit of the reseau .
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Row>
                        <Row className="mb-3 gap-5 justify-content-between">

                            <Form.Group as={Col} md="6" controlId="validationCustom03" className="mt-3">
                                <Form.Label className="m-0">{t('nbr_ligne')} *</Form.Label>
                                <Form.Control required type='number' value={irrigData.linesNumber} onChange={e => setIrrigData({ ...irrigData, linesNumber: e.target.value })} placeholder={t('nbr_ligne')}
                                />
                                <Form.Control.Feedback type="invalid">
                                    Please provide reseau type.
                                </Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} md="5" controlId="validationCustom03" className="mt-3">
                                <Form.Label className="m-0">{t('irrigated_already')}(h)</Form.Label>
                                <Form.Control type="number" value={irrigData.irrigated_already} onChange={e => setIrrigData({ ...irrigData, irrigated_already: e.target.value })} placeholder={t('irrigated_already')}
                                />
                                <Form.Control.Feedback type="invalid">
                                    Please provide irrigated_already.
                                </Form.Control.Feedback>
                            </Form.Group>

                        </Row>
                        <Row className="mb-3 gap-5 justify-content-between mr-5">

                            {irrigationMethodForm()}
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
