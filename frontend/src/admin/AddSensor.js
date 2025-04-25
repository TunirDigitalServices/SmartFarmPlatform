import React ,{ useState ,useEffect} from 'react'
import {Container,Row,Col,Card,CardBody,CardHeader,Button,Form,FormInput,FormGroup,FormSelect} from "shards-react";
import PageTitle from "../components/common/PageTitle";
import api from '../api/api'
import { useTranslation  } from "react-i18next";
import  Html5QrcodePlugin  from "../views/Html5QrcodePlugin";
import { useHistory } from 'react-router-dom';
import swal from 'sweetalert';

const AddSensorByAdmin = () => {

    const { t, i18n } = useTranslation();
    const history = useHistory()
    const [settingValues, setSettingValues] = useState({})
    const [frequency,setFrequency] = useState('')
    const [dateSetting, setDateSetting] = useState({})
    const [minSetting, setMinSetting] = useState({})
    const [maxSetting, setMaxSetting] = useState({})
    const [simSettings,setSimSettings] = useState({
      simNumber : "",
      simIdentify : ""
    }) 
    const [resultScan,setResultScan] = useState('')
    const [formValid, setFormValid] = useState(false);

   const onNewScanResult = (decodedText, decodedResult) => {
        setResultScan(decodedText)
        
        // Handle the result here.
      }
      const validateForm = () => {
        // Check if the sensor code, frequency, and date inputs are not empty
        const isCodeValid = resultScan.trim() !== "";
        const isFrequencyValid = frequency.trim() !== "";

        // Update the form validation status
        setFormValid(isCodeValid && isFrequencyValid);
      };  

      useEffect(() => {
        validateForm();
      }, [resultScan, frequency]);
      
      const addNewSensor = () =>{
       let data = {
            code :resultScan,
            dataMapping : settingValues,
            frequency :frequency,
            simNumber : simSettings.simNumber,
            simIdentify : simSettings.simIdentify
        }
        if(formValid){
          api.post('/admin/add-sensor',data)
          .then( response =>  {
            if(response.data.type === 'success'){
              swal(`${t('sensor_added')}`, {
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
          })

        }else{
          swal({
            icon: "error",
            title: "Error",
            text: "Please fill in all required fields.",
          });
        }
      }

      const resetForm = () => {
        setTimeout(()=>{
          setFrequency("")
          setResultScan('')
          setSimSettings({simIdentify :"" , simNumber :""})
        },1500)
      }

      let niv = ['Mv1','Mv2','Mv3']

      const onChangeHandlerDate = (value,name,label) => {
        setDateSetting(state => ({ ...state, [`${name}_${label}`] : value }), [])

    }
    const onChangeHandlerMax = (value,name,label) => {
        setMaxSetting(state => ({ ...state, [`${name}_${label}`] : value}), [])

    }
    const onChangeHandlerMin = (value,name,label) => {
        setMinSetting(state => ({ ...state, [`${name}_${label}`] : value }), [])

    }

    useEffect(()=>{
      let dataArray = []
          dataArray.push({date : dateSetting, min : minSetting, max : maxSetting})
          setSettingValues(dataArray)
  },[dateSetting,minSetting,maxSetting])

      const Items = () => {    
      let element = []
      for (let index = 0; index < niv.length; index++) {
              element.push(
                  <tbody>
                  <tr>
                    <td>{niv[index]}</td>
                      <td>
                          <input 
                           name={'date'}
                           style={{ minHeight: 32, marginRight: 5, outline: 'none', border: '1px solid #e4e4e4' }}
                           key={index}
                           type="date"
                           value={dateSetting.index}
                           onChange={e => onChangeHandlerDate(e.target.value,niv[index],'date')}
                          />
                      </td>          
                      <td>
                          <input 
                           name={'min'}
                           style={{ minHeight: 32, marginRight: 5, outline: 'none', border: '1px solid #e4e4e4' }}
                           key={index}
                           value={minSetting.index}
                           onChange={e => onChangeHandlerMin(e.target.value,niv[index],"min")}

                          />
                      </td>
                      <td>
                          <input 
                           name={'max'}
                           style={{ minHeight: 32, marginRight: 5, outline: 'none', border: '1px solid #e4e4e4' }}
                           key={index}
                           value={maxSetting.index}
                           onChange={e => onChangeHandlerMax(e.target.value,niv[index],"max")}

                          />
                      </td>     
               </tr>



               </tbody>
                  
              )
          
      }
      return element
  }

  return (
    <Container fluid className="main-content-container px-4">
    {/* Page Header */}
    <Row noGutters className="page-header py-4">
      <PageTitle
        sm="4"
        title={t('add_sensor')}
        subtitle={t('add_sensor')}
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
            <h6 className="m-0">{t('sensor_setup')}</h6>{" "}
            </div>
            <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              
            }}
          >
            <Button
              // theme="success"
              onClick={addNewSensor}
              className="mb-2 mr-1 btn btn-success"
            >
              <i class={`fa fa-check mx-2`}></i>
              {t('save')}
            </Button>
            <Button
              // theme="success"
              className="mb-2 mr-1 btn btn-danger"
              onClick={() => history.push('/admin/sensors')}

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
              <Col lg="8" sm="12" md="6">
                <Form>
                  <Row form>
                    <Col lg="6" md="12" sm="12" className="form-group">
                      <p style={{ margin: "0px" }}>{t('sensor_code')}</p>
                      <FormInput
                            placeholder={t('sensor_code')}
                            value={resultScan}
                            onChange={e=> setResultScan(e.target.value)}
                            required

                          />
                    </Col>
                    <Col lg="6" md="12" sm="12" className="form-group">
                      <p style={{ margin: "0px" }}>{t('Frequency')}</p>
                      <FormInput
                            placeholder={t('Frequency')}
                            value={frequency}
                            onChange={e=> {setFrequency(e.target.value)}}
                            required
                          />
                    </Col>
                  </Row>
                  <Row>
                  <Col lg="6" md="12" sm="12" className="form-group">
                      <p style={{ margin: "0px" }}>{t('SIM card number (MSISDN)')}</p>
                      <FormInput
                            placeholder={t('SIM card number')}
                            value={simSettings.simNumber}
                            onChange={e=> setSimSettings({...simSettings,simNumber : e.target.value})}
                            required
                          />
                    </Col>
                    <Col lg="6" md="12" sm="12" className="form-group">
                      <p style={{ margin: "0px" }}>{t('SIM Card identifier (ICCID)')}</p>
                      <FormInput
                            placeholder={t('SIM Card identifier')}
                            value={simSettings.simIdentify}
                            onChange={e=> setSimSettings({...simSettings,simIdentify : e.target.value})}
                            required
                          />
                    </Col>
                  </Row>
                  <Row>
                  <table className="table mb-0 border text-center  table-responsive-lg">
                                    <thead className="bg-light">
                                        <tr>
                                          <th scope="col" className="border-0">{t('')}</th>
                                            <th scope="col" className="border-0">{t('Date')}</th>
                                            <th scope="col" className="border-0">{t('Min')} (%)</th>
                                            <th scope="col" className="border-0">{t('Max')} (%)</th>
                                        </tr>
                                    </thead>
     
                                         {Items()}
                                        
                                </table>                                        

                  </Row>

                </Form>
              </Col>
              <Col lg="4" md="12" sm="12" className="mb-4">
              <div>
            <h3>{t('scan_qrcode_sensor')}</h3>
                <Html5QrcodePlugin 
                  fps={10}
                  qrbox={250}
                  disableFlip={true}
                  rememberLastUsedCamera={false}
                  qrCodeSuccessCallback={onNewScanResult}
                  
                  />
              </div>
              </Col>
            </div>
          </CardBody>
        </Card>
      </Col>
    </Row>
  </Container>
  )
}

export default AddSensorByAdmin