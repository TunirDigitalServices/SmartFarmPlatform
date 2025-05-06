import React, { useState, useEffect } from 'react'
// import { Button, ButtonGroup, ModalBody, ModalHeader, Row, Col, FormInput, FormGroup, Form } from 'shards-react'
import api from '../api/api'
import swal from 'sweetalert'
import { useTranslation } from "react-i18next";
import {Modal, Button, ButtonGroup, Row, Col, Form} from "react-bootstrap"

import "leaflet/dist/leaflet.css";
import { EditControl } from "react-leaflet-draw";
import LeafletMap from './map';
import EditableMap from './EditableMap';


const FieldList = ({ FieldsList, Fields ,Uid}) => {
    const { t, i18n } = useTranslation();

    const [toggle, setToggle] = useState(true);

    const [data, setData] = useState([]);

    const [msgServer, setMsg] = useState("")

    const [classMsg, setCmsg] = useState("")
    const [displayMsg, setDispMsg] = useState("hide")
    const [iconMsg, setIconMsg] = useState("info")
    const [sensorsCoords, setSensorsCoords] = useState([])

    const [SingleField, setSingleField] = useState([]);
    const [name, setName] = useState('');
    const [farm, setFarmUid] = useState('');
    const [description, setDesc] = useState('')
    const [mapConfig, setMapConfig] = useState({
        zoom: "",
        center: [],
        fromAction: false,
        draw: {
          polygon: true,
          circle: false,
          rectangle: false,
          polyline: false,
          marker: false,
          circlemarker: false,
        }
      })
      const [layer, setLayer] = useState('')

      const [coords, setCoords] = useState({
        Latitude: "",
        Longitude: "",
        zoom: "",
        center: [],
        fromAction: false
      })
      useEffect(() => {   
        const getFarms = async () => {
            let url = '/farm/farms';
             if(Uid){
                 url = `/admin/user/${Uid}/farms`;
             }
             await api.get(url)
             .then(response => {
                     let farms = response.data.farms
                     setData(farms);
                 }).catch(err=>{
                    console.log(err)
                 })

        }

        getFarms();
    }, []);

    const getSingleField = async (fieldUid) => {

        let dataField = {
            field_uid: fieldUid,
        }

        await api.post('/field', dataField)
            .then(res => {
                let fieldData = res.data.field
                setSingleField(fieldData) 
                setName(fieldData.name)      
                setDesc(fieldData.description)
                data.map((farmData) => {
                    if(fieldData.farm_id == farmData.id){
                        setFarmUid(farmData.uid)
                    }
                    let sensorsCoord = []
                    let fields = farmData.fields;
                    console.log(fields)
                    fields.map(field => {
                        let sensors = field.sensors;
                        if(sensors){
                            sensors.map(sensor => {
                            sensorsCoord.push({
                                code: sensor.code,
                                Latitude: sensor.Latitude,
                                Longitude: sensor.Longitude
                            })
                            })
                        }
                    })
                    setSensorsCoords(sensorsCoord)
                    })                
                }).catch(error => {
                    swal({
                        title: "Error",
                        icon: "error",

                    });

                })
        setToggle(!toggle)
    }
    const handleEdit = (fieldUid) => {


        let data = {
            name: name,
            farm_uid: farm,
            field_uid: fieldUid,
            description: description,
            coordinates : layer,
            Latitude :coords.Latitude,
            Longitude:coords.Longitude
        }


        api.post('/field/edit-field', data)
            .then(response => {
                if (response.data.type == "success") {
                    swal(`${t('field_updated')}`, {
                        icon: "success",
                    });
                    setToggle(false)
                    Fields();
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

    const handleDelete = async fieldUid => {

        let data = {
            field_uid: fieldUid,
        }
        await api.delete('/field/delete-field', { data: data })
            .then(response => {
                if (response.data.type && response.data.type == "danger") {
                    swal({
                        title: `${t('cannot_delete')}`,
                        icon: "warning",
                    });
                }
                if (response.data.type == "success") {
                    Fields()
                    setMsg(`${t('delete_success_field')}`)
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


    const confirmDelete = fieldUid => {

        swal({
            title: `${t('are_you_sure')}`,
            text: `${t('confirm_delete')}`,
            icon: "warning",
            buttons: true,
            dangerMode: true,
        })
            .then((Delete) => {
                if (Delete) {
                    handleDelete(fieldUid)
                    swal(`${t('delete_success_field')}`, {
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
    console.log(FieldsList,"FieldsList");
    


    return (
        <>
            <div className={`mb-0 alert alert-${classMsg} fade ${displayMsg}`}>
                <i class={`fa fa-${iconMsg} mx-2`}></i> {t(msgServer)}
            </div>
            <table className="table mb-4 text-center table-bordered table-responsive-lg">
                <thead className="bg-light">
                    <tr>
                        <th scope="col" className="border-0">{t('name')}</th>
                        <th scope="col" className="border-0">{t('status')}</th>
                        <th scope="col" className="border-0">{t('name_farm')}</th>
                        <th scope="col" className="border-0"></th>
                    </tr>
                </thead>
                <tbody>
                    {
                        FieldsList?.map((item, indx) => {
                            let nameFarm = "";
                            data.map((farmData) => {
                                if(farmData.id == item.farm_id){
                                    nameFarm =  farmData.name
                                }
                            })
                            return (

                                <tr>
                                    <td>{item.title}</td>
                                    <td>{item.status}</td>
                                    <td>{nameFarm}</td>
                                    <td>
                                        <ButtonGroup size="sm" className="mr-2">
                                            <Button onClick={() => getSingleField(item.Uid)} squared theme="info"><i className="material-icons">&#xe3c9;</i></Button>
                                            <Button onClick={() => confirmDelete(item.Uid)} squared theme="danger"><i className="material-icons">&#xe872;</i></Button>
                                        </ButtonGroup>
                                    </td>
                                </tr>
                            )
                        })
                    }
                </tbody>
            </table>


            <Modal size="lg" show={toggle} aria-labelledby="contained-modal-title-vcenter" centered>
                <Modal.Header>

                    <h6 className="m-0">{t('edit_field')}</h6>{" "}

                    <div
                        style={{
                            display: "flex",
                            justifyContent: "flex-end",

                        }}
                    >
                        <Button
                            // theme="success"
                            className="mb-2 mr-1 btn btn-success"
                            onClick={() => handleEdit(SingleField.uid)}
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
                        <Row form>
                            <Col md="6" className="form-group">
                                <p style={{ margin: "0px" }}>{t('name_farm')}</p>
                                <Form.Select
                                    value={farm}
                                    onChange={(e) => setFarmUid(e.target.value)}
                                    required
                                >

                                    {   
                                        data.map((farmData) => {
                                            return (<option value={farmData.uid}>{farmData.name}</option>)
                                            
                                        })
                                    }
                                   
                                </Form.Select>
                            </Col>
                            <Col md="6" className="form-group">
                                <p style={{ margin: "0px" }}>{t('name_field')}</p>
                                <Form.Control
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />

                                <div className="invalid-feedback">{t('no_empty')}</div>

                            </Col>
                            <Col lg='12' md="12" sm='12' className="form-group">
                                 <EditableMap sensorsCoords={sensorsCoords} setLayer={setLayer} setCoords={setCoords} />

                            </Col>
                        </Row>
                    </Form>

                </Modal.Body>
            </Modal>




        </>
    )
}

export default FieldList
