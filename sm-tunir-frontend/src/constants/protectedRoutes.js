import Dashboard from '../pages/dashboard/dashboard';
import Fields from '../pages/fields/fields';
import Sensors from '../pages/sensors/Sensors';
import SatelliteImages from '../pages/sateliteImages/SateliteImages';
import Simulations from '../pages/mysimulations/Mysimulations';
import Calendar from '../pages/calendar/Calendar';
import Weather from '../pages/weatherForecast/WeatherForcast';
import FieldSettings from '../pages/fieldsSettings/FieldsSettings';
import SensorSettings from '../pages/sensorsSettings/SensorsSettings';

const protectedRoutes = [
  {
    name: 'Dashboard',
    path: '/dashboard',
    element: <Dashboard />,
  },
  {
    name: 'Fields',
    path: '/fields',
    element: <Fields />,
  },
  {
    name: 'Sensors',
    path: '/sensors',
    element: <Sensors />,
  },
  {
    name: 'Satellite Images',
    path: '/satellite-images',
    element: <SatelliteImages />,
  },
  {
    name: 'My Simulations',
    path: '/simulations',
    element: <Simulations />,
  },
  {
    name: 'Calendar',
    path: '/calendar',
    element: <Calendar />,
  },
  {
    name: 'Weather Forecast',
    path: '/weather',
    element: <Weather />,
  },
  {
    name: 'Fields Settings',
    path: '/fields/settings',
    element: <FieldSettings />,
  },
  {
    name: 'Sensors Settings',
    path: '/sensors/settings',
    element: <SensorSettings />,
  },
];

export default protectedRoutes;