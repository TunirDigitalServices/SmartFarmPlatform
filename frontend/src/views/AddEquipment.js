import React,{useState,useEffect,useCallback} from 'react'
import {Container,Row,Col,Card,CardBody,CardHeader,Button,Form,FormInput,FormGroup,FormSelect,ButtonGroup,Modal,ModalBody,ModalHeader} from "shards-react";
import PageTitle from "../components/common/PageTitle";
import api from '../api/api'
import  Html5QrcodePlugin  from "./Html5QrcodePlugin";
import { useTranslation } from "react-i18next";
import swal from 'sweetalert';
import EquipList from './EquipList';

const AddEquipment = () => {
    const { t, i18n } = useTranslation();
    let userUid = JSON.parse(localStorage.getItem('user')).id;
    const [equipments,setEquipments] = useState([])
    const [toggle, setToggle] = useState(false);

    const [nameRelay,setNameRelay] = useState({})
  
    const [msgServer,setMsg] = useState("")

    const [classMsg , setCmsg] = useState("")
    const [displayMsg , setDispMsg] = useState("hide")
    const [iconMsg,setIconMsg]=useState("info")

    const [resultScan,setResultScan] = useState('')
    const [name,setName] = useState('')
    const [relays,setRelays] = useState('')
    const [farmUid,setFarmUid] = useState('')

    const [codeError, setcodeErr] = useState("");


    const [farms,setFarms] = useState([])


    const onNewScanResult = (decodedText, decodedResult) => {
      setResultScan(decodedText)
      
      // Handle the result here.
    }

    const getFarms = async () =>{
      await api.get('/farm/farms')
      .then(res =>{
        let DataFarm = res.data.farms;
        setFarms(DataFarm);        
      }).catch(err=>{
        console.log(err)
      })
    }
      useEffect(()=>{
        getFarms()
        getEquipments()
      },[])


      const getEquipments = async () =>{
        await api.get('/equipment/equipments')
        .then(response=>{
          let equips = response.data
          setEquipments(equips)
        }).catch(err=>{
          console.log(err)
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

    const submitEquipment = () => {
        let isValid = isValidate()
        if (isValid) {
          addNewEquipment()
        }
    }

    const addNewEquipment = () =>{
      let data = {
          name :name,
          code :resultScan,
          nbr_relays :relays,
          farm_uid : farmUid,
          user_uid : userUid,
          port : inputs,
       }
       api.post('/equipment/add-equipment',data)
       .then( response =>  {
         if(response.data.type === 'success'){
           swal(`${t('Equipment added')}`, {
               icon: "success",
           })
           getEquipments()
           resetForm()
       }
       }).catch(err =>{
         swal({
           icon: 'error',
           title: 'Oops...',
           text: 'Error'
       })
       resetForm()
       })
     }

     const resetForm = () => {
      setResultScan('')
      setName('')
      setFarmUid('')
  }

  // const addRelays = () =>{
  //   let data = {
  //     name : nameRelay
  //   }

  //   if(relays && relays != 0){
  //     api.post('/relay/add-relay',data)
  //     .then(response =>{
  //       console.log(response)
  //     }).catch(error=>{
  //       console.log(error)
  //     })
  //   }

  // }


//   const showRelays = () => {
//     if (relays) {
//       Array(relays).fill(0).forEach((item) =>{
//         console.log(item + 1)
//       })
//       }
//     }
//  showRelays()

const [inputs, setInputs] = useState({});
const onChangeHandler = useCallback(
  ({target:{name,value}}) => setInputs(state => ({ ...state, [name]:value }), [])
);

 const loop = (relays, callback) => {
  const arr = []
  for(var i = 0; i < parseInt(relays); i++) {
    arr.push(
       <input
       name={i}
       key={i}
       className='my-1'
       value={inputs.i}
       onChange={onChangeHandler}
       placeholder='Relay Code'
       />    
    
      )

  }
  return arr

};


  return (
    <>
    <Container fluid className="main-content-container px-4">
    {/* Page Header */}
    <Row noGutters className="page-header py-4">
      <PageTitle
        sm="4"
        title={t('Add Equipment')}
        subtitle={t('Add Equipment')}
        className="text-sm-left"
      />
    </Row>

    <Row>
      <Col lg="12" md="8" sm="12" className="mb-4">
        <Card small className="h-100">
          <CardHeader className="border-bottom">
          <div
            style={{
              display: "flex",
              justifyContent: "flex-start",
              width: "auto",
              float: "left"
            }}
          >
            <h6 className="m-0">{t('Equipment setup')}</h6>{" "}
            </div>
            <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              
            }}
          >
            <Button
              // theme="success"
              className="mb-2 mr-1 btn btn-success"
              onClick={() => submitEquipment()}
            >
              <i class={`fa fa-check mx-2`}></i>
              {t('save')}
            </Button>
            <Button
              // theme="success"
              className="mb-2 mr-1 btn btn-danger"
            >
              <i class={`fa fa-times mx-2`}></i>
              {t('cancel')}
            </Button>
            </div>
          </CardHeader>
          <CardBody className="pt-0">
            <div
              style={{
                display: "flex",
                marginTop: "20px",
                flexWrap: "wrap"
              }}
            >
              <Col lg="4" sm="12" md="6">
                <Form>
                  <Row form>
                  <Col lg="6" md="12" sm="12" className="form-group">
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
                            value={relays}
                            onChange={(e) => setRelays(e.target.value)}
                              placeholder='Relays'
                            />
                    </Col>
                  </Row> 
                  <Row>
                    <Col>
                    <FormGroup  className='border p-2 my-2 d-flex flex-wrap justify-content-center'>
                    <p style={{ margin: "0px" }}>Relays Info</p>
                      {loop(relays)}
                       
            
                  </FormGroup>
                    
                    </Col>

                  </Row>
                </Form>
              </Col>
              <Col lg="8" md="12" sm="12" className="mb-4">
              <div>
            <h3>{t('scan qrcode Equipment')}</h3>
                <Html5QrcodePlugin 
                  fps={10}
                  qrbox={250}
                  disableFlip={true}
                  rememberLastUsedCamera={false}
                  qrCodeSuccessCallback={() => onNewScanResult()}
                  
                  />
              </div>
              </Col>
            </div>
          </CardBody>
        </Card>
      </Col>
    </Row>
    <Row noGutters className="page-header py-4">
                  <PageTitle
                    sm="4"
                    title={t('My Equipment')}
                    subtitle={t('My Equipment')}
                    className="text-sm-left"
                  />
          </Row>
          <Row>
              <Col lg="12" md="8" sm="12" className="mb-4">
                 <Card small>
                   <CardHeader>{t('Active Equipments')}</CardHeader>
                   <CardBody>
                        <EquipList farms={farms} equipments={equipments} getEquipments={getEquipments} />
                   </CardBody>
                 </Card>
              </Col>
          </Row>
        

  </Container>
    
    </>
  )
}

export default AddEquipment