import React, { useState, useEffect, useRef } from 'react'

     import { Container, Row, Col, Card, Form, ButtonGroup, Button, Modal } from 'react-bootstrap';

import PageTitle from '../components/common/PageTitle'
import api from '../../src/api/api'
import { useTranslation } from 'react-i18next';
import Pagination from '../views/Pagination';

import swal from 'sweetalert';
// import sensorImg from "../images/smartfarm_capteur.png"
// import LoadingSpinner from '../components/common/LoadingSpinner'
import moment from 'moment';
import { LinearProgress } from '@mui/material';
import { useNavigate } from 'react-router';


const SensorsManagement = () => {

    // const history = useHistory()
    const navigate = useNavigate()

    const [toggle, setToggle] = useState(false)

    const [sensorsPerPage, setSensorPerPage] = useState(10)
    const [currentPage, setCurrentPage] = useState(1);
    const [SearchCode, setSearchCode] = useState('')
    const [selectedUser, setSelectedUser] = useState('')
    const [selectedSupplier, setSelectedSupplier] = useState('')
    const [isLoading, setIsLoading] = useState(true)
    const [code, setCode] = useState('')
    const [sensorId, setSensorId] = useState('')

    const [singleSensor, setSingleSensor] = useState('')

    const [userUid, setUserUid] = useState('')
    const [users, setUsers] = useState([])

    const [allSensors, setAllSensors] = useState([])
    const [lastData, setLastData] = useState([])
    const [frequency, setFrequency] = useState([])

    const [existUsers, setExistUsers] = useState([])

    const [existSuppliers, setExistSuppliers] = useState([])
    const [supplierUid, setSupplierUid] = useState('')

    const [supplier, setSupplier] = useState(false)
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(new Date());
        }, 120000);

        return () => {
            clearInterval(interval);
        };
    }, []);



    const { t, i18n } = useTranslation();


    const sendNotificationEmail = async (userEmail, sensorState, sensorInfo) => {
        try {
            await api.post('/admin/send-notification-email', {
                userEmail,
                sensorState,
                sensorInfo,
            });
        } catch (error) {
            console.error('Error sending email notification:', error);
        }
    };


    useEffect(() => {
        if (users.length > 0) {
            const checkSensor = async () => {

                try {
                    const response = await api.get('/admin/check-sensor-status');
                    const inactiveSensors = response.data.inactiveSensors;
                    inactiveSensors.forEach(inactiveSensor => {
                        const sensorCode = inactiveSensor.sensor.code;
                        let ownerName = '';
                        let supplierName = ''; // You need to retrieve the owner name based on user_id
                        const lastDataTime = new Date(inactiveSensor.data.time);

                        // Additional information from the inactiveSensor object if needed
                        const sensorId = inactiveSensor.sensor.id;
                        const supplierId = inactiveSensor.sensor.supplier_id;
                        users.map(user => {
                            if (user.id === inactiveSensor.sensor.user_id) {
                                ownerName = user.name
                            }
                        })
                        existSuppliers.map(user => {
                            if (user.id === inactiveSensor.sensor.supplier_id) {
                                supplierName = user.name
                            }
                        })
                        sendNotificationEmail("contact@smartfarm.com.tn", 'Inactive', {
                            sensorCode,
                            ownerName,
                            lastDataTime,
                            supplierName,
                        });
                    });
                } catch (error) {
                    console.error(error)
                }
            };

            const statusCheckInterval = setInterval(() => {
                checkSensor();
            }, 5 * 60 * 1000); // 5 minutes

            return () => clearInterval(statusCheckInterval);

        }

    }, [users, existSuppliers])



    const getAllSensors = async () => {
        await api.get('/admin/all-sensors')
            .then(response => {
                let dataSensors = [];
                let dataSensorApi = [];
                let frequencyData = [];
                let sensorsData = response.data.sensors;

                sensorsData.map(data => {
                    if (data.data) {
                        dataSensors.push(data.sensor);
                        frequencyData.push(data.config);
                        dataSensorApi.push(data.data);
                    }
                });

                setAllSensors(dataSensors);
                setLastData(dataSensorApi);
                setFrequency(frequencyData);
            })
            .catch(err => {
                console.log(err);
            })
            .finally(() => setIsLoading(false));
    };

    const getExistUsers = async () => {
        await api.get('/admin/users')
            .then(response => {
                var Data = response.data.users
                setExistUsers(Data)
                setSupplier(false)
                setSupplierUid('')
            }).catch(err => {
                console.log(err)
            })
    }

    const getExistSuppliers = async () => {
        await api.get('/admin/exist-suppliers')
            .then(response => {
                var Data = response.data.suppliers
                setExistSuppliers(Data)
                setSupplierUid(Data.uid)
                setSupplier(true)
                setUserUid('')
            }).catch(err => {
                console.log(err)
            })
    }
    const getUsersList = async () => {
        let data = await api.get("/admin/users")
            .then(response => {
                let usersData = response.data.users
                setUsers(usersData)
            })
    }

    useEffect(() => {
        getAllSensors()
        getUsersList()
        getExistUsers()
        getExistSuppliers()
    }, [])
    const filteredSensors = allSensors.filter(sensor => {
        if (SearchCode !== '') {
            return (
                sensor.code.toLowerCase().includes(SearchCode.toLowerCase())
            )
        }
        if (selectedUser !== '') {
            return (
                sensor.user_id == selectedUser
            )
        }
        if (selectedSupplier !== '') {
            return (
                sensor.supplier_id == selectedSupplier
            )
        }
        return sensor
    })


    // Pagination 

    const indexOfLastPost = currentPage * sensorsPerPage;
    const indexOfFirstPost = indexOfLastPost - sensorsPerPage;
    const currentSensors = filteredSensors.slice(indexOfFirstPost, indexOfLastPost);

    const paginate = pageNumber => setCurrentPage(pageNumber);

    const assignSensorToUser = (userUid, supplierUid) => {
        let data = {
            code: code,
            user_uid: userUid,
            supplier_uid: supplierUid
        }
        api.post('/admin/edit-sensor', data)
            .then(response => {
                if (response.data.type === 'success') {
                    swal(`${t('sensor_updated')}`, {
                        icon: "success",
                    });
                    setToggle(false)
                    getAllSensors()
                }
                if (response.data.type === 'danger') {
                    swal({
                        icon: 'error',
                        title: 'Oops...',
                        text: 'Error'
                    })

                }
            }).catch(err => {
                swal({
                    icon: 'error',
                    title: 'Oops...',
                    text: 'Error'
                })
            })
    }

    const getSingleSensor = async (sensorid, type) => {

        await api.get(`/admin/single-sensor/${sensorid}`)
            .then(res => {
                let sensorData = res.data.sensor
                setSingleSensor(sensorData)
                setCode(sensorData.code)
                existUsers.map(user => {
                    if (user.id === sensorData.user_id) {
                        setUserUid(user.uid)
                    }
                })
                existSuppliers.map(supplier => {
                    if (supplier.id === sensorData.supplier_id) {
                        setSupplierUid(supplier.uid)
                    }
                })
            }).catch(error => {
                swal({
                    title: "Error",
                    icon: "error",

                });

            })
        setToggle(!toggle)
        if (type === "User") {
            getExistUsers()
        } if (type === 'Supplier') {
            getExistSuppliers()
        }
    }
    console.log(toggle);
    

    const resetForm = () => {
        setTimeout(() => {
            setUserUid('')
            setSupplierUid('')

        }, 1000)
    }


    const handleCalculSensor = () => {
        api.post('/calcul/add-sensor-calcul')
            .then(response => {
                console.log(response.data.message)
                if (response.data.type === 'success') {
                    swal(`${t('calcul_added')}`, {
                        icon: "success",
                    });
                }
                if (response.data.type === 'danger') {
                    swal({
                        icon: 'error',
                        title: 'Oops...',
                    })

                }
            }).catch(err => {
                swal({
                    icon: 'error',
                    title: 'Oops...',
                })
            })
    }

    const handleDelete = async sensorUid => {
        console.log(sensorUid)

        let data = {
            sensor_uid: sensorUid,
        }
        await api.delete('/sensor/delete-sensor', { data: data })
            .then(response => {
                if (response.data.type && response.data.type == "danger") {
                    swal({
                        title: "Cannot Delete Sensor",
                        icon: "warning",
                    });
                }
                if (response.data.type == "success") {
                    getAllSensors();

                }
            }).catch(error => {
                swal({
                    title: "Cannot Delete Sensor",
                    icon: "Error",
                    text: 'Error'

                });
            })
    }

    const confirmDelete = sensorUid => {

        swal({
            title: "Are you sure?",
            text: "Once deleted, you will not be able to recover this sensor!",
            icon: "warning",
            buttons: true,
            dangerMode: true,
        })
            .then((Delete) => {
                if (Delete) {
                    handleDelete(sensorUid)
                    swal(" Sensor has been deleted!", {
                        icon: "success",
                    });
                }
            }).catch(error => {
                swal({
                    title: "Cannot Delete sensor",
                    icon: "Error",
                    text: 'Error'

                });
            })

    }
    const fetchDataSensor = async (sensorUid, code) => {
        try {
            await api.post('/sensor/activate-synch', { sensor_uid: sensorUid })
                .then(response => {
                    if (response.data.type === "success") {
                        swal(`${t('sensor_updated')}`, {
                            icon: "success",
                        });
                        getAllSensors()
                    }
                    if (response.data.type === "danger") {
                        swal({
                            icon: "error",
                            text: 'Error'
                        });
                    }
                }).catch(err => {
                    swal({
                        icon: "error",
                        text: 'Error'
                    });
                })

        } catch (error) {
            swal({
                icon: "error",
                text: 'Error'
            });
        }


    }

    const handleSensorsPerPageChange = (event) => setSensorPerPage(event.target.value);
    return (
        <>
            <Container>
                <Row noGutters className="page-header py-4">
                    <PageTitle
                        sm="4"
                        title={t('list_sensors')}
                        subtitle={t('list_sensors')}
                        className="text-sm-left"
                    />
                </Row>
                <Row>
                    <PageTitle
                        sm="4"
                        subtitle={t('search_sensors')}
                        className="text-sm-left"
                    />
                </Row>
                <Row form className="d-flex justify-content-center gap-2">
                    
                    <Col lg="2" md="12" sm="12" className="form-group">
                        <Form.Group>
                            <div className="d-flex">
                                <Form.Control
                                    value={SearchCode}
                                    onChange={(e) => setSearchCode(e.target.value)}
                                    id="search"
                                    placeholder="Search By code" style={{height:"41px"}} />

                            </div>
                        </Form.Group>
                    </Col>
                    <Col lg="3" md="12" sm="12" className="form-group">
                        <Form.Group>
                            <div className="d-flex">
                                <Form.Select onChange={(e) => setSelectedUser(e.target.value)} value={selectedUser}>
                                    {
                                        selectedUser === ""
                                            ?
                                            <option value="">Select by user</option>
                                            :
                                            <option value="">{t('see_all')}</option>

                                    }

                                    {


                                        existUsers.sort((a, b) => a.name.localeCompare(b.name)).map(user => {
                                            return <option value={user.id}>{user.name}</option>

                                        })
                                    }
                                </Form.Select>

                            </div>
                        </Form.Group>
                    </Col>
                    <Col lg="3" md="12" sm="12" >
                        <Form.Group >
                            <div className="d-flex ">
                                <Form.Select onChange={(e) => setSelectedSupplier(e.target.value)} value={selectedSupplier}>
                                    {
                                        selectedSupplier === ""
                                            ?
                                            <option value="">Select by supplier</option>
                                            :
                                            <option value="">{t('see_all')}</option>

                                    }
                                    {
                                        existSuppliers.sort((a, b) => a.name.localeCompare(b.name)).map(user => {
                                            return <option value={user.id}>{user.name}</option>

                                        })
                                    }
                                </Form.Select>

                            </div>
                        </Form.Group>
                    </Col>
                  
            
                    <Col lg="3" md="12" sm="12"  >
                        <ButtonGroup className='gap-2'>
                            <Button variant="outline-primary" onClick={() => navigate('/admin/add-sensor')}>Add Sensor</Button>
                            <Button variant="outline-primary" onClick={() => handleCalculSensor()}>Calcul</Button>

                        </ButtonGroup>
                    </Col>

                </Row>
                <Row className="py-2 justify-content-center flex-column align-items-center">
                    <div className="d-flex justify-content-center align-items-start">
                        <label className='px-2' htmlFor="sensorsPerPage">Sensors per page: </label>
                        <select id="sensorsPerPage" value={sensorsPerPage} onChange={handleSensorsPerPageChange}>
                            <option value="10">10</option>
                            <option value="20">20</option>
                        </select>

                    </div>
                    <Pagination usersPerPage={sensorsPerPage} totalUsers={allSensors.length} paginate={paginate} />

                </Row>
                <Card className="my-2" >

                    {
                        isLoading
                            ?
                            <LinearProgress />
                            :
                            <table className="table mb-0 text-center table-hover table-responsive-lg">
                                <thead className="bg-light">
                                    <tr>
                                        <th scope="col" className="border-0">{t('sensor_code')}</th>
                                        <th scope="col" className="border-0">{t('user')}</th>
                                        <th scope="col" className="border-0">{t('supplier')}</th>
                                        <th scope="col" className="border-0">{t('last_reading')}</th>
                                        <th scope="col" className="border-0">{t('expected')}</th>
                                        <th scope="col" className="border-0">{t('statu')}</th>
                                        <th scope="col" className="border-0">{t('actions')}</th>
                                        <th scope="col" className="border-0"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        currentSensors.map((sensor, index) => {
                                            const dataIndex = allSensors.findIndex((s) => s.id === sensor.id);

                                            let nameUser = '-'
                                            let nameSupplier = '-'
                                            let frequencyValue = '-'
                                            let lastDataTime = '-'
                                            let formattedTime = '-'
                                            users.map(user => {
                                                if (user.id === sensor.user_id) {
                                                    nameUser = user.name
                                                }
                                            })
                                            existSuppliers.map(user => {
                                                if (user.id === sensor.supplier_id) {
                                                    nameSupplier = user.name
                                                }
                                            })
                                            if (frequency.length > 0 && lastData.length > 0 && lastData[dataIndex]) {
                                                lastDataTime = moment(lastData[dataIndex].time).add(1, 'hours').format('YYYY-MM-DD HH:mm')
                                                frequencyValue = frequency[dataIndex].frequence
                                            }
                                            const newTime = moment(lastDataTime).add(frequencyValue, 'seconds');
                                            formattedTime = newTime.format('YYYY-MM-DD HH:mm');
                                            const timeStartDifference = moment(lastDataTime, 'YYYY-MM-DD HH:mm').diff(moment(currentTime), 'seconds');
                                            const timeEndDifference = moment(formattedTime, 'YYYY-MM-DD HH:mm').diff(moment(currentTime), 'seconds');
                                            const timeEndAfterRange = timeEndDifference + (15 * 60);
                                            const sensorState = timeStartDifference < 0 && timeEndAfterRange > 0 ? 'Active' : 'Inactive';

                                            return (
                                                <tr key={index}>
                                                    <td style={{ fontSize: 11.5, fontWeight: 'bold' }}>{sensor.code}</td>
                                                    <td style={{ fontSize: 11.5, fontWeight: 'bold' }}>{nameUser}</td>
                                                    <td style={{ fontSize: 11.5, fontWeight: 'bold' }}>{nameSupplier}</td>
                                                    <td style={{ fontSize: 11.5, fontWeight: 'bold' }}>{lastDataTime.toString()}</td>
                                                    <td style={{ fontSize: 11.5, fontWeight: 'bold' }}>{formattedTime.toString()}</td>
                                                    <td style={{ color: sensorState === 'Active' ? 'green' : 'red', fontSize: 13, fontWeight: 'bold' }}>{sensorState}</td>
                                                    <td>
                                                        {
                                                            sensor.deleted_at === null
                                                                ?
                                                                <ButtonGroup size="sm" className="mr-2">
                                                                    <Button title="Edit" style={{background:"#007BFF"}} onClick={() => {
                                                                
                                                                        navigate(`/admin/edit-sensor/${sensor.id}`, {
                                                                            state: {
                                                                              lastDataTime,
                                                                              formattedTime,
                                                                              sensorState,
                                                                            }
                                                                          });
                                                                          
                                                                    }} squared><i className="material-icons">&#xe3c9;</i></Button>
                                                                    <Button title="History" style={{backgroundColor:"#00A2BF"}}  onClick={() => { navigate(`/my-history/${sensor.code}`) }} squared theme="info"><i className="material-icons">&#xe889;</i></Button>
                                                                    <Button title="Delete" variant='danger' onClick={() => { confirmDelete(sensor.uid) }} squared theme="danger"><i className="material-icons">&#xe872;</i></Button>
                                                                    {
                                                                        sensor.synchronized === "0"
                                                                            ?
                                                                            <Button onClick={() => fetchDataSensor(sensor.uid, sensor.code)} squared theme="info"><i className='material-icons'>&#xe627;</i></Button>
                                                                            :
                                                                            null
                                                                    }

                                                                </ButtonGroup>
                                                                :
                                                                null
                                                        }

                                                    </td>
                                                    {
                                                        sensor.deleted_at === null
                                                            ?
                                                            <td>
                                                                <ButtonGroup size="sm" className="mr-2">
                                                                    <Button variant="outline-primary" onClick={() => getSingleSensor(sensor.id, 'User')}>Assign to user</Button>
                                                                    <Button variant="outline-primary" onClick={() => getSingleSensor(sensor.id, 'Supplier')}>Assign to supplier</Button>
                                                                </ButtonGroup>

                                                            </td>

                                                            :
                                                            null
                                                    }
                                                    <td></td>


                                                </tr>

                                            )
                                        })
                                    }

                                </tbody>
                            </table>
                    }


                </Card>
            </Container>
            <Modal centered={true} show={toggle}>
                <Modal.Header className="d-flex justify-content-between align-items-center">
                    <div>
                        Sensor code : {code}
                    </div>
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "flex-end",

                        }}
                    >
                        <Button
                            // theme="success"
                            onClick={() => assignSensorToUser(userUid, supplierUid)}
                            className="mb-2 mr-1 btn btn-success"
                        >
                            <i class={`fa fa-check mx-2`}></i>
                            {t('save')}
                        </Button>
                        <Button
                            // theme="success"
                            className="mb-2 mr-1 btn btn-danger"
                            onClick={() => { resetForm(); setToggle(false) }}
                        >
                            <i class={`fa fa-times mx-2`}></i>
                            {t('cancel')}
                        </Button>
                    </div>
                </Modal.Header>
                <Modal.Body>
                    <Row className='d-flex justify-content-center'>
                        <Col lg='6' md='8' sm='8'>
                            <Form.Group>
                                <label htmlFor="users">Select a user to assign sensor</label>
                                {
                                    supplier === true
                                        ?
                                        <Form.Select
                                            id="users"
                                            value={supplierUid}
                                            onChange={(e) => setSupplierUid(e.target.value)}
                                        >
                                            <option value="">Select Supplier</option>

                                            {
                                                existSuppliers.map(supplier => {
                                                    return <option value={supplier.uid}>{supplier.name}</option>

                                                })
                                            }
                                        </Form.Select>

                                        :
                                        <Form.Select
                                            id="users"
                                            value={userUid}
                                            onChange={(e) => { setUserUid(e.target.value) }}
                                        >
                                            <option value="">Select User</option>

                                            {
                                                existUsers.map(user => {

                                                    return <option value={user.uid}>{user.name}</option>

                                                })
                                            }
                                        </Form.Select>
                                }
                            </Form.Group>
                        </Col>
                    </Row>


                </Modal.Body>
            </Modal>

        </>
    )
}

export default SensorsManagement