import React, { useEffect, useState } from 'react'

import { Button, ButtonGroup, Row, Col, Form } from 'react-bootstrap';

import api from '../api/api'
import swal from 'sweetalert'
import { useTranslation } from "react-i18next";
import PivotForm from '../components/FieldSettingForms/pivotForm';
import LateralForm from '../components/FieldSettingForms/lateralForm';
import DripForm from '../components/FieldSettingForms/dripForm';
import { Modal } from "react-bootstrap"

const IrrigationList = ({ irrigationsList, Irrigations, Crops, Zones }) => {

    const { t, i18n } = useTranslation();

    const [toggle, setToggle] = useState(false);

    const [type, setType] = useState('');
    const [name, setName] = useState('')
    const [fullRuntime, setFullRuntime] = useState('');
    const [flowrate, setFlowrate] = useState('');
    const [irrigatedAlready, setIrrigAlready] = useState('');
    const [pivotShape, setPivotShape] = useState('');
    const [irrigationSyst, setIrrigSyst] = useState('');
    const [pivotLength, setPivotLength] = useState('');
    const [pivotCoord, setPivotCoord] = useState('')
    const [lateral, setLateral] = useState('');
    const [crop, setCrop] = useState('');
    const [zone, setZone] = useState('');
    const [drippers, setDrippers] = useState('');
    const [drippersSpacing, setDrippersSpacing] = useState('')
    const [IrrigationData, setIrrigationData] = useState({
        effIrrig: "",
        pumpFlow: "",
        pumpType: "",
        linesNumber: ""
    })

    const [msgServer, setMsg] = useState("")

    const [classMsg, setCmsg] = useState("")
    const [displayMsg, setDispMsg] = useState("hide")
    const [iconMsg, setIconMsg] = useState("info")


    const [SingleIrrigation, setSingleIrrigation] = useState([])




    const getSingleIrrig = (irrigationUid) => {


        let data = {
            irrigation_uid: irrigationUid,
        }

        api.post('/irrigation', data)
            .then(res => {
                let IrrigationData = res.data.irrigation
                setSingleIrrigation(IrrigationData)
                setType(IrrigationData.type)
                setFlowrate(IrrigationData.flowrate)
                setFullRuntime(IrrigationData.full_runtime)
                setPivotCoord(IrrigationData.pivot_coord)
                setPivotLength(IrrigationData.pivot_length)
                setPivotShape(IrrigationData.pivot_shape)
                setLateral(IrrigationData.lateral)
                setIrrigAlready(IrrigationData.irrigated_already)
                setIrrigSyst(IrrigationData.irrigation_syst)
                setDrippers(IrrigationData.drippers)
                setIrrigationData({ effIrrig: IrrigationData.effIrrig })
                setIrrigationData({ pumpFlow: IrrigationData.pumpFlow })
                setIrrigationData({ pumpType: IrrigationData.pumpType })
                setIrrigationData({ linesNumber: IrrigationData.lines_number })
                setDrippersSpacing(IrrigationData.drippers_spacing)

                Crops.map((cropData) => {
                    if (IrrigationData.crop_id == cropData.Id) {
                        setCrop(cropData.Uid)
                    }
                })
                Zones.map((zoneData) => {
                    if (IrrigationData.zone_id === zoneData.Id) {
                        setZone(zoneData.Uid)
                    }
                })
            }).catch(error => {
                swal({
                    title: "Error",
                    icon: "error",

                });

            })
        setToggle(!toggle)
    }




    const handleEdit = (irrigationUid) => {


        let data = {
            type: type,
            crop_uid: crop,
            zone_uid: zone,
            irrigation_uid: irrigationUid,
            flowrate: flowrate,
            irrigated_already: irrigatedAlready,
            name: name,
            pivot_shape: pivotShape,
            irrigation_syst: irrigationSyst,
            pivot_length: pivotLength,
            pivot_coord: pivotCoord,
            full_runtime: fullRuntime,
            lateral: lateral,
            drippers: drippers,
            pumpFlow: IrrigationData.pumpFlow,
            effIrrig: IrrigationData.effIrrig,
            drippers_spacing: drippersSpacing,
            pumpType: IrrigationData.pumpType,
            lines_number: IrrigationData.lines_number
        }


        api.post('/irrigation/edit-irrigation', data)
            .then(response => {
                if (response.data.type == "success") {
                    swal(`${t('irrig_updated')}`, {
                        icon: "success",
                    });
                    setToggle(false)
                    Irrigations();
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
            })

    }


    const handleDelete = async irrigationUid => {

        let data = {
            irrigation_uid: irrigationUid,
        }
        await api.delete('/irrigation/delete-irrigation', { data: data })
            .then(response => {
                if (response.data.type && response.data.type == "danger") {
                    swal({
                        title: `${t('cannot_delete')}`,
                        icon: "warning",
                    });
                }
                if (response.data.type == "success") {
                    Irrigations()
                    setMsg(`${t('delete_success_irrig')}`)
                    setCmsg("success")
                    setDispMsg("show")
                    setIconMsg("check")
                    hideMsg()
                }
            }).catch(error => {
                swal({
                    title: `${t('cannot_delete')}`,
                    icon: "error",
                    text: 'Error'

                });
            })
    }
    const hideMsg = () => {
        setTimeout(() => {
            setDispMsg("hide")
        }, 3000);

    }


    const confirmDelete = irrigationUid => {

        swal({
            title: `${t('are_you_sure')}`,
            text: `${t('confirm_delete')}`,
            icon: "warning",
            buttons: true,
            dangerMode: true,
        })
            .then((Delete) => {
                if (Delete) {
                    handleDelete(irrigationUid)
                    swal(`${t('delete_success_irrig')}`, {
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
    const IrrigationMethods = [
        // `${t('None')}`,
        `${t('Drip')}`,
        `${t('Pivot')}`,
        `${t('Lateral')}`,
        `${t('SDI')}`,
        `${t('Furrow')}`,
        `${t('Sprinkler')}`
    ];

    const irrigationMethodForm = () => {
        switch (type) {
            case `${t('Pivot')}`:
                return <PivotForm
                    handleFlowRate={(e) => setFlowrate(e.target.value)}
                    handleIrrgSyst={(e) => setIrrigSyst(e.target.value)}
                    handleRunTime={(e) => setFullRuntime(e.target.value)}
                    handlePivotCoord={(e) => setPivotCoord(e.target.value)}
                    handlePivotLength={(e) => setPivotLength(e.target.value)}
                    handlePivotShape={(e) => setPivotShape(e.target.value)}
                    name={name}
                    flowrate={flowrate}
                    irrigation_syst={irrigationSyst}
                    pivot_coord={pivotCoord}
                    pivot_length={pivotLength}
                    pivot_shape={pivotShape}
                    full_runtime={fullRuntime}
                />;
            case `${t('Lateral')}`:
                return <LateralForm
                    handleLateral={(e) => setLateral(e.target.value)}
                    handlePivotLength={(e) => setPivotLength(e.target.value)}
                    handleRunTime={(e) => setFullRuntime(e.target.value)}
                    handleName={(e) => setName(e.target.value)}
                    handleFlowRate={(e) => setFlowrate(e.target.value)}
                    full_runtime={fullRuntime}
                    flowrate={flowrate}
                    name={name}
                    pivot_length={pivotLength}
                    lateral={lateral}
                />;
            case `${t('None')}`:
                return null;
            default:
                return (
                    <DripForm
                        handleDrippers={(e) => setDrippers(e.target.value)}
                        handleIrrigAlrd={(e) => setIrrigAlready(e.target.value)}
                        handleFlowRate={(e) => setFlowrate(e.target.value)}
                        handleDrippersSpacing={(e) => setDrippersSpacing(e.target.value)}
                        flowrate={flowrate}
                        drippers={drippers}
                        drippersSpacing={drippersSpacing}
                        irrigated_already={irrigatedAlready}
                    />
                );
        }
    };

    console.log(SingleIrrigation)
    return (
        <>
            <div className={`mb-0 alert alert-${classMsg} fade ${displayMsg}`}>
                <i class={`fa fa-${iconMsg} mx-2`}></i> {t(msgServer)}
            </div>
            <table className="table mb-4 text-center table-bordered table-responsive-lg">
                <thead className="bg-light">
                    <tr>
                        <th scope="col" className="border-0">{t('Irrigation_system_type')}</th>
                        {/* <th scope="col" className="border-0">{t('pivot_shape')}</th> */}
                        <th scope="col" className="border-0">{t('crop_type')}</th>
                        <th scope="col" className="border-0">{t('name_zone')}</th>
                        <th scope="col" className="border-0"></th>
                    </tr>
                </thead>
                <tbody>

                    {
                        irrigationsList.map((item, indx) => {
                            let nameCrop = "";
                            let nameZone = "";
                            Crops.map((cropData) => {
                                if (cropData.Id == item.crop_id) {
                                    nameCrop = cropData.croptype.crop
                                }
                            })
                            Zones.map((zoneData) => {
                                if (zoneData.Id == item.zone_id) {
                                    nameZone = zoneData.name
                                }

                            })
                            return (
                                <tr>
                                    <td style={{ textTransform: 'capitalize' }}>{item.type}</td>
                                    {/* <td>{item.pivotShape}</td> */}
                                    <td>{nameCrop}</td>
                                    <td>{nameZone}</td>
                                    <td>
                                        <ButtonGroup size="sm" className="mr-2 gap-2">
                                            <Button onClick={() => getSingleIrrig(item.Uid)} squared variant="info"><i className="material-icons">&#xe3c9;</i></Button>
                                            <Button onClick={() => confirmDelete(item.Uid)} squared variant="danger"><i className="material-icons">&#xe872;</i></Button>
                                        </ButtonGroup>
                                    </td>

                                </tr>
                            )
                        })
                    }
                </tbody>
            </table>
            <Modal size='lg' centered show={toggle} >
                <Modal.Header closeAriaLabel>
                    <h6 className="m-0">{t('edit_irrigation')}</h6>{" "}
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "flex-end",
                            gap: "10px"
                        }}
                    >
                        <Button
                            // theme="success"
                            className="mb-2 mr-1 btn btn-success"
                            onClick={() => handleEdit(SingleIrrigation.uid)}
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
                    <Form>
                        <Row form className='gap-2 justify-content-between'>
                            <Col md="4" className="form-group">
                                <p style={{ margin: "0px" }}>{t('Irrigation_system_type')}</p>
                                <Form.Select
                                    value={type}
                                    onChange={(e) => setType(e.target.value)}
                                >
                                    <option>{t('select_type')}</option>
                                    {IrrigationMethods.map(item => {
                                        if (item == type) {
                                            return <option selected={true}>{item}</option>;
                                        } else {
                                            return <option selected={false}>{item}</option>;
                                        }
                                    })}
                                </Form.Select>
                                <div className="invalid-feedback">{t('no_empty')}</div>
                            </Col>
                            <Col md="4" className="form-group">
                                <p style={{ margin: "0px" }}>{t('crop_type')}</p>
                                <Form.Select
                                    value={crop}
                                    onChange={(e) => setCrop(e.target.value)}
                                >
                                    {
                                        Crops.map((crop) => (
                                            <option value={crop.Uid}>{crop.croptype.crop}</option>
                                        ))
                                    }

                                </Form.Select>
                                <div className="invalid-feedback">{t('no_empty')}</div>
                            </Col>
                            <Col md="3" className="form-group">
                                <p style={{ margin: "0px" }}>{t('name_zone')}</p>
                                <Form.Select
                                    value={zone}
                                    onChange={(e) => setZone(e.target.value)}
                                >
                                    {
                                        Zones.map((zone) => (
                                            <option value={zone.Uid}>{zone.name}</option>
                                        ))
                                    }

                                </Form.Select>
                                <div className="invalid-feedback">{t('no_empty')}</div>
                            </Col>
                        </Row>
                    </Form>
                    <Row form className='gap-2 justify-content-between'>
                        <Col lg="4" md="12" sm="12">
                            <Form.Group>
                                <p style={{ margin: "0px" }}>{t('efficience_irrigation')} (%) </p>
                                <Form.Control type="number" value={IrrigationData.effIrrig} onChange={e => setIrrigationData({ effIrrig: e.target.value })} id='effIrrig' placeholder={t('efficience_irrigation')}
                                />

                            </Form.Group>

                        </Col>
                        <Col lg="4" md="8" sm="8">
                            <Form.Group>
                                <p style={{ margin: "0px" }}>{t('type_reseau')}</p>
                                <Form.Control value={IrrigationData.pumpType} onChange={e => setIrrigationData({ pumpType: e.target.value })} id='debitReseau' placeholder={t('type_reseau')}
                                />

                            </Form.Group>

                        </Col>
                        <Col lg="3" md="12" sm="12">
                            <Form.Group>
                                <p style={{ margin: "0px" }}>{t('debit_reseau')} (l/s) </p>
                                <Form.Control type="number" value={IrrigationData.pumpFlow} onChange={e => setIrrigationData({ pumpFlow: e.target.value })} id='debitReseau' placeholder={t('debit_reseau')}
                                />

                            </Form.Group>

                        </Col>
                        <Col lg="4" md="8" sm="8">
                            <Form.Group>
                                <p style={{ margin: "0px" }}>{t('nbr_ligne')}</p>
                                <Form.Control type='number' value={IrrigationData.linesNumber} onChange={e => setIrrigationData({ linesNumber: e.target.value })} id='nbr_ligne' placeholder={t('nbr_ligne')}
                                />

                            </Form.Group>

                        </Col>
                        {irrigationMethodForm()}

                    </Row>
                </Modal.Body>
            </Modal>

        </>
    )
}

export default IrrigationList