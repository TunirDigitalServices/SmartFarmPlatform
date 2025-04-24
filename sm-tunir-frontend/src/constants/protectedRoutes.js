import Dashboard from '../pages/dashboard/dashboard';
import Fields from '../pages/fields/fields';
import Sensors from '../pages/sensors/Sensors';
import SatelliteImages from '../pages/sateliteImages/SateliteImages';
import Simulations from '../pages/mysimulations/Mysimulations';
import Calendar from '../pages/calendar/Calendar';
import Weather from '../pages/weatherForecast/WeatherForcast';
import FieldSettings from '../pages/fieldsSettings/FieldsSettings';
import SensorSettings from '../pages/sensorsSettings/SensorsSettings';
import Profile from '../pages/Profile'

const protectedRoutes = [
  {
    name: 'Dashboard',
    path: '/dashboard',
    element: <Dashboard />,
    roles: ['admin','user','guest'] 
  },
  {
    name: 'Fields',
    path: '/fields',
    element: <Fields />,
    roles: ['admin','user'] 

  },
  {
    name: 'Sensors',
    path: '/sensors',
    element: <Sensors />,
    roles: ['admin','guest'] 
  },
  {
    name: 'Satellite Images',
    path: '/satellite-images',
    element: <SatelliteImages />,
    roles: ['guest'] 

  },
  {
    name: 'My Simulations',
    path: '/simulations',
    element: <Simulations />,
    roles: ['admin','user'] 
  },
  {
    name: 'Calendar',
    path: '/calendar',
    element: <Calendar />,
    roles: ['guest'] 

  },
  {
    name: 'Weather Forecast',
    path: '/weather',
    element: <Weather />,
    roles: ['guest'] 

  },
  {
    name: 'Fields Settings',
    path: '/fields-settings',
    element: <FieldSettings />,
    roles: ['guest'] 

  },
  {
    name: 'Sensors Settings',
    path: '/sensors-settings',
    element: <SensorSettings />,
    roles: ['admin'] 

  },
  {
    name: 'Profile',
    path: '/profile',
    element: <Profile />,
    roles: ['admin'] 

  },
];

export default protectedRoutes;