const express = require('express')
const {profil, uploadPicture,editProfil,validateProfil, changePassword} = require('../controllers/common/profil.js')
const {getFarmsByConnectedUser, addFarm, editFarm, deleteFarm, validateFarm, getSingleFarm, setFarmPosition} = require('../controllers/common/farm.js')
const {getFieldsByConnectedUser,getSingleField,searchField, addFiel, editField, deleteField, getFieldsByFarm, validateField, getFieldsByStatus, addEvent, getEvents, editEvent, deleteEvent, getSatteliteImages} = require('../controllers/common/field.js')
const {getCropsByConnectedUser,getSingleCrop, getCropsByField, addCrop, editCrop, deleteCrop, validateCrop} = require('../controllers/common/crop.js')
const {getSensorsByConnectedUser,getSingleSensor, getSensorsByField, addSensor, editSensor, deleteSensor, searchSensorsByCode, validateSensor, addSensorPosition, activateSynch, updateSensorsApiByUser, getSensorsHistory, getSunRadiation, mappingMv, getSingleSensorAllData, editDataMappingByUser} = require('../controllers/common/sensor.js')
const {getIrrigationsByConnectedUser,getSingleIrrigation,getIrrigationsByCrop,searchIrrigationsByType,addIrrigation,deleteIrrigation,editIrrigation,validateIrrigation} = require('../controllers/common/irrigation');
const { getOverviewFields, getOverviewSensors} = require('../controllers/common/dashboard')
const {getZonesByField,getSingleZone,getZonesByCrop,addZone,getZonesByConnectedUser , editZone ,deleteZone ,validateZone} = require('../controllers/common/zone')

const {auth} = require('../middelwares/auth.js')

const {authApiExternal} = require('../middelwares/authApiExternal.js')
const { addEquipment, getEquipmentsByConnectedUser, editEquipment, deleteEquipment, getSingleEquipment } = require('../controllers/common/equipment.js')
const {getWeatherData} = require('../controllers/common/weather.js')
const { addRelay, getRelaysByEquipment } = require('../controllers/common/relay.js')
const { addPlanning, editPlanning, deletePlanning, getPlanningByConnectedUser } = require('../controllers/common/planning.js')
const { addDataSensor, getDataSensorsByConnectedUser, getDataSensorsByCode } = require('../controllers/common/datasensor.js')
const { getCities } = require('../controllers/common/cities.js')
const { getCropType } = require('../controllers/common/croptype.js')
const { calculSimulation, deleteSimulation, getSimulationsByConnectedUser, getSingleSimulation, validateSimulation, editSimulation, getAllSimulationsByConnectedUser } = require('../controllers/simulationFree/Simulation.js')
const { calculBilanHydrique, getCalculSensor, generatePDF, createBulletin, sendSMStoUsers, getAllCalculByUser, getAllCalculByField, calculBilanHydriqueByField } = require('../controllers/premiumCalcul/calculPremium.js')
const { downloadReport } = require('../reports/report.js')
const { createHistory, addSensorsHistory, getSensorHistory } = require('../controllers/common/history.js')
const { addSatelliteImages, getSatelliteImages, getSatelliteImagesUrls } = require('../controllers/common/satellite.js')





const router = express.Router();

router.get('/profil',auth, profil);
router.post('/edit-profil',auth, editProfil);
router.post('/profil/changepassword',auth,validateProfil('changePassword'),changePassword)
router.post('/upload-avatar',auth, uploadPicture);

/*********** FARM *********************/
router.get('/farm/farms',auth, getFarmsByConnectedUser);
router.post('/farm',auth,getSingleFarm)
router.post('/farm/add-farm',auth, validateFarm('addEdit'), addFarm);
router.post('/farm/edit-farm',auth, validateFarm('addEdit'), editFarm);
router.delete('/farm/delete-farm',auth, deleteFarm);
router.post('/farm/set-farm-position',auth, setFarmPosition);


/*********** FIELD *********************/
router.get('/field/fields',auth, getFieldsByConnectedUser);
router.post('/field',auth,getSingleField);
router.get('/farm/:uid/field',auth, getFieldsByFarm);
router.post('/field/field-status',auth, getFieldsByStatus);
router.post('/field/add-field',auth,validateField('addEdit') ,addFiel);
router.post('/field/edit-field',auth, editField);
router.delete('/field/delete-field',auth, deleteField);
router.post('/field/search-field',auth ,searchField);
router.post('/field/add-event',auth,addEvent)
router.get('/field/get-event/:Uid',auth,getEvents)
router.post('/field/edit-event',auth,editEvent)
router.post('/field/delete-event',auth,deleteEvent)
/*********** CROP *********************/
router.get('/crop/crops',auth, getCropsByConnectedUser);
router.post('/crop',auth,getSingleCrop);
router.get('/field/:uid/crops',auth, getCropsByField);
router.post('/crop/add-crop',auth,validateCrop('addEdit'),addCrop);
router.post('/crop/edit-crop',auth, editCrop);
router.delete('/crop/delete-crop',auth, deleteCrop);
/*********** SEONSOR *********************/
router.get('/sensor/sensors',auth, getSensorsByConnectedUser);
router.post('/sensor',auth, getSingleSensor);
router.get('/field/:uid/sensors',auth, getSensorsByField);
router.post('/list-sensors',auth, searchSensorsByCode);
router.post('/sensor/add-sensor',auth,validateSensor('addEdit'), addSensor);
router.post('/sensor/edit-sensor',auth, editSensor);
router.delete('/sensor/delete-sensor',auth, deleteSensor);
router.post('/sensor/activate-synch',auth,activateSynch)
router.get('/sensor/single-sensor/:id',auth, getSingleSensorAllData);
router.post('/sensor/edit-mapping',auth,editDataMappingByUser)

