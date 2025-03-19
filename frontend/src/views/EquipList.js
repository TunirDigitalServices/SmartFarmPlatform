import React,{useEffect,useState} from 'react'
import {Container,Row,Col,Card,CardBody,CardHeader,Button,Form,FormInput,FormGroup,FormSelect,ButtonGroup,Modal,ModalBody,ModalHeader} from "shards-react";
import { useTranslation } from "react-i18next";
import swal from 'sweetalert';
import  Html5QrcodePlugin  from "./Html5QrcodePlugin";
import PageTitle from "../components/common/PageTitle";
import api from '../api/api'


const EquipList = ({equipments,getEquipments,farms}) => {
    const { t, i18n } = useTranslation();
    let userUid = JSON.parse(localStorage.getItem('user')).id;

    const [toggle, setToggle] = useState(false);
    const [msgServer,setMsg] = useState("")
    const [codeError, setcodeErr] = useState("");

    const [classMsg , setCmsg] = useState("")
    const [displayMsg , setDispMsg] = useState("hide")
    const [iconMsg,setIconMsg]=useState("info")
    const [SingleEquipment, setSingleEquipment] = useState([]);

    const [resultScan,setResultScan] = useState('')
    const [name,setName] = useState('')
    const [farmUid,setFarmUid] = useState('')

    
    const onNewScanResult = (decodedText, decodedResult) => {
        setResultScan(decodedText)
        
        // Handle the result here.
      }

    const getSingleEquipment = async (equipmentUid) => {

        let data = {
            equipment_uid: equipmentUid,
        }

        await api.post('/equipment/single-equipment', data)
            .then(response => {
                let equips = response.data.equipments;
                if (response.data.type === "success") {
                    setSingleEquipment(equips)
                    setName(equips.name)
                    setResultScan(equips.code)
                }
            }).catch(err => {
                console.log(err)
            })
        setToggle(!toggle)
    }
  
  const handleEdit = (EquipUid) => {

    let data = {
        name:name,
        code: resultScan,
        user_uid : userUid,
        equipment_uid: EquipUid
    }

    let isValid = isValidate()

    if (isValid) {
  
        api.post('/equipment/edit-equipment', data)
            .then(response => {
                if (response.data.type == "success") {
                    swal(`${t('equipment_updated')}`, {
                        icon: "success",
                    });
                    setToggle(false)
                    getEquipments();
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

const handleDelete = async equipUid => {
    let data = {
      equipment_uid: equipUid,
    }
    await api.delete('/equipment/delete-equipment', { data: data })
        .then(response => {
            if (response.data.type && response.data.type == "danger") {
                swal({
                    title: `${t('cannot_delete')}`,
                    icon: "warning",
                });
            }
            if (response.data.type == "success") {
                getEquipments()
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

const confirmDelete = equipUid => {

    swal({
        title: `${t('are_you_sure')}`,
        text: `${t('confirm_delete')}`,
        icon: "warning",
        buttons: true,
        dangerMode: true,
    })
        .then((Delete) => {
            if (Delete) {
                handleDelete(equipUid)
                swal(`${t('delete_success_equipment')}`, {
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
const isValidate = () => {
    let codeErr = ''
    if (!resultScan || resultScan === '') {
        codeErr = 'Cannot be empty'
        setcodeErr(codeErr)
        return false
    }
    return true
}

    return (
   <>
                       <table className="table mb-0 text-center">
                <thead className="bg-light">
                    <tr>
                        <th scope="col" className="border-0">{t('Equipment code')}</th>
                        <th scope="col" className="border-0">{t('Equipment name')}</th>
                        <th scope="col" className="border-0"></th>

                    </tr>
                </thead>
                <tbody>
                                {
                                  equipments.map(equip=>{
                                    return (

                                      <tr>
                                          <td>{equip.code}</td>
                                          <td>{equip.name}</td>                                          
                                          <td>
                                              <ButtonGroup size="sm" className="mr-2">
                                                  <Button onClick={() => getSingleEquipment(equip.uid)} squared><i className="material-icons">&#xe3c9;</i></Button>
                                                  <Button onClick={() => confirmDelete(equip.uid)} squared theme="danger"><i className="material-icons">&#xe872;</i></Button>
                                              </ButtonGroup>
                                          </td>
                                      </tr>
           
                                    )
                                  })

                                }
                </tbody>
            </table>
            <Modal style={{position:"absolute"}} centered={true} open={toggle} >
                <ModalHeader closeAriaLabel>
                    <h6 className="m-0">{t('Edit equipment')}</h6>{" "}
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "flex-end",

                        }}
                    >
                        <Button
                            // theme="success"
                            className="mb-2 mr-1 btn btn-success"
                            onClick={() => handleEdit(SingleEquipment.uid)}
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
                </ModalHeader>
                <ModalBody>
                <div
              style={{
                display: "flex",
                marginTop: "20px",
                flexWrap: "wrap"
              }}
            >
              <Col lg="12" sm="12" md="6">
                <Form>
                  <Row form>
                  <Col lg="12" md="12" sm="12" className="form-group">
                  <p style={{ margin: "0px" }}>{t('Equipment name')}</p>
                      <FormInput
                            placeholder={t('Equipment name')}
                            required
                            value={name}
                            onChange={(e)=> setName(e.target.value)}
                          />
                    </Col>
                    <Col md="6" className="form-group">
                      <p style={{ margin: "0px" }}>{t('Equipment code')}</p>
                      <FormInput
                            placeholder={t('Equipment code')}
                            required
                            value={resultScan}
                            onChange={(e)=> setResultScan(e.target.value)}
                            className={`form-control ${codeError ? 'is-invalid' : ""}`}

                          />
                           <div className="invalid-feedback">{codeError}</div>

                    </Col>
                    <Col lg="6" md="6" className="form-group">
                      <p style={{ margin: "0px" }}>{t('Farm')}</p>
                      <FormSelect
                            placeholder={t('Farm')}
                            required
                            value={farmUid}
                            onChange={(e)=> setFarmUid(e.target.value)}

                          >
                             <option>{t('select_farm')}</option>

                            {
                              farms.map(farm=>{
                               return <option value={farm.uid}>{farm.name}</option>

                              })
                            }

                          </FormSelect>
                    </Col>
                    <Col lg="6" md="6" className="form-group">
                      <p style={{ margin: "0px" }}>{t('Relays')}</p>
                            <FormInput 
                              placeholder='Relays'
                            />
                    </Col>
                  </Row>
                  <FormGroup>
                    <p style={{ margin: "0px" }}>{t('desc')}</p>
                    <textarea
                      style={{ height: "220px" }}
                      class="form-control"
                      placeholder={t('desc')}
                      onChange={(e)=>{}}
                    ></textarea>
                  </FormGroup>
                </Form>
              </Col>
            </div>
                </ModalBody>
            </Modal>
   </>

  )
}

export default EquipList