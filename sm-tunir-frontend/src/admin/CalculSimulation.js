import React, { useState, useEffect } from 'react'
import api from '../api/api'
import { Container, Row, Col, Card} from 'react-bootstrap'
import PageTitle from '../components/common/PageTitle'
import { useTranslation } from 'react-i18next';

import swal from 'sweetalert';

// import {Button, IconButton} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { Recommend } from '@mui/icons-material';
import SmsIcon from '@mui/icons-material/Sms';
import SummarizeIcon from '@mui/icons-material/Summarize';
import HistoryIcon from '@mui/icons-material/History';
import PreviewIcon from '@mui/icons-material/Preview';
import DownloadIcon from '@mui/icons-material/Download';
import AddIcon from '@mui/icons-material/Add';
import { Calendar, momentLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import moment from "moment";
import "moment/locale/nb";
import { TextField, Button, CardContent, Typography ,Switch ,LinearProgress  } from '@mui/material';
import SimulationChart from './SimulationChart';
import { useLocation } from 'react-router';

const localizer = momentLocalizer(moment);

const CalculSimulation = () => {
  
  const { t, i18n } = useTranslation();
 
  const location = useLocation();
  const [events, setEvents] = useState([]);
  const [showAllEvents, setShowAllEvents] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [fieldData, setFieldData] = useState(null);
    // const {calculData } = location.state;

    const initialData = location.state ? location.state.calculData : null;
 
    
    const [calculData, setCalculData] = useState(initialData);
 
  const toHoursAndMinutes = (totalMinutes) => {
    const minutes = totalMinutes % 60;
    const hours = Math.floor(totalMinutes / 60);
    // const hours = Math.floor(totalMinutes);

    // return `${hours}h`;
     return `${hours}h ${parseFloat(minutes).toFixed(0)}m`;
  }
  useEffect(() => {
    let data = [];
    calculData &&
      calculData.forEach((event) => {
        let startDate = new Date(event.start_date).toISOString().slice(0, 10);
        let endDate = new Date(event.end_date).toISOString().slice(0, 10);
        let resultCalcul = event.result;

        const filteredEvents = resultCalcul.filter((result) => {
          let resultDate = new Date(result.date).toISOString().slice(0, 10);

          return (
            result.irrigationNbr === 1 &&
            resultDate >= startDate &&
            resultDate < endDate
          );
        });

        filteredEvents &&
          filteredEvents.forEach((event) => {
            data.push({
              title: (
                <div style={{ fontSize: 11.5 }}>
                  <div>{'Irrigation Dose : ' + parseFloat(event.irrigation).toFixed(2) + ' mm'}</div>
                  <div>{'Irrigation Time : ' + toHoursAndMinutes(event.irrigationTime)}</div>
                  <div>{'Watering Rainfall : ' + parseFloat(event.pluieArrosage).toFixed(2) + ' mm'}</div>
                  {/* <div>{'Rain : ' + parseFloat(event.rain).toFixed(2) + ' mm'}</div> */}
                </div>
              ),
              allDay: true,
              start: new Date(event.date),
              end: new Date(event.date),
              source: "resultCalcul",
            });
          });
      });
    setEvents(data);
  }, [calculData ]);

  const handleChange = (index, field, value) => {
    const newData = [...calculData];
    newData[index].inputs[0][field] = Number(value);
    setCalculData(newData);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const updatePromises = calculData.map(async (data) => {
        const { field_id, inputs } = data;
        const { RUmax, effPluie, effIrrig, irrigArea, ruPratique, profondeur } = inputs[0];
        
        const payload = {
          fieldId: field_id,
          RUmax,
          effPluie,
          effIrrig,
          irrigArea,
          ruPratique,
          profondeur
        };
        const response = await api.post('/admin/edit-bilan-hydrique', payload);
        return response.data;
      });
      
      const updatedData = await Promise.all(updatePromises);
      if(updatedData && typeof updatedData !== 'undefined'){
        setCalculData(updatedData[0].data)
        swal("Success", "Data saved successfully!", "success");

      }
    } catch (error) {
      console.error('Error saving data:', error);
      swal("Error", "Failed to save data!", "error");
    } finally {
      setIsSaving(false);
    }
  };
  const [chartData, setChartData] = useState([])

  useEffect(() => {
    let dataDisplayed = []
    // let ET0 = 0
    let RuMax = ''
    let todayDate = new Date()
    let today = todayDate.toISOString().slice(0, 10)
    let filteredResult = [];

    calculData && calculData.map(result => {
      let resultData = result.result
      let startDate = new Date(result.start_date).toISOString().slice(0, 10)
      let endDate = new Date(result.end_date).toISOString().slice(0, 10)
      // inputsCalcul = result.inputs
      if (today >= startDate && today <= endDate) {
          filteredResult = resultData.filter(result => {
              let resultDate = new Date(result.date).toISOString().slice(0, 10)
              return startDate <= resultDate && endDate >= resultDate
          })
      }
      if (resultData) {
        filteredResult.map(data=>{
          dataDisplayed.push({
            bilan: data.bilan,
            ETC: data.Etc,
            ET0: data.ET0,
            kc:data.kc,
            dates: data.date,
            RUmax: data.RUmax,
            RUmin: data.RUMin
  
          })

        })
      }
    })

    setChartData(dataDisplayed)
  }, [calculData])

  useEffect(() => {
    const getFieldById = async () => {
      try {
        const fieldId = location.pathname.split('/')[3]
       
          const response = await api.get(`/admin/fields/${fieldId}`)
          const data = await response.data.field
          setFieldData(data)
        
      } catch (error) { 
          console.log(error)
      }
    }

    getFieldById()
  },[]) 
  if (!calculData) {
    return <div>No data available</div>;
  }
  const extractDataForSimulation = (fieldData) => {
    if (fieldData) {
      const { Latitude, Longitude, crops, zones } = fieldData;
      const crop = crops[0];
      const irrigation = crop.irrigations[0];
      const zone = zones[0];
    
      return {
        DataIrrigations: [
          {
            drippers: irrigation.drippers,
            flowrate: irrigation.flowrate,
          },
        ],
        DataCrops: [
          {
            surface: crop.surface,
          },
        ],
        ruPratiqueData: zone.ruPratique || crop.practical_fraction,
        RUmaxData: zone.RUmax,
        dosePercentage: crop.dose_efficiency || 100, // Default to 100 if not provided
        effPluie: zone.effPluie,
        effIrrig: irrigation.effIrrig || zone.effIrrig,
        irrigArea: zone.irrigArea || crop.surface,
        days: crop.days,
        profondeur: crop.rootDepth,
        startPlantingDate: new Date(crop.plantingDate),
        rainConfig: {
          rainByDay: {}, // Fill with actual rain data if available
          rainByMonth: {}, // Fill with actual rain data if available
        },
        dataCrop: [{all_kc : crop.croptypes.all_kc}],
        latField: Latitude,
        lonField: Longitude,
        fieldsId: fieldData.id,
        // codeSensor: fieldData.sensors[0].code,
      };

    }
  };
  
  // API Call
  const sendSimulationData = async (data) => {
    const dataCalcul = {
      DataIrrigations: data.DataIrrigations,
      DataCrops: data.DataCrops,
      ruPratiqueData: data.ruPratiqueData,
      RUmaxData: data.RUmaxData,
      dosePercentage: data.dosePercentage,
      effPluie: data.effPluie,
      effIrrig: data.effIrrig,
      irrigArea: data.irrigArea,
      days: data.days,
      profondeur: data.profondeur,
      startPlantingDate: data.startPlantingDate,
      rainConfig: data.rainConfig,
      dataCrop: data.dataCrop,
      latField: data.latField,
      lonField: data.lonField,
      fieldsId: data.fieldsId,
      codeSensor: data.codeSensor,
    }
    try {
      const response = await api.post('/admin/calculSimulation', dataCalcul);
      const result = await response.json();
      console.log('Simulation Result:', result);
    } catch (error) {
      console.error('Error sending simulation data:', error);
    }
  };
  
  // Extract data and send to API
  const simulationData = extractDataForSimulation(fieldData);
  console.log(simulationData)

  //  sendSimulationData(simulationData);
  return (
    <>
        <Container className="p-4">
            <Row noGutters className="page-header py-4">
            <PageTitle
                sm="4"
                title={t('Water Balance Simulation')}
                // subtitle={t('Water Balance Simulation')}
                className="text-sm-left"
            />
            </Row>
            <Row className="mb-3">
                <Col xs={12} className="d-flex justify-content-end">
                    <Typography variant="body1" className="mr-2">{t('Edit Mode')}</Typography>
                    <Switch checked={isEditMode} onChange={() => setIsEditMode(!isEditMode)} />
                </Col>
            </Row>
            {
          calculData && calculData.map((data, index) => {
            let inputs = data.inputs
           return (
              <Card key={index} className="my-3">
                  <CardContent>
                      <Typography variant="h6" gutterBottom>
                          {t(`Simulation ${index + 1}`)}
                      </Typography>
                      <Row className='gap-2'>
                          <Col xs={12} sm={6} md={3}>
                              <TextField
                                  label="RU Pratique"
                                  value={inputs[0].ruPratique}
                                  onChange={(e) => handleChange(index, 'ruPratique', e.target.value)}
                                  fullWidth
                                  margin="normal"
                                  type="number"
                                  InputProps={{
                                    readOnly: !isEditMode,
                                }}
                              />
                          </Col>
                          <Col xs={12} sm={6} md={4}>
                              <TextField
                                  label="RU Max"
                                  value={inputs[0].RUmax}
                                   onChange={(e) => handleChange(index, 'RUmax', e.target.value)}
                                  fullWidth
                                  margin="normal"
                                  type="number"
                                  InputProps={{
                                    readOnly: !isEditMode,
                                }}
                              />
                          </Col>
                          <Col xs={12} sm={6} md={4}>
                              <TextField
                                  label="Effective Pluie"
                                  value={inputs[0].effPluie}
                                   onChange={(e) => handleChange(index, 'effPluie', e.target.value)}
                                  fullWidth
                                  margin="normal"
                                  type="number"
                                  InputProps={{
                                    readOnly: !isEditMode,
                                }}
                              />
                          </Col>
                          <Col xs={12} sm={6} md={4}>
                              <TextField
                                  label="Effective Irrigation"
                                  value={inputs[0].effIrrig}
                                   onChange={(e) => handleChange(index, 'effIrrig', e.target.value)}
                                  fullWidth
                                  margin="normal"
                                  type="number"
                                  InputProps={{
                                    readOnly: !isEditMode,
                                }}
                              />
                          </Col>
                          <Col xs={12} sm={6} md={4}>
                              <TextField
                                  label="Irrigation Area"
                                  value={inputs[0].irrigArea}
                                   onChange={(e) => handleChange(index, 'irrigArea', e.target.value)}
                                  fullWidth
                                  margin="normal"
                                  type="number"
                                  InputProps={{
                                    readOnly: !isEditMode,
                                }}
                              />
                          </Col>
                          <Col xs={12} sm={6} md={3}>
                              <TextField
                                  label="Profondeur"
                                  value={inputs[0].profondeur}
                                   onChange={(e) => handleChange(index, 'profondeur', e.target.value)}
                                  fullWidth
                                  margin="normal"
                                  type="number"
                                  InputProps={{
                                    readOnly: !isEditMode,
                                }}
                              />
                          </Col>
                          <Col xs={12} sm={6} md={3}>
                              <TextField
                                  label="Planting Date"
                                  value={inputs[0].plantingDate}
                                   onChange={(e) => handleChange(index, 'plantingDate', e.target.value)}
                                  fullWidth
                                  margin="normal"
                                  type="date"
                                  InputLabelProps={{ shrink: true }}
                                  InputProps={{
                                    readOnly: !isEditMode,
                                }}
                              />
                          </Col>
                      </Row>
                      <Row className="d-flex justify-content-center mt-4">
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleSave}
                            disabled={!isEditMode}
                        >
                            {t('Save Changes')}
                        </Button>
                    </Row>
                  </CardContent>
              </Card>
            )}
          )
                                
            }
           

            {
            isSaving ? <LinearProgress /> : 
            <>
             <Row>
            <Col lg="12" md="12" sm="12" className="mb-4">
              <Card>
                <Card.Body className="p-0">

                  <SimulationChart

                    data={chartData}

                  />
                </Card.Body>
              </Card>

            </Col>
            </Row>
            <Row>
                  <Col lg='12' md='12' sm='12'>
                    <Card>
                      <Card.Body>

                        <div style={{ height: 590 }}>
                          <Calendar
                            key={events.length}
                            localizer={localizer}
                            events={events}
                            culture="en-GB"
                            views={["month", "week", "day"]}
                            startAccessor="start"
                            endAccessor="end"
                            eventPropGetter={(event, start, end, isSelected) => ({
                              event,
                              start,
                              end,
                              isSelected,
                              style: { backgroundColor: "#26A6B7" }
                            })}
                          />
                        </div>

                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
            </>
            
            }
        </Container>
    </>
  )
}

export default CalculSimulation