const express = require('express')
const {getSubscriptions, addSubscription, editSubscriptions, deleteSubscriptions,activateSub,desactivateSub, getSubscriptionByUser} = require('../controllers/admin/subscription.js')
const {auth} = require('../middelwares/auth.js')
const {getAllFarms, getFarmsByUser,deleteFarm,getSingleFarm} = require('../controllers/admin/farm.js')
const {getSensorsByUser,addSensor,editSensor ,getSingleSensor, getSensors, getSingleSensorByCode, editDataMapping, addMapping, deleteDataMapping, getInactiveSensors} = require('../controllers/admin/sensor.js')
const {getFieldsByUser, getAllFields, getFieldById, calculSimulation} = require('../controllers/admin/field.js')
const {getUsers , getSingleUser,deleteUser,addUser,editUser,desactiveUser,activeUser,searchUser,changeOffer,changeRole,editProfil, getExistUsers, getExistUsersSuppliers, changeHasCommand, confirmUser} = require('../controllers/admin/users')
const {getCropsByUser} = require('../controllers/admin/crops')
const {addFarm,editFarm} = require('../controllers/common/farm')
const { deleteSensor  } = require('../controllers/common/sensor.js')
const {deleteField ,editField,getSingleField} = require('../controllers/common/field')
const { getSuppliers, getSingleSupplier, editSupplier, getExistSuppliers } = require('../controllers/admin/supplier.js')
const { addRecommendation, getAllRecommendation, getRecommendationByConnectedUser, getViewedRecommendation, getSingleRecommendation, asReadRecommendation, getRecommendationsByField, asNotReadRecommendation, getRecommendationsByUser } = require('../controllers/admin/recommendation.js')
const { addNotification, getNotifByConnectedUser, asReadNotification, getAllNotification, asNotReadNotification } = require('../controllers/admin/notification.js')
const { addEquipment, getEquipments, assignEquipmentToUser } = require('../controllers/admin/equipment.js')
const {getCollectDataWeather, getSearchCollectDataWeather} = require('../controllers/admin/weather_colect')

const { getCitiesWeather, addCitiesWeather } = require('../controllers/admin/citiesweather.js')
const { addCities, addCrops, getCountries, getSingleCountry, getCitiesByCountry, editCities, deleteCities, getSingleCity, getCrops, deleteCrop, editCrop, getSingleCrop, getSoils, editSoil, deleteSoil, getSingleSoil, addSoils, addIrrigations, getSingleIrrigation, getIrrigations, editIrrigation, deleteIrrigation, addVariety, deleteCropVariety, getVarieties, editVariety, getSingleCropVariety, addCountries, getCities, uploadCropPicture, uploadSoilPicture, uploadVarietyPicture } = require('../controllers/admin/config.js')
const { getReportsByField, sendSMStoSelectedUser, calculBilanHydriqueByField, EditBilanHydriqueByField } = require('../controllers/premiumCalcul/calculPremium.js')
const { sendMailSensorState, sendReportByMail } = require('../services/sendMail.js')







const router = express.Router();
 
// USERS
router.get('/admin/users' , auth, getUsers);
router.get('/admin/exist-users' , auth, getExistUsers);
// router.get('/admin/exist-suppliers' , auth, getExistUsersSuppliers);
router.post('/admin/single-user',auth ,getSingleUser)
router.post('/admin/add-user',auth,addUser);
// router.post('/admin/edit-user',auth , editUser);
router.post('/admin/desactivate-user',desactiveUser);
router.post('/admin/activate-user',activeUser);
router.post('/admin/confirm-user',confirmUser);
router.delete('/admin/delete-user',auth ,deleteUser);
router.post('/admin/search-user',auth ,searchUser);
router.post('/admin/change-offer',auth ,changeOffer);
router.post('/admin/change-role',auth,changeRole);
router.post('/admin/edit-profil',auth,editProfil);
router.post('/admin/change-has-command',auth,changeHasCommand);
// SUBSCRIPTIONS
router.get('/admin/subscriptions',auth, getSubscriptions);
router.get('/admin/subscription/:uid',auth, getSubscriptionByUser);
router.post('/admin/add-subscription',auth, addSubscription);
router.delete('/admin/delete-subscription',auth, deleteSubscriptions);
router.post('/admin/desactivate-subscription',auth, desactivateSub);
router.post('/admin/activate-subscription',activateSub);

// FARMS
router.get('/admin/all-farms',auth, getAllFarms);
router.get('/admin/user/:uid/farms',auth, getFarmsByUser);
router.post('/admin/single-farm',auth,getSingleFarm)
router.post('/admin/add-farm' , auth ,addFarm);
router.post('/admin/edit-farm' , auth ,editFarm);
router.delete('/admin/delete-farm' ,auth,deleteFarm);


// SENSORS
router.get('/admin/all-sensors',auth, getSensors);
router.get('/admin/user/:uid/sensors',auth, getSensorsByUser);
router.post('/admin/add-sensor', auth ,addSensor);
router.get('/admin/single-sensor/:id',auth, getSingleSensor);
router.post('/admin/edit-mapping',auth,editDataMapping)
router.post('/admin/add-mapping',auth,addMapping)
router.delete('/admin/delete-mapping' ,auth,deleteDataMapping);
router.post('/admin/edit-sensor', auth ,editSensor);
router.post('/admin/send-notification-email' ,auth, sendMailSensorState)
router.post('/admin/send-report-email' ,auth, sendReportByMail)
router.get('/admin/check-sensor-status', auth ,getInactiveSensors);
router.delete('/admin/delete-sensor' ,auth,deleteSensor);

