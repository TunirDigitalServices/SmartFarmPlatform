import React, { useState, useEffect } from 'react'
import { Container, Row, Col, CardBody, CardHeader, Card, Dropdown, DropdownToggle, DropdownMenu, DropdownItem, Tooltip, FormInput, FormSelect, FormGroup, Form } from "shards-react";
import PageTitle from "../components/common/PageTitle";
import { useTranslation } from "react-i18next";
import LeafletMap from './map';
import { Line } from 'react-chartjs-2';
import SatteliteMap from './SatteliteMap';
import moment from 'moment';
import api from '../api/api';
import CircularProgress from '@mui/material/CircularProgress';
import { Box, LinearProgress } from '@mui/material';
import Button from '@mui/material/Button';
import SatelliteAltIcon from '@mui/icons-material/SatelliteAlt';
import ListAltIcon from '@mui/icons-material/ListAlt';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

const SatelliteImages = () => {
  const [coords, setCoords] = useState({
    Latitude: "",
    Longitude: "",
    zoom: "",
    center: [],
    fromAction: false
  })
  const [mapConfig, setMapConfig] = useState({
    zoom: "",
    center: [],
    fromAction: false,
    draw: {
      polygon: false,
      circle: false,
      rectangle: false,
      polyline: false,
      marker: false,
      circlemarker: false,
    }
  })
  const [dates, setDates] = useState([]);
  const [fields, setFields] = useState([])
  const [farms, setFarms] = useState([])
  const [selectedField, setSelectedField] = useState([])
  const [satellitesImages, setSatellitesImages] = useState([])
  const [selectedImages, setSelectedImages] = useState([])
  const [dataDisplayed, setDataDisplayed] = useState([])
  const [polygonDisplayed, setPolygonDisplayed] = useState([])

  const [selectedDate, setSelectedDate] = useState(moment().format('D MMM YYYY'));

  const getSatelliteImages = async () => {
    try {
        const fieldId = selectedField[0].Id
        const apiUrl = `/field/get-sattelite-images/${fieldId}`
        api.get(apiUrl)
          .then((response) => {
            const fetchedData = response.data.imagesData
            setSatellitesImages(fetchedData)
          })
          .catch((error) => {
            console.error('API error:', error);
          })
      
    } catch (error) {
      console.error('API error:', error);

    }

  }
  useEffect(() => {
    const getDataFields = async () => {
      await api.get('/field/fields').then(res => {
        const newData = res.data.farms;
        setFarms(newData)
        let Fields = [];
        newData.map(item => {
          let fields = item.fields
          if (fields) {
            fields.map(itemfield => {
              Fields.push({
                title: itemfield.name,
                status: itemfield.status,
                description: itemfield.description,
                Uid: itemfield.uid,
                farm_id: itemfield.farm_id,
                Latitude: itemfield.Latitude,
                Longitude: itemfield.Longitude,
                coordinates: itemfield.coordinates,
                Id: itemfield.id
              });
            })
          }
        });
        setFields(Fields)

      })
    }
    getDataFields()
  }, [])


  useEffect(() => {
    if(selectedField.length > 0){
      getSatelliteImages()

    }
  }, [selectedField])

  const { t, i18n } = useTranslation();

  useEffect(() => {
    // Generate an array of dates for the next 7 days
    const next7Days = Array.from({ length: 6 }, (_, index) =>
      moment().subtract(index, 'days').format('D MMM YYYY')
    );

    const ascendingDates = next7Days.reverse();

    setDates(ascendingDates);
  }, []);
  const handleDateClick = (date) => {
    setSelectedDate(date);
    const filteredData = satellitesImages.filter(data => moment(data.created_at).format('D MMM YYYY') === date && data.field_id === selectedField[0].Id);
    setSelectedImages(filteredData);
  };
  const getSelectedField = (e) => {
    const selectedId = e.target.value;
    const selected = fields && fields.filter(field => (
      field.Id == selectedId
    ))
    setSelectedField(selected)
  }

  useEffect(() => {

    const filtredData = satellitesImages.filter(data => {
      return moment(data.created_at).format('D MMM YYYY') === selectedDate && data.field_id === selectedField[0].Id

    })
    setSelectedImages(filtredData)

  }, [selectedDate, selectedField])

  const handleClick = (data) => {
    if (data) {
      setDataDisplayed(data.data)
      setPolygonDisplayed(data.polygon)
    }
  }

  


  return (
    <Container fluid className="main-content-container px-3 pb-2">
      <Row className="page-header py-2 mb-4">
        <PageTitle subtitle={t('overview')} title={t('Satellite Images')} className=" mb-1" />
      </Row>

      <Container className="main-content-container p-3 border bg-light rounded">
        <Row>
          <Col lg='8' md="12" sm="12">
            {/* <Row className="border-bottom pt-3">
              {dates.map((date, index) => (
                <Col lg="2" key={index}>
                  <p
                    onClick={
                      selectedField.length > 0
                        ? () => handleDateClick(date)
                        : undefined
                    }
                    style={{
                      border: '1px solid #ebebeb',
                      fontSize: 12,
                      textAlign: 'center',
                      borderRadius: 6,
                      padding: 3,
                      background: selectedDate === date ? '#8ad3dd' : 'transparent',
                      cursor: selectedField.length > 0 ? 'pointer' : 'not-allowed',
                    }}
                  >
                    {date}
                  </p>
                </Col>
              ))}
            </Row> */}
            <Row className="pt-4">
              <Col lg='12' md="12" sm="12">
                <SatteliteMap farms={farms} data={selectedField} satellitesImages={selectedImages} selectedData={dataDisplayed} drawn={polygonDisplayed} draw={mapConfig.draw} edit={mapConfig.edit} zoom={coords.zoom} center={coords.center} fromAction={coords.fromAction} />
              </Col>
            </Row>
          </Col>

          <Col lg='4' md="12" sm="12" className='my-2'>
            <Card className="mt-0" style={{ height: "100%" }}>
              {fields.length === 0

                ?

                <LinearProgress />

                :
                <>
                  <CardHeader className="border-bottom">
                    <FormSelect value={selectedField} onChange={getSelectedField}>
                      <option value="">{t('select_field')}</option>
                      {
                        fields.map(field => {
                          return (
                            <option key={field.Id} value={field.Id}>{field.title}</option>

                          )
                        })
                      }
                    </FormSelect>
                  </CardHeader>
                  <CardBody className="p-1">
                    {
                      selectedField.length > 0 && selectedField.map(field => {
                        return (
                          <>
                            <Row>
                              <Col  lg='12' md="12" sm="12">
                                <h5 style={{ fontSize: 14, textAlign: "center" }}>{t('lat')} <span style={{ fontWeight: 'bold', textAlign: "center" }}>{field.Latitude}</span></h5>
                              </Col>
                              <Col  lg='12' md="12" sm="12">
                                <h5 style={{ fontSize: 14, textAlign: "center" }}>{t('lon')} <span style={{ fontWeight: 'bold', textAlign: "center" }}>{field.Longitude}</span></h5>
                              </Col>
                            </Row>
                            <Row className="border-bottom">
                              <Col  lg='12' md="12" sm="12">
                                <h6 style={{ fontSize: 14, textAlign: "center" }}>{t('name_field')} <br /> <span style={{fontWeight: 'bold', textAlign: "center" }}>{field.title}</span></h6>
                              </Col>

                            </Row>

                          </>

                        )
                      })
                    }
                    {
                      selectedField.length === 0 && (
                        <div style={{ color: '#bebebe',display:'flex',justifyContent: 'center',alignItems:'center',flexDirection:'column',padding: '10px'}}>
                         <p style={{ color: '#bebebe' ,textAlign:"center"}}>{t('message_image')}</p>
                         <i className="fas fa-satellite" style={{ fontSize: "40px" }}></i>
                        </div>
                      )
                    }
                    <Row className="my-2" >
                      <Col lg='12' md="12" sm="12">
                        {
                          selectedField.length > 0 && (
                            <>
                            <h5 style={{ fontSize: 14, textAlign: "center" }}> Satellite Images List</h5>
                            <Calendar
                              onChange={(date) => handleDateClick(moment(date).format('D MMM YYYY'))}
                              value={selectedDate ? new Date(moment(selectedDate, 'D MMM YYYY')) : null}
                              locale={localStorage.getItem('local') ? `${localStorage.getItem('local')}-${localStorage.getItem('local').toUpperCase()}` : 'en-EN'}
                              tileContent={({ date, view }) => {
                                const formattedDate = moment(date).format('D MMM YYYY');
                                const hasSatelliteImages = satellitesImages.some(data => moment(data.created_at).format('D MMM YYYY') === formattedDate);

                                return view === 'month' && hasSatelliteImages ? (
                                  <span style={{ fontWeight: 'bold' , color:'#29B2C4' }}>•</span>
                                ) : null;
                              }}
                            />
                            </>
                          )
                        }
                      </Col>

                    </Row>




                  </CardBody>
                </>
              }

            </Card>

          </Col>

        </Row>

      </Container>
    </Container>
  )
}

export default SatelliteImages