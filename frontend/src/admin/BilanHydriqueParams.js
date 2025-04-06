import React, { useEffect, useState } from 'react'
import { Container, Row, Col, Card, CardHeader, CardBody, FormInput, FormSelect } from 'shards-react'
import PageTitle from '../components/common/PageTitle'
import api from '../api/api'
import moment from "moment"

const BilanHydriqueParams = () => {

    const [data, setData] = useState([])
    const [weather, setWeather] = useState([])
    const [rainData, setRainData] = useState([])
    const [InputData, setInputsData] = useState({
        city: [],
        lat :"",
        lon:"",
    })
    const [cropData,setCropData] = useState([])

    useEffect(() => {
        const getData = async () => {
            await api.get('/admin/get-weatherData')
                .then(response => {
                    let dataWeather = response.data.data
                    setData(dataWeather)
                    let rain = {}
                    let citiesData = {}
                    for (let index = 0; index < dataWeather.length; index++) {
                        let weatherData = JSON.parse(dataWeather[index].weather_data)
                        let rainData = JSON.parse(dataWeather[index].rain_data)
                        rain = rainData
                        citiesData = weatherData
                    }
                    setWeather(citiesData)
                    setRainData(rain)
                }).catch((err) => {
                    console.log(err)
                })
        }

        getData()
        const getCitiesList = async () => {
            await api.get('/cities/list-cities')
                .then(response => {
                    let cities = response.data.Cities
                    if (response && response.data.type === "success") {
                        setInputsData({ city: cities })
                    }
                }).catch(err => {
                    console.log(err)
                })
        }

        getCitiesList()

        const getCropType = async () => {
            try {
                await api.get('/croptype/list-crop')
                .then(response=>{
                    if(response){
                        let dataCrop = response.data.Croptype
                        setCropData(dataCrop)
                    }
                })
                 
            } catch (error) {
                    console.log(error)
            }   
        }
        getCropType()
    }, [])



    return (
        <Container fluid className="main-content-container px-4">
            <Row noGutters className="page-header py-4">
      <PageTitle
        sm="4"
        title="Bilan Hydrique"
        className="text-sm-left"
      />
    </Row>
            <Row className="py-4">
                <Col lg='6' md='12' sm='12'>
                    <Card>
                        <CardHeader className="border-bottom d-flex justify-content-between align-items-center">
                            <FormSelect>
                                {
                                    InputData.city && InputData.city.map(city => {
                                        let cityName = ""
                                        let Lat = ""
                                        data.map(data => {
                                            if (data.city_id === city.id) {
                                                cityName = city.city
                                            }
                                        })
                                        return (
                                            <option value={cityName}>{city.city}</option>
                                        )
                                    })
                                }
                            </FormSelect>
                            <FormInput className="m-1" value={InputData.lat} placeholder="Latitude" />
                            <FormInput value="" placeholder="Longitude" />

                        </CardHeader>
                        <CardBody>
                            <Row className="m-2 p-2 text-center d-flex justify-content-center align-items-center">
                                <Col lg='4' md='12' sm='12'>
                                    <p className='border-bottom'>
                                        Month
                                    </p>
                                    {
                                        Object.keys(weather).map(month => {
                                            return (
                                                <h6 style={{ textTransform: "capitalize" }}>
                                                    {month}
                                                </h6>
                                            )
                                        })
                                    }

                                </Col>
                                <Col className="border-left" lg='4' md='12' sm='12'>
                                    <p className='border-bottom'>
                                        Temp Moy
                                    </p>
                                    {
                                        Object.values(weather).map(month => {
                                            let tempMoy = (Number(month.temp_max) + Number(month.temp_min)) / 2
                                            return (
                                                <FormInput value={parseFloat(tempMoy).toFixed(1)} />
                                            )
                                        })
                                    }

                                </Col>
                                <Col className="border-left" lg='4' md='12' sm='12'>
                                    <p className='border-bottom'>
                                        Humidity
                                    </p>
                                    {
                                        Object.values(weather).map(month => {
                                            return (
                                                <FormInput value={month.humidity} />
                                            )
                                        })
                                    }

                                </Col>
                            </Row>

                        </CardBody>
                    </Card>
                </Col>
                  <Col lg='6' md='12' sm='12' >
                    <Card>
                        <CardHeader className="border-bottom d-flex justify-content-between align-items-center flex-column">
                            <div className='d-flex justify-content-between align-items-center'>
                            <FormSelect>
                                {
                                   cropData.map(crop=>{
                                        return (
                                            <option value="">{crop.crop}</option>
                                        )
                                    })
                                }

                            </FormSelect>
                            {
                                cropData.map(crop=>{
                                    return(
                                        <FormInput className="m-1" value={moment(crop.plant_date).locale('En').format("Do MMMM")} placeholder="Planting date" />
                                    )
                                })
                            }

                            </div>
                            <div className='d-flex justify-content-between align-items-center flex-column'>
                                        <div className='m-2 d-flex justify-content-center align-items-center'>
                                            <h6 className='m-1'>Kc</h6>
                                                <FormInput className="m-1" value="0.65"  placeholder="" />
                                                <FormInput className="m-1"  value="0.70"  placeholder="" />
                                                <FormInput className="m-1"  value="0.70" placeholder="" />
                                            </div>


                                {
                                     cropData.map(crop=>{
                                        return (
                                            <div className='m-2 d-flex justify-content-center align-items-center'>
                                            <h6 className='m-1'> Days</h6>
                                                <FormInput className="m-1" value={crop.init} placeholder="" />
                                                <FormInput className="m-1" value={crop.dev} placeholder="" />
                                                <FormInput className="m-1" value={crop.mid} placeholder="" />
                                                <FormInput className="m-1" value={crop.late} placeholder="" />
                                            </div>

                                            )
                                    })
                                }


                            </div>
                        </CardHeader>
                    </Card>
                    <Card className="my-4">
                        <CardHeader className="border-bottom d-flex justify-content-between align-items-center">
                            <FormSelect>
                                {
                                    InputData.city && InputData.city.map(city => {
                                        let cityName = ""
                                        let Lat = ""
                                        data.map(data => {
                                            if (data.city_id === city.id) {
                                                cityName = city.city
                                            }
                                        })
                                        return (
                                            <option value={cityName}>{city.city}</option>
                                        )
                                    })
                                }
                            </FormSelect>

                        </CardHeader>
                        <CardBody>
                            <Row className="m-2 p-2 text-center d-flex justify-content-center align-items-center">
                                <Col lg='4' md='12' sm='12'>
                                    <p className='border-bottom'>
                                        Month
                                    </p>
                                    {
                                        Object.keys(rainData).map(month => {
                                            return (
                                                <h6 style={{ textTransform: "capitalize" }}>
                                                    {month}
                                                </h6>
                                            )
                                        })
                                    }

                                </Col>                            
                                <Col className="border-left" lg='4' md='12' sm='12'>
                                    <p className='border-bottom'>
                                       Rain
                                    </p>
                                    {
                                        Object.values(rainData).map(rain => {
                                            return (
                                                <FormInput value={rain.rain} />
                                            )
                                        })
                                    }

                                </Col>
                            </Row>

                        </CardBody>
                    </Card>
                  </Col>                      
            </Row>
        </Container>
    )
}

export default BilanHydriqueParams