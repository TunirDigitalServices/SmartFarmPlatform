import React, { useEffect, useState } from 'react'
import { Container, Card, CardHeader, CardBody, ListGroup, ListGroupItem, Row, Col, Form, FormGroup, FormInput, FormSelect, FormTextarea, ButtonGroup, Button, Progress, Modal, ModalHeader, ModalBody, BreadcrumbItem, Breadcrumb, Nav, NavItem, NavLink } from "shards-react";
import PageTitle from '../components/common/PageTitle';
import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next';
import api from '../api/api';
import Pagination from '../views/Pagination';
import swal from 'sweetalert';


const CountryManagement = () => {

    const [data, setData] = useState([])
    const [weather, setWeather] = useState([])
    const [rainData, setRainData] = useState([])

    const [countrysPerPage] = useState(10)
    const [currentPage, setCurrentPage] = useState(1);
    const [SearchName, setSearchName] = useState('')

    const [city, setCity] = useState("")
    const [countryCode, setCountryCode] = useState("")
    const [country, setCountry] = useState("")
    const [lat, setLat] = useState("")

    const [lon, setLon] = useState("")

    const paginate = pageNumber => setCurrentPage(pageNumber);

    const [toggleEdit,setToggleEdit] = useState(false)
    const [toggle,setToggle] = useState(false)


    const params = useParams()
    const Iso = params.iso
    const { t, i18n } = useTranslation();


    const [citiesData,setCitiesData] = useState([])
    const [countryData,setCountryData] = useState([])

    const [cityData,setCityData] = useState({})
    

    const getCountryData = async () => {
        let data = {
            iso : Iso
        }
            await api.post('/countries/get-country',data)
            .then(response=>{
                    let countryData = response.data.country
                    setCountryData(countryData)
                    setCountry(countryData.name)
            }).catch(error=>{
                console.log(error)
            })
}
const getCitiesByCountry = async () => {
            await api.get(`/cities/get-cities/${Iso}`)
            .then(response=>{
                    let citiesData = response.data.cities
                    setCitiesData(citiesData)
            }).catch(error=>{
                console.log(error)
            })
      
}


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
        if(title === "weather"){
        setToggle(!toggle)
            
        }
        if(title==="edit"){
            setToggleEdit(!toggle)

        }

}

