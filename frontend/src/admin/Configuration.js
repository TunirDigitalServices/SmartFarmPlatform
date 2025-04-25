import React, { useEffect, useState } from 'react'
import { Container, Card, CardHeader, CardBody, ListGroup, ListGroupItem, Row, Col, Form, FormGroup, FormInput, FormSelect, FormTextarea, ButtonGroup, Button, Progress, Modal, ModalHeader, ModalBody, BreadcrumbItem, Breadcrumb, Nav, NavItem, NavLink } from "shards-react";
import PageTitle from '../components/common/PageTitle';
import { useTranslation } from 'react-i18next';
import { Link , useHistory , useParams } from 'react-router-dom';
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
    const history = useHistory()

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
    }



    const filteredCountries = allCountry.filter(countries => {
        if (SearchName !== '') {
            return (
                countries.name.toLowerCase().includes(SearchName.toLowerCase())
            )
        }
        if (SearchCode !== '') {
            return (
                countries.code.toLowerCase().includes(SearchCode.toLowerCase())
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
                <Row form className="d-flex justify-content-center">
                    <Col md="3" className="form-group">
                        <FormGroup>
                            <div className="d-flex">
                                <FormInput
                                    value={SearchName}
                                    onChange={(e) => setSearchName(e.target.value)}
                                    id="search"
                                    placeholder="Search By Name " />

                            </div>
                        </FormGroup>
                    </Col>
                    <Col md="3" className="form-group">
                        <FormGroup>
                            <div className="d-flex">
                                <FormInput
                                     value={SearchCode}
                                     onChange={(e) => setSearchCode(e.target.value)}
                                    id="search"
                                    placeholder="Search By Code " />

                            </div>
                        </FormGroup>
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
                        <Button outline onClick={() => {}}>Add Country</Button>
                    </ButtonGroup>

                </Row>
                <Card>
                    <CardHeader className="border-bottom">
                        <div>
                            <h5>
                                Location Info

                            </h5>

                        </div>
                    </CardHeader>
                    <CardBody>
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
                                                            <Button title="Edit" onClick={() => { history.push(`./configuration/country/${country.iso}`)}} squared><i className="material-icons">&#xe3c9;</i></Button>
                                                            <Button title="Delete" onClick={() => { }} squared theme="danger"><i className="material-icons">&#xe872;</i></Button>
                                                        </ButtonGroup>
                                                

                                            </td>
                                            <td>
                                               
                                                        <ButtonGroup size="sm" className="mr-2">
                                                        <Button  outline onClick={() => {getSingleCountry(country.iso)}}>Add City</Button>
                                                        </ButtonGroup>
                                                

                                            </td>
                                            
                                        </tr>

                                    )
                                })
                            }


                        </tbody>
                    </table>
                    </CardBody>
                </Card>
                <Row className="py-4 justify-content-center">
                    <Pagination usersPerPage={countrysPerPage} totalUsers={allCountry.length} paginate={paginate} />

                </Row>
        </Container>
        <Modal centered={true} open={toggle}>
                        <ModalHeader className="d-flex justify-content-between align-items-center">
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
                        </ModalHeader>
                        <ModalBody>
                            <Row className='d-flex justify-content-center border-bottom'>
                                <Col lg='4' md='8' sm='8'>
                                    <FormGroup>
                                        <label htmlFor="country">Country</label>
   
        
                                            <FormInput
                                                value={country}
                                                onChange={(e) => setCountry(e.target.value) }
                                                id="country"
                                                placeholder="Country"
                                            />
                                    </FormGroup>
                                </Col>
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
        </>
    )
}

export default Configuration