import React, { useState, useEffect } from 'react'
import { Container, Row, Col, Card, CardHeader, CardBody, Form, FormGroup, FormCheckbox, FormInput, FormSelect, Button } from 'shards-react'
import PageTitle from "./PageTitle";
import { useTranslation } from "react-i18next";
import Chart from '../blog/Chart'
import api from '../../api/api';
import useGeoLocation from '../../utils/useGeoLocation'


const BilanHydrique = () => {

    const [weather,setWeather] = useState({})
    const [listCrop , setListCrop] = useState([])

    const [InputsData, setInputsData] = useState({
        Kc : 0.5,
        ET0 : 2,
        surfaceIrrig: 1,
        RUmax: 100,
        Profondeur: 0.6,
        effPluie: 80,
        ruPratique: 50,
        effIrrig: 70,
        city: [],
        cropType: "",
        cropVariety: "",
        temperature  : null





    })

    const location = useGeoLocation()





    const [checked,setChecked] = useState(false)
    
   const handleChange = () => {
    setChecked(!checked)
        if(checked === false) setCoord({lat : location.coordinates.lat , lon : location.coordinates.lng})
        if(checked === true) setCoord({lat : "" , lon : ""})
    }

    const [coord,setCoord] = useState({lat : '' , lon :''})



    const { t, i18n } = useTranslation();

    let ETC = Number(InputsData.ET0) * Number(InputsData.Kc)
    let RuMax = Number(InputsData.RUmax) * Number(InputsData.Profondeur);
    let RuInitial = Number(InputsData.RUmax) * Number(InputsData.Profondeur);
    let Epuisement_maximal = (Number(InputsData.RUmax) * Number(InputsData.Profondeur) * Number(InputsData.ruPratique)) / 100
    let RuMin = Number(RuMax) - Number(Epuisement_maximal)
    let NbrIrrigation

    let HauteurEauIrrigation
    let VolumeIrrigation
    let VolumeTotalEauIrrigation
    let PluieTotal
    let EvopoTotal
    let Deficit

        const getCitiesList = () => {
            api.get('/cities/list-cities')
            .then(response=>{
                let cities = response.data.Cities
                if(response && response.data.type === "success"){
                    setInputsData({city : cities})
                }
            }).catch(err=>{
                console.log(err)
            })
        }   

    const getWeather = () => {
       let data = {
        lat : coord.lat,
        lon : coord.lon,
        type : 'forecast'
       }
        api.post('/weather/get-data',data)
        .then(response=>{
            let weatherData = response.data.data
            let listForecast = weatherData.list;
              let days = [];
            for(let i = 0; i < listForecast.length; i+=8) { 
                var temp = {};
                temp.date = new Date(listForecast[i+5].dt_txt);
                temp.rain = listForecast[i].rain;
                temp.temp = ((listForecast[i].main.feels_like)).toFixed(0);
                temp.temp_max = ((listForecast[i].main.temp_max)).toFixed(0);
                temp.temp_min = ((listForecast[i].main.temp_min)).toFixed(0);
                temp.humidity = listForecast[i].main.humidity;
                temp.pressure = listForecast[i].main.pressure;
                temp.wind = listForecast[i].wind.speed;
                temp.main = listForecast[i].weather[0].main;
                temp.description = listForecast[i+3].weather[0].description;
                temp.icon = listForecast[i].weather[0].icon;
                days.push(temp);
                }   
            setWeather(days)

            


        }).catch(error=>{
            console.log(error)
        })
    }


    useEffect(()=>{
        getCitiesList()

        const getCropType = async () => {
            try {
                await api.get('/croptype/list-crop')
                .then(response=>{
                    if(response){
                        let dataCrop = response.data.Croptype
                        setListCrop(dataCrop)
                    }
                })
                 
            } catch (error) {
                    console.log(error)
            }   
        }
        getCropType()
    },[])

    useEffect(()=>{
        getWeather()
    },[coord.lat,coord.lon])



    return (
        <Container fluid className="main-content-container p-4">
            <Row noGutters className="page-header py-4">
                <PageTitle
                    sm="4"
                    title={t('My Water Balance')}
                    subtitle={t('overview')}
                    className="text-sm-left"
                />
            </Row>
            <Row className='text-center'>
                <Col lg='4' md="12" sm="12">
                    <Card>
                        <CardHeader className="border-bottom">
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "flex-start",
                                    width: "auto",
                                    float: "left"
                                }}
                            >
                                <h6 className="m-0">{t('Configuration')}</h6>{" "}
                            </div>
                        </CardHeader>
                        <CardBody>
                            <Row form className="py-2 m-2">
                                <Col lg="12" md="8" sm="8">
                                    <FormGroup>
                                    <FormCheckbox
                                        checked={checked}
                                        onChange={handleChange}
                                        toggle
                                     >
                                       Assign to my position
                                    </FormCheckbox>
                                    {
                                        checked
                                        ?
                                        null
                                        :
                                        <>
                                        <label htmlFor="city">City</label>
                                        <FormSelect value={coord} onChange={e => setCoord({lat :  e.target.value.split(",")[0],lon : e.target.value.split(",")[1] })} id="city">
                                             {
                                               InputsData.city && InputsData.city.map(city=>{
                                                    return (
                                                        <option value={`${city.lat},${city.lon}`}>{city.city}</option>

                                                    )
                                                })
                                            }
                                        </FormSelect>
                                        </>
                                    }

                                    </FormGroup>

                                </Col>
                            </Row>
                            <Row form className="py-2 m-2">

                                <Col lg="6" md="8" sm="8">
                                    <FormGroup>
                                        <label htmlFor="cropType">Crop Type</label>
                                        <FormSelect  id="cropType">
                                            {
                                                listCrop.map(cropType=>(
                                                    <option style={{textTransform : "capitalize"}} value="">{cropType.crop}</option>
                                                    
                                                    ))
                                            }

                                         </FormSelect>   


                                    </FormGroup>

                                </Col>
                                <Col lg="6" md="8" sm="8">
                                    <FormGroup>
                                        <label htmlFor="cropVariety">Crop Variety</label>
                                        <FormInput value={InputsData.cropVariety || ''} onChange={e => setInputsData({ ...InputsData, cropVariety: e.target.value })} id="cropVariety" placeholder="Crop Variety" />

                                    </FormGroup>

                                </Col>
                            </Row>
                            <Row form className="py-2 m-2">
                                <Col lg="12" md="8" sm="8">
                                    <FormGroup>
                                        <label htmlFor="surfaceIrrig">Surface irriguée</label>
                                        <FormInput value={InputsData.surfaceIrrig || ''} onChange={e => setInputsData({ ...InputsData, surfaceIrrig: e.target.value })} id="surfaceIrrig" placeholder="Surface irriguée" />

                                    </FormGroup>

                                </Col>
                            </Row>

                            <Row form className="py-2 m-2">
                                <Col lg="6" md="8" sm="8">
                                    <FormGroup>
                                        <label htmlFor="ruMax">RU max</label>
                                        <FormInput value={InputsData.RUmax || ''} onChange={e => setInputsData({ ...InputsData, RUmax: e.target.value })} id='ruMax' placeholder="RU max" />

                                    </FormGroup>

                                </Col>
                                <Col lg="6" md="8" sm="8">
                                    <FormGroup>
                                        <label htmlFor="z">z (Profondeur)</label>
                                        <FormInput value={InputsData.Profondeur || ''} onChange={e => setInputsData({ ...InputsData, Profondeur: e.target.value })} id='z' placeholder="Profondeur" />

                                    </FormGroup>

                                </Col>


                            </Row>
                            <Row form className="py-2 m-2">


                                <Col lg="12" md="8" sm="8">
                                    <FormGroup>
                                        <label htmlFor="effPluie">Efficacité de la pluie</label>
                                        <FormInput value={InputsData.effPluie || ''} onChange={e => setInputsData({ ...InputsData, effPluie: e.target.value })} id='effPluie' placeholder="Efficacité de la pluie" />

                                    </FormGroup>
                                </Col>


                            </Row>
                            <Row form className="py-2 m-2">
                                <Col lg="6" md="8" sm="8">
                                    <FormGroup>
                                        <label htmlFor="ruPratique">Fraction RU pratique</label>
                                        <FormInput value={InputsData.ruPratique || ''} onChange={e => setInputsData({ ...InputsData, ruPratique: e.target.value })} id='ruPratique' placeholder="Fraction RU pratique" />

                                    </FormGroup>

                                </Col>
                                <Col lg="6" md="8" sm="8">
                                    <FormGroup>
                                        <label htmlFor="effIrrig">Efficience de l'irrigation</label>
                                        <FormInput value={InputsData.effIrrig || ''} onChange={e => setInputsData({ ...InputsData, effIrrig: e.target.value })} id='effIrrig' placeholder="Efficience de l'irrigation" />

                                    </FormGroup>

                                </Col>


                            </Row>
                            <Row form className="py-2 m-2"> 
                            <Col lg="12" md="8" sm="8">
                                    <FormGroup>
                                        <label htmlFor="days">Days</label>
                                        {
                                                listCrop.map(cropType=>(
                                                    <FormInput value={cropType.total || ''} id='days' placeholder="Days" />
                                                    
                                                    ))
                                        }

                                    </FormGroup>

                                </Col>
                            </Row>


                        </CardBody>
                    </Card>
                </Col>
                <Col lg='8' md="12" sm="12">
                    <Card>
                        <CardHeader className="border-bottom">
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "flex-start",
                                    width: "auto",
                                    float: "left"
                                }}
                            >
                                <h6 className="m-0">{t('Water Report')}</h6>{" "}
                            </div>


                        </CardHeader>
                        <CardBody>
                            <Row className="border-bottom">
                                <Row className="py-2 m-2">
                                    <Col lg="3" md="8" sm="8" className="form-group">
                                        <FormInput value={RuMax} placeholder="RU max" />
                                    </Col>
                                    <Col lg="3" md="8" sm="8" className="form-group">
                                        <FormInput value={RuInitial} placeholder="RU initiale" />
                                    </Col>
                                    <Col lg="3" md="8" sm="8" className="form-group">
                                        <FormInput value={Epuisement_maximal} placeholder="Epuisement maximal" />
                                    </Col>
                                    <Col lg="3" md="8" sm="8" className="form-group">
                                        <FormInput value={RuMin} placeholder="RU min" />
                                    </Col>
                                </Row>
                                <Row className="py-2 m-2">
                                    <Col lg="3" md="8" sm="8" className="form-group">
                                        <FormInput placeholder="Nombre d'irrigations" />
                                    </Col>
                                    <Col lg="3" md="8" sm="8" className="form-group">
                                        <FormInput placeholder="Hauteur d'eau des irrigations" />
                                    </Col>
                                    <Col lg="3" md="8" sm="8" className="form-group">
                                        <FormInput placeholder="Volume des irrigations" />
                                    </Col>
                                    <Col lg="3" md="8" sm="8" className="form-group">
                                        <FormInput placeholder="Volume Total d'eau d'irrigation" />
                                    </Col>
                                </Row>
                                <Row className="py-2 m-2">
                                    <Col lg="3" md="8" sm="8" className="form-group">
                                        <FormInput placeholder="Pluie total" />
                                    </Col>
                                    <Col lg="3" md="8" sm="8" className="form-group">
                                        <FormInput placeholder="Evapotranspiration totale" />
                                    </Col>
                                    <Col lg="3" md="8" sm="8" >
                                        <FormInput placeholder="Déficit" />
                                    </Col>
                                    <Col lg="3" md="8" sm="8" >
                                        <FormInput placeholder="Nbr des jours" />
                                    </Col>
                                </Row>
                            </Row>
                            <Row className="py-2 text-center">
                                <Col lg="12" md="8" sm="8">
                                    <h6>Water Balance Chart</h6>
                                    <Chart />
                                
                                </Col>

                            </Row>


                        </CardBody>
                    </Card>
                </Col>
            </Row>
        </Container>
    )
}

export default BilanHydrique