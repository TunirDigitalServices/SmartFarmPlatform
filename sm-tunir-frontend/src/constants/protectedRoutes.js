import Dashboard from '../components/Simulation/Dashboard';
import Fields from '../views/Field';
import Sensors from '../views/Sensors'
import SatelliteImages from '../pages/sateliteImages/SateliteImages';
import Simulations from '../pages/mysimulations/Mysimulations';
import Calendar from '../views/Calendar';
import Weather from '../views/Weather';
import FieldSettings from '../pages/fieldsSettings/FieldsSettings';
import EditSensorByAdmin from '../views/EditSensorByAdmin';
import Overview from '../views/Overview';
import AdminBoard from '../admin/AdminBoard';
import SensorsManagement from "../admin/SensorsManagement";
import AddSensor from "../admin/AddSensor"
import SensorHistory from "../views/SensorHistory"
import AddSupplier from "../supplier/AddSupplier"
import AllSuppliers from "../admin/AllSuppliers"
import AddUser from "../admin/AddUser"
import FieldsManagement from "../admin/FieldsManagement"
import CalculSimulation from "../admin/CalculSimulation"
import CommandeManagement from "../admin/CommandeManagement"
import AddEquipmentByAdmin from "../admin/AddEquipment"
// import Profile from '../pages/Profile'

const protectedRoutes = [
  {
    name: 'Dashboard',
    path: '/dashboard',
    element: <Dashboard />,
    roles: ['ROLE_ADMIN','user','guest'] 
  },
  {
    name: 'Fields',
    path: '/fields/:id',
    element: <Fields />,
    roles: ['ROLE_USER','user',"ROLE_ADMIN"] 

  },
  {
    name: 'Sensors',
    path: '/sensors/:id',
    element: <Sensors />,
    roles: ['ROLE_ADMIN','guest',"ROLE_USER"] 
  },
  {
    name: 'Satellite Images',
    path: '/satellite-images',
    element: <SatelliteImages />,
    roles: ['ROLE_ADMIN'] 

  },
  {
    name: 'My Simulations',
    path: '/simulations',
    element: <Simulations />,
    roles: ['ROLE_ADMIN','user'] 
  },
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
    name: 'Fields Settings',
    path: '/fields-settings',
    element: <FieldSettings />,
    roles: ['ROLE_ADMIN'] 

  },
  // {
  //   name: 'Sensors Settings',
  //   path: '/sensors-settings',
  //   element: <SensorSettings />,
  //   roles: ['ROLE_ADMIN'] 

  // },
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
    name: 'admin Board',
    path : "/admin/users",
    element: <AdminBoard />,
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
    element: <AddSensor />,
    roles: ['ROLE_ADMIN'] 

  },
  {
    name: 'sensor-history',
    path : "/my-history/:id",

    element: <SensorHistory />,
    roles: ['ROLE_ADMIN'] 

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
  // {
  //   name: 'Profile',
  //   path: '/profile',
  //   element: <Profile />,
  //   roles: ['admin'] 

  // },
];

export default protectedRoutes;