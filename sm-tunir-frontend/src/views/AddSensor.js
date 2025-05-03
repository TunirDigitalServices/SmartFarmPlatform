import React from 'react'
import { Container, Row, Col, Card, Button, Form } from "react-bootstrap";
import PageTitle from "../components/common/PageTitle";
import api from '../api/api'
import { withTranslation } from "react-i18next";
import Html5QrcodePlugin from "./Html5QrcodePlugin";
import SensorList from './SensorList.js';
import LeafletMap from './map';
import LoadingSpinner from '../components/common/LoadingSpinner';
import swal from 'sweetalert';


class AddSensor extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      toggle: false,
      isLoading: true,
      zoom: "",
      center: [],
      fromAction: false,
      resultScan: "",
      codeError: "",
      zonesData: [],
      farmsData: [],
      sensorsData: [],
      description: "",
      field_uid: "",
      zone_uid: "",
      Latitude: null,
      positionError: "",
      farms: [],
      zones: [],
      sensorList: [],
      msgServer: "",
      classMsg: "",
      displayMsg: "hide",
      iconMsg: "info",
      draw: {
        polygon: false,
        circle: false,
        rectangle: false,
        polyline: false,
        marker: true,
        circlemarker: true
      },
      edit: {
        delete: false,
        edit: false
      },
      Latitude: "",
      Longitude: "",
      layerType: "",
      checked: false
    }
    this.onNewScanResult = this.onNewScanResult.bind(this);
  }


  componentDidMount = async () => {
    this.getDataFields();
    this.getDataZones();
    this.getListSensors();
  }

  getListSensors = async () => {
    await api.get('/sensor/sensors')
      .then(res => {
        const DataSensor = res.data;
        this.setState({ sensorList: DataSensor });
      }).catch(err => {
        console.log(err)
      }).finally(() => this.setState({ isLoading: false }))
  }

  // Map

  _onCreated = e => {
    let type = e.layerType;
    this.setState({ layerType: type })
    let layer = e.layer;
    if (type === "marker") {
      layer.bindPopup('sensorCode');
    } else {
      console.log("_onCreated: something else created:", type, e);
    }

    this.setState({ Latitude: layer.getLatLng().lat });
    this.setState({ Longitude: layer.getLatLng().lng });
  };

  _onEdited = e => {
    console.log(e)
  };

  checkPositon = () => {
    if (this.state.checked === true) {
      navigator.geolocation.getCurrentPosition((position) => {
        this.setState({ Latitude: position.coords.latitude });
        this.setState({ Longitude: position.coords.longitude });
      })
    }
    if (this.state.checked === false) {
      this.setState({ Latitude: "" });
      this.setState({ Longitude: "" });
    }
  }

  handleChange = () => {
    this.setState({
      checked: !this.state.checked
    },
      () => this.checkPositon()
    );

  }

  getDataZones = async () => {
    await api.get('/zone/zones').then(res => {
      const newDataZone = res.data;
      this.setState({ zones: newDataZone.farms });
      let Zones = [];
      this.state.zones.map(item => {
        let fields = item.fields;
        if (fields) {
          fields.map(itemZone => {
            let zones = itemZone.zones;
            if (zones) {
              zones.map(i => {
                Zones.push({
                  name: i.name,
                  Uid: i.uid
                })
              })
            }
          })
        }
      })

      this.setState({ zonesData: Zones })
    })
  }

  getDataFields = async () => {
    await api.get('/field/fields').then(res => {
      const newData = res.data;
      this.setState({ farms: newData.farms });
      let Fields = [];
      this.state.farms.map(item => {
        let fields = item.fields
        if (fields) {
          fields.map(itemfield => {
            Fields.push({
              title: itemfield.name,
              Uid: itemfield.uid,
            });
          })
        }
      });
      this.setState({ farmsData: Fields })
    })
  }

  handleUidField = (e) => {
    this.setState({
      field_uid: e.target.value,
    });
  };

  handleUidZone = (e) => {
    this.setState({
      zone_uid: e.target.value,
    });
  };

  handleDescription = (e) => {
    this.setState({
      description: e.target.value
    });
  }

  handleScan = (e) => {
    this.setState({
      resultScan: e.target.value
    });
  }

  validateSensor = () => {
    let codeError = '';
    let positionError = ""
    if (!this.state.Latitude || !this.state.Longitude) {
      positionError = 'Please select a sensor position';
      this.setState({ positionError });
    } else {
      positionError = ""
      this.setState({ positionError })
    }
    if (this.state.resultScan === "") {
      codeError = 'not_empty';
      this.setState({ codeError })
    }
    if (codeError || positionError) {
      this.setState({ codeError })
      this.setState({ positionError });
      return false;
    }
    console.log(this.state.Latitude)
    console.log(this.state.positionError)
    return true;
  };



  handleSubmit = (event) => {
    event.preventDefault()
    const isValid = this.validateSensor()
    if (isValid) {

      this.addSensor()

    }

  }


  addSensor = async () => {


    let user = JSON.parse(localStorage.getItem('user'));
    let user_uid = user.id

    let data = {
      code: this.state.resultScan,
      description: this.state.description,
      field_uid: this.state.field_uid,
      zone_uid: this.state.zone_uid,
      user_uid,
      Latitude: this.state.Latitude,
      Longitude: this.state.Longitude
    }


    await api.post('/sensor/add-sensor', data)
      .then(res => {
        if (res.data.errors) {
          let errorsData = res.data.errors
          errorsData.map((item, indx) => {
            this.setState({ msgServer: item.msg })
          })
          this.setState({ classMsg: "danger" })
          this.setState({ displayMsg: "show" })
        }
        if (res.data.type && res.data.type == "danger") {
          // this.setState({msgServer:res.data.message})
          // this.setState({classMsg:"danger"})
          // this.setState({displayMsg:"show"})
          swal({
            title: `Cannot add sensor`,
            icon: "error",
            text: 'Error'

          });
        }
        if (res.data.type && res.data.type == "success") {
          this.getListSensors()
          this.setState({ msgServer: "sensor_added" }, this.resetForm())
          // this.setState({classMsg:"success"})
          // this.setState({displayMsg:"show"})
          // this.setState({iconMsg:"check"})
          swal({
            title: 'Sensor added',
            icon: "success",
            text: 'Sensor added successfully '

          });
        }

      }).catch((error) => {
        this.setState({ msgServer: "fail_add_sensor" })
        this.setState({ classMsg: "danger" })
        this.setState({ displayMsg: "show" })
      })
  }

  resetForm = () => {
    this.setState({
      resultScan: "",
      description: "",
      checked: false
    });

    setTimeout(() => {
      this.setState({ displayMsg: "hide" })
    }, 5000);
  };



  render() {
    const { t } = this.props;
    return (
      <Container fluid className="main-content-container px-4">
      <Row noGutters className="page-header py-2 d-flex justify-content-between align-items-center mt-4">
  <Col sm="4">
    <PageTitle
      title={t('my_sensors')}
      className="text-sm-left"
    />
  </Col>
  <Col sm="auto" className="text-right">
    <Button onClick={() => this.setState({ toggle: true })} variant="info" style={{ fontSize: 16, color: "#fff" }}>
      <i className="material-icons">&#xe145;</i> {t('add_sensor')}
    </Button>
  </Col>
</Row>

        {
          this.state.isLoading
            ?
            <LoadingSpinner />
            :
            <Row>

              <SensorList
                sensorsData={this.state.sensorList}
                Sensors={this.getListSensors}
              />

            </Row>
        }
        {
          this.state.toggle
            ?
            <>
              <Row noGutters className="page-header py-4">
                <PageTitle
                  sm="4"
                  title={t('add_sensor')}
                  className="text-sm-left"
                />
              </Row>
              <Row >
                <Col lg="12" md="8" sm="12" className="mb-4">
                  {/* <div className={`mb-0 alert alert-${this.state.classMsg} fade ${this.state.displayMsg}`}>
                  <i class={`fa fa-${this.state.iconMsg} mx-2`}></i> {t(this.state.msgServer)}
              </div> */}
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
                        <Col lg="6" sm="12" md="6">
                          <Form>
                            <Row form>
                              <Col md="12" className="form-group">
                                <p style={{ margin: "0px" }}>{t('sensor_code')}</p>
                                <Form.Control
                                  placeholder={t('sensor_code')}
                                  value={this.state.resultScan}
                                  onChange={this.handleScan}
                                  required
                                  className={this.state.codeError === '' ? '' : 'is-invalid'}

                                />
                                <div className="invalid-feedback" style={{ textAlign: "left" }}>{this.state.codeError}</div>

                              </Col>
                              <Col md="6" className="form-group">
                                <p style={{ margin: "0px" }}>{t('name_field')}</p>
                                <Form.Select
                                  value={this.state.field_uid}
                                  placeholder={t('name_field')}
                                  required
                                  onChange={this.handleUidField}
                                >
                                  <option value="">{t('select_field')}</option>

                                  {
                                    this.state.farmsData.map((item, indx) => {
                                      return <option value={item.Uid}>{item.title}</option>
                                    })
                                  }
                                </Form.Select>
                              </Col>
                              <Col md="6" className="form-group">
                                <p style={{ margin: "0px" }}>{t('name_zone')}</p>
                                <Form.Select
                                  value={this.state.zone_uid}
                                  placeholder={t('zone_name')}
                                  required
                                  onChange={this.handleUidZone}
                                >
                                  <option value="">{t('select_zone')}</option>
                                  {
                                    this.state.zonesData.map((item, indx) => {
                                      return <option value={item.Uid}>{item.name}</option>
                                    })
                                  }
                                </Form.Select>
                              </Col>
                            </Row>
                            <Row form>
                              <Col lg="12" md="12" sm="12">
                                <div>
                                  <h5>{t('scan_qrcode_sensor')}</h5>
                                  <Html5QrcodePlugin
                                    fps={10}
                                    qrbox={250}
                                    disableFlip={true}
                                    rememberLastUsedCamera={false}
                                    qrCodeSuccessCallback={this.onNewScanResult}

                                  />
                                </div>
                              </Col>
                              {/* <FormGroup className="my-4">
                      
                      <FormCheckbox
                      checked={this.state.checked}
                      onChange={this.handleChange}
                        toggle
                        >
                        Assign sensor position to my current position
                    </FormCheckbox>
                    </FormGroup> */}
                              <h6 style={{ color: "tomato", textAlign: 'center' }}> {this.state.positionError}</h6>
                            </Row>
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                padding: 16,
                                gap:"10px"
                              }}
                            >
                              <Button
                                onClick={this.handleSubmit}
                                variant="info"
                                className="mb-2 mr-1 btn btn-success"
                                style={{ fontSize: 16, color: "#fff" }}
                                disabled={this.state.Latitude !== "" ? false : true}
                              >
                                <i class={`fa fa-check mx-2`}></i>
                                {t('save')}
                              </Button>

                            </div>
                          </Form>
                        </Col>
                        <Col lg="5" md="12" sm="12" className="mb-4">
                          <div style={{ textAlign: "center", margin: "5px" }}>
                            <i className='material-icons mx-2'>&#xe88e;</i>
                            You need to add sensor position on the map

                          </div>
                          <LeafletMap type={this.state.layerType} _onCreated={this._onCreated} _onEdited={this._onEdited} draw={this.state.draw} edit={this.state.edit} farms={this.state.farms} data={this.state.sensorList} zoom={this.state.zoom} center={this.state.center} fromAction={this.state.fromAction} />

                        </Col>
                      </div>
                    </Card.Body>

                  </Card>
                </Col>
              </Row>
            </>
            :
            null

        }

      </Container>
    )

  }

  onNewScanResult(decodedText, decodedResult) {
    this.setState({ resultScan: decodedText })

    // Handle the result here.
  }

}


export default withTranslation()(AddSensor); 
