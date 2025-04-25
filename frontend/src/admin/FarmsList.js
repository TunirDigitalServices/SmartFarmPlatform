import React, { useEffect, useState } from 'react'
import { Link, useParams , useHistory } from 'react-router-dom'
import api from '../api/api'
import { Container, Card, Row, Col, FormGroup, Form, FormInput, Button, CardBody, CardHeader,Modal,ModalBody,ModalHeader,ButtonGroup,Nav,NavItem,NavLink  } from 'shards-react'
import PageTitle from '../components/common/PageTitle'
import { useTranslation } from "react-i18next";
import swal from 'sweetalert'
import FarmList from '../views/FarmList'
import LeafletMap from '../views/map'


const FarmsList = () => {

  const { t, i18n } = useTranslation();

  const [toggle, setToggle] = useState(false);
  const history = useHistory()

  const params = useParams();
  const [farms, setFarms] = useState([]);
  let Uid = params.uid;
  const [name, setName] = useState('')
  const [name_group, setNameGroup] = useState('')
  const [description, setDesc] = useState('')
  const [coords,setCoords] = useState({
    Latitude : "",
    Longitude : "",
    zoom: "",
    center: [],
    fromAction : false
  })
  const [layerType,setLayerType] = useState('')
  const [layer,setLayer] = useState('')
  const [configMap,setConfigMap] = useState({
    draw : {
      polygon: true,
      circle: false,
      rectangle: false,
      polyline: false,
      marker: true,
      circlemarker: true,
    },
    edit : {
      delete: false,
      edit: false
    }
  })
  const [SingleFarm, setSingleFarm] = useState([])

 

  const getFarmsByUser = async () => {
    await api.get(`/admin/user/${Uid}/farms`)
      .then(res => {
        let FarmsData = res.data.farms;
        setFarms(FarmsData)
      }).catch(error => {
        console.log(error)

      })
  }

  useEffect(() => {
    getFarmsByUser()
  }, [])

  const getSingleFarm = async (farmUid) => {
    let data = {
        farm_uid: farmUid,
        user_uid : Uid
    }

    await api.post('/admin/single-farm', data)
        .then(res => {
            let FarmData = res.data.farm
            setSingleFarm(FarmData)
            setName(FarmData[0].name)
            setDesc(FarmData[0].description)
            setNameGroup(FarmData[0].name_group)
        }).catch(error => {
            console.log(error)

        })
    setToggle(!toggle)
}

const goField = () => {
  history.push(`/admin/user/${Uid}/fields`);
  window.location.reload();
}

const goProfile = () => {
  history.push(`/admin/user/${Uid}`);
  window.location.reload();
}
const goSensor = () => {
  history.push(`/admin/user/${Uid}/sensors`);
  window.location.reload();
}
const _onCreated = e => {
  let type = e.layerType;
  console.log(type)
  setLayerType(type)
  let layer = e.layer;
  if (type === "polygon") {
    let coords = layer._latlngs[0];
    const Coordinates = coords.map((coord) => ({
      Lat: coord.lat,
      Long: coord.lng,
    }));
    if (Coordinates)
      setLayer(JSON.stringify(Coordinates))
  } else {
    setCoords({ Latitude: layer.getLatLng().lat , Longitude: layer.getLatLng().lng  });
  }

};



  const addFarm = async () => {

    let data = {
      name: name,
      name_group: name_group,
      description: description,
      user_uid: Uid,
      Coordinates : layer,
      Latitude : coords.Latitude,
      Longitude : coords.Longitude
    }
    await api.post('/admin/add-farm', data)
      .then(response => {
        if (response.data.type === "success") {
          swal('Farm Added', { icon: "success" });
          getFarmsByUser()
          setName('')
          setDesc('')
          setNameGroup('')
        }
      }).catch(err => {
        swal(err, { icon: "error" })
      })
  }

  const handleEdit = (farmUid) => {

    let data = {
        name: name,
        name_group: name_group,
        description: description,
        user_uid : Uid,
        farm_uid: farmUid
    }

   
        api.post('/admin/edit-farm', data)
            .then(response => {
                if (response.data.type == "success") {
                    swal(" Farm has been updated", {
                        icon: "success",
                    });
                    setToggle(false)
                    getFarmsByUser();
                }
                if (response.data.type && response.data.type == "danger") {
                    swal({
                        icon: 'error',
                        title: 'Oops...',
                        text: 'error_edit_farm'
                    })
                    return false;
                }
            }).catch(error => {
                swal({
                    icon: 'error',
                    title: 'Oops...',
                    text: 'error_edit_farm'
                })
            })

}



  const handleDelete = async farmUid => {

    
    let data = {
        farm_uid: farmUid,
    }
    await api.delete('/admin/delete-farm', { data: data })
        .then(response => {
            if (response.data.type && response.data.type == "danger") {
                swal({
                    title: "Cannot Delete Farm",
                    icon: "warning",
                });
            }
            if (response.data.type == "success") {
                getFarmsByUser();
               
            }
        }).catch(error => {
            swal({
                title: "Cannot Delete Farm",
                icon: "error",
                text: 'error_delete_farm'
                
            });
        })
    }

const confirmDelete = farmUid => {

    swal({
        title: "Are you sure?",
        text: "Once deleted, you will not be able to recover this farm!",
        icon: "warning",
        buttons: true,
        dangerMode: true,
    })
        .then((Delete) => {
            if (Delete) {
                handleDelete(farmUid)
                swal(" farm has been deleted!", {
                    icon: "success",
                });
            }
        }).catch(error => {
            swal({
                title: "Cannot Delete Farm",
                icon: "error",
                text: 'error_delete_farm'

            });
        })

}



  return (
    <>
      <Container className="py-4">
        <Nav justified pills className="bg-white">
              <NavItem>
                <NavLink>
                  <Link onClick={goProfile}>{t('profile')}</Link> 
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink active>
                  {t('farms')}
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink>
                  <Link onClick={goField}>{t('fields')}</Link>
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink>
                  <Link onClick={goSensor}>{t('sensors')}</Link>
                </NavLink>
              </NavItem>
        </Nav>
        <Row noGutters className="page-header py-4">
          <PageTitle subtitle={t('farms')} md="12" className="ml-sm-auto mr-sm-auto" />
        </Row>
        <Row>
            {/* <div className={`mb-0 alert alert-${classMsg} fade ${displayMsg}`}>
                 <i class={`fa fa-${iconMsg} mx-2`}></i> {t(msgServer)}
            </div> */}
            <table className="bg-light table mx-2 mb-0 text-center table-bordered table-responsive-lg">
                <thead className="bg-light">
                    <tr>
                        <th scope="col" className="border-0">{t('name_farm')}</th>
                        <th scope="col" className="border-0">{t('desc')}</th>
                        <th scope="col" className="border-0">{t('Fields')}</th>
                        <th scope="col" className="border-0"></th>
                    </tr>
                </thead>
                <tbody>
                    {
                        farms.map((item, indx) => {
                            return (

                                <tr>
                                    <td>{item.name}</td>
                                    <td>{item.description}</td>
                                    <td>
                                    {item.fields != null ? Object.keys(item.fields).length : 0}
                                        </td>
                                    <td>
                                        <ButtonGroup size="sm" className="mr-2">
                                            <Button onClick={() => getSingleFarm(item.uid)} squared><i className="material-icons">&#xe3c9;</i></Button>
                                            <Button onClick={() => confirmDelete(item.uid)} squared theme="danger"><i className="material-icons">&#xe872;</i></Button>
                                        </ButtonGroup>
                                    </td>
                                </tr>
                            )
                        })
                    }
                </tbody>
            </table>
            {
                SingleFarm.map(i => (
                    <Modal centered size='lg' open={toggle} >
                        <ModalHeader>
                            <titleClass className="m-0">{t('edit_farm')}</titleClass>
                            {""}
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "flex-end"

                                }}
                            >
                                <Button
                                    // theme="success"
                                    className="mb-2 mr-1 float-right btn btn-success"
                                    onClick={() => handleEdit(i.uid)}
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
                                    <Col md="6" className="form-group">
                                        <p style={{ margin: "0px" }}>{t('name_farm')}</p>
                                        <FormInput
                                            key={i.id}
                                            defaultValue={name}
                                            onChange={e => setName(e.target.value)}
                                            // className={`${nameError ? 'is-invalid' : ""}`}
                                        />

                                        <div className="invalid-feedback">{t('no_empty')}</div>

                                    </Col>
                                    <Col md="6" className="form-group">
                                        <p style={{ margin: "0px" }}>{t('group_name')}</p>
                                        <FormInput
                                            key={i.id}
                                            defaultValue={name_group}
                                            onChange={e => setNameGroup(e.target.value)}
                                        />
                                    </Col>
                                </Row>
                            </Form>

                        </ModalBody>
                    </Modal>
                ))
            }

        </Row>
        <Row noGutters className="page-header py-4">
          <PageTitle subtitle={t('add_farm')} md="12" className="ml-sm-auto mr-sm-auto" />
        </Row>
        <Card small className="h-100">
          <CardHeader className="border-bottom">
            <div
              style={{
                display: "flex",
                justifyContent: "flex-start",
                width: "auto",
                float: "left"
              }}
            >
              <h6 className="m-0">{t('farm_setup')}</h6>{" "}
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",

              }}
            >
              <Button
                // theme="success"
                disabled={layer ==  "" ? true  : false }
                className="mb-2 mr-1 btn btn-success"
                onClick={addFarm}
              >
                <i class={`fa fa-check mx-2`}></i>
                {t('save')}
              </Button>
              <Button
                // theme="success"
                className="mb-2 mr-1 btn btn-danger"
              >
                <i class={`fa fa-times mx-2`}></i>
                {t('cancel')}
              </Button>
            </div>
          </CardHeader>
          <CardBody className="pt-0">
            <div
              style={{
                display: "flex",
                marginTop: "20px",
                flexWrap: "wrap"
              }}
            >
              <Col lg="4" sm="12" md="6">
                <Form>
                  <Row form>
                    <Col md="6" className="form-group">
                      <p style={{ margin: "0px" }}> {t('name_farm')}</p>
                      <FormInput
                        placeholder={t('name_farm')}
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}

                      />
                    </Col>
                    <Col md="6" className="form-group">
                      <p style={{ margin: "0px" }}>{t('group_name')}</p>
                      <FormInput
                        placeholder={t('group_name')}
                        value={name_group}
                        onChange={(e) => setNameGroup(e.target.value)}

                      />
                    </Col>
                  </Row>
                </Form>
              </Col>

              <Col lg="8" md="12" sm="12" className="mb-4">
                <h7>{t('farm_map')}</h7>
                <LeafletMap _onCreated={_onCreated} uid={Uid} draw={configMap.draw} edit={configMap.edit} zoom={coords.zoom} center={coords.center} data={farms} fromAction={coords.fromAction}   />

              </Col>
            </div>
          </CardBody>
        </Card>
      </Container>
    </>
  )
}

export default FarmsList