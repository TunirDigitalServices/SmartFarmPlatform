import React, { useEffect, useState } from "react";

import { useTranslation } from "react-i18next";
import { Container, Row, Col, Form, Card, InputGroup, Button } from 'react-bootstrap';

import PageTitle from '../components/common/PageTitle';
import swal from "sweetalert";
import api from '../api/api';
import EditableMap from "./EditableMap";
import FarmSelect from "../components/FarmSelect";
import { useLocation, useNavigate } from "react-router";

export default function AddFarmField() {
    const { t } = useTranslation();
    const location = useLocation();
    const navigate = useNavigate();

    const { farmId, farmName } = location.state || {};
    const [validated, setValidated] = useState(false);
    const [layerFarm, setLayerFarm] = useState([])

    const [dataField, setDataField] = useState({
        name: "",
        farm_uid: farmId ? farmId : "",
        width: "",
        length: "",
        Latitude: "",
        Longitude: ""
    })
    const [layer, setLayer] = useState('')
    const [farms, setFarms] = useState([]);
    const [crops, setCrops] = useState([])
    const [fieldStats, setFS] = useState([])

    const [coords, setCoords] = useState({
        Latitude: "",
        Longitude: "",
        zoom: "",
        center: [],
        fromAction: false
    })
    const [userMapDetails, setUserMapDetails] = useState("#")

    const [fields, setFields] = useState([])
    const [zones, setZones] = useState([]);

    const [sensorStats, setSensorStats] = useState([])

    console.log(farmId, "farmId");


    const getLayerFarm = async () => {
        await api.get('/farm/farms').then(res => {
            const DataFarm = res.data.farms;
            setLayerFarm(DataFarm);
        })
    }

    console.log(dataField, "dataFieldd");

    const addField = () => {

        let data = {
            name: dataField.name,
            farmName: dataField.farmName,
            farm_uid: dataField.farm_uid ? dataField.farm_uid : farmId,
            largeur: dataField.width,
            longueur: dataField.length,
            coordinates: layer,
            Latitude: parseFloat(coords.Latitude).toFixed(4),
            Longitude: parseFloat(coords.Longitude).toFixed(4)
        }

        api.post('/field/add-field', data)
            .then(res => {

                if (res.data.type && res.data.type == "success") {
                    // swal(`${t('field_added')}`, {
                    //     icon: "success",
                    // });
                    setValidated(false);
                    swal({
                        title: `${t('field_added')}`,
                        text: "Would you like to continue to create a zone (soil info ) ?",
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
                            const fieldId = res.data.field.uid;
                            const fieldName = res.data.field.name;

                            navigate('/add-soil-info', { state: { fieldId, fieldName } });
                        }else {
                        navigate('/AddField');
                    }
                    });

                    getDataFields()
                    // setSteps(steps + 1)
                    setDataField({
                        name: "",
                        farm_uid: "",
                        width: "",
                        length: "",
                        Latitude: "",
                        Longitude: ""
                    })
                }

            })
            .catch(() => {
                swal(`Error`, {
                    icon: "error",
                });

            });
    }

    useEffect(() => {
        // getLastDataSensor()
        getLayerFarm()
        getFieldStats();
        getSensorsStats();
        // fetchDataCrops()
    }, [])

    const getDataFields = async () => {
        await api.get('/field/fields').then(res => {
            const newData = res.data.farms;
            setFarms(newData);
            let Fields = [];
            let Zones = [];
            let Crops = []
            newData.map(item => {
                let fields = item.fields
                if (fields) {
                    fields.map(itemfield => {
                        Fields.push({
                            title: itemfield.name,
                            status: itemfield.status,
                            description: itemfield.description,
                            Uid: itemfield.uid,
                            farm_id: itemfield.farm_id,
                            Latitude: itemfield.Latitude,
                            Longitude: itemfield.Longitude,
                            Id: itemfield.id
                        });
                        let zones = itemfield.zones;
                        let crops = itemfield.crops
                        if (crops) {
                            crops.map(crop => {
                                Crops.push({
                                    type: crop.type,
                                    id: crop.id,
                                    Uid: crop.uid,
                                    fieldId: crop.field_id,
                                    zone_id: crop.zone_id,
                                    croptype_id: crop.croptype_id,
                                    croptype: crop.croptypes
                                })
                            })
                        }
                        if (zones) {
                            zones.map(i => {
                                Zones.push({
                                    Id: i.id,
                                    name: i.name,
                                    Uid: i.uid,
                                    source: i.source,
                                    description: i.description,
                                    field_id: i.field_id

                                });
                            });
                        };
                    })
                }
            });
            setFields(Fields)
            setZones(Zones)
            setCrops(Crops)

        })
    }
    const getFieldStats = async () => {
        const response = await api.get('/dashboard/fields');
        setFS(response.data.farms);
        setUserMapDetails(response.data.user_map_details.map_link_details)
    }
    const getSensorsStats = async () => {
        const response = await api.get('/dashboard/sensors');
        setSensorStats(response.data.sensors);
        // if(response.data.sensors){

        //   setMapConfig({center : [Number(response.data.sensors[0].Latitude) ,Number(response.data.sensors[0].Longitude)]})
        // }
    }
    const handleSubmit = async (event) => {
        event.preventDefault()
        const form = event.currentTarget;
           const isLatLngValid = coords.Latitude && coords.Longitude;
        if (!form.checkValidity()|| !isLatLngValid) {

            event.stopPropagation();
            if (!isLatLngValid) {
            swal("Error", "Please draw a field on the map to set Latitude and Longitude.", "error");
        }
            setValidated(true);
        } else {
            await addField();

            setValidated(false);
            form.reset();

        }

        setValidated(true);
    };
    return (
        <Container className="p-md-5 p-3">
            <Row className='pb-2'>
                <PageTitle subtitle={`${t('field_setup')}`} className="mb-1" />
                <Card className="bg-light border-0 rounded shadow-sm ">
                    <Card.Body>
                        <p style={{ fontSize: '16px', lineHeight: '1.5', margin: '0' }}>
                            we kindly ask you to draw your field on the map.
                        </p>


                    </Card.Body>


                    <Form noValidate validated={validated} onSubmit={handleSubmit} className="p-md-5 p-3">
                        <div className="d-flex gap-4 flex-wrap">
                            <div className="w-100">
                                <Row className="mb-3 gap-3 justify-content-between">
                                    <Form.Group as={Col} md="6" controlId="validationCustom01">
                                        <Form.Label>{t('name_field')} *</Form.Label>
                                        <Form.Control
                                            required
                                            type="text"
                                            placeholder={t('name_field')}
                                            value={dataField.name}
                                            onChange={e => setDataField({ ...dataField, name: e.target.value })}
                                            style={{ height: "40px" }}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            Please provide a Field Name.
                                        </Form.Control.Feedback>
                                        <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                                    </Form.Group>
                                    <Form.Group as={Col} md="5" controlId="validationCustom02">
                                        <Form.Label>{t('name_farm')} *</Form.Label>
                                        {/* <Form.Select
                                    value={dataField.farm_uid}
                                    style={{ border: '1px solid #0BAECB', height: '40px' }}
                                    // className={props.farmError =='' ? '' : 'is-invalid'}
                                    required
                                    onChange={e => setDataField({ ...dataField, farm_uid: e.target.value })}
                                >
                                    <option value="">{t('select_farm')}</option>;
                                    {layerFarm.map((item, index) => {
                                        return <option value={item.uid}>{item.name}</option>;
                                    })}
                                </Form.Select> */}
                                        <FarmSelect defaultval={{ value: farmId, label: farmName }} userUid="477" url='/farm/all-farms' onChange={selected => setDataField({ ...dataField, farm_uid: selected?.value || '' })} placeholder={"Search farm..."} />
                                        <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                                        <Form.Control.Feedback type="invalid">
                                            Please provide a Farm.
                                        </Form.Control.Feedback>
                                    </Form.Group>

                                </Row>
                                <Row className="mb-3 gap-3 justify-content-between">
                                    <Form.Group as={Col} md="6" controlId="validationCustom03" className="mt-2">
                                        <Form.Label>{t('width')} (M)</Form.Label>
                                        <Form.Control
                                            style={{ height: '40px' }}
                                            type="number"
                                            placeholder={t('width')}
                                            value={dataField.width}
                                            onChange={e => setDataField({ ...dataField, width: e.target.value })}
                                          
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            Please provide a valid width.
                                        </Form.Control.Feedback>
                                    </Form.Group>
                                    <Form.Group as={Col} md="5" controlId="validationCustom03" className="mt-3">
                                        <Form.Label className="m-0">{t('length')} (M)</Form.Label>
                                        <Form.Control
                                            style={{ height: '40px' }}

                                            type="number"
                                            placeholder={t('length')}
                                            value={dataField.length}
                                            onChange={e => setDataField({ ...dataField, length: e.target.value })}
                                           
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            Please provide a valid length.
                                        </Form.Control.Feedback>
                                    </Form.Group>

                                </Row>
                            </div>
                            <Col sm='12' >
                                <EditableMap setLayer={setLayer} setCoords={setCoords} />
                            </Col>
                        </div>
                        <div className="d-flex justify-content-end mt-2 ">

                            <Button type="submit mt-4">Submit form</Button>
                        </div>
                    </Form>






                </Card>
            </Row>


        </Container>
    )
}
