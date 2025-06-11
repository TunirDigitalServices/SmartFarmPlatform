import React, { useEffect, useState } from 'react'
import { Container, Card, Row, Col, Form, ButtonGroup, Button, Modal } from "react-bootstrap";
import PageTitle from '../components/common/PageTitle';
import { useTranslation } from 'react-i18next';
import { Link  , useNavigate, useParams } from 'react-router-dom';
import api from '../api/api';
import swal from 'sweetalert';
import Pagination from '../views/Pagination';

const Configuration = () => {

    const [countrysPerPage] = useState(12)
    const [currentPage, setCurrentPage] = useState(1);

    const [SearchCode, setSearchCode] = useState('')
    const [SearchName, setSearchName] = useState('')


    const paginate = pageNumber => setCurrentPage(pageNumber);

    const { t, i18n } = useTranslation();
   
    const navigate = useNavigate()

    const [lat, setLat] = useState("")

    const [lon, setLon] = useState("")




    const [toggle ,setToggle] = useState(false)

    const [allCountry, setAllCountry] = useState([])


    const [city, setCity] = useState("")
    const [countryCode, setCountryCode] = useState("")
    const [country, setCountry] = useState("")


  

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
    }, [])

    const getSingleCountry = async (countryIso) => {

        let data = {
            iso: countryIso,

        }

        await api.post('/countries/get-country', data)
            .then(res => {
                let countryData = res.data.country
                setCountry(countryData.name)
                setCountryCode(countryData.iso)

            }).catch(error => {
                console.log(error)

            })
        setToggle(!toggle)

    }

    const addCities = () => {
        let data = {
            country : country,
            iso : countryCode ,
            city : city,
            lat : lat,
            lon :lon

        }

        api.post('/cities/add-cities',data)
        .then(response=>{
            if(response && response.data.type === "success"){
                swal(`${t('City Added')}`, { icon: "success" });
            }
            if(response && response.data.type === "danger"){
                swal(`${t('City Added')}`, { icon: "error" });
            }
        }).catch(error=>{
            console.log(error)
        })
        setToggle(false)
    }



    const filteredCountries = allCountry.filter(countries => {
        if (SearchName !== '') {
            return (
                countries.name.toLowerCase().includes(SearchName.toLowerCase())
            )
        }
        if (SearchCode !== '') {
            return (
                countries.iso.toLowerCase().includes(SearchCode.toLowerCase())
            )
        }
        return countries
    })
    const indexOfLastPost = currentPage * countrysPerPage;
    const indexOfFirstPost = indexOfLastPost - countrysPerPage;
    const currentCountries = filteredCountries.slice(indexOfFirstPost, indexOfLastPost);



    return (
        <>
        <Container className="p-4">
            <Row noGutters className="page-header py-4">
                <PageTitle
                    sm="4"
                    title={t('Countries Configuration')}
                    subtitle={t('Countries Configuration')}
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
                        subtitle={t('my_actions')}
                        className="text-sm-left"
                    />
                </Row>
                <Row form className="py-2 d-flex justify-content-center">
                    <ButtonGroup>
                        <Button variant="outline-primary" onClick={() => {}}>Add Country</Button>
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
                    <table className="table mb-0 text-center table-responsive-lg">
                        <thead className="bg-light">
                            <tr>
                                <th scope="col" className="border-0">{t('Name')}</th>
                                <th scope="col" className="border-0">{t('code')}</th>
                                <th scope="col" className="border-0"></th>
                                <th scope="col" className="border-0"></th>

                            </tr>
                        </thead>
                        <tbody>
                            {
                                currentCountries.map(country=>{
                                    return(
                                        <tr>
                                            <td>{country.name}</td>
                                            <td>{country.iso}</td>


                                            <td>
                                               
                                                        <ButtonGroup size="sm" className="mr-2">
                                                            <Button title="Edit" onClick={() => { navigate(`./configuration/country/${country.iso}`)}} squared><i className="material-icons">&#xe3c9;</i></Button>
                                                            <Button title="Delete" onClick={() => { }} squared variant="danger"><i className="material-icons">&#xe872;</i></Button>
                                                        </ButtonGroup>
                                                

                                            </td>
                                            <td>
                                               
                                                        <ButtonGroup size="sm" className="mr-2">
                                                        <Button  variant="outline-primary" onClick={() => {getSingleCountry(country.iso)}}>Add City</Button>
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
                    <Pagination usersPerPage={countrysPerPage} totalUsers={allCountry.length} paginate={paginate} />

                </Row>
        </Container>
        <Modal centered={true} show={toggle}>
                        <Modal.Header className="d-flex justify-content-between align-items-center">
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "flex-end",
                                    gap:"10px",
                                    width:"100%"
        
                                }}
                            >
                                <Button
                                    // variant="success"
                                    onClick={()  => {addCities()}}
                                    className="mb-2 mr-1 btn btn-success"
                                >
                                    <i class={`fa fa-check mx-2`}></i>
                                    {t('save')}
                                </Button>
                                <Button
                                    // variant="success"
                                    className="mb-2 mr-1 btn btn-danger"
                                    onClick={() => {setToggle(false)} }
                                >
                                    <i class={`fa fa-times mx-2`}></i>
                                    {t('cancel')}
                                </Button>
                            </div>
                        </Modal.Header>
                        <Modal.Body>
                            <Row className='d-flex justify-content-between border-bottom '>
                                <Col lg='4' md='8' sm='8'>
                                    <Form.Group>
                                        <label htmlFor="country">Country</label>
   
        
                                            <Form.Control
                                                value={country}
                                                onChange={(e) => setCountry(e.target.value) }
                                                id="country"
                                                placeholder="Country"
                                            />
                                    </Form.Group>
                                </Col>
                                <Col lg='4' md='8' sm='8'>
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
                                <Row className="py-4 gap-2">
                                <Col lg='5' md='8' sm='8'>
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

export default Configuration