import React,{useState,useEffect} from 'react'
import {Container,Row,Col,Card,Button,Form} from "react-bootstrap";
import PageTitle from "../components/common/PageTitle";
import api from '../api/api'
import  Html5QrcodePlugin  from "../views/Html5QrcodePlugin";
import { useTranslation } from "react-i18next";
import swal from 'sweetalert';

const AddEquipmentByAdmin = () => {
    const { t, i18n } = useTranslation();

    const [msgServer,setMsg] = useState("")

    const [classMsg , setCmsg] = useState("")
    const [displayMsg , setDispMsg] = useState("hide")
    const [iconMsg,setIconMsg]=useState("info")

    const [resultScan,setResultScan] = useState('')
    const [name,setName] = useState('')

    const [codeError, setcodeErr] = useState("");




    const onNewScanResult = (decodedText, decodedResult) => {
      setResultScan(decodedText)
      
      // Handle the result here.
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
       }
       api.post('/admin/add-equipment',data)
       .then( response =>  {
         if(response.data.type === 'success'){
           swal(`${t('Equipment added')}`, {
               icon: "success",
           })
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
  }



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
          <Card.Header className="border-bottom">
          <div
            style={{
              display: "flex",
              justifyContent: "flex-start",
              flexWrap:"wrap",
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
              gap:"10px"
              
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
          </Card.Header>
          <Card.Body className="pt-0">
            <div
              style={{
                display: "flex",
                marginTop: "20px",
                flexWrap: "wrap",
                gap:"20px"
              }}
            >
              <Col lg="5" sm="12" md="6">
                <Form>
                  <Row form className='gap-4'>
                  <Col lg="5" md="12" sm="12" className="form-group">
                  <p style={{ margin: "0px" }}>{t('Equipment name')}</p>
                      <Form.Control
                            placeholder={t('Equipment name')}
                            required
                            value={name}
                            onChange={(e)=> setName(e.target.value)}
                          />
                    </Col>
                    <Col md="6" className="form-group">
                      <p style={{ margin: "0px" }}>{t('Equipment code')}</p>
                      <Form.Control
                            placeholder={t('Equipment code')}
                            required
                            value={resultScan}
                            onChange={(e)=> setResultScan(e.target.value)}
                            className={`form-control ${codeError ? 'is-invalid' : ""}`}

                          />
                           <div className="invalid-feedback">{codeError}</div>

                    </Col>
                  </Row>
                  <Form.Group>
                    <p style={{ margin: "0px" }}>{t('desc')}</p>
                    <textarea
                      style={{ height: "220px" }}
                      class="form-control"
                      placeholder={t('desc')}
                      onChange={(e)=>{}}
                    ></textarea>
                  </Form.Group>
                </Form>
              </Col>
              <Col lg="6" md="12" sm="12" className="mb-4">
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
          </Card.Body>
        </Card>
      </Col>
    </Row>
  </Container>
    
    </>
  )
}

export default AddEquipmentByAdmin