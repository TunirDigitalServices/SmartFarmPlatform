import React,{useState} from 'react'
import { Button, ButtonGroup, Row, Col, FormInput, FormGroup, Form, FormSelect } from 'shards-react'
import api from '../api/api'
import swal from 'sweetalert'
import { useTranslation } from "react-i18next";
import { useEffect } from 'react';
import {Modal} from "react-bootstrap"



const SensorList = ({sensorsData,Sensors}) => {


    const userId = JSON.parse(localStorage.getItem('user')).id 
    const { t, i18n } = useTranslation();


    const [toggle, setToggle] = useState(false);


    const [msgServer,setMsg] = useState("")

    const [classMsg , setCmsg] = useState("")
    const [displayMsg , setDispMsg] = useState("hide")
    const [iconMsg,setIconMsg]=useState("info")

    const [code,setCode] = useState('')
    const [description,setDescription] = useState('')
    const [zoneUid,setZone]= useState('')
    const [fieldId,setField]= useState('')
    const [zones,setZonesList]= useState([])
    const [fields,setFieldsList]= useState([])
    const [codeErr,setCodeErr] = useState('')
    

    const [SingleSensor, setSingleSensor] = useState([])

    const [sensorData, setSensorData] = useState([]);



    const getSingleSensor = async (sensorUid) => {

        let data = {
            sensor_uid: sensorUid,
        }

        await api.post('/sensor', data)
            .then(res => {
                let SensorData = res.data.sensor
                setSingleSensor(SensorData)
                setCode(SensorData[0].code)
                setDescription(SensorData[0].description)
                setZone(SensorData[0].zone_id)
                setField(SensorData[0].field_id)
            }).catch(error => {
                swal({
                    title: "Error",
                    icon: "error",

                });

            })
        setToggle(!toggle)

    }


    const validate = () => {
        let codeErr = '';

        if (!code) {
            codeErr = 'Cannot be blank!';
            setCodeErr(codeErr)
            return false;
        } else {
            setCodeErr("")
            return true;
        }

    };

    const handleEdit = (sensorUid) => {


        let user = JSON.parse(localStorage.getItem('user'));
        let user_uid = user.id

        let data = {
            code: code,
            user_uid,
            sensor_uid: sensorUid,
            field_id : fieldId,
            zone_id: zoneUid,
        }

        let isValid = validate()

        if (isValid) {
      
            api.post('/sensor/edit-sensor', data)
                .then(response => {
                    if (response.data.type == "success") {
                        swal(`${t('sensor_updated')}`, {
                            icon: "success",
                        });
                        setToggle(false)
                        Sensors();
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
    
    }


    const handleDelete = async sensorUid => {

    

        let data = {
            sensor_uid: sensorUid,
        }
        await api.delete('/sensor/delete-sensor', { data: data })
            .then(response => {
                if (response.data.type && response.data.type == "danger") {
                    swal({
                        title: `${t('cannot_delete')}`,
                        icon: "warning",
                    });
                }
                if (response.data.type == "success") {
                    Sensors()
                    setMsg(`${t('delete_success_sensor')}`)
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


    const confirmDelete = sensorUid => {

        swal({
            title: `${t('are_you_sure')}`,
            text: `${t('confirm_delete')}`,
            icon: "warning",
            buttons: true,
            dangerMode: true,
        })
            .then((Delete) => {
                if (Delete) {
                    handleDelete(sensorUid)
                    swal(`${t('delete_success_sensor')}`, {
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

    const fetchDataSensor = async (sensorUid,code) => {

        

    /*await api.get(`http://54.38.183.164:5000/api/sensor/last-topic/${code}`)
      .then(async (response) => {
          setSensorData(response.data)
        if(response) {
            let data = {
                datasensor : response.data,
                sensor_uid : sensorUid,
                user_uid : userId
            }
            await api.post('/datasensor/add-data',data)
            .then(async (result)=>{
                if(result.data.type === "success"){*/


                    await api.post('/sensor/activate-synch',{sensor_uid : sensorUid})
                    .then(response=>{
                        if(response.data.type === "success"){
                            swal(`${t('sensor_updated')}`, {
                                icon: "success",
                            });
                            Sensors()
                        }
                        if(response.data.type === "danger"){
                            swal({
                                icon: "error",
                                text: 'Error'
                            });
                        }
                    })

                //}
           /* })
        }

      }).catch((error)=> {
        console.log(error);
      });*/
  }

  useEffect(()=>{
      
      const getDataZones = async () => {
        await api.get('/zone/zones').then(res =>{
        const newDataZone = res.data.farms;
        let Zones = [];
        newDataZone.map(item =>{
          let fields = item.fields;
          if(fields){
            fields.map(itemZone => {
              let zones = itemZone.zones;
              if(zones){
                zones.map(i => {
                  Zones.push({
                    id:i.id,
                    name : i.name,
                    Uid : i.uid
                  })
                })
              }
            })
          }
        })
    
        setZonesList(Zones)
         })
        }
      
       const getDataFields = async () => {
          await api.get('/field/fields').then(res =>{
            const newData = res.data.farms;
            let Fields = [];
            newData.map(item => {
              let fields = item.fields
              if(fields){
                fields.map(itemfield => {
                Fields.push({
                  name: itemfield.name,
                  id : itemfield.id,
                });
                })
              }
            });
            setFieldsList(Fields)
           }) 
          }
      
          getDataFields()
          getDataZones()
        },[])

  return (
    <>
        <div className={`mb-0 alert alert-${classMsg} fade ${displayMsg}`}>
                 <i class={`fa fa-${iconMsg} mx-2`}></i> {t(msgServer)}
            </div>
         <table className="bg-light table mb-0 text-center table-bordered table-responsive-lg">
                <thead className="bg-light">
                    <tr>
                        <th scope="col" className="border-0">{t('sensor_code')}</th>
                        <th scope="col" className="border-0"></th>

                    </tr>
                </thead>
                <tbody>
                    {
                        sensorsData.map((item, indx) => {
                            return (

                                <tr>
                                    <td>{item.code}</td>
                                    
                                    <td>
                                        <ButtonGroup size="sm" className="mr-2">
                                            {
                                                item.synchronized === "0"
                                                ?
                                                <Button onClick={() => fetchDataSensor(item.uid,item.code)} squared theme="info"><i className='material-icons'>&#xe627;</i></Button>
                                                :
                                                null
                                            }
                                            <Button onClick={() => getSingleSensor(item.uid)} squared><i className="material-icons">&#xe3c9;</i></Button>
                                            <Button onClick={() => confirmDelete(item.uid)} squared theme="danger"><i className="material-icons">&#xe872;</i></Button>
                                        </ButtonGroup>
                                    </td>
                                </tr>
                            )
                        })
                    }
                </tbody>
            </table>
            {
                SingleSensor.map((item)=>(
                    <Modal size="lg" centered show={toggle} >
                                <Modal.Header>

                                    <h6 className="m-0">{t('edit_farm')}</h6>{" "}

                                    <div
                                        style={{
                                            display: "flex",
                                            justifyContent: "flex-end",

                                        }}
                                    >
                                        <Button
                                            // theme="success"
                                            className="mb-2 mr-1 btn btn-success"
                                            onClick={() => handleEdit(item.uid)}
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
                                        <Col lg="4" md="12" sm="12" className="form-group">
                                        <p style={{ margin: "0px" }}>{t('sensor_code')}</p>
                                        <FormInput
                                                key={item.id}
                                                placeholder={t('sensor_code')}
                                                value={code} 
                                                onChange={(e) => setCode(e.target.value)}
                                                className={`${codeErr ? 'is-invalid' : ""}`}

                                            />
                                            <div className="invalid-feedback" style={{textAlign: "left"}}>{codeErr}</div>

                                        </Col>
                                        <Col lg="4" md="12" sm="12" className="form-group">
                                        <p style={{ margin: "0px" }}>{t('name_field')}</p>
                                        <FormSelect
                                                key={item.id}
                                                placeholder={t('name_field')}
                                                value={fieldId} 
                                                onChange={(e) => setField(e.target.value)}

                                            >
                                             <option value="">{t('select_field')}</option>

                                                {
                                                    fields.map(field=>{
                                                        return(
                                                            <option value={field.id}>{field.name}</option>
                                                        )
                                                    })
                                                }
                                        </FormSelect>
                                        </Col>
                                        <Col lg="4" md="12" sm="12" className="form-group">
                                        <p style={{ margin: "0px" }}>{t('name_zone')}</p>
                                        <FormSelect
                                                key={item.id}
                                                placeholder={t('name_zone')}
                                                value={zoneUid} 
                                                onChange={(e) => setZone(e.target.value)}

                                            >
                                                <option value="">{t('select_zone')}</option>

                                                {
                                                    
                                                    zones.map(zone=>{
                                                    
                                                        return(
                                                            <option value={zone.id}>{zone.name}</option>

                                                        )
                                                    })
                                                }
                                            </FormSelect>
                                        </Col>
                                    </Row>
                                    <FormGroup>
                                        <p style={{ margin: "0px" }}>{t('desc')}</p>
                                        <textarea
                                        value={description}
                                        style={{ height: "220px" }}
                                        class="form-control"
                                        placeholder={t('desc')}
                                        
                                        ></textarea>
                                    </FormGroup>
                                    </Form>
                                
                                </Modal.Body>
                            </Modal>

                ))
            }
    </>
  )
}

export default SensorList