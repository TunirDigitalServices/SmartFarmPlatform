const Field = require('./../../models/Field.js');
const Sensor = require('./../../models/Sensor.js');
const User = require('./../../models/User')

const { body, validationResult } = require('express-validator')


const getOverviewFields = async (req,res) => {
 
    if(!(req.userUid) || req.userUid == "") return res.status(404).json({ type:"danger", message: "no_user"});
    const uid  = req.userUid;
    
    try {
        const user = await new User({'uid': uid})
        .fetch({withRelated: [{'farms.fields': (qb) => { qb.where('deleted_at', null); }},{'farms.fields.sensors': (qb) => { qb.where('deleted_at', null); }}], require: false})
        .then(async result => {
            if(result == null) return res.status(404).json({ type:"danger", message: "no_user"});
            if(result) return res.status(201).json({ farms: result.related('farms'), user_map_details: result });
        });
    } catch (error) {
        return res.status(500).json({ type:"danger", message: "error_user" });
    }

    
}


const getOverviewSensors = async (req,res) =>{

    if(!(req.userUid) || req.userUid == "" ) return res.status(404).json({ type:"danger", message: "no_user"});

    const uid = req.userUid;

    try {
        const user = await new User({'uid': uid})
        .fetch({withRelated: [{'sensors': (qb) => { qb.where('deleted_at', null); }}], require: false})
        .then(async result => {
            if(result == null) return res.status(404).json({ type:"danger", message: "no_user"});
            if(result) return res.status(201).json({ sensors: result.related('sensors') });
        });
    } catch (error) {
        return res.status(500).json({ type:"danger", message: "error_user" });
    }
}







module.exports = {getOverviewFields,getOverviewSensors}