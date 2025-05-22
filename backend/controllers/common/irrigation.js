const Irrigation = require('./../../models/Irrigation');
const Crop = require('./../../models/Crop.js');
const User = require('./../../models/User')

const { body, validationResult } = require('express-validator');
const Zone = require('../../models/Zone');

const getIrrigationsByConnectedUser = async (req, res) => {
    if (!(req.userUid) || req.userUid == "") return res.status(404).json({ type: "danger", message: "no_user" });
    const uid = req.userUid;

    try {
        const user = await new User({ 'uid': uid })
            .fetch({ withRelated: [{ 'farms': (qb) => { qb.where('deleted_at', null); } }, { 'farms.fields': (qb) => { qb.where('deleted_at', null); } }, { 'farms.fields.crops': (qb) => { qb.where('deleted_at', null); } }, { 'farms.fields.crops.irrigations': (qb) => { qb.where('deleted_at', null); } }], require: false })
            .then(async result => {
                
                if (result == null) return res.status(404).json({ type: "danger", message: "no_user" });
                let data = result.related('farms');
                console.log("Fetched user:", data.toJSON());

                if (result) return res.status(201).json(data);
            });
    } catch (error) {
        return res.status(500).json({ type: "danger", message: "error_user" });
    }
}


const getSingleIrrigation = async (req, res) => {
    const irrigation_uid = req.body.irrigation_uid;

    try {
        const irrigation = new Irrigation({ 'uid': irrigation_uid, deleted_at: null })
            .fetch({ require: false })
            .then(async result => {
                if (result === null) return res.status(404).json({ type: "danger", message: "no_irrigation" });
                if (result) {
                    return res.status(201).json({ type: "success", irrigation: result });
                };
            })
    } catch (err) {
        return res.status(500).json({ type: "danger", message: 'error_get_irrigation' });
    }

}


const getIrrigationsByCrop = async (req, res) => {
    let cropUid = req.params.uid;
    if (!(cropUid) || cropUid == "") return res.status(404).json({ type: "danger", message: "no_crop_found" });

    try {
        const crop = new Crop({ 'uid': cropUid, deleted_at: null })
            .fetch({ withRelated: [{ 'irrigation': (qb) => { qb.where('deleted_at', null); } }], require: false })
            .then(async result => {
                if (result === null) return res.status(404).json({ type: "danger", message: "no_crop" });
                if (result) {
                    return res.status(201).json({ irrigation: result.related('irrigation') });
                }
            }).catch(err => {
                return res.status(500).json({ type: "danger", message: 'error_get_field' });
            });;
    } catch (error) {
        return res.status(500).json({ type: "danger", message: "error_user" });
    }

}

//Search Irrigations By Type

const searchIrrigationsByType = async (req, res) => {
    const type = req.body.type;
    if (!(type) || type == "") return res.status(404).json({ type: "danger", message: "no_irrigation_type" });

    try {
        const irrigation = await new Irrigation.getIrrigationsByType(type)
            .then(async result => {
                if (result === null) return res.status(404).json({ type: "danger", message: "no_irrigation" });
                if (result) {
                    return res.status(201).json({ irrigation: result });
                }
            }).catch(err => {
                return res.status(500).json({ type: "danger", message: 'error_get_irrigation' });
            });
    } catch (error) {
        return res.status(500).json({ type: "danger", message: error });
    }
}


