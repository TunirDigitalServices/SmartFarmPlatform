import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import api from '../api/api'
import { Container, Card, Row, Col, Nav, Button, Form, FormControl, FormSelect } from 'react-bootstrap'
import PageTitle from '../components/common/PageTitle'
import { useTranslation } from "react-i18next";
import FieldList from '../views/FieldList'
import CropList from '../views/CropList'
import ZoneList from '../views/ZoneList'
import IrrigationList from '../views/IrrigationList'
import swal from 'sweetalert'
import DripForm from '../components/FieldSettingForms/dripForm'
import PivotForm from '../components/FieldSettingForms/pivotForm'
import LateralForm from '../components/FieldSettingForms/lateralForm'
import CompositeSoil from '../components/FieldSettingForms/compositeSoilForm'
import LeafletMap from '../views/map'


const FieldsList = () => {

  const { t, i18n } = useTranslation();

  const [toggle, setToggle] = useState(false);
  const [coords, setCoords] = useState({
    Latitude: "",
    Longitude: "",
    zoom: "",
    center: [],
    fromAction: false
  })
  const [layerType, setLayerType] = useState('')
  const [layer, setLayer] = useState('')
  const [configMap, setConfigMap] = useState({
    draw: {
      polygon: false,
      circle: false,
      rectangle: false,
      polyline: true,
      marker: true,
      circlemarker: false,
    },
    edit: {
      delete: false,
      edit: false
    }
  })
  const params = useParams();
  const [fields, setFields] = useState([]);
  const [listSoil, setListSoil] = useState([])
  const [listCrop, setListCrop] = useState([])
  const [allVarieties, setAllVarieties] = useState([])
  const [listIrrigations, setListIrrigations] = useState([])

  const [crops, setCrops] = useState([]);
  const [zones, setZones] = useState([]);
  const [irrigations, setIrrig] = useState([]);
  const [farms, setFarms] = useState([])
  let Uid = params.uid;
  const [elemValue, setView] = useState('field')
  const [dataField, setDataField] = useState({
    name: "",
    farm_uid: "",
    description: "",
    Latitude: "",
    Longitude: ""
  })
  const [errors, setErrors] = useState({
    farmError: "",
    nameError: ""
  })

  const [checked, setChecked] = useState(false)
  const [cropData, setCropData] = useState({
    field_uid: "",
    zone_uid: "",
    cropType: "",
    variety: '',
    cropVariety: [],
    Profondeur: "",
    days: "",
    plantingDate: "",
    growingDate: "",
    rootDepth: "",
    ecartInter: "",
    ecartIntra: "",
    density: "",
    ruPratique: "",
    kcList: []
  })
  const [soilData, setSoilData] = useState({
    field_uid: "",
    zone_uid: "",
    zoneName: "",
    source: "1",
    soilProperty: "",
    soilType: "",
    RUmax: "",
    effPluie: "",
  })
  const [isStandardSoil, setSoilType] = useState(true);

  const [irrigData, setIrrigData] = useState({
    irrigType: "",
    zone_uid: "",
    crop_uid: "",
    flowrate: "",
    irrigated_already: "",
    name: "",
    pivot_shape: "",
    irrigation_syst: "",
    pivot_length: "",
    pivot_coord: "",
    full_runtime: "",
    lateral: "",
    drippers: "",
    effIrrig: "",
    pumpFlow: "",
    linesNumber: ""
  })

  console.log(irrigations, "irrigations");

  const getFieldsByUser = async () => {
    let url = `/admin/user/${Uid}/fields`;
    await api.get(url)
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

  const getZones = () => {
    let Zones = [];
    farms.map(item => {
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
                field_id: i.field_id

              });
            });
          };
        });
      };
    })
    setZones(Zones)
  }

  const getCrops = () => {
    let Crops = [];
    farms.map(item => {
      let fields = item.fields;
      if (fields) {
        fields.map(itemCrop => {
          let crops = itemCrop.crops;
          if (crops) {
            crops.map(i => {
              Crops.push({
                type: i.type,
                Uid: i.uid,
                irrigations: i.irrigations,
                Id: i.id,
                field_id: i.field_id,
                zone_id: i.zone_id,
                croptype_id: i.croptype_id,
                croptype: i.croptypes
              });
            });
          };
        });
      };
    })
    setCrops(Crops)
  }

  const getIrrig = () => {
    let Irrigations = [];

    farms.map(item => {
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
    })
    console.log(farms, "------------farms from irrig");

    setIrrig(Irrigations)
  }


  useEffect(() => {
    getFieldsByUser();
    const getCropType = async () => {
      try {
        await api.get('/croptype/list-crop')
          .then(response => {
            if (response) {
              let dataCrop = response.data.Croptype
              setListCrop(dataCrop)
            }
          })

      } catch (error) {
        console.log(error)
      }
    }
    const getSoils = async () => {
      try {
        await api.get('/soils/get-soils')
          .then(response => {
            let listSoils = response.data.Soils
            setListSoil(listSoils)

          }).catch(error => {
            console.log(error)
          })

      } catch (error) {
        console.log(error)
      }
    }
    const getIrrigations = async () => {
      try {
        await api.get('/irrigations/get-irrigations')
          .then(response => {
            if (response) {
              let dataIrrig = response.data.Irrigations
              console.log(dataIrrig, "dataIrrig");

              setListIrrigations(dataIrrig)
            }
          })

      } catch (error) {
        console.log(error)
      }
    }
    const getVarieties = async () => {
      try {
        await api.get('/varieties/get-varieties')
          .then(response => {
            if (response.data.type === "success") {
              let listVarieties = response.data.Varieties
              setAllVarieties(listVarieties)

            }
          }).catch(error => {
            console.log(error)
          })

      } catch (error) {
        console.log(error)
      }
    }
    getVarieties()
    getIrrigations()
    getSoils()
    getCropType()
  }, [])

  useEffect(() => {
    getFields();
    getCrops();
    getZones();
    getIrrig();
    console.log(farms, "farrms");

  }, [farms])



  const handleName = (e) => {

  };
  const handleUidFarm = (e) => {
    setDataField({
      farm_uid: e.target.value,
    });
  };

  const handleDescription = (e) => {
    setDataField({
      description: e.target.value,
    });
  };

  const validate = () => {
    let nameError = '';
    let farmError = '';
    if (!dataField.name) {
      nameError = 'not_empty';
      setErrors({ ...errors, nameError: nameError })
      return false
    } else {
      setErrors({ nameError: "" })
    }
    if (dataField.farm_uid == '') {
      farmError = 'not_empty';
      setErrors({ farmError })
      return false
    }
    if (dataField.farm_uid) {
      setErrors({ farmError: "" })
    }
    return true;
  };

  const _onCreated = e => {
    let type = e.layerType;
    setLayerType(type)
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
        setLayer(JSON.stringify(Coordinates))
    } else {
      setCoords({ Latitude: layer.getLatLng().lat, Longitude: layer.getLatLng().lng });
    }

  };

  const addField = () => {

    let data = {
      name: dataField.name,
      description: dataField.description,
      farmName: dataField.farmName,
      farm_uid: dataField.farm_uid,
      Latitude: coords.Latitude,
      Longitude: coords.Longitude
    }

    api.post('/field/add-field', data)
      .then(res => {

        if (res.data.type && res.data.type == "danger") {
          swal(`Error`, {
            icon: "error",
          });
        }
        if (res.data.type && res.data.type == "success") {
          swal(`${t('field_added')}`, {
            icon: "success",
          });
          getFieldsByUser()
        }

      })
      .catch(() => {
        swal(`Error`, {
          icon: "error",
        });

      });
  }
  const handleSubmit = (event) => {
    event.preventDefault()

    // const isValid = validate();
    // if (isValid) {
    addField()
    // }
  }
  const resetForm = () => {
    setDataField({
      name: "",
      description: "",
      farm_uid: ""
    });
  };

  const cropHandleSubmit = (event) => {
    event.preventDefault()
    addCrop()
  }


  const addCrop = () => {

    let data = {
      zone_uid: cropData.zone_uid,
      field_uid: cropData.field_uid,
      croptype_id: cropData.cropType,
      previous_type: cropData.previous_type,
      plantingDate: cropData.plantingDate,
      rootDepth: cropData.rootDepth,
      days: cropData.days,
      crop_variety_id: cropData.variety,
      practical_fraction: cropData.ruPratique,
      density: cropData.density,
      ecart_inter: cropData.ecartInter,
      ecart_intra: cropData.ecartIntra,
      growingDate: cropData.growingDate
    }

    api.post('/crop/add-crop', data)
      .then(res => {
        if (res.data.type && res.data.type == "danger") {
          swal(`Error`, {
            icon: "error",
          });
        }
        if (res.data.type && res.data.type == "success") {
          swal(`${t('crop_added')}`, {
            icon: "success",
          });
          getFieldsByUser()
        }
      })
      .catch((err) => {
        swal(`Error`, {
          icon: "error",
        });


      });
  }

  const zoneHandleSubmit = (event) => {
    event.preventDefault()
    addZone()


  }


  const addZone = () => {

    let data = {
      soilProperty: soilData.soilProperty,
      field_uid: soilData.field_uid,
      zone_uid: soilData.zone_uid,
      name: soilData.zoneName,
      source: soilData.source,
      RUmax: soilData.RUmax,
      effPluie: soilData.effPluie,
    }
    api.post('/zone/add-zone', data)
      .then(res => {

        if (res.data.type && res.data.type == "danger") {
          swal(`Error`, {
            icon: "error",
          });
        }
        if (res.data.type && res.data.type == "success") {
          swal(`${t('soil_added')}`, {
            icon: "success",
          });
          getFieldsByUser()
        }
      })
      .catch((err) => {
        swal(`Error`, {
          icon: "error",
        });


      });
  }

  const IrrigHandleSubmit = (event) => {
    event.preventDefault()

    addIrrigation()



  }




  const addIrrigation = () => {

    let data = {
      type: irrigData.irrigType,
      zone_uid: irrigData.zone_uid,
      crop_uid: irrigData.crop_uid,
      flowrate: irrigData.flowrate,
      irrigated_already: irrigData.irrigated_already,
      name: irrigData.name,
      pivot_shape: irrigData.pivot_shape,
      irrigation_syst: irrigData.irrigation_syst,
      pivot_length: irrigData.pivot_length,
      pivot_coord: irrigData.pivot_coord,
      full_runtime: irrigData.full_runtime,
      lateral: irrigData.lateral,
      drippers: irrigData.drippers,
      effIrrig: irrigData.effIrrig,
      pumpFlow: irrigData.pumpFlow,
      lines_number: irrigData.linesNumber
    }


    api.post('/irrigation/add-irrigation', data)
      .then(res => {

        if (res.data.type && res.data.type == "danger") {
          swal(`Error`, {
            icon: "error",
          });
        }
        if (res.data.type && res.data.type == "success") {
          swal(`${t('irrigation_added')}`, {
            icon: "success",
          });
          getFieldsByUser()
        }
      })
      .catch((err) => {

        swal(`Error`, {
          icon: "error",
        });

      });
  }




  const handleSoilPick = (e) => {
    e.preventDefault()
    const soilType = listSoil.find(
      (soil) => soil.soil == e.target.value
    );

    if (typeof soilType !== "undefined") {
      setSoilData({
        ...soilData,
        soilType: soilType.soil,
        RUmax: soilType.ru,
        effPluie: soilType.rain_eff
      });

    }
  };
  const handleCropPick = (e) => {
    e.preventDefault()
    // props.handleCropType(e)

    const crop = listCrop.find(
      (crop) => crop.id == e.target.value
    );
    if (e.target.value !== '') {
      setCropData({ ...cropData, cropType: crop.id })
      setCropData({ ...cropData, ruPratique: crop.practical_fraction })
      setCropData({ ...cropData, days: crop.total })
      setCropData({ ...cropData, rootDepth: crop.root_max })
      setCropData({ ...cropData, plantingDate: crop.plant_date.slice(0, 11).replace('T', '') })

    }
    let varieties = []
    if (crop) {
      const variety = allVarieties.map((variety) => {
        if (variety.crop_id === crop.id) {
          varieties.push({
            varietyId: variety.id,
            variety: variety.crop_variety
          })
        }
      });

      setCropData({
        ...cropData,
        cropType: crop.id,
        variety: crop.crop_variety,
        cropVariety: varieties,
        rootDepth: crop.root_max,
        ruPratique: crop.practical_fraction,
        days: crop.total,
        plantingDate: crop.plant_date.slice(0, 11).replace('T', ''),
        kcList: crop.all_kc
      });


    }
  };
  const handleVarietyPick = (e) => {
    e.preventDefault();
    const variety = allVarieties.find(

      (variety) => variety.id == e.target.value

    )

    if (variety) {
      setCropData({
        ...cropData,
        variety: variety.id,

      });
    }
  };
  const [soilCompos, setSoilCompos] = useState({
    clay: "",
    sand: "",
    silt: ""

  })
  const soilTypeForm = () => {
    if (isStandardSoil == true)
      return (
        null

      );
    else {
      return (
        <CompositeSoil />
      );
    }
  };

  const handleIrrigPick = (e) => {
    e.preventDefault();
    const irrigation = listIrrigations.find((irrigation) => {
      return irrigation.irrigation == e.target.value

    })
    //  setIM(irrigation.irrigation)
    setIrrigData({ irrigType: irrigation.irrigation })
    // props.handleEffIrrig(irrigation.effIrrig)

    if (irrigation) {
      setIrrigData({
        ...irrigData,
        irrigType: irrigation.irrigation,
        effIrrig: irrigation.effIrrig
      });
    }
  };


  const irrigationMethodForm = () => {
    switch (irrigData.irrigType) {
      case `${t('Pivot')}`:
        return <PivotForm
          handleFlowRate={(e) => setIrrigData({ ...irrigData, flowrate: e.target.value })}
          handleIrrgSyst={(e) => setIrrigData({ ...irrigData, irrigation_syst: e.target.value })}
          handleRunTime={(e) => setIrrigData({ ...irrigData, full_runtime: e.target.value })}
          handlePivotCoord={(e) => setIrrigData({ ...irrigData, pivot_coord: e.target.value })}
          handlePivotLength={(e) => setIrrigData({ ...irrigData, pivot_length: e.target.value })}
          handlePivotShape={(e) => setIrrigData({ ...irrigData, pivot_shape: e.target.value })}
          irrigation_syst={irrigData.irrigation_syst}
          pivot_coord={irrigData.pivot_coord}
          pivot_length={irrigData.pivot_length}
          pivot_shape={irrigData.pivot_shape}
          full_runtime={irrigData.full_runtime}
          flowrate={irrigData.flowrate}
          name={irrigData.name}
        />;
      case `${t('Lateral')}`:
        return <LateralForm
          handleLateral={(e) => setIrrigData({ ...irrigData, lateral: e.target.value })}
          handlePivotLength={(e) => setIrrigData({ ...irrigData, pivot_length: e.target.value })}
          handleRunTime={(e) => setIrrigData({ ...irrigData, full_runtime: e.target.value })}
          handleName={(e) => setIrrigData({ ...irrigData, name: e.target.value })}
          handleFlowRate={(e) => setIrrigData({ ...irrigData, flowrate: e.target.value })}
          full_runtime={irrigData.full_runtime}
          flowrate={irrigData.flowrate}
          name={irrigData.name}
          pivot_length={irrigData.pivot_length}
          lateral={irrigData.lateral}
        />;
      case `${t('None')}`:
        return null;
      default:
        return (
          <DripForm
            handleDrippers={(e) => setIrrigData({ ...irrigData, drippers: e.target.value })}
            handleIrrigAlrd={(e) => setIrrigData({ ...irrigData, irrigated_already: e.target.value })}
            handleFlowRate={(e) => setIrrigData({ ...irrigData, flowrate: e.target.value })}
            flowrate={irrigData.flowrate}
            drippers={irrigData.drippers}
            irrigated_already={irrigData.irrigated_already}
          />
        );
    }
  };
  useEffect(() => {
    if (cropData.ecartInter !== "" && cropData.ecartIntra !== "") {

      let formule = 10000 / (Number(cropData.ecartInter) * Number(cropData.ecartIntra))
      setCropData({ ...cropData, density: formule })
    }
  }, [cropData.ecartInter, cropData.ecartIntra])
  const renderAddSetup = () => {
    switch (elemValue) {
      case 'field':
        return (
          <div>
            <Card small className="h-100">
              <Card.Header className="border-bottom ">
                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-start",
                    alignItems: "center",
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
                    justifyContent: "flex-end",
                    gap: "10px"
                  }}
                >
                  <Button
                    onClick={handleSubmit}
                    theme="info"
                    className="mb-2 mr-1 btn btn-success"
                  >
                    <i class={`fa fa-check mx-2`}></i>
                    {t('save')}
                  </Button>
                  <Button
                    onClick={resetForm}
                    // theme="success"
                    className="mb-2 mr-1 btn btn-danger"
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
                    flexWrap: "wrap"
                  }}
                >
                  <Col lg="6" sm="12" md="6">
                    <Form>
                      <Row className='gap-2'>
                        <Col lg='5' md="6" sm='6' className="form-group">
                          <p style={{ margin: "0px", textAlign: "left" }}>{t('name_field')}</p>
                          <FormControl
                            value={dataField.name}
                            placeholder={t('name_field')}
                            className={errors.nameError == '' ? '' : 'is-invalid'}
                            required
                            onChange={e => setDataField({ ...dataField, name: e.target.value, })}
                          />


                          <div className="invalid-feedback" style={{ textAlign: "left" }}>{errors.nameError}</div>
                        </Col>
                        <Col lg='6' md="6" sm='6' className="form-group">
                          <p style={{ margin: "0px", textAlign: "left" }}>{t('name_farm')}</p>
                          <FormSelect
                            value={dataField.farm_uid}
                            style={{ height: "35px" }}
                            className={errors.farmError == '' ? '' : 'is-invalid'}
                            required
                            onChange={e => setDataField({ ...dataField, farm_uid: e.target.value, })}
                          >
                            <option value="">{t('select_farm')}</option>;
                            {farms.map((item, index) => {
                              return <option value={item.uid}>{item.name}</option>;
                            })}
                          </FormSelect>
                        </Col>
                      </Row>
                      {/* <Row>

                        <Col lg='12' md="6" sm='6'>
                        <Form.Group>
                          <p style={{ margin: "0px",textAlign: "left" }}>{t('desc')}</p>
                          <textarea
                            value={dataField.description}
                            onChange={e => setDataField({...dataField ,  description: e.target.value,})}
                            style={{ height: "220px" }}
                            class="form-control"
                            placeholder="Description"
                          ></textarea>
                        </Form.Group>
                        </Col>
                        </Row> */}
                    </Form>
                  </Col>

                </div>
                <Row noGutters className="page-header py-4">
                  <PageTitle
                    sm="4"
                    title={t('my_fields')}
                    subtitle={t('my_fields')}
                    className="text-sm-left"
                  />
                </Row>
                <Row className='px-2'>
                  <FieldList
                    Fields={getFieldsByUser}
                    FieldsList={fields}
                    Uid={Uid}
                  />
                </Row>

              </Card.Body>
            </Card>
          </div>
        )
      case 'soil':
        return (
          <div style={{ position: "relative" }}>
            <Card small className="h-100">
              <Card.Header className="border-bottom">
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                  }}
                >
                  <h6 className="m-0">{t('soil_info')}</h6>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "flex-end",
                      gap: "10px"
                    }}
                  >
                    <Button
                      onClick={zoneHandleSubmit}
                      theme="info"
                      className="mb-2 mr-1 btn btn-success"
                    >
                      <i class={`fa fa-check mx-2`}></i>
                      {t('save')}
                    </Button>
                    <Button
                      onClick={""}
                      // theme="success"
                      className="mb-2 mr-1 btn btn-danger"
                    >
                      <i class={`fa fa-times mx-2`}></i>
                      {t('cancel')}
                    </Button>
                  </div>
                </div>
              </Card.Header>
              <Card.Body className="pt-0">
                <div
                  style={{
                    display: "flex",
                    marginTop: "20px",
                    flexWrap: "wrap"
                  }}
                >
                  <Col lg="12" sm="12" md="6">
                    <Form>
                      <Row form className='gap-2'>
                        <Col lg='3' md="12" sm="12" className="form-group">
                          <p style={{ margin: "0px" }}>{t('soil_zone')}</p>
                          <FormControl
                            value={soilData.zoneName}
                            placeholder={t('soil_zone')}
                            required
                            style={{ height: "35px" }}
                            onChange={e => setSoilData({ ...soilData, zoneName: e.target.value })}

                          />
                        </Col>

                        <Col lg='3' md="12" sm="12" className="form-group">
                          <p style={{ margin: "0px" }}>{t('name_field')}</p>
                          <FormSelect
                            value={soilData.field_uid}
                            style={{ height: "35px" }}
                            onChange={e => setSoilData({ ...soilData, field_uid: e.target.value })}
                            placeholder={t('name_field')}
                          >
                            <option value="">{t('select_field')}</option>
                            {fields.map((item, index) => {
                              return <option value={item.Uid}>{item.title}</option>;
                            })}
                          </FormSelect>
                        </Col>

                        <Col lg='3' md="12" sm="12" className="form-group">
                          <p style={{ margin: "0px" }}>{t('source')}</p>
                          <FormSelect
                            style={{ height: "35px" }}
                            value={soilData.source}
                            onChange={e => setSoilData({ ...soilData, source: e.target.value })}
                          >
                            <option value="1" >Manual</option>
                          </FormSelect>

                        </Col>

                        <Col lg='2' md="12" sm="12" className="form-group">
                          <p style={{ margin: "0px" }}>{t('soil_prop')}</p>
                          <FormSelect
                            style={{ height: "35px" }}
                            onChange={evt => {

                              setSoilType(!isStandardSoil);

                            }}
                          >
                            <option selected={isStandardSoil}>Standard</option>
                            <option selected={!isStandardSoil}>Composite</option>
                          </FormSelect>
                        </Col>
                        {soilTypeForm()}
                      </Row>
                      <Row form className='gap-2'>
                        <Col lg='4' md="12" sm="12" className="form-group">
                          <div>
                            <p style={{ margin: "0px" }}>{t('soil_type')}</p>
                            <FormSelect
                              value={soilData.soilType}
                              onChange={handleSoilPick}
                              style={{ height: "35px" }}
                            >
                              <option value="">{t('select_soil')}</option>
                              {
                                listSoil.map((item, index) => {
                                  return <option value={item.soil} >{item.soil}</option>;

                                })
                              }
                            </FormSelect>
                          </div>
                        </Col>
                        <Col lg="4" md="8" sm="8">
                          <Form.Group>
                            <p style={{ margin: "0px" }}>{t('efficacité_pluie')} (%)</p>
                            <FormControl type="number" style={{ height: "35px" }} value={soilData.effPluie} onChange={e => setSoilData({ ...soilData, effPluie: e.target.value })} id='effPluie' placeholder={t('efficacité_pluie')}
                            />

                          </Form.Group>
                        </Col>
                        <Col lg="3" md="8" sm="8">
                          <Form.Group>
                            <p style={{ margin: "0px" }}>RU max (mm/m)</p>
                            <FormControl type="number" value={soilData.RUmax} style={{ height: "35px" }} onChange={e => setSoilData({ ...soilData, RUmax: e.target.value })} id='ruMax' placeholder="RU max"
                            />

                          </Form.Group>

                        </Col>
                      </Row>
                    </Form>
                  </Col>
                </div>
                <Row noGutters className="page-header py-4">
                  <PageTitle
                    sm="4"
                    title={t('my_zones')}
                    subtitle={t('my_zones')}
                    className="text-sm-left"
                  />
                </Row>
                <Row className="px-2">

                  <ZoneList
                    zonesList={zones}
                    Zones={getFieldsByUser}
                    Fields={fields}
                    // state={this.dataChange}
                    listSoils={listSoil}

                  />


                </Row>

              </Card.Body>
            </Card>
          </div>
        )
      case 'crop':
        return (
          <div>
            <Card small className="h-100">
              <Card.Header className="border-bottom">
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                  }}
                >
                  <h6 className="m-0">{t('crop_info')}</h6>{" "}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "flex-end",
                      gap:"10px"
                    }}
                  >
                    <Button
                      onClick={cropHandleSubmit}
                      theme="info"
                      className="mb-2 mr-1 btn btn-success"
                    >
                      <i class={`fa fa-check mx-2`}></i>
                      {t('save')}
                    </Button>
                    <Button
                      onClick={""}
                      // theme="success"
                      className="mb-2 mr-1 btn btn-danger"
                    >
                      <i class={`fa fa-times mx-2`}></i>
                      {t('cancel')}
                    </Button>
                  </div>
                </div>
              </Card.Header>
              <Card.Body className="pt-0">
                <div
                  style={{
                    display: "flex",
                    marginTop: "20px",
                    flexWrap: "wrap"
                  }}
                >
                  <Col lg="12" sm="12" md="6">
                    <Form>
                      <Row form className='gap-2'>
                        <Col lg='6' md="12" sm="12" className="form-group">
                          <p style={{ margin: "0px" }}>{t('crop_zone')}</p>
                          <FormSelect
                            value={cropData.zone_uid}
                            onChange={e => setCropData({ ...cropData, zone_uid: e.target.value })}
                            placeholder={t('crop_zone')}
                          >
                            <option>{t('select_zone')}</option>

                            {
                              zones.map(soil => {
                                return <option value={soil.Uid}>{soil.name}</option>

                              })
                            }

                          </FormSelect>
                        </Col>
                        <Col lg='5' md="12" sm="12" className="form-group">
                          <p style={{ margin: "0px" }}>{t('crop_field')}</p>
                          <FormSelect
                            value={cropData.field_uid}
                            onChange={e => setCropData({ ...cropData, field_uid: e.target.value })}
                            placeholder={t('crop_zone')}
                          >
                            <option>{t('select_field')}</option>
                            {
                              fields.map(field => {
                                return <option value={field.Uid}>{field.title}</option>

                              })
                            }
                          </FormSelect>
                        </Col>
                      </Row>
                      <Row form className='gap-2'>
                        <Col lg='6' md="12" sm="12" className="form-group">
                          <p style={{ margin: "0px" }}>{t('crop_type')}</p>
                          <FormSelect
                            onChange={handleCropPick}
                            placeholder={t('crop_type')}
                            value={cropData.cropType}
                          >
                            <option value="">Select Crop</option>
                            {
                              listCrop.map(crop => {
                                return (
                                  <option value={crop.id}>{crop.crop}</option>

                                )
                              })
                            }
                          </FormSelect>
                        </Col>
                        <Col lg="5" md="8" sm="8">
                          <Form.Group>
                            <p style={{ margin: "0px" }}>{t('crop_variety')}</p>
                            <FormSelect value={cropData.variety} onChange={handleVarietyPick} id="cropVariety">
                              <option value="">{t('crop_variety')}</option>
                              {
                                cropData.cropVariety.map(variety => (
                                  <option value={variety.varietyId}>{variety.variety}</option>
                                ))
                              }
                            </FormSelect>
                            <input type="checkbox" name="Autre" id="check" onClick={() => setChecked(!checked)} /> {t('other')}
                            {
                              checked
                                ?

                                <FormControl
                                  value={cropData.variety || ""}
                                  placeholder={t('crop_variety')}
                                  id="cropVariety"
                                  onChange={e => setCropData({ ...cropData, variety: e.target.value })}
                                />

                                :
                                null
                            }

                          </Form.Group>

                        </Col>
                      </Row>
                      <Row form className='gap-2'>
                        <Col lg="4" md="8" sm="8">
                          <Form.Group>
                            <p style={{ margin: "0px" }}>{t('depth')} (m)</p>
                            <FormControl type="number" value={cropData.rootDepth} onChange={e => setCropData({ ...cropData, rootDepth: e.target.value })} id='z' placeholder={t('depth')}
                            />

                          </Form.Group>

                        </Col>
                        <Col lg="4" md="8" sm="8">
                          <Form.Group>
                            <p style={{ margin: "0px" }}>{t('Days')}</p>

                            <FormControl type="number" value={cropData.days} id='days' onChange={e => setCropData({ ...cropData, days: e.target.value })} placeholder={t('Days')} />

                          </Form.Group>

                        </Col>
                        <Col lg="3" md="12" sm="12">
                          <Form.Group>
                            <p style={{ margin: "0px" }}>{t('planting_date')}</p>
                            <FormControl type="date" value={cropData.growingDate} onChange={e => setCropData({ ...cropData, growingDate: e.target.value })} id='planting_date' />

                          </Form.Group>

                        </Col>
                        <Col hidden lg="4" md="8" sm="8">
                          <Form.Group>
                            <p style={{ margin: "0px" }}>{t('growing_season')}</p>
                            <FormControl type="date" value={cropData.plantingDate} onChange={e => setCropData({ ...cropData, plantingDate: e.target.value })} id='days' />

                          </Form.Group>

                        </Col>
                        <Col lg="4" md="8" sm="8">
                          <Form.Group>
                            <p style={{ margin: "0px" }}>{t('fraction_pratique')} (%) </p>
                            <FormControl type="number" value={cropData.ruPratique} onChange={e => setCropData({ ...cropData, ruPratique: e.target.value })} id='ruPratique' placeholder={t('fraction_pratique')}
                            />
                          </Form.Group>

                        </Col>
                        <Col lg="4" md="8" sm="8">
                          <Form.Group>
                            <p style={{ margin: "0px" }}>{t('ecart_inter')} (m)</p>
                            <FormControl type="number" value={cropData.ecartInter} onChange={e => setCropData({ ...cropData, ecartInter: e.target.value })} id='ecartInter' placeholder={t('ecart_inter')}
                            />
                          </Form.Group>

                        </Col>
                        <Col lg="3" md="8" sm="8">
                          <Form.Group>
                            <p style={{ margin: "0px" }}>{t('ecart_intra')} (m) </p>
                            <FormControl type="number" value={cropData.ecartIntra} onChange={e => setCropData({ ...cropData, ecartIntra: e.target.value })} id='ecartIntra' placeholder={t('ecart_intra')}
                            />
                          </Form.Group>

                        </Col>
                        <Col lg="4" md="8" sm="8">
                          <Form.Group>
                            <p style={{ margin: "0px" }}>{t('densité')} (plants/ha)</p>
                            <FormControl type="number" value={cropData.density} onChange={e => setCropData({ ...cropData, density: e.target.value })} id='densité' placeholder={t('densité')}
                            />
                          </Form.Group>

                        </Col>
                      </Row>
                    </Form>
                  </Col>
                </div>
                <Row noGutters className="page-header py-4">
                  <PageTitle
                    sm="4"
                    title={t('my_crops')}
                    subtitle={t('my_crops')}
                    className="text-sm-left"
                  />
                </Row>
                <Row className="px-2">

                  <CropList
                    cropsList={crops}
                    Crops={getFieldsByUser}
                    Fields={fields}
                    Zones={zones}
                  />

                </Row>
              </Card.Body>
            </Card>
          </div>
        )
      case 'irrig':
        return (
          <div>
            <Card small className="h-100">
              <Card.Header className="border-bottom">
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                  }}
                >
                  <h6 className="m-0">{t('Irrigation_info')}</h6>{" "}

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "flex-end",
                      gap:"10px"
                    }}
                  >
                    <Button
                      onClick={IrrigHandleSubmit}
                      theme="info"
                      className="mb-2 mr-1 btn btn-success"
                    >
                      <i class={`fa fa-check mx-2`}></i>
                      {t('save')}
                    </Button>
                    <Button
                      onClick={""}
                      // theme="success"
                      className="mb-2 mr-1 btn btn-danger"
                    >
                      <i class={`fa fa-times mx-2`}></i>
                      {t('cancel')}
                    </Button>
                  </div>
                </div>
              </Card.Header>
              <Card.Body className="pt-0">
                <div
                  style={{
                    display: "flex",
                    marginTop: "20px",
                    flexWrap: "wrap"
                  }}
                >
                  <Col lg="12" sm="12" md="6">
                    <Form>
                      <Row form className='gap-2'>
                        <Col md="4" className="form-group">
                          <p style={{ margin: "0px" }}>{t('irrigation_zone')}</p>
                          <FormSelect
                            value={irrigData.zone_uid}
                            onChange={e => setIrrigData({ ...irrigData, zone_uid: e.target.value })}
                          >
                            <option>{t('select_zone')}</option>
                            {
                              zones.map(soil => {
                                return <option value={soil.Uid} >{soil.name}</option>

                              })
                            }

                          </FormSelect>
                        </Col>
                        <Col md="4" className="form-group">
                          <p style={{ margin: "0px" }}>{t('irrigation_crop')}</p>
                          <FormSelect
                            value={irrigData.crop_uid}
                            onChange={e => setIrrigData({ ...irrigData, crop_uid: e.target.value })}
                          >
                            <option>{t('select_crop')}</option>
                            {
                              crops.map(crop => {
                                let cropType = ""
                                listCrop.map(croptype => {
                                  if (croptype.id === crop.croptype_id) {
                                    cropType = croptype.crop
                                  }
                                })
                                return <option value={crop.Uid} >{cropType}</option>

                              })
                            }
                          </FormSelect>
                        </Col>

                        <Col md="3" className="form-group">
                          <p style={{ margin: "0px" }}>{t('Irrigation_system_type')}</p>
                          <FormSelect
                            value={irrigData.irrigType}
                            onChange={evt => {
                              handleIrrigPick(evt)
                            }}
                          >
                            <option disabled selected value="">{t('select_irriagtion')}</option>
                            {listIrrigations.map(item => {
                              // if (item.value === irrigationMethod) {
                              //   return <option value={item.value} selected={true}>{item.type}</option>;
                              // } else {
                              //   return <option value={item.value} selected={false}>{item.type}</option>;
                              // }
                              return <option value={item.irrigation} >{t(`${item.irrigation}`)}</option>;
                            })}
                          </FormSelect>
                        </Col>
                        <Col lg="4" md="8" sm="8">
                          <Form.Group>
                            <p style={{ margin: "0px" }}>{t('efficience_irrigation')} (%) </p>
                            <FormControl type="number" value={irrigData.effIrrig} onChange={e => setIrrigData({ ...irrigData, effIrrig: e.target.value })} id='effIrrig' placeholder={t('efficience_irrigation')}
                            />

                          </Form.Group>

                        </Col>
                        <Col lg="4" md="8" sm="8">
                          <Form.Group>
                            <p style={{ margin: "0px" }}>{t('nbr_ligne')}</p>
                            <FormControl type='number' value={irrigData.linesNumber} onChange={e => setIrrigData({ ...irrigData, linesNumber: e.target.value })} id='nbr_ligne' placeholder={t('nbr_ligne')}
                            />

                          </Form.Group>

                        </Col>
                        <Col lg="3" md="8" sm="8">
                          <Form.Group>
                            <p style={{ margin: "0px" }}>{t('debit_reseau')} (l/s) </p>
                            <FormControl type="number" value={irrigData.pumpFlow} onChange={e => setIrrigData({ ...irrigData, pumpFlow: e.target.value })} id='debitReseau' placeholder={t('debit_reseau')}
                            />

                          </Form.Group>

                        </Col>
                        <Col lg="4" md="8" sm="8">
                          <Form.Group>
                            <p style={{ margin: "0px" }}>{t('irrigated_already')}(h) </p>
                            <FormControl type="number" value={irrigData.irrigated_already} onChange={e => setIrrigData({ ...irrigData, irrigated_already: e.target.value })} id='debitReseau' placeholder={t('irrigated_already')}
                            />

                          </Form.Group>

                        </Col>
                        {irrigationMethodForm()}
                      </Row>

                    </Form>
                  </Col>
                </div>
                <Row noGutters className="page-header py-4">
                  <PageTitle
                    sm="4"
                    title={t('my_irrigations')}
                    subtitle={t('my_irrigations')}
                    className="text-sm-left"
                  />
                </Row>
                <Row className="px-2">

                  <IrrigationList
                    irrigationsList={irrigations}
                    Irrigations={getFieldsByUser}
                    Crops={crops}
                    Zones={zones}
                  />
                </Row>
              </Card.Body>
            </Card>
          </div>
        )
      default:
        return (
          <div>
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
                    onClick={handleSubmit}
                    // theme="success"
                    className="mb-2 mr-1 btn btn-success"
                  >
                    <i class={`fa fa-check mx-2`}></i>
                    {t('save')}
                  </Button>
                  <Button
                    onClick={resetForm}
                    // theme="success"
                    className="mb-2 mr-1 btn btn-danger"
                  >
                    <i class={`fa fa-times mx-2`}></i>
                    {t('cancel')}
                  </Button>
                </div>
              </Card.Header>
              <Card.Body className="pt-0">
                <Row noGutters className="page-header py-4">
                  <PageTitle
                    sm="4"
                    title={t('my_fields')}
                    subtitle={t('my_fields')}
                    className="text-sm-left"
                  />
                </Row>
                {/* <Row>
                      <Col lg="12" md="12" sm="12" className="mb-4">
                        <Card small>
                          <Card.Header>{t('active_fields')}</Card.Header>
                          <Card.Body>
                            <FieldList
                              Fields={getDataFields}
                              FieldsList={farmsData}
                            />
                          </Card.Body>
                        </Card>
                      </Col>
                    </Row> */}
                <div
                  style={{
                    display: "flex",
                    marginTop: "20px",
                    flexWrap: "wrap"
                  }}
                >
                  <Col lg="6" sm="12" md="6">
                    <Form>
                      <Row>
                        <Col lg='6' md="6" sm='6' className="form-group">
                          <p style={{ margin: "0px", textAlign: "left" }}>{t('name_field')}</p>
                          <FormControl
                            value={dataField.name}
                            placeholder={t('name_field')}
                            className={errors.nameError == '' ? '' : 'is-invalid'}
                            required
                            onChange={handleName}
                          />


                          <div className="invalid-feedback" style={{ textAlign: "left" }}>{errors.nameError}</div>
                        </Col>
                        <Col lg='6' md="6" sm='6' className="form-group">
                          <p style={{ margin: "0px", textAlign: "left" }}>{t('name_farm')}</p>
                          <FormSelect
                            value={dataField.farm_uid}
                            className={errors.farmError == '' ? '' : 'is-invalid'}
                            required
                            onChange={handleUidFarm}
                          >
                            <option value="">{t('select_farm')}</option>;
                            {farms.map((item, index) => {
                              return <option value={item.uid}>{item.name}</option>;
                            })}
                          </FormSelect>
                        </Col>
                      </Row>
                      {/* <Row> */}

                      {/* <Col lg='12' md="6" sm='6'>
                        <Form.Group>
                          <p style={{ margin: "0px",textAlign: "left" }}>{t('desc')}</p>
                          <textarea
                            value={dataField.description}
                            onChange={handleDescription}
                            style={{ height: "220px" }}
                            class="form-control"
                            placeholder="Description"
                          ></textarea>
                        </Form.Group>
                        </Col> */}
                      {/* </Row> */}
                    </Form>
                  </Col>
                </div>
              </Card.Body>
            </Card>
          </div>
        )
    }
  }
  return (
    <>
      <Container fluid className="main-content-container py-4 mx-2">
        <Container >
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
              <Nav.Link className='m-0 w-100 text-light bg-primary' active >
                {t('fields')}
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link className='m-0 bg-white ' as={Link} to={`/admin/user/${Uid}/sensors`}>
                {t('sensors')}
              </Nav.Link>
            </Nav.Item>
          </Nav>
          <Row noGutters className="page-header py-4">
            <PageTitle subtitle={t('fields')} md="12" className="ml-sm-auto mr-sm-auto" />
          </Row>
          <Row className=' d-flex justify-content-center align-items-center py-2'>
            <Col lg='12' md='12' sm='12'>
              <Nav tabs style={{ paddingBottom: 10 }}>
                <Nav.Item>
                  <Nav.Link id="field" onClick={(e) => setView(e.target.id)} className={`${elemValue === "field" ? "bg-info rounded text-dark " : 'rounded text-dark '}`} href="#">
                    {t('field_setup')}
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link id="soil" onClick={(e) => setView(e.target.id)} className={`${elemValue === "soil" ? "bg-info rounded text-dark " : 'rounded text-dark'}`} href="#">
                    {t('soil_info')}
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link id="crop" onClick={(e) => setView(e.target.id)} className={`${elemValue === "crop" ? "bg-info rounded text-dark " : 'rounded text-dark'}`} href="#">{t('crop_info')}</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link id="irrig" onClick={(e) => setView(e.target.id)} className={`${elemValue === "irrig" ? "bg-info rounded text-dark" : 'rounded text-dark'}`} href="#">{t('Irrigation_info')}</Nav.Link>
                </Nav.Item>
              </Nav>

            </Col>

          </Row>


          {renderAddSetup()}
        </Container>

      </Container>
    </>
  )
}

export default FieldsList