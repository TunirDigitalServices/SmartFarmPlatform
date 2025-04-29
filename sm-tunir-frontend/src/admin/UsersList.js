import React, { useEffect, useState } from 'react'

import { Container, Row, Col, Form, Button, ButtonGroup, Card, Nav, NavItem } from 'react-bootstrap';

import PageTitle from '../components/common/PageTitle';
import { useTranslation } from 'react-i18next';
import api from '../api/api';
import swal from 'sweetalert';
import Pagination from '../views/Pagination';
import { Link, NavLink } from 'react-router-dom';
import { IconButton } from '@mui/material';
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { useNavigate } from 'react-router';
import { all } from 'axios';


const UsersList = () => {


    const [usersPerPage] = useState(8)
    const [currentPage, setCurrentPage] = useState(1);



    const { t, i18n } = useTranslation();

    const [msgServer, setMsg] = useState("");

    const [classMsg, setCmsg] = useState("");
    const [displayMsg, setDispMsg] = useState("hide");
    const [iconMsg, setIconMsg] = useState("info");

    const [toggle, setToggle] = useState(false);

    const [singleUser, setSingleUser] = useState([]);

    const [filteredResult, setFilteredResult] = useState([])

    const [SearchEmail, setSearchEmail] = useState('');
    const [SearchName, setSearchName] = useState('');
    const [SearchRole, setSearchRole] = useState('');

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [city, setCity] = useState('');
    const [nameErr, setNameErr] = useState('');
    const [existSuppliers, setExistSuppliers] = useState([])


    let role = JSON.parse(localStorage.getItem('user')).role

    // Get USERS LIST

    const [users, setUsers] = useState([])

    useEffect(() => {
        const getExistSuppliers = async () => {
            await api.get('/admin/exist-suppliers')
                .then(response => {
                    var Data = response.data.suppliers
                    setExistSuppliers(Data)
                }).catch(err => {
                    console.log(err)
                })
        }
        getExistSuppliers()
        getUsersList()
    }, [])


    // TO DO Fix search when input empty

    useEffect(() => {
        setUsers(filteredResult)
    }, [filteredResult])

    const getUsersList = async () => {
        let data = await api.get("/admin/users")
            .then(response => {
                let usersData = response.data.users
                setUsers(usersData)
            })
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
                    getUsersList()
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

    // Edit  Users Handle / TO DO : FIX Uid to edit selected user 


    const getSingleUser = async (userUid) => {

        let data = {
            user_uid: userUid,
        }

        await api.post('/admin/single-user', data)
            .then(res => {
                let UserData = res.data.user
                setSingleUser(UserData);
                setName(UserData.name);
                setEmail(UserData.email);
                setCity(UserData.city);
            }).catch(error => {
                console.log(error)

            })
        setToggle(!toggle)

    }

    const validate = () => {
        let nameErr = '';

        if (!name) {
            nameErr = 'Cannot be blank!';
            setNameErr(nameErr)
            return false;
        } else {
            setNameErr("")
            return true;
        }

    };

    const handleEdit = (userUid) => {

        let data = {
            name: name,
            email: email,
            user_uid: userUid
        }

        let isValid = validate()

        if (isValid) {

            api.post('/admin/edit-user', data)
                .then(response => {
                    if (response.data.type == "success") {
                        swal(" user has been updated", {
                            icon: "success",
                        });
                        getUsersList();
                        setToggle(false)
                    }
                    if (response.data.type && response.data.type == "danger") {
                        swal({
                            icon: 'error',
                            title: 'Oops...',
                            text: 'Error'
                        })
                        return false;
                    }
                }).catch(error => {
                    swal({
                        icon: 'error',
                        title: 'Oops...',
                        text: 'error_edit_user'
                    })
                })
        }

    }




    // Active/Desactive Users Accounts

    const desactivateUser = (userUid) => {
        let data = {
            user_uid: userUid
        }
        api.post('/admin/desactivate-user', data)
            .then(response => {
                if (response.data.type == "success") {
                    swal("user has been desactivated", {
                        icon: "success",
                    });
                    getUsersList();
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
        api.post('/admin/activate-user', data)
            .then(response => {
                if (response.data.type == "success") {
                    swal("user has been activated", {
                        icon: "success",
                    });
                    getUsersList();
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

    const confirmUser = (userUid) => {
        let data = {
            user_uid: userUid
        }
        api.post('/admin/confirm-user', data)
            .then(response => {
                if (response.data.type == "success") {
                    swal("user has been activated", {
                        icon: "success",
                    });
                    getUsersList();
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
        if (SearchName !== '') {
            return (
                user.name.toLowerCase().includes(SearchName.toLowerCase())
            )
        }
        if (SearchEmail !== '') {
            return (
                user.email.toLowerCase().includes(SearchEmail.toLowerCase())
            )
        }
        if (SearchRole !== '') {
            return (
                user.role.toLowerCase().includes(SearchRole.toLowerCase())
            )
        }
        return user
    })


    // const history = useHistory()
    const navigate = useNavigate()
    const selectUser = (userUid) => {
        navigate(`/admin/user/${userUid}`)
    }

    // Pagination 

    const indexOfLastPost = currentPage * usersPerPage;
    const indexOfFirstPost = indexOfLastPost - usersPerPage;
    const currentUsers = filteredUsers.sort((a, b) => a.name.localeCompare(b.name)).slice(indexOfFirstPost, indexOfLastPost);

    const paginate = pageNumber => setCurrentPage(pageNumber);

    const [moreOptionsMenuAnchor, setMoreOptionsMenuAnchor] =
        React.useState(null);

    const deleteClassClicked = async () => {
        setMoreOptionsMenuAnchor(null);
    };

    const displayBasedOnRole = (role) => {
        switch (role) {
            case 'ROLE_USER':
                return 'User'
                break;
            case 'ROLE_ADMIN':
                return 'Admin'
                break;
            case 'ROLE_SUPPLIER':
                return 'Supplier'
                break;
            default:
                return 'User'
        }
    }

    return (
        <>
            <div className='px-4 container'>
                <Row noGutters className="page-header py-4">
                    <PageTitle
                        sm="4"
                        title={t('list_users')}
                        subtitle={t('list_users')}
                        className="text-sm-left"
                    />
                </Row>
                <Row className="d-flex justify-content-center">
                    {/* <Nav justified pills className="bg-white w-25">
                        <NavItem>
                            <NavLink active>
                                {t('list_users')}
                            </NavLink>
                        </NavItem>
                        <NavItem>
                            <NavLink>
                                <Link to={`/admin/all-suppliers`}>{t('all_suppliers')}</Link>
                            </NavLink>
                        </NavItem>
                    </Nav> */}
                    <Nav variant="pills" defaultActiveKey="/admin/users" className=" w-25" >
                        <Nav.Item>
                            <Nav.Link href="/admin/users" as={Link} active>{t('list_users')}</Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link > <Link style={{ all: 'unset' }}  to={`/admin/all-suppliers`}>{t('all_suppliers')}</Link></Nav.Link>
                        </Nav.Item>

                    </Nav>

                </Row>
                <Row className='py-3'>

                    <PageTitle
                        sm="6"
                        subtitle={t('search_users')}
                        className="text-sm-left "
                    />
                </Row>

                <Row form className="d-flex justify-content-center gap-3 d-flex flex-wrap">
                    <Col md="3" className="form-group ">
                        <Form.Group>
                            <div className="d-flex">
                                <Form.Control
                                    value={SearchName}
                                    onChange={(e) => setSearchName(e.target.value)}
                                    id="search"
                                    placeholder="Search By name" />

                            </div>
                        </Form.Group>
                    </Col>
                    <Col md="3" className="form-group">
                        <Form.Group>
                            <div className="d-flex">
                                <Form.Control
                                    value={SearchRole}
                                    onChange={(e) => setSearchRole(e.target.value)}
                                    id="search"
                                    placeholder="Search By role" />

                            </div>
                        </Form.Group>
                    </Col>
                    <Col md="3" className="form-group">
                        <Form.Group>
                            <div className="d-flex">
                                <Form.Control
                                    value={SearchEmail}
                                    onChange={(e) => setSearchEmail(e.target.value)}
                                    id="search"
                                    placeholder="Search By email" />
                            </div>
                        </Form.Group>
                    </Col>
                </Row>
                <Row className='py-3'>
                    <PageTitle
                        sm="4"
                        subtitle={t('my_actions')}
                        className="text-sm-left"
                    />
                </Row>
                <Row form className="d-flex justify-content-center gap-4">
                    <div className="d-flex gap-4 justify-content-center" >
                        <Button onClick={() => navigate('/admin/add-user')} >Add User</Button>
                        <Button outline onClick={() => navigate('/Supplier')} style={{ textTransform: 'none', fontSize: '1rem' }}>Add Company</Button>
                        <Button outline onClick={() => navigate('/admin/sensors')} style={{ textTransform: 'none', fontSize: '1rem' }}>Assign Sensor</Button>
                    </div>
                </Row>

                <div className={`mb-0 alert alert-${classMsg} fade ${displayMsg}`}>
                    <i class={`fa fa-${iconMsg} mx-2`}></i> {t(msgServer)}
                </div>
                <Card>
                <div style={{ overflowX: 'auto', maxHeight: '400px', overflowY: 'auto' }}>
                    <table className="table mb-0 text-center table-hover table-responsive-lg">
                        <thead className="bg-light">
                            <tr>
                                <th scope="col" className="border-0">{t('name')}</th>
                                <th scope="col" className="border-0">{t('email')}</th>
                                <th scope="col" className="border-0">{t('num')}</th>
                                <th scope="col" className="border-0">{t('role')}</th>
                                <th scope="col" className="border-0">{t('supplier')}</th>
                                <th scope="col" className="border-0">{t('Created at')}</th>


                            </tr>
                        </thead>
                        
                        <tbody>
                            {
                                currentUsers.map(user => {
                                    let supplierName = '-'
                                    existSuppliers.map(data => {
                                        if (data.id === user.supplier_id) {
                                            supplierName = data.name
                                        }
                                    })
                                    return (
                                        <tr key={user.id}>
                                            <td style={{ fontSize: 11.5, fontWeight: 'bold' }}>{user.name}</td>
                                            <td style={{ fontSize: 11.5, fontWeight: 'bold' }}>{user.email}</td>
                                            <td style={{ fontSize: 11.5, fontWeight: 'bold' }}>{user.phone_number}</td>
                                            <td style={{ fontSize: 11.5, fontWeight: 'bold' }}>{displayBasedOnRole(user.role)}</td>
                                            <td style={{ fontSize: 11.5, fontWeight: 'bold' }}>{supplierName}</td>
                                            <td style={{ fontSize: 11.5, fontWeight: 'bold' }}>{new Date(user.created_at).toLocaleString().slice(0, 10)}</td>
                                            <td>
                                                {/* <IconButton
                                                aria-label="more options"
                                                onClick={(e) => setMoreOptionsMenuAnchor(e.currentTarget)}

                                            >
                                                <MoreVertIcon />
                                            </IconButton> */}
                                                {
                                                    user.deleted_at == null
                                                        ?

                                                        <ButtonGroup size="sm" className="mr-2">
                                                            <Button title="Edit" onClick={() => selectUser(user.uid)} squared><i className="material-icons">&#xe3c9;</i></Button>
                                                            {
                                                                user.is_active == 1
                                                                    ?
                                                                    <Button title="Desactivate" onClick={() => desactivateUser(user.uid)} variant="secondary">
                                                                        <i className="material-icons">&#xe510;</i>
                                                                    </Button>

                                                                    :
                                                                    <Button title="Activate" onClick={() => activateUser(user.uid)} variant="success" >
                                                                        <i className="material-icons">&#xe7fd;</i>
                                                                    </Button>
                                                            }
                                                            {
                                                                user.is_valid == 1
                                                                    ?
                                                                    null
                                                                    :
                                                                    <Button title="Confirm" onClick={() => confirmUser(user.uid)} squared variant="success"><i className="material-icons">&#xe5ca;</i></Button>
                                                            }

                                                            <Button title="Delete" onClick={() => confirmDelete(user.uid)} squared variant="danger"><i className="material-icons">&#xe872;</i></Button>
                                                        </ButtonGroup>
                                                        :
                                                        null
                                                }
                                            </td>
                                        </tr>

                                    )
                                })
                            }

                        </tbody>
                    </table>
                    </div>
                </Card>
                <Row className="py-4 d-flex w-100 justify-content-center">
                    <Pagination usersPerPage={usersPerPage} totalUsers={users.length} paginate={paginate} />

                </Row>
            </div>
        </>
    )
}

export default UsersList