// FIELDS
router.get('/admin/user/:uid/fields',auth, getFieldsByUser);
router.post('/admin/single-field',auth, getSingleField);
router.post('/admin/edit-field' , auth ,editField);
router.delete('/admin/delete-field' ,auth,deleteField);
// CROPS
// router.get('/admin/user/:uid/crops',auth, getCropsByUser);


// SUPPLIER
router.post('/admin/edit-supplier',auth,editSupplier)
router.get('/admin/suppliers',auth,getSuppliers)
router.get('/admin/exist-suppliers',auth,getExistSuppliers)
router.post('/admin/single-supplier',auth,getSingleSupplier)

//RECOMMENDATIONS
router.get('/admin/recommendations',auth,getAllRecommendation)
router.get('/recommendation/viewed-recommendations',auth,getViewedRecommendation)
router.get('/recommendation/recommendations/:id',auth,getRecommendationByConnectedUser)
router.get('/recommendations/:id',auth,getRecommendationsByField)
router.get('/recommendations/:user/:id',auth,getRecommendationsByUser)
router.post('/recommendation/single-recommendation',auth,getSingleRecommendation)
router.post('/admin/add-recommendation',auth,addRecommendation)
router.post('/recommendation/viewed',auth,asReadRecommendation)
router.post('/recommendation/not-viewed',auth,asNotReadRecommendation)


//Notifications

router.post('/admin/add-notification',auth,addNotification)
router.get('/notification/notifications',auth,getNotifByConnectedUser)
router.post('/notification/viewed',auth,asReadNotification)
router.post('/notification/not-viewed',auth,asNotReadNotification)
router.get('/notification/all-notifications',auth,getAllNotification)

//EQUIPMENTS
router.get('/admin/all-equipments',auth,getEquipments)
router.post('/admin/add-equipment',auth,addEquipment)
router.post('/admin/assign-equipment',auth,assignEquipmentToUser)

router.get('/admin/weather-collect',auth,getCollectDataWeather)
router.post('/admin/weather-collect/search',auth,getSearchCollectDataWeather)




//Bilan Hydrique Data 

router.get('/admin/get-weatherData',auth,getCitiesWeather)
router.post('/admin/add-citiesWeather',auth,addCitiesWeather)

//Config
router.post('/crops/add-crops',auth,addCrops)
router.post('/crops/get-crop',auth,getSingleCrop)
router.get('/crops/get-crops',auth,getCrops)
router.post('/crops/edit-crop',auth,editCrop)
router.delete('/crops/delete-crop',auth,deleteCrop)
router.post('/crop/upload-photo',auth,uploadCropPicture)


router.post('/varieties/add-varieties',auth,addVariety)
router.post('/varieties/get-variety',auth,getSingleCropVariety)
router.get('/varieties/get-varieties',auth,getVarieties)
router.post('/varieties/edit-variety',auth,editVariety)
router.delete('/varieties/delete-variety',auth,deleteCropVariety)
router.post('/variety/upload-photo',auth,uploadVarietyPicture)

router.post('/soils/add-soils',auth,addSoils)
router.post('/soils/get-soil',auth,getSingleSoil)
router.get('/soils/get-soils',auth,getSoils)
router.post('/soils/edit-soil',auth,editSoil)
router.delete('/soils/delete-soil',auth,deleteSoil)
router.post('/soil/upload-photo',auth,uploadSoilPicture)


router.post('/irrigations/add-irrigations',auth,addIrrigations)
router.post('/irrigations/get-irrigation',auth,getSingleIrrigation)
router.get('/irrigations/get-irrigations',auth,getIrrigations)
router.post('/irrigations/edit-irrigation',auth,editIrrigation)
router.delete('/irrigations/delete-irrigation',auth,deleteIrrigation)

router.get('/countries/get-countries',auth,getCountries)
router.post('/countries/get-country',auth,getSingleCountry)
router.post('/countries/add-country',auth,addCountries)
router.post('/cities/get-city',auth,getSingleCity)
router.get('/cities/get-cities',auth,getCities)
router.post('/cities/add-cities',auth,addCities)
router.get('/cities/get-cities/:iso',auth,getCitiesByCountry)
router.post('/cities/edit-city',auth,editCities)
router.delete('/cities/delete-city',auth,deleteCities)

router.get('/admin/fields',auth,getAllFields)
router.get('/admin/fields/:fieldId',auth,getFieldById)
router.post('/admin/calculSimulation',auth,calculSimulation)
router.post('/admin/fields/single-field',auth,getReportsByField)
router.post('/admin/send-sms',auth,sendSMStoSelectedUser)
router.post('/admin/field-sensor-calcul',auth,calculBilanHydriqueByField)
router.post('/admin/edit-bilan-hydrique',auth,EditBilanHydriqueByField)

module.exports = router;