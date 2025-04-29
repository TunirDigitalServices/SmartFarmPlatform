import React ,{useEffect, useState } from 'react'
import { Container, Row, Col, Card, FormGroup, FormInput, ButtonGroup, Button, Modal, ModalHeader, ModalBody, FormSelect } from 'shards-react'
import PageTitle from '../components/common/PageTitle'
import api from '../../src/api/api'
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import swal from 'sweetalert';

const CommandeManagement = () => {
    
    const { t, i18n } = useTranslation();
    const [toggle,setToggle] = useState(false)
    const history = useHistory()

    const [userUid,setUserUid] = useState('')

    const [SingleEquipment, setSingleEquipment] = useState([]);
    const [equipments,setEquipments] = useState([])
    const [code,setCode] = useState('')
    const [SearchCode, setSearchCode] = useState('')

    const [existUsers,setExistUsers] = useState([])
    const [users,setUsers] = useState([])

    const getAllEquipments = async () => {
        await api.get('/admin/all-equipments')
            .then(response => {
                let equipmentsData = response.data.equipments
                setEquipments(equipmentsData)
            }).catch(err => {
                console.log(err)
            })
    }

    useEffect(()=>{
        getUsersList()
        getAllEquipments()
    },[])

    const getUsersList = async () => {
        let data = await api.get("/admin/users")
            .then(response => {
                let usersData = response.data.users
                setUsers(usersData)
            })
    }
    const getExistUsers = async () => {
        await api.get('/admin/exist-users')
            .then(response => {
                var Data = response.data.users
                setExistUsers(Data)
            }).catch(err => {
                console.log(err)
            })
    }
    const getSingleEquipment = async (equipmentUid,type) => {

        let data = {
            equipment_uid: equipmentUid,
        }

        await api.post('/equipment/single-equipment', data)
            .then(response => {
                let equips = response.data.equipments;
                if (response.data.type === "success") {
                    setSingleEquipment(equips)
                    setCode(equips.code)
                    existUsers.map(user=>{
                        if(user.id === equips.user_id){
                            setUserUid(user.uid)
                        }
                    })
                }
            }).catch(err => {
                console.log(err)
            })

        setToggle(!toggle)
            if(type === 'USER'){
                getExistUsers()
            }
    }

    const assignEquipmentToUser = (userUid) =>{
        let data ={
            code : code,
            user_uid : userUid,
        }
        api.post('/admin/assign-equipment',data)
        .then(response =>{
            if(response.data.type === 'success'){
                swal(`${t('Equipment_updated')}`, {
                    icon: "success",
                });
                setToggle(false)
                resetForm()
                getAllEquipments()
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
        setCode('');
        setUserUid('')
    }

    const filteredEquips = equipments.filter(equip => {
        if (SearchCode !== '') {
            return (
                equip.code.toLowerCase().includes(SearchCode.toLowerCase())
            )
        }
        return equip
    })
  return (
    <>
    <Container>
    <Row noGutters className="page-header py-4">
        <PageTitle
        title={t('commande_manag')}
            sm="4"
            className="text-sm-left"
        />
    </Row>
    <Row>
        <PageTitle
            sm="4"
            subtitle={t('search_commande')}
            className="text-sm-left"
        />
    </Row>
    <Row form className="d-flex justify-content-center">
        <Col md="3" className="form-group">
            <FormGroup>
                <div className="d-flex">
                    <FormInput
                        value={SearchCode}
                        onChange={(e) => {setSearchCode(e.target.value)}}
                        id="search"
                        placeholder="Search By code " />

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
            <Button outline onClick={() => history.push('/admin/add-equipment')}>Add Commands </Button>
        </ButtonGroup>

    </Row>
    <Card>
    <table className="table mb-0 text-center">
                        <thead className="bg-light">
                            <tr>
                                <th scope="col" className="border-0">{t('code')}</th>
                                <th scope="col" className="border-0">{t('item')}</th>
                                <th scope="col" className="border-0">{t('user')}</th>
                                <th scope="col" className="border-0"></th>
                                <th scope="col" className="border-0"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                filteredEquips.map(item => {
                                    let nameUser = ''
                                    users.map(user=>{
                                        if(user.id=== item.user_id){
                                            nameUser = user.name
                                        }
                                    })
                                    return (
                                        <tr>
                                            <td>{item.code}</td>
                                            <td>{item.id}</td>
                                            <td>{nameUser}</td>
                                            <td>
                                                {
                                                    item.deleted_at === null
                                                        ?
                                                        <ButtonGroup size="sm" className="mr-2">
                                                            <Button title="Edit" onClick={() => { }} squared><i className="material-icons">&#xe3c9;</i></Button>
                                                            <Button title="Delete" onClick={() => { }} squared theme="danger"><i className="material-icons">&#xe872;</i></Button>
                                                        </ButtonGroup>
                                                        :
                                                        null
                                                }

                                            </td>
                                            {
                                                item.deleted_at === null
                                                    ?
                                                    <td>
                                                        <ButtonGroup size="sm" className="mr-2">
                                                            <Button  outline onClick={() => {getSingleEquipment(item.uid,'USER')}}>Assign to user</Button>
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

    </Card>

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
                                    onClick={()  => assignEquipmentToUser(userUid)}
                                    className="mb-2 mr-1 btn btn-success"
                                >
                                    <i class={`fa fa-check mx-2`}></i>
                                    {t('save')}
                                </Button>
                                <Button
                                    // theme="success"
                                    className="mb-2 mr-1 btn btn-danger"
                                    onClick={() => { resetForm() ; setToggle(false)} }
                                >
                                    <i class={`fa fa-times mx-2`}></i>
                                    {t('cancel')}
                                </Button>
                            </div>
                        </ModalHeader>
                        <ModalBody>
                            <Row className='d-flex justify-content-center'>
                                <Col lg='6' md='8' sm='8'>
                                    <FormGroup>    
                                    <FormSelect
                                            id="users"
                                            value={userUid}
                                            onChange={(e) => {setUserUid(e.target.value)} }
                                        >
                                            <option value="">Select User</option>
        
                                            {
                                                existUsers.map(user =>{
                                                    return <option value={user.uid}>{user.name}</option>
        
                                                })
                                            }
                                        </FormSelect>
                                        
                                    </FormGroup>
                                </Col>
                            </Row>
        
        
                        </ModalBody>
                    </Modal>
</>
  )
}

export default CommandeManagement