// router.post('/get-data-sensor',auth, getDataSensorFromElastic);
router.post('/sensor/sensor-positon',auth,addSensorPosition);
router.post('/sensor/sensor-update-data',auth,updateSensorsApiByUser);
router.post('/sensor/sensor-mapping',auth,mappingMv);
router.get('/sensor/sensor-history/:codeSensor/:dateStart/:dateEnd',auth,getSensorsHistory)
// router.get('/sensor/sensor-history/:codeSensor',auth,getSensorHistory)
router.post('/history/save-history',auth,createHistory)
router.post('/history/save-all-history',addSensorsHistory)
router.get('/radiation',auth,getSunRadiation)
/*********** IRRIGATION *********************/
router.get('/irrigation/irrigations',auth, getIrrigationsByConnectedUser);
router.post('/irrigation',auth,getSingleIrrigation)
router.get('/crop/:uid/irrigations',auth,getIrrigationsByCrop)
router.post('/list-irrigations',auth,searchIrrigationsByType)
router.post('/irrigation/add-irrigation',auth,validateIrrigation('addEdit'),addIrrigation)
router.post('/irrigation/edit-irrigation',auth,validateIrrigation('addEdit'),editIrrigation);
router.delete('/irrigation/delete-irrigation',auth,deleteIrrigation);
/*********** DASHBOARD *********************/

router.get('/dashboard/fields' ,auth,getOverviewFields)
router.get('/dashboard/sensors',auth,getOverviewSensors)

/***************ZONE*********************/
router.get('/zone/zones',auth,getZonesByConnectedUser)
router.post('/zone',auth,getSingleZone);
router.get('/field/:uid/zones', auth , getZonesByField)
router.get('/crop/:uid/zones', auth , getZonesByCrop)
router.post('/zone/add-zone',auth,validateZone('addEdit'),addZone)
router.post('/zone/edit-zone',auth,editZone);
router.delete('/zone/delete-zone',auth,deleteZone);

/***************EQUIPMENT*********************/
router.get('/equipment/equipments',auth,getEquipmentsByConnectedUser)
router.post('/equipment/single-equipment',auth,getSingleEquipment);

router.post('/equipment/add-equipment',auth,addEquipment)
router.post('/equipment/edit-equipment',auth,editEquipment);
router.delete('/equipment/delete-equipment',auth,deleteEquipment);

/***************WEATHER*********************/
router.post('/weather/get-data',auth,getWeatherData)

/***************RELAY*********************/

router.post('/relay/relays',auth,getRelaysByEquipment)
router.post('/relay/add-relay',auth,addRelay)


/***************Planning*********************/
router.get('/planning/plannings',auth,getPlanningByConnectedUser)
router.post('/planning/add-planning',auth,addPlanning)
router.post('/planning/edit-planning',auth,editPlanning)
router.delete('/planning/delete-planning',auth,deletePlanning)


/***************DataSensor*********************/
router.get('/datasensor/get-data',auth, getDataSensorsByConnectedUser);
router.post('/datasensor/get-bycode',auth,getDataSensorsByCode)
router.post('/datasensor/add-data',auth,addDataSensor)


/***************Bilan*********************/
router.get('/cities/list-cities',auth,getCities)
router.get('/croptype/list-crop',auth,getCropType)

/***************Simulation*********************/
router.post('/simulation/calcul-simulation',validateSimulation('addEdit'),auth,calculSimulation)
router.post('/simulation/edit-simulation',validateSimulation('addEdit'),auth,editSimulation)

router.get('/simulation/get-simulations',auth,getSimulationsByConnectedUser)
router.get('/simulation/get-all-simulations',auth,getAllSimulationsByConnectedUser)
router.get('/simulation/single-simulation/:id',auth,getSingleSimulation)
router.delete('/simulation/delete-simulation',auth,deleteSimulation)

/***************Sensor Calcul*********************/
router.post('/calcul/add-sensor-calcul',calculBilanHydrique)
router.post('/calcul/field-sensor-calcul',calculBilanHydriqueByField)
router.get('/calcul/get-sensor-calcul',auth,getCalculSensor)
router.get('/generatePDF',generatePDF)
router.get('/createBulletin',createBulletin)
router.post('/send-sms',sendSMStoUsers)
router.post('/report/download',auth,downloadReport)
router.get('/calcul/all-calcul', auth,getAllCalculByUser)
router.get('/calcul/field-calcul/:fieldUid',auth,getAllCalculByField)
/***************external api supplier sensor*********************/
router.get('/api-external-sensor/:token/:sensorCode',authApiExternal,getCalculSensor)

/***************Sattelite Images*********************/
router.post('/api/sattelite-images',getSatteliteImages)
router.post('/field/add-sattelite-images',auth,addSatelliteImages)
router.get('/field/get-sattelite-images/:fieldId', auth,getSatelliteImages)
router.get('/satellite-images/:userId/:fieldId/:date',auth,getSatelliteImagesUrls)

module.exports = router;