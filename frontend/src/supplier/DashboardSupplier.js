import React , {useState,useEffect} from 'react'
import { Container, Row, Col, CardBody, Card,CardHeader,CardFooter,FormInput, Button } from "shards-react";
import PageTitle from "../components/common/PageTitle";
import { useTranslation } from 'react-i18next'
import LeafletMap from '../views/map';
import api from '../api/api';
import DBSensor from '../views/Sensor';
import moment from 'moment';
import { useHistory } from 'react-router-dom';
import img from '../images/avatars/default-avatar.png'
import useSensorData from '../utils/useSensorData';


const DashboardSupplier = () => {


  const { t, i18n } = useTranslation();
  const history = useHistory()
  let allDataSensor = useSensorData()

  const [users,setUsers] = useState([])
  const [farms,setFarms] = useState([])
  const [fields,setFields] = useState([])
  const [sensors,setSensors] = useState([])
  const [SearchName,setSearchName] = useState('')
  const [dataSensor,setDataSensor] = useState([])
  const [draw,setDraw] = useState({
    polygon: false,
    circle: false,
    rectangle: false,
    polyline: false,
    marker: false,
    circlemarker: false
  })
  const [mapConfig,setMapConfig] = useState({
    zoom:"",
    center:[],
    fromAction: false,
  })
  useEffect(()=>{
    // const getSensorsData = async () => {
    //   try {
    //     const response = await api.get('/supplier/get-sensors-data');
    //     console.log(response.data);
    // } catch (err) {
    //     console.error(err);
    // }

    // }
    const getMyUsers = async () => {
      await api.get('/supplier/get-users')
      .then(response =>{
          let usersList = response.data.users
          setUsers(usersList)
          let Fields = []
          let Sensors = []
          let allSensorData = []
          if(usersList.length > 0){
            usersList.map(data=>{
              let farmsList =  data.farms
              if(farmsList.length > 0){
                setFarms(farmsList)
                  farmsList.map(farm=>{
                    let fieldsList = farm.fields
                        if(fieldsList.length > 0){
                          fieldsList.map(field=>{
                            Fields.push({
                              id : field.id,
                              uid:field.uid,
                              farmId :field.farm_id,
                              name : field.name,
                              Latitude: field.Latitude,
                              Longitude: field.Longitude,
                              status :field.status
                            })
                            let sensorsList = field.sensors
                            if(sensorsList.length > 0){
                              sensorsList.map(sensor=>{
                                Sensors.push({
                                  id : sensor.id,
                                  fieldId :sensor.field_id,
                                  userId : sensor.user_id,
                                  code : sensor.code,
                                  Latitude: sensor.Latitude,
                                  Longitude: sensor.Longitude,
                                })
                                let sensorData = sensor.sensorsData
                                if(sensorData.length > 0) {
                                    allSensorData.push({
                                      id : sensorData[0].id,
                                      code: sensorData[0].code,
                                      sensor_id: sensorData[0].sensor_id,
                                      uid : sensorData[0].uid,
                                      time :sensorData[0].time,
                                      temperature :sensorData[0].temperature,
                                      humidity :sensorData[0].humidity,
                                      pressure :sensorData[0].pressure,
                                      charge :sensorData[0].charge,
                                      adc :sensorData[0].adc,
                                      ts :sensorData[0].ts,
                                      mv1 : sensorData[0].mv1,
                                      mv2 : sensorData[0].mv2,
                                      mv3 :sensorData[0].mv3,
                                      altitude :sensorData[0].altitude
                                    })

                                }
                              })
                            }
                          })
                        }

                  })
              }
              
            })
            setDataSensor(allSensorData)
            setFields(Fields)
            setSensors(Sensors)

          }
      }).catch(err =>{
          console.log(err)
      })
  } 
  getMyUsers()
  // getSensorsData()
  },[])

  useEffect(() => {
    setInterval(() => {
      return allDataSensor
    }, 60000);

  }, [])

  console.log(allDataSensor)

  const routeToField = (fieldUid,userId) => {
    if (fieldUid) {
      localStorage.setItem(
        "Field",
        fieldUid
      );
        history.push(`/Fields/${userId}/${fieldUid}`)
        window.location.reload()
    }
}

const routeToUsers = () => {
  history.push(`/supplier/users`)
  window.location.reload()
}
const routeToSensors = () => {
  history.push(`/supplier/sensors`)
  window.location.reload()
}

const filteredFields = fields && fields.filter(field => {
  if(SearchName != ''){
      return (
          field.name.toLowerCase().includes(SearchName.toLowerCase())

          )
  }  
  return field
}
);


const goToUserProfil = (userUid) => {
    history.push(`/admin/user/${userUid}`)
    window.location.reload()
}


const getLastReadingDate = (sensorCode) => {
  const sensorData = allDataSensor.find(sensor => sensor.code === sensorCode);
  return sensorData ? moment(sensorData.time).locale('En').format('MMM Do YYYY, h:mm a') : '';
};
  return (
    <Container fluid className="main-content-container px-4">
      <Row noGutters className="page-header py-4">
        <PageTitle title={t('overview')} className="text-sm-left mb-3" />
      </Row>
      <Row>
                <Col lg='8' md='12' sm='12'>
                    <Row>
                        <Col lg="4" md ="12" sm="12">
                            <Card className="sensor" onClick={() => routeToUsers()}>
                                <CardHeader>
                                    <i className='material-icons' style={{fontSize:20,color :"#3CB379"}}>&#xe614;</i> Total Customers
                                </CardHeader>
                                <CardBody>
                                <div><h2 style={{color :"#3CB379"}}>{users.length}</h2></div>
                                    <div><h6 style={{color :"#3CB379"}}> {t('active_users')}</h6></div>
                                </CardBody>
                            </Card>
                        </Col>
                        <Col lg="4" md ="12" sm="12">
                            <Card className="sensor">
                                <CardHeader>
                                <i className='material-icons' style={{fontSize:20,color :"#1E8FFD"}}>&#xe0ee;</i> Total Fields
                                </CardHeader>
                                <CardBody>
                                <div><h2 style={{color :"#1E8FFD"}}>{fields.length}</h2></div>
                                    <div><h6 style={{color :"#1E8FFD"}}> {t('active_fields')}</h6></div>
                                </CardBody>
                            </Card>
                        </Col>
                        <Col lg="4" md ="12" sm="12">
                            <Card className="sensor" onClick={() => routeToSensors()}>
                                <CardHeader>
                                <i className='material-icons' style={{fontSize:20,color :"#1E8FFD"}}>&#xe0ee;</i> Total Sensors
                                </CardHeader>
                                <CardBody>
                                <div><h2 style={{color :"#1E8FFD"}}>{sensors.length}</h2></div>
                                    <div><h6 style={{color :"#1E8FFD"}}> {t('active_sensors')}</h6></div>
                                </CardBody>
                            </Card>
                        </Col>
                        <Col lg="12" md ="12" sm="12" className="py-4">
                          <Card>
                              <CardHeader className="d-flex justify-content-between align-items-center">
                                <div>
                                  <i className='material-icons' style={{fontSize:20,color :"#3CB379"}}>&#xe614;</i> Total Fields

                                </div>
                                  <div>
                                    <FormInput value={SearchName} onChange={(e) => setSearchName(e.target.value)} type="search" placeholder="Search ..." />
                                  </div>
                              </CardHeader>
                              <CardBody>
                                <Row>
                                    {
                                      filteredFields.map(field => {
                                          let userId = "" 
                                          let sensorCode = ""
                                                sensors.map(sensor=>{
                                                  if(sensor.fieldId === field.id){
                                                    sensorCode = sensor.code
                                                    userId = sensor.userId
                                                  }
                                                })
                                          return (
                                              <Col lg="12" md="12" sm="12">

                                                <div 
                                                // onClick={() => routeToField(field.uid,userId)}
                                                 className="sensor">
                                                    <div className="sensorHeader">
                                                        <div className="sensorNameWrapper">
                                                            <p style={{ fontSize: "1.2rem" }}>{field.name}</p>
                                                        </div>
                                                        <div className="sensorNameWrapper">
                                                            <p style={{ fontSize: ".9rem" }}>{t('sensor_code')}: {sensorCode}</p>
                                                        </div>
                                                    </div>
                                                    <hr />
                                                    <>
                                                        <section className="ProgressBarWrapper">
                                                            <div className="stats-dates">
                                                            <p style={{ fontSize: 13 }}>{t('niveau')} 1</p>

                                                                <div className="Marker-tomorrow">
                                                                    <svg _ngcontent-pxc-c161="" xmlns="http://www.w3.org/2000/svg" width="11" height="13" viewBox="0 0 14 17" class="drop-element ng-star-inserted" style={{ left: "calc(59.7044% - 6px)" }}><g _ngcontent-pxc-c161="" fill="none"><path _ngcontent-pxc-c161="" d="M7.8 0.4L7.5 0 7.1 0.4C6.9 0.7 1.1 7.3 1.1 11.9 1.1 15.1 4 17.6 7.5 17.6 11 17.6 13.8 15.1 13.8 11.9 13.8 7.3 8.1 0.7 7.8 0.4Z" fill="#FE3C65" class="drop" style={{ fill: "rgb(16, 201, 160)" }}></path><path _ngcontent-pxc-c161="" d="M13.8 11.9C13.8 7.3 8.1 0.7 7.8 0.4L7.5 0 7.1 0.4C7 0.6 5 2.8 3.4 5.5 2.2 7.6 1.1 9.9 1.1 11.9 1.1 15.1 4 17.6 7.5 17.6 11 17.6 13.8 15.1 13.8 11.9Z" stroke="#FFF"></path></g></svg>
                                                                </div>
                                                                <div className="Segment1"></div>
                                                            </div>
                                                            <div className="stats-dates">
                                                            <span style={{ fontSize: 13 }}>{t('niveau')} 2</span>

                                                            <div className='Marker'>
                                                                <svg _ngcontent-pxc-c161="" xmlns="http://www.w3.org/2000/svg" width="14" height="17" viewBox="0 0 14 17" class="drop-element ng-star-inserted" style={{ left: "calc(59.7044% - 6px)" }}><g _ngcontent-pxc-c161="" fill="none"><path _ngcontent-pxc-c161="" d="M7.8 0.4L7.5 0 7.1 0.4C6.9 0.7 1.1 7.3 1.1 11.9 1.1 15.1 4 17.6 7.5 17.6 11 17.6 13.8 15.1 13.8 11.9 13.8 7.3 8.1 0.7 7.8 0.4Z" fill="#FE3C65" class="drop" style={{ fill: "rgb(16, 201, 160)" }}></path><path _ngcontent-pxc-c161="" d="M13.8 11.9C13.8 7.3 8.1 0.7 7.8 0.4L7.5 0 7.1 0.4C7 0.6 5 2.8 3.4 5.5 2.2 7.6 1.1 9.9 1.1 11.9 1.1 15.1 4 17.6 7.5 17.6 11 17.6 13.8 15.1 13.8 11.9Z" stroke="#FFF"></path></g></svg>
                                                            </div>

                                                            <div className="Segment2" style={{marginRight :'-25px'}}></div>
                                                        </div>
                                                            <div className="stats-dates">
                                                            <p style={{ fontSize: 13 }}>{t('niveau')} 3</p>

                                                                <div className="Marker-yesterday">
                                                                    <svg _ngcontent-pxc-c161="" xmlns="http://www.w3.org/2000/svg" width="11" height="13" viewBox="0 0 14 17" class="drop-element ng-star-inserted" style={{ left: "calc(59.7044% - 6px)" }}><g _ngcontent-pxc-c161="" fill="none"><path _ngcontent-pxc-c161="" d="M7.8 0.4L7.5 0 7.1 0.4C6.9 0.7 1.1 7.3 1.1 11.9 1.1 15.1 4 17.6 7.5 17.6 11 17.6 13.8 15.1 13.8 11.9 13.8 7.3 8.1 0.7 7.8 0.4Z" fill="#FE3C65" class="drop" style={{ fill: "rgb(16, 201, 160)" }}></path><path _ngcontent-pxc-c161="" d="M13.8 11.9C13.8 7.3 8.1 0.7 7.8 0.4L7.5 0 7.1 0.4C7 0.6 5 2.8 3.4 5.5 2.2 7.6 1.1 9.9 1.1 11.9 1.1 15.1 4 17.6 7.5 17.6 11 17.6 13.8 15.1 13.8 11.9Z" stroke="#FFF"></path></g></svg>
                                                                </div>
                                                                <div className="Segment3"></div>
                                                            </div>
                                                            <div className="status">
                                                                <div>Refill</div>
                                                                <div style={{ color: "#26cc94" }}>Optimal</div>
                                                                <div>Full</div>
                                                            </div>
                                                        </section>
                                                        <div className="sensorFooter">
                                                        <p>Last Reading :</p>
                                                        {
                                                        getLastReadingDate(sensorCode)}
                                                    </div>
                                                    </>
                                                    <Button theme="info" outline className='my-2 d-flex justify-content-end align-items-end'  onClick={() => routeToField(field.uid,userId)} >{t('see_all')}</Button>
                                                </div>
                                            
                                              </Col>
          

                                          )
                                      })
                                  }
                                  

                                </Row>

              
                              </CardBody>
                          </Card>
                        </Col>
                    </Row>
                </Col>
                
              <Col lg='4' md='12' sm='12'>
                <LeafletMap sensor={sensors}  draw={draw} zoom={mapConfig.zoom} center={mapConfig.center} fromAcrion={mapConfig.fromAction} />
                <Card className="py-4 my-4" >
                    <CardHeader>
                        <i className='material-icons' style={{fontSize:20,color :"#3CB379"}}>&#xe614;</i> All Customers
                    </CardHeader>
                    <CardBody>
                         {
                          users.map(user=>{
                            return(
                              <div className='p-2 border-bottom'>
                                <img
                                    className="rounded-circle h-50"
                                    src={user.upload_file_name == null ? img :`${process.env.REACT_APP_BASE_URL}/static/${user.upload_file_name}`}  
                                    alt={user.name}
                                    width="50"
                                  />
                                <span onClick={() => goToUserProfil(user.uid)}  className='p-1 name_user'>{user.name}</span>
                              </div>
                            )
                          })
                         }         
                    </CardBody>
                </Card>
              </Col>
              
      </Row>
      {/* <Row>
              <Col lg='4' md='12' sm='12'>
                <Card>
                    <CardHeader>
                        <i className='material-icons' style={{fontSize:20,color :"#3CB379"}}>&#xe614;</i> Total Customers
                    </CardHeader>
                    <CardBody>
                    
                    </CardBody>
                </Card>
              </Col>
        
      </Row> */}
    </Container>
  )
}

export default DashboardSupplier