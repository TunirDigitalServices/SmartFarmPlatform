import React, { useState, useEffect } from 'react'
import { Container, Row, Col, Card, Button, Form, ButtonGroup } from "react-bootstrap";
import PageTitle from "../components/common/PageTitle";
import api from '../api/api'
import { useTranslation } from "react-i18next";
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import swal from 'sweetalert';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import { FormControl, IconButton, InputAdornment, InputLabel, OutlinedInput, TextField } from '@mui/material';
// import LoadingSpinner from '../components/common/LoadingSpinner';


const SensorSettings = (props) => {
  // const { lastDataTime, formattedTime, sensorState } = props.location;

  const params = useParams()
  //   let id = params.id
  const { t, i18n } = useTranslation();
  const navigate = useNavigate()
  const location = useLocation();
  // const { lastDataTime, formattedTime, sensorState } = location.state;
  const [settingValues, setSettingValues] = useState([])
  const [frequency, setFrequency] = useState('')
  const [dateSetting, setDateSetting] = useState([])
  const [minSetting, setMinSetting] = useState({})
  const [maxSetting, setMaxSetting] = useState({})
  const [simSettings, setSimSettings] = useState({
    simNumber: "",
    simIdentify: ""
  })
  const [formValid, setFormValid] = useState(false);
  const [showScan, setShowScan] = useState(false)
  const [resultScan, setResultScan] = useState('')
  const [extranelToken, setExtranelToken] = useState('')
  const [rowsData, setRowsData] = useState([
    { Mv1: '', Mv2: '', Mv3: '' },

  ])
  const [sensorCoords, setSensorCoords] = useState({
    lat: '',
    lon: '',
    locationInfo: {}
  })
  //   const addTableRows = () => {
  //     setRowsData([...rowsData, { id: '' }])

  //   }

  const deleteTableRows = (index, e) => {
    console.log(index)
    setRowsData(rowsData.filter((data, i) => {
      return i !== index
    })
    )
  }

  const onNewScanResult = (decodedText, decodedResult) => {
    setResultScan(decodedText)

    // Handle the result here.
  }
  const [sensorData, setSensorData] = useState([]);
  const [sensorId, setSensorId] = useState(null)

  const fetchDataSensors = () => {
    api.get(`/sensor/sensors`)
      .then(response => {
        let sensorData = response.data;
        setSensorData(sensorData);

      }).catch(error => {
        console.log(error)
      })
  };

  const getSingleSensor = async (id) => {
    if (id) {
      await api.get(`/sensor/single-sensor/${id}`)
        .then(res => {
          let SensorData = res.data.sensor
          let SensorLocation = res.data.location
          let userSupplier = res.data.user
          setResultScan(SensorData.code)
          setSensorCoords({ lat: SensorData.Latitude, lon: SensorData.Longitude, locationInfo: SensorLocation })
          setSensorId(id)
          let dataMapping = SensorData.dataMapping
          if (dataMapping.length > 0) {
            setSettingValues(dataMapping)
            dataMapping.map(data => {
              let frequency = data.frequency
              setFrequency(frequency)
              setSimSettings({ simIdentify: data.simIdentify, simNumber: data.simNumber })
              console.log(data)
              setDateSetting(data.date)
              setMinSetting(data.min)
              setMaxSetting(data.max)

            })
            // dataArray.push({date : data.date, min : data.min, max : data.max})

          }


          if (userSupplier != null) {
            setExtranelToken(userSupplier.external_api_token)
          }
        }).catch(error => {
          swal({
            title: "Error",
            icon: "error",

          });

        })

    }
  }


  useEffect(() => {
    fetchDataSensors()
  }, [])

  useEffect(() => {
    getSingleSensor()

  }, [sensorId])


  const validateForm = () => {
    // Check if the sensor code, frequency, and date inputs are not empty
    const isCodeValid = resultScan.trim() !== "";
    const isFrequencyValid = frequency.trim() !== "";

    // Update the form validation status
    setFormValid(isCodeValid && isFrequencyValid);
  };

  useEffect(() => {
    validateForm();
  }, [resultScan, frequency, dateSetting]);


  const editSensor = () => {
    if (sensorId) {
      let data = {
        sensor_id: sensorId,
        code: resultScan,
        dataMapping: settingValues,
        frequency: frequency,
        lat: sensorCoords.lat,
        lon: sensorCoords.lon
      }
      if (formValid) {
        api.post('/sensor/edit-mapping', data)
          .then(response => {
            if (response.data.type === 'success') {
              swal(`${t('sensor_added')}`, {
                icon: "success",
              })
              getSingleSensor()
              setSensorId(null)
            }
          }).catch(err => {
            swal({
              icon: 'error',
              title: 'Oops...',
              text: 'Error'
            })
          })

      } else {
        swal({
          icon: "error",
          title: "Error",
          text: "Please fill in all required fields.",
        });
      }
    }
  }

  let niv = ['Mv1', 'Mv2', 'Mv3']

  const onChangeHandlerDate = (value, name, label) => {

    setDateSetting(state => ({ ...state, [`${name}_${label}`]: value }), [])
  }
  const onChangeHandlerMax = (value, name, label) => {
    setMaxSetting(state => ({ ...state, [`${name}_${label}`]: value }), [])
  }
  const onChangeHandlerMin = (value, name, label) => {
    setMinSetting(state => ({ ...state, [`${name}_${label}`]: value }), [])
  }

  useEffect(() => {
    let dataArray = []
    dataArray.push({ date: dateSetting, min: minSetting, max: maxSetting })
    setSettingValues(dataArray)
  }, [dateSetting, minSetting, maxSetting])



  const Items = () => {
    let element = []

    for (let index = 0; index < niv.length; index++) {
      element.push(
        <tbody>
          {/* {
                      rowsData.map((item,indx)=>{ */}
          {/* return ( */}
          <tr>
            <td>{niv[index]}</td>
            <td>
              <input
                name={'date'}
                style={{ minHeight: 32, marginRight: 5, outline: 'none', border: '1px solid #e4e4e4' }}
                key={index}
                type="date"
                required
                //  value={dateSetting.index}
                value={(dateSetting != null && typeof dateSetting[`Mv${index + 1}_date`] !== 'undefined') ? dateSetting[`Mv${index + 1}_date`] : ""}
                onChange={e => onChangeHandlerDate(e.target.value, niv[index], 'date')}
              />
            </td>
            <td>
              <input
                name={'min'}
                style={{ minHeight: 32, marginRight: 5, outline: 'none', border: '1px solid #e4e4e4' }}
                key={index}
                // value={minSetting.indx}
                value={(minSetting != null && typeof minSetting[`Mv${index + 1}_min`] !== 'undefined') ? minSetting[`Mv${index + 1}_min`] : ""}
                onChange={e => onChangeHandlerMin(e.target.value, niv[index], "min")}

              />
            </td>
            <td>
              <input
                name={'max'}
                style={{ minHeight: 32, marginRight: 5, outline: 'none', border: '1px solid #e4e4e4' }}
                key={index}
                // value={maxSetting.indx}
                value={(maxSetting != null && typeof maxSetting[`Mv${index + 1}_max`] !== 'undefined') ? maxSetting[`Mv${index + 1}_max`] : ""}
                onChange={e => onChangeHandlerMax(e.target.value, niv[index], "max")}

              />
            </td>
          </tr>


          {/* //   })
                    // } */}

        </tbody>

      )

    }
    return element
  }



  return (
    <Container fluid className="main-content-container px-4">
      {/* Page Header */}
      <Row noGutters className="page-header py-4 d-flex justify-content-between align-items-center">
        <PageTitle
          sm="4"
          title={t('edit_sensor')}
          subtitle={t('edit_sensor')}
          className="text-sm-left"
        />
        {/* <div>
          <Button title="Historique" onClick={() => { history.push(`/my-history/${resultScan}`) }} squared theme="info"><i className="material-icons">&#xe889;</i> View History</Button>

        </div> */}
      </Row>
      <Row>
        <Col lg='12' md='12' sm='12'>
          <table className="bg-light table mb-0 text-center table-bordered table-responsive-lg ">
            <thead className="bg-light">
              <tr>

                <th scope="col" className="border-0">{t('sensor_code')}</th>
                <th scope="col" className="border-0">{t('Actions')}</th>

              </tr>
            </thead>
            <tbody>
              {
                sensorData.map((item, indx) => {
                  return (

                    <tr>
                      <td>{item.code}</td>

                      <td>
                        <ButtonGroup size="sm" className="mr-2">
                          {/* {
                                                        item.synchronized === "0"
                                                        ?
                                                        <Button onClick={() => fetchDataSensor(item.uid,item.code)} squared theme="info"><i className='material-icons'>&#xe627;</i></Button>
                                                        :
                                                        null
                                                    } */}
                          <Button onClick={() => getSingleSensor(item.id)} squared><i className="material-icons">&#xe3c9;</i></Button>
                          <Button title="History" onClick={() => { navigate(`/my-history/${item.code}`) }} squared variant="info"><i className="material-icons">&#xe889;</i></Button>

                          {/* <Button onClick={() => confirmDelete(item.uid)} squared theme="danger"><i className="material-icons">&#xe872;</i></Button> */}
                        </ButtonGroup>
                      </td>
                    </tr>
                  )
                })
              }
            </tbody>
          </table>

        </Col>

      </Row>

      {
        sensorId && (
          <Row className='py-4'>
            <Col lg="12" md="8" sm="12" className="mb-4">
              <Card small className="h-100">
                <Card.Header className="border-bottom">
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
gap:"10px",
                      alignItems:"center"
                    }}
                  >
                    <Button
                      // theme="success"
                      onClick={editSensor}
                      className="mb-2 mr-1 btn btn-success"
                    >
                      <i class={`fa fa-check mx-2`}></i>
                      {t('save')}
                    </Button>
                    <Button
                      // theme="success"
                      className="mb-2 mr-1 btn btn-danger"
                      onClick={() => setSensorId(null)}

                    >
                      <i class={`fa fa-times mx-2`}></i>
                      {t('cancel')}
                    </Button>
                  </div>
                </Card.Header>
                <Card.Body className="pt-0 px-1">
                  <Row className="p-2">
                    <Col lg="8" sm="12" md="12">
                      <Form>
                        <Row form>
                          <Col lg="6" md="12" sm="12" className="form-group">
                            <FormControl sx={{ m: 1, width: '25ch' }} variant="outlined" size='small'>
                              <InputLabel htmlFor="outlined-adornment-password">{t('sensor_code')}</InputLabel>
                              <OutlinedInput
                                id="outlined-adornment-password"
                                type='text'
                                placeholder={t('sensor_code')}
                                value={resultScan}
                                endAdornment={
                                  <InputAdornment position="end">
                                    <IconButton
                                      aria-label="toggle password visibility"
                                      edge="end"
                                    >
                                      <QrCodeScannerIcon />
                                    </IconButton>
                                  </InputAdornment>
                                }
                                label={t('sensor_code')}
                              />
                            </FormControl>
                          </Col>
                          <Col lg="6" md="12" sm="12" className="form-group">
                            <FormControl sx={{ m: 1, width: '25ch' }} variant="outlined" size='small'>
                              <InputLabel htmlFor="outlined-adornment-password">{t('Frequency')}</InputLabel>
                              <OutlinedInput
                                id="outlined-adornment-password"
                                type='text'
                                placeholder={t('Frequency')}
                                value={frequency}
                                onChange={e => { setFrequency(e.target.value) }}
                                label={t('Frequency')}
                              />
                            </FormControl>
                          </Col>
                        </Row>
                        <Row form>
                          <Col lg="6" md="12" sm="12" className="form-group">
                            <FormControl sx={{ m: 1, width: '25ch' }} variant="outlined" size='small'>
                              <InputLabel htmlFor="outlined-adornment-password">{t('lat')}</InputLabel>
                              <OutlinedInput
                                id="outlined-adornment-password"
                                type='text'
                                placeholder={t('lat')}
                                value={sensorCoords.lat}
                                onChange={e => setSensorCoords({ ...sensorCoords, lat: e.target.value })}
                                label={t('lat')}
                              />
                            </FormControl>
                          </Col>
                          <Col lg="6" md="12" sm="12" className="form-group">
                            <FormControl sx={{ m: 1, width: '25ch' }} variant="outlined" size='small'>
                              <InputLabel htmlFor="outlined-adornment-password">{t('lon')}</InputLabel>
                              <OutlinedInput
                                id="outlined-adornment-password"
                                type='text'
                                placeholder={t('lon')}
                                value={sensorCoords.lon}
                                onChange={e => setSensorCoords({ ...sensorCoords, lon: e.target.value })}
                                label={t('lon')}
                              />
                            </FormControl>
                          </Col>
                        </Row>
                        <Row form>
                          <Col lg="12" md="12" sm="12">
                            <table className="table mb-0 border text-center  table-responsive-lg">
                              <thead className="bg-light">
                                <tr>
                                  {/* <th scope="col" className="border-0">
                                    <div className='d-flex justify-content-center align-items-center'>
                                    <Button style={{ outline: 'none', border: 'none', background: 'transparent' }} onClick={() => addTableRows()}><i style={{ fontSize: 20, color: "#27A6B7" }} className='material-icons'>&#xe147;</i></Button>
                                    <Button style={{ outline: 'none', border: 'none', background: 'transparent' }} onClick={(e) => deleteTableRows(1, e)}><i style={{ fontSize: 20, color: "#27A6B7" }} className="material-icons">&#xe872;</i></Button>
                                    </div>
                                </th> */}
                                  <th scope="col" className="border-0">{t('Date')}</th>
                                  <th scope="col" className="border-0">{t('Min')} (%)</th>
                                  <th scope="col" className="border-0">{t('Max')} (%)</th>
                                </tr>
                              </thead>

                              {Items()}

                            </table>

                          </Col>

                        </Row>

                      </Form>
                    </Col>
                    <Col lg="4" md="12" sm="12" className="mt-1">
                      {/* <table className="table mb-0 border text-center  table-responsive-lg">
                            <thead className="bg-light">
                            <tr>
    
                                <th scope="col" className="border-0">{t('statu')}</th>
                                <th scope="col" className="border-0">{t('last_reading')}</th>
                                <th scope="col" className="border-0">{t('expected')}</th>
                            </tr>
                            </thead>
                            <tbody>
    
                            <tr>
                                <td style={{ color: sensorState === 'Active' ? 'green' : 'red', fontSize: 13, fontWeight: 'bold' }}>
                                {sensorState }
                                </td>
                                <td style={{ fontSize: 11.5, fontWeight: 'bold' }}>
                                {lastDataTime}
                                </td>
                                <td style={{ fontSize: 11.5, fontWeight: 'bold' }}>
                                {formattedTime}
                                </td>
                            </tr>
    
    
    
                            </tbody>
    
                        </table> */}
                      <table className="table mb-0 border text-center mt-2  table-responsive-lg">
                        <thead className="bg-light">
                          <tr>

                            <th scope="col" className="border-0">{t('Timezone')}</th>
                            <th scope="col" className="border-0">{t('Location')}</th>
                            <th scope="col" className="border-0">{t('Link to map')}</th>
                          </tr>
                        </thead>
                        <tbody>

                          <tr>
                            <td>
                              GMT +{sensorCoords.locationInfo.offset}
                            </td>
                            <td>
                              {sensorCoords.locationInfo.timezone_id}
                            </td>
                            <td>
                              <a href={sensorCoords.locationInfo.map_url} target="_blank" rel="noopener noreferrer">View position</a>
                            </td>
                          </tr>



                        </tbody>

                      </table>
                    </Col>

                  </Row>
                </Card.Body>
              </Card>
            </Col>
          </Row>

        )

      }
    </Container>
  )
}

export default SensorSettings