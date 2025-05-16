import React, { useEffect, useState } from "react";

import { useTranslation } from "react-i18next";
import { Container, Row, Col, Form, Card, InputGroup, Button } from 'react-bootstrap';
import PageTitle from '../components/common/PageTitle';
import swal from "sweetalert";
import api from '../api/api';

export default function AddFram() {
    const [farmParams, setFarmParams] = useState({
        name: "",
        groupName: "",
        cityId: ""
    })
    const [country, setCountry] = useState('')
    const [cities, setCities] = useState('')
    const [allCities, setAllCities] = useState([])
    const [countries, setCountries] = useState([])
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
        // getSoils()
        getCountries()
        getCities()
    }, [])

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

        let data = {
            name: farmParams.name,
            name_group: farmParams.groupName,
            // user_uid: userUid,
            city_id: farmParams.cityId
            // Coordinates : layer,
            // Latitude : coords.Latitude,
            // Longitude : coords.Longitude
        }
        await api.post('/farm/add-farm', data)
            .then(response => {
                if (response.data.type === "success") {
                    swal('Farm Added', { icon: "success" });
                    // getLayerFarm()

                }
            }).catch(err => {
                swal(err, { icon: "error" })
            })
    }
    const handleSubmit = (event) => {
        const form = event.currentTarget;
        if (form.checkValidity() === false) {
            event.preventDefault();
            event.stopPropagation();
        }

        setValidated(true);
    };

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
                                <Form.Label>First name</Form.Label>
                                <Form.Control
                                    required
                                    type="text"
                                    placeholder="First name"
                                    defaultValue="Mark"
                                />
                                <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} md="4" controlId="validationCustom02">
                                <Form.Label>Last name</Form.Label>
                                <Form.Control
                                    required
                                    type="text"
                                    placeholder="Last name"
                                    defaultValue="Otto"
                                />
                                <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} md="4" controlId="validationCustomUsername">
                                <Form.Label>Username</Form.Label>
                                <InputGroup hasValidation>
                                    <InputGroup.Text id="inputGroupPrepend">@</InputGroup.Text>
                                    <Form.Control
                                        type="text"
                                        placeholder="Username"
                                        aria-describedby="inputGroupPrepend"
                                        required
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        Please choose a username.
                                    </Form.Control.Feedback>
                                </InputGroup>
                            </Form.Group>
                        </Row>
                        <Row className="mb-3">
                            <Form.Group as={Col} md="6" controlId="validationCustom03">
                                <Form.Label>City</Form.Label>
                                <Form.Control type="text" placeholder="City" required />
                                <Form.Control.Feedback type="invalid">
                                    Please provide a valid city.
                                </Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} md="3" controlId="validationCustom04">
                                <Form.Label>State</Form.Label>
                                <Form.Control type="text" placeholder="State" required />
                                <Form.Control.Feedback type="invalid">
                                    Please provide a valid state.
                                </Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} md="3" controlId="validationCustom05">
                                <Form.Label>Zip</Form.Label>
                                <Form.Control type="text" placeholder="Zip" required />
                                <Form.Control.Feedback type="invalid">
                                    Please provide a valid zip.
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Row>
                        <Form.Group className="mb-3">
                            <Form.Check
                                required
                                label="Agree to terms and conditions"
                                feedback="You must agree before submitting."
                                feedbackType="invalid"
                            />
                        </Form.Group>
                        <Button type="submit">Submit form</Button>
                    </Form>
                </Card>
            </Row>


        </Container>
    )
}
