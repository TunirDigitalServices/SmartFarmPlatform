import React, { useState, useEffect } from 'react'
import { Container, Card, Row, Col, FormGroup, FormInput, ButtonGroup, Button, Modal, ModalBody, ModalHeader, Nav, NavItem, NavLink } from 'shards-react'
import PageTitle from '../components/common/PageTitle'
import api from '../api/api'
import swal from 'sweetalert'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next';

const AllSuppliers = () => {

    const { t, i18n } = useTranslation();

    const [toggle, setToggle] = useState(false)
    const [SearchEmail, setSearchEmail] = useState('');
    const [SearchName, setSearchName] = useState('');
    const [suppliers, setSuppliers] = useState([])

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [address, setAddress] = useState("");
    const [phone, setPhone] = useState("");
    const [mobilePhone, setMobilePhone] = useState("");
    const [country, setCountry] = useState("");
    const [city, setCity] = useState("");

    const [SingleSupplier, setSingleSupplier] = useState([]);

    const getSingleSupplier = async (supplierUid) => {

        let data = {
            supplier_uid: supplierUid,
        }

        await api.post('/admin/single-supplier', data)
            .then(response => {
                let supplierData = response.data.supplier;
                if (response.data.type === "success") {
                    setSingleSupplier(supplierData)
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
        setToggle(!toggle)
    }


    const getAllSuppliers = async () => {
        await api.get('/admin/exist-suppliers')
            .then(response => {
                let allSuppliers = response.data.suppliers
                
                setSuppliers(allSuppliers)
            }).catch(err => {
                console.log(err)
            })
    }

    useEffect(() => {
        getAllSuppliers()
    }, [])

    const editMySupplierData = (supplierUid) => {

        let data = {
            name: name,
            address: address,
            tel_mobile: mobilePhone,
            city: city,
            country: country,
            supplier_uid: supplierUid
        }

        api.post('/admin/edit-supplier', data)
            .then(response => {
                if (response.data.type === "success") {
                    swal('supplier_updated', {
                        icon: "success",
                    });
                    getAllSuppliers()
                }
            }).catch(err => {
                swal({
                    icon: 'error',
                    title: 'Oops...',
                    text: 'Error'
                })
            })
    }



    const filteredSuppliers = suppliers.filter(supplier => {
        if (SearchName !== '') {
            return (
                supplier.name.toLowerCase().includes(SearchName.toLowerCase())
            )
        }
        if (SearchEmail !== '') {
            return (
                supplier.email.toLowerCase().includes(SearchEmail.toLowerCase())
            )
        }
        return supplier
    })

    return (
        <>
            <Container>
                <Row noGutters className="page-header py-4">
                    <PageTitle
                        sm="4"
                        title='list_suppliers'
                        subtitle='list_suppliers'
                        className="text-sm-left"
                    />
                </Row>
                    <Row className="d-flex justify-content-center">
                        <Nav justified pills className="bg-white w-25">
                            <NavItem>
                                <NavLink >
                                    <Link to={`/admin/users`}>{t('list_users')}</Link>
                                </NavLink>
                            </NavItem>
                            <NavItem>
                                <NavLink active>
                                    {t('all_suppliers')}
                                </NavLink>
                            </NavItem>
                        </Nav>

                    </Row>
                <Row>
                    <PageTitle
                        sm="4"
                        subtitle='search_suppliers'
                        className="text-sm-left"
                    />
                </Row>

                <Row form className='d-flex justify-content-center'>
                    <Col md="3" className="form-group">
                        <FormGroup>
                            <div className="d-flex">
                                <FormInput
                                    value={SearchName}
                                    onChange={(e) => setSearchName(e.target.value)}
                                    id="search"
                                    placeholder="Search By name" />
                                {/* <Button onClick={() => searchByName()}>
                Search
            </Button> */}

                            </div>
                        </FormGroup>
                    </Col>
                    <Col md="3" className="form-group">
                        <FormGroup>
                            <div className="d-flex">
                                <FormInput
                                    value={SearchEmail}
                                    onChange={(e) => setSearchEmail(e.target.value)}
                                    id="search"
                                    placeholder="Search By email" />
                                {/* <Button onClick={() => searchByEmail()}>
                Search
            </Button> */}

                            </div>
                        </FormGroup>
                    </Col>
                </Row>
                <Card>
                    <table className="table mb-0 text-center">
                        <thead className="bg-light">
                            <tr>
                                <th scope="col" className="border-0">{t('name')}</th>
                                <th scope="col" className="border-0">{t('email')}</th>
                                <th scope="col" className="border-0">{t('country')}</th>
                                <th scope="col" className="border-0">{t('city')}</th>
                                <th scope="col" className="border-0">mobile</th>
                                <th scope="col" className="border-0"></th>

                            </tr>
                        </thead>
                        <tbody>
                            {
                                filteredSuppliers.map(supplier => {
                                    return (
                                        <tr>
                                            <td>{supplier.name}</td>
                                            <td>{supplier.email}</td>
                                            <td>{supplier.country}</td>
                                            <td>{supplier.city}</td>
                                            <td>{supplier.tel_mobile}</td>
                                            <td>
                                                <ButtonGroup size="sm" className="mr-2">
                                                    <Button title="Edit" onClick={() => getSingleSupplier(supplier.uid)} squared><i className="material-icons">&#xe3c9;</i></Button>
                                                    <Button title="Delete" onClick={() => { }} squared theme="danger"><i className="material-icons">&#xe872;</i></Button>
                                                </ButtonGroup>

                                            </td>
                                        </tr>

                                    )
                                })
                            }

                        </tbody>
                    </table>


                </Card>
            </Container>
            <Modal open={toggle} >
                <ModalHeader closeAriaLabel>

                    <h6 className="m-0">{t('edit_supplier')}</h6>{" "}

                    <div
                        style={{
                            display: "flex",
                            justifyContent: "flex-end",

                        }}
                    >
                        <Button
                            // theme="success"
                            className="mb-2 mr-1 btn btn-success"
                            onClick={() => editMySupplierData(SingleSupplier.uid)}
                        >
                            {t('save')}
                            <i class={`fa fa-check mx-2`}></i>
                        </Button>
                        <Button
                            // theme="success"
                            className="mb-2 mr-1 btn btn-danger"
                            onClick={() => setToggle(false)}
                        >
                            {t('cancel')}
                            <i class={`fa fa-times mx-2`}></i>
                        </Button>
                    </div>

                </ModalHeader>
                <ModalBody>
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
                                <label htmlFor="email">{t('email')}</label>
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
                                <label htmlFor="Address">{t('address')}</label>
                                <FormInput
                                    id="Address"
                                    placeholder="Address"
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                />
                            </FormGroup>
                            <FormGroup>
                                <label htmlFor="Country">{t('country')}</label>
                                <FormInput
                                    id="Country"
                                    placeholder="Country"
                                    value={country}
                                    onChange={(e) => setCountry(e.target.value)}
                                />
                            </FormGroup>
                            <FormGroup>
                                <label htmlFor="City">{t('city')}</label>
                                <FormInput
                                    id="City"
                                    placeholder="City"
                                    value={city}
                                    onChange={(e) => setCity(e.target.value)} />
                            </FormGroup>
                        </Col>
                    </Row>
                </ModalBody>
            </Modal>
        </>
    )
}

export default AllSuppliers