import React, { useState, useEffect } from 'react'
// import { Button, ButtonGroup, Card, CardBody, CardHeader, ModalBody, ModalHeader,  FormInput } from 'shards-react'
import api from '../api/api'
import swal from 'sweetalert'
import { useTranslation } from "react-i18next";
import RangeDatePicker from '../components/common/RangeDatePicker';
import { Modal, Form, Row, Col, Button, ButtonGroup } from "react-bootstrap"



const CropList = ({ cropsList, Crops, Fields, Zones }) => {


    const { t, i18n } = useTranslation();

    const [toggle, setToggle] = useState(false);

    const [type, setType] = useState('');
    const [field, setField] = useState('');
    const [zone, setZone] = useState('');
    const [allVarieties, setAllVarieties] = useState([])
    const [listCrop, setListCrop] = useState([])

    const [cropData, setCropData] = useState({
        cropVariety: "",
        days: "",
        plantingDate: "",
        rootDepth: "",
        density: "",
        ecartInter: "",
        ecartIntra: "",
        ruPratique: "",
        growingDate: "",
        surface: ""

    })
    const [msgServer, setMsg] = useState("")

    const [classMsg, setCmsg] = useState("")
    const [displayMsg, setDispMsg] = useState("hide")
    const [iconMsg, setIconMsg] = useState("info")


    const [SingleCrop, setSingleCrop] = useState([])

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
    useEffect(() => {
        getCropType()
        getVarieties()
    }, [])

    const getSingleCrop = (cropUid) => {
        let data = {
            crop_uid: cropUid,
        }
        try {
            api.post('/crop', data)
                .then(res => {
                    let CropData = res.data.crop
                    setSingleCrop(CropData)
                    cropsList.map(crop => {
                        if (CropData.croptype_id === crop.croptype.id) {
                            setType(crop.croptype.id)

                        }
                    })
                    setCropData({ rootDepth: CropData.rootDepth })
                    setCropData({ days: CropData.days })
                    setCropData({ plantingDate: CropData.plantingDate })
                    setCropData({ cropVariety: CropData.crop_variety_id })
                    setCropData({ density: CropData.density })
                    setCropData({ ecartInter: CropData.ecart_inter })
                    setCropData({ ecartIntra: CropData.ecart_intra })
                    setCropData({ ruPratique: CropData.practical_fraction })
                    setCropData({ growingDate: CropData.growingDate })
                    setCropData({ surface: CropData.surface })

                    Fields.map((fieldData) => {
                        if (CropData.field_id == fieldData.Id) {
                            setField(fieldData.Uid)
                        }
                    })
                    Zones.map((zoneData) => {
                        if (CropData.zone_id === zoneData.Id) {
                            setZone(zoneData.Uid)
                        }
                    })
                }).catch(error => {
                    console.log(error)
                    swal({
                        title: "Error",
                        icon: "error",

                    });

                })
        } catch (error) {
            console.log(error)
            swal({
                title: "Error",
                icon: "error",

            });
        }
        setToggle(!toggle)
    }
    const handleEdit = async (cropUid) => {


        let data = {
            croptype_id: type,
            crop_variety_id: cropData.cropVariety,
            days: cropData.days,
            plantingDate: cropData.plantingDate,
            rootDepth: cropData.rootDepth,
            crop_uid: cropUid,
            field_uid: field,
            zone_uid: zone,
            practical_fraction: cropData.ruPratique,
            density: cropData.density,
            ecart_inter: cropData.ecartInter,
            ecart_intra: cropData.ecartIntra,
            growingDate: cropData.growingDate,
            surface: cropData.surface
        }


        await api.post('/crop/edit-crop', data)
            .then(response => {
                if (response.data.type == "success") {
                    swal(`${t('crop_updated')}`, {
                        icon: "success",
                    });
                    setToggle(false)
                    Crops();
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

    const handleDelete = async cropUid => {

        let data = {
            crop_uid: cropUid,
        }
        await api.delete('/crop/delete-crop', { data: data })
            .then(response => {
                if (response.data.type && response.data.type == "danger") {
                    swal({
                        title: `${t('cannot_delete')}`,
                        icon: "warning",
                    });
                }
                if (response.data.type == "success") {
                    Crops()
                    setMsg(`${t('delete_success')}`)
                    setCmsg("success")
                    setDispMsg("show")
                    setIconMsg("check")
                    hideMsg()
                }
            }).catch(error => {
                swal({
                    title: `${t('cannot_delete_crop')}`,
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



    // useEffect(()=>{
    //     if(cropData.ecartInter !== "" && cropData.ecartIntra !== ""){

    //     let formule  = 10000 / (Number(cropData.ecartInter) * Number(cropData.ecartIntra))
    //       setCropData({ ...cropData,density : formule})
    //   }
    //   },[cropData.ecartInter,cropData.ecartIntra])

    const confirmDelete = cropUid => {

        swal({
            title: `${t('are_you_sure')}`,
            text: `${t('confirm_delete')}`,
            icon: "warning",
            buttons: true,
            dangerMode: true,
        })
            .then((Delete) => {
                if (Delete) {
                    handleDelete(cropUid)
                    swal(`${t('delete_success')}`, {
                        icon: "success",
                    });
                }
            }).catch(error => {
                swal({
                    title: `${t('cannot_delete_crop')}`,
                    icon: "error",
                    text: 'Error'

                });
            })

    }

    const handleKeyPress = (event) => {
        const regex = /^[1-9][0-9]?$|^100$/;
        const key = event.key;
        const currentValue = event.target.value + key;
        if (!regex.test(currentValue)) {
            event.preventDefault();
        }
    };

    return (
        <>
            <div className={`mb-0 alert alert-${classMsg} fade ${displayMsg}`}>
                <i class={`fa fa-${iconMsg} mx-2`}></i> {t(msgServer)}
            </div>
            <table className="table mb-4 text-center table-bordered tabel-responsive-lg">
                <thead className="bg-light">
                    <tr>
                        <th scope="col" className="border-0">{t('crop_type')}</th>
                        <th scope="col" className="border-0">{t('name_field')}</th>
                        <th scope="col" className="border-0">{t('name_zone')}</th>
                        <th scope="col" className="border-0"></th>
                    </tr>
                </thead>
                <tbody>
                    {
                        cropsList.map((item, indx) => {
                            let croptype = item.croptype
                            let nameField = "";
                            let nameZone = "";
                            let nameCrop = ""
                            Fields.map((fieldData) => {
                                if (fieldData.Id == item.field_id) {
                                    nameField = fieldData.title
                                }

                            })
                            if (croptype) {
                                nameCrop = croptype.crop
                            }
                            Zones.map((zoneData) => {
                                if (zoneData.Id == item.zone_id) {
                                    nameZone = zoneData.name
                                }

                            })
                            return (
                                <tr>
                                    <td>{nameCrop}</td>
                                    <td>{nameField}</td>
                                    <td>{nameZone}</td>
                                    <td>
                                        <ButtonGroup size="sm" className="mr-2 gap-2">
                                            <Button onClick={() => getSingleCrop(item.Uid)} squared variant="info"><i className="material-icons">&#xe3c9;</i></Button>
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
                <Modal.Header>
                    <h6 className="m-0">{t('edit_crop')}</h6>{" "}
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
                            onClick={() => handleEdit(SingleCrop.uid)}
                        >
                            {t('save')}
                            <i class={`fa fa-check mx-2`}></i>
                        </Button>
                        <Button
                            // variant="success"
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
                        <Row form className='gap-2'>
                            <Col md="6" className="form-group">
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
                            </Col>
                            <Col md="5" className="form-group">
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
                            </Col>
                            <Col lg="6" md="12" sm="12" className="form-group">
                                <p style={{ margin: "0px" }}>{t('crop_type')}</p>
                                <Form.Select
                                    value={type}
                                    onChange={(e) => setType(e.target.value)}

                                >
                                    {
                                        listCrop.map(crop => {
                                            return (
                                                <option value={crop.id}>{crop.crop}</option>
                                            )
                                        })
                                    }

                                </Form.Select>
                                <div className="invalid-feedback">{t('no_empty')}</div>
                            </Col>
                            {/* <Col lg="6" md="12" sm="12" className="form-group">
                                    <p style={{ margin: "0px" }}>{t('prev_type')}</p>
                                    <FormInput
                                        value={prevType}
                                        onChange={(e) => setPrevType(e.target.value)}
                                        placeholder={t('prev_type')}
                                    />
                                </Col> */}
                            <Col lg="5" md="8" sm="8">
                                <Form.Group>
                                    <p style={{ margin: "0px" }}>{t('crop_variety')}</p>
                                    <Form.Select value={cropData.cropVariety} id="cropVariety" onChange={(e) => setCropData({ ...cropData, cropVariety: e.target.value })}>
                                        <option value="">{t('crop_type')}</option>
                                        {

                                            allVarieties.map(variety => (
                                                <option value={variety.id}>{variety.crop_variety}</option>
                                            ))
                                        }
                                    </Form.Select>
                                </Form.Group>

                            </Col>
                            <Row className='gap-2'>
                                <Col lg="4" md="12" sm="12">
                                    <Form.Group>
                                        <p style={{ margin: "0px" }}>{t('surface')} (m²)</p>
                                        <Form.Control type="number" value={cropData.surface} onChange={e => setCropData({ ...cropData, surface: e.target.value })} id='z' placeholder={t('surface')}
                                        />

                                    </Form.Group>

                                </Col>
                                <Col lg="4" md="8" sm="8">
                                    <Form.Group>
                                        <p style={{ margin: "0px" }}>{t('profondeur')} (m)</p>
                                        <Form.Control type="number" value={cropData.rootDepth} onChange={e => setCropData({ ...cropData, rootDepth: e.target.value })} id='z' placeholder={t('profondeur')}
                                        />

                                    </Form.Group>

                                </Col>
                                <Col lg="3" md="8" sm="8">
                                    <Form.Group>
                                        <p style={{ margin: "0px" }}>{t('Days')}</p>

                                        <Form.Control type="number" value={cropData.days} id='days' onChange={e => setCropData({ ...cropData, days: e.target.value })} placeholder={t('Days')} />

                                    </Form.Group>

                                </Col>
                                <Col lg="4" md="12" sm="12">
                                    <Form.Group>
                                        <p style={{ margin: "0px" }}>{t('planting_date')}</p>
                                        <Form.Control type="date" value={cropData.growingDate} onChange={e => setCropData({ ...cropData, growingDate: e.target.value })} id='days' />

                                    </Form.Group>

                                </Col>
                                <Col lg="4" md="8" sm="8">
                                    <Form.Group>
                                        <p style={{ margin: "0px" }}>{t('growing_season')}</p>
                                        <Form.Control type="date" value={cropData.plantingDate} onChange={e => setCropData({ ...cropData, plantingDate: e.target.value })} id='days' />

                                    </Form.Group>

                                </Col>
                                <Col lg="3" md="8" sm="8">
                                    <Form.Group>
                                        <p style={{ margin: "0px" }}>{t('fraction_pratique')} (%) </p>
                                        <Form.Control type="number" value={cropData.ruPratique} onChange={e => setCropData({ ...cropData, ruPratique: e.target.value })} id='ruPratique' placeholder={t('fraction_pratique')}
                                        />
                                    </Form.Group>

                                </Col>
                                <Col lg="4" md="8" sm="8">
                                    <Form.Group>
                                        <p style={{ margin: "0px" }}>{t('ecart_inter')} (m)</p>
                                        <Form.Control type="number" value={cropData.ecartInter} onChange={e => setCropData({ ...cropData, ecartInter: e.target.value })} id='ecartInter' placeholder={t('ecart_inter')}
                                        />
                                    </Form.Group>

                                </Col>
                                <Col lg="4" md="8" sm="8">
                                    <Form.Group>
                                        <p style={{ margin: "0px" }}>{t('ecart_intra')} (m) </p>
                                        <Form.Control type="number" value={cropData.ecartIntra} onChange={e => setCropData({ ...cropData, ecartIntra: e.target.value })} id='ecartIntra' placeholder={t('ecart_intra')}
                                        />
                                    </Form.Group>

                                </Col>
                                <Col lg="3 " md="8" sm="8">
                                    <Form.Group>
                                        <p style={{ margin: "0px" }}>{t('densité')} (plants/ha)</p>
                                        <Form.Control type="number" value={cropData.density} onChange={e => setCropData({ ...cropData, density: e.target.value })} id='densité' placeholder={t('densité')}
                                        />
                                    </Form.Group>

                                </Col>
                            </Row>
                        </Row>
                    </Form>
                </Modal.Body>
            </Modal>



        </>
    )
}

export default CropList