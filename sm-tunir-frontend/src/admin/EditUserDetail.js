import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Container, Card, CardHeader, ListGroup, ListGroupItem, Row, Col, Form, FormGroup, FormInput, FormSelect, FormTextarea, ButtonGroup, Button, Progress, Modal, ModalHeader, ModalBody, BreadcrumbItem, Breadcrumb,Nav,NavItem,NavLink } from "shards-react";
import { useTranslation } from "react-i18next";
import PageTitle from "../components/common/PageTitle";
import Permission from '../components/layout/Permission';
import api from '../api/api';
import swal from 'sweetalert';
import countryState from '../data/gistfile.json';
const img = require("../images/avatars/default-avatar.png")

const EditUserDetail = () => {

  const { t, i18n } = useTranslation();
  const params = useParams()
  const [toggle, setToggle] = useState(false);

  let Uid = params.uid

  const [user, setUser] = useState([]);
  const [subscription, setSubscription] = useState([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('');
  const [Zip, setZip] = useState('');
  const [currentRole, setCurrentRole] = useState('');
  const [newRole, setNewRole] = useState('');
  const [country, setCountry] = useState('');
  const [address, setAddress] = useState('');
  const [allCountry, setAllCountry] = useState([])
  const [allStates, setAllStates] = useState([])
  const [supplierUid, setSupplierUid] = useState("");
  const [suppliers,setSuppliers] = useState([]);

  const [offer, setOffer] = useState('');
  const [newOffer, setNewOffer] = useState('');
  const [newOption,setNewOption] = useState('')
  const [option,setOption] = useState('')

  const [avatar, setAvatar] = useState('');



  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [description, setDesc] = useState('');

  let role = JSON.parse(localStorage.getItem('user')).role


  let listcountry = []
  let liststateSelectedCountry = []
  const getSingleUser = async (userUid) => {

    countryState.countries.map((item, indx) => {
      listcountry.push(item.country)
    })
    setAllCountry(listcountry)

    let data = {
      user_uid: userUid,
    }

    await api.post('/admin/single-user', data)
      .then(res => {
        let UserData = res.data.user
        setUser(UserData);
        setName(UserData.name);
        setEmail(UserData.email);
        setCity(UserData.city);
        setCountry(UserData.country);
        setAddress(UserData.address);
        setCurrentRole(UserData.role)
        setAvatar(UserData.upload_file_name);
        setOffer(UserData.offer_type);
        setOption(UserData.has_command)
        setSupplierUid(UserData.supplier_id)
        countryState.countries.map((item, indx) => {
          if (item.country == UserData.country) {
            countryState.countries[indx].states.map((state, i) => {
              liststateSelectedCountry.push(state)
            })
          }
        })
        setAllStates(liststateSelectedCountry)
      }).catch(error => {
        console.log(error)

      })
  }

  const handleCountry = async (country) => {
    setCountry(country);

    allCountry.map((item, indx) => {
      if (item == country) {
        countryState.countries[indx].states.map((state, i) => {
          liststateSelectedCountry.push(state)
        })
      }
    })
    setAllStates(liststateSelectedCountry)
  }

  const getSubscriptions = async () => {

    await api.get(`/admin/subscription/${Uid}`)
      .then(res => {
        let SubscriptionData = res.data.subscriptions;
        setSubscription(SubscriptionData)
      }).catch(error => {
        console.log(error)

      })
  }

  useEffect(() => {
    getSingleUser(Uid);
    getSubscriptions()
    getSuppliers()

    //To Do sensors
  }, [])

  const getSuppliers = async () => {
    await api.get('/admin/suppliers')
    .then(response =>{
        let suppliersList = response.data.suppliers
        setSuppliers(suppliersList)
    }).catch(err=>{
        console.log(err)
    })
}

  // Activate Subcriptions

  const activateSub = (subscriptionUid) => {
    let data = {
      subscription_uid: subscriptionUid
    }
    api.post('/admin/activate-subscription', data)
      .then(response => {
        if (response.data.type == "success") {
          swal(`${t('subs_activate')}`, {
            icon: "success",
          });
          getSubscriptions();
          // setActive(false)
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
          text: 'error'
        })
      })
  }


  // Desactivate Subscriptions

  const desactivateSub = (subscriptionUid) => {
    let data = {
      subscription_uid: subscriptionUid
    }
    api.post('/admin/desactivate-subscription', data)
      .then(response => {
        if (response.data.type == "success") {
          swal(`${t('subs_desactivate')}`, {
            icon: "success",
          });
          getSubscriptions()
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
          text: 'Error'
        })
      })
  }

  // Delete Subscriptions

  const handleDelete = async subscriptionUid => {

    let data = {
      subscription_uid: subscriptionUid,
    }
    await api.delete('/admin/delete-subscription', { data: data })
      .then(response => {
        if (response.data.type && response.data.type == "danger") {
          swal({
            title: `${t('cannot_delete')}`,
            icon: "warning",
          });
        }
        if (response.data.type == "success") {
          getSubscriptions()
        }
      }).catch(error => {
        swal({
          title: `${t('cannot_delete')}`,
          icon: "error",
          text: 'Error'

        });
      })
  }

  const confirmDelete = subscriptionUid => {

    swal({
      title: `${t('are_you_sure')}`,
      text: `${t('confirm_delete')}`,
      icon: "warning",
      buttons: true,
      dangerMode: true,
    })
      .then((Delete) => {
        if (Delete) {
          handleDelete(subscriptionUid)
          swal(`${t('delete_success_subs')}`, {
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

  // Add Subscriptions

  const addSubscription = async () => {
    let data = {
      start: startDate,
      end: endDate,
      description: description,
      user_uid: Uid
    }
    await api.post('/admin/add-subscription', data)
      .then(response => {
        if (response.data.type == "success") {
          swal(`${t('subs_added')}`, {
            icon: "success",
          });
          getSubscriptions()
        }
        if (response.data.type && response.data.type == "danger") {
          swal({
            icon: 'info',
            title: 'Oops...',
            text: 'Error'
          })
          return false;
        }
      }).catch(error => {
        swal({
          title: "Error",
          icon: "error",
          text: `${t('subs_exist')}`
        });

      })
    setToggle(false)
  }

  const changeRole = async (role, userUid) => {
    let data = {
      role: role,
      user_uid: userUid
    }
    await api.post('/admin/change-role', data)
      .then(response => {
        if (response.data.type == "success") {
          swal(`${t('role_changed_success')}`, { icon: "success" });
          setCurrentRole(newRole)
        }
        if (response.data.type == "danger") {
          swal(`${t('role_changed_err')}`, { icon: "error" });

        }
      }).catch(error => {
        swal({
          title: "Error",
          icon: "error",
        });
      })
  }


  const changeOffer = async (offer, userUid) => {
    let data = {
      offer_type: offer,
      user_uid: userUid
    }
    await api.post('/admin/change-offer', data)
      .then(response => {
        if (response.data.type == "success") {
          swal(`${t('offer_changed_success')}`, { icon: "success" });
          setOffer(newOffer)
        }
        if (response.data.type == "danger") {
          swal(`${t('offer_changed_err')}`, { icon: "error" });

        }
      }).catch(error => {
        swal({
          title: "Error",
          icon: "error",
        });
      })
  }
  const changeOptions = async () => {
    let data = {
      command: newOption,
      user_uid: Uid
    }
    await api.post('/admin/change-has-command', data)
      .then(response => {
        if (response.data.type == "success") {
          swal(`${t('command_changed_success')}`, { icon: "success" });
          setOption(newOption)
        }
        if (response.data.type == "danger") {
          swal(`${t('Error')}`, { icon: "error" });

        }
      }).catch(error => {
        swal({
          title: "Error",
          icon: "error",
        });
      })
  }


  const offerType = () => {
    switch (offer) {
      case "1":
        return `${t('gratuit')}`
      case "2":
        return `${t('payante')}`
      default:
        break;
    }
  }

  const optionType = () => {
    switch (option) {
      case "0":
        return `${t('without_irrigation_controller')}`
      case "1":
        return `${t('with_irrigation_controller')}`
      default:
        break;
    }
  }

  const roleType = () => {
    switch (currentRole) {
      case "ROLE_ADMIN":
        return "Admin"
      case "ROLE_USER":
        return "User"
        case "ROLE_SUPPLIER":
        return "SUPPLIER"
      default:
        break;
    }
  }

  const handlSaveProfil = () => {

    let dataPost = {
      user_uid: Uid,
      name: name,
      email: email,
      address: address,
      city: city,
      country: country,
      zip_code: Zip,
      description: description,
      role: currentRole,
      supplier_uid : supplierUid
    }
    api.post('/admin/edit-profil', dataPost)
      .then(res => {
        if (res.data.type && res.data.type == "danger") {
          swal(`${t('profil_changed_err')}`, { icon: "error" });
        }
        if (res.data.type && res.data.type == "success") {
          swal(`${t('profil_changed_success')}`, { icon: "success" });
          getSingleUser(Uid)
        }
      }).catch(() => {
        swal("Error", { icon: "error" });
      })
  }


  return (
    <>
      {
        role === 'ROLE_USER'
          ?
          (
            <Permission />
          )
          :

          <Container fluid className="main-content-container px-4">
            {
              role === 'ROLE_SUPPLIER'
              ?
              <Link to='/supplier/users'> Go back</Link>
              :
              <Link to='/admin/users'> Go back</Link>

            }
            <Nav justified pills className="bg-white">
              <NavItem>
                <NavLink active>
                  {t('profile')}  
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink>
                  <Link to={`/admin/user/${Uid}/farms`}>{t('farms')}</Link>
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink>
                  <Link to={`/admin/user/${Uid}/fields`}>{t('fields')}</Link>
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink>
                  <Link to={`/admin/user/${Uid}/sensors`}>{t('sensors')}</Link>
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink>
                  <Link to={`/admin/user/${Uid}/recommendations`}>{t('recommendations')}</Link>
                </NavLink>
              </NavItem>
            </Nav>
            <Row noGutters className="page-header py-4">
              <PageTitle title={`${name} ${t('profile')} `} subtitle="Overview" md="12" className="ml-sm-auto mr-sm-auto" />
            </Row>
            <Row>
              <Col lg="4" >
                <Card className="mb-4 pt-3">
                  <CardHeader className="text-center">
                    <div className="mb-3 mx-auto" style={{ height: "110px" }}>
                      <img
                        className="rounded-circle h-100"
                        width="110"
                        src={avatar == null ? img : `${process.env.REACT_APP_BASE_URL}/static/${avatar}`}
                        alt={name}
                      />
                    </div>
                    <h4 className="mb-0"></h4>

                    <Button pill outline size="sm" className="mb-2" >
                      {t('avatar')}
                    </Button>
                    <Button pill outline size="sm" className="mb-2 success" >{t('upload')}</Button>

                    <input

                      multiple={false}
                      type="file"
                      hidden
                    />
                    <ListGroup flush>
                      <ListGroupItem className="px-4">
                        <div className="progress-wrapper">
                          <strong className="text-muted d-block mb-2">
                            {t('workload')}
                          </strong>
                          <Progress
                            className="progress-sm"
                            value="100"
                          >
                            <span className="progress-value">
                              100%
                            </span>
                          </Progress>
                        </div>
                      </ListGroupItem>
                      {/* <ListGroupItem className="p-4">
                      <strong className="text-muted d-block mb-2">
                        Description
                      </strong>
                      <span></span>
                    </ListGroupItem> */}
                    </ListGroup>
                  </CardHeader>
                  {
                   role === "ROLE_SUPPLIER"
                   ?
                   null
                   :                    
                  <Col lg='12'>
                    <Card small className="mb-4 pt-2">
                      <CardHeader className="border-bottom text-center">
                        <h4 className="mb-4 py-4 ">{t('current_role')} : {roleType()}</h4>
                        <h6>{t('change_role')}</h6>
                        <FormSelect
                          className=" "
                          onChange={(e) => setNewRole(e.target.value)}
                        >
                          <option>Select Role</option>
                          <option value="ROLE_ADMIN">Admin</option>
                          <option value="ROLE_USER">User</option>
                        </FormSelect>
                        <Button onClick={() => changeRole(newRole, Uid)} title="Change role" outline size="sm" className="mt-2 success"  >Change Role</Button>
                      </CardHeader>
                    </Card>
                  </Col>
                  }
                </Card>
              </Col>
              <Col lg="8">
                <Card small className="mb-4">
                  <CardHeader className="border-bottom">
                    <h6 className="m-0"></h6>
                  </CardHeader>
                  <ListGroup flush>
                    <ListGroupItem className="p-3">
                      <Row>
                        <Col>
                          <Form>
                            <Row form>
                              {/* First Name */}
                              <Col md="6" className="form-group">
                                <label htmlFor="feFirstName">{t('name')} *</label>
                                <FormInput
                                  id="feFirstName"
                                  placeholder={t('name')}
                                  value={name}
                                  onChange={(e) => setName(e.target.value)}
                                  style={{border :'1px solid #0BAECB'}}

                                />
                              </Col>
                              {/* Email */}
                              <Col md="6" className="form-group">
                                <label htmlFor="feEmail">{t('email')} *</label>
                                <FormInput
                                  type="email"
                                  id="feEmail"
                                  placeholder={t('email')}
                                  autoComplete="email"
                                  value={email}
                                  onChange={(e) => setEmail(e.target.value)}
                                  style={{border :'1px solid #0BAECB'}}

                                />
                              </Col>
                            </Row>
                            <FormGroup>
                              <label htmlFor="feAddress">{t('address')}</label>
                              <FormInput
                                id="feAddress"
                                placeholder={t('address')}
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                              />
                            </FormGroup>
                            <Row form>
                              {/* State */}
                              <Col md="4" className="form-group">
                                <label htmlFor="feInputState">{t('state')}</label>
                                <FormSelect
                                  placeholder={t('state')}
                                  value={country}
                                  // onChange={(e) => setCountry(e.target.value)}
                                  onChange={(e) => handleCountry(e.target.value)}
                                >
                                  {
                                    allCountry.map((country, i) => {

                                      return (
                                        <option>{country}</option>
                                      )
                                    })

                                  }
                                </FormSelect>
                              </Col>
                              {/* City */}
                              <Col md="6" className="form-group">
                                <label htmlFor="feCity">{t('city')}</label>
                                <FormSelect
                                  placeholder={t('city')}
                                  value={city}
                                  onChange={(e) => setCity(e.target.value)}
                                >
                                  {
                                    allStates.map((state, i) => {

                                      return (
                                        <option>{state}</option>
                                      )
                                    })
                                  }
                                </FormSelect>
                              </Col>
                              {/* Zip Code */}
                              <Col md="2" className="form-group">
                                <label htmlFor="feZipCode">{t('zip')}</label>
                                <FormInput
                                  value={Zip}
                                  onChange={(e) => setZip(e.target.value)}
                                  id="feZipCode"
                                  placeholder={t('zip')}
                                />
                              </Col>
                            </Row>
                            <Row form>
                              {/* Description */}
                              <Col md="6" className="form-group">
                                <label htmlFor="feDescription">{t('desc')}</label>
                                <FormTextarea id="feDescription" rows="5" />
                              </Col>
                              {
                                role === "ROLE_ADMIN"
                                ?
                                <Col md="6">
                                
                                <div className='border p-4 '>
                                  <div className='m-2'>
                                      <i className='material-icons'>&#xe88e;</i>
                                      You can assign this user to a Supplier Account 
                                  </div>
                                  <FormSelect
                                      value={supplierUid}
                                      onChange={(e) => setSupplierUid(e.target.value)}
                                  >
                                      <option value="">Select Supplier</option>
                                      {
                                          suppliers.map(supplier => (
                                              <option key={supplier.uid} value={supplier.id}>
                                                  {supplier.name}
                                              </option>
                                          ))
                                      }
                                  </FormSelect>
                                </div>

                              </Col>
                                :
                                  null
                              }
                            </Row>
                            <Button onClick={handlSaveProfil} theme="accent" >{t('update_btn')}</Button>
                          </Form>
                        </Col>
                      </Row>
                      <hr />
                    </ListGroupItem>
                  </ListGroup>
                </Card>
              </Col>
            </Row>
            <Row>

              <Col lg="4">
                <Card small className="mb-4 pt-3">
                  <CardHeader className="py-4 text-center">
                    <h4 className="mb-4 py-4 border-bottom">{t('current_offer_type')} : {offerType()}</h4>
                    <h6>{t('change_offer')}</h6>
                    <FormSelect
                      className="mt-4 "
                      onChange={(e) => setNewOffer(e.target.value)}
                    >
                      <option>Select Offer</option>
                      <option value="1">{t('gratuit')}</option>
                      <option value="2">{t('payante')}</option>
                    </FormSelect>
                    <Button onClick={() => changeOffer(newOffer, Uid)} title="Change offer" outline size="sm" className="mt-2 success"  >Change Offer</Button>
                  </CardHeader>
                </Card>
              </Col><Col lg="4">
                <Card small className="mb-4 pt-3">
                  <CardHeader className="py-4 text-center">
                    <h4 className="mb-4 py-4 border-bottom">{optionType()}</h4>
                    <h6>{t('change_options')}</h6>
                    <FormSelect
                      className="mt-4 "
                      value={newOption}
                      onChange={(e) => setNewOption(e.target.value)}
                    >
                      <option>Select Option</option>
                      <option value="1">{t('with_irrigation_controller')}</option>
                      <option value="0">{t('without_irrigation_controller')}</option>
                    </FormSelect>
                    <Button onClick={() => changeOptions()} title="Change offer" outline size="sm" className="mt-2  success"  >Change Option</Button>
                  </CardHeader>
                </Card>
              </Col>
              <Col lg="4">
                <Card small className="mb-4 pt-3">
                  <CardHeader className="py-4 text-center">
                    <h4 className="mb-4 py-4 border-bottom">{t('subs')}</h4>
                    {
                      offer == "2"
                        ?
                        <Button onClick={() => setToggle(!toggle)}>{t('add_subs')}</Button>
                        :
                        null
                    }
                  </CardHeader>
                  <table className="table mb-0 text-center">
                    <thead className="bg-light">
                      <tr>
                        <th scope="col" className="border-0">{t('start_date')}</th>
                        <th scope="col" className="border-0">{t('end_date')}</th>
                        <th scope="col" className="border-0"></th>

                      </tr>
                    </thead>
                    <tbody>
                      {
                        subscription.map(sub => {
                          let startDate = sub.start.replace('Z', ' ').replace('T', ' ');
                          let endDate = sub.end.replace('Z', ' ').replace('T', ' ');
                          let status = "";
                          if (sub.is_active == 1) {
                            status = "Active"
                          } else {
                            status = "Inactive"
                          }

                          return (
                            <tr>
                              <td>{status}</td>
                              <td>{startDate}</td>
                              <td>{endDate}</td>
                              <td>{sub.description}</td>
                              <td>
                                {
                                  sub.deleted_at == null
                                    ?
                                    <ButtonGroup size="sm" className="mr-2">
                                      {
                                        sub.is_active == 1
                                          ?
                                          <Button title="Desactivate" onClick={() => desactivateSub(sub.uid)} theme="secondary">
                                            <i className="material-icons">&#xe510;</i>
                                          </Button>

                                          :
                                          <Button title="Activate" onClick={() => activateSub(sub.uid)} theme="success">
                                            <i className="material-icons">&#xe7fd;</i>
                                          </Button>
                                      }
                                      <Button title="Delete" onClick={() => confirmDelete(sub.uid)} squared theme="danger"><i className="material-icons">&#xe872;</i></Button>
                                    </ButtonGroup>
                                    :
                                    <span style={{ color: "tomato" }}>Deleted Subscription</span>
                                }
                              </td>
                            </tr>

                          )
                        })
                      }

                    </tbody>
                  </table>
                </Card>
              </Col>
              <Modal open={toggle} centered={true}>
                <ModalHeader closeAriaLabel>
                  <h6 className="m-0">{t('add_sub')}</h6>{" "}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "flex-end",

                    }}
                  >
                    <Button
                      // theme="success"
                      className="mb-2 mr-1 btn btn-success"
                      onClick={() => addSubscription()}
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
                  <Form>
                    <Row form>
                      <Col md="12" className="form-group">
                        <p style={{ margin: "0px" }}>{t('start_date')}</p>
                        <FormInput
                          type="datetime-local"
                          placeholder="Start Date"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                        />
                      </Col>
                      <Col md="12" className="form-group">
                        <p style={{ margin: "0px" }}>{t('end_date')}</p>
                        <FormInput
                          type="datetime-local"
                          placeholder="End Date"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}

                        />

                      </Col>
                      <Col md="12" className="form-group">
                        <FormGroup>
                          <p style={{ margin: "0px" }}>{t('desc')}</p>
                          <textarea
                            value={description}
                            onChange={(e) => setDesc(e.target.value)}
                            style={{ height: "175px" }}
                            class="form-control"
                          ></textarea>
                        </FormGroup>
                      </Col>
                    </Row>

                  </Form>
                </ModalBody>
              </Modal>
            </Row>

          </Container>
      }
    </>
  )
}

export default EditUserDetail