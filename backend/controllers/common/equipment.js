const Farm = require('./../../models/Farm.js');
const User = require('./../../models/User.js');
const Equipment = require('./../../models/Equipment.js');
const Relay = require('./../../models/Relay')


const { body, validationResult } = require('express-validator');

const getEquipmentsByConnectedUser = async (req, res) => {
    if(!(req.userUid) || req.userUid == "") return res.status(404).json({ type:"danger", message: "no_user"});
    const uid  = req.userUid;
    
    try {
        const user = await new User({'uid': uid})
        .fetch({withRelated: [{'equipments': (qb) => { qb.where('deleted_at', null); }}], require: false})
        .then(async result => {
            if(result == null) return res.status(404).json({ type:"danger", message: "no_user"});
            let data = result.related('equipments');
            if(result) return res.status(201).json(data);
        });
    } catch (error) {
        return res.status(500).json({ type:"danger", message: "error_user" });
    }
}

const getSingleEquipment = async (req, res) => {
    const equipment_uid  = req.body.equipment_uid;
    try {
        const equipment = await new Equipment({'uid': equipment_uid})
        .fetch({require: false})
        .then(async result => {
            if (result === null) return res.status(404).json({ type:"danger", message: "no_user_Equipment"});
            return res.status(201).json({ type:"success" , equipments: result });
        }); 
    } catch (error) {
        return res.status(500).json({ type:"danger", message: "error_user" });
    }
}


const addEquipment = async (req, res) => {
  
    if(!(req.body.farm_uid) || req.body.farm_uid == "") return res.status(404).json({ type:"danger", message: "no_farm_selected"});
  
    const {name, code, farm_uid,nbr_relays, port,user_uid } = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(422).json({ errors: errors.array() });
      return;
    }
    let user_id_Equipment = "";
    const user = await new User({'uid': user_uid, deleted_at: null})
    .fetch({require: false})
    .then(async result => {
      if(result === null) return res.status(404).json({ type:"danger", message: "no_user_selected"});
      user_id_Equipment = result.get('id');
    });

    try {
        const farm = new Farm({'uid': farm_uid, deleted_at: null})
        .fetch({require: false})
        .then(async result => {
            if (result === null) return res.status(404).json({ type:"danger", message: "no_farm"});
            if(result){
                await new Equipment({name, code,nbr_relays, farm_id :result.get('id'), user_id: user_id_Equipment}).save()
                .then(async (response) => { 
                    let {id} = response.toJSON(); 
                    Object.values(port).map(async (port,index)=>{
                        // console.log(item)
                        await new Relay({port , equipment_id : id}).save()
                    })
                })
                .then((result) => {
                    return res.status(201).json({ type:"success", Equipment : result });
                }).catch(err => {
                    return res.status(500).json({ type:"danger", message: "error_save_Equipment" });
                });
            }
        });        
    } catch (error) {
        res.status(500).json({ type:"danger", message: "error_user" });
    }
}

const editEquipment = async (req, res) => {
    
    const {name, code, user_uid,nbr_relays, equipment_uid } = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(422).json({ errors: errors.array() });
      return;
    }
    let user_id_Equipment = "";
    const user = await new User({'uid': user_uid, deleted_at: null})
    .fetch({require: false})
    .then(async result => {
      if(result === null) return res.status(404).json({ type:"danger", message: "no_user_selected"});
      user_id_Equipment = result.get('id');
    });
   
    try {
        const equipment = new Equipment({'uid': equipment_uid, deleted_at: null})
        .fetch({require: false})
        .then(async result => {
            if (result === null) return res.status(404).json({ type:"danger", message: "no_field"});
            if(result){
                result.set({ name ,code, nbr_relays,user_id: user_id_Equipment});
                result.save()
                .then((result) => {
                    return res.status(201).json({ type:"success", equipment : result });
                }).catch(err => {
                    return res.status(500).json({ type:"danger", message: "error_edit_Equipment" });
                });
            }
        });        
    } catch (error) {
        res.status(500).json({ type:"danger", message: "error_user" });
    }
}

const deleteEquipment = async (req, res) => {
    equipment_uid = req.body.equipment_uid;
    try {
        const equipment = new Equipment({'uid': equipment_uid})
        .fetch({require: false})
        .then(async result => {
            if (result === null) return res.status(404).json({ type:"danger", message: "no_Equipment"});
            if(result){
                result.set({deleted_at: new Date()});
                result.save()
                return res.status(201).json({ type:"success", message: 'Equipment_deleted' });
            }
        }).catch(err => {
            return res.status(500).json({ type:"danger", message: 'error_delete_Equipment' });
        });;
    } catch (error) {
        return res.status(500).json({ type:"danger", message: "error_Equipment" });
    } 
}


  const validateEquipment =(method) => {
    switch (method) {
      case 'addEdit': {
       return [ 
          body('code', 'code_empty').notEmpty(),
          body('user_uid', 'user_empty').notEmpty(),
          body('farm_uid', 'farm_empty').notEmpty()
        ]   
      }
    }
  }
module.exports = {getEquipmentsByConnectedUser,getSingleEquipment,validateEquipment, addEquipment, editEquipment, deleteEquipment}