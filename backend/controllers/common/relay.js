const Farm = require('./../../models/Farm.js');
const User = require('./../../models/User.js');
const Equipment = require('./../../models/Equipment.js');
const Relay = require('./../../models/Relay')


const { body, validationResult } = require('express-validator');

const getRelaysByEquipment = async (req, res) => {
    let equipment_uid = req.body.equipment_uid
    
    try {
        const equipment = await new Equipment({'uid': equipment_uid})
        .fetch({withRelated: [{'relays': (qb) => { qb.where('deleted_at', null); }}], require: false})
        .then(async result => {
            if(result == null) return res.status(404).json({ type:"danger", message: "no_equipment"});
            let data = result.related('relays');
            if(result) return res.status(201).json(data);
        });
    } catch (error) {
        return res.status(500).json({ type:"danger", message: "error_user" });
    }
}

const addRelay = async (req, res) => {
  
    const { name , equipment_uid} = req.body;

    // let user_id_Equipment = "";
    // const user = await new User({'uid': user_uid, deleted_at: null})
    // .fetch({require: false})
    // .then(async result => {
    //   if(result === null) return res.status(404).json({ type:"danger", message: "no_user_selected"});
    //   user_id_Equipment = result.get('id');
    // });

    try {
        await new Relay({name}).save()
        .then((result) => {
            return res.status(201).json({ type:"success", Relay : result });
        }).catch(err => {
            return res.status(500).json({ type:"danger", message: "error_save_Relay" });
        });
    } catch (error) {
        res.status(500).json({ type:"danger", message: "error_user" });
    }
}


module.exports = {addRelay , getRelaysByEquipment}