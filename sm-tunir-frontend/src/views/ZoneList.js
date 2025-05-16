import React, { useState, useEffect } from 'react'
// import { Button, ButtonGroup, Card, CardHeader, CardBody, ModalBody, ModalHeader, Row, Col, FormInput, Form, FormSelect,Slider } from 'shards-react'
import api from '../api/api'
import swal from 'sweetalert'
import { useTranslation } from "react-i18next";
import CompositeSoil from '../components/FieldSettingForms/compositeSoilForm';
import StandardSoil from '../components/FieldSettingForms/standardSoil';
import { Modal, Form, Row, Col, Button, ButtonGroup } from "react-bootstrap"




const ZoneList = ({ zonesList, Zones, Fields, state, className = "", listSoils }) => {

    const { t, i18n } = useTranslation();
    const [toggle, setToggle] = useState(false);
    const [name, setName] = useState('');
    const [source, setSource] = useState('');
    const [description, setDescription] = useState('');
    const [field, setField] = useState('')
    const [depthLevel, setLevel] = useState([]);
    const [depth, setDepth] = useState([]);
    const [defaultDeth, setDefaultDeth] = useState(0);
    const [defaultSoilProprety, setdefaultSoilProprety] = useState('Standard');
    const [depth_data, setDepthData] = useState([])
    const [msgServer, setMsg] = useState("")
    const [classMsg, setCmsg] = useState("")
    const [displayMsg, setDispMsg] = useState("hide")
    const [iconMsg, setIconMsg] = useState("info")
    const [SingleZone, setSingleZone] = useState([])
    const [soilData, setSoilData] = useState({
        irrigArea: "",
        RUmax: "",
        effPluie: "",
        ruPratique: "",
        effIrrig: "",
        soilType: "",
        dosePercentage: ""

    })
    const [currentDepthLevel, setDepthLevel] = useState(0);

    const [isStandardSoil, setSoilType] = useState(true);

    const [compSoilData, setCompSoilData] = useState({
        pH: 0,
        om: 0,
        sand: 0,
        clay: 0,
        silt: 0
    })
    const handleDepth = (e) => {
        //setDepthData(e);
    };

    useEffect(() => {
        soilTypeForm();
    }, [currentDepthLevel]);

    const getSingleZone = (zoneUid) => {

        setSingleZone([])
        let data = {
            zone_uid: zoneUid,
        }

        api.post('/zone', data)
            .then(res => {
                let ZoneData = res.data.zone
                // let soilTypes = ZoneData.soiltypes
                setSingleZone(ZoneData)
                setName(ZoneData.name)
                setSource(ZoneData.source)
                setDescription(ZoneData.description)
                // setSoilData({ RUmax: ZoneData.RUmax })
                // setSoilData({ effPluie: ZoneData.effPluie })
                // setSoilData({ soilType: ZoneData.soiltype_id })
                setSoilData({
                    RUmax: ZoneData.RUmax,
                    effPluie: ZoneData.effPluie,
                    soilType: ZoneData.soiltype_id

                })

                setDepthData(JSON.parse(ZoneData.depth_data))

                setDepth(Object.keys(JSON.parse(ZoneData.depth_data)))
                if (Object.keys(JSON.parse(ZoneData.depth_data)).length > 0) {
                    setDefaultDeth(Object.keys(JSON.parse(ZoneData.depth_data))[0])
                    setdefaultSoilProprety(JSON.parse(ZoneData.depth_data)[Object.keys(JSON.parse(ZoneData.depth_data))[0]].soil_property)
                    setCompSoilData({ ...compSoilData, pH: JSON.parse(ZoneData.depth_data)[Object.keys(JSON.parse(ZoneData.depth_data))[0]].soil_property })

                }

                Fields.map((fieldData) => {
                    if (ZoneData.field_id == fieldData.Id) {
                        setField(fieldData.Uid)
                    }
                })

            }).catch(error => {
                swal({
                    title: error,
                    icon: "error",

                });
                return false;

            })

        setToggle(!toggle)
        return false;
    }
    const handleEdit = (zoneUid) => {
        let data = {
            name: name,
            source: source,
            zone_uid: zoneUid,
            field_uid: field,
            RUmax: soilData.RUmax,
            effPluie: soilData.effPluie,
            soiltype_id: soilData.soilType,
            dose_percentage: soilData.dosePercentage
        }
        api.post('/zone/edit-zone', data)
            .then(response => {
                if (response.data.type == "success") {
                    swal(`${t('zone_updated')}`, {
                        icon: "success",
                    });
                    setToggle(false)
                    Zones();
                }
                if (response.data.type && response.data.type == "danger") {
                    swal({
                        icon: 'error',
                        title: 'Oops...',
                        text: 'Error'
                    })
                    return false;
                }
            }).catch(error => {
                swal({
                    icon: 'error',
                    title: 'Oops...',
                    text: 'Error'
                })
                return false;
            })
    }
    const handleDelete = async zoneUid => {

        let data = {
            zone_uid: zoneUid,
        }
        await api.delete('/zone/delete-zone', { data: data })
            .then(response => {
                if (response.data.type && response.data.type == "danger") {
                    swal({
                        title: `${t('cannot_delete')}`,
                        icon: "warning",
                    });
                }
                if (response.data.type == "success") {
                    Zones()
                    setMsg(`${t('delete_success_zone')}`)
                    setCmsg("success")
                    setDispMsg("show")
                    setIconMsg("check")
                    hideMsg()
                }
            }).catch(error => {
                swal({
                    title: `${t('cannot_delete')}`,
                    icon: "error",
                    text: 'error_delete_zone'
                });
            })
    }
    const hideMsg = () => {
        setTimeout(() => {
            setDispMsg("hide")
        }, 3000);

    }


    const confirmDelete = zoneUid => {

        swal({
            title: `${t('are_you_sure')}`,
            text: `${t('confirm_delete')}`,
            icon: "warning",
            buttons: true,
            dangerMode: true,
        })
            .then((Delete) => {
                if (Delete) {
                    handleDelete(zoneUid)
                    swal(`${t('delete_success_zone')}`, {
                        icon: "success",
                    });
                }
            }).catch(error => {
                swal({
                    title: `${t('cannot_delete')}`,
                    icon: "error",
                    text: 'Error'

                });
            })

    }
    const soilTypeForm = () => {
        if (isStandardSoil == true)
            return (
                null
                // <StandardSoil
                //   listSoils={otherInfo.listSoils}
                //   key={currentDepthLevel}
                //   depth={depthLevel[currentDepthLevel].depth}
                //   uni={depthLevel[currentDepthLevel].uni}
                //   onChange={value => {
                //     depthLevel[currentDepthLevel].uni = value.uni;
                //     depthLevel[currentDepthLevel].depth = value.depth;
                //   }}
                // />
            );
        else {
            return (
                <CompositeSoil
                    key={currentDepthLevel + 1}

                    soilType={soilData.soilType}
                />
            );
        }
    };

    const deleteDepthLevelButton = () => {
        if (Object.keys(depth_data).length > 0) {
            return (
                <Col md="12" className="form-group">
                    <Button
                        variant="danger"
                        onClick={evt => {
                            evt.preventDefault();
                            if (window.confirm("delete_depth")) {
                                delete depth_data[defaultDeth]
                                setDepthData(depth_data)
                            }
                        }}
                    >
                        delete current depth level
                    </Button>
                </Col>
            );
        }
    };

    const handleSoilPick = (e) => {
        console.log(e.target.value)
        e.preventDefault()
        const soilType = listSoils.find(
            (soil) => soil.id == e.target.value
        );
        console.log(soilType)
        // props.handleEffIrrig(soilType.fc)
        if (typeof soilType !== "undefined") {
            setSoilData({
                ...soilData,
                soilType: soilType.id,
                RUmax: soilType.ru,
                ruPratique: soilType.practical_fraction,
                effPluie: soilType.rain_eff
            });

        }
    };
    console.log(soilData.soilType)
    return (
        <>
            <div className={`mb-0 alert alert-${classMsg} fade ${displayMsg}`}>
                <i class={`fa fa-${iconMsg} mx-2`}></i> {t(msgServer)}
            </div>
            <table className="table mb-4 text-center table-bordered table-responsive-lg">
                <thead className="bg-light">
                    <tr>
                        <th scope="col" className="border-0">{t('name')}</th>
                        <th scope="col" className="border-0">{t('name_field')}</th>
                        <th scope="col" className="border-0"></th>
                    </tr>
                </thead>
                <tbody>
                    {
                        zonesList?.map((item, indx) => {
                            let nameField = "";
                            Fields.map((fieldData) => {
                                if (fieldData.Id == item.field_id) {
                                    nameField = fieldData.title
                                }
                            })
                            return (

                                <tr>
                                    <td>{item.name}</td>
                                    <td>{nameField}</td>
                                    <td>
                                        <ButtonGroup size="sm" className="mr-2 gap-2">
                                            <Button onClick={() => getSingleZone(item.Uid)} squared variant="info"><i className="material-icons">&#xe3c9;</i></Button>
                                            <Button onClick={() => confirmDelete(item.Uid)} squared variant="danger"><i className="material-icons">&#xe872;</i></Button>
                                        </ButtonGroup>
                                    </td>
                                </tr>
                            )
                        })
                    }
                </tbody>
            </table>
            {<Modal size='lg' centered show={toggle} >
                <Modal.Header closeAriaLabel>

                    <h6 className="m-0">{t('edit_zone')}</h6>

                    <div
                        style={{
                            display: "flex",
                            justifyContent: "flex-end",
                            gap: "10px"
                        }}
                    >
                        <Button
                            // variant="success"
                            className="mb-2 mr-1 btn btn-success"
                            onClick={() => handleEdit(SingleZone.uid)}
                        >
                            {t('save')}
                            <i class={`fa fa-check mx-2`}></i>
                        </Button>
                        <Button
                            // theme="success"
                            className="mb-2 mr-1 btn btn-danger"
                            onClick={() => setToggle(false)}

                        >
                            {t('cancel')}
                            <i class={`fa fa-times mx-2`}></i>
                        </Button>
                    </div>

                </Modal.Header>
                <Modal.Body>
                    {<Form>
                        <Row form className='gap-2 '>
                            <Col md="6" className="form-group">
                                <p style={{ margin: "0px" }}>{t('soil_zone')}</p>
                                <Form.Control
                                    placeholder={t('soil_zone')}
                                    required
                                    defaultValue={SingleZone.name}
                                    onChange={(e) => setName(e.target.value)}
                                    style={{ height: "40px" }}
                                />
                            </Col>
                            <Col md="5" className="form-group">
                                <p style={{ margin: "0px" }}>{t('name_field')}</p>
                                <Form.Select
                                    value={field}
                                    onChange={(e) => setField(e.target.value)}
                                >
                                    {
                                        Fields.map((field) => (
                                            <option value={field.Uid}>{field.title}</option>
                                        ))
                                    }
                                </Form.Select>
                                <div className="invalid-feedback">{t('no_empty')}</div>

                            </Col>
                            <Col lg='6' md="12" sm="12" className="form-group">
                                <div>
                                    <p style={{ margin: "0px" }}>{t('soil_type')}</p>
                                    <Form.Select
                                        value={soilData.soilType}
                                        onChange={handleSoilPick}
                                    >
                                        <option value="">{t('select_soil')}</option>
                                        {
                                            listSoils.map(soil => {
                                                return <option value={soil.id}>{soil.soil}</option>

                                            })
                                        }
                                    </Form.Select>
                                </div>
                            </Col>

                            {/* <Col md="6" className="form-group">
                                <p style={{ margin: "0px" }}>Source</p>
                                <FormSelect
                                    defaultValue={source}
                                    onChange={(e) => setSource(e.target.value)}
                                >
                                    <option>Manual</option>
                                </FormSelect>

                            </Col> */}
                            <Col md="5" className="form-group">
                                <p style={{ margin: "0px" }}>Soil Property</p>
                                <Form.Select
                                    value={defaultSoilProprety}
                                    onChange={() => setSoilType(!isStandardSoil)}
                                >
                                    <option selected={isStandardSoil}>Standard</option>
                                    <option selected={!isStandardSoil}>Composite</option>
                                </Form.Select>
                            </Col>
                        </Row>
                    </Form>}
                    <Row className='gap-2'>
                        {soilTypeForm()}
                        <Col lg="4" md="8" sm="8">
                            <Form.Group>
                                <p style={{ margin: "0px" }}>{t('efficacité_pluie')} (%)</p>
                                <Form.Control type="number" value={soilData.effPluie} onChange={e => setSoilData({ ...soilData, effPluie: e.target.value })} id='effPluie' placeholder={t('efficacité_pluie')}
                                />

                            </Form.Group>
                        </Col>
                        <Col lg="4" md="8" sm="8">
                            <Form.Group>
                                <p style={{ margin: "0px" }}>RU max (mm/m)</p>
                                <Form.Control type="number" value={soilData.RUmax} onChange={e => setSoilData({ ...soilData, RUmax: e.target.value })} id='ruMax' placeholder="RU max"
                                />

                            </Form.Group>

                        </Col>
                    </Row>
                </Modal.Body>
            </Modal>}
        </>
    )
}

export default ZoneList