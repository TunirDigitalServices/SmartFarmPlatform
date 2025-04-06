import React, { useState, useEffect } from 'react'
import { Col, Row, Button, Container, FormInput, FormGroup, Card, CardBody, CardHeader } from "shards-react"
import api from '../api/api';
import swal from 'sweetalert';

const CompanyProfile = () => {


    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [address, setAddress] = useState("");
    const [phone, setPhone] = useState("");
    const [mobilePhone, setMobilePhone] = useState("");
    const [country, setCountry] = useState("");
    const [city, setCity] = useState("");

    const [mySupplier, setMySupplier] = useState([]);


    const resetForm = () => {
        setName("");
        setEmail("");
        setAddress("");
        setMobilePhone("");
        setCountry('');
        setCity('')
    }

    const getMySupplierData = async () => {
        await api.get('/supplier/suppliers')
            .then(response => {
                let supplierData = response.data.supplier;
                if (response.data.type === "success") {
                    setMySupplier(supplierData)
                    setName(supplierData.name)
                    setEmail(supplierData.email)
                    setAddress(supplierData.address)
                    setCity(supplierData.city)
                    setCountry(supplierData.country)
                    setMobilePhone(supplierData.tel_mobile)

                }
            }).catch(err => {
                console.log(err)
            })
    }

    useEffect(() => {
        getMySupplierData()
    }, [])

        const editMySupplierData =() => {

          let data = {
            name: name,
                    address: address,
                    tel_mobile: mobilePhone,
                    city: city,
                    country: country
          } 

            api.post('/supplier/edit-supplier',data)
            .then(response =>{
                if(response.data.type === "success"){
                    swal('supplier_updated', {
                        icon: "success",
                    });
                    getMySupplierData()
                }
            }).catch(err =>{
                swal({
                    icon: 'error',
                    title: 'Oops...',
                    text: 'Error'
                })
            })
        }


    return (
        <>
            <Container fluid className="main-content-container py-4">
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
                            <div>
                                <h6 className="m-0" style={{ textAlign: "left" }}>Supplier Information </h6>{" "}
                            </div>
                        </div>
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "flex-end"
                            }}
                        >
                            <Button
                                // theme="success"
                                className="mb-2 mr-1 btn btn-success"
                                onClick={editMySupplierData}
                            >
                                <i class={`fa fa-check mx-2`}></i>
                                save
                            </Button>
                            <Button
                                // theme="success"
                                className="mb-2 mr-1 btn btn-danger"
                            >
                                <i class={`fa fa-times mx-2`}></i>
                                cancel
                            </Button>
                        </div>
                    </CardHeader>

                            <CardBody>
                                <Row form className="py-4">
                                    <Col lg="6" md="12" sm="12" >
                                        <FormGroup>
                                            <label htmlFor="name">Supplier Company Name</label>
                                            <FormInput
                                                id="name"
                                                placeholder="Name"
                                                onChange={(e) => setName(e.target.value)}
                                                value={name}
                                            />
                                        </FormGroup>
                                        <FormGroup>
                                            <label htmlFor="email">Email</label>
                                            <FormInput
                                                id="email"
                                                placeholder="Email"
                                                onChange={(e) => setEmail(e.target.value)}
                                                value={email}

                                            />
                                        </FormGroup>
                                        <FormGroup>
                                            <label htmlFor="tel">Phone Number</label>
                                            <FormInput
                                                placeholder="Tel"
                                                type="tel"
                                                id="tel"
                                                value={mobilePhone}
                                                onChange={(e) => setMobilePhone(e.target.value)} />
                                        </FormGroup>

                                    </Col>
                                    <Col lg="6" md="12" sm="12">
                                        <FormGroup>
                                            <label htmlFor="Address">Address</label>
                                            <FormInput
                                                id="Address"
                                                placeholder="Address"
                                                value={address}
                                                onChange={(e) => setAddress(e.target.value)}
                                            />
                                        </FormGroup>
                                        <FormGroup>
                                            <label htmlFor="Country">Country</label>
                                            <FormInput
                                                id="Country"
                                                placeholder="Country"
                                                value={country}
                                                onChange={(e) => setCountry(e.target.value)}
                                            />
                                        </FormGroup>
                                        <FormGroup>
                                            <label htmlFor="City">City</label>
                                            <FormInput
                                                id="City"
                                                placeholder="City"
                                                value={city}
                                                onChange={(e) => setCity(e.target.value)} />
                                        </FormGroup>
                                    </Col>
                                </Row>
                            </CardBody>

                </Card>
            </Container>
        </>
    )
}

export default CompanyProfile