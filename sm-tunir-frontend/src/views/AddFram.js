import React, { useEffect, useState } from "react";

import { useTranslation } from "react-i18next";
import { Container, Row, Col, Form, Card, InputGroup, Button } from 'react-bootstrap';
import PageTitle from '../components/common/PageTitle';
import swal from "sweetalert";
import api from '../api/api';

export default function AddFram() {
    const [farmParams, setFarmParams] = useState({
        name: "",
        name_group: "",
        user_id: "",
        city_id: ""
    })
    const [country, setCountry] = useState('')
    const [cities, setCities] = useState('')
    const [allCities, setAllCities] = useState([])
    const [countries, setCountries] = useState([])
    const [users, setUsers] = useState([])
    const [validated, setValidated] = useState(false);
    const { t } = useTranslation();

    useEffect(() => {
        const getCities = async () => {
            await api.get('/cities/get-cities').then(res => {
                const cities = res.data.Cities;
                setAllCities(cities);

            })
        }

        const getCountries = async () => {
            await api.get('/countries/get-countries').then(res => {
                const countries = res.data.Countries;
                setCountries(countries);

            })
        }
        const getUsers = async () => {
            await api.get('/admin/users').then(res => {
                const usersData = res.data.users
                setUsers(usersData);

            })
        }




        getUsers()
        getCountries()
        getCities()
    }, [])
    console.log(users, "users");

    const handleCountryPick = (e) => {
        e.preventDefault();
        const country = countries.find(
            (country) => country.iso === e.target.value
        );
        let Cities = []
        if (country) {
            allCities.map((city) => {
                if (city.iso === country.iso) {
                    Cities.push({
                        city: city.city,
                        id: city.id,
                        lat: city.lat,
                        lon: city.lon
                    })
                }
            });

            setCountry(country.iso);
            setCities(Cities)

        }
    };
  const addFarm = async () => {
    console.log("addfarm triggered");
    const data=farmParams

    try {
        const response = await api.post('/farm/add-farm', data);

        if (response.data.type === "success") {
            swal('Farm Added', { icon: "success" });
            // getLayerFarm()
        } else {
            swal(response.data.message || 'Something went wrong.', { icon: "error" });
        }

    } catch (err) {
        console.error("Error adding farm:", err);

        const message =
            err.response?.data?.message || 
            err.message ||                 
            "An unknown error occurred.";

        swal("Error", message, "error");
    }
};

    const handleSubmit = async (event) => {
        event.preventDefault()
        const form = event.currentTarget;
        if (form.checkValidity() === false) {

            event.stopPropagation();
        } else {
            await addFarm();
        }

        setValidated(true);
    };
    console.log(farmParams, "farrrm prams");


    return (
        <Container className="p-md-5 p-3">
            <Row className='pb-2'>
                <PageTitle subtitle={`${t('farm_setup')}`} className="mb-1" />
                <Card className="bg-light border-0 rounded shadow-sm ">
                    <Card.Body>
                        <p style={{ fontSize: '16px', lineHeight: '1.5', margin: '0' }}>
                            "To get started, please provide a name and location for your farm. This will help us to identify and locate your farm accurately."
                        </p>
                        {/* <Row>
                            <div className="d-flex gap-2">
                                <Col lg="6" md="12" sm="12">
                                    <Form.Group controlId="farmName">
                                        <Form.Label>{t('name_farm')} *</Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder={t('name_farm')}
                                            required
                                            value={farmParams.name}
                                            onChange={(e) => setFarmParams({ ...farmParams, name: e.target.value })}
                                            style={{ border: '1px solid #0BAECB' }}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col lg="6" md="12" sm="12">
                                    <Form.Group controlId="groupName">
                                        <Form.Label>{t('group_name')}</Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder={t('group_name')}
                                            value={farmParams.groupName}
                                            onChange={(e) => setFarmParams({ ...farmParams, groupName: e.target.value })}
                                        />
                                    </Form.Group>
                                </Col>
                            </div>
                        </Row>

                        <Row className="pt-1">
                            <div className="d-flex gap-2">
                                <Col lg="6" md="12" sm="12">
                                    <Form.Group controlId="country">
                                        <Form.Label>{t('select_country')} *</Form.Label>
                                        <Form.Select
                                            onChange={handleCountryPick}
                                            value={country}
                                            style={{ border: '1px solid #0BAECB' }}
                                        >
                                            {countries.map(country => (
                                                <option key={country.id} value={country.iso}>{country.name}</option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                                <Col lg="6" md="12" sm="12">
                                    <Form.Group controlId="city">
                                        <Form.Label>{t('select_city')} *</Form.Label>
                                        <Form.Select
                                            value={farmParams.cityId}
                                            onChange={e => setFarmParams({ ...farmParams, cityId: e.target.value })}
                                            style={{ border: '1px solid #0BAECB' }}
                                        >
                                            <option value="">{t('select_city')}</option>
                                            {cities && cities.map(city => (
                                                <option key={city.id} value={city.id}>{city.city}</option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                            </div>
                        </Row> */}

                    </Card.Body>
                    <Form noValidate validated={validated} onSubmit={handleSubmit} className="p-md-5 p-3">
                        <Row className="mb-3 gx-3 gy-3 ">
                            <Form.Group as={Col} md="4" controlId="validationCustom01">
                                <Form.Label>{t('name_farm')} *</Form.Label>
                                <Form.Control
                                    required
                                    type="text"
                                    placeholder={t('name_farm')}
                                    value={farmParams.name}
                                    onChange={(e) => setFarmParams({ ...farmParams, name: e.target.value })}

                                />
                                <Form.Control.Feedback type="invalid">
                                    Please provide a Farm Name.
                                </Form.Control.Feedback>
                                <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} md="4" controlId="validationCustom02">
                                <Form.Label>{t('group_name')}</Form.Label>
                                <Form.Control
                                    required
                                    type="text"
                                    placeholder={t('group_name')}
                                    value={farmParams.name_group}
                                    onChange={(e) => setFarmParams({ ...farmParams, name_group: e.target.value })}
                                />
                                <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                                <Form.Control.Feedback type="invalid">
                                    Please provide a valid group name.
                                </Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} md="4" controlId="validationCustomUsername">
                                <Form.Label>{t('select_country')} *</Form.Label>


                                <Form.Select
                                    onChange={handleCountryPick}
                                    value={country}

                                >
                                    {countries.map(country => (
                                        <option key={country.id} value={country.iso}>{country.name}</option>
                                    ))}
                                </Form.Select>
                                <Form.Control.Feedback type="invalid">
                                    Please choose a username.
                                </Form.Control.Feedback>

                            </Form.Group>
                        </Row>
                        <Row className="mb-3">
                            <Form.Group as={Col} md="6" controlId="validationCustom03">
                                <Form.Label>{t('select_city')} *</Form.Label>
                                <Form.Select
                                    value={farmParams.city_id}
                                    onChange={e => setFarmParams({ ...farmParams, city_id: e.target.value })}

                                >
                                    <option value="">{t('select_city')}</option>
                                    {cities && cities.map(city => (
                                        <option key={city.id} value={city.id}>{city.city}</option>
                                    ))}
                                </Form.Select>
                                <Form.Control.Feedback type="invalid">
                                    Please provide a valid city.
                                </Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} md="6" controlId="validationCustom03">
                                <Form.Label>{t('select_user')} *</Form.Label>
                                <Form.Select
                                    value={farmParams.user_id}
                                    onChange={e => setFarmParams({ ...farmParams, user_id: e.target.value })}

                                >
                                    <option value="">{t('select_user')}</option>
                                    {users && users.map(user => (
                                        <option key={user.id} value={user.id}>{user.name}</option>
                                    ))}
                                </Form.Select>
                                <Form.Control.Feedback type="invalid">
                                    Please provide a valid city.
                                </Form.Control.Feedback>
                            </Form.Group>

                        </Row>
                        <div className="d-flex justify-content-end">

                            <Button type="submit mt-4">Submit form</Button>
                        </div>
                    </Form>
                </Card>
            </Row>


        </Container>
    )
}
