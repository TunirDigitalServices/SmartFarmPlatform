import React, { useEffect, useState } from 'react'
import { Container, Card, CardHeader, CardBody, ListGroup, ListGroupItem, Row, Col, Form, FormGroup, FormInput, FormSelect, FormTextarea, ButtonGroup, Button, Progress, Modal, ModalHeader, ModalBody, BreadcrumbItem, Breadcrumb, Nav, NavItem, NavLink } from "shards-react";
import PageTitle from '../components/common/PageTitle';
import { useTranslation } from 'react-i18next';
import { Link , useHistory , useParams } from 'react-router-dom';
import { Carousel } from 'react-responsive-carousel';
import countryState from '../data/gistfile.json'
import cartImg from '../images/pin.png'
import soil from '../images/soil.png'
import api from '../api/api';
import swal from 'sweetalert';
import Pagination from '../views/Pagination';
import moment from 'moment';


const ConfigurationIrrigation = () => {

    const [irrigationsPerPage] = useState(10)
    const [currentPage, setCurrentPage] = useState(1);

    const [SearchName, setSearchName] = useState('')


    const paginate = pageNumber => setCurrentPage(pageNumber);

    const { t, i18n } = useTranslation();
    const history = useHistory()

    const [allIrrigations,setAllIrrigations] = useState([])

    const [irrigationData,setIrrigationData] = useState({
        irrigation : '',
        pivotShape : '',
        lateral : '',
        effIrrig : ''
    })

    const [checked,setChecked] = useState(false)
    const [toggle ,setToggle] = useState(false)
    const [toggleEdit ,setToggleEdit] = useState(false)
    const [singleIrrig ,setSingleIrrig] = useState({})

    const getIrrigations = async () => {
        try {
                await api.get('/irrigations/get-irrigations')
                .then(response=>{
                        let listIrrigations = response.data.Irrigations
                        setAllIrrigations(listIrrigations)
                }).catch(error =>{
                    console.log(error)
                })
                
        } catch (error) {   
            console.log(error)
        }
}

useEffect(() => {
    getIrrigations()
}, [])

const getSingleIrrig =  (irrigationId,title) => {


    let data = {
        irrigation_id: irrigationId,
    }

    api.post('/irrigations/get-irrigation', data)
        .then(res => {
            let IrrigationData = res.data.irrigation
            setSingleIrrig(IrrigationData)
            setIrrigationData({irrigation : IrrigationData.irrigation})
            setIrrigationData({pivotShape : IrrigationData.pivotShape})
            setIrrigationData({lateral : IrrigationData.lateral})
            setIrrigationData({effIrrig : IrrigationData.effIrrig})

        }).catch(error => {
            swal({
                title: "Error",
                icon: "error",

            });

        })
        if(title === 'Edit'){
            setToggleEdit(!toggleEdit)

        }
}

const addIrrigations = () => {
    let data = {
        irrigation : irrigationData.irrigation ,
        pivot_shape : irrigationData.pivotShape,
        lateral : irrigationData.lateral,
        effIrrig : irrigationData.effIrrig
    }

    api.post('/irrigations/add-irrigations',data)
    .then(response=>{
        if(response && response.data.type === "success"){
            swal(`${t('Irrigation Added')}`, { icon: "success" });
            setToggle(false)
            getIrrigations()
        }
        if(response && response.data.type === "danger"){
            swal(`${t('Saving Irrigation Error')}`, { icon: "error" });
        }
    }).catch(error=>{
        console.log(error)
    })
}

const handleEdit = (irrigationId) => {

    let data = {
        irrigation_id : irrigationId,
        irrigation : irrigationData.irrigation ,
        pivot_shape : irrigationData.pivotShape,
        lateral : irrigationData.lateral,
        effIrrig : irrigationData.effIrrig

    }



    api.post('/irrigations/edit-irrigation', data)
      .then(response => {
        if (response.data.type == "success") {
          swal(" irrigation has been updated", {
            icon: "success",
          });
          setToggleEdit(false)
          getIrrigations();
        }
        if (response.data.type && response.data.type == "danger") {
          swal({
            icon: 'error',
            title: 'Oops...',
            text: 'error_edit_irrigation'
          })
          return false;
        }
      }).catch(error => {
        swal({
          icon: 'error',
          title: 'Oops...',
          text: 'error_edit_irrigation'
        })
      })


  }


  const handleDelete = async irrigationId => {


    let data = {
        irrigation_id: irrigationId,
    }
    await api.delete('/irrigations/delete-irrigation', { data: data })
        .then(response => {
            if (response.data.type && response.data.type == "danger") {
                swal({
                    title: "Cannot Delete irrifation",
                    icon: "warning",
                });
            }
            if (response.data.type == "success") {
                getIrrigations();
               
            }
        }).catch(error => {
            swal({
                title: "Cannot Delete irrigation",
                icon: "error",
                text: 'error_delete_irrigation'
                
            });
        })
    }

const confirmDelete = irrigationId => {

    swal({
        title: "Are you sure?",
        text: "Once deleted, you will not be able to recover this irrigation!",
        icon: "warning",
        buttons: true,
        dangerMode: true,
    })
        .then((Delete) => {
            if (Delete) {
                handleDelete(irrigationId)
                swal(" irrigation has been deleted!", {
                    icon: "success",
                });
            }
        }).catch(error => {
            swal({
                title: "Cannot Delete irrigation",
                icon: "error",
                text: 'error_delete_irrigation'

            });
        })

} 



const IrrigationPropsByType = () => {
    switch (irrigationData.irrigation) {
        case 'Pivot':
                return (
                    <Col lg='6' md="12" sm="12">

                    <FormGroup className='d-flex justify-content-center align-items-center flex-column'>
                        <label htmlFor="pivotShape"></label>
                        <FormSelect
                            id='pivotShape'
                            value={irrigationData.pivotShape}
                            onChange={e => setIrrigationData({...irrigationData , pivotShape : e.target.value})}

                        >
                            <option value="">Select type</option>
                            <option value="circular">Circular</option>
                            <option value="semi_circular">Semi circular</option>

                        </FormSelect>
                    </FormGroup>
                </Col>
                )
            case ('Lateral') :
            return (
                <Col lg='6' md="12" sm="12">

                <FormGroup className='d-flex justify-content-center align-items-center flex-column'>
                    <label htmlFor="lateral"></label>
                    <FormSelect
                        id='lateral'
                        value={irrigationData.lateral}
                        onChange={e => setIrrigationData({...irrigationData , lateral : e.target.value})}

                    >
                        <option value="">Select type</option>
                        <option value="lateral_ns">Lateral NS</option>
                        <option value="lateral_ew">Lateral EW</option>

                    </FormSelect>
                </FormGroup>
        </Col>
            )       
        default: return null
            break;
    }
}

const filteredIrrigations = allIrrigations.filter(irrigations => {
    if (SearchName !== '') {
        return (
            irrigations.irrigation.toLowerCase().includes(SearchName.toLowerCase())
        )
    }
    
    return irrigations
})


const indexOfLastPost = currentPage * irrigationsPerPage;
const indexOfFirstPost = indexOfLastPost - irrigationsPerPage;
const currentIrrigations = filteredIrrigations.slice(indexOfFirstPost, indexOfLastPost);

  return (
    <>
    <Container className="p-4">
        <Row noGutters className="page-header py-4">
            <PageTitle
                sm="4"
                title={t('Irrigations Configuration')}
                subtitle={t('Irrigations Configuration')}
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
                    <Button outline onClick={() => {setToggle(true)}}>Add Irrigations Type</Button>
                </ButtonGroup>

            </Row>
            <Card>
                <CardHeader className="border-bottom">
                    <div>
                        <h5>
                            Irrigations Info

                        </h5>

                    </div>
                </CardHeader>
                <CardBody>
                <table className="table mb-0 text-center  table-responsive-lg">
                    <thead className="bg-light">
                        <tr>
                            <th scope="col" className="border-0">{t('Irrigation Type')}</th>
                            <th scope="col" className="border-0">{t('Pivot shape')}</th>
                            <th scope="col" className="border-0">{t('Lateral')}</th>
                            <th scope="col" className="border-0"></th>
    

                        </tr>
                    </thead>
                    <tbody>
                            {
                                currentIrrigations.map(irrigation=>{
                                    return (
                                        <tr>
                                            <td>{irrigation.irrigation}</td>
                                            <td>{irrigation.pivot_shape}</td>
                                            <td>{irrigation.lateral}</td>       
    
    
    
                                            <td>
                                               
                                                        <ButtonGroup size="sm" className="mr-2">
                                                            <Button title="Edit" onClick={() => {getSingleIrrig(irrigation.id,'Edit')}} squared><i className="material-icons">&#xe3c9;</i></Button>
                                                            <Button title="Delete" onClick={() => {confirmDelete(irrigation.id)}} squared theme="danger"><i className="material-icons">&#xe872;</i></Button>
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
                <Pagination usersPerPage={irrigationsPerPage} totalUsers={allIrrigations.length} paginate={paginate} />

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
                                onClick={()  => {addIrrigations()}}
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
                    <Row>
                    <Col lg="12" md="12" sm="12" >

                        <CardBody>
                            <Row>
                                <Col lg='6' md="12" sm="12">
                                    <FormGroup>
                                        <label htmlFor="irrig">Irrigation Type</label>
                                        <FormSelect
                                            id='irrig'
                                            value={irrigationData.irrigation}
                                            onChange={e => setIrrigationData({...irrigationData , irrigation : e.target.value})}
                                        
                                        >
                                            <option value="">Select type</option>
                                            {
                                                ['Pivot','Drip','Lateral','Furrow','SDI','Sprinkler'].map(irrig=>{
                                                    return(
                                                        <option value={irrig}>{irrig}</option>
                                                    )
                                                })

                                            }
                                        </FormSelect>    
                                        <input type="checkbox" name="Autre" id="check" onClick={() => setChecked(!checked)} /> {t('other')}
                                        {
                                            checked
                                            ?

                                            <FormInput 
                                            value={irrigationData.irrigation}
                                            placeholder={t('Irrigation')}
                                            onChange={e => setIrrigationData({...irrigationData , irrigation : e.target.value})}
                                            />

                                            :
                                            ''
                                        }
                      
                                    </FormGroup>
                                </Col>

                                <Col lg='6' md="12" sm="12">
                                    <FormGroup>
                                        <label htmlFor="irrig">{t('efficience_irrigation')}</label>
                                        <FormInput
                                            id='irrig'
                                            value={irrigationData.effIrrig}
                                            onChange={e => setIrrigationData({...irrigationData , effIrrig : e.target.value})}
                                        
                                        />
                                             
                                    </FormGroup>
                                </Col>
                            </Row>
                            <Row>
    
                               {IrrigationPropsByType()}

                           
                            {/* <Col lg='3' md="12" sm="12">

                            <FormGroup className='d-flex justify-content-center align-items-center flex-column'>
                                <label htmlFor="Fc"></label>
                                <FormInput
                                    id='Fc'
                                 
                                />
                            </FormGroup>
                            </Col>

                            <Col lg='4' md="12" sm="12">

                            <FormGroup className='d-flex justify-content-center align-items-center flex-column'>
                                <label htmlFor="taw"></label>
                                <FormInput
                                    id='taw'
                                  
                                />
                            </FormGroup>
                            </Col> */}

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
                                onClick={()  => {handleEdit(singleIrrig.id)}}
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
                    <Row>
                    <Col lg="12" md="12" sm="12" >

                        <CardBody>
                            <Row>
                                <Col lg='6' md="12" sm="12">
                                    <FormGroup>
                                        <label htmlFor="irrig">Irrigation Type</label>
                                        <FormSelect
                                            id='irrig'
                                            value={irrigationData.irrigation}
                                            onChange={e => setIrrigationData({...irrigationData , irrigation : e.target.value})}
                                        
                                        >
                                            <option value="">Select type</option>
                                            {
                                                ['Pivot','Drip','Lateral','Furrow','SDI','Sprinkler'].map(irrig=>{
                                                    return(
                                                        <option value={irrig}>{irrig}</option>
                                                    )
                                                })

                                            }
                                        </FormSelect>    
                                    </FormGroup>
                                </Col>
                                <Col lg='6' md="12" sm="12">
                                    <FormGroup>
                                        <label htmlFor="irrig">{t('efficience_irrigation')}</label>
                                        <FormInput
                                            id='irrig'
                                            value={irrigationData.effIrrig}
                                            onChange={e => setIrrigationData({...irrigationData , effIrrig : e.target.value})}
                                        
                                        />
                                             
                                    </FormGroup>
                                </Col>


                            </Row>
                            <Row>
    
                               {IrrigationPropsByType()}


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

export default ConfigurationIrrigation