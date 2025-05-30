const User = require('./../../models/User.js');
const Farm = require('./../../models/Farm.js');
const { body, validationResult } = require('express-validator');

const getFarmsByConnectedUser = async (req, res) => {
    if(!(req.userUid) || req.userUid == "") return res.status(404).json({ type:"danger", message: "no_user"});
    const uid  = req.userUid;
    try {
        const user = await new User({'uid': uid})
        //get farms with deleted_at null
        .fetch({withRelated: [ {'farms': (qb) => { qb.where('deleted_at', null); }},{'farms.fields': (qb) => { qb.where('deleted_at', null); }},{'farms.fields.sensors': (qb) => { qb.where('deleted_at', null); }}] ,require: false})
        .then(async result => {
            if (result === null) return res.status(404).json({ type:"danger", message: "no_user_farm"});
            return res.status(201).json({ farms: result.related('farms') });
        }); 
    } catch (error) {
        return res.status(500).json({ type:"danger", message: "error_user" });
    }
}

const getSingleFarm = async (req, res) => {
    const farm_uid  = req.body.farm_uid;
    const uid = req.userUid
    try {
        const user = await new User({'uid': uid})
        .fetch({withRelated: [ {'farms': (qb) => { qb.where('uid', farm_uid); }}] ,require: false})
        .then(async result => {
            if (result === null) return res.status(404).json({ type:"danger", message: "no_user_farm"});
            return res.status(201).json({ farm: result.related('farms') });
        }); 
    } catch (error) {
        return res.status(500).json({ type:"danger", message: "error_user" });
    }
}


const addFarm = async (req, res) => {
    const { name, name_group, description, address, city_id,user_uid,Longitude,Latitude,Coordinates } = req.body;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.status(422).json({ errors: errors.array() });
      return;
    }
    if(!(req.body.user_uid) || req.body.userUid == "") return res.status(404).json({ type:"danger", message: "no_user"});
    try {
        const user = new User({'uid': user_uid})
        .fetch({require: false})
        .then(async result => {
            if (result === null) return res.status(404).json({ type:"danger", message: "no_user"});
            if(result){
                
                await new Farm({ name, name_group, description, address,city_id, user_id: result.get('id') ,Longitude,Latitude,Coordinates}).save()
                .then((result) => {
                    return res.status(201).json({ type:"success", farm : result });
                }).catch(err => {
                    return res.status(500).json({ type:"danger", message: err });
                });
            }
        });        
    } catch (error) {
        res.status(500).json({ type:"danger", message: "error_user" });
    }
}

const editFarm = async (req, res) => {
    const { name, name_group, description, address,city_id, user_uid, farm_uid } = req.body;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.status(422).json({ errors: errors.array() });
      return;
    }

    try {
        if(!(farm_uid)) return res.status(404).json({ type:"danger", message: "no_id_farm"});
        let farm_user_id = "";
        const user = await new User({'uid': user_uid})
        .fetch({require: false})
        .then(async result => {
            if (result === null) return res.status(404).json({ type:"danger", message: "no_user_farm"});
            if(result) farm_user_id = result.get("id");
        });

        const farm = new Farm({'uid': farm_uid})
        .fetch({require: false})
        .then(async result => {
            if (result === null) return res.status(404).json({ type:"danger", message: "no_farm"});
            if(result){
                result.set({ name, name_group, description, address,city_id, user_id: farm_user_id });
                result.save()
                .then((result) => {
                    return res.status(201).json({ type:"success", farm : result });
                }).catch(err => {
                    return res.status(500).json({ type:"danger", message: 'error_save_farm' });
                });
            }
        });        
    } catch (error) {
        return res.status(500).json({ type:"danger", message: "error_farm" });
    }
}

const deleteFarm = async (req, res) => {
    farm_uid = req.body.farm_uid;

    try {
       
        const farm = new Farm({'uid': farm_uid})
        .fetch({require: false})
        .then(async result => {
            if (result === null) return res.status(404).json({ type:"danger", message: "no_farm"});
            if(result){
                result.set({deleted_at: new Date()});
                result.save()
                return res.status(201).json({ type:"success", message: 'farm_deleted' });
            }
        }).catch(err => {
            return res.status(500).json({ type:"danger", message: 'error_delete_farm' });
        });;
    } catch (error) {
        return res.status(500).json({ type:"danger", message: "error_farm" });
    } 
}

const setFarmPosition = async (req, res) => {
    let idFarm = req.body.idFarm;
    let lat = req.body.Latitude;
    let lgt = req.body.Longitude;
    if(!(idFarm) || idFarm == "") return res.status(404).json({ type:"danger", message: "no_farm"});
    try {
       
        const farm = new Farm({'id': idFarm})
        .fetch({require: false})
        .then(async result => {
            if (result === null) return res.status(404).json({ type:"danger", message: "no_farm"});
            if(result){
                result.set({Latitude: lat, Longitude: lgt});
                result.save()
                return res.status(201).json({ type:"success", message: 'farm_position_changed' });
            }
        }).catch(err => {
            return res.status(500).json({ type:"danger", message: 'error_change_farm_position' });
        });;
    } catch (error) {
        return res.status(500).json({ type:"danger", message: "error_farm" });
    } 
}

const validateFarm =(method) => {
    switch (method) {
      case 'addEdit': {
       return [ 
          body('name', 'name_empty').notEmpty(),
          body('user_uid', 'user_empty').notEmpty()
        ]   
      }
    }
  }
module.exports = {getFarmsByConnectedUser,getSingleFarm, addFarm, editFarm, deleteFarm, validateFarm, setFarmPosition}