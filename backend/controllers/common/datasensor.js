const Field = require('./../../models/Field.js');
const Farm = require('./../../models/Farm.js');
const User = require('./../../models/User.js');
const Sensor = require('./../../models/Sensor.js');
const Datasensor = require('../../models/Datasensor.js');


const { body, validationResult } = require('express-validator');

const getDataSensorsByConnectedUser = async (req, res) => {
    if(!(req.userUid) || req.userUid == "") return res.status(404).json({ type:"danger", message: "no_user"});
    const uid  = req.userUid;
    
    try {
        const user = await new User({'uid': uid})
        .fetch({withRelated: [{'datasensors': (qb) => { qb.where('deleted_at', null).orderBy('id','ASC') }}], require: false})
        .then(async result => {
            if(result == null) return res.status(404).json({ type:"danger", message: "no_user"});
            let data = result.related('datasensors');
            if(result) return res.status(201).json({type : "success" , Datasensor : data });
        });
    } catch (error) {
        return res.status(500).json({ type:"danger", message: error });
    }
}

const getDataSensorsByCode = async (req, res) => {
    const code = req.body.code;
    if(!(code) || code == "") return res.status(404).json({ type:"danger", message: "no_sensor_code"});


    try {
        const datasensor = await new Datasensor()
        .query((qb) => { qb.where('deleted_at', null).andWhere('code' , '=' , code).orderBy('time' ,'DESC') })
        .fetch({ require : false})
        .then(async result => {
            if (result === null) return res.status(404).json({ type:"danger", message: "no_datasensor"});
            if(result){
                return res.status(201).json({type : "success" , Datasensor : result });
            }
        }).catch(err => {
            return res.status(500).json({ type:"danger", message: 'error_get_datasensors' });
        });
    } catch (error) {
        return res.status(500).json({ type:"danger", message: error });
    }
}

const addDataSensor = async (req, res) => {

    const { sensor_uid,user_uid,datasensor } = req.body;

    let time = ""
    let code = ""
    let temperature = ""
    let humidity = ""
    let pressure = ""
    let charge = ""
    let adc = ""
    let ts = ""
    let mv1 = ""
    let mv2 = ""
    let mv3 = ""
    let altitude = ""

    if (datasensor) {
        datasensor.map(data => {
            time = data.time;
            code = data.ref;
            temperature = data.temperature;
            humidity = data.humidity;
            pressure = data.pressure;
            charge = data.charge;
            adc = data.adc;
            ts = data.ts;
            mv1 = data.mv1;
            mv2 = data.mv2;
            mv3 = data.mv3;
            altitude = data.altitude;


        })
    }
    let sensor_id = "";
    const sensor = await new Sensor({'uid': sensor_uid, deleted_at: null})
    .fetch({require: false})
    .then(async result => {
      if(result === null) return res.status(404).json({ type:"danger", message: "no_sensor_selected"});
      sensor_id = result.get('id');
    });
    let user_id = "";
    const user = await new User({'uid': user_uid, deleted_at: null})
    .fetch({require: false})
    .then(async result => {
      if(result === null) return res.status(404).json({ type:"danger", message: "no_user_selected"});
      user_id = result.get('id');
    });
    try {

        await new Datasensor({sensor_id : sensor_id,user_id : user_id, time, code, temperature, humidity, pressure, charge, adc, ts, mv1, mv2, mv3, altitude }).save()
            .then((result) => {
                return res.status(201).json({ type: "success", datasensor: result });
            }).catch(err => {
                return res.status(500).json({ type: "danger", message: "error_save_datasensor" });
            });


    } catch (error) {
        res.status(500).json({ type: "danger", message: "error_user" });
    }
}




module.exports = { addDataSensor ,getDataSensorsByConnectedUser,getDataSensorsByCode }