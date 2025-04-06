import React, { useEffect, useState } from 'react'
import { Container, Card, CardHeader, CardBody, ListGroup, ListGroupItem, Row, Col, Form, FormGroup, FormInput, FormSelect, FormTextarea, ButtonGroup, Button, Progress, Modal, ModalHeader, ModalBody, BreadcrumbItem, Breadcrumb, Nav, NavItem, NavLink } from "shards-react";
import PageTitle from '../components/common/PageTitle';
import { useTranslation } from 'react-i18next';
import { Link, useHistory, useParams } from 'react-router-dom';
import { Carousel } from 'react-responsive-carousel';
import countryState from '../data/gistfile.json'
import cartImg from '../images/pin.png'
import soil from '../images/soil.png'
import api from '../api/api';
import swal from 'sweetalert';
import Pagination from '../views/Pagination';
import moment from 'moment';

const ConfigurationSoils = () => {

    const [soilsPerPage] = useState(10)
    const [currentPage, setCurrentPage] = useState(1);

    const [SearchName, setSearchName] = useState('')


    const paginate = pageNumber => setCurrentPage(pageNumber);

    const { t, i18n } = useTranslation();
    const history = useHistory()

    const [allSoils, setAllSoils] = useState([])

    const [soilData, setSoilData] = useState({
        soil: "",
        ru: "",
        pwp: "",
        taw: "",
        fc: "",
        fractionRuPratique: "",
        EffPluie: "",
        soilAr :"",
        soilEn :"",
        soilPhoto :""

    })

    const [toggle, setToggle] = useState(false)
    const [toggleEdit, setToggleEdit] = useState(false)
    const [singleSoil, setSingleSoil] = useState({})



    const getSoils = async () => {
        try {
            await api.get('/soils/get-soils')
                .then(response => {
                    let listSoils = response.data.Soils
                    setAllSoils(listSoils)

                }).catch(error => {
                    console.log(error)
                })

        } catch (error) {
            console.log(error)
        }
    }

    useEffect(() => {
        getSoils()
    }, [])

    const getSingleSoil = (soilId, title) => {

        let data = {
            soil_id: soilId,
        }

        api.post('/soils/get-soil', data)
            .then(res => {
                let dataSoils = res.data.soil
                setSingleSoil(dataSoils)
                setSoilData({ soil: dataSoils.soil })
                setSoilData({ ru: dataSoils.ru })
                setSoilData({ fc: dataSoils.fc })
                setSoilData({ pwp: dataSoils.pwp })
                setSoilData({ taw: dataSoils.taw }) 
                setSoilData({ EffPluie: dataSoils.rain_eff })
                setSoilData({ fractionRuPratique: dataSoils.practical_fraction })

            }).catch(error => {
                console.log(error)

            })
        if (title === 'Edit') {
            setToggleEdit(!toggleEdit)

        }

    }


    const [selectedFile, setSelectedFile] = useState(null);
    const [uploadedFile, setUploadedFile] = useState({});
  
    const onFileChange = e => {
      setSelectedFile(e.target.files[0]);
    };
  
    const onFileUploadEdit = async () => {
        const formData = new FormData();
      formData.append('photo', selectedFile);
      formData.append('soil', singleSoil.soil);

      try {
        const res = await api.post('/soil/upload-photo', formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });
        setUploadedFile(res.data);
      } catch (err) {
        console.error(err);
      }
    };


    const addSoils = () => {
        let data = {
            soil: soilData.soil,
            ru: soilData.ru,
            fc: soilData.fc,
            pwp: soilData.pwp,
            taw: soilData.taw,
            rain_eff : soilData.EffPluie,
            practical_fraction : soilData.fractionRuPratique,
            soil_ar :soilData.soilAr,
            soil_en:soilData.soilEn,
            soil_photo:soilData.soilPhoto
        }

        api.post('/soils/add-soils', data)
            .then(response => {
                if (response && response.data.type === "success") {
                    swal(`${t('Soil Added')}`, { icon: "success" });
                    setToggle(false)
                    getSoils()
                }
                if (response && response.data.type === "danger") {
                    swal(`${t('Saving Soil Error')}`, { icon: "error" });
                }
            }).catch(error => {
                console.log(error)
            })
    }

    const handleEdit = (soilId) => {

        let data = {
            soil_id: soilId,
            soil: soilData.soil,
            ru: soilData.ru,
            fc: soilData.fc,
            pwp: soilData.pwp,
            taw: soilData.taw,
            rain_eff : soilData.EffPluie,
            practical_fraction : soilData.fractionRuPratique
        }



        api.post('/soils/edit-soil', data)
            .then(response => {
                if (response.data.type == "success") {
                    swal(" soil has been updated", {
                        icon: "success",
                    });
                    setToggle(false)
                    getSoils();
                }
                if (response.data.type && response.data.type == "danger") {
                    swal({
                        icon: 'error',
                        title: 'Oops...',
                        text: 'error_edit_soil'
                    })
                    return false;
                }
            }).catch(error => {
                swal({
                    icon: 'error',
                    title: 'Oops...',
                    text: 'error_edit_soil'
                })
            })


    }


    const handleDelete = async soilId => {


        let data = {
            soil_id: soilId,
        }
        await api.delete('/soils/delete-soil', { data: data })
            .then(response => {
                if (response.data.type && response.data.type == "danger") {
                    swal({
                        title: "Cannot Delete soil",
                        icon: "warning",
                    });
                }
                if (response.data.type == "success") {
                    getSoils();

                }
            }).catch(error => {
                swal({
                    title: "Cannot Delete soil",
                    icon: "error",
                    text: 'error_delete_crop'

                });
            })
    }

    const confirmDelete = soilId => {

        swal({
            title: "Are you sure?",
            text: "Once deleted, you will not be able to recover this soil!",
            icon: "warning",
            buttons: true,
            dangerMode: true,
        })
            .then((Delete) => {
                if (Delete) {
                    handleDelete(soilId)
                    swal(" soil has been deleted!", {
                        icon: "success",
                    });
                }
            }).catch(error => {
                swal({
                    title: "Cannot Delete soil",
                    icon: "error",
                    text: 'error_delete_soil'

                });
            })

    }


    const filteredSoils = allSoils.filter(soils => {
        if (SearchName !== '') {
            return (
                soils.soil.toLowerCase().includes(SearchName.toLowerCase())
            )
        }

        return soils
    })


    const indexOfLastPost = currentPage * soilsPerPage;
    const indexOfFirstPost = indexOfLastPost - soilsPerPage;
    const currentSoils = filteredSoils.slice(indexOfFirstPost, indexOfLastPost);


    return (
        <>
            <Container className="p-4">
                <Row noGutters className="page-header py-4">
                    <PageTitle
                        sm="4"
                        title={t('Soils Configuration')}
                        subtitle={t('Soils Configuration')}
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
                        <Button outline onClick={() => { setToggle(true) }}>Add Soil Type</Button>
                    </ButtonGroup>

                </Row>
                <Card>
                    <CardHeader className="border-bottom">
                        <div>
                            <h5>
                                Soils Info

                            </h5>

                        </div>
                    </CardHeader>
                    <CardBody>
                        <table className="table mb-0 text-center  table-responsive-lg">
                            <thead className="bg-light">
                                <tr>
                                    <th scope="col" className="border-0">{t('Soil Type')}</th>
                                    <th scope="col" className="border-0">{t('RU %')}</th>
                                    <th scope="col" className="border-0">{t('Irrigation Efficiency %')}</th>
                                    <th scope="col" className="border-0">{t('PWP %')}</th>
                                    <th scope="col" className="border-0">{t('TAW %')}</th>
                                    <th scope="col" className="border-0">{t('Rain efficiency %')}</th>
                                    <th scope="col" className="border-0">{t('Practical fraction %')}</th>
                                    
                                    <th scope="col" className="border-0"></th>

                                </tr>
                            </thead>
                            <tbody>
                                {
                                    currentSoils.map(soil => {
                                        return (
                                            <tr>
                                                <td>{soil.soil}</td>
                                                <td>{soil.ru}</td>
                                                <td>{soil.fc}</td>
                                                <td>{soil.pwp}</td>
                                                <td>{soil.taw}</td>
                                                <td>{soil.rain_eff}</td>
                                                <td>{soil.practical_fraction}</td>

                                                <td>

                                                    <ButtonGroup size="sm" className="mr-2">
                                                        <Button title="Edit" onClick={() => { getSingleSoil(soil.id, 'Edit') }} squared><i className="material-icons">&#xe3c9;</i></Button>
                                                        <Button title="Delete" onClick={() => { confirmDelete(soil.id) }} squared theme="danger"><i className="material-icons">&#xe872;</i></Button>
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
                    <Pagination usersPerPage={soilsPerPage} totalUsers={allSoils.length} paginate={paginate} />

                </Row>
            </Container>
            <Modal size='lg' centered={true} open={toggle}>
                <ModalHeader className="d-flex justify-content-between align-items-center">
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "flex-end",

                        }}
                    >
                        <Button
                            // theme="success"
                            onClick={() => { addSoils() }}
                            className="mb-2 mr-1 btn btn-success"
                        >
                            <i class={`fa fa-check mx-2`}></i>
                            {t('save')}
                        </Button>
                        <Button
                            // theme="success"
                            className="mb-2 mr-1 btn btn-danger"
                            onClick={() => { setToggle(false) }}
                        >
                            <i class={`fa fa-times mx-2`}></i>
                            {t('cancel')}
                        </Button>
                    </div>
                </ModalHeader>
                <ModalBody>
                    <Row>
                        <Col lg="12" md="12" sm="12" >

                            <CardBody>
                                <Row>
                                    <Col lg='6' md="12" sm="12">
                                        <FormGroup>
                                            <label htmlFor="soil">Soil Type</label>
                                            <FormInput
                                                id='soil'
                                                placeholder='Soil Type'
                                                value={soilData.soil}
                                                onChange={e => setSoilData({ ...soilData, soil: e.target.value })}
                                            />

                                        </FormGroup>
                                    </Col>
                                    <Col lg='6' md="12" sm="12">
                                        <FormGroup>
                                            <label htmlFor="soilAr">Soil Type (Ar)</label>
                                            <FormInput
                                                id='soilAr'
                                                placeholder="Soil Type"
                                                value={soilData.soilAr}
                                                onChange={e => setSoilData({...soilData , soilAr : e.target.value})}
                                            />
                                        </FormGroup>
                                    </Col>      
                                    <Col lg='6' md="12" sm="12">
                                        <FormGroup>
                                            <label htmlFor="soilEn">Soil Type (En)</label>
                                            <FormInput
                                                id='soilEn'
                                                placeholder="Soil Type"
                                                value={soilData.soilEn}
                                                onChange={e => setSoilData({...soilData , soilEn : e.target.value})}
                                            />
                                        </FormGroup>
                                    </Col>      
                                    {/* <Col lg='6' md="12" sm="12">
                                        <FormGroup>
                                            <label htmlFor="soilp">Soil Photo</label>
                                            <FormInput
                                                id='soilp'
                                                type="file"
                                                placeholder="Soil Photo"
                                                value={soilData.soilPhoto}
                                                onChange={onFileChange}
                                            />
                                            <button style={{background :"#E5E5E5" , border:"2px solid #d7d7d7",borderRadius:5,padding:3,margin:3}} onClick={onFileUpload}>Upload</button>
                                        </FormGroup>
                                    </Col>    */}
                                    <Col lg='6' md="12" sm="12">

                                        <FormGroup className='d-flex justify-content-center align-items-center flex-column'>
                                            <label htmlFor="Ru">La Réserve Utile (RU)</label>
                                            <FormInput
                                                id='Ru'
                                                value={soilData.ru}
                                                onChange={e => setSoilData({ ...soilData, ru: e.target.value })}
                                            />
                                        </FormGroup>
                                    </Col>

                                </Row>
                                <Row>
                                    <Col lg='5' md="12" sm="12">

                                        <FormGroup className='d-flex justify-content-center align-items-center flex-column'>
                                            <label htmlFor="pwp">Permanent Wilting Point (PWP)</label>
                                            <FormInput
                                                id='pwp'
                                                placeholder="Permanent Wilting Point (PWP)"
                                                value={soilData.pwp}
                                                onChange={e => setSoilData({ ...soilData, pwp: e.target.value })}
                                            />
                                        </FormGroup>
                                    </Col>
                                    <Col lg='3' md="12" sm="12">

                                        <FormGroup className='d-flex justify-content-center align-items-center flex-column'>
                                            <label htmlFor="Fc">Irrigation Efficiency </label>
                                            <FormInput
                                                id='Fc'
                                                placeholder='Irrigation Efficiency'
                                                value={soilData.fc}
                                                onChange={e => setSoilData({ ...soilData, fc: e.target.value })}
                                            />
                                        </FormGroup>
                                    </Col>

                                    <Col lg='4' md="12" sm="12">

                                        <FormGroup className='d-flex justify-content-center align-items-center flex-column'>
                                            <label htmlFor="taw">Total available water (TAW)</label>
                                            <FormInput
                                                id='taw'
                                                placeholder="Total available water (TAW)"
                                                value={soilData.taw}
                                                onChange={e => setSoilData({ ...soilData, taw: e.target.value })}
                                            />
                                        </FormGroup>
                                    </Col>

                                </Row>
                                <Row>
                                    <Col lg='4' md="12" sm="12">

                                        <FormGroup className='d-flex justify-content-center align-items-center flex-column'>
                                            <label htmlFor="Practical Fraction Ru">Practical Fraction Ru</label>
                                            <FormInput
                                                id='Practical Fraction Ru'
                                                placeholder='Practical Fraction Ru'
                                                value={soilData.fractionRuPratique}
                                                onChange={e => { setSoilData({...soilData , fractionRuPratique : e.target.value}) }}

                                            />
                                        </FormGroup>
                                    </Col>

                                    <Col lg='4' md="12" sm="12">

                                        <FormGroup className='d-flex justify-content-center align-items-center flex-column'>
                                            <label htmlFor="Rain Efficiency">Rain Efficiency</label>
                                            <FormInput
                                                id='Rain Efficiency'
                                                placeholder="Rain Efficiency"
                                                value={soilData.EffPluie}
                                                onChange={e => { setSoilData({...soilData , EffPluie : e.target.value}) }}

                                            />
                                        </FormGroup>
                                    </Col>
                                </Row>
                                <FormGroup>
                                    <label htmlFor="feDescription">{t('desc')}</label>
                                    <FormTextarea
                                        placeholder={t('desc')}
                                        id="feDescription"
                                        rows="5" />

                                </FormGroup>

                            </CardBody>
                        </Col>
                    </Row>
                </ModalBody>
            </Modal>
            <Modal size='lg' centered={true} open={toggleEdit}>
                <ModalHeader className="d-flex justify-content-between align-items-center">
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "flex-end",

                        }}
                    >
                        <Button
                            // theme="success"
                            onClick={() => { handleEdit(singleSoil.id) }}
                            className="mb-2 mr-1 btn btn-success"
                        >
                            <i class={`fa fa-check mx-2`}></i>
                            {t('save')}
                        </Button>
                        <Button
                            // theme="success"
                            className="mb-2 mr-1 btn btn-danger"
                            onClick={() => { setToggleEdit(false) }}
                        >
                            <i class={`fa fa-times mx-2`}></i>
                            {t('cancel')}
                        </Button>
                    </div>
                </ModalHeader>
                <ModalBody>
                    <Row>
                        <Col lg="12" md="12" sm="12" >

                            <CardBody>
                                <Row>
                                    <Col lg='6' md="12" sm="12">
                                        <FormGroup>
                                            <label htmlFor="soil">Soil Type</label>
                                            <FormInput
                                                id='soil'
                                                placeholder='Soil Type'
                                                value={soilData.soil}
                                                onChange={e => setSoilData({ ...soilData, soil: e.target.value })}
                                            />

                                        </FormGroup>
                                    </Col>
                                    <Col lg='6' md="12" sm="12">
                                        <FormGroup>
                                            <label htmlFor="soilAr">Soil Type (Ar)</label>
                                            <FormInput
                                                id='soilAr'
                                                placeholder="Soil Type"
                                                value={soilData.soilAr}
                                                onChange={e => setSoilData({...soilData , soilAr : e.target.value})}
                                            />
                                        </FormGroup>
                                    </Col>      
                                    <Col lg='6' md="12" sm="12">
                                        <FormGroup>
                                            <label htmlFor="soilEn">Soil Type (En)</label>
                                            <FormInput
                                                id='soilEn'
                                                placeholder="Soil Type"
                                                value={soilData.soilEn}
                                                onChange={e => setSoilData({...soilData , soilEn : e.target.value})}
                                            />
                                        </FormGroup>
                                    </Col>      
                                    <Col lg='6' md="12" sm="12">
                                        <FormGroup>
                                            <label htmlFor="soilp">Soil Photo</label>
                                            <FormInput
                                                id='soilp'
                                                type="file"
                                                placeholder="Soil Photo"
                                                // value={soilData.soilPhoto}
                                                onChange={onFileChange}
                                            />
                                            <button style={{background :"#E5E5E5" , border:"2px solid #d7d7d7",borderRadius:5,padding:3,margin:3}} onClick={onFileUploadEdit}>Upload</button>
                                            {uploadedFile ? <h6 style={{fontWeight :"bold"}}>{uploadedFile.message}</h6> : null}

                                        </FormGroup>
                                    </Col>   
                                    <Col lg='6' md="12" sm="12">

                                        <FormGroup className='d-flex justify-content-center align-items-center flex-column'>
                                            <label htmlFor="Ru">La Réserve Utile (RU)</label>
                                            <FormInput
                                                id='Ru'
                                                value={soilData.ru}
                                                onChange={e => setSoilData({ ...soilData, ru: e.target.value })}
                                            />
                                        </FormGroup>
                                    </Col>

                                </Row>
                                <Row>
                                    <Col lg='5' md="12" sm="12">

                                        <FormGroup className='d-flex justify-content-center align-items-center flex-column'>
                                            <label htmlFor="pwp">Permanent Wilting Point (PWP)</label>
                                            <FormInput
                                                id='pwp'
                                                placeholder="Permanent Wilting Point (PWP)"
                                                value={soilData.pwp}
                                                onChange={e => setSoilData({ ...soilData, pwp: e.target.value })}
                                            />
                                        </FormGroup>
                                    </Col>
                                    <Col lg='3' md="12" sm="12">

                                        <FormGroup className='d-flex justify-content-center align-items-center flex-column'>
                                            <label htmlFor="Fc">Irrigation Efficiency </label>
                                            <FormInput
                                                id='Fc'
                                                placeholder='Irrigation Efficiency'
                                                value={soilData.fc}
                                                onChange={e => setSoilData({ ...soilData, fc: e.target.value })}
                                            />
                                        </FormGroup>
                                    </Col>

                                    <Col lg='4' md="12" sm="12">

                                        <FormGroup className='d-flex justify-content-center align-items-center flex-column'>
                                            <label htmlFor="taw">Total available water (TAW)</label>
                                            <FormInput
                                                id='taw'
                                                placeholder="Total available water (TAW)"
                                                value={soilData.taw}
                                                onChange={e => setSoilData({ ...soilData, taw: e.target.value })}
                                            />
                                        </FormGroup>
                                    </Col>

                                </Row>
                                <Row>
                                    <Col lg='4' md="12" sm="12">

                                        <FormGroup className='d-flex justify-content-center align-items-center flex-column'>
                                            <label htmlFor="Practical Fraction Ru">Practical Fraction Ru</label>
                                            <FormInput
                                                id='Practical Fraction Ru'
                                                placeholder='Practical Fraction Ru'
                                                value={soilData.fractionRuPratique}
                                                onChange={e => { setSoilData({...soilData , fractionRuPratique : e.target.value}) }}
                                            />
                                        </FormGroup>
                                    </Col>
                                    <Col lg='4' md="12" sm="12">

                                        <FormGroup className='d-flex justify-content-center align-items-center flex-column'>
                                            <label htmlFor="Rain Efficiency">Rain Efficiency</label>
                                            <FormInput
                                                id='Rain Efficiency'
                                                placeholder="Rain Efficiency"
                                                value={soilData.EffPluie}
                                                onChange={e => { setSoilData({...soilData , EffPluie : e.target.value}) }}
                                            />
                                        </FormGroup>
                                    </Col>
                                </Row>
                                <FormGroup>
                                    <label htmlFor="feDescription">{t('desc')}</label>
                                    <FormTextarea
                                        placeholder={t('desc')}
                                        id="feDescription"
                                        rows="5" />

                                </FormGroup>

                            </CardBody>
                        </Col>
                    </Row>
                </ModalBody>
            </Modal>
        </>
    )
}

export default ConfigurationSoils