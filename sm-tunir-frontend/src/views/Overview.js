import React, { useEffect, useState } from "react";
import { Link, useNavigate } from 'react-router-dom'
// import { Container, Row, Col, CardBody, Card, Button, Dropdown, DropdownMenu,
//    DropdownItem, Tooltip, FormInput, Form.Select, Form.Group, Form } from "shards-react";
import { Container, Row, Col, Card, Dropdown, Form } from 'react-bootstrap';
// import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
// import Dropdown from 'react-bootstrap/Dropdown';
import Tooltip from 'react-bootstrap/Tooltip';
// import Form from 'react-bootstrap/Form';
import PageTitle from "../components/common/PageTitle";
import SmallStats from "../components/common/SmallStats";
import "../assets/styling/Styles.css";
import "./Styles.css";
import LeafletMap from "./map";
import SignalCellularNodataIcon from "@mui/icons-material/SignalCellularNodata";
import SignalCellular4BarIcon from "@mui/icons-material/SignalCellular4Bar";
import { Modal } from "react-bootstrap";
import ProgressBar from 'react-bootstrap/ProgressBar';
import api from '../api/api';
import { useTranslation } from "react-i18next";
import FilterFields from './FilterFields'
import swal from "sweetalert";
import useSensorData from "../utils/useSensorData";
import AddField from "./AddField";
import FieldSetupForm from "../components/FieldSettingForms/FieldSetupForm";
import FieldSoilForm from "../components/FieldSettingForms/FieldSoilForm";
import FieldCropForm from "../components/FieldSettingForms/FieldCropForm";
import CompositeSoil from "../components/FieldSettingForms/compositeSoilForm";
import DripForm from "../components/FieldSettingForms/dripForm";
import LateralForm from "../components/FieldSettingForms/lateralForm";
import PivotForm from "../components/FieldSettingForms/pivotForm";
import clap from "../assets/images/applause.png";
import { FeatureGroup, MapContainer, Marker, Polygon, Popup, ScaleControl, TileLayer } from "react-leaflet";
import LeafletGeoCoder from "./LeafletGeoCoder";
import { EditControl } from "react-leaflet-draw";
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import 'leaflet-draw/dist/leaflet.draw';
import moment from "moment";
import EditableMap from "./EditableMap";



