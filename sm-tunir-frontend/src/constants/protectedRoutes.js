import Dashboard from '../components/Simulation/Dashboard';
import BilanHydrique from '../components/Simulation/BilanHydrique';
import Fields from '../views/Field';
import Sensors from '../views/Sensors'
import SatelliteImages from '../views/SatelliteImages'
import MySimulations from '../components/Simulation/MySimulations'
import Calendar from '../views/Calendar';
import AllNotifications from '../views/AllNotifications';
import Weather from '../views/Weather';
import EditSensorByAdmin from '../views/EditSensorByAdmin';
import AllRecommendations from '../views/AllRecommendations'

import Overview from '../views/Overview';
import Reports from '../views/Reports';
import UserProfileLite from '../views/UserProfileLite';
import AddField from '../views/AddField';
import AdminBoard from '../admin/AdminBoard';
import SensorsManagement from "../admin/SensorsManagement";
import AddSensorByAdmin from "../admin/AddSensor"
import SensorHistory from "../views/SensorHistory"
import SensorSettings from "../views/SensorSettings"
import AddSensor from "../views/AddSensor"
import AddSupplier from "../supplier/AddSupplier"
import AllSuppliers from "../admin/AllSuppliers"
import AddUser from "../admin/AddUser"
import FieldsManagement from "../admin/FieldsManagement"
import CalculSimulation from "../admin/CalculSimulation"
import CommandeManagement from "../admin/CommandeManagement"
import AddEquipmentByAdmin from "../admin/AddEquipment"
import Configuration from "../admin/Configuration"
import EditUserDetail from "../admin/EditUserDetail"
import ConfigurationCities from "../admin/ConfigurationCities"
import ConfigCitiesWeather from "../admin/ConfigCitiesWeather"
import ConfigurationCrops from "../admin/ConfigurationCrops"
import ConfigurationCropsVariety from "../admin/ConfigurationCropsVariety"
import ConfigurationSoils from "../admin/ConfigurationSoils"
import ConfigurationIrrigation from "../admin/ConfigurationIrrigation"
import Graph from "../views/Graph";
import AddFram from '../views/AddFram';
import AddFarmField from '../views/AddFarmField';
import SoilInfo from '../views/SoilInfo';
import AddCropInfo from '../views/AddCropInfo';
import AddIrrigation from '../views/AddIrrigation';
import FarmList from "../admin/FarmsList"
import FieldList from "../admin/FieldsList"
import SensorList from "../admin/SensorsList"
import Recommendations from "../admin/Recommendations"
// import Profile from '../pages/Profile'

