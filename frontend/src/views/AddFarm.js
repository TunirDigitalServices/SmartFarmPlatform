import React from "react";
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  CardHeader,
  Button,
  Form,
  FormGroup,
  FormInput,
  FormSelect,
  FormCheckbox
} from "shards-react";
import PageTitle from "../components/common/PageTitle";
import "./../assets/Styles.css";
import Map from "./leafletMap";
import "./Styles.css";
import api from '../api/api';
import { withTranslation } from "react-i18next";
import FarmList from "./FarmList";
import LeafletMap from "./map";
import LoadingSpinner from "../components/common/LoadingSpinner";
import swal from "sweetalert";

class AddFarm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading : true,
      cities: [],
      allCities: [],
      countries: [],
      country: "",
      city: '',
      cityName: "",
      name_group: null,
      zoom: "",
      center: [],
      fromAction: false,
      name: null,
      description: null,
      added: false,
      nameError: "",
      classInputError: "",
      msgServer: "",
      classMsg: "",
      displayMsg: "hide",
      iconMsg: "info",
      farmList: [],
      Latitude: "",
      Longitude: "",
      positionError: "",
      layer: null,
      draw: {
        polygon: true,
        circle: false,
        rectangle: false,
        polyline: false,
        marker: true,
        circlemarker: false,
      },
      edit: {
        delete: false,
        edit: false
      },
      layerType: "",
      checked: false,
      toggle:false

    };
  }
  componentDidMount = async () => {
    this.getFarms()
    this.getCities()
    this.getCountries()
  }

  getCities = async () => {
    await api.get('/cities/get-cities').then(res => {
      const cities = res.data.Cities;
      this.setState({ allCities: cities });

    })
  }

  getCountries = async () => {
    await api.get('/countries/get-countries').then(res => {
      const countries = res.data.Countries;
      this.setState({ countries: countries });

    })
  }

  getFarms = async () => {
    await api.get('/farm/farms').then(res => {
      const DataFarm = res.data;
      this.setState({ farmList: DataFarm.farms });

    }).catch(err=>{
      console.log(err)
    }).finally(()=> this.setState({isLoading : false}))
  }

  _onCreated = e => {
    let type = e.layerType;
    this.setState({ layerType: type })
    let layer = e.layer;
    if (type === "polygon") {
      let coords = layer._latlngs[0];
      const Coordinates = coords.map((coord) => ({
        Lat: coord.lat,
        Long: coord.lng,
      }));
      if (Coordinates)
        this.setState({ layer: JSON.stringify(Coordinates) })
    } else {
      this.setState({ Latitude: layer.getLatLng().lat });
      this.setState({ Longitude: layer.getLatLng().lng });
    }

  };
  successCallback = (position) => {
    this.setState({ Latitude: position.coords.latitude });
    this.setState({ Longitude: position.coords.longitude });

    this.setState({
      zoom: 10,
      center: [position.coords.latitude, position.coords.longitude],
      fromAction: true
    });
  }
  errorCallback = (error) => {
    this.setState({
      checked: false
    });
    this.setState({ Latitude: "" });
    this.setState({ Longitude: "" });

    if (error.code == 1) {
      alert("You've decided not to share your position, but it's OK. We won't ask you again.");
    } else if (error.code == 2) {
      alert("The network is down or the positioning service can't be reached.");
    } else if (error.code == 3) {
      alert("The attempt timed out before it could get the location data.");
    } else {
      alert("Geolocation failed due to unknown error.");
    }
  }

  checkPositon = () => {
    if (this.state.checked === true) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(this.successCallback, this.errorCallback);
      } else {
        this.setState({ Latitude: "" });
        this.setState({ Longitude: "" });
        this.setState({
          checked: false
        });
        alert("Sorry, your browser does not support HTML5 geolocation.");
      }

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
  handleChangeZoom = (e) => {
    const target = e.target.value;
    let selected = e.target.selectedOptions[0].text
    const newCoords = target.split("_");
    const lat = parseFloat(newCoords[0]);
    const lon = parseFloat(newCoords[1]);
    const cityId = parseFloat(newCoords[2]);
    if (lat && lon && cityId) {
      this.setState({
        center: [lat, lon],
        city: cityId,
        zoom: 10,
        fromAction: true
      });

    }
  }

  handleCountryPick = (e) => {
    e.preventDefault();
    const country = this.state.countries.find(
      (country) => country.iso === e.target.value
    );
    let allCities = []
    if (country) {
      const city = this.state.allCities.map((city) => {
        if (city.iso === country.iso) {
          allCities.push({
            city: city.city,
            id: city.id,
            lat: city.lat,
            lon: city.lon
          })
        }
      });

      this.setState({ country: country.iso });
      this.setState({ cities: allCities })

    }
  };


  validate = () => {
    let nameError = '';
    let classInputError = '';
    let positionError = ""
    if (!this.state.name || this.state.name == "") {
      nameError = 'not_empty';
      classInputError = 'is-invalid'
      this.setState({ nameError });
      this.setState({ classInputError });
      return false;
    } else {
      this.setState({ nameError: '' });
      this.setState({ classInputError: '' });
    }
    // if (!this.state.Latitude || !this.state.Longitude) {
    //   positionError = 'Please select a farm position';
    //   this.setState({ positionError });
    //   return false;
    // } else {
    //   this.setState({ positionError: '' });
    // }
    return true

  };


  handleSubmit = (event) => {
    event.preventDefault()
    const isValid = this.validate();
    if (isValid) {
      this.addFarm()
    } else {
      return false;
    }
  }

  addFarm = async () => {

    const name = this.state.name
    const name_group = this.state.name_group
    const description = this.state.description
    const city_id = this.state.city
    let Coordinates = this.state.layer
    let Latitude = this.state.Latitude
    let Longitude = this.state.Longitude


    let user = JSON.parse(localStorage.getItem('user'));
    let user_uid = user.id

    await api.post('/farm/add-farm', { name, name_group, description, city_id, user_uid, Coordinates, Latitude, Longitude })
      .then(res => {
        if (res.data.errors) {
          let errorsData = res.data.errors
          errorsData.map((item, indx) => {
            this.setState({ msgServer: item.msg })
          })
          this.setState({ classMsg: "danger" })
          this.setState({ displayMsg: "show" })
        }
        if (res.data.type && res.data.type === "danger") {
          swal({
            title: `Cannot add farm`,
            icon: "error",
            text: 'Error'

        });
          // this.setState({ msgServer: res.data.message })
          // this.setState({ classMsg: "danger" })
          // this.setState({ displayMsg: "show" })
        }
        if (res.data.type && res.data.type === "success") {
           swal({
            title:'Farm added',
            icon: "success",
            text: 'Farm added successfully '

        });
          this.setState({ added: true}, this.resetForm())
          // this.setState({ toggle: false })
          // this.setState({ msgServer: "farm_added" })
          // this.setState({ classMsg: "success" })
          // this.setState({ displayMsg: "show" })
          // this.setState({ iconMsg: "check" })
          this.getFarms()
        }

      }).catch((error) => {
        this.setState({ msgServer: "fail_add_farm" })
        this.setState({ classMsg: "danger" })
        this.setState({ displayMsg: "show" })
      })
  }

  resetForm = () => {
    this.setState({
      name: "",
      name_group: "",
      description: "",
    });

    setTimeout(() => {
      this.setState({ displayMsg: "hide" })
      this.setState({ nameError: '' });
      this.setState({ classInputError: '' });
    }, 5000);
  };


  render() {
    const { t } = this.props;
    console.log(this.state.toggle)

    return (
      <Container fluid className="main-content-container px-4">
        {/* Page Header */}


            <Row noGutters className="page-header py-2 d-flex justify-content-between align-items-center">
              <PageTitle
                sm="4"
                title={t('my_farms')}
                className="text-sm-left"
              />
              <div className="m-1">
              <Button onClick={() => this.setState({toggle : true})} theme="info" style={{fontSize:16,color:"#fff"}}><i className="material-icons" >&#xe145;</i> {t('add_farm')}</Button>

              </div>

            </Row>
            {
              this.state.isLoading
              ?

              <LoadingSpinner />
              :
            <Row className="px-2">
              <FarmList
                farmList={this.state.farmList}
                Farms={this.getFarms}
              />

            </Row>

            }
            {
              this.state.toggle
              ?
              <>
              <Row noGutters className="page-header py-2">
                <PageTitle
                  sm="4"
                  title={t('add_farm')}
                  className="text-sm-left"
                />
              </Row>
              {/* <div className={`mb-0 alert alert-${this.state.classMsg} fade ${this.state.displayMsg}`}>
                <i class={`fa fa-${this.state.iconMsg} mx-2`}></i> {t(this.state.msgServer)}
              </div> */}
              <Row>
                <Col lg="12" sm="12" md="12">
                  <Card className="pt-0 mb-4">
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
  
                    </CardHeader>
                    <Row>
                    <CardBody className="p-2 mx-2">
                        <Col lg="12" sm="12" md="12" className=" p-2 m-2" >
                          <Row form className="py-4 mx-2">
                            <Col lg="6" md="12" sm="12">
                              <p style={{ margin: "0px" }}> {t('name_farm')}</p>
                              <FormInput
                                className={this.state.classInputError}
                                value={this.state.name}
                                placeholder={t('name_farm')}
                                required
                                onChange={evt => {
                                  this.setState({
                                    name: evt.target.value
                                  });
                                }}
  
                              />
                              <div className="invalid-feedback" >{t(this.state.nameError)}</div>
                            </Col>
                            <Col lg="6" md="12" sm="12">
                              <p style={{ margin: "0px" }}>{t('group_name')}</p>
                              <FormInput
                                value={this.state.name_group}
                                placeholder={t('group_name')}
                                onChange={evt => {
                                  this.setState({
                                    name_group: evt.target.value
                                  });
                                }}
                              />
                            </Col>
                            </Row>
  
                            <Row form className="py-4" >
                            <Col lg="6" md="12" sm="12">
                              <h6 className="text-center m-2 text-danger ">{this.state.positionError}</h6>
                              <p style={{ margin: "0px" }}>{t('select_country')}</p>
                              <FormSelect
                                onChange={this.handleCountryPick}
                                value={this.state.country || ''}
                              >
                                {
                                  this.state.countries.map(country => {
                                    return (
                                      <option key={country.id} value={country.iso}>{country.name}</option>
                                    )
                                  })
                                }
                              </FormSelect>
                            </Col>
                            <Col lg="6" md="12" sm="12" className="pt-2">
                              <p style={{ margin: "0px" }}>{t('select_city')}</p>
                              <FormSelect
                                onChange={e => this.handleChangeZoom(e)}
                                value={this.state.center[2]}
                              >
                                <option selected>{t('select_city')}</option>
                                {
                                  this.state.cities.map(city => {
                                    return (
                                      <option key={city.id} value={`${city.lat}_${city.lon}_${city.id}` || ""}>{city.city}</option>
                                    )
                                  })
                                }
                              </FormSelect>
                            </Col>
  
                            </Row>
                            <FormGroup className="my-4">
  
                              <FormCheckbox
                                checked={this.state.checked}
                                onChange={this.handleChange}
                                toggle
                              >
                                {t('current_pos_farm')}
                              </FormCheckbox>
                            </FormGroup>
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "center",
                                alignItems:"center"
                              }}
                            >
                              <Button
                                onClick={this.handleSubmit}
                                theme="info"
                                className="mb-2 mr-1 btn btn-success "
                                style={{fontSize:16,color:"#fff"}}
                                disabled={this.state.city !== "" ? false : true }

                              >
                                <i class={`fa fa-check mx-2`}></i>
                                {t('save')}
                              </Button>
                              {/* <Button
                                onClick={this.resetForm}
                                // theme="success"
                                className="mb-2 mr-1 btn btn-danger"
                              >
                                <i class={`fa fa-times mx-2`}></i>
                                {t('cancel')}
                              </Button> */}
                            </div>
                          {/* <FormGroup>
                              <p style={{ margin: "0px" }}>{t('desc')}</p>
                              <textarea
                                value={this.state.description}
                                onChange={evt =>
                                  this.setState({
                                    description: evt.target.value
                                  })
                                }
                                style={{ height: "275px" }}
                                class="form-control"
                                placeholder={t('desc')}
                              ></textarea>
                            </FormGroup> */}
  
                        </Col>
                    </CardBody>
                        <Col lg="6" md="12" sm="12" className=" p-2 mx-4 d-flex justify-content-center flex-column">
  
                          <div>
                            <i className='material-icons'>&#xe88e;</i> <span style={{ fontSize: 13, textDecoration: "underline" }}>{t('msg_draw_farm')}</span>
                          </div>
                          <LeafletMap _onCreated={this._onCreated} draw={this.state.draw} edit={this.state.edit} data={this.state.farmList} zoom={this.state.zoom} center={this.state.center} fromAction={this.state.fromAction} />
                        </Col>
                    </Row>
                  </Card>
                </Col>
  
              </Row>
              
              </>
              :
              null
            }
      </Container>
    );
  }
}

export default withTranslation()(AddFarm);
