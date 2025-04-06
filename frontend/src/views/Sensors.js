import React, { useEffect, useState } from "react";
import { Container, Row, Col, FormInput,Button,Card,CardBody } from "shards-react";
import { FormSelect } from "shards-react";
import "./../assets/Styles.css";
import PageTitle from "../components/common/PageTitle";
import DBSensor from "./Sensor";
import api from '../api/api';
import { useTranslation } from "react-i18next";
import LoadingSpinner from "../components/common/LoadingSpinner";
import drop from '../images/drop.png'
import drop1 from '../images/drop1.png'
import drop2 from '../images/drop2.png'
import temp from '../images/temp.png'
import humidity from '../images/humidity.png'
import press from '../images/press.png'
import useSensorData from "../utils/useSensorData";
import moment from "moment";
import { useHistory, useLocation, useParams } from "react-router-dom";
import SmallStatsFields from "../components/common/SmallStatsFields";

export default function Sensors() {
  const { t, i18n } = useTranslation();
  const history = useHistory()
  const location = useLocation()
  const [dataSensors, setDataSensors] = useState([]);
  const [dataFields, setDataFields] = useState([]);
  const [dataCrops, setDataCrops] = useState([]);
  const [fields, setFields] = useState([]);
  const [searchCode, setSearchCode] = useState(location.pathname.split('/')[2])
  const [searchField, setSearchField] = useState('')
  const [searchState, setSearchState] = useState('')
  const [sensorData, setSensorData] = useState([]);
  const [readingtime,setReadingTime] = useState('')
  const [batteryLevel, setBatteryLevel] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [crops , setCrops] = useState([])
  const [dataSensor,setDataSensor] = useState({
    id:'',
    code :'',
    time :'' ,
    charge :'',
    signal :'',
    temp : '',
    humidity :'',
    pressure :'',
    humidityMV1 :'',
    humidityMV2 :'',
    humidityMV3 :'' 
  })
  const fetchDataSensors =  () => {
    api.get(`/sensor/sensors`)
      .then(response => {
        let sensorData = response.data;
        setTimeout(()=>{
          setDataSensors(sensorData);
          if(sensorData.length > 0 ){
            let sensorCode = location.pathname.split('/')[2]
            setSearchCode(sensorCode)
          }
        },2600)
      }).catch(error=>{
        console.log(error)
      }).finally(() => setIsLoading(false))
  };
  const fetchDataFields = async () => {
    await api.get(`/field/fields`)
      .then(response => {
        let fieldData = response.data.farms;
        setDataFields(fieldData);
      })
  };

  let sensorsData = useSensorData('/sensor/sensor-update-data')  

  useEffect(() => {
    fetchDataSensors();
    fetchDataFields()
  }, []);

  const getFields = () => {
    let Field = [];
    dataFields.map(farm => {
      let fields = farm.fields;
      if (fields) {
        fields.map(field => {
          Field.push({
            name: field.name,
            id: field.id,
            uid: field.uid,
            sensors : field.sensors,
          })
        })
      }
    })
    setFields(Field)
  }

  useEffect(() => {
    getFields()
  }, [dataFields])

  // useEffect(()=>{
  //   sensorsData.map(data=>{
  //     if(data){
  //       setDataSensor({
  //         code : data.code,
  //         time : data.time,
  //         charge :data.charge,
  //         temp : data.temperature,
  //         humidity : data.humidity,
  //         pressure: data.pressure / 1000,
  //         humidityMV1 : data.mv1,
  //         humidityMV2 : data.mv2,
  //         humidityMV3 : data.mv3

  //       })
  //     }
  //   })
  // },[sensorsData,searchCode])

  useEffect(() => {
    // Filter sensorsData based on searchCode
    const filteredData = sensorsData.filter(data => data.code === searchCode);
    
    // Update sensorData state with the filtered data
    if (filteredData.length > 0) {
      setDataSensor({
        id :filteredData[0].sensor_id,
        code: filteredData[0].code,
        time: filteredData[0].time,
        charge: filteredData[0].charge,
        signal: filteredData[0].signal,
        temp: filteredData[0].temperature,
        humidity: filteredData[0].humidity,
        pressure: filteredData[0].pressure / 1000,
        humidityMV1: filteredData[0].mv1,
        humidityMV2: filteredData[0].mv2,
        humidityMV3: filteredData[0].mv3
      });
    } else {
      // If no matching data, reset the sensorData state
      setDataSensor({
        id :'',
        code: '',
        time: '',
        charge: '',
        temp: '',
        humidity: '',
        pressure: '',
        humidityMV1: '',
        humidityMV2: '',
        humidityMV3: ''
      });
    }
  }, [sensorsData, searchCode]);

  const [mappingMv1,setMappingMv1] = useState("")
  const [mappingMv2,setMappingMv2] = useState("")
  const [mappingMv3,setMappingMv3] = useState("")
  
//   const mappingMv = async (date, idSensor, vals) => {
//     setMappingMv1(sensorsData[0].mv1)
//     setMappingMv2(sensorsData[0].mv2)
//     setMappingMv3(sensorsData[0].mv3)

//     let result = (Number(sensorsData[0].mv1) +  Number(sensorsData[0].mv2) + Number(sensorsData[0].mv3)) / 3
//     let stateCourbe = 'Critical';
//     // A voir avec bechir les status 
//     if(result > 80){
//       stateCourbe = 'Full';
//     }
//     if(result < 80 && result > 40){
//       stateCourbe = 'Optimal';
//     }
    
//     // setFS({resultState : result, state : stateCourbe})
// }

  let smallStats3 = [
    {
      state: `20 cm (%)`,
      icon: <img style={{color:"#F6BE47"}} src={drop} alt="" />,
      label: dataSensor.humidityMV1,
      chartLabels: [null, null, null, null, null, null, null],
      attrs: { md: "4", sm: "6" },
      datasets: [
        {
          label: "Today",
          fill: "start",
          borderWidth: 1.5,
          backgroundColor: "rgba(255,180,0,0.1)",
          borderColor: "rgb(255,180,0)",
          data: []
        }
      ]
    },
    {
      state: `40 cm (%)`,
      icon: <img src={drop2} alt="" />,
      label: dataSensor.humidityMV2,
      chartLabels: [null, null, null, null, null, null, null],
      attrs: { md: "4", sm: "6" },
      datasets: [
        {
          label: "Today",
          fill: "start",
          borderWidth: 1.5,
          backgroundColor: "rgba(255,180,0,0.1)",
          borderColor: "rgb(255,180,0)",
          data: []
        }
      ]
    },
    {
      state: `60 cm (%)`,
      icon: <img src={drop1} alt="" />,
      label: dataSensor.humidityMV3,
      chartLabels: [null, null, null, null, null, null, null],
      attrs: { md: "4", sm: "6" },
      datasets: [
        {
          label: "Today",
          fill: "start",
          borderWidth: 1.5,
          backgroundColor: "rgba(255,180,0,0.1)",
          borderColor: "rgb(255,180,0)",
          data: []
        }
      ]
    }
  ]
  let smallStats4 = [
    {
      state: `${t('Temp.')} (°C)`    ,
      icon: <img  src={temp} alt="" />,
      label: dataSensor.temp,
      chartLabels: [null, null, null, null, null, null, null],
      attrs: { md: "4", sm: "6" },
      datasets: [
        {
          label: "Today",
          fill: "start",
          borderWidth: 1.5,
          backgroundColor: "rgba(255,180,0,0.1)",
          borderColor: "rgb(255,180,0)",
          data: []
        }
      ]
    },
    {
      state: `${t('Humidity')} (%)`,
      icon: <img src={humidity} alt="" />,
      label: dataSensor.humidity,
      chartLabels: [null, null, null, null, null, null, null],
      attrs: { md: "4", sm: "6" },
      datasets: [
        {
          label: "Today",
          fill: "start",
          borderWidth: 1.5,
          backgroundColor: "rgba(255,180,0,0.1)",
          borderColor: "rgb(255,180,0)",
          data: []
        }
      ]
    },
    {
      state: `${t('Pression')} (kPa)`,
      icon: <img src={press} alt="" />,
      label: dataSensor.pressure ? parseFloat(dataSensor.pressure).toFixed(2) : "",
      chartLabels: [null, null, null, null, null, null, null],
      attrs: { md: "4", sm: "6" },
      datasets: [
        {
          label: "Today",
          fill: "start",
          borderWidth: 1.5,
          backgroundColor: "rgba(255,180,0,0.1)",
          borderColor: "rgb(255,180,0)",
          data: []
        }
      ]
    }
  ]
  
  return (
    <Container fluid className="main-content-container px-4">
      {/* Page Header */}
      <Row noGutters className="page-header d-flex justify-content-between align-items-center  py-4">
        <PageTitle
          sm="4"
          title={t('sensors')}
          subtitle={t('overview')}
          className="text-sm-left"
        />
      </Row>
      <Row noGutters className="page-header py-4">
        {/* <Col lg="6" md="8" sm="8" className="mb-4">
          <h6 className="m-0">{t('search_sensors')}</h6>
          <FormSelect
            value={searchCode}
            onChange={(e) => setSearchCode(e.target.value)}
          >
            <option value="" disabled selected>{t('sensor_code')}</option>
            {
              dataSensors.map(sensor=>{
                return <option value={sensor.code}>{sensor.code}</option>

              })
            }
            </FormSelect>
        </Col> */}
        {/* <Col lg="6" md="8" sm="8" className="mb-4">
          {" "}
          <h6 className="m-0">{t('filter_state')}</h6>
          <FormSelect onChange={evt => { setSearchState(evt.target.value) }}>
            <option value='online'>{t('online')}</option>
            <option value='low'>{t('low_batt')}</option>
            <option value='offline'>{t('offline')}</option>
          </FormSelect>
        </Col> */}
        {/* <Col lg="4" md="8" sm="8" className="mb-4">
          {" "}
          <h6 className="m-0">{t('filter_field')}</h6>
          <FormSelect value={searchField} onChange={evt =>  setSearchField(evt.target.value)}>
            <option value="" >{t('select_field')}</option>
            {
              fields.map(field => (
                <option value={field.id}>{field.name}</option>
              ))
            }
          </FormSelect>
        </Col> */}
        
         {
         fields.map(field => {
          const matchingSensors = field.sensors.filter(sensor => (sensor.field_id === field.id) && (sensor.code === dataSensor.code));
          const fieldNames = matchingSensors.map(sensor => field.name);
          return (
            <div>
              {fieldNames.map(fieldName => (
                  <h4>{t('fields')} : {fieldName}</h4>
              ))}
            </div>
          );
        })
        }
        
        

      </Row>
      <Row>
            <Col lg="6" md="6" sm="6" className="mb-4">
            <p style={{ margin: 0 }}>{t('sensor_stats_air')}</p>
            <Card small className="stats-small">
                <CardBody className="p-0 d-flex">
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      flexWrap: "wrap",
                      width: "100%"
                    }}
                  >
                    {smallStats4.map((stats, idx) => (
                      <>
                        <SmallStatsFields
                        // ToSensorPage={ToSensorPage}
                          style={{
                            borderColor: "blue",
                            borderWidth: 2,
                            borderStyle: "solid"
                          }}
                          id={`small-stats-${idx}`}
                          variation="1"
                          // chartData={stats.datasets}
                          // chartLabels={stats.chartLabels}
                          label={stats.label}
                          value={stats.value}
                          icon={stats.icon}
                          state={stats.state}
                        />
                        {idx != 2 ? (
                          <hr
                            style={{
                              backgroundColor: "#ebebeb",
                              width: "1px",
                              height: "75%"
                            }}
                          />
                        ) : (
                          <></>
                        )}
                      </>
                    ))}
                  </div>
                </CardBody>
            </Card>
          </Col>
          <Col lg="6" md="6" sm="6" className="mb-4">
            <p style={{ margin: 0 }}>{t('sensor_stats_soil')}</p>
            <Card small className="stats-small">
              <CardBody className="p-0 d-flex">
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    flexWrap: "wrap",
                    width: "100%"
                  }}
                >
                  {smallStats3.map((stats, idx) => (
                    <>
                      <SmallStatsFields
                      // ToSensorPage={ToSensorPage}
                        style={{
                          borderColor: "blue",
                          borderWidth: 2,
                          borderStyle: "solid"
                        }}
                        id={`small-stats-${idx}`}
                        variation="1"
                        // chartData={stats.datasets}
                        // chartLabels={stats.chartLabels}
                        label={stats.label}
                        value={stats.value}
                        icon={stats.icon}
                        state={stats.state}
                      />
                      {idx != 2 ? (
                        <hr
                          style={{
                            backgroundColor: "#ebebeb",
                            width: "1px",
                            height: "75%"
                          }}
                        />
                      ) : (
                        <></>
                      )}
                    </>
                  ))}
                </div>
              </CardBody>
            </Card>
          </Col>

        </Row>
     

        {
          isLoading ?
          <LoadingSpinner />
      
            : 
            <Row>
              <DBSensor filteredSensors={dataSensor} chargeLevel={batteryLevel} readingtime={readingtime}/>
          </Row>
        }

    </Container>
  );
}
