import React, { useEffect } from "react";
import { Redirect } from "react-router-dom";

// Layout Types
import { DefaultLayout } from "./layouts";

// Route Views
import Overview from "./views/Overview";
import UserProfileLite from "./views/UserProfileLite";
import AddNewPost from "./views/AddNewPost";
import Errors from "./views/Errors";
import ComponentsOverview from "./views/ComponentsOverview";
import Field from "./views/Field";
import Graph from "./views/Graph";
import FieldSettings from "./views/FieldSettings";
import AddField from "./views/AddField";
import AddFarm from "./views/AddFarm";
import AddSensor from "./views/AddSensor";
import AddEquipment from "./views/AddEquipment";
import Weather from "./views/Weather";
import Sensors from "./views/Sensors";
import MyCalendar from "./views/Calendar";
import Commands from './views/Commands'
import EditUserDetail from "./admin/EditUserDetail"
import AdminBoard from "./admin/AdminBoard";
import FarmsList from "./admin/FarmsList";
import FieldsList from "./admin/FieldsList";
import SensorsList from "./admin/SensorsList"; 
import AddUser from "./admin/AddUser"; 
import SingleChart from "./components/blog/SingleChart";
import AddSupplier from "./supplier/AddSupplier";
import UsersManagement from "./supplier/UsersManagement";
import AddUserBySupplier from "./supplier/AddUserBySupplier"; 
import CompanyProfile from "./supplier/CompanyProfile";
import AllSuppliers from "./admin/AllSuppliers";
import SensorsManagement from "./admin/SensorsManagement";
import AddSensorByAdmin from "./admin/AddSensor";
import SupplierSensors from "./supplier/SupplierSensors";
import WeatherCollect from "./admin/WeatherCollect";
import Recommendations from "./admin/Recommendations";
import AllRecommendations from './views/AllRecommendations'
import Reports from './views/Reports'
import CommandeManagement from "./admin/CommandeManagement";
import AllNotifications from "./views/AllNotifications";
import SensorHistory from './views/SensorHistory'
import AddEquipmentByAdmin from "./admin/AddEquipment";
import CommandsPlanning from './views/CommandsPlanning'
import BilanHydrique from './components/Simulation/BilanHydrique'
import MySimulations from './components/Simulation/MySimulations'
import BilanHydriqueParams from "./admin/BilanHydriqueParams";
import Configuration from "./admin/ConfigurationCountries";
import CountryManagement from './admin/CountryManagement'
import ConfigurationCrops from "./admin/ConfigurationCrops";
import ConfigurationSoils from "./admin/ConfigurationSoils";
import ConfigurationIrrigation from "./admin/ConfigurationIrrigation";
import ConfigurationCropsVariety from "./admin/ConfigurationCropsVariety"
import ConfigurationCities from "./admin/ConfigurationCities";
import ConfigCitiesWeather from "./admin/ConfigCitiesWeather"
import Dashboard from "./components/Simulation/Dashboard";
import EditSensorByAdmin from "./views/EditSensorByAdmin";
import DashboardSupplier from "./supplier/DashboardSupplier";
import FieldsManagement from "./admin/FieldsManagement";
import SatelliteImages from "./views/SatelliteImages"
import SensorSettings from "./views/SensorSettings";



let offer =''
if(JSON.parse(localStorage.getItem('user'))){
  offer = JSON.parse(localStorage.getItem('user')).offer_type

}
let role =''
if(JSON.parse(localStorage.getItem('user'))){
  role = JSON.parse(localStorage.getItem('user')).role

}


//fonction verfi role change redirectLoginPage if role Admin

