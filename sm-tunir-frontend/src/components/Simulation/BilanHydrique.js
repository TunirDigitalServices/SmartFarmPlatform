import React, { useState, useEffect} from 'react'
import { Container, Row, Col, Card,Form, 
     Nav, NavItem, NavLink, Button } from 'react-bootstrap'
import PageTitle from "../common/PageTitle";
import { useTranslation } from "react-i18next";
import api from '../../api/api';
import moment from 'moment';
import WaterChart from './WaterChart';
import position from '../../assets/images/pin.png'
import soil from "../../assets/images/soil.png"
import crop from "../../assets/images/crop.png"
import LoadingSpinner from "../common/LoadingSpinner"
import swal from 'sweetalert';
import { useNavigate } from 'react-router';

const BilanHydrique = () => {
    const navigate=useNavigate()
    const [isLoading,setIsLoading] = useState(false)
    const [toggle, setToggle] = useState(true)
    const [pluie, setPluie] = useState({})
    const [irrigatedAlready, setIrrigatedAlready] = useState({})
    const [Pe, setPe] = useState({})
    const [sumNbrIrrig, setSumNbrIrrig] = useState(0)
    const [sumIrrig, setSumIrrig] = useState(0)
    const [sumPluie, setSumPluie] = useState(0)
    const [sumETC, setSumETC] = useState(0)

    const [chartData, setChartData] = useState([])
    const [allKc, setAllKc] = useState([])
    const [allDaysWeather, setAllDaysWeather] = useState([])

    const [allVarieties, setAllVarieties] = useState([])

    const [elemValue, setElemValue] = useState('name')

    const [weather, setWeather] = useState({})
    const [listCrop, setListCrop] = useState([])
    const [InputsData, setInputsData] = useState({
        Kc: "",
        ET0: "",
        surfaceIrrig: "",
        RUmax: "",
        Profondeur: "",
        effPluie: "",
        ruPratique: "",
        effIrrig: "",
        country: "",
        cities: [],
        city: "",
        cropType: "",
        cropVariety: [],
        variety: '',
        days: "",
        plantingDate: "",
        soilType: "",
        temperature: null,
        kcList: [],
        daysWeather: []

    })

    const [nameError, setNameError] = useState(null)
    const [cropError, setCropError] = useState(null)
    const [soilError, setSoilError] = useState(null)
    const [cityError, setCityError] = useState(null)
    const [error, setError] = useState(null)


    const [coord, setCoord] = useState({ lat: '', lon: '' })
    const [allSoils, setAllSoils] = useState([])
    const [allCountry, setAllCountry] = useState([])
    const [allCity, setAllCity] = useState([])


    const [dataSimulation,setDataSimulation] = useState({
        name : "",
        cityId :"",
        cropTypeId :"",
        soilTypeId :"",
        cropVarietyId :""
    })

    const { t, i18n } = useTranslation();

    let ETC = Number(InputsData.ET0) * Number(InputsData.Kc)
    let RuMax = Number(InputsData.RUmax) * Number(InputsData.Profondeur);
    let RuInitial = Number(InputsData.RUmax) * Number(InputsData.Profondeur);
    let Epuisement_maximal = (Number(InputsData.RUmax) * Number(InputsData.Profondeur) * Number(InputsData.ruPratique)) / 100
    let RuMin = Number(RuMax) - Number(Epuisement_maximal)
    let VolumeIrrigation = sumIrrig * 10
    let VolumeTotalEauIrrigation = Number(VolumeIrrigation) * Number(InputsData.surfaceIrrig)
    let Deficit = sumETC - sumPluie


    const getVarieties = async () => {
        try {
            await api.get('/varieties/get-varieties')
                .then(response => {
                    if (response.data.type === "success") {
                        let listVarieties = response.data.Varieties
                        setAllVarieties(listVarieties)

                    }
                }).catch(error => {
                    console.log(error)
                })

        } catch (error) {
            console.log(error)
        }
    }


    const getCitiesList = async () => {
        await api.get('/cities/list-cities')
            .then(response => {
                let cities = response.data.Cities
                if (response && response.data.type === "success") {
                    setAllCity(cities)
                }
            }).catch(err => {
                console.log(err)
            })
    }

    // useEffect(() => {
    //     getWeather()
    // }, [coord.lat, coord.lon])

    useEffect(() => {
        getCitiesList()

        const getCropType = async () => {
            try {
                await api.get('/croptype/list-crop')
                    .then(response => {
                        if (response) {
                            let dataCrop = response.data.Croptype
                            setListCrop(dataCrop)
                        }
                    })

            } catch (error) {
                console.log(error)
            }
        }
        const getSoils = async () => {
            try {
                await api.get('/soils/get-soils')
                    .then(response => {
                        let listSoils = response.data.Soils
                        setAllSoils(listSoils)
                        let Ru = ""
                        if (listSoils) {
                            listSoils.map(item => {
                                Ru = item.ru
                            })
                            setInputsData({ ...InputsData, RUmax: Ru })
                        }
                    }).catch(error => {
                        console.log(error)
                    })

            } catch (error) {
                console.log(error)
            }
        }
        const getCountries = async () => {
            try {
                await api.get('/countries/get-countries')
                    .then(response => {
                        if (response.data.type === "success") {
                            let listCountries = response.data.Countries
                            setAllCountry(listCountries)

                        }
                    }).catch(error => {
                        console.log(error)
                    })

            } catch (error) {
                console.log(error)
            }
        }
        getVarieties()
        getCountries()
        getSoils()
        getCropType()
    }, [])

    // useEffect(() => {
    //     let sum = Object.values(pluie).reduce((a, v) => a + Number(v), 0)
    //     setSumPluie(sum)
    // }, [pluie])

    const getWeather = () => {
        let data = {
            lat: coord.lat,
            lon: coord.lon,
            type: 'forecast'
        }
        api.post('/weather/get-data', data)
            .then(response => {
                let weatherData = response.data.data
                let listForecast = weatherData.list;
                let days = [];
                for (let i = 0; i < listForecast.length; i += 8) {
                    var temp = {};
                    temp.date = new Date(listForecast[i + 5].dt_txt);
                    temp.rain = listForecast[i].rain;
                    temp.temp = ((listForecast[i].main.feels_like)).toFixed(0);
                    temp.temp_max = ((listForecast[i].main.temp_max)).toFixed(0);
                    temp.temp_min = ((listForecast[i].main.temp_min)).toFixed(0);
                    temp.humidity = listForecast[i].main.humidity;
                    temp.pressure = listForecast[i].main.pressure;
                    temp.wind = listForecast[i].wind.speed;
                    temp.main = listForecast[i].weather[0].main;
                    temp.description = listForecast[i + 3].weather[0].description;
                    temp.icon = listForecast[i].weather[0].icon;
                    days.push(temp);
                }
                setWeather(days)


            }).catch(error => {
                console.log(error)
            })
    }






    const handleSoilPick = (value) => {
        if(value){
            setDataSimulation({...dataSimulation , soilTypeId : value})
        }
        const soilType = allSoils.find(
            (soil) => soil.id == value
        );
        if (typeof soilType !== "undefined") {
            setInputsData({
                ...InputsData,
                soilType: soilType.soil,
                RUmax: soilType.ru,
                effIrrig: soilType.fc,
                ruPratique: soilType.practical_fraction,
                effPluie: soilType.rain_eff
            });

        }
    };

    const handleCropPick = (value) => {
        if(value){
            setDataSimulation({...dataSimulation , cropTypeId : value})
        }
        const crop = listCrop.find(
            (crop) => crop.id == value
        );
        let varieties = []
        if (crop) {
            const variety = allVarieties.map((variety) => {
                if (variety.crop_id === crop.id) {
                    varieties.push({
                        variety: variety.crop_variety
                    })
                }

            });
            setInputsData({
                ...InputsData,
                cropType: crop.crop,
                variety: '',
                cropVariety: varieties,
                Profondeur: crop.root_max,
                days: crop.total,
                plantingDate: crop.plant_date.slice(0, 11).replace('T', ''),
                kcList: crop.all_kc
            });

        }
    };

    const handleVarietyPick = (e) => {
        e.preventDefault();
        const variety = allVarieties.find(
            (variety) => variety.crop_variety === e.target.value

        )
        if (variety) {
            setInputsData({
                ...InputsData,
                cropType: "",
                variety: variety.crop_variety,
                Profondeur: variety.root_max,
                days: variety.total,
                plantingDate: variety.plant_date.slice(0, 11).replace('T', ''),
                kcList: variety.all_kc
            });
        }
    };


    const handleCountryPick = (e) => {
        e.preventDefault();
        const country = allCountry.find(
            (country) => country.iso === e.target.value
        );
        let cities = []
        if (country) {
            const city = allCity.map((city) => {
                if (city.iso === country.iso) {
                    cities.push({
                        city: city.city,
                        id : city.id
                    })
                }

            });

            setInputsData({
                ...InputsData,
                country: country.iso,
                cities: cities
            });

        }

    };

    const handleCityPick = (e) => {
        e.preventDefault();
        const city = allCity.find(
            (city) => city.name === e.city.value
        );
        if (city) {
            setInputsData({
                ...InputsData,
                city: city.city,
                daysWeather: city.weather_data_days
            });

        }
    };


    const onChangeHandler = (value,indx) => {
        setPluie(state => ({ ...state, [indx]: value }))
        let formulePe = Number(value) * Number(InputsData.effPluie) / 100
        setPe(state => ({ ...state, [indx]: formulePe }))

    }
    
    const onChangeHandlerIrrigated = (value, indx) => {
        setIrrigatedAlready(state => ({...state,[indx] :value }) )
        if(value){
            let formulePe = Number(value) * Number(InputsData.effPluie) / 100
            setPe(state => ({ ...state, [indx]: formulePe }))

        }

    }


    // useEffect(()=>{
    //     let daysWeatherArray = []
    //         InputsData.daysWeather.map(weather=>{
    //             daysWeatherArray .push(allKc)
    //         })
    //         setAllDaysWeather(daysWeatherArray)
    // },[InputsData.daysWeather])

    // useEffect(() => {
    //     let kcArray = []
    //     InputsData.kcList.map(kc => {
    //         let allKc = kc.kc
    //         kcArray.push(allKc)
    //     })
    //     setAllKc(kcArray)
    // }, [InputsData.kcList])

    const tableHydrique = (n) => {
        var elements = [];
        let resultFormule = []
        let kc = 0.7
        let ET0 = 2
        let ETC = 0
        let bilanHydrique = 0
        let Irrigation = 0
        let firstFormule = 0
        let formule = 0
        let firstFormuleIrrig = 0
        let formuleIrrig = 0
        let IrrigationNbr = 0
        let sumIrrig = 0
        let sumNbrIrrig = 0
        let sumETC = 0


        for (let i = 1, j = n; i <= n; i++, j--) {
            ETC = Number(allKc[i - 1]) * Number(ET0)
            let prevResultBilan = 0
            firstFormule = (Number(RuInitial) + Number(Pe[i])) - Number(ETC)

            if (i > 1) {
                prevResultBilan = resultFormule[(i - 1) - 1]
                formule = (Number(prevResultBilan) + Number(Pe[i])) - (Number(ETC) + 0)
                formuleIrrig = ((Number(RuMax) - Number(prevResultBilan)) + Number(ETC)) / InputsData.effIrrig
            }
            firstFormuleIrrig = (Number(RuMax) - Number(firstFormule)) / InputsData.effIrrig
            if (i === 1) {
                if (firstFormule <= RuMax) {
                    bilanHydrique = firstFormule
                } else {
                    bilanHydrique = RuMax
                }
                if (RuInitial <= RuMin) {
                    Irrigation = firstFormuleIrrig
                } else {
                    Irrigation = 0
                }
            } else {
                if (formule <= RuMax) {
                    bilanHydrique = formule
                } else {
                    bilanHydrique = RuMax
                }
                if (prevResultBilan <= RuMin) {
                    Irrigation = formuleIrrig
                } else {
                    Irrigation = 0
                }
            }

            if (Irrigation === 0) {
                IrrigationNbr = 0
            } else {
                IrrigationNbr = 1
            }
            let dates = moment(InputsData.plantingDate).add(i - 1, 'days').format("YYYY-MM-DD")
            elements.push(
                <tbody>
                    <tr>
                        <td>{i}</td>
                        <td>{dates}</td>
                        <td>{parseFloat(allKc[i - 1]).toFixed(2)}</td>

                        <td>{ET0}</td>
                        <td> <input
                            name={i}
                            key={i}
                            className='my-1'
                            style={{outline: 'none', border: '1px solid #e4e4e4' }}
                            value={pluie.i}
                            onChange={(e) => onChangeHandler(e.target.value, i)}
                        />
                        </td>
                        <td>
                        <input
                            name={i}
                            key={i}
                            className='my-1'
                            style={{outline: 'none', border: '1px solid #e4e4e4' }}
                            value={irrigatedAlready.i}
                            onChange={(e) => onChangeHandlerIrrigated(e.target.value, i)}
                        />  
                        </td>
                        <td>{parseFloat(ETC).toFixed(2)}</td>
                        <td>{Pe[i]}</td>
                        <td>{`${parseFloat(bilanHydrique).toFixed(1)}`}</td>
                        <td>{parseFloat(Irrigation).toFixed(2)}</td>
                        <td>{IrrigationNbr}</td>
                    </tr>

                </tbody>
            );



            resultFormule.push(bilanHydrique)
            if (ETC) {
                sumETC = sumETC + ETC

            }
            if (Irrigation > 0) {
                sumNbrIrrig = sumNbrIrrig + IrrigationNbr
                sumIrrig = sumIrrig + Irrigation
            }


        }
        
        return elements;
    }
    
    const isValidInputs = () => {
        let cityError = ""
        let nameError = ""
        let cropError = ""
        let soilError = ""
        let error= ''
        if (dataSimulation.cityId === "") {
            cityError = `${t('city_error')}`;
            error= `${t('city_error')}`

            setCityError(cityError)
            setError(error)
        }
        if (dataSimulation.name === "") {
            nameError = `${t('name_error')}`;
            error= `${t('name_error')}`
            setNameError(nameError)
            setError(error)

        }
        if (InputsData.cropType === "") {
            cropError = `${t('croptype_error')}`;
            error= `${t('croptype_error')}`
            setCropError(cropError)
            setError(error)

        }
        if (InputsData.soilType ==="") {
            soilError = `${t('soiltype_error')}`;
            error= `${t('soiltype_error')}`
            setSoilError(soilError)
            setError(error)

        }
        if(soilError || cropError || cityError || nameError){
            setSoilError(soilError)
            setCropError(cropError)
            setNameError(nameError)
            setCityError(cityError)
            setError(error)
            return false;

        }else{
            setSoilError('')
            setCropError('')
            setNameError('')
            setCityError('')
            setError('')
        }
        
         return true;
    }
    const returnInputs = () => {
        switch (elemValue) {
            case "name":
                return (

                    <Form.Group>
                        <label htmlFor="name">{t('name')}</label>
                        <Form.Control id="name" placeholder={t('name')} value={dataSimulation.name} className={`form-control form-control-md ${nameError ? "is-invalid" : ""}`}  onChange={(e) => setDataSimulation({...dataSimulation , name : e.target.value})} />
                    </Form.Group>

                )
            case "pos":
                return (
                    <Row form  className='gap-2'>

                        <Col className="py-4" lg="6" md="8" sm="8">
                            <Form.Group>

                                <label htmlFor="country">{t('state')}</label>
                                <Form.Select id="country" value={InputsData.country || ''} onChange={handleCountryPick}>

                                    <option value=''>{t('select_country')}</option>

                                    {
                                        allCountry.map(country => (
                                            <option key={country.id} value={country.iso}>{country.name}</option>
                                        ))
                                    }

                                </Form.Select>

                            </Form.Group>
                        </Col>
                        <Col className="py-4" lg="5" md="8" sm="8">
                            <Form.Group>

                                <label htmlFor="city">{t('city')}</label>
                                <Form.Select className={`form-control form-control-md ${cityError ? "is-invalid" : ""}`} value={dataSimulation.cityId || ""} onChange={e => setDataSimulation({ ...dataSimulation, cityId: e.target.value })} id="city" style={{height:"40px"}}>
                                    <option value="">{t('select_city')}</option>
                                    {
                                        InputsData.cities.map(city => {
                                            return (
                                                <option key={city.id} value={city.id}>{city.city}</option>
                                            )
                                        })
                                    }

                                </Form.Select>

                            </Form.Group>

                        </Col>


                    </Row>

                )
            case "crop":
                return (
                    <Row form className="py-2 m-2 gap-2">
                        <Col lg="3" md="8" sm="8">
                            <Form.Group>
                                <label htmlFor="cropType">{t('crop_type')}</label>
                                <Form.Select className={`form-control form-control-md ${cropError ? "is-invalid" : ""}`} id="cropType" value={dataSimulation.cropTypeId || ""} onChange={(e) => handleCropPick(e.target.value)}>
                                    <option value="">{t('select_crop')}</option>
                                    {
                                        listCrop.map(cropType => (
                                            <option style={{ textTransform: "capitalize" }} key={cropType.id} value={cropType.id}>{cropType.crop}</option>

                                        ))
                                    }

                                </Form.Select>

                            </Form.Group>

                        </Col>
                        <Col lg="3" md="8" sm="8">
                            <Form.Group>
                                <label htmlFor="cropVariety">{t('crop_variety')}</label>
                                <Form.Select value={InputsData.variety || ""} onChange={handleVarietyPick} id="cropVariety">
                                    <option value="">{t('crop_type')}</option>
                                    {
                                        InputsData.cropVariety.map(variety => (
                                            <option value={variety.id}>{variety.variety}</option>
                                        ))
                                    }
                                </Form.Select>
                            </Form.Group>

                        </Col>
                        <Col lg="3" md="8" sm="8">
                            <Form.Group>
                                <label htmlFor="ruPratique">{t('fraction_pratique')} (%) </label>
                                <Form.Control value={InputsData.ruPratique || ''} onChange={e => setInputsData({ ...InputsData, ruPratique: e.target.value })} id='ruPratique' placeholder={t('fraction_pratique')} 
                                />
                            </Form.Group>

                        </Col>
                        <Col lg="3" md="8" sm="8">
                            <Form.Group>
                                <label htmlFor="z">{t('depth')} (m)</label>
                                <Form.Control value={InputsData.Profondeur || ''} onChange={e => setInputsData({ ...InputsData, Profondeur: e.target.value })} id='z' placeholder={t('profondeur')}
                                />

                            </Form.Group>

                        </Col>
                        <Col lg="3" md="8" sm="8">
                            <Form.Group>
                                <label htmlFor="days">{t('Days')}</label>

                                <Form.Control value={InputsData.days || ""} id='days' onChange={e => setInputsData({ ...InputsData, days: e.target.value })} placeholder={t('Days')} />

                            </Form.Group>

                        </Col>
                        <Col lg="3" md="8" sm="8">
                            <Form.Group>
                                <label htmlFor="days">{t('growing_season')}</label>

                                <Form.Control type="date" value={InputsData.plantingDate || ""} onChange={e => setInputsData({ ...InputsData, plantingDate: e.target.value })} id='days' />

                            </Form.Group>

                        </Col>
                        <Col lg="3" md="8" sm="8">
                            <Form.Group>
                                <label htmlFor="ecartInter">{t('ecart_inter')} (m)</label>
                                <Form.Control value={""} onChange={""} id='ecartInter' placeholder={t('ecart_inter')}
                                />
                            </Form.Group>

                        </Col>
                        <Col lg="3" md="8" sm="8">
                        <Form.Group>
                            <label htmlFor="ecartIntra">{t('ecart_intra')} (m) </label>
                            <Form.Control value={""} onChange={""} id='ecartIntra' placeholder={t('ecart_intra')}
                            />
                        </Form.Group>

                        </Col>
                        <Col lg="3" md="8" sm="8">
                            <Form.Group>
                                <label htmlFor="densité">{t('densité')} (plants/ha)</label>
                                <Form.Control value={""} onChange={""} id='densité' placeholder={t('densité')}
                                />
                            </Form.Group>

                        </Col>
                    </Row>

                )
            case "soil":
                return (
                    <Row form className="py-2 m-2 gap-2">
                        <Col lg="4" md="8" sm="8">
                            <Form.Group>
                                <label htmlFor="soil">{t('soil_type')}</label>
                                <Form.Select className={`form-control form-control-md ${soilError ? "is-invalid" : ""}`} value={dataSimulation.soilTypeId} id="soil" onChange={(e) => handleSoilPick(e.target.value)}>
                                    <option value=''>{t('select_soil')}</option>
                                    {
                                        allSoils.map(soil => {
                                            
                                            return (
                                                <option key={soil.id} value={soil.id}>{soil.soil}</option>
                                            )
                                        })
                                    }
                                </Form.Select>

                            </Form.Group>

                        </Col>
                        <Col lg="4" md="8" sm="8">
                            <Form.Group>
                                <label htmlFor="effPluie">{t('efficacité_pluie')} (%)</label>
                                <Form.Control value={InputsData.effPluie || ''} onChange={e => setInputsData({ ...InputsData, effPluie: e.target.value })} id='effPluie' placeholder={t('efficacité_pluie')} 
                                />

                            </Form.Group>
                        </Col>
                        <Col lg="3" md="8" sm="8">
                            <Form.Group>
                                <label htmlFor="ruMax">RU max (mm/m)</label>
                                <Form.Control value={InputsData.RUmax || ''} onChange={e => setInputsData({ ...InputsData, RUmax: e.target.value })} id='ruMax' placeholder="RU max"
                                />

                            </Form.Group>

                        </Col>
                    </Row>
                )
            case "irrig":
                    return (
                        <Row form className="py-2 m-2 gap-2">
                             <Col lg="6" md="8" sm="8">
                            <Form.Group>
                                <label htmlFor="surfaceIrrig">{t('surface_irriguée')} (ha)</label>
                                <Form.Control value={InputsData.surfaceIrrig || ''} onChange={e => setInputsData({ ...InputsData, surfaceIrrig: e.target.value })} id="surfaceIrrig" placeholder={t('surface_irriguée')}
                                />


                            </Form.Group>

                        </Col>
                        <Col lg="5" md="8" sm="8">
                            <Form.Group>
                                <label htmlFor="effIrrig">{t('efficience_irrigation')} (%) </label>
                                <Form.Control value={InputsData.effIrrig || ''} onChange={e => setInputsData({ ...InputsData, effIrrig: e.target.value })} id='effIrrig' placeholder={t('efficience_irrigation')} 
                                />

                            </Form.Group>

                        </Col>

                        </Row>
                    )

            default:
                return (
                    <Row form className='gap-2' >
                        <Col lg="6" md="8" sm="8">
                            <Form.Group>

                                <label htmlFor="country">{t('state')}</label>
                                <Form.Select id="country" value={InputsData.country || ''} onChange={handleCountryPick}>

                                    <option value=''>{t('select_country')}</option>

                                    {
                                        allCountry.map(country => (
                                            <option key={country.id} value={country.iso}>{country.name}</option>
                                        ))
                                    }

                                </Form.Select>

                            </Form.Group>
                        </Col>
                        <Col lg="5" md="8" sm="8">
                            <Form.Group>

                                <label htmlFor="city">{t('city')}</label>
                                <Form.Select value={InputsData.city || ""} onChange={e => setInputsData({ ...InputsData, city: e.target.value })} id="city">
                                    <option value="">{t('select_city')}</option>
                                    {
                                        InputsData.cities.map(city => {
                                            return (
                                                <option value={city.city}>{city.city}</option>
                                            )
                                        })
                                    }

                                </Form.Select>
                            </Form.Group>

                        </Col>

                    </Row>)
        }

    }

    const imageByInputs = () => {
        switch (elemValue) {
            case "pos":
                return <img
                    className="rounded-circle h-100"
                    width="140"
                    src={position}
                />
            case "crop":
                return <img
                    className="rounded-circle h-100"
                    width="140"
                    src={crop}
                />
            case "soil":
                return <img
                    className="rounded-circle h-100"
                    width="140"
                    src={soil}
                />
            default:
                return <img
                    className="rounded-circle h-100"
                    width="140"
                    src={position}
                />
        }
    }

        const [simulation,setSimulation] = useState([])
   
    const checkAndSave = () => {
        const isValid = isValidInputs()
        let data = {
            name : dataSimulation.name,
            city_id : dataSimulation.cityId,
            croptype_id : dataSimulation.cropTypeId,
            soiltype_id :dataSimulation.soilTypeId,
            cropvariety_id : dataSimulation.cropVarietyId,
            inputs : InputsData
        }
            api.post('/simulation/calcul-simulation',data)
            .then(response=>{
                    let simulationResult = response.data.simulation
                    if(response.data.type === "success") {
                        setSimulation(simulationResult.result)
                        setSumETC(response.data.sumETC)
                        setSumIrrig(response.data.sumIrrig)
                        setSumNbrIrrig(response.data.sumNbrIrrig)
                        swal({
                            icon: 'info',
                            title: 'OK',
                            text: `${t('saved_simulation')}`
                          })

                    }
                    if(response.data.type === "danger"){
                        swal({
                            icon: 'error',
                            text: response.data.message
                          })
                    }
            }).catch(error=>{   
                console.log(error)
            }).finally(() => setIsLoading(true) )
        

    }

    useEffect(() => {
        let data = []
        let sumRain = 0

        simulation.map(result=>{
            if(result){
                sumRain = sumRain + Number(result.rain)
                data.push({
                   bilan: result.bilan,
                    dates :result.date
                })
            }
        })
        setChartData(data)
        setSumPluie(sumRain)
    }, [simulation])


    return (
        <Container fluid className="main-content-container p-4">
            <Row noGutters className="page-header py-4">
                <PageTitle
                    sm="4"
                    title={t('water_balance')}
                    subtitle={t('overview')}
                    className="text-sm-left"
                />
            </Row>
            <Row className='text-center my-2'>
                <Col lg='12' md="12" sm="12">
                    <Card>
                        <Card.Header className="border-bottom d-flex justify-content-between align-items-center">
                                <h6 className="m-0">{t('config')}</h6>
                                <div>
                                    <i className='material-icons'>&#xe88e;</i> <span style={{fontSize :13,textDecoration:"underline"}}>{t('msg_simulation_name')}</span>
                                </div>
                        </Card.Header>
                        <Card.Body>
                            <Row>
                                <Col lg='4' md="12" sm="12" className="border-right d-flex justify-content-center align-items-center">
                                    <div className="mb-3 mx-auto" style={{ height: "140px" }}>
                                        {imageByInputs()}
                                    </div>
                                </Col>
                                <Col lg='8' md="12" sm="12">
                                    <Row form className="py-2 m-2" >
                                        <Col lg="12" md="8" sm="8" className='py-4'>
                                           <div style={{color :"tomato" , fontSize : 14 , padding : 5}}>{error}</div>
                                            <Nav tabs style={{ paddingBottom: 10 }}>
                                            <NavItem>
                                                    <NavLink onClick={(e) => setElemValue(e.target.id)} id="name" className={`${elemValue === "name" ? "bg-info rounded text-dark" : 'rounded text-dark'}`} href="#">
                                                    {t('name')}
                                                    </NavLink>
                                                </NavItem>
                                                <NavItem>
                                                    <NavLink onClick={(e) => setElemValue(e.target.id)} id="pos" className={`${elemValue === "pos" ? "bg-info rounded text-dark" : 'rounded text-dark'}`} href="#">
                                                        {t('position')}
                                                    </NavLink>
                                                </NavItem>
                                                <NavItem>
                                                    <NavLink onClick={(e) => setElemValue(e.target.id)} id="crop" className={`${elemValue === "crop" ? "bg-info rounded text-dark" : 'rounded text-dark'}`} href="#">{t('crop_info')}</NavLink>
                                                </NavItem>
                                                <NavItem>
                                                    <NavLink onClick={(e) => setElemValue(e.target.id)} id="soil" className={`${elemValue === "soil" ? "bg-info rounded text-dark" : 'rounded text-dark'}`} href="#">{t('soil_info')}</NavLink>
                                                </NavItem>
                                                <NavItem>
                                                    <NavLink onClick={(e) => setElemValue(e.target.id)} id="irrig" className={`${elemValue === "irrig" ? "bg-info rounded text-dark" : 'rounded text-dark'}`} href="#">{t('Irrigation')}</NavLink>
                                                </NavItem>
                                            </Nav>
                                        </Col>

                                        {returnInputs()}
                                    </Row>
                                    {
                                        elemValue === "soil"
                                            ?
                                            <Row className="d-flex justify-content-center align-items-center">
                                               
                                                    <Button outline theme="success" onClick={() => checkAndSave()} >{t('save')}</Button>

                                            </Row>
                                            :
                                            null
                                    }
                                </Col>

                            </Row>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
            <Row>
                <Col lg='12' md="12" sm="12">
                    <Card>
                        <Card.Header className="border-bottom">
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "flex-start",
                                    width: "auto",
                                    float: "left"
                                }}
                            >
                                <h6 className="m-0">{t('outputs')}</h6>{" "}
                            </div>
                        </Card.Header>
                        <Card.Body>
                            <Row className='gap-2'>
                                <Col id="page" lg="3" md="8" sm="8" className="form-group ">
                                    <label htmlFor="ruMax">RU max (mm)</label>
                                    <Form.Control id="ruMax" value={RuMax} placeholder="RU max" />
                                </Col>
                                <Col lg="2" md="8" sm="8" className="form-group">
                                    <label htmlFor="ruInit">{t('ru_initiale')} (mm)</label>
                                    <Form.Control id='ruInit' value={RuInitial} placeholder="RU initiale" />
                                </Col>
                                <Col lg="3" md="8" sm="8" className="form-group">
                                    <label htmlFor="epuis">{t('epuisement_max')} (mm)</label>
                                    <Form.Control id="epuis" value={Epuisement_maximal} placeholder="Epuisement maximal" />
                                </Col>
                                <Col lg="3" md="8" sm="8" className="form-group">
                                    <label htmlFor="nbrIrrig">{t('nbr_irrigations')}</label>

                                    <Form.Control id='nbrIrrig' value={sumNbrIrrig} placeholder="Nombre d'irrigations" />
                                </Col>
                                <Col lg="2" md="8" sm="8" className="form-group">
                                    <label htmlFor="hautIrrig">{t('hauteur_irrigations')} (mm)</label>
                                    <Form.Control id='hautIrrig' value={parseFloat(sumIrrig).toFixed(0)} placeholder="Hauteur d'eau des irrigations" />
                                </Col>
                                <Col lg="3" md="8" sm="8" className="form-group">
                                    <label htmlFor="vIrrig">{t('volume_irrigations')} (m³ /ha)</label>
                                    <Form.Control value={parseFloat(VolumeIrrigation).toFixed(0)} id="vIrrig" placeholder="Volume des irrigations" />
                                </Col>
                                <Col lg="3" md="8" sm="8" className="form-group">
                                    <label htmlFor="rumin">Ru Min (mm)</label>
                                    <Form.Control value={RuMin} id="rumin" placeholder="RU min" />
                                </Col>
                                <Col lg="3" md="8" sm="8" className="form-group">
                                    <label htmlFor="volTotalIrrig">{t('Volume_total_irrigation')} (m³)</label>
                                    <Form.Control value={parseFloat(VolumeTotalEauIrrigation).toFixed(0)} id="volTotalIrrig" placeholder="Volume Total d'eau d'irrigation" />
                                </Col>
                                <Col lg="3" md="8" sm="8" className="form-group">
                                    <label htmlFor="pluieTotal">{t('pluie_total')} (mm)</label>
                                    <Form.Control value={parseFloat(sumPluie).toFixed(0)} id="pluieTotal" placeholder="Pluie total" />
                                </Col>
                                <Col lg="3" md="8" sm="8" className="form-group">
                                    <label htmlFor="evoTotal">{t('evapotranspiration_totale')} (mm)</label>
                                    <Form.Control value={parseFloat(sumETC).toFixed(0)} id='evoTotal' placeholder="Evapotranspiration totale" />
                                </Col>

                                <Col lg="3" md="8" sm="8" >
                                    <label htmlFor="deficit">{t('déficit')} (mm)</label>
                                    <Form.Control value={parseFloat(Deficit).toFixed(0)} id="deficit" placeholder="Déficit" />
                                </Col>
                            </Row>

                        </Card.Body>
                    </Card>
                </Col>
            </Row>
            <Row className="py-2 d-flex justify-content-center align-items-center text-center">

                    <Col>
                    <Card>
                        {
                         isLoading

                            ?
                            <Card.Body>
                                <p className="py-2 d-flex justify-content-center align-items-center">
                                    <button style={{ fontSize: 30, margin: 8, border: '1px solid #eee', borderRadius: 10, background: 'none' }} onClick={() => setToggle(true)}><i className='material-icons'>&#xe265;</i></button>
                                    <button style={{ fontSize: 30, margin: 8, border: '1px solid #eee', borderRadius: 10, background: 'none' }} onClick={() => setToggle(false)}><i className='material-icons'>&#xe6e1;</i></button>
                                </p>

                                <Col className={`${toggle ? '' : 'd-none'}`} lg="12" md="12" sm="12">
                                    <h6>{t('water_balance')}</h6>
                                    <table className="table mb-0 text-center table-bordered table-hover table-responsive-lg">
                                        <thead className="bg-light">
                                            <tr>
                                                <th scope="col" className="border-0">{t('Days')}</th>
                                                <th scope="col" className="border-0">{t('Dates')}</th>
                                                <th scope="col" className="border-0">{t('Kc')}</th>
                                                <th scope="col" className="border-0">{t('ET0')}</th>
                                                <th scope="col" className="border-0">{t('Pluie')} (mm)</th>
                                                <th scope="col" className="border-0">{t('ETc')}</th>
                                                <th scope="col" className="border-0">{t('Pe')} (mm)</th>
                                                <th scope="col" className="border-0">{t('Bilan hydrique')} (mm)</th>
                                                <th scope="col" className="border-0">{t('Irrigation')}</th>
                                                <th scope="col" className="border-0">{t('Nbr Irrigation')}</th>
                                            </tr>
                                        </thead>
                                        {/* <tbody> */}
                                        {/* {tableHydrique(InputsData.days)} */}
                                        {/* </tbody> */}
                                        {
                                            simulation.map(result=>{
                                                
                                                let dates = moment(result.date.slice(0,10)).locale('En').format('MMM DD')
                                                let ET0 = 2
                                                return(
                                                    <tbody>
                                                        <tr>
                                                            <td>{result.days}</td>
                                                            <td>{dates}</td>
                                                            <td>{parseFloat(result.kc).toFixed(2)}</td>
                                                            <td>{ET0}</td>
                                                            <td>{result.rain}</td>
                                                            <td>{parseFloat(result.Etc).toFixed(2)}</td>
                                                            <td>{parseFloat(result.pe).toFixed(2)}</td>
                                                            <td>{parseFloat(result.bilan).toFixed(2)}</td>
                                                            <td>{parseFloat(result.irrigation).toFixed(2)}</td>
                                                            <td>{result.irrigationNbr}</td>

                                                        </tr>
                                                        
                                                        {/* <tr>
                                                            <td>{i}</td>
                                                            <td>{dates}</td>
                                                            <td>{parseFloat(allKc[i - 1]).toFixed(2)}</td>
                
                                                            <td>{ET0}</td>
                                                            <td> <input
                                                                name={i}
                                                                key={i}
                                                                className='my-1'
                                                                style={{outline: 'none', border: '1px solid #e4e4e4' }}
                                                                value={pluie.i}
                                                                onChange={(e) => onChangeHandler(e.target.value, i)}
                                                            />
                                                            </td>
                                                            <td>
                                                            <input
                                                                name={i}
                                                                key={i}
                                                                className='my-1'
                                                                style={{outline: 'none', border: '1px solid #e4e4e4' }}
                                                                value={irrigatedAlready.i}
                                                                onChange={(e) => onChangeHandlerIrrigated(e.target.value, i)}
                                                            />  
                                                            </td>
                                                            <td>{parseFloat(ETC).toFixed(2)}</td>
                                                            <td>{Pe[i]}</td>
                                                            <td>{`${parseFloat(bilanHydrique).toFixed(1)}`}</td>
                                                            <td>{parseFloat(Irrigation).toFixed(2)}</td>
                                                            <td>{IrrigationNbr}</td>
                                                        </tr>
                */}
                                                    </tbody>

                                                )
                                            })
                                        }
                                    </table>
                                </Col>
                                <Col className={`${toggle ? 'd-none' : ''}`} lg="12" md="8" sm="8">
                                    <h6>{t('water_balance_chart')}</h6>
                                    <WaterChart data={chartData} />
                                </Col>

                            </Card.Body>
                            :
                            null

                        }
                    </Card>
                    </Col>
                        
                    

            </Row>



        </Container>
    )
}

export default BilanHydrique