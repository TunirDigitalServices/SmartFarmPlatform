import React, { useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  CardHeader,
  Button,
  Nav,
  NavItem,
  NavLink,
  Modal,
  ModalBody,
  ModalHeader
} from "shards-react";
import PageTitle from "../components/common/PageTitle";
import "./../assets/Styles.css";
import "./Styles.css";
import FieldSetupForm from "../components/FieldSettingForms/FieldSetupForm";
import FieldSoilForm from "../components/FieldSettingForms/FieldSoilForm";
import FieldCropForm from "../components/FieldSettingForms/FieldCropForm";
import FieldIrrigationForm from "../components/FieldSettingForms/FieldIrrigationForm";
import LeafletMap from "./map";
import CropList from './CropList';
import IrrigationList from "./IrrigationList";
import ZoneList from "./ZoneList";

import "react-responsive-carousel/lib/styles/carousel.min.css"; // requires a loader
import api from '../api/api';
import { withTranslation } from "react-i18next";
import FieldList from "./FieldList";
import swal from "sweetalert";

class AddField extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      zoom: "",
      center: [],
      fromAction: false,
      elemValue: "field",
      depthLevel: props.depth,
      dataChange: props.state,
      setupCardSave: false,
      soilCardSave: false,
      cropsCardSave: false,
      irrigationCardSave: false,
      msgServer: "",
      user_map_details: "#",
      classMsg: "",
      displayMsg: "hide",
      iconMsg: "info",
      farms: [],
      zones: [],
      crops: [],
      irrigation: [],
      irrigationsData: [],
      farmsData: [],
      zonesData: [],
      cropsData: [],
      farm_uid: [],
      field_uid: [],
      zone_uid: "",
      zoneName: "",
      name: "",
      nameError: "",
      typeError: "",
      typeErrorIrrig: "",
      farmError: "",
      description: null,
      farmName: "",
      width:"",
      length:"",
      added: false,
      source: "1",
      soilProperty: "Standard",
      depth_data: [{
        uni: "",//soil type
        depth: "",
        clay: null,
        sand: null,
        sil: null,
        CEC: null,
        pH: null,
        OM: null,
        Ecd: null
      }],
      irrigArea: "",
      RUmax: "",
      effPluie: "",
      ruPratique: "",
      growingDate:"",
      effIrrig: "",
      density: "",
      ecartInter: "",
      ecartIntra: "",
      cropType: "",
      previous_type: "",
      plantingDate: "",
      rootDepth: "",
      days: "",
      cropVariety: "",
      zone: [],
      listSoils: [],
      crop: [],
      startDate: new Date(),
      endDate: new Date(),
      ggd_maturity: "",
      irrigType: '',
      flowrate: null,
      irrigated_already: null,
      pivot_shape: null,
      irrigation_syst: null,
      pivot_length: null,
      pivot_coord: null,
      full_runtime: null,
      drippers: "",
      drippersSpacing: '',
      lateral: null,
      pumpFlow: "",
      pumpType: "",
      linesNumber:"",
      draw: {
        polygon: false,
        circle: false,
        rectangle: false,
        polyline: true,
        marker: true,
        circlemarker: true
      },
      edit: {
        delete: false,
        edit: false
      },
      layer: null,
      Latitude: "",
      Longitude: "",
      layerType: "",
    }
    this.toggle = this.toggle.bind(this);

  }

  toggle() {
      this.setState({
        open: !this.state.open
      });
  }

  _onCreated = e => {
    let type = e.layerType;
    this.setState({ layerType: type })
    let layer = e.layer;
    if (type === "marker") {
      layer.bindPopup('Field Name');
    } else {
      console.log("_onCreated: something else created:", type, e);
    }
    if (type === "polyline") {
      let coords = layer._latlngs;
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


  componentDidMount = async () => {

    this.getDataFields();
    this.getDataZones();
    this.getDataCrops();
    this.getDataIrrigations();
    this.getSoils();
  }

  componentWillUnmount() {
    this.setState = (state, callback) => {
      return;
    };
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
                  Id: i.id,
                  name: i.name,
                  Uid: i.uid,
                  source: i.source,
                  description: i.description,
                  depth_data: i.depth_data,
                  field_id: i.field_id
                })
              })
            }
          })
        }
      })

      this.setState({ zonesData: Zones })
    })
  }

  getDataCrops = async () => {
    await api.get('/crop/crops').then(res => {
      const newDataCrop = res.data;
      this.setState({ crops: newDataCrop.farms });
      let Crops = [];
      this.state.crops.map(item => {
        let fields = item.fields;
        if (fields) {
          fields.map(itemCrop => {
            let crops = itemCrop.crops;
            if (crops) {
              crops.map(i => {
                Crops.push({
                  type: i.croptype_id,
                  croptype: i.croptypes,
                  address: i.address,
                  Uid: i.uid,
                  irrigations: i.irrigations,
                  Id: i.id,
                  field_id: i.field_id,
                  zone_id: i.zone_id

                });
              });
            };
          });
        };
      });

      this.setState({ cropsData: Crops })
    })
  }

  getDataIrrigations = async () => {
    await api.get('/irrigation/irrigations').then(res => {
      const newDataIrrig = res.data;
      this.setState({ irrigation: newDataIrrig });

      let Irrigations = [];
      this.state.irrigation.map(item => {
        let fields = item.fields;
        if (fields) {
          fields.map(itemCrop => {
            let crops = itemCrop.crops;
            if (crops) {
              crops.map(i => {
                let irrigations = i.irrigations
                if (irrigations) {
                  irrigations.map(itemIrrig => {
                    Irrigations.push({
                      type: itemIrrig.type,
                      address: itemIrrig.address,
                      pivotShape: itemIrrig.pivot_shape,
                      flowrate: itemIrrig.flowrate,
                      lateral: itemIrrig.lateral,
                      Uid: itemIrrig.uid,
                      crop_id: itemIrrig.crop_id,
                      zone_id: itemIrrig.zone_id,

                    });

                  })
                }
              });
            };
          });
        };
      });

      this.setState({ irrigationsData: Irrigations })
    })
  }


  getDataFields = async () => {
    await api.get('/field/fields').then(res => {
      const newData = res.data;
      this.setState({ farms: newData.farms });
      let Fields = [];
      this.state.farms.map(async item => {
        let fields = item.fields
        if (fields) {
          fields.map(itemfield => {
            Fields.push({
              title: itemfield.name,
              status: itemfield.status,
              description: itemfield.description,
              Uid: itemfield.uid,
              farm_id: itemfield.farm_id,
              Latitude: itemfield.Latitude,
              Longitude: itemfield.Longitude,
              Id: itemfield.id
            });
          })
        }
      });
      this.setState({ farmsData: Fields })
      // this.setState({ user_map_details: newData.user_map_details.map_link_details })

    })
  }

  getSoils = async () => {
    try {
      await api.get('/soils/get-soils')
        .then(response => {
          let listSoils = response.data.Soils
          this.setState({ listSoils: listSoils })
          let Ru = ""
          // if (listSoils) {
          //     listSoils.map(item => {
          //         Ru = item.ru
          //     })
          //     setInputsData({ ...InputsData, RUmax: Ru })
          // }
        }).catch(error => {
          console.log(error)
        })

    } catch (error) {
      console.log(error)
    }
  }
  //Add Field

  handleName = (e) => {
    this.setState({
      name: e.target.value,
    });
  };
  handleUidFarm = (e) => {
    this.setState({
      farm_uid: e.target.value,
    });
  };

  handleWidth = (e) =>{
    this.setState({
      width: e.target.value,
    });
  }
  handleLength = (e) =>{
    this.setState({
      length: e.target.value,
    });
  }

  handleDescription = (e) => {
    this.setState({
      description: e.target.value,
    });
  };

  validate = () => {
    let nameError = '';
    let farmError = '';
    if (!this.state.name) {
      nameError = 'not_empty';
      this.setState({ nameError })
      return false
    } else {
      this.setState({ nameError: "" })
    }
    if (this.state.farm_uid == '') {
      farmError = 'not_empty';
      this.setState({ farmError })
      return false
    }
    if (this.state.farm_uid) {
      this.setState({ farmError: "" })
    }
    return true;
  };


  handleChangeZoom = () => {
    this.setState({
      zoom: 10,
      center: [36.74246, 9.19567],
      fromAction: true
    });
  }


  handleSubmit = (event) => {
    event.preventDefault()

    const isValid = this.validate();
    if (isValid) {
      this.addField()
    }
  }


  addField = () => {

    let data = {
      name: this.state.name,
      description: this.state.description,
      farmName: this.state.farmName,
      farm_uid: this.state.farm_uid,
      Latitude: this.state.Latitude,
      Longitude: this.state.Longitude,
      largeur:this.state.width,
      longueur:this.state.length
    }

    api.post('/field/add-field', data)
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
          // this.setState({ msgServer: res.data.message })
          // this.setState({ classMsg: "danger" })
          // this.setState({ displayMsg: "show" })
          swal({
            title: `Cannot add field`,
            icon: "error",
            text: 'Error'

        });
        }
        if (res.data.type && res.data.type == "success") {
          this.getDataFields()
          this.setState({ added: true }, this.resetForm())
          this.setState({elemValue : "soil"})
          // this.setState({ msgServer: "field_added" })
          // this.setState({ classMsg: "success" })
          // this.setState({ displayMsg: "show" })
          // this.setState({ iconMsg: "check" })
          swal({
            title:'Field added',
            icon: "success",
            text: 'Field added successfully '

        });

          this.resetForm()
        }

      })
      .catch(() => {
        this.setState({ msgServer: "fail_add_field" })
        this.setState({ classMsg: "danger" })
        this.setState({ displayMsg: "show" })

      });
  }
  //@TODO REST FIELD FORM NOT WORKING
  resetForm = () => {
    this.setState({
      name: "",
      description: "",
      farm_uid: ""
    });

    setTimeout(() => {
      this.setState({ displayMsg: "hide" })
    }, 3000);
  };
  resetFormCrop = () => {
    this.setState({
      rootDepth: "",
      days: "",
      previous_type: "",
      crop_variety_id: "",
      practical_fraction: "",
      density: "",
      ecart_inter: "",
      ecart_intra: "",
      ruPratique: ""
    });

    setTimeout(() => {
      this.setState({ displayMsg: "hide" })
    }, 3000);
  };
  resetFormSoil = () => {
    this.setState({
      zoneName: "",
      source: "",
      field_uid: "",
      effPluie: "",
      RUmax: ""
    });

    setTimeout(() => {
      this.setState({ displayMsg: "hide" })
    }, 3000);
  };

  //Add Zone

  handleZoneName = (e) => {
    this.setState({
      zoneName: e.target.value

    });
  };

  handleSource = (e) => {
    this.setState({
      source: e.target.value,
    });
  };

  handleSoilProprety = (val) => {
    this.setState({
      soilProperty: val,
    });
  };

  handleDepth = (e) => {
    this.setState({
      depth_data: e,
    });
  };
  handleUidZone = (e) => {
    this.setState({
      zone_uid: e.target.value,
    });
  };
  handleIrrigArea = (e) => {
    this.setState({
      irrigArea: e,
    });
  };
  handleEffRain = (e) => {
    this.setState({
      effPluie: e,
    });
  };

  handleEffIrrig = (e) => {
    this.setState({
      effIrrig: e,
    });
  };

  handleRuPractical = (e) => {
    this.setState({
      ruPratique: e,
    });
  };

  handleRuMax = (e) => {
    this.setState({
      RUmax: e,
    });
  };



  validateZone = () => {
    let nameError = '';
    if (!this.state.zoneName) {
      nameError = 'not_empty';
      this.setState({ nameError })
      return false
    }
    return true;
  };

  zoneHandleSubmit = (event) => {
    event.preventDefault()
    const isValid = this.validateZone()
    this.addZone()


  }


  addZone = () => {

    let data = {
      description: this.state.description,
      soilProperty: this.state.soilProperty,
      field_uid: this.state.field_uid,
      zone_uid: this.state.zone_uid,
      name: this.state.zoneName,
      source: this.state.source,
      depth_data: this.state.depth_data,
      RUmax: this.state.RUmax,
      effPluie: this.state.effPluie,
      irrigArea: this.state.irrigArea
    }
    api.post('/zone/add-zone', data)
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
          // this.setState({ msgServer: res.data.message })
          // this.setState({ classMsg: "danger" })
          // this.setState({ displayMsg: "show" })
          swal({
            title:'Cannot add soil',
            icon: "error",

        });
        }
        if (res.data.type && res.data.type == "success") {
          this.getDataZones();
          this.setState({ added: true }, this.resetFormSoil())
          swal({
            title:'Soil added',
            icon: "success",
            text: 'Soil added successfully '

          });
          this.setState({elemValue : "crop"})
          this.setState({open : false})
          // this.setState({ msgServer: "zone_added" })
          // this.setState({ classMsg: "success" })
          // this.setState({ displayMsg: "show" })
          // this.setState({ iconMsg: "check" })
        }
      })
      .catch((err) => {
        this.setState({ msgServer: "fail_add_zone" })
        this.setState({ classMsg: "danger" })
        this.setState({ displayMsg: "show" })


      });
  }

  // Add Crop 

  handleUidField = (e) => {
    this.setState({
      field_uid: e.target.value,
    });
  };

  handleZone = (e) => {
    this.setState({
      zone_uid: e.target.value
    });
  };

  handleCropType = (e) => {
    this.setState({
      cropType: e.target.value
    });
  };

  handlePrevType = (e) => {
    this.setState({
      previous_type: e.target.value,
    });
  };

  handleGGD = (e) => {
    this.setState({
      ggd_maturity: e.target.value,
    });
  };

  handleRootDepth = (e) => {
    this.setState({
      rootDepth: e,
    });
  };

  handleDays = (e) => {
    this.setState({
      days: e,
    });
  };
  handlePlantingDate = (e) => {
    this.setState({
      plantingDate: e,
    });
  };
  handleGrowingDate = (e) => {
    this.setState({
      growingDate: e.target.value,
    });
  };
  handleCropVariety = (e) => {
    this.setState({
      cropVariety: e.target.value,
    });
  };
  handleCropDensity = (e) => {
    this.setState({
      density: e.target.value,
    });
  };
  handleEcartInter = (e) => {
    this.setState({
      ecartInter: e.target.value,
    });
  };
  handleEcartIntra = (e) => {
    this.setState({
      ecartIntra: e.target.value,
    });
  };

  // handleStartDate = (e) => {
  //   this.setState({
  //     growth_date_start: e.target.value,
  //   });
  // };
  // handleEndDate = (e) => {
  //   this.setState({
  //     growth_date_end: e.target.value,
  //   });
  // };

  handleDate = (value) => {
    this.setState({
      startDate: value.startDate,
      endDate: value.endDate,
    });
  }


  //Validate crop

  validateCrop = () => {
    let typeError = '';
    if (!this.state.type) {
      typeError = 'not_empty';
      this.setState({ typeError })
      return false
    }
    return true;
  };


  cropHandleSubmit = (event) => {
    event.preventDefault()
    const isValid = this.validateCrop()
    this.addCrop()



  }


  addCrop = () => {

    let data = {
      zone_uid: this.state.zone_uid,
      field_uid: this.state.field_uid,
      croptype_id: this.state.cropType,
      previous_type: this.state.previous_type,
      growth_date_start: this.state.startDate.toISOString().replace('Z', ' ').replace('T', ' '),
      growth_date_end: this.state.endDate.toISOString().replace('Z', ' ').replace('T', ' '),
      ggd_maturity: this.state.ggd_maturity,
      plantingDate: this.state.plantingDate,
      rootDepth: this.state.rootDepth,
      days: this.state.days,
      crop_variety_id: this.state.cropVariety,
      practical_fraction: this.state.ruPratique,
      density: this.state.density,
      ecart_inter: this.state.ecartInter,
      ecart_intra: this.state.ecartIntra,
      growingDate:this.state.growingDate
    }

    api.post('/crop/add-crop', data)
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
          // this.setState({ msgServer: res.data.message })
          // this.setState({ classMsg: "danger" })
          // this.setState({ displayMsg: "show" })
          swal({
            title:'Cannot add crop',
            icon: "error",

        });
        }
        if (res.data.type && res.data.type == "success") {
          this.getDataCrops()
          this.setState({ added: true }, this.resetFormCrop())
          swal({
            title:'Crop added',
            icon: "success",
            text: 'Crop added successfully '

          });
          this.setState({elemValue : "irrig"})
          this.setState({open : false})
          // this.setState({ msgServer: "crop_added" })
          // this.setState({ classMsg: "success" })
          // this.setState({ displayMsg: "show" })
          // this.setState({ iconMsg: "check" })
        }
      })
      .catch((err) => {
        this.setState({ msgServer: "fail_add_crop" })
        this.setState({ classMsg: "danger" })
        this.setState({ displayMsg: "show" })


      });
  }

  //Add Irrigation

  handleIrrigType = (e) => {
    this.setState({
      irrigType: e
    })
  }

  handleIrrigZone = (e) => {
    this.setState({
      zone: e.target.value
    })
  }

  handleFlowrate = (e) => {
    this.setState({
      flowrate: e.target.value
    })
  }

  handleIrrigAlrd = (e) => {
    this.setState({
      irrigated_already: e.target.value
    })
  }

  handlePivotShape = (e) => {
    this.setState({
      pivot_shape: e.target.value
    })
  }

  handlePivotCoord = (e) => {
    this.setState({
      pivot_coord: e.target.value
    })
  }

  handlePivotLength = (e) => {
    this.setState({
      pivot_length: e.target.value
    })
  }

  handleIrrgSyst = (e) => {
    this.setState({
      irrigation_syst: e.target.value
    })
  }

  handleRunTime = (e) => {
    this.setState({
      full_runtime: e.target.value
    })
  }

  handleLateral = (e) => {
    this.setState({
      lateral: e.target.value
    })
  }

  handleDrippers = (e) => {
    this.setState({
      drippers: e.target.value
    })
  }
  handleDrippersSpacing = (e) => {
    this.setState({
      drippersSpacing: e.target.value
    })
  }

  handlePumpFlow = (e) => {
    this.setState({
      pumpFlow: e.target.value
    })
  }
  handlePumpType = (e) => {
    this.setState({
      pumpType: e.target.value
    })
  }

  handleLinesNumber = (e) =>{
    this.setState({
      linesNumber: e.target.value
    })
  }
  handleCrop = (e) => {
    this.setState({
      crop: e.target.value
    })
  }

  validateIrrigation = () => {
    let ErrorIrrig = '';
    if (this.state.irrigType === "") {
      ErrorIrrig = 'select_type';
      this.setState({ typeErrorIrrig: ErrorIrrig })
    } else {
      this.setState({ typeErrorIrrig: ErrorIrrig })

    }
    if (ErrorIrrig) {
      return false

    }
    return true;
  };


  IrrigHandleSubmit = (event) => {
    event.preventDefault()
    const isValid = this.validateIrrigation();
    if (isValid) {
      this.addIrrigation()

    }

  }




  addIrrigation = () => {

    let data = {
      type: this.state.irrigType,
      zone_uid: this.state.zone,
      crop_uid: this.state.crop,
      flowrate: this.state.flowrate,
      irrigated_already: this.state.irrigated_already,
      name: this.state.name,
      pivot_shape: this.state.pivot_shape,
      irrigation_syst: this.state.irrigation_syst,
      pivot_length: this.state.pivot_length,
      pivot_coord: this.state.pivot_coord,
      full_runtime: this.state.full_runtime,
      lateral: this.state.lateral,
      drippers: this.state.drippers,
      effIrrig: this.state.effIrrig,
      pumpFlow: this.state.pumpFlow,
      pumpType: this.state.pumpType,
      drippers_spacing: this.state.drippersSpacing,
      lines_number:this.state.linesNumber
    }


    api.post('/irrigation/add-irrigation', data)
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
          this.setState({ msgServer: res.data.message }, this.IrrgResetForm())
          this.setState({ classMsg: "danger" })
          this.setState({ displayMsg: "show" })
        }
        if (res.data.type && res.data.type == "success") {
          this.getDataIrrigations()
          this.setState({ added: true }, this.IrrgResetForm())
          this.setState({ msgServer: "irrigation_added" })
          this.setState({ classMsg: "success" })
          this.setState({ displayMsg: "show" })
          this.setState({ iconMsg: "check" })
        }
      })
      .catch((err) => {
        this.setState({ msgServer: "fail_add_irrigation" })
        this.setState({ classMsg: "danger" })
        this.setState({ displayMsg: "show" })


      });
  }

  IrrgResetForm = () => {
    this.setState({
      flowrate: "",
      irrigType: "",
      drippers: "",
      effIrrig: "",
      pumpFlow: "",
      zone_uid: "",
      crop_uid: "",
      // irrigated_already :"",
      // pivot_shape : "",
      // irrigation_syst : "",
      // pivot_length : "",
      // pivot_coord :"",
      // full_runtime : "",
    });

    setTimeout(() => {
      this.setState({ displayMsg: "hide" })
    }, 3000);
  };



  render() {
    const { t } = this.props;
    const renderAddSetup = () => {
      switch (this.state.elemValue) {
        case 'field':
          return (
            <div>
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
                    <div>
                      <h6 className="m-0" style={{ textAlign: "left" }}>{t("field_setup")}</h6>{" "}
                    </div>
                  </div>

                </CardHeader>
                <CardBody className="pt-0">
                  <Row noGutters className="page-header py-4">
                    <PageTitle
                      sm="4"
                      title={t('my_fields')}
                      className="text-sm-left"
                    />
                  </Row>
                  <Row className='px-2'>
                    <FieldList
                      Fields={this.getDataFields}
                      FieldsList={this.state.farmsData}
                    />

                  </Row>
                  {/* <div className="d-flex justify-content-center align-items-center">
                    <Button theme="success" className="rounded-circle" style={{ height: 60, width: 60 }} onClick={this.toggle} title={`${t('add_field')}`}>
                      <i className="material-icons" style={{ fontSize: 36, display: "flex", justifyContent: "center", alignItems: "center" }}>&#xe145;</i>
                    </Button>

                  </div> */}
                  

                </CardBody>
              </Card>
              <Modal size='lg' centered={true} open={this.state.open} toggle={this.toggle} >
                    <ModalHeader>
                      <Button
                        // theme="success"
                        className="mb-2 mr-1 btn btn-danger"
                        onClick={this.toggle}

                      >
                        <i class={`fa fa-times mx-2`}></i>
                      </Button>
                    </ModalHeader>
                    <ModalBody>
                      <Row>
                        <Col lg='6' md="12" sm="12">
                          <div
                            style={{
                              display: "flex",
                              marginTop: "20px",
                              flexWrap: "wrap"
                            }}
                          >
                            <FieldSetupForm
                              handleDescription={this.handleDescription}
                              handleName={this.handleName}
                              handleUidFarm={this.handleUidFarm}
                              onChange={value => console.log(value)}
                              saved={this.state.setupCardSave}
                              nameError={this.state.nameError}
                              farmError={this.state.farmError}
                              name={this.state.name}
                              farm_uid={this.state.farm_uid}
                              description={this.state.description}
                              length={this.state.length}
                              width={this.state.width}
                              handleWidth={this.handleWidth}
                              handleLength={this.handleLength}
                            />

                          </div>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "center",
                              alignItems: "center"
                            }}
                          >
                            <Button
                              onClick={this.handleSubmit}
                              theme="info"
                              className="mb-2 mr-1 btn btn-success"
                              style={{ fontSize: 16, color: "#fff" }}
                              // disabled={this.state.Latitude !== "" ? false : true}
                            >
                              <i class={`fa fa-check mx-2`}></i>
                              {t('save')}
                            </Button>
                          </div>
                        </Col>
                        
                        {/* <Col lg="6" md="12" sm="12" className="mb-4">

                          <LeafletMap _onCreated={this._onCreated} fields={this.state.farmsData} data={this.state.farms} draw={this.state.draw} edit={this.state.edit} zoom={this.state.zoom} center={this.state.center} fromAction={this.state.fromAction} />

                        </Col> */}
                      </Row>
                    </ModalBody>
                  </Modal>
            </div>
          )
        case 'soil':
          return (
            <div>
              <Card small className="h-100">
                <CardHeader className="border-bottom">
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center"
                    }}
                  >
                    <h6 className="m-0">{t('soil_info')}</h6>
                   
                  </div>
                </CardHeader>
                <CardBody className="pt-0">
                      <Row noGutters className="page-header py-4">
                       <PageTitle
                         sm="4"
                         title={t('my_zones')}
                         className="text-sm-left"
                       />
                     </Row>
                     <Row className="px-2">
   
                       <ZoneList
                         zonesList={this.state.zonesData}
                         Zones={this.getDataZones}
                         Fields={this.state.farmsData}
                         state={this.dataChange}
                         listSoils={this.state.listSoils}
   
                       />

   
                     </Row>
                     {/* <div className="d-flex justify-content-center align-items-center">
                    <Button theme="success" className="rounded-circle" style={{ height: 60, width: 60 }} onClick={this.toggle} title={`${t('add_soil')}`}>
                      <i className="material-icons" style={{ fontSize: 36, display: "flex", justifyContent: "center", alignItems: "center" }}>&#xe145;</i>
                    </Button>

                  </div> */}
                </CardBody>
              </Card>
                  <Modal size='lg' centered={true} open={this.state.open} toggle={this.toggle} >
                    <ModalHeader>
                    <div
                            style={{
                              display: "flex",
                              justifyContent: "flexStart",
                              alignItems: "center"
                            }}
                          >

                        <Button
                            // theme="success"
                            className="mb-2 mr-1 btn btn-danger"
                            onClick={this.toggle}

                          >
                            <i class={`fa fa-times mx-2`}></i>
                          </Button>
                          <Button
                                    onClick={this.zoneHandleSubmit}
                                    theme="info"
                                    className="mb-2 mr-1 btn btn-success"
                                    style={{ fontSize: 16, color: "#fff" }}
                                    // disabled={this.state.Latitude !== "" ? false : true}
                                  >
                                    <i class={`fa fa-check mx-2`}></i>
                                    {t('save')}
                            </Button>
                      
                            
                          </div>
                    </ModalHeader>
                    <ModalBody>
                        <div
                          style={{
                            display: "flex",
                            marginTop: "20px",
                            flexWrap: "wrap"
                          }}
                        >
                          <FieldSoilForm
                            handleZoneName={this.handleZoneName}
                            handleSource={this.handleSource}
                            handleDepth={this.handleDepth}
                            handleSoilProprety={this.handleSoilProprety}
                            handleUidField={this.handleUidField}
                            handleUidZone={this.handleUidZone}
                            source={this.state.source}
                            zones={this.state.zonesData}
                            ZoneFunction={this.getDataZones}
                            fields={this.state.farmsData}
                            onChange={value => console.log(value)}
                            saved={this.state.soilCardSave}
                            nameError={this.state.nameError}
                            modal={false}
                            zoneName={this.state.zoneName}
                            listSoils={this.state.listSoils}
                            // effIrrig={this.state.effIrrig}
                            effPluie={this.state.effPluie}
                            ruPratique={this.state.ruPratique}
                            RUmax={this.state.RUmax}
                            irrigArea={this.state.irrigArea}
                            // handleEffIrrig={this.handleEffIrrig}
                            handleEffRain={this.handleEffRain}
                            handleIrrigArea={this.handleIrrigArea}
                            handleRuPractical={this.handleRuPractical}
                            handleRuMax={this.handleRuMax}
                          />
                        </div>
                            
                    </ModalBody>
                  </Modal>
            </div>
          )
        case 'crop':
          return (
            <div>
              <Card small className="h-100">
                <CardHeader className="border-bottom">
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center"
                    }}
                  >
                    <h6 className="m-0">{t('crop_info')}</h6>{" "}
                  </div>
                </CardHeader>
                <CardBody className="pt-0">
                <Row noGutters className="page-header py-4">
                    <PageTitle
                      sm="4"
                      title={t('my_crops')}
                      className="text-sm-left"
                    />
                  </Row>
                  <Row className="px-2">

                    <CropList
                      cropsList={this.state.cropsData}
                      Crops={this.getDataCrops}
                      Fields={this.state.farmsData}
                      Zones={this.state.zonesData}
                    />

                  </Row>
                  {/* <div className="d-flex justify-content-center align-items-center">
                    <Button theme="success" className="rounded-circle" style={{ height: 60, width: 60 }} onClick={this.toggle} title={`${t('add_crop')}`}>
                      <i className="material-icons" style={{ fontSize: 36, display: "flex", justifyContent: "center", alignItems: "center" }}>&#xe145;</i>
                    </Button>

                  </div> */}

                </CardBody>
              </Card>
                  <Modal size='lg' centered={true} open={this.state.open} toggle={this.toggle}>
                    <ModalHeader>
                    <div
                            style={{
                              display: "flex",
                              justifyContent: "flexStart",
                              alignItems: "center"
                            }}
                          >
                               <Button
                        // theme="success"
                        className="mb-2 mr-1 btn btn-danger"
                        onClick={this.toggle}

                      >
                        <i class={`fa fa-times mx-2`}></i>
                      </Button>

                        <Button
                                onClick={this.cropHandleSubmit}
                                theme="info"
                                className="mb-2 mr-1 btn btn-success"
                                style={{ fontSize: 16, color: "#fff" }}
                                // disabled={this.state.Latitude !== "" ? false : true}
                              >
                                <i class={`fa fa-check mx-2`}></i>
                                {t('save')}
                        </Button>
                            
                          </div>
                   
                    </ModalHeader>
                    <ModalBody>
                      <div
                        style={{
                          display: "flex",
                          marginTop: "20px",
                          flexWrap: "wrap"
                        }}
                      >
                        <FieldCropForm
                          handleCropType={this.handleCropType}
                          handlePrevType={this.handlePrevType}
                          handleGGD={this.handleGGD}
                          handleUidField={this.handleUidField}
                          handleZone={this.handleZone}
                          handleDate={this.handleDate}
                          // zone={this.state.zone}
                          cropType={this.state.cropType}
                          // previous_type={this.state.previous_type}
                          zones={this.state.zonesData}
                          fields={this.state.farmsData}
                          startDate={this.state.startDate}
                          endDate={this.state.endDate}
                          onChange={value => console.log(value)}
                          saved={this.state.cropsCardSave}
                          typeError={this.state.typeError}
                          handleDays={this.handleDays}
                          handleCropVariety={this.handleCropVariety}
                          handlePlantingDate={this.handlePlantingDate}
                          handleGrowingDate={this.handleGrowingDate}
                          handleRootDepth={this.handleRootDepth}
                          handleRuPractical={this.handleRuPractical}
                          ruPratique={this.state.ruPratique}
                          cropVariety={this.state.cropVariety}
                          days={this.state.days}
                          plantingDate={this.state.plantingDate}
                          growingDate={this.state.growingDate}
                          rootDepth={this.state.rootDepth}
                          denisty={this.state.density}
                          ecartInter={this.state.ecartInter}
                          ecartIntra={this.state.ecartIntra}
                          handleCropDensity={this.handleCropDensity}
                          handleEcartInter={this.handleEcartInter}
                          handleEcartIntra={this.handleEcartIntra}
                        />
                      </div>
                   
                    </ModalBody>
                  </Modal>
            </div>
          )
        case 'irrig':
          return (
            <div>
              <Card small className="h-100">
                <CardHeader className="border-bottom">
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center"
                    }}
                  >
                    <h6 className="m-0">{t('Irrigation_info')}</h6>{" "}
                  </div>
                </CardHeader>
                <CardBody className="pt-0">
                <Row noGutters className="page-header py-4">
                    <PageTitle
                      sm="4"
                      title={t('my_irrigations')}
                      className="text-sm-left"
                    />
                  </Row>
                  <Row className="px-2">

                    <IrrigationList
                      irrigationsList={this.state.irrigationsData}
                      Irrigations={this.getDataIrrigations}
                      Crops={this.state.cropsData}
                      Zones={this.state.zonesData}
                    />
                  </Row>
                  {/* <div className="d-flex justify-content-center align-items-center">
                    <Button theme="success" className="rounded-circle" style={{ height: 60, width: 60 }} onClick={this.toggle} title={`${t('add_crop')}`}>
                      <i className="material-icons" style={{ fontSize: 36, display: "flex", justifyContent: "center", alignItems: "center" }}>&#xe145;</i>
                    </Button>

                  </div> */}
                </CardBody>
              </Card>
                  <Modal size='lg' centered={true} open={this.state.open} toggle={this.toggle}>
                    <ModalHeader>
                    <div
                            style={{
                              display: "flex",
                              justifyContent: "flexStart",
                              alignItems: "center"
                            }}
                          >

                          <Button
                              // theme="success"
                              className="mb-2 mr-1 btn btn-danger"
                              onClick={this.toggle}

                            >
                              <i class={`fa fa-times mx-2`}></i>
                            </Button>
                            <Button
                                      onClick={this.IrrigHandleSubmit}
                                      theme="info"
                                      className="mb-2 mr-1 btn btn-success"
                                      style={{ fontSize: 16, color: "#fff" }}
                                      // disabled={this.state.Latitude !== "" ? false : true}
                                    >
                                      <i class={`fa fa-check mx-2`}></i>
                                      {t('save')}
                              </Button>
                      
                            
                          </div>
                    </ModalHeader>
                    <ModalBody>

                      <div
                        style={{
                          display: "flex",
                          marginTop: "20px",
                          flexWrap: "wrap"
                        }}
                      >
                        <FieldIrrigationForm
                          handleType={this.handleIrrigType}
                          handleZone={this.handleIrrigZone}
                          handleCrop={this.handleCrop}
                          handleIrrigAlrd={this.handleIrrigAlrd}
                          handleFlowrate={this.handleFlowrate}
                          handleName={this.handleName}
                          handleIrrgSyst={this.handleIrrgSyst}
                          handleRunTime={this.handleRunTime}
                          handlePivotCoord={this.handlePivotCoord}
                          handlePivotLength={this.handlePivotLength}
                          handlePivotShape={this.handlePivotShape}
                          handleLateral={this.handleLateral}
                          zones={this.state.zonesData}
                          crops={this.state.cropsData}
                          Type={this.state.irrigType}
                          flowrate={this.state.flowrate}
                          name={this.state.name}
                          irrigation_syst={this.state.irrigation_syst}
                          pivot_coord={this.state.pivot_coord}
                          pivot_length={this.state.pivot_length}
                          pivot_shape={this.state.pivot_shape}
                          irrigated_already={this.state.irrigated_already}
                          full_runtime={this.state.full_runtime}
                          lateral={this.state.lateral}
                          onChange={value => console.log(value)}
                          saved={this.state.irrigationCardSave}
                          typeErrorIrrig={this.state.typeErrorIrrig}
                          drippers={this.state.drippers}
                          drippersSpacing={this.state.drippersSpacing}
                          handleDrippers={this.handleDrippers}
                          handleDrippersSpacing={this.handleDrippersSpacing}
                          handleEffIrrig={this.handleEffIrrig}
                          effIrrig={this.state.effIrrig}
                          handlePumpFlow={this.handlePumpFlow}
                          pumpFlow={this.state.pumpFlow}
                          handlePumpType={this.handlePumpType}
                          pumpType={this.state.pumpType}
                          linesNumber={this.state.linesNumber}
                        />
                      </div>
                     
                    </ModalBody>
                  </Modal>
            </div>
          )
        default:
          return (
            <div>
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
                    <div>
                      <h6 className="m-0" style={{ textAlign: "left" }}>{t("field_setup")}</h6>{" "}
                    </div>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "flex-end"
                    }}
                  >
                    <Button
                      onClick={this.handleSubmit}
                      // theme="success"
                      className="mb-2 mr-1 btn btn-success"
                    >
                      <i class={`fa fa-check mx-2`}></i>
                      {t('save')}
                    </Button>
                    <Button
                      onClick={this.resetForm}
                      // theme="success"
                      className="mb-2 mr-1 btn btn-danger"
                    >
                      <i class={`fa fa-times mx-2`}></i>
                      {t('cancel')}
                    </Button>
                  </div>
                </CardHeader>
                <CardBody className="pt-0">
                  <Row noGutters className="page-header py-4">
                    <PageTitle
                      sm="4"
                      title={t('my_fields')}
                      className="text-sm-left"
                    />
                  </Row>
                  <Row>
                    <Col lg="12" md="12" sm="12" className="mb-4">
                      <Card small>
                        <CardHeader>{t('active_fields')}</CardHeader>
                        <CardBody>
                          <FieldList
                            Fields={this.getDataFields}
                            FieldsList={this.state.farmsData}
                          />
                        </CardBody>
                      </Card>
                    </Col>
                  </Row>
                  <div
                    style={{
                      display: "flex",
                      marginTop: "20px",
                      flexWrap: "wrap"
                    }}
                  >
                    <FieldSetupForm
                      handleDescription={this.handleDescription}
                      handleName={this.handleName}
                      handleUidFarm={this.handleUidFarm}
                      onChange={value => console.log(value)}
                      saved={this.state.setupCardSave}
                      nameError={this.state.nameError}
                      farmError={this.state.farmError}

                    />
                  </div>
                </CardBody>
              </Card>
            </div>
          )
      }
    }
    return (
      <Container fluid className="main-content-container px-4">
        {/* Page Header */}
        {/* <Row noGutters className="page-header py-4">
          <PageTitle
            sm="4"
            title={t("add_field")}
            className="text-sm-left"
          />
        </Row> */}

        <Row>
          <Col lg="12" md="12" sm="12" className="mb-4">
            <div className={`mb-0 alert alert-${this.state.classMsg} fade ${this.state.displayMsg}`}>
              <i class={`fa fa-${this.state.iconMsg} mx-2`}></i> {t(this.state.msgServer)}
            </div>
            <Row className=' d-flex justify-content-center align-items-center py-2'>
              <Col lg='12' md='12' sm='12'>
                <Nav tabs style={{ paddingBottom: 10 }}>
                  <NavItem>
                    <NavLink id="field" onClick={(e) => this.setState({ elemValue: e.target.id })} className={`${this.state.elemValue === "field" ? "bg-info rounded text-dark " : 'rounded text-dark '}`} href="#">
                      {t('field_setup')}
                    </NavLink>
                  </NavItem>
                  <NavItem>
                    <NavLink id="soil" onClick={(e) => this.setState({ elemValue: e.target.id })} className={`${this.state.elemValue === "soil" ? "bg-info rounded text-dark " : 'rounded text-dark'}`} href="#">
                      {t('soil_info')}
                    </NavLink>
                  </NavItem>
                  <NavItem>
                    <NavLink id="crop" onClick={(e) => this.setState({ elemValue: e.target.id })} className={`${this.state.elemValue === "crop" ? "bg-info rounded text-dark " : 'rounded text-dark'}`} href="#">{t('crop_info')}</NavLink>
                  </NavItem>
                  <NavItem>
                    <NavLink id="irrig" onClick={(e) => this.setState({ elemValue: e.target.id })} className={`${this.state.elemValue === "irrig" ? "bg-info rounded text-dark" : 'rounded text-dark'}`} href="#">{t('Irrigation_info')}</NavLink>
                  </NavItem>
                </Nav>

              </Col>

            </Row>
            {renderAddSetup()}
          </Col>
        </Row>
        {/* <Row>
          <Col lg="12" md="12" sm="12" className="mb-4">
 
              <LeafletMap _onCreated={this._onCreated} fields={this.state.farmsData} data={this.state.farms} draw={this.state.draw} edit={this.state.edit} zoom={this.state.zoom} center={this.state.center} fromAction={this.state.fromAction} />
 
          </Col>
        </Row> */}
      </Container>
    );
  }
}

export default withTranslation()(AddField);
