import React, { useEffect, useState } from "react";

import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Form
} from 'react-bootstrap';

import "../assets/styling/range-date-picker.css";
import "react-calendar/dist/Calendar.css";
import PageTitle from "../components/common/PageTitle";
import "../assets/styling/Styles.css";
import { sideBarFields } from "../data/sideBarField";
import { useLocation, useNavigate } from "react-router-dom";
import "./Styles.css";
import evapo from "../assets/images/evapo.png";
import api from '../api/api';
import { useTranslation } from "react-i18next";
import LoadingSpinner from '../components/common/LoadingSpinner'
import moment from "moment";
import useSensorData from "../utils/useSensorData";
import WaterChart from "../components/Simulation/WaterChart";
import EvapoChart from "../components/Simulation/EvapoChart";
import SubSoil from "../components/blog/SubSoil";
import { Calendar, momentLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "moment/locale/nb";
import momentTimezone from "moment-timezone";
import { Modal } from "react-bootstrap";
import swal from "sweetalert";
import LinearProgress from '@mui/material/LinearProgress';

const localizer = momentLocalizer(moment);

const Field = () => {
  const ENDPOINT = process.env.REACT_APP_SOCKET;
  let location = useLocation()
  let userUid = JSON.parse(localStorage.getItem('user')).id
  const [cropState, setCS] = useState([]);
  const [sensors, setSensor] = useState([]);
  const Uid = localStorage.getItem("Field");
  const [isLoading, setIsLoading] = useState(true)
  const { t, i18n } = useTranslation();
  const navigate = useNavigate()
  const [selectedField, setSelectedField] = useState([]);
  const [sensorCode, setSensorCode] = useState('')
  const [coord, setCoord] = useState({ lat: '37.05002', lon: '11.01442' })
  const [events, setEvents] = useState([]);
  const [eventList, setEventList] = useState([]);
  const [dose, setDose] = useState('');
  const [time, setTime] = useState('');
  const [modifiedDose, setModifiedDose] = useState('');
  const [modifiedTime, setModifiedTime] = useState('');
  const [eventSource, setEventSource] = useState('');
  const [allCalcul, setAllCalcul] = useState([])


  const [weatherData, setWeatherData] = useState([]);
  const [resultCalcul, setResultCalcul] = useState([])
  const [inputsCalcul, setInputsCalcul] = useState([])
  let allDataSensor = useSensorData('/sensor/sensor-update-data')

  const [recommendations, setRecmnd] = useState([])
  const [fieldState, setFS] = useState({
    state: '',
    resultState: 0
  });

  const [et0, setET0] = useState(2)



  useEffect(() => {
    setInterval(() => {
      return allDataSensor
    }, 60000);

  }, [])


  const fetchData = async () => {
    //TODO GET FROM URL
    await api.get(`${process.env.REACT_APP_BASE_URL}/field/${Uid}/crops`)
      .then(response => {
        let newData = response.data;
        setCS(newData.crops);
        setSelectedField(newData.field)
        setCoord({ lat: parseFloat(newData.field.Latitude).toFixed(3), lon: parseFloat(newData.field.Longitude).toFixed(3) })

      }).catch(err => {
        console.log(err)
      })
    //if (newData.data.crops.length > 0) {}
    const dataSensor = await api.get(`${process.env.REACT_APP_BASE_URL}/field/${Uid}/sensors`)
    const result = dataSensor;
    setSensor(result.data.sensors);
    let sensor = result.data.sensors

    if (sensor.length > 0) {
      setSensorCode(sensor[0].code)
    }

  };
  useEffect(() => {

    fetchData();
  }, []);
  useEffect(() => {
    const weather = async () => {
      await api.post("/weather/get-data", { type: 'day', lat: coord.lat, lon: coord.lon })

        .then((response) => {
          var today = {};
          let weatherData = response.data.data
          today.city = weatherData.name
          today.wind = weatherData.wind.speed;
          if (typeof weatherData.rain !== 'undefined') {
            today.rain = weatherData.rain['1h'];
          }
          today.windDirection = weatherData.wind.deg;
          today.date = new Date(weatherData.dt * 1000);
          today.temp = ((weatherData.main.temp)).toFixed(1);
          today.main = weatherData.weather[0].main;
          today.description = weatherData.weather[0].description;
          today.icon = weatherData.weather[0].icon;
          today.humidity = weatherData.main.humidity;
          today.pressure = weatherData.main.pressure;
          today.visibility = weatherData.visibility;

          setWeatherData(today)
        })
        .catch(function (error) {
          console.log(error);
        })
    }
    weather()
  }, [coord.lat, coord.lon])

  const getRecommendation = async () => {
    let field_id = selectedField.id;
    if (field_id !== undefined) {
      await api.get(`/recommendation/recommendations/${field_id}`)
        .then(response => {
          let recommendations = response.data.recommendations
          setRecmnd(recommendations)
        }).catch(err => {
          console.log(err)
        })
    }
  }

  useEffect(() => {
    getRecommendation();

  }, [selectedField])


  useEffect(() => {
    localStorage.setItem('code', sensorCode)
  }, [sensorCode])
  console.log(sensorCode);
  
  let role = JSON.parse(localStorage.getItem('user')).role
  let userId = location.pathname.split('/')[2]
  useEffect(() => {
      const calculDataSensor = async () => {
        console.log(sensorCode)
        let url = `/calcul/field-calcul/${Uid}`
        if (role === 'ROLE_SUPPLIER') {
          url = `/supplier/get-sensor-calcul/${userId}/${sensorCode}`
        }
        await api.get(url)
          .then(response => {
            console.log(response.data)
            let calculResult = response.data.calcul
            let calculInputs = response.data.inputs

            setResultCalcul(calculResult)
            setInputsCalcul(calculInputs)
          })
          .catch(err => {
            console.log(err)
          })

      }

      calculDataSensor()
    
  }, [Uid])

  console.log(resultCalcul)

  const [mappingMv1, setMappingMv1] = useState("")
  const [mappingMv2, setMappingMv2] = useState("")
  const [mappingMv3, setMappingMv3] = useState("")

  const mappingMv = async (date, idSensor, vals) => {
    setMappingMv1(allDataSensor[0].mv1)
    setMappingMv2(allDataSensor[0].mv2)
    setMappingMv3(allDataSensor[0].mv3)

    let result = (Number(allDataSensor[0].mv1) + Number(allDataSensor[0].mv2) + Number(allDataSensor[0].mv3)) / 3
    let stateCourbe = 'Critical';
    // A voir avec bechir les status 
    if (result > 80) {
      stateCourbe = 'Full';
    }
    if (result < 80 && result > 40) {
      stateCourbe = 'Optimal';
    }

    setFS({ resultState: result, state: stateCourbe })
  }

  useEffect(() => {


    allDataSensor.map(async sensors => {
      await mappingMv(sensors.time, sensors.sensor_id, [sensors.mv1, sensors.mv2, sensors.mv3])


    })

  }, [allDataSensor])
  const [chartData, setChartData] = useState([])

  useEffect(() => {
    let data = []
    let ET0 = 0
    let RuMax = ''
    let todayDate = new Date()
    
    let today = todayDate.toISOString().slice(0, 10)
    resultCalcul.map(result => {
      if (result) {
        data.push({
          bilan: result.bilan,
          ETC: result.Etc,
          dates: result.date,
          RUmax: result.RUmax,
          RUmin: result.RUMin

        })
      }
      if (result.date.slice(0, 10) == today) {
        ET0 = result.ET0
      }
    })

    setET0(ET0)
    setChartData(data)
  }, [resultCalcul])
  const filteredSensors = allDataSensor.filter((sensor) => {
    if (sensorCode !== "") {
      return (
        sensor.code.toLowerCase().includes(sensorCode.toLowerCase())

      )
    }

    // return sensor

  })


  useEffect(() => {
    let result = (Number(mappingMv1) + Number(mappingMv2) + Number(mappingMv3)) / 3
    if ((mappingMv1 !== '0.000') && (mappingMv2 !== '0.000') && (mappingMv3 !== '0.000')) {
      setFS({ resultState: result, state: 'Full' })
    }
    if ((mappingMv1 !== '0.000') && (mappingMv2 !== '0.000') && (mappingMv3 === '0.000')) {
      setFS({ resultState: result, state: 'Optimal' })
    }
    if ((mappingMv1 === '0.000') && (mappingMv2 === '0.000') && (mappingMv3 === '0.000')) {
      setFS({ resultState: result, state: 'Critical' })
    }
    if ((mappingMv1 !== '0.000') && (mappingMv2 === '0.000') && (mappingMv3 === '0.000')) {
      setFS({ resultState: result, state: 'Critical' })
    }
    if ((mappingMv1 === '0.000') && (mappingMv2 !== '0.000') && (mappingMv3 === '0.000')) {
      setFS({ resultState: result, state: 'Critical' })
    }
    if ((mappingMv1 === '0.000') && (mappingMv2 === '0.000') && (mappingMv3 !== '0.000')) {
      setFS({ resultState: result, state: 'Critical' })
    }
  }, [mappingMv1, mappingMv2, mappingMv3])


  const toHoursAndMinutes = (totalMinutes) => {
    const minutes = totalMinutes % 60;
    const hours = Math.floor(totalMinutes / 60);
    // const hours = Math.floor(totalMinutes);

    // return `${hours}h`;
     return `${hours}h ${parseFloat(minutes).toFixed(0)}m`;
  }
  // Marker Position Based on Bilan Hydrique

  const [progressData, setProgressData] = useState([]);

  useEffect(() => {
    const calculateProgressData = () => {
      const newData = [];

      resultCalcul.forEach((data) => {
        if (data) {
          const tomorrow = moment(data.date.slice(0, 10)).add(1, 'days').locale('En').format('MMM DD');
          const today = moment(data.date.slice(0, 10)).locale('En').format('MMM DD');
          const yesterday = moment(data.date.slice(0, 10)).subtract(1, 'days').locale('En').format('MMM DD');

          const progress = data.bilan || 0; // Update this with the actual field from your data
          // const markerPosition = Math.round((progress / 100) * 80); // Calculate the position of the marker based on progress
          const markerPosition = Math.round((progress - data.RUMin) / (data.RUmax - data.RUMin) * 100)

          newData.push({
            tomorrow,
            today,
            yesterday,
            progress,
            markerPosition,
          });
        }
      });

      setProgressData(newData);
    };

    calculateProgressData();
  }, [resultCalcul]);


  const recomBasedOnDate = () => {
    const todayDate = new Date();

    const todayCalcul = resultCalcul.find(calcul => {
      const date = new Date(calcul.date);
      return date.toDateString() === todayDate.toDateString();
    });

    if (!todayCalcul) {
      return null;
    }

    const { irrigationNbr } = todayCalcul;
    let recommendationText = "";
    if (irrigationNbr === 1) {
      recommendationText = `${t('recomnd_text_irrig')}`;
    } else {
      recommendationText = `${t('recomnd_text')}`
    }

    return (
      <Col lg="4" md="12" sm="12" className="mb-4">
        {
          cropState.map((item, indx) => {
            let msg = ""
            if (item.irrigations == 0) msg = "NO IRRIGATION FOUNDED"
            return (
              <Card className="mb-4 ">
                <Card.Header className="border-bottom">
                  <h6 className="m-0">{t('field_status')}</h6>
                </Card.Header>
                <Card.Body className="py-2">
                  <Row className="border-bottom  bg-light">
                    <Col className="p-0" lg="6" md="12" sm="12">
                      <p className="m-0">{t('crop_type')} : {item.croptypes.crop}</p>
                      <p className="m-0">{t('crop_variety')} : {item.varieties.crop_variety && item.varieties.crop_variety != "" ? item.varieties.crop_variety : "-"}</p>
                      <p className="m-0">{t('planting_date')} : {new Date(item.growingDate).toDateString().slice(10, 15)}</p>

                    </Col>
                    {
                      item.irrigations.map(irrigation => (
                        <Col lg="6" md="12" sm="12">
                          <p style={{ margin: 0 }}>{t('Irrigation_system_type')}: <span style={{ textTransform: 'capitalize' }}>{irrigation.type}</span></p>
                          <p style={{ margin: 0 }}>
                            {t('FlowRate')} : {irrigation.flowrate} (l/h)
                          </p>
                        </Col>

                      ))
                    }
                  </Row>
                  <p style={{ color: "#EB493B" }}>
                    {msg}
                  </p>
                  <Row>
                    <Col lg="12" sm="12" md="12">
                      <p style={{ margin: 2, fontWeight: "bold", textAlign: "center" }}>{t('Recommandation')}</p>


                    </Col>
                    <Card className="m-2">
                      <Card.Header className="border-bottom d-flex flex-wrap justify-content-between align-items-center">
                        <p
                          style={{
                            color: '#0daaa2',
                            textTransform: 'uppercase',
                            margin: 0,
                            padding: 10,
                            fontSize: "14px",
                            backgroundColor: "#ebebeb",
                            borderRadius: 8
                          }}
                        >
                          <i className="material-icons">&#xe88e;</i> {irrigationNbr === 1 ? `${t('Irrigate')}` : `${t('not_Irrigate')}`}
                        </p>
                        <div>{todayDate.toLocaleDateString()}</div>
                      </Card.Header>
                      <Card.Body
                        className="pt-0 d-flex flex-column justify-content-around align-items-center"
                        style={{ height: "100%" }}
                      >
                        <Row>
                          <div className="detail" style={{ paddingTop: 10 }}>
                            <p>{recommendationText}</p>
                          </div>
                        </Row>
                        <Row>
                          <Col lg="12" md="12" sm="12">
                            <Button
                              onClick={() => navigate(`/recommendations/${selectedField.id}`)}
                              theme="info" outline
                              className="mb-2 mr-1"
                            >
                              {t('see_all')}
                            </Button>
                          </Col>
                        </Row>
                      </Card.Body>
                    </Card>
                  </Row>
                </Card.Body>
              </Card>
            )
          })
        }
      </Col>
    );
  };

  const eventStyleGetter = (event) => {
    if (event.source === 'rain') {
      return {
        style: {
          backgroundColor: '#26A6B7', // Customize the background color of the event
          color: 'white',
          textAlign: "center",
          borderRadius: '0',
          border: 'none',
          padding: '2px',
          margin: '0',
          height: '100%',
          fontSize: "11px"
        },
      };
    } else {
      const style = {
        backgroundColor: '#26A6B7', // Customize the background color of the event
        color: 'white', // Customize the text color of the event
        borderRadius: '0', // Customize the border radius of the event
        border: 'none', // Customize the border of the event
        padding: '1px', // Customize the padding of the event
        margin: '0', // Customize the margin of the event
        height: '100%', // Set the height of the event to 100% of its container
        fontSize: "11px"
      };

      return {
        className: '',
        style: style,
      };
      // Return default style for other events
    }
  };

  const [show, setShow] = useState(false);
  const [showForNew, setShowForNew] = useState(false);


  const [selectedEvent, setSelectedEvent] = useState(null);

  // Calendar Events

  const handleEventUpdate = (eventToUpdate, updatedEvent) => {
    setEvents(
      events.map((event) => (event === eventToUpdate ? updatedEvent : event))
    );
  };

  const handleEventSelect = (event) => {
    if (event.source !== "rain") {
      const doseValue = event.title.props.children[0].props.children.split(": ")[1];
      const timeValue = event.title.props.children[1].props.children.split(": ")[1];

      setSelectedEvent(event);
      setModifiedDose(parseFloat(doseValue).toFixed(2));
      setModifiedTime(parseFloat(timeValue).toFixed(2));
      const isUserEvent = event.source === 'user'; // Assuming the source property indicates whether it's a user-added event or not
      setEventSource(isUserEvent ? 'user' : 'resultCalcul');
      setShow(true);

    }
  };

  const handleCloseModal = () => {
    setShow(false);
  };
  const handleNewIrrigCloseModal = () => {
    setShowForNew(false);
  };


  const [selectedSlot, setSelectedSlot] = useState(null);


  const handleSaveEvent = async () => {
    if (!selectedSlot || !dose || !time) {
      return;
    }
    // Create a new event object with the provided dose and time values
    const newEvent = {
      title: 'Irrigation Event',
      start: selectedSlot.start,
      end: selectedSlot.end,
      dose: dose,
      time: time,
      source: "user"
    };
    //Save& Update the events array with the new event
    let data = {
      field_uid: Uid,
      title: 'Irrigation Event',
      start: selectedSlot.start.toISOString().slice(0, 10),
      end: selectedSlot.end.toISOString().slice(0, 10),
      time: time,
      dose: dose
    }
    await api.post('/field/add-event', data)
      .then(response => {
        if (response.data.type === "success") {
          setEvents([...events, newEvent]);
          getEvents()
          swal({
            icon: "success",
          });
        }
      }).catch(error => {
        console.log(error)
      })

    // Close the modal after saving
    handleNewIrrigCloseModal();
  };


  const getEvents = async () => {
    try {
      await api.get(`/field/get-event/${Uid}`)
        .then(response => {
          let eventData = response.data.events
          setEventList(eventData)
        })
    } catch (error) {
      console.log(error)
      // Handle errors
    }

  }

  useEffect(() => {
    getEvents()
  }, [])

  useEffect(() => {
    let data = [];
    eventList && eventList.forEach((irrigDay) => {
      data.push({
        title: (
          <div>
            <div>{'Irrigation Dose: ' + parseFloat(irrigDay.dose).toFixed(2) + ' mm'}</div>
            <div>{'Irrigation Time: ' + parseFloat(irrigDay.time).toFixed(2) + ' mn'}</div>
          </div>
        ),
        allDay: true,
        start: new Date(irrigDay.start),
        end: new Date(irrigDay.end),
        event_id: irrigDay.id,
        source: 'user'
      });
    });
    // Merge existing events with new data
    setEvents((prevEvents) => [...prevEvents, ...data]);
  }, [eventList, resultCalcul]);

  // Update event By USER

  const handleModalUpdate = async (updatedData) => {
    const updatedEvent = { ...selectedEvent, ...updatedData };
    try {
      await api.post('/field/edit-event', updatedEvent)
        .then(response => {
          if (response.data.type === "success") {
            
            handleEventUpdate(selectedEvent, updatedEvent);
            getEvents()
            setShow(false); // Close the modal 
            swal({
              icon: "success",
            });
          }
        })

    } catch (error) {
      console.log(error);
      // Handle errors if necessary
    }
  };

  // Delete event By USER

  const handleEventDelete = async (eventId) => {
    try {
      await api.post('/field/delete-event', { event_id: eventId })
        .then(response => {
          if (response.data.type === "success") {
            swal({
              icon: "success",
              text: "Event deleted successfully.",
            });
            setEvents(events.filter((event) => event.id !== eventId));
            getEvents()
            setShow(false)

          }
        })
    } catch (error) {
      console.log(error);
      swal({
        icon: "error",
        text: "Error deleting the event.",
      });
    }
  };

  useEffect(() => {
    const getAllCalculByField = async () => {
      try {
        const response = await api.get(`/calcul/field-calcul/${Uid}`)
        const eventData = response.data.calcul;
        setAllCalcul(eventData)
      } catch (error) {
        console.log(error)
      }
    }

    getAllCalculByField()
  }, [])

  console.log(allCalcul);
  

  useEffect(() => {
    let data = [];
    allCalcul &&
      allCalcul.forEach((event) => {
        if(event.irrigationNbr === 1){
          data.push({
            title: (
              <div style={{ fontSize: 11.5 }}>
                <div>{'Irrigation Dose : ' + parseFloat(event.irrigation).toFixed(2) + ' mm'}</div>
                <div>{'Irrigation Time : ' + toHoursAndMinutes(event.irrigationTime)}</div>
                <div>{'Rain : ' + parseFloat(event.rain).toFixed(2) + ' mm'}</div>
              </div>
            ),
            allDay: true,
            start: new Date(event.date),
            end: new Date(event.date),
            source: "resultCalcul",
          });
        }
        // let startDate = new Date(event.start_date).toISOString().slice(0, 10);
        // let endDate = new Date(event.end_date).toISOString().slice(0, 10);
        // let resultCalcul = event.result;

        // const filteredEvents = resultCalcul.filter((result) => {
        //   let resultDate = new Date(result.date).toISOString().slice(0, 10);

        //   return (
        //     result.irrigationNbr === 1 &&
        //     resultDate >= startDate &&
        //     resultDate < endDate
        //   );
        // });
        // filteredEvents && filteredEvents.forEach((event) => {
            
          // });
      });
    setEvents(data);
  }, [allCalcul]);
  console.log(events,"events");
  

  const calculateLeftPosition = (value) => {
    const minValue = 20;
    const maxValue = 80;
    const adjustedValue = Math.max(minValue, Math.min(maxValue, parseFloat(value)));
    return `calc(${adjustedValue}% - 6px)`;
  };
  return (
    <Container fluid className="main-content-container px-3">
      {/* Page Header */}
      <Row noGutters className="page-header py-4">
        <PageTitle
          sm="4"
          //title={data[fieldIndex].fieldName}
          title={selectedField.name}
          subtitle={t('overview')}
          className="text-sm-left"
        />
      </Row>
      {/* First Row of Posts */}
      <Row className="border-bottom mb-4">
        <Col lg="12" md="12" sm="12">
          <Row>
            <div className="d-flex gap-2 container">
              <Col lg="4" md="12" sm="12" className="mb-4">
                {
                  allDataSensor || sensors.length > 0
                    ?
                    <Card fluid style={{ minHeight: "330px" }}>
                      <>
                        <Card.Header className="border-bottom bg-light">
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "row",
                              justifyContent: "space-between",
                              height: "100%",
                              alignItems: "center"
                            }}
                          >
                            <h6 className="m-0">{t('active_sensors')}</h6>
                            <Form.Select style={{ width: "50%" }} value={sensorCode} onChange={evt => { setSensorCode(evt.target.value) }}>
                              <option value="">{t('select_sensor')}</option>
                              {
                                sensors.map((sensor, i) => {

                                  return (
                                    <option key={i} value={sensor.code}>{sensor.code}</option>
                                  )
                                })
                              }
                            </Form.Select>

                          </div>

                          {
                            filteredSensors && filteredSensors.map((data, indx) => {
                              let prss = data.pressure / 1000
                              return (
                                <div
                                  key={indx}
                                  style={{
                                    display: "flex",
                                    flexDirection: "row",
                                    justifyContent: "space-evenly",
                                    paddingTop: 10,
                                    fontSize: 13
                                  }}
                                >
                                  <div style={{ textAlign: "center" }}>
                                    <i
                                      class="fas fa-thermometer-three-quarters"
                                      style={{ fontSize: "20px" }}
                                    ></i>
                                    <p style={{ margin: 0 }}>{t('Temp.')} (°C)</p>
                                    <p style={{ margin: 0 }}>{data.temperature}</p>
                                  </div>
                                  <div style={{ textAlign: "center" }}>
                                    <i className="material-icons" style={{ fontSize: "20px" }}>&#xe798;</i>
                                    <p style={{ margin: 0 }}>{t('Humidity')} (%) </p>
                                    <p style={{ margin: 0 }}>{data.humidity}</p>

                                  </div>
                                  <div style={{ textAlign: "center" }}>
                                    <i className="material-icons" style={{ fontSize: "20px" }}>&#xe94d;</i>
                                    <p style={{ margin: 0 }}>{t('Pression')} (kPa)</p>
                                    <p style={{ margin: 0 }}>{parseFloat(prss).toFixed(3)}</p>
                                  </div>
                                  <div style={{ textAlign: "center" }}>
                                    <i className="material-icons" style={{ fontSize: "20px" }}>&#xe94d;</i>
                                    <p style={{ margin: 0 }}>{t('Altitude')} (Pa)</p>
                                    <p style={{ margin: 0 }}>{data.altitude}</p>
                                  </div>
                                </div>

                              )
                            }
                            )
                          }
                        </Card.Header>

                        <Card.Body className="pt-0">
                          <div style={{ paddingTop: 10 }}>
                            {
                              filteredSensors && filteredSensors.map(data => {
                                // mappingMv('Mv1', data.mv1, data.time, data.sensor_id)                                 
                                // mappingMv('Mv2', data.mv2, data.time, data.sensor_id)
                                // mappingMv('Mv3', data.mv3, data.time, data.sensor_id)


                                return (

                                  <table
                                    //class="border-none"
                                    style={{
                                      textAlign: "center",
                                      width: "100%",
                                      gap: 15
                                    }}
                                  >
                                    <thead>
                                      <tr>
                                        <th><i className="material-icons">&#xe1ff;</i> {t('depth')} (cm)</th>
                                        <th><i className="material-icons">&#xe798;</i> {t('Humidity')} (%)</th>
                                      </tr>
                                    </thead>

                                    <tbody>
                                      <tr>
                                        <td>20</td>
                                        <td>{mappingMv1}</td>
                                      </tr>
                                      <tr>
                                        <td>40</td>
                                        <td>{mappingMv2}</td>
                                      </tr>
                                      <tr>
                                        <td>60</td>
                                        <td>{mappingMv3}</td>
                                      </tr>
                                    </tbody>


                                  </table>
                                )
                              })
                            }
                          </div>
                          {
                            filteredSensors.map(data => {
                              return <h6 className="font-weight-bold" style={{ color: "#0daaa2", fontSize: 14, textAlign: "center", marginTop: 6 }}>

                                {t('last_reading')} :  {moment(data.time).locale('fr').format('L, LT')}

                              </h6>
                            })
                          }
                        </Card.Body>


                        <Card.Footer className="border-top">
                          <div>
                            <h6 className="m-0" style={{ fontSize: 14 }}>{t('today_weather')}</h6>
                            <div
                              style={{
                                width: "100%",
                                display: "flex",
                                flexDirection: "row",
                                justifyContent: "space-between",
                                paddingTop: 10
                              }}>
                              <div style={{ textAlign: "center" }}>
                                <i
                                  class="fas fa-thermometer-three-quarters"
                                  style={{ fontSize: "20px" }}
                                ></i>
                                <p style={{ margin: 0, fontSize: 14 }}>{t('Temp.')}</p>
                                <p style={{ margin: 0 }}>
                                  {weatherData.temp}°C
                                </p>
                              </div>
                              <div style={{ textAlign: "center" }}>
                                <i
                                  class="fas fa-cloud-showers-heavy"
                                  style={{ fontSize: "20px" }}
                                ></i>
                                <p style={{ margin: 0, fontSize: 14 }}>{t('Rain')}</p>
                                <p style={{ margin: 0 }}>
                                  {weatherData.rain ? weatherData.rain : 0} mm
                                </p>
                              </div>
                              <div style={{ textAlign: "center" }}>
                                <img
                                  src={evapo}
                                  alt="evapoIcon"
                                  style={{ width: "20px", height: "20px" }}
                                />
                                <p style={{ margin: 0, fontSize: 14 }}>ET0</p>

                                <p style={{ margin: 0 }}>{et0} mm</p>




                              </div>
                              <div style={{ textAlign: "center" }}>
                                <i className="material-icons" style={{ fontSize: 20 }}>&#xefd8;</i>
                                <p style={{ margin: 0, fontSize: 14 }}>{t(`wind`)}</p>

                                <p style={{ margin: 0 }}>{weatherData.wind} km/h</p>




                              </div>

                            </div>
                          </div>
                        </Card.Footer>
                      </>
                    </Card>
                    :
                    <Card fluid style={{ minHeight: "330px" }}>
                      <Card.Header >

                      </Card.Header>
                      <Card.Body>
                        <h5 style={{ textAlign: 'center', color: '#0daaa2' }}>Please use the app to install/register a sensor.</h5>

                      </Card.Body>
                    </Card>
                }
              </Col>
              <Col lg="4" md="12" sm="12" className="mb-4">
                <Card fluid style={{ minHeight: "330px" }} >

                  <Card.Header className="border-bottom d-flex justify-content-between align-items-center flex-wrap">
                    <h6 className="m-0">{t('soil_status')}</h6>
                    <Button theme="info" outline onClick={() => navigate('/Graphs')}>{t('see_all')}</Button>

                  </Card.Header>
                  <Card.Body className="p-1">
                    <SubSoil data={allDataSensor} codeSensor={sensorCode} />
                    {
                      filteredSensors && filteredSensors.map(data => {

                        return (

                          <>

                            <div className="py-2">
                              <div className="ProgressBarWrapper">
                                <div className="stats-dates">
                                  <span style={{ fontSize: 14 }}>{t('niveau')} 1</span>
                                  <div className="Marker-tomorrow" style={{ left: calculateLeftPosition(data.mv1) }}>
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      width="11"
                                      height="13"
                                      viewBox="0 0 14 17"
                                      className="drop-element ng-star-inserted"
                                    >
                                      <g fill="none">
                                        <path
                                          d="M7.8 0.4L7.5 0 7.1 0.4C6.9 0.7 1.1 7.3 1.1 11.9 1.1 15.1 4 17.6 7.5 17.6 11 17.6 13.8 15.1 13.8 11.9 13.8 7.3 8.1 0.7 7.8 0.4Z"
                                          fill="#FE3C65"
                                          className="drop"
                                          style={{ fill: "rgb(16, 201, 160)" }}
                                        ></path>
                                        <path
                                          d="M13.8 11.9C13.8 7.3 8.1 0.7 7.8 0.4L7.5 0 7.1 0.4C7 0.6 5 2.8 3.4 5.5 2.2 7.6 1.1 9.9 1.1 11.9 1.1 15.1 4 17.6 7.5 17.6 11 17.6 13.8 15.1 13.8 11.9Z"
                                          stroke="#FFF"
                                        ></path>
                                      </g>
                                    </svg>
                                  </div>
                                  <div
                                    style={{
                                      opacity: "0.2",
                                      width: "80%",
                                      height: "20px",
                                      margin: "0px 0px 0px 10px",
                                      backgroundImage: "linear-gradient(90deg, #ff2866, #f98c66, #bfba2e, #26cc94, #00c7a8, #00b7bc, #00a0db)",
                                    }}
                                  ></div>
                                </div>
                                <div className="stats-dates" style={{ margin: "-5px 0px" }}>
                                  <span style={{ fontSize: 14 }}>{t('niveau')} 2</span>
                                  <div className="Marker" style={{ left: calculateLeftPosition(data.mv2) }}>
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      width="14"
                                      height="17"
                                      viewBox="0 0 14 17"
                                      className="drop-element ng-star-inserted"
                                    >
                                      <g fill="none">
                                        <path
                                          d="M7.8 0.4L7.5 0 7.1 0.4C6.9 0.7 1.1 7.3 1.1 11.9 1.1 15.1 4 17.6 7.5 17.6 11 17.6 13.8 15.1 13.8 11.9 13.8 7.3 8.1 0.7 7.8 0.4Z"
                                          fill="#FE3C65"
                                          className="drop"
                                          style={{ fill: "rgb(16, 201, 160)" }}
                                        ></path>
                                        <path
                                          d="M13.8 11.9C13.8 7.3 8.1 0.7 7.8 0.4L7.5 0 7.1 0.4C7 0.6 5 2.8 3.4 5.5 2.2 7.6 1.1 9.9 1.1 11.9 1.1 15.1 4 17.6 7.5 17.6 11 17.6 13.8 15.1 13.8 11.9Z"
                                          stroke="#FFF"
                                        ></path>
                                      </g>
                                    </svg>
                                  </div>
                                  <div
                                    style={{
                                      margin: "0px 0px 0px 10px",
                                      width: "80%",
                                      height: "20px",
                                      backgroundImage: "linear-gradient(to right, #ff2866, #f98c66, #bfba2e, #26cc94, #00c7a8, #00b7bc, #00a0db)",
                                    }}
                                  ></div>
                                </div>
                                <div className="stats-dates">
                                  <span style={{ fontSize: 14 }}>{t('niveau')} 3</span>
                                  <div className="Marker-yesterday" style={{ left: calculateLeftPosition(data.mv3) }}>
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      width="11"
                                      height="13"
                                      viewBox="0 0 14 17"
                                      className="drop-element ng-star-inserted"
                                    >
                                      <g fill="none">
                                        <path
                                          d="M7.8 0.4L7.5 0 7.1 0.4C6.9 0.7 1.1 7.3 1.1 11.9 1.1 15.1 4 17.6 7.5 17.6 11 17.6 13.8 15.1 13.8 11.9 13.8 7.3 8.1 0.7 7.8 0.4Z"
                                          fill="#FE3C65"
                                          className="drop"
                                          style={{ fill: "rgb(16, 201, 160)" }}
                                        ></path>
                                        <path
                                          d="M13.8 11.9C13.8 7.3 8.1 0.7 7.8 0.4L7.5 0 7.1 0.4C7 0.6 5 2.8 3.4 5.5 2.2 7.6 1.1 9.9 1.1 11.9 1.1 15.1 4 17.6 7.5 17.6 11 17.6 13.8 15.1 13.8 11.9Z"
                                          stroke="#FFF"
                                        ></path>
                                      </g>
                                    </svg>
                                  </div>
                                  <div
                                    style={{
                                      opacity: "0.2",
                                      margin: "0px 0px 0px 10px",
                                      width: "80%",
                                      height: "20px",
                                      backgroundImage: "linear-gradient(to right, #ff2866, #f98c66, #bfba2e, #26cc94, #00c7a8, #00b7bc, #00a0db)",
                                    }}
                                  ></div>
                                </div>
                                <div className="status">
                                  <div>{t('Critical')}</div>
                                  <div style={{ color: "#26cc94" }}>{t('Optimal')}</div>
                                  <div>{t('Full')}</div>
                                </div>
                              </div>
                            </div>

                          </>
                        )
                      })
                    }


                  </Card.Body>
                </Card>
              </Col>
              {recomBasedOnDate()} 
            </div>
          </Row>
          <Row>
            <div className="container">
              <Col lg="12" md="12" sm="12" className="mb-4">
                <Card>
                  <Card.Body className="p-0">

                    <EvapoChart

                      data={chartData}

                    />
                  </Card.Body>
                </Card>

              </Col>
              <Col lg="12" md="12" sm="12" className="mb-4">
                <Card>
                  <Card.Body className="p-0">

                    <WaterChart

                      data={chartData}

                    />
                  </Card.Body>
                </Card>

              </Col>
            </div>
          </Row>
        </Col>

      </Row>
      <Row className="pb-4">

        <Modal size="lg" show={show} onHide={handleCloseModal}>
          <Modal.Header>
            <Modal.Title>Event Details</Modal.Title>
          </Modal.Header>
          {
            selectedEvent && (
              <Modal.Body>
                <div className="border-bottom p-2">
                  <h4 style={{ fontWeight: "bold", textAlign: "center", margin: 8 }}>Expected irrigation dose and duration</h4>
                  <div style={{ border: "1px solid #eee", borderRadius: "8px", padding: 10, }}>
                    {
                      eventSource === "user"
                        ?
                        <>

                          <Form.Group controlId="formDose">
                            <Form.Label>Dose</Form.Label>
                            <Form.Control
                              type="number"
                              value={modifiedDose}
                              onChange={(e) => setModifiedDose(e.target.value)}
                            />
                          </Form.Group>
                          <Form.Group controlId="formTime">
                            <Form.Label>Time</Form.Label>
                            <Form.Control
                              type="number"
                              value={modifiedTime}
                              onChange={(e) => setModifiedTime(e.target.value)}
                            />
                          </Form.Group>
                        </>
                        :
                        <h6 style={{ fontWeight: "500", textAlign: "center", margin: 4 }}>{selectedEvent.title}</h6>
                    }

                    <Row className="d-flex flex-wrap align-items-center justify-content-center" >
                      <Col>
                        <label style={{ fontWeight: "500", textAlign: "center", margin: 4 }} htmlFor="start">{t('start_date')}</label>
                        <Form.Control id="start" type="date" defaultValue={selectedEvent.start.toISOString().slice(0, 10)} />

                      </Col>
                      <Col>
                        <label style={{ fontWeight: "500", textAlign: "center", margin: 4 }} htmlFor="end">{t('end_date')}</label>

                        <Form.Control id="end" type="date" defaultValue={selectedEvent.end.toISOString().slice(0, 10)} />

                      </Col>
                    </Row>
                    {
                      eventSource === 'resultCalcul'
                        ?
                        <div className="py-4">
                          <i className='material-icons'>&#xe88e;</i> <span>The irrigation dose and duration are determined by a comprehensive calculation and expert opinion, taking into account the information provided by the user.</span>

                        </div>
                        :
                        null
                    }

                  </div>



                </div>
                {/* <div className="m-2 p-2">
                  <h4>Here you can provide your irrigation plan for this day </h4>
                      <label htmlFor="dose">Irrigation Dose (mm) </label>
                    <Form.Control  
                        id="dose"
                        placeholder="Irrigation Dose"
                    />
                        <label htmlFor="time">Irrigation Duration (mn)</label>
                    <Form.Control  
                        id="time"
                        placeholder="Irrigation Duration"
                    />
              </div> */}
              </Modal.Body>

            )

          }
          <Modal.Footer>
            {eventSource === 'user' && (
              <>
                <Button variant="primary" onClick={() => handleModalUpdate({ dose: modifiedDose, time: modifiedTime })}>
                  Update
                </Button>
                <Button variant="primary" onClick={() => handleEventDelete(selectedEvent.event_id)}>
                  Delete
                </Button>


              </>
            )}
            <Button variant="secondary" onClick={handleCloseModal}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
        {/* Modal for adding irrigation event */}
        <Modal size="md" show={showForNew} onHide={handleNewIrrigCloseModal}>
          <Modal.Header className="d-flex flex-column">
            <Modal.Title>Add Irrigation Event</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <label htmlFor="dose">Irrigation Dose (mm) </label>
            <Form.Control
              id="dose"
              placeholder="Irrigation Dose"
              type="number"
              value={dose}
              onChange={(e) => setDose(e.target.value)}
            />
            <label htmlFor="time">Irrigation Duration (mn)</label>
            <Form.Control
              type="number"
              id="time"
              placeholder="Irrigation Duration"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleNewIrrigCloseModal}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSaveEvent}>
              Save
            </Button>
          </Modal.Footer>
        </Modal>
        <Col lg="12" md="12" sm="12">
          <Card>
            <Card.Body>
            <Calendar
                key={events.length}
                localizer={localizer}
                events={events}
                culture="en-GB"
                views={["month", "week", "day"]}
                startAccessor="start"
                endAccessor="end"
                style={{ height: 500 }}
                eventPropGetter={
                  eventStyleGetter
                }
                selectable={true} // Enable event selection
                resizable={true} // Enable event resizing
                draggable={true} // Enable event dragging
                onSelectSlot={(slotInfo) => {
                  setSelectedSlot(slotInfo);
                  setShowForNew(true);
                }}
                onSelectEvent={(event, e) => {
                  handleEventSelect(event, event.source);
                }}
              />

            </Card.Body>

          </Card>

        </Col>
      </Row>



    </Container>
  );
};

export default Field;
