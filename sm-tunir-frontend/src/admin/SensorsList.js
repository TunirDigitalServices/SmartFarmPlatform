import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import api from '../api/api'
import { Container, Card, Row, Col, Form, FormControl, FormSelect, Modal, Button, ButtonGroup, Nav, NavItem, NavLink } from 'react-bootstrap'
import PageTitle from '../components/common/PageTitle'
import { useTranslation } from "react-i18next";
import swal from 'sweetalert'
import Html5QrcodePlugin from "../views/Html5QrcodePlugin";
import SensorList from '../views/SensorList'
import LeafletMap from '../views/map'

const SensorsList = () => {

  const { t, i18n } = useTranslation();

  const [SingleSensor, setSingleSensor] = useState([])
  const [toggle, setToggle] = useState(false);
  const [clicked, setClicked] = useState(false)
  // const history = useHistory()
  const params = useParams();
  const [sensors, setSensors] = useState([]);
  const [resultScan, setResultScan] = useState('');
  const [description, setDesc] = useState('');
  const [fieldUid, setFieldUid] = useState('');
  const [coords, setCoords] = useState({
    Latitude: "",
    Longitude: "",
    zoom: "",
    center: [],
    fromAction: false
  })
  const [configMap, setConfigMap] = useState({
    draw: {
      polygon: false,
      circle: false,
      rectangle: false,
      polyline: false,
      marker: true,
      circlemarker: false,
    },
    edit: {
      delete: false,
      edit: false
    }
  })
  let Uid = params.uid;

  useEffect(() => {
    getSensorsByUser()
  }, [])

  const getSensorsByUser = async () => {
    await api.get(`/admin/user/${Uid}/sensors`)
      .then(res => {
        let SensorsData = res.data.sensors;
        setSensors(SensorsData)
      }).catch(error => {
        console.log(error)

      })
  }
  const [fields, setFields] = useState([]);
  const [farms, setFarms] = useState([])

  const getFieldsByUser = async () => {
    await api.get(`/admin/user/${Uid}/fields`)
      .then(response => {
        if (response.data.type === "success") {
          let FarmsData = response.data.farms
          setFarms(FarmsData);
        }

      }).catch(error => {
        console.log(error)
      })
  }

  const getFields = () => {
    let Fields = [];
    farms.map(item => {
      let fields = item.fields;
      if (fields) {
        fields.map(field => {
          Fields.push({
            title: field.name,
            status: field.status,
            description: field.description,
            Uid: field.uid,
            farm_id: field.farm_id,
            Id: field.id
          })
        })
      }
    })
    setFields(Fields)
  }
  useEffect(() => {
    getFieldsByUser();
  }, [])

  useEffect(() => {
    getFields()
  }, [farms])

  const onNewScanResult = (decodedText, decodedResult) => {
    setResultScan(decodedText)

    // Handle the result here.
  }


  const getSingleSensor = (sensorUid) => {

    let data = {
      sensor_uid: sensorUid,
    }

    api.post('/sensor', data)
      .then(res => {
        let SensorData = res.data.sensor
        setSingleSensor(SensorData)
        setResultScan(SensorData[0].code)
      }).catch(error => {
        console.log(error)
        swal({
          title: "Error",
          icon: "error",

        });

      })
    setToggle(!toggle)

  }


  const handleDelete = async sensorUid => {
    let data = {
      sensor_uid: sensorUid,
    }
    await api.delete('/sensor/delete-sensor', { data: data })
      .then(response => {
        if (response.data.type && response.data.type == "danger") {
          swal({
            title: `${t('cannot_delete')}`,
            icon: "warning",
          });
        }
        if (response.data.type == "success") {
          getSensorsByUser()

        }
      }).catch(error => {
        swal({
          title: `${t('cannot_delete')}`,
          icon: "error",
          text: 'Error'

        });
      })
  }



  const confirmDelete = sensorUid => {

    swal({
      title: `${t('are_you_sure')}`,
      text: `${t('confirm_delete')}`,
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
          title: "Cannot Delete Sensor",
          icon: "error",
          text: 'error_delete_sensor'

        });
      })

  }

  const addSensor = async () => {

    let data = {
      code: resultScan,
      user_uid: Uid,
      field_uid: fieldUid,
      Latitude: coords.Latitude,
      Longitude: coords.Longitude
    }
    await api.post('/supplier/add-sensor', data)
      .then(response => {
        if (response.data.type === "success") {
          swal('Sensor Added', { icon: "success" });
          getSensorsByUser()
          setResultScan('')
          setDesc('')
          setClicked(false)
        }
      }).catch(err => {
        swal(err, { icon: "error" })
      })
  }


  const handleEdit = (sensorUid) => {

    let data = {
      code: resultScan,
      description: description,
      user_uid: Uid,
      sensor_uid: sensorUid
    }



    api.post('/admin/edit-sensor', data)
      .then(response => {
        if (response.data.type == "success") {
          swal(" Sensor has been updated", {
            icon: "success",
          });
          setToggle(false)
          getSensorsByUser();
        }
        if (response.data.type && response.data.type == "danger") {
          swal({
            icon: 'error',
            title: 'Oops...',
            text: 'error_edit_sensor'
          })
          return false;
        }
      }).catch(error => {
        swal({
          icon: 'error',
          title: 'Oops...',
          text: 'error_edit_sensor'
        })
      })


  }


  const _onCreated = e => {
    let type = e.layerType;
    let layer = e.layer;
    if (type === "marker") {
      layer.bindPopup('sensorCode');
    } else {
      console.log("_onCreated: something else created:", type, e);
    }

    setCoords({ Latitude: layer.getLatLng().lat, Longitude: layer.getLatLng().lng });

  };
  //   const goProfile = () => {
  //     history.push(`/admin/user/${Uid}`);
  //     window.location.reload();
  // }
  // const goFarms = () => {
  //     history.push(`/admin/user/${Uid}/farms`);
  //     window.location.reload();
  // }
  // const goField = () => {
  //   history.push(`/admin/user/${Uid}/fields`);
  //   window.location.reload();
  // }

  const displayForm = (code) => {
    if (code !== '') {
      setClicked(!clicked)
      setResultScan(code)

    }
  }

  return (
    <>
      <Container className="py-4">
        <Nav justified variant="pills" className="bg-white justify-content-between rounded mx-2 ">

          <Nav.Item>
            <Nav.Link as={Link} className='m-0 bg-white' to={`/admin/user/${Uid}`}>
              {t('profile')}
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link className='m-0 bg-white ' as={Link} to={`/admin/user/${Uid}/farms`}>
              {t('farms')}
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link  className='m-0 bg-white ' as={Link} to={`/admin/user/${Uid}/fields`}>
              {t('fields')}
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link className='m-0 w-100 text-light bg-primary' active>
              {t('sensors')}
            </Nav.Link>
          </Nav.Item>
        </Nav>
        <Container>
          <Row noGutters className="page-header py-4">
            <PageTitle subtitle={t('add_sensor')} md="12" className="ml-sm-auto mr-sm-auto" />
          </Row>
          <Card small className="h-100">
            <Card.Header className="border-bottom">
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-start",
                  width: "auto",
                  float: "left"
                }}
              >
                <h6 className="m-0">{t('sensor_setup')}</h6>{" "}
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap:"10px"

                }}
              >
                <Button
                  // theme="success"
                  disabled={coords.Latitude == "" ? true : false}
                  className="mb-2 mr-1 btn btn-success text-light"
                  onClick={addSensor}
                >
                  <i class={`fa fa-check mx-2`}></i>
                  {t('save')}
                </Button>
                <Button
                  // theme="success"
                  className="mb-2 mr-1 btn btn-danger"
                // onClick={() => setClicked(false)}

                >
                  <i class={`fa fa-times mx-2`}></i>
                  {t('cancel')}
                </Button>
              </div>
            </Card.Header>
            <Card.Body className="pt-0">
              <div
                style={{
                  display: "flex",
                  marginTop: "20px",
                  flexWrap: "wrap",
                  gap:"10px"
                }}
              >
                <Col lg="6" sm="12" md="12">
                  <Form>
                    <Row form>
                      <Col md="12" className="form-group">
                        <p style={{ margin: "0px" }}>{t('sensor_code')}</p>
                        <FormSelect
                          value={resultScan}
                          onChange={(e) => setResultScan(e.target.value)}
                          required

                        >
                          <option>Select sensor </option>

                          {
                            sensors.map((item, indx) => {
                              return (

                                <option>{item.code} </option>
                              )
                            })
                          }

                        </FormSelect>

                      </Col>
                      <Col md="12" className="form-group">
                        <p style={{ margin: "0px" }}>{t('name_field')}</p>
                        <FormSelect
                          placeholder={t('name_field')}
                          required
                          value={fieldUid}
                          onChange={(e) => setFieldUid(e.target.value)}
                        >
                          <option value="">Select Field</option>
                          {
                            fields.map((item, indx) => {
                              return <option value={item.Uid}>{item.title}</option>
                            })
                          }
                        </FormSelect>
                      </Col>
                      {/* <Col md="6" className="form-group">
                            <p style={{ margin: "0px" }}>{t('name_zone')}</p>
                            <FormSelect
                              placeholder={t('zone_name')}

                            >
                              <option value="">{t('select_zone')}</option>
                            </FormSelect>
                          </Col> */}
                    </Row>
                  </Form>
                  {/* <div>
                        <h3>{t('scan_qrcode_sensor')}</h3>
                        <Html5QrcodePlugin
                          fps={10}
                          qrbox={250}
                          disableFlip={true}
                          rememberLastUsedCamera={false}
                          qrCodeSuccessCallback={onNewScanResult}

                        />
                      </div> */}
                </Col>
                <Col lg="5" md="12" sm="12" className="mb-4">
                  <div style={{ textAlign: "center", margin: "5px" }}>
                    <i className='material-icons mx-2'>&#xe88e;</i>
                    You need to add sensor position on the map

                  </div>
                  <LeafletMap _onCreated={_onCreated} draw={configMap.draw} edit={configMap.edit} zoom={coords.zoom} center={coords.center} fromAction={coords.fromAction} />

                </Col>
              </div>
            </Card.Body>
          </Card>
        </Container>
        <Row noGutters className="page-header py-4">
          <PageTitle subtitle={t('sensors')} md="12" className="ml-sm-auto mr-sm-auto" />
        </Row>
        <Card>
          <>
            {/* <div className={`mb-0 alert alert-${classMsg} fade ${displayMsg}`}>
                 <i class={`fa fa-${iconMsg} mx-2`}></i> {t(msgServer)}
            </div> */}
            <table className="table mb-0 text-center">
              <thead className="bg-light">
                <tr>
                  <th scope="col" className="border-0">{t('sensor_code')}</th>
                  <th scope="col" className="border-0">{t('list_fields')}</th>
                  <th scope="col" className="border-0">{t('Actions')}</th>

                  {/* <th scope="col" className="border-0"></th> */}

                </tr>
              </thead>
              <tbody>
                {
                  sensors.map((item, indx) => {
                    let fieldName = '-'
                    fields.map(field => {
                      if (field.Id === item.field_id) {
                        fieldName = field.title
                      }
                    })
                    return (

                      <tr key={item.id}>
                        <td>{item.code}</td>
                        <td>{fieldName}</td>
                        <td>
                          <Button
                            disabled={clicked}
                            theme="info"
                            className="mb-2 mr-1 btn "
                            onClick={() => displayForm(item.code)}
                          >
                            {t('Assign to field')}
                          </Button>
                        </td>
                      </tr>
                    )
                  })
                }
              </tbody>
            </table>
            {
              SingleSensor.map((item) => (
                <Modal centered open={toggle} >
                  <Modal.Header closeAriaLabel>

                    <h6 className="m-0">{t('edit_farm')}</h6>{" "}

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "flex-end",

                      }}
                    >
                      <Button
                        // theme="success"
                        className="mb-2 mr-1 btn btn-success"
                        onClick={() => handleEdit(item.uid)}
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

                  </Modal.Header>
                  <Modal.Body>
                    <Form>
                      <Row form>
                        <Col md="12" className="form-group">
                          <p style={{ margin: "0px" }}>{t('sensor_code')}</p>
                          <FormControl
                            key={item.id}
                            placeholder={t('sensor_code')}
                            value={resultScan}
                            onChange={(e) => setResultScan(e.target.value)}
                          // className={`${codeErr ? 'is-invalid' : ""}`}

                          />
                          {/* <div className="invalid-feedback" style={{textAlign: "left"}}>{codeErr}</div> */}

                        </Col>
                      </Row>
                      <Form.Group>
                        <p style={{ margin: "0px" }}>{t('desc')}</p>
                        <textarea
                          value={description}
                          style={{ height: "220px" }}
                          class="form-control"
                          placeholder={t('desc')}

                        ></textarea>
                      </Form.Group>
                    </Form>

                  </Modal.Body>
                </Modal>

              ))
            }
          </>

        </Card>

      </Container>
    </>
  )

}

export default SensorsList