const handleEdit = (cityId) => {

    let data = {
      iso : countryCode,
      city_id: cityId,
      country: country,
      city: city,
      lat: lat,
      lon:lon
    }



    api.post('/cities/edit-city', data)
      .then(response => {
        if (response.data.type == "success") {
          swal(" City has been updated", {
            icon: "success",
          });
          setToggleEdit(false)
          getCitiesByCountry();
        }
        if (response.data.type && response.data.type == "danger") {
          swal({
            icon: 'error',
            title: 'Oops...',
            text: 'error_edit_city'

          })
          return false;
        }
      }).catch(error => {
        swal({
          icon: 'error',
          title: 'Oops...',
          text: 'error_edit_city'

        })
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
                getCitiesByCountry();
               
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


    useEffect(()=>{
        getData()
            getCitiesByCountry()
            getCountryData()
    },[])

    const filteredCities = citiesData.filter(city => {
        if (SearchName !== '') {
            return (
                city.city.toLowerCase().includes(SearchName.toLowerCase())
            )
        }
        return city
    })
    
    const indexOfLastPost = currentPage * countrysPerPage;
    const indexOfFirstPost = indexOfLastPost - countrysPerPage;
    const currentCities = filteredCities.slice(indexOfFirstPost, indexOfLastPost);



return (
    <>
        <Container className="p-4 my-2">
            <Row noGutters className="page-header py-4">
                <PageTitle 
                    sm="4"
                    title={t('Country Configuration')}
                    subtitle={t('Country Configuration')}
                    className="text-sm-left"
                />
            </Row>
            <Row>
                <Col lg="3" md="12" sm="12" >
                    <Card className="my-2">
                        <CardHeader className="border-bottom">
                            
                        </CardHeader>
                        <CardBody>
                                
                                            <div className='d-flex justify-content-around align-items-center flex-column'>
                                                <h4>{countryData.name}</h4>
                                                <h5>{countryData.iso}</h5>
                                                <h5>Cities : {citiesData ? citiesData.length : 0}</h5>
                                            </div>
    
                        </CardBody>
                    </Card>
                </Col>
                <Col lg="9" md="12" sm="12" >
                    <Card>
                        <CardHeader className="border-bottom">
                            <Row className='d-flex justify-content-between align-items-center px-2'>
                                    <Col lg="5">
                                            <h5 className='text-uppercase'>Cities List</h5>
                                    </Col>
                                    <Col lg="4">
                                    <FormInput
                                        value={SearchName}
                                        onChange={e => setSearchName(e.target.value)}
                                        id="search"
                                        placeholder="Search By Name " />
                                    </Col>
                            </Row>               
                        </CardHeader>
                        <CardBody>
                        <table className="table mb-0 text-center table-responsive-lg">
                            <thead className="bg-light">
                                <tr>
                                    <th scope="col" className="border-0">{t('Name')}</th>
                                    <th scope="col" className="border-0">{t('Country Code')}</th>
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
                                                <td>{city.city}</td>
                                                <td>{city.iso}</td>
                                                <td>{city.lat}</td>
                                                <td>{city.lon}</td>
                                                <td>
                                                
                                                            <ButtonGroup size="sm" className="mr-2">
                                                                <Button title="Edit" onClick={() => {getSingleCity(city.id,'edit')}} squared><i className="material-icons">&#xe3c9;</i></Button>
                                                                <Button title="Delete" onClick={() => {confirmDelete(city.id) }} squared theme="danger"><i className="material-icons">&#xe872;</i></Button>
                                                            </ButtonGroup>
                                                    

                                                </td>
                                                {/* <td>
                                                
                                                <ButtonGroup size="sm" className="mr-2">
                                                        <Button  outline onClick={() => {getSingleCity(city.id,'weather')}}>Config Weather</Button>
                                                </ButtonGroup>
                                        

                                    </td> */}
                                            </tr>

                                        )
                                    })
                                }


                            </tbody>

                        </table>
                        <Row className="py-4 justify-content-center">
                            <Pagination usersPerPage={countrysPerPage} totalUsers={citiesData.length} paginate={paginate} />
                        </Row>
                        </CardBody>
                    </Card>

                </Col>
            </Row>
        </Container>

        <Modal centered={true} open={toggleEdit}>
        <ModalHeader className="d-flex justify-content-between align-items-center">
            <div
                style={{
                    display: "flex",
                    justifyContent: "flex-end",

                }}
            >
                <Button
                    // theme="success"
                    onClick={()  => {handleEdit(cityData.id)}}
                    className="mb-2 mr-1 btn btn-success"
                >
                    <i class={`fa fa-check mx-2`}></i>
                    {t('save')}
                </Button>
                <Button
                    // theme="success"
                    className="mb-2 mr-1 btn btn-danger"
                    onClick={() => {setToggleEdit(false)} }
                >
                    <i class={`fa fa-times mx-2`}></i>
                    {t('cancel')}
                </Button>
            </div>
        </ModalHeader>
        <ModalBody>
            <Row className='d-flex justify-content-center border-bottom'>
                
                <Col lg='4' md='8' sm='8'>
                    <FormGroup>
                        <label htmlFor="country">Country Code</label>


                            <FormInput
                                value={countryCode}
                                onChange={(e) => setCountryCode(e.target.value) }
                                id="country"
                                placeholder="Country Code"

                            />
                    </FormGroup>
                </Col>
            </Row>
                <Row className="py-2">
                <Col lg='6' md='8' sm='8'>
                    <FormGroup>
                        <label htmlFor="city">City Name</label>


                            <FormInput
                                value={city}
                                onChange={(e) => setCity(e.target.value) }
                                id="city"
                                placeholder="City Name"
                            />
                    </FormGroup>
                </Col>
                <Col lg='3' md='8' sm='8'>
                    <FormGroup>
                        <label htmlFor="lat">Latitude</label>


                            <FormInput
                                value={lat}
                                onChange={(e) => setLat(e.target.value) }
                                id="lat"
                                placeholder="Latitude"
                            />
                    </FormGroup>
                </Col>
                <Col lg='3' md='8' sm='8'>
                    <FormGroup>
                        <label htmlFor="lon">Longitude</label>


                            <FormInput
                            value={lon}
                            onChange={(e) => setLon(e.target.value) }
                                id="lon"
                                placeholder="Longitude"
                            />
                    </FormGroup>
                </Col>
            </Row>

        </ModalBody>
        </Modal>
        <Modal size="lg" centered={true} open={toggle}>
        <ModalHeader className="d-flex justify-content-between align-items-center">
            <h4> Weather Data Info</h4>
            <h5> City : {cityData.city}</h5>
            <div
                style={{
                    display: "flex",
                    justifyContent: "flex-end",
                }}
            >
                <Button
                    // theme="success"
                    onClick={()  => {}}
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
        </ModalHeader>
        <ModalBody>
            <Row className='m-2 border p-2 text-center d-flex justify-content-center border-bottom'>
                  
                                <Col lg='3' md='12' sm='12'>
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
                                <Col className="border-left" lg='3' md='12' sm='12'>
                                    <p className='border-bottom'>
                                        Temp Moy
                                    </p>
                                    {
                                        Object.values(weather).map((month,indx) => {
                                            let tempMoy = (Number(month.temp_max) + Number(month.temp_min)) / 2
                                            return (
                                                <FormInput value={parseFloat(tempMoy).toFixed(1)} />
                                            )
                                        })
                                    }

                                </Col>
                                <Col className="border-left" lg='3' md='12' sm='12'>
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
                                <Col className="border-left" lg='3' md='12' sm='12'>
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

        </ModalBody>
        </Modal>                          
    </>
  )
}

export default CountryManagement