const Overview = (props) => {
  const [toggle, setToggle] = useState(false)
  const [farms, setFarms] = useState([]);
  const [draw, setDraw] = useState({
    polygon: true,
    rectangle: false,
    marker: false,
    circle: false,
    polyline: false,
    circlemarker: false
  })
  const navigate = useNavigate()
  const [steps, setSteps] = useState(0)
  // const [offer,setOffer] = useState(null)
  const [configMap, setConfigMap] = useState({
    draw: {
      polygon: false,
      circle: false,
      rectangle: false,
      polyline: false,
      marker: false,
      circlemarker: false,
    },
    edit: {
      delete: false,
      edit: false
    }
  })
  const [layer, setLayer] = useState('')

  const [coords, setCoords] = useState({
    Latitude: "",
    Longitude: "",
    zoom: "",
    center: [],
    fromAction: false
  })
  const _onCreated = e => {
    let type = e.layerType;

    let layer = e.layer;
    if (type === "polygon") {
      let coords = layer._latlngs[0];
      const Coordinates = coords.map((coord) => ({
        Lat: coord.lat,
        Long: coord.lng,
      }));
      if (Coordinates) {
        setLayer(JSON.stringify(Coordinates))
        setCoords({ Latitude: Coordinates[0].Lat, Longitude: Coordinates[0].Long });

      }

    }
  };

  // const EditableMap = () => {
  //   useEffect(() => {
  //     // Create a Leaflet map
  //     const map = L.map('map').setView([0, 0], 2);

  //     // Add a tile layer
  //     L.tileLayer('http://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}', {
  //     subdomains:['mt0', 'mt1', 'mt2', 'mt3']

  //     }).addTo(map);

  //     // Create an editable feature group
  //     const editableLayers = new L.FeatureGroup().addTo(map);

  //     // Configure the drawing options
  //     const drawOptions = {
  //       position: 'topright',
  //       draw: {
  //         circle: false,
  //         marker: false,
  //         polyline: false,
  //         polygon: {
  //           allowIntersection: false,
  //           drawError: {
  //             color: 'red',
  //             timeout: 1000,
  //           },
  //           shapeOptions: {
  //             color: 'blue',
  //           },
  //         },
  //       },
  //     };

  //     // Add the Leaflet Draw control
  //     const drawControl = new L.Control.Draw(drawOptions);
  //     map.addControl(drawControl);

  //     // Event handler for layer creation
  //     map.on(L.Draw.Event.CREATED, function (event) {
  //       const layer = event.layer;

  //       // Access layer data (e.g., coordinates for polygons)
  //       const layerData = layer.toGeoJSON();
  //       console.log(layerData);

  //       // Update your application state with the layer data
  //       // Your logic to handle the layer data goes here
  //       let coordinates = [];
  //       if (layerData.geometry.type === 'Polygon') {
  //         coordinates = layerData.geometry.coordinates[0].map(coord => ({
  //           Lat: coord[1],
  //           Long: coord[0],
  //         }));
  //       }
  //       if (coordinates.length > 0 ){
  //         setLayer(JSON.stringify(coordinates))
  //         setCoords({ Latitude: coordinates[0].Lat, Longitude : coordinates[0].Long });

  //       }
  //       // Add the layer to the editableLayers FeatureGroup
  //       editableLayers.addLayer(layer);
  //     });

  //     // Cleanup when the component is unmounted
  //     return () => {
  //       map.remove(); // Remove the map instance
  //     };
  //   }, []);

  //   return <div id="map" style={{ height: '350px' }}></div>;
  // };


  const { t, i18n } = useTranslation();

  const [fieldStats, setFS] = useState([])
  const [sensorStats, setSensorStats] = useState([])
  const [open, setOpen] = useState(false)
  const [userMapDetails, setUserMapDetails] = useState("#")
  const [layerFarm, setLayerFarm] = useState([])
  const [mapConfig, setMapConfig] = useState({
    zoom: "",
    center: [],
    fromAction: false,
  })



  let sensorsData = useSensorData('/sensor/sensor-update-data')

  const toggleDropDown = () => {
    setToggle(!toggle)
  }

  const toggleToolTip = () => {
    setOpen(!open)
  }

  const getFieldStats = async () => {
    const response = await api.get('/dashboard/fields');
    setFS(response.data.farms);
    setUserMapDetails(response.data.user_map_details.map_link_details)
  }

  const getSensorsStats = async () => {
    const response = await api.get('/dashboard/sensors');
    setSensorStats(response.data.sensors);
    // if(response.data.sensors){

    //   setMapConfig({center : [Number(response.data.sensors[0].Latitude) ,Number(response.data.sensors[0].Longitude)]})
    // }
  }
  const [crops, setCrops] = useState([])
  const [dataCrops, setDataCrops] = useState([]);

  const getLayerFarm = async () => {
    await api.get('/farm/farms').then(res => {
      const DataFarm = res.data.farms;
      setLayerFarm(DataFarm);
    })
  }

  useEffect(() => {
    // getLastDataSensor()
    getLayerFarm()
    getFieldStats();
    getSensorsStats();
    // fetchDataCrops()
  }, [])
  let critical = 0;
  let full = 0;
  let opt = 0;

  fieldStats.map(item => {
    item.fields.map(field => {
      let status = field.status
      if (status) {
        if (status == "Optimal") {
          opt++
        }
        if (status == "Full") {
          full++
        }
        if (status == "Critical") {
          critical++
        }
      }

    })
  });




  let smallStats = [
    {
      state: `${t('Critical')}`,
      icon: <i class="fas fa-tint-slash"></i>,
      label: `${t('fields')}`,
      value: critical,
      chartLabels: [null, null, null, null, null, null, null],
      attrs: { md: "6", sm: "6" },
      datasets: [
        {
          label: "Today",
          fill: "start",
          borderWidth: 1.5,
          backgroundColor: "rgba(0, 184, 216, 0.1)",
          borderColor: "rgb(0, 184, 216)",
          data: []
        }
      ]
    },
    {
      state: `${t('Optimal')}`,
      icon: <i class={"far fa-check-circle"}></i>,
      label: `${t('fields')}`,
      value: opt,
      chartLabels: [null, null, null, null, null, null, null],
      attrs: { md: "6", sm: "6" },
      datasets: [
        {
          label: "Today",
          fill: "start",
          borderWidth: 1.5,
          backgroundColor: "rgba(23,198,113,0.1)",
          borderColor: "rgb(23,198,113)",
          data: []
        }
      ]
    },
    {
      state: `${t('Full')}`,
      icon: <i class="fas fa-tint"></i>,
      label: `${t('fields')}`,
      value: full,
      chartLabels: [null, null, null, null, null, null, null],
      attrs: { md: "4", sm: "6" },
      datasets: [
        {
          label: "Today",
          fill: "start",
          borderWidth: 1.5,
          backgroundColor: "rgba(255,180,0,0.1)",
          borderColor: "rgb(255,180,0)",
          data: []
        }
      ]
    }
  ]

  const [sensorState, setSensorState] = useState({
    online: 0,
    offline: 0,
    lowBatt: 0

  })
  const [currentTime, setCurrentTime] = useState(new Date());
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 120000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const sensorStates = {};

    for (const item of sensorsData) {
      const lastTime = moment(item.time).format('YYYY-MM-DD HH:mm');
      if (item.sensor_id) {
        const timeStartDifference = moment(lastTime, 'YYYY-MM-DD HH:mm').diff(moment(currentTime), 'days');

        if (timeStartDifference < 0) {
          sensorStates[item.sensor_id] = { online: 0, offline: 1 };
        } else if (timeStartDifference === 0) {
          sensorStates[item.sensor_id] = { online: 1, offline: 0 };
        } else {
          sensorStates[item.sensor_id] = { online: 0, offline: 0 };
        }
      }
    }
    const totalOnline = Object.values(sensorStates).reduce((sum, state) => sum + state.online, 0);
    const totalOffline = Object.values(sensorStates).reduce((sum, state) => sum + state.offline, 0);

    setSensorState({ online: totalOnline, offline: totalOffline, sensorStates });
  }, [sensorsData, currentTime]);







  let smallStats2 = [
    {
      state: `${t('online')}`,
      icon: <SignalCellular4BarIcon />,
      label: `${t('sensors')}`,
      value: sensorState.online,
      chartLabels: [null, null, null, null, null, null, null],
      attrs: { md: "4", sm: "6" },
      datasets: [
        {
          label: "Today",
          fill: "start",
          borderWidth: 1.5,
          backgroundColor: "rgba(255,180,0,0.1)",
          borderColor: "rgb(255,180,0)",
          data: []
        }
      ]
    },
    {
      state: `${t('low_batt')}`,
      icon: <i class="fas fa-battery-quarter"></i>,
      label: `${t('sensors')}`,
      value: sensorState.lowBatt,
      chartLabels: [null, null, null, null, null, null, null],
      attrs: { md: "4", sm: "6" },
      datasets: [
        {
          label: "Today",
          fill: "start",
          borderWidth: 1.5,
          backgroundColor: "rgba(255,180,0,0.1)",
          borderColor: "rgb(255,180,0)",
          data: []
        }
      ]
    },
    {
      state: `${t('offline')}`,
      icon: <SignalCellularNodataIcon />,
      label: `${t('sensors')}`,
      value: sensorState.offline,
      chartLabels: [null, null, null, null, null, null, null],
      attrs: { md: "4", sm: "6" },
      datasets: [
        {
          label: "Today",
          fill: "start",
          borderWidth: 1.5,
          backgroundColor: "rgba(255,180,0,0.1)",
          borderColor: "rgb(255,180,0)",
          data: []
        }
      ]
    }
  ]



  const FilterByStatus = async (status) => {
    let data = {
      status: status
    }
    await api.post('/field/field-status', data)
      .then(response => {
        let farmsData = response.data.farms
        setFarms(farmsData);
      }).catch((err) => {
        swal({
          title: 'Error',
          icon: "error"
        });
      })
  }

  const ToSensorPage = () => {
    navigate('/Sensors')
    window.location.reload()
  }
  const ToAddSensorPage = () => {
    navigate('/AddSensor')
    window.location.reload()
  }
  const ToAddFarmPage = () => {
    navigate('/AddFarm')
    window.location.reload()
  }
  const ToAddFieldPage = () => {
    navigate('/AddField')
    window.location.reload()
  }
  const ToWaterBalancePage = () => {
    navigate('/Bilan')
    window.location.reload()
  }

  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const prevStep = () => {

    setSteps(steps - 1);
  }
  const nextStep = () => {

    setSteps(steps + 1);
  }

  const [listSoils, setListSoils] = useState([])
  const [fields, setFields] = useState([])
  const [zones, setZones] = useState([]);
  const [allCities, setAllCities] = useState([])
  const [countries, setCountries] = useState([])

  const getSoils = async () => {
    try {
      await api.get('/soils/get-soils')
        .then(response => {
          let listSoils = response.data.Soils
          setListSoils(listSoils)

        }).catch(error => {
          console.log(error)
        })

    } catch (error) {
      console.log(error)
    }
  }

  const getDataFields = async () => {
    await api.get('/field/fields').then(res => {
      const newData = res.data.farms;
      setFarms(newData);
      let Fields = [];
      let Zones = [];
      let Crops = []
      newData.map(item => {
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
            let zones = itemfield.zones;
            let crops = itemfield.crops
            if (crops) {
              crops.map(crop => {
                Crops.push({
                  type: crop.type,
                  id: crop.id,
                  Uid: crop.uid,
                  fieldId: crop.field_id,
                  zone_id: crop.zone_id,
                  croptype_id: crop.croptype_id,
                  croptype: crop.croptypes
                })
              })
            }
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
          })
        }
      });
      setFields(Fields)
      setZones(Zones)
      setCrops(Crops)

    })
  }

  useEffect(() => {
    const getDataFields = async () => {
      await api.get('/field/fields').then(res => {
        const newData = res.data.farms;
        setFarms(newData);
        let Fields = [];
        let Zones = [];
        let Crops = []
        newData.map(item => {
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
              let zones = itemfield.zones;
              let crops = itemfield.crops
              if (crops) {
                crops.map(crop => {
                  Crops.push({
                    type: crop.type,
                    id: crop.id,
                    Uid: crop.uid,
                    fieldId: crop.field_id,
                    zone_id: crop.zone_id,
                    croptype_id: crop.croptype_id,
                    croptype: crop.croptypes
                  })
                })
              }
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
            })
          }
        });
        setFields(Fields)
        setZones(Zones)
        setCrops(Crops)

      })
    }
    getDataFields()
  }, [])

  useEffect(() => {
    const getCities = async () => {
      await api.get('/cities/get-cities').then(res => {
        const cities = res.data.Cities;
        setAllCities(cities);

      })
    }

    const getCountries = async () => {
      await api.get('/countries/get-countries').then(res => {
        const countries = res.data.Countries;
        setCountries(countries);

      })
    }
    getSoils()
    getCountries()
    getCities()
  }, [])

  const handleSoilPick = (e) => {
    e.preventDefault()
    const soilType = listSoils.find(
      (soil) => soil.soil == e.target.value
    );
    if (e.target.value !== "") {
      setSoilParams({ effPluie: soilType.rain_eff })
      setSoilParams({ RUmax: soilType.ru })

    }
    if (typeof soilType !== "undefined") {
      setSoilParams({
        ...soilParams,
        soilType: soilType.soil,
        RUmax: soilType.ru,
        effPluie: soilType.rain_eff
      });

    }
  };



  // ADD Farm

  const [country, setCountry] = useState('')
  const [cities, setCities] = useState('')

  const handleCountryPick = (e) => {
    e.preventDefault();
    const country = countries.find(
      (country) => country.iso === e.target.value
    );
    let Cities = []
    if (country) {
      allCities.map((city) => {
        if (city.iso === country.iso) {
          Cities.push({
            city: city.city,
            id: city.id,
            lat: city.lat,
            lon: city.lon
          })
        }
      });

      setCountry(country.iso);
      setCities(Cities)

    }
  };
  const [farmParams, setFarmParams] = useState({
    name: "",
    groupName: "",
    cityId: ""
  })
  const userUid = JSON.parse(localStorage.getItem('user'))?.id ?? null

  const addFarm = async () => {

    let data = {
      name: farmParams.name,
      name_group: farmParams.groupName,
      user_uid: userUid,
      city_id: farmParams.cityId
      // Coordinates : layer,
      // Latitude : coords.Latitude,
      // Longitude : coords.Longitude
    }
    await api.post('/farm/add-farm', data)
      .then(response => {
        if (response.data.type === "success") {
          swal('Farm Added', { icon: "success" });
          getLayerFarm()
          setSteps(steps + 1)
        }
      }).catch(err => {
        swal(err, { icon: "error" })
      })
  }


  // ADD Field

  const [dataField, setDataField] = useState({
    name: "",
    farm_uid: "",
    width: "",
    length: "",
    Latitude: "",
    Longitude: ""
  })
  const addField = () => {

    let data = {
      name: dataField.name,
      farmName: dataField.farmName,
      farm_uid: dataField.farm_uid,
      largeur: dataField.width,
      longueur: dataField.length,
      coordinates: layer,
      Latitude: parseFloat(coords.Latitude).toFixed(4),
      Longitude: parseFloat(coords.Longitude).toFixed(4)
    }

    api.post('/field/add-field', data)
      .then(res => {

        if (res.data.type && res.data.type == "success") {
          swal(`${t('field_added')}`, {
            icon: "success",
          });

          getDataFields()
          setSteps(steps + 1)
        }

      })
      .catch(() => {
        swal(`Error`, {
          icon: "error",
        });

      });
  }
  // ADD Soil Zone

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
  const [isStandardSoil, setSoilType] = useState(true);
  const [soilParams, setSoilParams] = useState({
    soilProperty: "",
    soilType: "",
    field_uid: "",
    zone_uid: "",
    name: "",
    RUmax: "",
    effPluie: "",
  })


  const addZone = () => {

    let data = {
      soilProperty: soilParams.soilProperty,
      field_uid: soilParams.field_uid,
      zone_uid: soilParams.zone_uid,
      name: soilParams.name,
      RUmax: soilParams.RUmax,
      effPluie: soilParams.effPluie,
    }
    api.post('/zone/add-zone', data)
      .then(res => {
        if (res.data.type && res.data.type == "danger") {
          swal({
            title: 'Cannot add soil',
            icon: "error",

          });
        }
        if (res.data.type && res.data.type == "success") {
          swal({
            title: 'Soil added',
            icon: "success",
            text: 'Soil added successfully '

          });
        }
        getDataFields()
        setSteps(steps + 1)
      })
      .catch((err) => {

        console.log(err)

      });
  }


  const [listSoil, setListSoil] = useState([])
  const [listCrop, setListCrop] = useState([])
  const [allVarieties, setAllVarieties] = useState([])
  const [listIrrigations, setListIrrigations] = useState([])

  useEffect(() => {
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

  // ADD Crop 
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
    kcList: [],
    surface: ""
  })

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

  const handleKeyPress = (event) => {
    const regex = /^[1-9][0-9]?$|^100$/;
    const key = event.key;
    const currentValue = event.target.value + key;
    if (!regex.test(currentValue)) {
      event.preventDefault();
    }
  };
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
      surface: cropData.surface,
      growingDate: cropData.growingDate,

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
          getDataFields()
          setSteps(steps + 1)
        }
      })
      .catch((err) => {
        swal(`Error`, {
          icon: "error",
        });


      });
  }

  // ADD Irrigation
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
    pumpType: "",
    linesNumber: "",
    drippersSpacing: ""
  })
  const handleIrrigPick = (e) => {
    e.preventDefault();
    const irrigation = listIrrigations.find((irrigation) => {
      return irrigation.irrigation == e.target.value

    })
    setIrrigData({ irrigType: irrigation.irrigation })

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
      pumpType: irrigData.pumpType,
      lines_number: irrigData.linesNumber,
      drippers_spacing: irrigData.drippersSpacing
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
          setSteps(steps + 1)
        }
      })
      .catch((err) => {

        swal(`Error`, {
          icon: "error",
        });

      });
  }

  const configProcess = () => {
    switch (steps) {
      case 0:
        return (
          <>
            <Row className='pb-2'>
              <PageTitle subtitle={`${t('step')} ${steps + 1} - ${t('farm_setup')}`} className=" mb-1" />
              <div style={{ backgroundColor: '#F7F7F7', padding: '20px', borderRadius: '10px' }}>
                <p style={{ fontSize: '16px', lineHeight: '1.5', margin: '0' }}>"To get started, please provide a name and location for your farm. This will help us to identify and locate your farm accurately."</p>
              </div>
            </Row>

            <Row >
              <div className="d-flex gap-2">
                <Col lg="6" md="12" sm="12" className="">
                  <Form.Group controlId="farmName">
                    {/* <p style={{ margin: "0px" }}> {t('name_farm')} *</p> */}
                    <Form.Label>{t('name_farm')} *</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder={t('name_farm')}
                      required
                      value={farmParams.name}
                      onChange={(e) => setFarmParams({ ...farmParams, name: e.target.value })}
                      style={{ border: '1px solid #0BAECB' }}
                    />
                  </Form.Group>
                </Col>
                <Col lg="6" md="12" sm="12">
                  <Form.Group controlId="groupName">
                    {/* <p style={{ margin: "0px" }}>{t('group_name')}</p> */}
                    <Form.Label>{t('group_name')}</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder={t('group_name')}
                      value={farmParams.groupName}
                      onChange={(e) => setFarmParams({ ...farmParams, groupName: e.target.value })}

                    />
                  </Form.Group>
                </Col>
              </div>
            </Row>
            <Row className="pt-1">
              <div className="d-flex gap-2">

                <Col lg="6" md="12" sm="12">
                  <Form.Group controlId="country">
                    {/* <p style={{ margin: "0px" }}>{t('select_country')} *</p> */}
                    <Form.Label>{t('select_country')} *</Form.Label>
                    <Form.Select
                      onChange={handleCountryPick}
                      value={country}
                      style={{ border: '1px solid #0BAECB' }}

                    >
                      {
                        countries.map(country => {
                          return (
                            <option key={country.id} value={country.iso}>{country.name}</option>
                          )
                        })
                      }
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col lg="6" md="12" sm="12">
                  <Form.Group controlId="city">
                    {/* <p style={{ margin: "0px" }}>{t('select_city')} *</p> */}
                    <Form.Label>{t('select_city')} *</Form.Label>
                    <Form.Select
                      value={farmParams.cityId}
                      onChange={e => setFarmParams({ ...farmParams, cityId: e.target.value })}
                      style={{ border: '1px solid #0BAECB' }}

                    >
                      <option selected>{t('select_city')}</option>
                      {
                        cities && cities.map(city => {
                          return (
                            <option key={city.id} value={city.id}>{city.city}</option>
                          )
                        })
                      }
                    </Form.Select>
                  </Form.Group>
                </Col>
              </div>

            </Row>

          </>
        )
      case 1:
        return (
          <>
            <Row className='pb-2'>
              <PageTitle subtitle={`${t('step')} ${steps + 1} - ${t('field_setup')}`} className=" mb-1" />
              <div style={{ backgroundColor: '#F7F7F7', padding: '20px', borderRadius: '10px' }}>
                <p style={{ textAlign: "center", fontSize: '16px', lineHeight: '1.5', margin: '0' }}>To proceed to the next stage, we kindly ask you to draw your field on the map.</p>
              </div>
            </Row>
            <Row>
              <div className="d-flex gap-3">
                <Col lg='6' md="12" sm='12'>
                  <Row>
                    <div className="d-flex gap-2">

                      <Col lg='6' md="12" sm='12' className="form-group">
                        <p style={{ margin: "0px", textAlign: "left" }}>{t('name_field')} *</p>
                        <Form.Control
                          type="text"
                          value={dataField.name}
                          placeholder={t('name_field')}
                          style={{ border: '1px solid #0BAECB', height: '40px' }}

                          // className={props.nameError =='' ? '' : 'is-invalid'}
                          required
                          onChange={e => setDataField({ ...dataField, name: e.target.value })}
                        />
                        {/* <div className="invalid-feedback" style={{textAlign: "left"}}>{props.nameError}</div> */}
                      </Col>
                      <Col lg='6' md="12" sm='12' className="form-group h-100">
                        <p style={{ margin: "0px", textAlign: "left" }}>{t('name_farm')} *</p>
                        <Form.Select
                          value={dataField.farm_uid}
                          style={{ border: '1px solid #0BAECB', height: '40px' }}
                          // className={props.farmError =='' ? '' : 'is-invalid'}
                          required
                          onChange={e => setDataField({ ...dataField, farm_uid: e.target.value })}
                        >
                          <option value="">{t('select_farm')}</option>;
                          {layerFarm.map((item, index) => {
                            return <option value={item.uid}>{item.name}</option>;
                          })}
                        </Form.Select>
                      </Col>
                    </div>
                  </Row>
                  <div className="d-flex gap-2">
                  <Row>
                  <div className="d-flex gap-2">
                    
                    <Col lg='6' md="12" sm='12' className="form-group">
                      <p style={{ margin: "0px", textAlign: "left" }}>{t('width')} (M)</p>
                      <Form.Control
                        style={{ height: '40px' }}
                        type="number"
                        placeholder={t('width')}
                        value={dataField.width}
                        onChange={e => setDataField({ ...dataField, width: e.target.value })}
                        required
                      />
                    </Col>
                    <Col lg='6' md="12" sm='12' className="form-group">
                      <p style={{ margin: "0px", textAlign: "left" }}>{t('length')} (M)</p>
                      <Form.Control
                        style={{ height: '40px' }}

                        type="number"
                        placeholder={t('length')}
                        value={dataField.length}
                        onChange={e => setDataField({ ...dataField, length: e.target.value })}
                        required
                      />
                    </Col>
</div>
                  </Row>
                  </div>
                </Col>
                <Col lg='6' md="12" sm='12'>
                  <EditableMap setLayer={setLayer} setCoords={setCoords} />
                </Col>
              </div>
            </Row>

          </>

        )
      case 2:
        return (
          <Form className='pb-2'>
            <Row>
              <PageTitle subtitle={`${t('step')} ${steps + 1} - ${t('soil_info')}`} className=" mb-1" />
              <div style={{ backgroundColor: '#F7F7F7', padding: '20px', borderRadius: '10px' }}>
                <p style={{ fontSize: '16px', lineHeight: '1.5', margin: '0' }}>"To add your soil type configuration, please provide the appropriate details and associate it with the appropriate field. This will help us to provide accurate recommendations for managing your crops."</p>
              </div>
            </Row>
            <Row className="py-2 d-flex justify-content-start border-bottom align-items-center" >
              <div className="d-flex gap-2">
              <Col lg='4' md="12" sm="12" className="form-group">
                <p style={{ margin: "0px" }}>{t('soil_zone')} *</p>
                <Form.Control
                  type="text"
                  value={soilParams.name}
                  placeholder={t('soil_zone')}
                  required
                  onChange={e => setSoilParams({ ...soilParams, name: e.target.value })}
                  style={{ border: '1px solid #0BAECB' , height: '40px'}}

                />
                <p style={{ margin: "0px" }}>{t('soil_type')} *</p>
                <Form.Select
                  value={soilParams.soilType}
                  onChange={handleSoilPick}
                  style={{ border: '1px solid #0BAECB' }}
                >
                  <option value="">{t('select_soil')}</option>
                  {
                    listSoils.map((item, index) => {
                      return <option value={item.soil} >{item.soil}</option>;

                    })
                  }
                </Form.Select>


              </Col>
              <Col lg='4' md="12" sm="12" className="form-group">
                <p style={{ margin: "0px" }}>{t('soil_prop')} *</p>
                <Form.Select
                  onChange={evt => {

                    setSoilType(!isStandardSoil);

                  }}
                  style={{ border: '1px solid #0BAECB' }}

                >
                  <option selected={isStandardSoil}>Standard</option>
                  <option selected={!isStandardSoil}>Composite</option>
                </Form.Select>
                <p style={{ margin: "0px" }}>{t('name_field')} *</p>
                <Form.Select
                  value={soilParams.field_uid}
                  onChange={e => setSoilParams({ ...soilParams, field_uid: e.target.value })}
                  placeholder={t('name_field')}
                  style={{ border: '1px solid #0BAECB' , height: '40px'}}

                >
                  <option value="">{t('select_field')}</option>
                  {fields.map((item, index) => {
                    return <option value={item.Uid}>{item.title}</option>;
                  })}
                </Form.Select>
              </Col>
              </div>
            </Row>
            <Row form>
              {soilTypeForm()}
            </Row>
            <Row form className="py-2" >
              <div className="d-flex gap-2">
              <Col lg="6" md="12" sm="12">
                <Form.Group>
                  <p style={{ margin: "0px" }}>{t('efficacité_pluie')} (%) *</p>
                  <Form.Control
                    type="number" value={soilParams.effPluie} onChange={e => setSoilParams({ ...soilParams, effPluie: e.target.value })} id='effPluie' placeholder={t('efficacité_pluie')}
                    style={{ border: '1px solid #0BAECB' }}

                  />

                </Form.Group>
              </Col>
              <Col lg="6" md="12" sm="12">
                <Form.Group>
                  <p style={{ margin: "0px" }}>RU max (mm/m) *</p>
                  <Form.Control
                    type="number" value={soilParams.RUmax} onChange={e => setSoilParams({ ...soilParams, RUmax: e.target.value })} id='ruMax' placeholder="RU max"
                    style={{ border: '1px solid #0BAECB' }}

                  />

                </Form.Group>

              </Col>
              </div>
            </Row>
          </Form>
        )
      case 3:
        return (
          <Form className='pb-2'>
            <Row>
              <PageTitle subtitle={`${t('step')} ${steps + 1} - ${t('crop_info')}`} className=" mb-1" />
              <div style={{ backgroundColor: '#F7F7F7', padding: '20px', borderRadius: '10px' }}>
                <p style={{ fontSize: '16px', lineHeight: '1.5', margin: '0' }}>"To add your crop type configuration, please provide the appropriate details and associate it with the appropriate field and soil type. This will help us to provide personalized recommendations for managing your crops and achieving optimal yields."</p>
              </div>
            </Row>
            <Row className="py-2 d-flex justify-content-start border-bottom align-items-center">
            <div className="d-flex gap-2 mt-3">

              <Col lg='6' md="12" sm="12" className="form-group ">
                <p style={{ margin: "0px" }}>{t('crop_type')} *</p>
                <Form.Select
                  onChange={handleCropPick}
                  placeholder={t('crop_type')}
                  value={cropData.cropType}
                  style={{ border: '1px solid #0BAECB' }}

                >
                  <option value="">Select Crop</option>
                  {
                    listCrop.map(crop => {
                      return (
                        <option value={crop.id}>{crop.crop}</option>

                      )
                    })
                  }
                </Form.Select>

                <p style={{ margin: "0px" }}>{t('crop_variety')}</p>
                <Form.Select value={cropData.variety} onChange={handleVarietyPick} id="cropVariety">
                  <option value="">{t('crop_variety')}</option>
                  {
                    cropData.cropVariety.map(variety => (
                      <option value={variety.varietyId}>{variety.variety}</option>
                    ))
                  }
                </Form.Select>
                <input type="checkbox" name="Autre" id="check" onClick={() => setChecked(!checked)} /> {t('other')}
                {
                  checked
                    ?

                    <Form.Control

                      value={cropData.variety || ""}
                      placeholder={t('crop_variety')}
                      id="cropVariety"
                      onChange={e => setCropData({ ...cropData, variety: e.target.value })}
                    />

                    :
                    null
                }

              </Col>
              < Col lg="6" md="12" sm="12" className="form-group">
                <p style={{ margin: "0px" }}>{t('crop_zone')} *</p>
                <Form.Select
                  value={cropData.zone_uid}
                  onChange={e => setCropData({ ...cropData, zone_uid: e.target.value })}
                  placeholder={t('crop_zone')}
                  style={{ border: '1px solid #0BAECB' }}

                >
                  <option>{t('select_zone')}</option>

                  {
                    zones.map(soil => {
                      return <option value={soil.Uid}>{soil.name}</option>

                    })
                  }

                </Form.Select>
                <p style={{ margin: "0px" }}>{t('crop_field')} *</p>
                <Form.Select
                  value={cropData.field_uid}
                  onChange={e => setCropData({ ...cropData, field_uid: e.target.value })}
                  placeholder={t('crop_zone')}
                  style={{ border: '1px solid #0BAECB' }}

                >
                  <option>{t('select_field')}</option>
                  {
                    fields.map((item, indx) => {
                      return <option value={item.Uid}>{item.title}</option>
                    })
                  }
                </Form.Select>

              </Col>
              </div>
            </Row>
            <Row className="py-2">
            <div className="d-flex gap-2">

              <Col lg="4" md="12" sm="12">
                <Form.Group>
                  <p style={{ margin: "0px" }}>{t('surface')} (m²)</p>
                  <Form.Control type="number" value={cropData.surface} onChange={e => setCropData({ ...cropData, surface: e.target.value })} id='z' placeholder={t('surface')}
                  />

                </Form.Group>

              </Col>
              <Col lg="4" md="12" sm="12">
                <Form.Group>
                  <p style={{ margin: "0px" }}>{t('depth')} (m) *</p>
                  <Form.Control type="number" value={cropData.rootDepth} onChange={e => setCropData({ ...cropData, rootDepth: e.target.value })} id='z' placeholder={t('depth')}
                    style={{ border: '1px solid #0BAECB' }}

                  />

                </Form.Group>

              </Col>
              <Col lg="4" md="12" sm="12">
                <Form.Group>
                  <p style={{ margin: "0px" }}>{t('Days')} *</p>
                  <Form.Control style={{ border: '1px solid #0BAECB' }} type="number" value={cropData.days} id='days' onChange={e => setCropData({ ...cropData, days: e.target.value })} placeholder={t('Days')} />

                </Form.Group>

              </Col>
              </div>
            <div className="d-flex gap-2">

              <Col lg="4" md="12" sm="12">
                <Form.Group>
                  <p style={{ margin: "0px" }}>{t('planting_date')} *</p>
                  <Form.Control style={{ border: '1px solid #0BAECB' }} type="date" value={cropData.growingDate} onChange={e => setCropData({ ...cropData, growingDate: e.target.value })} id='planting_date' />

                </Form.Group>

              </Col>
              <Col hidden lg="4" md="12" sm="12">
                <Form.Group>
                  <p style={{ margin: "0px" }}>{t('growing_season')}</p>
                  <Form.Control type="date" value={cropData.plantingDate} onChange={e => setCropData({ ...cropData, plantingDate: e.target.value })} id='days' />

                </Form.Group>

              </Col>
              <Col lg="4" md="12" sm="12">
                <Form.Group>
                  <p style={{ margin: "0px" }}>{t('fraction_pratique')} (%) * </p>
                  <Form.Control type="number" value={cropData.ruPratique} onChange={e => setCropData({ ...cropData, ruPratique: e.target.value })} id='ruPratique' placeholder={t('fraction_pratique')}
                    style={{ border: '1px solid #0BAECB' }}

                  />
                </Form.Group>

              </Col>
              </div>
              <div className="d-flex gap-2">

              <Col lg="4" md="12" sm="12">
                <Form.Group>
                  <p style={{ margin: "0px" }}>{t('ecart_inter')} (m)</p>
                  <Form.Control type="number" value={cropData.ecartInter} onChange={e => setCropData({ ...cropData, ecartInter: e.target.value })} id='ecartInter' placeholder={t('ecart_inter')}
                  />
                </Form.Group>

              </Col>
              <Col lg="4" md="12" sm="12">
                <Form.Group>
                  <p style={{ margin: "0px" }}>{t('ecart_intra')} (m) </p>
                  <Form.Control type="number" value={cropData.ecartIntra} onChange={e => setCropData({ ...cropData, ecartIntra: e.target.value })} id='ecartIntra' placeholder={t('ecart_intra')}
                  />
                </Form.Group>

              </Col>
              <Col lg="4" md="12" sm="12">
                <Form.Group>
                  <p style={{ margin: "0px" }}>{t('densité')} (plants/ha)</p>
                  <Form.Control type="number" value={cropData.density} onChange={e => setCropData({ ...cropData, density: e.target.value })} id='densité' placeholder={t('densité')}
                  />
                </Form.Group>

              </Col>
              </div>

            </Row>
          </Form>
        )
      case 4:
        return (
          <Form className='pb-2'>
            <Row>
              <PageTitle subtitle={`${t('step')} ${steps + 1} - ${t('Irrigation_info')}`} className=" mb-1" />
              <div style={{ backgroundColor: '#F7F7F7', padding: '20px', borderRadius: '10px' }}>
                <p style={{ fontSize: '16px', lineHeight: '1.5', margin: '0' }}>"To add your irrigation type configuration, please provide the appropriate details and associate it with the appropriate crop type and soil type. This will help us to provide personalized recommendations for managing your crops and optimizing water usage."</p>
              </div>
            </Row>
            <Row form>
            <div className="d-flex gap-2">

              <Col md="6" className="form-group">
                <p style={{ margin: "0px" }}>{t('irrigation_zone')} *</p>
                <Form.Select
                  value={irrigData.zone_uid}
                  onChange={e => setIrrigData({ ...irrigData, zone_uid: e.target.value })}
                  style={{ border: '1px solid #0BAECB' }}

                >
                  <option>{t('select_zone')}</option>

                  {
                    zones.map((item, indx) => {
                      return <option value={item.Uid}>{item.name}</option>
                    })
                  }
                </Form.Select>
              </Col>
              <Col md="6" className="form-group">
                <p style={{ margin: "0px" }}>{t('irrigation_crop')} *</p>
                <Form.Select
                  value={irrigData.crop_uid}
                  onChange={e => setIrrigData({ ...irrigData, crop_uid: e.target.value })}
                  style={{ border: '1px solid #0BAECB' }}

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
                </Form.Select>
              </Col>
              </div>
              <div className="d-flex gap-2">

              <Col md="6" className="form-group">
                <p style={{ margin: "0px" }}>{t('Irrigation_system_type')} *</p>
                <Form.Select
                  // className={props.typeErrorIrrig == '' ? '' : 'is-invalid'}
                  value={irrigData.irrigType}
                  onChange={evt => {
                    handleIrrigPick(evt)
                  }}
                  style={{ border: '1px solid #0BAECB' }}

                >
                  <option disabled selected value="">{t('select_irriagtion')}</option>
                  {
                    listIrrigations.map(item => {
                      // if (item.value === irrigationMethod) {
                      //   return <option value={item.value} selected={true}>{item.type}</option>;
                      // } else {
                      //   return <option value={item.value} selected={false}>{item.type}</option>;
                      // }
                      return <option value={item.irrigation} >{t(`${item.irrigation}`)}</option>;
                    })
                  }
                </Form.Select>
              </Col>
              <Col lg="6" md="8" sm="8">
                <Form.Group>
                  <p style={{ margin: "0px" }}>{t('efficience_irrigation')} (%) *</p>
                  <Form.Control type="number" value={irrigData.effIrrig}  onChange={e => setIrrigData({ ...irrigData, effIrrig: e.target.value })} id='effIrrig' placeholder={t('efficience_irrigation')}
                    style={{ border: '1px solid #0BAECB',height:41 }}

                  />

                </Form.Group>

              </Col>
              </div>
              <div className="d-flex gap-2">

              <Col lg="4" md="8" sm="8">
                <Form.Group>
                  <p style={{ margin: "0px" }}>{t('type_reseau')}</p>
                  <Form.Control value={irrigData.pumpType} onChange={e => setIrrigData({ ...irrigData, pumpType: e.target.value })} id='type_reseau' placeholder={t('type_reseau')}
                  />

                </Form.Group>

              </Col>
              <Col lg="4" md="8" sm="8">
                <Form.Group>
                  <p style={{ margin: "0px" }}>{t('debit_reseau')} (l/s) </p>
                  <Form.Control type="number" value={irrigData.pumpFlow} onChange={e => setIrrigData({ ...irrigData, pumpFlow: e.target.value })} id='debitReseau' placeholder={t('debit_reseau')}
                  />

                </Form.Group>

              </Col>
              <Col lg="4" md="8" sm="8">
                <Form.Group>
                  <p style={{ margin: "0px" }}>{t('nbr_ligne')}</p>
                  <Form.Control type='number' value={irrigData.linesNumber} onChange={e => setIrrigData({ ...irrigData, linesNumber: e.target.value })} id='nbr_ligne' placeholder={t('nbr_ligne')}
                  />

                </Form.Group>

              </Col>
              </div>

              <Col lg="4" md="8" sm="8">
                <Form.Group>
                  <p style={{ margin: "0px" }}>{t('irrigated_already')}(h) </p>
                  <Form.Control type="number" value={irrigData.irrigated_already} onChange={e => setIrrigData({ ...irrigData, irrigated_already: e.target.value })} id='debitReseau' placeholder={t('irrigated_already')}
                  />

                </Form.Group>

              </Col>
              {irrigationMethodForm()}
            </Row>
          </Form>
        )
      case 5:
        return (
          <div className="d-flex flex-column align-items-center justify-content-around">

            <img width="20%" src={clap} alt="Congratulations" />
            <h6 style={{ textAlign: "center", width: "88%" }}>Congratulations, your farm configuration is complete <br /> Thank you for filling out all 5 steps of the form. <br />
              Now it's time to configure your sensors. Please proceed to the next step to add your sensor configuration.
            </h6>
          </div>


        )
      default:
        break;
    }
  }

  const totalSteps = 5;

  const percentageComplete = Math.ceil(((steps) / totalSteps) * 100);

  const handleSubmit = () => {
    switch (steps) {
      case 0:
        return (
          addFarm()
        )
      case 1:
        return (
          addField()
        )
      case 2:
        return (
          addZone()
        )
      case 3:
        return (
          addCrop()
        )
      case 4:
        return (
          addIrrigation()
        )
      default:
        break;
    }
  }
  return (
    <Container fluid className="main-content-container px-5" style={{ overflowX: 'hidden', width: '100%', maxWidth: '100%' }}
    >
      <>
        <Modal size="lg" show={show} onHide={handleClose}>
          <Modal.Header className="d-flex flex-column" >
            <Modal.Title>Farm Configuration</Modal.Title>
            <p style={{ textDecoration: "underline", fontSize: 12, fontWeight: "bold" }}>Each step of this form is dependent on the previous step, so please fill out the fields in the correct order to avoid errors or an incomplete submission.</p>
            <div style={{ width: "100%", height: 25 }}>
              <ProgressBar animated variant="success" now={percentageComplete} />

            </div>

          </Modal.Header>
          <Modal.Body>
            {configProcess()}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>
              Close
            </Button>
            {
              steps !== 5
                ?
                <Button disabled={steps === 1 && coords.Latitude === ""} variant="primary" onClick={handleSubmit}>
                  Save & continue process
                </Button>
                :
                null

            }
            {
              steps > 0 && steps < 5
                ?
                <Button variant="primary" onClick={prevStep}>
                  Previous
                </Button>
                :
                null
            }
          </Modal.Footer>
        </Modal>
      </>
      {/* Page Header */}
      <Row noGutters className="page-header py-2 mb-4 d-flex justify-content-between w-100 flex-nowrap align-items-center border-bottom">
        <PageTitle title={t('overview')} className=" mb-1" />
        <Dropdown open={toggle} toggle={toggleDropDown} className="d-table mr-5 custom-dropdown" style={{ width: '50px', height: '50px',all:"unset"}}>
          <Dropdown.Toggle className="d-flex justify-content-center align-items-center "  style={{
    all: 'unset',
    border: 'none',
    background: 'none',
    boxShadow: 'none',
    outline: 'none',
  }}>
            <Button id="TooltipExample" theme="info" className="rounded-circle" style={{ height: 50, width: 50 }} onClick={toggleDropDown}  >
              <i className="material-icons" style={{ fontSize: 30, display: "flex", justifyContent: "center", alignItems: "center", color: "#fff" }}>&#xe145;</i>
              <Tooltip
                placement="left"

                open={open}
                target="#TooltipExample"
                toggle={toggleToolTip}
              >
                {t('add_element')}
              </Tooltip>
            </Button>

          </Dropdown.Toggle>
          <Dropdown.Menu right style={{ zIndex: "10" }} >
            <Link onClick={handleShow}>
              <Dropdown.Item>
                {t('farms')}
              </Dropdown.Item>

            </Link>
            <Link onClick={() => ToAddSensorPage()}>
              <Dropdown.Item>
                {t('sensors')}
              </Dropdown.Item>
            </Link>
            <Link onClick={() => ToWaterBalancePage()}>
              <Dropdown.Item>
                {t('water_balance')}
              </Dropdown.Item>
            </Link>
          </Dropdown.Menu>
        </Dropdown>
      </Row>
      {/* Small Stats Blocks */}
      <Row className="mt-4 gap-2">
        <Col lg="4" md="6" sm="6" className="mb-4">
          <p style={{ margin: 0 }}>{t('field_stats')}</p>
          <Card small className="stats-small h-100">
            <Card.Body className="p-2 d-flex  justify-content-center align-items-center">
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",

                  flexWrap: "wrap",
                  width: "100%"
                }}
              >
                {/* <Stats /> */}
                {smallStats.map((stats, idx) => (
                  <>
                    <SmallStats
                      FilterByStatus={FilterByStatus}
                      style={{
                        borderColor: "blue",
                        borderWidth: 2,
                        borderStyle: "solid"
                      }}
                      id={`small-stats-${idx}`}
                      variation="1"
                      chartData={stats.datasets}
                      chartLabels={stats.chartLabels}
                      label={stats.label}
                      value={stats.value}
                      icon={stats.icon}
                      state={stats.state}
                    />
                    {idx != 2 ? (
                      <hr
                        style={{
                          backgroundColor: "#ebebeb",
                          width: "1px",
                          height: "75%"
                        }}
                      />
                    ) : (
                      <></>
                    )}
                  </>
                ))}
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col lg="3" md="6" sm="6" className="mb-4">
          <p style={{ margin: 0 }}>{t('sensor_stats')}</p>
          <Card small className="stats-small h-100">
            <Card.Body className="p-2 d-flex justify-content-center align-items-center">
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  flexWrap: "wrap",
                  width: "100%"
                }}
              >
                {smallStats2.map((stats, idx) => (
                  <>
                    <SmallStats
                      ToSensorPage={ToSensorPage}
                      style={{
                        borderColor: "blue",
                        borderWidth: 2,
                        borderStyle: "solid"
                      }}
                      id={`small-stats-${idx}`}
                      variation="1"
                      chartData={stats.datasets}
                      chartLabels={stats.chartLabels}
                      label={stats.label}
                      value={stats.value}
                      icon={stats.icon}
                      state={stats.state}
                    />
                    {idx != 2 ? (
                      <hr
                        style={{
                          backgroundColor: "#ebebeb",
                          width: "1px",
                          height: "75%"
                        }}
                      />
                    ) : (
                      <></>
                    )}
                  </>
                ))}
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col lg="4" md="12" sm="12" className="">
          {/* <h4 style={{ marginBottom: "-15px" }}>{t('map')}</h4> */}
          <LeafletMap data={layerFarm} sensor={sensorStats} draw={configMap.draw} zoom={mapConfig.zoom} center={mapConfig.center} fromAcrion={mapConfig.fromAction} />
        </Col>
      </Row>
      <Row className="d-flex justify-content-center align-items-center">
      </Row>
      <Row>
        <FilterFields
          smallStats={smallStats}
          sensorsData={sensorsData}
          crops={crops}
          filteredByStatus={farms}
          sensorStats={sensorStats}
          fieldStats={fieldStats}
        />
      </Row>
    </Container>
  )
}


export default Overview;