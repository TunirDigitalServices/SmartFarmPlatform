import React ,{useState , useEffect}from 'react'
import { Container, Row, Col, FormGroup, FormInput,FormSelect, Button, ButtonGroup, Card,Modal,ModalHeader,ModalBody } from 'shards-react'
import PageTitle from '../components/common/PageTitle'
import { useHistory } from 'react-router-dom'
import { useTranslation } from 'react-i18next';
import api from '../api/api'
import swal from 'sweetalert';

const UsersManagement = () => {

    const history = useHistory()

    const[toggle,setToggle] = useState(false)
    const [code ,setCode] = useState('')

    const [userUid,setUserUid] = useState('')
    const [userId,setUserId] = useState('')

    const [sensorUid,setSensorUid] = useState('')

    const [users,setUsers] = useState([])
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [city, setCity] = useState('');
    const [nameErr, setNameErr] = useState('');
    const [classMsg, setCmsg] = useState("");
    const [displayMsg, setDispMsg] = useState("hide");
    const [iconMsg, setIconMsg] = useState("info");
    const [msgServer, setMsg] = useState("");
    let role = JSON.parse(localStorage.getItem('user')).role

    const [SearchEmail, setSearchEmail] = useState('');
    const [SearchName, setSearchName] = useState('');
    const [SearchRole, setSearchRole] = useState('');

    const [filteredResult, setFilteredResult] = useState([])
    const { t, i18n } = useTranslation();


    const getMyUsers = async () => {
        await api.get('/supplier/get-users')
        .then(response =>{
            let usersList = response.data.users
            setUsers(usersList)
        }).catch(err =>{
            console.log(err)
        })
    }
    console.log(users)
    const [mySensors, setMySensors] = useState([])


    const getMySensors = async () => {
        await api.get('/supplier/get-sensors')
            .then(response => {
                let sensorsData = response.data.sensors
                setMySensors(sensorsData)
            }).catch(err => {
                console.log(err)
            })
    }

    useEffect(()=>{
        getMySensors()
        getMyUsers()

    },[])
    // Active/Desactive Users Accounts

    const desactivateUser = (userUid) => {
        let data = {
            user_uid: userUid
        }
        api.post('/supplier/desactivate-user', data)
            .then(response => {
                if (response.data.type == "success") {
                    swal("user has been desactivated", {
                        icon: "success",
                    });
                    getMyUsers();
                    // setActive(false)
                }
                if (response.data.type && response.data.type == "danger") {
                    swal({
                        icon: 'error',
                        title: 'Oops...',
                        text: 'error_desactivate_user'
                    })
                    return false;
                }
            }).catch(error => {
                swal({
                    icon: 'error',
                    title: 'Oops...',
                    text: 'error_desactivate_user'
                })
            })
    }

    const activateUser = (userUid) => {
        let data = {
            user_uid: userUid
        }
        api.post('/supplier/activate-user', data)
            .then(response => {
                if (response.data.type == "success") {
                    swal("user has been activated", {
                        icon: "success",
                    });
                    getMyUsers();
                    // setActive(false)
                }
                if (response.data.type && response.data.type == "danger") {
                    swal({
                        icon: 'error',
                        title: 'Oops...',
                        text: 'error_activate_user'
                    })
                    return false;
                }
            }).catch(error => {
                swal({
                    icon: 'error',
                    title: 'Oops...',
                    text: 'error_activate_user'
                })
            })
    }



    const filteredUsers = users.filter(user => {
        if(SearchName !== ''){
            return (
              user.name.toLowerCase().includes(SearchName.toLowerCase())  
            )
        }    
        if(SearchEmail !== ''){
            return (
                user.email.toLowerCase().includes(SearchEmail.toLowerCase())  
              )
        }
        return user
    })
  

    const selectUser = (userUid) => {
        history.push(`/admin/user/${userUid}`)
    }

        // Delete Users Handle

        const handleDelete = async userUid => {

            let data = {
                user_uid: userUid,
            }
            await api.delete('/admin/delete-user', { data: data })
                .then(response => {
                    if (response.data.type && response.data.type == "danger") {
                        swal({
                            title: `${t('cannot_delete')}`,
                            icon: "warning",
                        });
                    }
                    if (response.data.type == "success") {
                        getMyUsers()
                        setMsg(`${t('delete_success_user')}`)
                        setCmsg("success")
                        setDispMsg("show")
                        setIconMsg("check")
                        hideMsg()
                    }
                }).catch(error => {
                    swal({
                        title: `${t('cannot_delete')}`,
                        icon: "error",
                        text: 'Error'
    
                    });
                })
        }
        const hideMsg = () => {
            setTimeout(() => {
                setDispMsg("hide")
            }, 3000);
    
        }
    
        const confirmDelete = userUid => {
    
            swal({
                title: `${t('are_you_sure')}`,
                text: `${t('confirm_delete')}`,
                icon: "warning",
                buttons: true,
                dangerMode: true,
            })
                .then((Delete) => {
                    if (Delete) {
                        handleDelete(userUid)
                        swal(`${t('delete_success_user')}`, {
                            icon: "success",
                        });
                    }
                }).catch(error => {
                    swal({
                        title: `${t('cannot_delete')}`,
                        icon: "error",
                        text: 'Error'
    
                    });
                })
    
        }
        const assignSensorToUser = (userUid,sensorUid) =>{
            let data ={
                user_uid : userUid,
                sensor_uid : sensorUid
            }
            api.post('/supplier/assign-sensor',data)
            .then(response =>{
                if(response.data.type === 'success'){
                    swal(`${t('user_updated')}`, {
                        icon: "success",
                    });
                    setToggle(false)
                    resetForm()
                    getMyUsers()
                }
                if(response.data.type === 'danger'){
                    swal({
                        icon: 'error',
                        title: 'Oops...',
                        text: 'Error'
                    })
                    resetForm()

                }
            }).catch(err=>{
                swal({
                    icon: 'error',
                    title: 'Oops...',
                    text: 'Error'
                })
            })
        }

        const resetForm = () => {
            setTimeout(()=>{
                setUserUid('')
                setSensorUid('')

            },1000)
        }
        const editSensorIdUser = (sensorSelectedUid) => {
            let userid = null;

            mySensors.map(item =>{         
                if(item.uid === sensorSelectedUid){
                    userid = item.user_id;
                }
            })

            let hasNotSensor = users.length;
            
            users.map(user =>{
                if(user.id === userid){
                    setUserUid(user.uid)
                    hasNotSensor = hasNotSensor - 1 ;
                }
            })
            if(hasNotSensor == users.length){
                setUserUid("")
            }
            
        }



  return (
    <>
    <Container>
        <Row noGutters className="page-header py-4">
            <PageTitle
                sm="4"
                title='list_users'
                subtitle='list_users'
                className="text-sm-left"
            />
        </Row>
        <Row>

            <PageTitle
                sm="4"
                subtitle='search_users'
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

                    </div>
                </FormGroup>
            </Col>
        </Row>
        <Row>
            <PageTitle
                sm="4"
                subtitle='my_actions'
                className="text-sm-left"
            />
        </Row>
        <Row form className="d-flex justify-content-center py-2">
            <ButtonGroup>
                <Button outline onClick={() => history.push('/supplier/add-user')}>Add User</Button>
                <Button outline onClick={() => setToggle(true)}>Asign Sensor</Button>
            </ButtonGroup>

        </Row>
        <Card>
            <table className="table mb-0 text-center">
                <thead className="bg-light">
                    <tr>
                        <th scope="col" className="border-0">{t('name')}</th>
                        <th scope="col" className="border-0">{t('email')}</th>
                        <th scope="col" className="border-0">{t('num')}</th>
                        <th scope="col" className="border-0">{t('offer_type')}</th>
                        <th scope="col" className="border-0"></th>


                    </tr>
                </thead>
                <tbody>
                    {
                        filteredUsers.map(user => {
                           let offerType = ""
                            if(user.offer_type === "2"){
                                offerType = "Premium"
                            }if(user.offer_type === "1"){
                                offerType ="Freemim"
                            } 

                           return (
                                <tr>
                                    <td>{user.name}</td>
                                    <td>{user.email}</td>
                                    <td>{user.phone_number ? user.phone_number : "-"}</td>
                                    <td>{offerType}</td>
                                    { <td style={{ color: "tomato" }}>{user.deleted_at != null ? "Deleted User" : ""}</td> }
                                    { <td>
                                        {
                                            user.deleted_at == null && user.is_valid == 1
                                                ?

                                                <ButtonGroup size="sm" className="mr-2">
                                                    <Button title="Edit" onClick={() => selectUser(user.uid)} squared><i className="material-icons">&#xe3c9;</i></Button>
                                                    {
                                                        user.is_active == 1
                                                            ?
                                                            <Button title="Desactivate" onClick={() => desactivateUser(user.uid)} theme="secondary">
                                                                <i className="material-icons">&#xe510;</i>
                                                            </Button>

                                                            :
                                                            <Button title="Activate" onClick={() => activateUser(user.uid)} theme="success">
                                                                <i className="material-icons">&#xe7fd;</i>
                                                            </Button>
                                                    }
                                                    <Button title="Delete" onClick={() => confirmDelete(user.uid)} squared theme="danger"><i className="material-icons">&#xe872;</i></Button>
                                                </ButtonGroup>
                                                :
                                                user.deleted_at != null
                                                ?
                                                <b>deleted</b>
                                                :
                                                <b>not_active</b>
                                        }
                                    </td> }
                                </tr>

                            )
                        })
                    }

                </tbody>
            </table>

        </Card>
        <Row className="py-4 justify-content-center">
            {/* <Pagination usersPerPage={usersPerPage} totalUsers={users.length} paginate={paginate} /> */}

        </Row>
    </Container>
    <Modal centered={true} open={toggle}>
                <ModalHeader className="d-flex justify-content-between align-items-center">
                    <div>
                    Assign sensor to user
                    </div>
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "flex-end",

                        }}
                    >
                        <Button
                            // theme="success"
                            className="mb-2 mr-1 btn btn-success"
                            onClick={() => assignSensorToUser(userUid,sensorUid)}
                        >
                            <i class={`fa fa-check mx-2`}></i>
                            {t('save')}
                        </Button>
                        <Button
                            // theme="success"
                            className="mb-2 mr-1 btn btn-danger"
                            onClick={() => {resetForm();setToggle(false)} }
                        >
                            <i class={`fa fa-times mx-2`}></i>
                            {t('cancel')}
                        </Button>
                    </div>
                </ModalHeader>
                <ModalBody>
                <Row className='d-flex justify-content-center border-bottom'>
                    <Col lg='6' md='8' sm='8'>
                    
                    <label htmlFor="sensors">Select a sensor</label>

                    <FormGroup>
                            <FormSelect
                            id="sensors"
                            value={sensorUid}
                            onChange={(e) => {setSensorUid(e.target.value);editSensorIdUser(e.target.value)}}
                        >
                            <option value="" selected>Select Sensor</option>

                                {
                                mySensors.map(sensor =>{   
                                    
                                    return <option value={sensor.uid} >{ sensor.code }</option>
                                })
                            }
                        </FormSelect>
                    </FormGroup>
                    </Col>
                </Row>
                {
                    sensorUid !== ''
                    ?
                    <Row className='d-flex justify-content-center  pt-2'>
                            <Col lg='6' md='8' sm='8' className="">
                            <FormGroup>
                            <label htmlFor="users">Select a user to assign sensor</label>

                                    <FormSelect
                                    id="users"
                                    value={userUid}
                                    onChange={(e) => {setUserUid(e.target.value);}}
                                >
                                    <option value="">Select User</option>
                                    
                                    {
                                        users.map(user =>{
                                            if(user.is_valid == 1 && user.is_active == 1){
                                                return <option iduser={user.id} value={user.uid}>{user.name}</option>
                                            }
                                            
                                        })
                                    }
                                </FormSelect>

                            </FormGroup>
                        </Col>
                    </Row>
                    :
                    null

                }
                </ModalBody>
            </Modal>

</>
  )
}

export default UsersManagement