const protectedRoutes = [
  {
    name: 'Dashboard',
    path: '/dashboard',
    element: <Dashboard />,
    roles: ['ROLE_ADMIN',"ROLE_USER",'guest'] 
  },
  {
    name: 'Fields',
    path: '/fields/:id',
    element: <Fields />,
    roles: ['ROLE_USER',"ROLE_USER","ROLE_ADMIN"] 

  },
  {
    name: 'Sensors',
    path: '/sensors/:id',
    element: <Sensors />,
    roles: ['ROLE_ADMIN','guest',"ROLE_USER"] 
  },
 
  // {
  //   name: 'My Simulations',
  //   path: '/simulations',
  //   element: <Simulations />,
  //   roles: ['ROLE_ADMIN',"ROLE_USER"] 
  // },
  {
    name: 'Calendar',
    path: '/calendar',
    element: <Calendar />,
    roles: ['ROLE_ADMIN',"ROLE_USER"] 

  },
  {
    name: 'Weather Forecast',
    path: '/weather',
    element: <Weather />,
    roles: ['ROLE_ADMIN',"ROLE_USER"] 

  },
  {
    name: 'AllRecommendations',
    path : "/recommendations/:id",
    element: <AllRecommendations />,
    roles: ['ROLE_ADMIN',"ROLE_USER"] 

  },
  {
    name: 'AddSensor',
    path: "/AddSensor",

    element: <AddSensor />,
    roles: ['ROLE_ADMIN',"ROLE_USER"] 

  },
  {
    name: 'Graph',
    path: "/Graphs",

    element: <Graph />,
    roles: ['ROLE_ADMIN',"ROLE_USER"] 

  },
  {
    name: 'edit-sensor',
    path : "/admin/edit-sensor/:id",
    element: <EditSensorByAdmin />,
    roles: ['ROLE_ADMIN'] 

  },
  {
    name: 'Overview',
    path: '/overview',
    element: <Overview />,
    roles: ['ROLE_ADMIN'] 

  },
  {
    name: 'recommendations',
    path:"/admin/user/:uid/recommendations",
    element: <Recommendations />,
    roles: ['ROLE_ADMIN'] 

  },
   
  {
    name: 'admin Board',
    path : "/admin/users",
    element: <AdminBoard />,
    roles: ['ROLE_ADMIN'] 

  },
  {
    name: 'user detail',
    path : "/admin/user/:uid",
    element: <EditUserDetail />,
    roles: ['ROLE_ADMIN'] 

  },
  {
    name: 'user farm list ',
    path : "/admin/user/:uid/farms",
    element: <FarmList />,
    roles: ['ROLE_ADMIN'] 

  },
  {
    name: 'user field list ',
    path : "/admin/user/:uid/fields",
    element: <FieldList />,
    roles: ['ROLE_ADMIN'] 

  },
  {
    name: 'user sensor list ',
    path : "/admin/user/:uid/sensors",
    element: <SensorList />,
    roles: ['ROLE_ADMIN'] 

  },
 
  {
    name: 'admin Board',
    path : "/admin/sensors",

    element: <SensorsManagement />,
    roles: ['ROLE_ADMIN'] 

  },
  {
    name: 'add-sensor',
    path : "/admin/add-sensor",
    element: <AddSensorByAdmin />,
    roles: ['ROLE_ADMIN'] 

  },
  {
    name: 'sensor-history',
    path : "/my-history/:id",

    element: <SensorHistory />,
    roles: ['ROLE_ADMIN',"ROLE_USER"] 

  },
  {
    name: 'supplier',
    path : "/Supplier",
    element: <AddSupplier />,
    roles: ['ROLE_ADMIN'] 

  },
  {
    name: 'all supplier',
    path : "/admin/all-suppliers",
    element: <AllSuppliers />,
    roles: ['ROLE_ADMIN'] 

  },
  {
    name: 'add user',
    path : "/admin/add-user",
    element: <AddUser />,
    roles: ['ROLE_ADMIN'] 

  },
  {
    name: 'fields',
    path : "/admin/fields",
    element: <FieldsManagement />,
    roles: ['ROLE_ADMIN'] 

  },
  {
    name: 'calcul simulation',
    path : "/admin/calcul-fields/:fieldId",
    element: <CalculSimulation />,
    roles: ['ROLE_ADMIN'] 

  },
  {
    name: 'Commande Management',
    path : "/admin/commande",

    element: <CommandeManagement />,
    roles: ['ROLE_ADMIN'] 

  },
  {
    name: 'AddEquipmentByAdmin',
    path : "/admin/add-equipment",


    element: <AddEquipmentByAdmin />,
    roles: ['ROLE_ADMIN'] 

  },
  {
    name: 'Configuration',
    path : "/admin/configuration",

    element: <Configuration />,
    roles: ['ROLE_ADMIN'] 

  },
  {
    name: 'Cities configuration',
    path : "/admin/configuration/cities",
    element: <ConfigurationCities />,
    roles: ['ROLE_ADMIN'] 

  },
  {
    name: 'configuration weather',
    path : "/admin/configuration/cities/weather/:id",

    element: <ConfigCitiesWeather />,
    roles: ['ROLE_ADMIN'] 

  },
  {
    name: 'configuration crop',
    path : "/admin/configuration/crops",
    element: <ConfigurationCrops />,
    roles: ['ROLE_ADMIN'] 

  },
  {
    name: 'configuration cropsVariety',
    path : "/admin/configuration/cropsVariety",
    element: <ConfigurationCropsVariety />,
    roles: ['ROLE_ADMIN'] 

  },
  {
    name: 'configuration soil',
    path : "/admin/configuration/soils",

    element: <ConfigurationSoils />,
    roles: ['ROLE_ADMIN'] 

  },
  {
    name: 'Configuration Irrigation',
    path : "/admin/configuration/irrigations",
    element: <ConfigurationIrrigation />,
    roles: ['ROLE_ADMIN'] 

  },
  {
    name: 'Sensor Settings',
    path : "/sensor-settings",

    element: <SensorSettings />,
    roles: ['ROLE_ADMIN',"ROLE_USER"] 

  },
  {
    name: 'Add Field',
    path: "/AddField",
    element: <AddField />,
    roles: ['ROLE_ADMIN',"ROLE_USER"] 

  },
  {
    name: 'BilanHydrique',
    path : "/Bilan",
    element: <BilanHydrique />,
    roles: ['ROLE_ADMIN',"ROLE_USER"] 

  },
  {
    name: 'UserProfileLite',
    path: "/user-profile",
    element: <UserProfileLite />,
    roles: ['ROLE_ADMIN',"ROLE_USER"] 

  },
  {
    name: 'Reports',
    path : "/my-reports",
    element: <Reports />,
    roles: ['ROLE_ADMIN',"ROLE_USER"] 

  },
  {
    name: 'Simulations',
    path : "/Simulations/:idSimulation",

    element: <MySimulations />,
    roles: ['ROLE_ADMIN',"ROLE_USER"] 

  },
  {
    name: 'AllNotifications',
    path : "/notifications",
    element: <AllNotifications />,
    roles: ['ROLE_ADMIN',"ROLE_USER"] 

  },
  {
    name: 'SatelliteImages',
    path: "/satellite-images",

    element: <SatelliteImages />,
    roles: ['ROLE_ADMIN',"ROLE_USER"] 

  },
  {
    name: 'add-farm',
    path: "/add-farm",

    element: <AddFram />,
    roles: ['ROLE_ADMIN',"ROLE_USER"] 

  },
  {
    name: 'add-field',
    path: "/add-field",

    element: <AddFarmField />,
    roles: ['ROLE_ADMIN',"ROLE_USER"] 

  },
  {
    name: 'add soil Info',
    path: "/add-soil-info",

    element: <SoilInfo />,
    roles: ['ROLE_ADMIN',"ROLE_USER"] 

  },
  {
    name: 'add crop Info',
    path: "/add-crop-info",

    element: <AddCropInfo />,
    roles: ['ROLE_ADMIN',"ROLE_USER"] 

  },
  {
    name: 'addIrrigation',
    path: "/add-irrigation",

    element: <AddIrrigation />,
    roles: ['ROLE_ADMIN',"ROLE_USER"] 

  },
 
];

export default protectedRoutes;