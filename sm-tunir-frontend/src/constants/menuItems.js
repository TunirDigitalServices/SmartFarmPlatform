// src/constants/menuItems.js
import DashboardIcon from '@mui/icons-material/Dashboard';
import AgricultureIcon from '@mui/icons-material/Agriculture';
import SensorsIcon from '@mui/icons-material/Sensors';
import SatelliteAltIcon from '@mui/icons-material/SatelliteAlt';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import EventIcon from '@mui/icons-material/Event';
import CloudIcon from '@mui/icons-material/Cloud';
import SettingsIcon from '@mui/icons-material/Settings';
import TuneIcon from '@mui/icons-material/Tune';

const menuItems = [
  {
    name: 'Dashboard',
    path: '/dashboard',
    icon: <DashboardIcon />,
  },
  {
    name: 'Fields',
    path: '/fields',
    icon: <AgricultureIcon />,
  },
  {
    name: 'Sensors',
    path: '/sensors',
    icon: <SensorsIcon />,
  },
  {
    name: 'Satellite Images',
    path: '/satellite-images',
    icon: <SatelliteAltIcon />,
  },
  {
    name: 'My Simulations',
    path: '/simulations',
    icon: <SmartToyIcon />,
  },
  {
    name: 'Calendar',
    path: '/calendar',
    icon: <EventIcon />,
  },
  {
    name: 'Weather Forecast',
    path: '/weather',
    icon: <CloudIcon />,
  },
  {
    name: 'Fields Settings',
    path: '/fields/settings',
    icon: <SettingsIcon />,
  },
  {
    name: 'Sensors Setting',
    path: '/sensors/settings',
    icon: <TuneIcon />,
  },
];

export default menuItems;
