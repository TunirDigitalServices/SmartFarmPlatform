const express = require('express')
const router = express.Router()
const {auth} = require('../middelwares/auth.js')
const {addSupplier ,validateAddSupplier, getSupplierByConnectedUser, editSupplier} = require('../controllers/supplier/register')
const {addUser , getUsers, assignSensorToUser} = require('../controllers/supplier/users')
const { editProfil, deleteUser, searchUser, desactiveUser, activeUser } = require('../controllers/admin/users.js')
const { getSensors, addSensorToUser, updateSensorsApiByField, getCalculSensorBySupplier, getDataByConnectedSupplier } = require('../controllers/supplier/sensor.js')
const { validAccount } = require('../controllers/user/signup.js')
const { getFields } = require('../controllers/supplier/field.js')
//ADD 

router.post('/supplier/add-supplier',auth,validateAddSupplier('register'),addSupplier)
router.post('/supplier/edit-supplier',auth,editSupplier)
router.get('/supplier/suppliers',auth,getSupplierByConnectedUser)

//USERS
router.post('/supplier/assign-sensor',auth,assignSensorToUser)
router.get('/supplier/get-users',auth,getUsers);
router.post('/supplier/add-user',auth,addUser);
router.get('/valid-account/:tovalid',validAccount);
router.post('/supplier/edit-user',auth,editProfil);
router.delete('/supplier/delete-user',auth ,deleteUser);
router.post('/supplier/search-user',auth ,searchUser);
router.post('/supplier/desactivate-user',desactiveUser);
router.post('/supplier/activate-user',activeUser);

//Sensors
router.post('/supplier/add-sensor',auth,addSensorToUser)
router.get('/supplier/get-sensors',auth,getSensors);
router.post('/supplier/sensor-data',auth,updateSensorsApiByField)
router.get('/supplier/get-sensor-calcul/:userId/:sensorCode',auth,getCalculSensorBySupplier)
router.post('/supplier/get-sensors-data',auth , getDataByConnectedSupplier)
//fields
router.get('/supplier/get-fields',auth,getFields);



module.exports = router;