import React, { useEffect, useState ,useCallback} from 'react'
import { Container, Card,  Row, Col, Form, ButtonGroup, Button, Modal } from "react-bootstrap";
import PageTitle from '../components/common/PageTitle';
import { useTranslation } from 'react-i18next';
import { Link  , useNavigate, useParams } from 'react-router-dom';
import api from '../api/api';
import swal from 'sweetalert';
import Pagination from '../views/Pagination';
import moment from 'moment';

const ConfigurationCities = () => {

    const navigate = useNavigate()

    const Months = moment.monthsShort()
    
    const [countrysPerPage] = useState(12)
    const [currentPage, setCurrentPage] = useState(1);

    const [SearchCode, setSearchCode] = useState('')
    const [SearchName, setSearchName] = useState('')


    const paginate = pageNumber => setCurrentPage(pageNumber);

    const { t, i18n } = useTranslation();

    const [lat, setLat] = useState("")
    const [lon, setLon] = useState("")
    const [toggle ,setToggle] = useState(false)
    const [toggleEdit ,setToggleEdit] = useState(false)

    const [allCountry, setAllCountry] = useState([])

    const [allCities, setAllCities] = useState([])
    const [cityData,setCityData] = useState({})

    const [city, setCity] = useState("")
    const [countryCode, setCountryCode] = useState("")
    const [country, setCountry] = useState("")

    const [weatherTemp, setWeatherTemp] = useState({})
    const [weatherHumd, setWeatherHumd] = useState({})
    const [rainData, setRainData] = useState({})

    const [allWeatherData,setAllWeatherData] = useState([])
    
    const [selectMonth,setSelectMonth ] = useState('')
    const [weatherTempDay, setWeatherTempDay] = useState({})
    const [weatherHumdDay, setWeatherHumdDay] = useState({})
    const [rainDataDay, setRainDataDay] = useState({})
    const [allWeatherDataDays,setAllWeatherDataDays] = useState([])
    


    const getCities = async () => {
            try {
                    await api.get('/cities/get-cities')
                    .then(response=>{
                        if(response.data.type === "success"){
                            let listCities = response.data.Cities
                            setAllCities(listCities)

                        }
                    }).catch(error =>{
                        console.log(error)
                    })
                    
            } catch (error) {   
                console.log(error)
            }
    }
    useEffect(() => {
        const getCountries = async () => {
            try {
                    await api.get('/countries/get-countries')
                    .then(response=>{
                        if(response.data.type === "success"){
                            let listCountries = response.data.Countries
                            setAllCountry(listCountries)
                        }
                    }).catch(error =>{
                        console.log(error)
                    })
                    
            } catch (error) {   
                console.log(error)
            }
    }
    getCountries()
        getCities()
    }, [])

    const getSingleCity = async (cityId,title) => {

        let data = {
            city_id: cityId,
        }
    
        await api.post('/cities/get-city', data)
            .then(res => {
                let cityData = res.data.city
                setCityData(cityData)
                setLat(cityData.lat)
                setLon(cityData.lon)
                setCity(cityData.city)
                setCountryCode(cityData.iso)
            }).catch(error => {
                console.log(error)
    
            })
            if(title === 'Edit'){
                setToggleEdit(!toggle)

            }
                
            
           
    
    }


    const addCities = () => {
        let data = {
            country : country.split('_')[0],
            iso : countryCode ,
            city : city,
            lat : lat,
            lon :lon,
        }

        api.post('/cities/add-cities',data)
        .then(response=>{
            if(response && response.data.type === "success"){
                swal(`${t('City Added')}`, { icon: "success" });
                getCities()
                setToggle(false)
            }
            if(response && response.data.type === "danger"){
                swal(`${t('Error adding City ')}`, { icon: "error" });
            }
        }).catch(error=>{
            console.log(error)
        })
    }

    const handleDelete = async cityId => {

    
        let data = {
            city_id: cityId,
        }
        await api.delete('/cities/delete-city', { data: data })
            .then(response => {
                if (response.data.type && response.data.type == "danger") {
                    swal({
                        title: "Cannot Delete City",
                        icon: "warning",
                    });
                }
                if (response.data.type == "success") {
                    getCities();
                   
                }
            }).catch(error => {
                swal({
                    title: "Cannot Delete City",
                    icon: "error",
                    text: 'error_delete_city'
                    
                });
            })
        }
    
    const confirmDelete = cityId => {
    
        swal({
            title: "Are you sure?",
            text: "Once deleted, you will not be able to recover this city!",
            icon: "warning",
            buttons: true,
            dangerMode: true,
        })
            .then((Delete) => {
                if (Delete) {
                    handleDelete(cityId)
                    swal(" city has been deleted!", {
                        icon: "success",
                    });
                }
            }).catch(error => {
                swal({
                    title: "Cannot Delete City",
                    icon: "error",
                    text: 'error_delete_city'
    
                });
            })
    
    }

    const filteredCities = allCities.filter(city => {
        if (SearchName !== '') {
            return (
                city.city.toLowerCase().includes(SearchName.toLowerCase())
            )
        }
        if (SearchCode !== '') {
            return (
                city.iso.toLowerCase().includes(SearchCode.toLowerCase())
            )
        }
        return city
    })
    const indexOfLastPost = currentPage * countrysPerPage;
    const indexOfFirstPost = indexOfLastPost - countrysPerPage;
    const currentCities = filteredCities.slice(indexOfFirstPost, indexOfLastPost);

    const onChangeHandlerRain = (value,month,name) => {
        setRainData(state => ({ ...state, [`${month}_${name}`] : value }), [])

    }
    const onChangeHandlerTempMoy = (value,month,name) => {
        setWeatherTemp(state => ({ ...state, [`${month}_${name}`] : value}), [])

    }
    const onChangeHandlerHumidity = (value,month,name) => {
        setWeatherHumd(state => ({ ...state, [`${month}_${name}`] : value }), [])

    }



    const onChangeHandlerDayRain = (value,day,month,name) => {
        setRainDataDay(state => ({ ...state, [`${month}_${day}_${name}`] : value }), [])

    }
    const onChangeHandlerDayTempMoy = (value,day,month,name) => {
        setWeatherTempDay(state => ({ ...state, [`${month}_${day}_${name}`] : value}), [])

    }
    const onChangeHandlerDayHumidity = (value,day,month,name) => {
        setWeatherHumdDay(state => ({ ...state, [`${month}_${day}_${name}`] : value }), [])

    }
    
    useEffect(()=>{
        let dataArray = []
        if ((Object.keys(rainData).length == 12)){
            dataArray.push(weatherTemp,weatherHumd,rainData)
            setAllWeatherData(dataArray)
        }
    },[rainData])

    useEffect(()=>{
        let dataArray = []
        if ((Object.keys(rainDataDay).length >= 28) || (Object.keys(weatherTempDay).length >= 28) || (Object.keys(weatherHumdDay).length >= 28) ){
            dataArray.push(weatherTempDay,weatherHumdDay,rainDataDay)
            setAllWeatherDataDays(dataArray)
        }
    },[rainDataDay])

    const weatherByMonths = () => {
            let element = []
        for (let index = 0; index < Months.length; index++) {
                element.push(
                    <tbody>
                    <tr>
                        <td>{Months[index]}</td>   
                        <td>
                            <input 
                             name={'temp'}
                             style={{ minHeight: 32, marginRight: 5, outline: 'none', border: '1px solid #e4e4e4' }}
                             key={index}
                             value={weatherTemp.index}
                             onChange={e => onChangeHandlerTempMoy(e.target.value,index,'temp')}
                            />
                        </td>          
                        <td>
                            <input 
                             name={'humidity'}
                             style={{ minHeight: 32, marginRight: 5, outline: 'none', border: '1px solid #e4e4e4' }}
                             key={index}
                             value={weatherHumd.index}
                             onChange={e => onChangeHandlerHumidity(e.target.value,index,'humidity')}
                            />
                        </td>
                        <td>
                            <input 
                             name={'rain'}
                             style={{ minHeight: 32, marginRight: 5, outline: 'none', border: '1px solid #e4e4e4' }}
                             key={index}
                             value={rainData.index}
                             onChange={(e) => onChangeHandlerRain(e.target.value,index,'rain')}
                            />
                        </td>             
                 </tr>



                 </tbody>
                    
                )
            
        }
        return element
    }

    const getDaysArray = (year, month) => {
        let monthIndex = month;
        let names = [ 'sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat' ];
        let date = new Date(year, monthIndex, 1);
        let result = [];
        while (date.getMonth() == monthIndex) {
            let daysIndex = date.getDate()
            result.push(
          <tbody>
          <tr>
              <td>{`${date.getDate()} ${names[date.getDay()]}`}</td>   
              <td>
                  <input 
                   name={'temp'}
                   style={{ minHeight: 32, marginRight: 5, outline: 'none', border: '1px solid #e4e4e4' }}
                   key={daysIndex}
                   value={weatherTempDay.daysIndex}
                   onChange={e => onChangeHandlerDayTempMoy(e.target.value,daysIndex,monthIndex,'temp')}
                  />
              </td>          
              <td>
                  <input 
                   name={'humidity'}
                   style={{ minHeight: 32, marginRight: 5, outline: 'none', border: '1px solid #e4e4e4' }}
                   key={daysIndex}
                   value={weatherHumdDay.daysIndex}
                   onChange={e => onChangeHandlerDayHumidity(e.target.value,daysIndex,monthIndex,'humidity')}
                  />
              </td>
              <td>
                  <input 
                   name={'rain'}
                   style={{ minHeight: 32, marginRight: 5, outline: 'none', border: '1px solid #e4e4e4' }}
                   key={daysIndex}
                   value={rainDataDay.daysndex}
                   onChange={(e) => onChangeHandlerDayRain(e.target.value,daysIndex,monthIndex,'rain')}
                  />
              </td>             
       </tr>



       </tbody>

          );
          date.setDate(date.getDate() + 1);
        }
        return result;
      }

      console.log(country)

    return (
        <>
        <Container className="p-4">
            <Row noGutters className="page-header py-4">
                <PageTitle
                    sm="4"
                    title={t('Cities Configuration')}
                    subtitle={t('Cities Configuration')}
                    className="text-sm-left"
                />
            </Row>
            <Row>
                    <PageTitle
                        sm="4"
                        subtitle={t('search')}
                        className="text-sm-left"
                    />
                </Row>
                <Row form className="d-flex justify-content-center gap-2">
                    <Col md="3" className="form-group">
                        <Form.Group>
                            <div className="d-flex">
                                <Form.Control
                                    value={SearchName}
                                    onChange={(e) => setSearchName(e.target.value)}
                                    id="search"
                                    placeholder="Search By Name " />

                            </div>
                        </Form.Group>
                    </Col>
                    <Col md="3" className="form-group">
                        <Form.Group>
                            <div className="d-flex">
                                <Form.Control
                                     value={SearchCode}
                                     onChange={(e) => setSearchCode(e.target.value)}
                                    id="search"
                                    placeholder="Search By Code " />

                            </div>
                        </Form.Group>
                    </Col>
                </Row>
                <Row>
                    <PageTitle
                        sm="4"
                        subtitle={t('my actions')}
                        className="text-sm-left"
                    />
                </Row>
                <Row form className="py-2 d-flex justify-content-center">
                    <ButtonGroup>
                        <Button  variant='outline-primary' onClick={() => {setToggle(true)}}>Add City</Button>
                    </ButtonGroup>

                </Row>
                <Card>
                    <Card.Header className="border-bottom">
                        <div>
                            <h5>
                                Location Info

                            </h5>

                        </div>
                    </Card.Header>
                    <Card.Body>
                    <table className="table mb-0 text-center">
                        <thead className="bg-light">
                            <tr>
                                <th scope="col" className="border-0">{t('Country Name')}</th>
                                <th scope="col" className="border-0">{t('City Name')}</th>
                                <th scope="col" className="border-0">{t('code')}</th>
                                <th scope="col" className="border-0">{t('Latitude')}</th>
                                <th scope="col" className="border-0">{t('Longitude')}</th>
                                <th scope="col" className="border-0"></th>

                            </tr>
                        </thead>
                        <tbody>
                            {
                                currentCities.map(city=>{
                                    return(
                                        <tr>
                                            <td>{city.country}</td>
                                            <td>{city.city}</td>
                                            <td>{city.iso}</td>
                                            <td>{city.lat}</td>
                                            <td>{city.lon}</td>


                                            <td>
                                               
                                                        <ButtonGroup size="sm" className="mr-2">
                                                            <Button title="Edit" onClick={() => navigate(`/admin/configuration/cities/weather/${city.id}`) } squared><i className="material-icons">&#xe3c9;</i></Button>
                                                            <Button title="Delete" onClick={() => confirmDelete(city.id)} squared variant="danger"><i className="material-icons">&#xe872;</i></Button>
                                                        </ButtonGroup>
                                                

                                            </td>
                                            
                                        </tr>

                                    )
                                })
                            }


                        </tbody>
                    </table>
                    </Card.Body>
                </Card>
                <Row className="py-4 justify-content-center">
                    <Pagination usersPerPage={countrysPerPage} totalUsers={allCities.length} paginate={paginate} />

                </Row>
        </Container>
        <Modal centered={true} open={toggle}>
                        <Modal.Header className="d-flex justify-content-between align-items-center">
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "flex-end",
        
                                }}
                            >
                                <Button
                                    // theme="success"
                                    onClick={()  => {addCities()}}
                                    className="mb-2 mr-1 btn btn-success"
                                >
                                    <i class={`fa fa-check mx-2`}></i>
                                    {t('save')}
                                </Button>
                                <Button
                                    // theme="success"
                                    className="mb-2 mr-1 btn btn-danger"
                                    onClick={() => {setToggle(false)} }
                                >
                                    <i class={`fa fa-times mx-2`}></i>
                                    {t('cancel')}
                                </Button>
                            </div>
                        </Modal.Header>
                        <Modal.Body>
                            <Row className='d-flex justify-content-center border-bottom'>
                                <Col lg='6' md='8' sm='8'>
                                    <Form.Group>
                                        <label htmlFor="country">Country</label>
   
        
                                            <Form.Select
                                                value={country}
                                                onChange={(e) =>{ setCountry(e.target.value.split('_ ')[0]) ;setCountryCode(e.target.value.split('_')[1])}}
                                                id="country"
                                                
                                            >
                                                <option value="">Select Country</option>

                                                {
                                                            allCountry.map((country)=>{
                                                                return(
                                                                    <option key={country.iso} value={`${country.name}_${country.iso}`}>{country.name}</option>
                                                                )
                                                            })
                                                }
                                            </Form.Select>
                                    </Form.Group>
                                </Col>
                                <Col lg='6' md='8' sm='8'>
                                    <Form.Group>
                                        <label htmlFor="country">Country Code</label>
   
                                                
                                            <Form.Control
                                                value={countryCode}
                                                onChange={(e) => setCountryCode(e.target.value) }
                                                id="country"
                                                placeholder="Country Code"

                                            />
                                    </Form.Group>
                                </Col>
                            </Row>
                                <Row className="py-2">
                                <Col lg='6' md='8' sm='8'>
                                    <Form.Group>
                                        <label htmlFor="city">City Name</label>
   
        
                                            <Form.Control
                                                value={city}
                                                onChange={(e) => setCity(e.target.value) }
                                                id="city"
                                                placeholder="City Name"
                                            />
                                    </Form.Group>
                                </Col>
                                <Col lg='3' md='8' sm='8'>
                                    <Form.Group>
                                        <label htmlFor="lat">Latitude</label>
   
        
                                            <Form.Control
                                            value={lat}
                                            onChange={(e) => setLat(e.target.value) }
                                                id="lat"
                                                placeholder="Latitude"
                                            />
                                    </Form.Group>
                                </Col>
                                <Col lg='3' md='8' sm='8'>
                                    <Form.Group>
                                        <label htmlFor="lon">Longitude</label>
   
        
                                            <Form.Control
                                             value={lon}
                                             onChange={(e) => setLon(e.target.value) }
                                                id="lon"
                                                placeholder="Longitude"
                                            />
                                    </Form.Group>
                                </Col>
                                </Row>
        
                        </Modal.Body>
        </Modal>
        </>
    )
}

export default ConfigurationCities