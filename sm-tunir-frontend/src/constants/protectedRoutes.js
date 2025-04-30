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
  // {
  //   name: 'Profile',
  //   path: '/profile',
  //   element: <Profile />,
  //   roles: ['admin'] 

  // },
];

export default protectedRoutes;