export default [
  {
    path: "/Login",
    layout: DefaultLayout,
    component: () => <Redirect to="/" />
  },
  {
    path: "/",
    exact: true,
    layout: DefaultLayout,
    //component: () => <Redirect to="/blog-overview" />
    component: offer ==="1" ? Dashboard :  Overview
  },
  {
    path: "/Dashboard",
    exact: true,
    layout: DefaultLayout,
    //component: () => <Redirect to="/blog-overview" />
    component: Dashboard
  },
  {
    path: "/AddField",
    layout: DefaultLayout,
    component: AddField
  },
  {
    path: "/Sensors",
    layout: DefaultLayout,
    component: Sensors
  },
  {
    path: "/Register",
    layout: DefaultLayout,
    component: () => <Redirect to="/" />
  },
  {
    path: "/Valid",
    layout: DefaultLayout,
    component: () => <Redirect to="/" />
  },
  {
    path: "/ForgotPwd",
    layout: DefaultLayout,
    component: () => <Redirect to="/" />
  },
  {
    path: "/NewPassword",
    layout: DefaultLayout,
    component: () => <Redirect to="/" />
  },
  {
    path: "/AddFarm",
    layout: DefaultLayout,
    component: AddFarm
  },
  {
    path: "/AddSensor",
    layout: DefaultLayout,
    component: AddSensor
  },
  {
    path: "/AddEquipment",
    layout: DefaultLayout,
    component: AddEquipment
  },
  {
    path: "/Fields",
    layout: DefaultLayout,
    component: Field
  },
  {
    path: "/FieldSettings",
    layout: DefaultLayout,
    component: FieldSettings
  },
  {
    path: "/Graphs",
    exact :true,
    layout: DefaultLayout,
    component: Graph
  },
  {
    path: "/Weather",
    layout: DefaultLayout,
    component: Weather
  },
  {
    path: "/satellite-images",
    layout: DefaultLayout,
    component: SatelliteImages
  },
  {
    path: "/Calendar",
    layout: DefaultLayout,
    component: MyCalendar
  },
  {
    path: "/user-profile",
    layout: DefaultLayout,
    component: UserProfileLite
  },
  {
    path: "/my-company",
    layout: DefaultLayout,
    component: CompanyProfile
  },
  {
    path: "/add-new-post",
    layout: DefaultLayout,
    component: AddNewPost
  },
  {
    path: "/errors",
    layout: DefaultLayout,
    component: Errors
  },
  {
    path: "/components-overview",
    layout: DefaultLayout,
    component: ComponentsOverview
  },
  {
    path : "/Graphs/:type",
    exact : true,
    layout : DefaultLayout,
    component : SingleChart
  },
  {
    path : "/recommendations/:id",
    exact : true,
    layout : DefaultLayout,
    component : AllRecommendations
  },
  {
    path : "/notifications",
    exact : true,
    layout : DefaultLayout,
    component : AllNotifications
  },
  {
    path : "/my-reports",
    exact : true,
    layout : DefaultLayout,
    component : Reports
  },
  {
    path : "/sensor-settings",
    exact : true,
    layout : DefaultLayout,
    component : SensorSettings
  },
  {
    path : "/my-history",
    exact : true,
    layout : DefaultLayout,
    component : SensorHistory
  },
  {
    path : "/my-history/:id",
    exact : true,
    layout : DefaultLayout,
    component : SensorHistory
  },
  
  {
    path : "/Commands",
    exact : true,
    layout : DefaultLayout,
    component : Commands
  },
  {
    path : "/Commands/planning",
    exact : true,
    layout : DefaultLayout,
    component : CommandsPlanning
  },
  {
    path : "/Bilan",
    exact : true,
    layout : DefaultLayout,
    component : BilanHydrique
  },
  {
    path : "/Simulations",
    layout : DefaultLayout,
    component : MySimulations
  },
  {
    path : "/admin/users",
    layout : DefaultLayout,
    component : AdminBoard
  },
  {
    path : "/admin/user/:uid",
    exact : true,
    layout : DefaultLayout,
    component : EditUserDetail
  },
  {
    path : "/admin/user/:uid/farms",
    layout : DefaultLayout,
    component : FarmsList
  },
  {
    path : "/admin/user/:uid/sensors",
    layout : DefaultLayout,
    component : SensorsList
  },
  {
    path : "/admin/user/:uid/fields",
    layout : DefaultLayout,
    component : FieldsList
  },
  {
    path : "/admin/add-user",
    exact : true,
    layout : DefaultLayout,
    component : AddUser
  },
  {
    path : "/admin/all-suppliers",
    exact : true,
    layout : DefaultLayout,
    component : AllSuppliers
  },
  {
    path : "/admin/sensors",
    exact : true,
    layout : DefaultLayout,
    component : SensorsManagement
  },
  {
    path : "/admin/add-sensor",
    exact : true,
    layout : DefaultLayout,
    component : AddSensorByAdmin
  },
  {
    path : "/admin/edit-sensor/:id",
    exact : true,
    layout : DefaultLayout,
    component : EditSensorByAdmin
  },
  {
    path : "/admin/user/:uid/recommendations",
    exact : true,
    layout : DefaultLayout,
    component : Recommendations 
  },
  {
    path : "/admin/collect-data/weather",
    exact : true,
    layout : DefaultLayout,
    component : WeatherCollect 
  },
  
  {
    path : "/admin/commande",
    exact : true,
    layout : DefaultLayout,
    component : CommandeManagement 
  },
  {
    path : "/admin/add-equipment",
    exact : true,
    layout : DefaultLayout,
    component :  AddEquipmentByAdmin
  },
  {
    path : "/admin/configuration",
    exact : true,
    layout : DefaultLayout,
    component :  Configuration
  },
  {
    path : "/admin/configuration/country/:iso",
    layout : DefaultLayout,
    component :  CountryManagement
  },
  {
    path : "/admin/configuration/cities",
    exact : true,
    layout : DefaultLayout,
    component :  ConfigurationCities
  },
  {
    path : "/admin/configuration/cities/weather/:id",
    layout : DefaultLayout,
    component :  ConfigCitiesWeather
  },
  {
    path : "/admin/configuration/crops",
    layout : DefaultLayout,
    component :  ConfigurationCrops
  },
  {
    path : "/admin/configuration/cropsVariety",
    layout : DefaultLayout,
    component :  ConfigurationCropsVariety
  },
  {
    path : "/admin/configuration/soils",
    layout : DefaultLayout,
    component :  ConfigurationSoils
  },
  {
    path : "/admin/configuration/irrigations",
    layout : DefaultLayout,
    component :  ConfigurationIrrigation
  },
  {
    path : "/admin/fields",
    layout : DefaultLayout,
    component :  FieldsManagement
  },
  {
    path : "/Dashboard-supplier",
    exact : true,
    layout : DefaultLayout,
    component : DashboardSupplier
  },
  {
    path : "/Supplier",
    exact : true,
    layout : DefaultLayout,
    component : AddSupplier
  },
  {
    path : "/supplier/users",
    exact : true,
    layout : DefaultLayout,
    component : UsersManagement
  },
  {
    path : "/supplier/add-user",
    exact : true,
    layout : DefaultLayout,
    component : AddUserBySupplier
  },
  {
    path : "/supplier/sensors",
    exact : true,
    layout : DefaultLayout,
    component : SupplierSensors
  },
  
];