//Add Irrigations
const addIrrigation = async (req,res) => {

    const {type,address,crop_uid,zone_uid,flowrate,irrigated_already,pivot_shape,irrigation_syst,name,pivot_length,pivot_coord,full_runtime,lateral,drippers,effIrrig,pumpFlow,drippers_spacing,pumpType,lines_number} = req.body;
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
        res.status(422).json({ errors: errors.array() });
        return;
    }

    if(!(req.body.crop_uid) || req.body.crop_uid == "") return res.status(404).json({ type:"danger", message: "no_crop_selected"});
    let zone_id = "";
    const zone = await new Zone({'uid': zone_uid, deleted_at: null})
    .fetch({require: false})
    .then(async result => {
      if(result === null) return res.status(404).json({ type:"danger", message: "no_zone_selected"});
      zone_id = result.get('id');
    });
     try{
        const crop = new Crop({'uid': crop_uid, deleted_at: null})
        .fetch({require: false})
        .then(async result => {
            if (result === null) return res.status(404).json({ type:"danger", message: "no_crop_found"});
            if(result){
                await new Irrigation({type, address,flowrate,irrigated_already,pivot_shape,irrigation_syst,name,pivot_length,pivot_coord,full_runtime,lateral ,drippers,effIrrig,pumpFlow,drippers_spacing,pumpType,crop_id: result.get('id'),zone_id :zone_id,lines_number}).save()
                .then((result) => {
                     return res.status(201).json({ type:"success", irrigation : result });
                }).catch(err => {
                     return res.status(500).json({ type:"danger", message: err });
                });
            }
        });  

     } catch (error) {
            res.status(500).json({ type:"danger", message: "error_user" });
        }
}


//Edit Irrigations

const editIrrigation = async (req, res) => {
    if (!(req.body.crop_uid) || req.body.crop_uid == "") return res.status(404).json({ type: "danger", message: "no_crop_selected" });

    const { type, address, flowrate, irrigated_already, pivot_shape, irrigation_syst, name, pivot_length, pivot_coord, full_runtime, lateral, drippers, effIrrig, pumpFlow, drippers_spacing, pumpType, crop_uid, irrigation_uid, zone_uid, lines_number } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(422).json({ errors: errors.array() });
        return;
    }
    let crop_id = ""
    const crop = await new Crop({ 'uid': crop_uid, deleted_at: null })
        .fetch({ require: false })
        .then(async result => {
            if (result === null) return res.status(404).json({ type: "danger", message: "no_crop" });
            crop_id = result.get('id')
        });
    let zone_id = "";
    const zone = await new Zone({ 'uid': zone_uid, deleted_at: null })
        .fetch({ require: false })
        .then(async result => {
            if (result === null) return res.status(404).json({ type: "danger", message: "no_zone_selected" });
            zone_id = result.get('id');
        });
    try {
        const irrigation = new Irrigation({ 'uid': irrigation_uid, deleted_at: null })
            .fetch({ require: false })
            .then(async result => {
                if (result === null) return res.status(404).json({ type: "danger", message: "no_irrigation" });
                if (result) {
                    result.set({ type, address, flowrate, irrigated_already, pivot_shape, irrigation_syst, name, pivot_length, pivot_coord, full_runtime, lateral, drippers, effIrrig, pumpFlow, drippers_spacing, pumpType, crop_id: crop_id, zone_id: zone_id, lines_number });
                    result.save()
                        .then((result) => {
                            return res.status(201).json({ type: "success", irrigation: result });
                        }).catch(err => {
                            return res.status(500).json({ type: "danger", message: "error_edit_irrigation" });
                        });
                }
            });
    } catch (error) {
        res.status(500).json({ type: "danger", message: "error_user" });
    }
}

//Delete Irrigation

const deleteIrrigation = async (req, res) => {
    irrigation_uid = req.body.irrigation_uid;
    try {
        const irrigation = new Irrigation({ 'uid': irrigation_uid })
            .fetch({ require: false })
            .then(async result => {
                if (result === null) return res.status(404).json({ type: "danger", message: "no_irrigation" });
                if (result) {
                    result.set({ deleted_at: new Date() });
                    result.save()
                    return res.status(201).json({ type: "success", message: 'irrigation_deleted' });
                }
            }).catch(err => {
                return res.status(500).json({ type: "danger", message: 'error_delete_irrigation' });
            });;
    } catch (error) {
        return res.status(500).json({ type: "danger", message: "error_irrigation" });
    }
}


const validateIrrigation = (method) => {
    switch (method) {
        case 'addEdit': {
            return [
                body('type', 'type_empty').notEmpty(),
            ]
        }
    }
}


module.exports = { getIrrigationsByConnectedUser, getSingleIrrigation, addIrrigation, editIrrigation, deleteIrrigation, validateIrrigation, getIrrigationsByCrop, searchIrrigationsByType }

