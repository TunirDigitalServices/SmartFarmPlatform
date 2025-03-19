const Field = require('./../../models/Field.js');
const Farm = require('./../../models/Farm.js');
const User = require('./../../models/User.js');
const Crop = require('./../../models/Crop.js');

const { body, validationResult } = require('express-validator');
const Zone = require('../../models/Zone.js');

const getCropsByConnectedUser = async (req, res) => {
    if(!(req.userUid) || req.userUid == "") return res.status(404).json({ type:"danger", message: "no_user"});
    const uid  = req.userUid;
    
    try {
        const user = await new User({'uid': uid})
        .fetch({withRelated: [{'farms': (qb) => { qb.where('deleted_at', null); }},{'farms.fields': (qb) => { qb.where('deleted_at', null); }},{'farms.fields.crops': (qb) => { qb.where('deleted_at', null); }},{'farms.fields.crops.irrigations': (qb) => { qb.where('deleted_at', null); }},{'farms.fields.crops.croptypes': (qb) => { qb.where('deleted_at', null); }}], require: false})
        .then(async result => {
            if(result == null) return res.status(404).json({ type:"danger", message: "no_user"});
            let farms = result.related('farms');
            if(result) return res.status(201).json({ farms:  farms});
        });
    } catch (error) {
        return res.status(500).json({ type:"danger", message: "error_user" });
    }
}


const getSingleCrop = async (req, res) => {
  const crop_uid  = req.body.crop_uid;
  
  try {
    const crop = new Crop({'uid': crop_uid, deleted_at: null})
    .fetch({require: false})
    .then(async result => {
        if (result === null) return res.status(404).json({ type:"danger", message: "no_crop"});
        if(result){
                return res.status(201).json({ type:"success", crop : result });
            };
        })
    }catch (err) {
      return res.status(500).json({ type:"danger", message: 'error_get_crop' });
    }      

  }



const getCropsByField = async (req, res) => {
  let fieldUid = req.params.uid;
  if(!(fieldUid) || fieldUid == "") return res.status(404).json({ type:"danger", message: "no_field"});
  
  try {
    const field = new Field({'uid': fieldUid, deleted_at: null})
    .fetch({withRelated: [{'crops': (qb) => { qb.where('deleted_at', null); }}, {'zones': (qb) => { qb.where('deleted_at', null); }}, {'sensors': (qb) => { qb.where('deleted_at', null); }}, {'crops.irrigations': (qb) => { qb.where('deleted_at', null); }},{'crops.croptypes': (qb) => { qb.where('deleted_at', null); }},{'crops.varieties': (qb) => { qb.where('deleted_at', null); }}], require: false})
    .then(async result => {
        if (result === null) return res.status(404).json({ type:"danger", message: "no_field_crop"});
        if(result){
            return res.status(201).json({crops : result.related('crops'), field : result });
        }
    }).catch(err => {
        return res.status(500).json({ type:"danger", message: 'error_get_field' });
    });;  
  } catch (error) {
      return res.status(500).json({ type:"danger", message: "error_user" });
  }
}

const addCrop = async (req, res) => {
  
  if(!(req.body.field_uid) || req.body.field_uid == "") return res.status(404).json({ type:"danger", message: "no_field_selected"});

  const { zone_uid, croptype_id, previous_type, growth_date_start, growth_date_end, ggd_maturity, field_uid ,  crop_variety_id, days,plantingDate, rootDepth,practical_fraction,density,ecart_inter,ecart_intra,growingDate,surface} = req.body;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    res.status(422).json({ errors: errors.array() });
    return;
  }
  let zone_id = "";
    const zone = await new Zone({'uid': zone_uid, deleted_at: null})
    .fetch({require: false})
    .then(async result => {
      if(result === null) return res.status(404).json({ type:"danger", message: "no_zone_selected"});
      zone_id = result.get('id');
    });
  try {
      const field = new Field({'uid': field_uid, deleted_at: null})
      .fetch({require: false})
      .then(async result => {
          if (result === null) return res.status(404).json({ type:"danger", message: "no_field"});
          if(result){
              await new Crop({ zone_id:zone_id, croptype_id, previous_type, growth_date_start, growth_date_end, ggd_maturity, crop_variety_id, practical_fraction,days,plantingDate,density,ecart_inter,ecart_intra, growingDate,rootDepth,surface,field_id: result.get('id') }).save()
              .then((result) => {
                  return res.status(201).json({ type:"success", crop : result });
              }).catch(err => {
                  return res.status(500).json({ type:"danger", message: err });
              });
          }
      });        
  } catch (error) {
      res.status(500).json({ type:"danger", message: "error_user" });
  }
}

const editCrop = async (req, res) => {
  
  if(!(req.body.field_uid) || req.body.field_uid == "") return res.status(404).json({ type:"danger", message: "no_field_selected"});

  const {croptype_id, previous_type, growth_date_start, growth_date_end, ggd_maturity,crop_variety_id, days,plantingDate, rootDepth, field_uid,practical_fraction,density,ecart_inter,ecart_intra, crop_uid,zone_uid,growingDate ,surface} = req.body;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    res.status(422).json({ errors: errors.array() });
    return;
  }
  let field_id_crop = "";
  const field = await new Field({'uid': field_uid, deleted_at: null})
  .fetch({require: false})
  .then(async result => {
    if(result === null) return res.status(404).json({ type:"danger", message: "no_field_selected"});
    field_id_crop = result.get('id');
  });
  let zone_id = "";
    const zone = await new Zone({'uid': zone_uid, deleted_at: null})
    .fetch({require: false})
    .then(async result => {
      if(result === null) return res.status(404).json({ type:"danger", message: "no_zone_selected"});
      zone_id = result.get('id');
    });
  try {
      const crop = new Crop({'uid': crop_uid, deleted_at: null})
      .fetch({require: false})
      .then(async result => {
          if (result === null) return res.status(404).json({ type:"danger", message: "no_crop"});
          if(result){
              result.set({ zone, croptype_id, previous_type, growth_date_start, growth_date_end, ggd_maturity,crop_variety_id, days,plantingDate,practical_fraction,density,ecart_inter,ecart_intra,growingDate, rootDepth, surface,field_id: field_id_crop ,zone_id:zone_id});
              result.save()
              .then((result) => {
                  return res.status(201).json({ type:"success", crop : result });
              }).catch(err => {
                  return res.status(500).json({ type:"danger", message: "error_edit_crop" });
              });
          }
      });        
  } catch (error) {
      res.status(500).json({ type:"danger", message: "error_user" });
  }
}

const deleteCrop = async (req, res) => {
  crop_uid = req.body.crop_uid;
  try {
      const crop = new Crop({'uid': crop_uid})
      .fetch({require: false})
      .then(async result => {
          if (result === null) return res.status(404).json({ type:"danger", message: "no_crop"});
          if(result){
              result.set({deleted_at: new Date()});
              result.save()
              return res.status(201).json({ type:"success", message: 'crop_deleted' });
          }
      }).catch(err => {
          return res.status(500).json({ type:"danger", message: 'error_delete_crop' });
      });;
  } catch (error) {
      return res.status(500).json({ type:"danger", message: "error_crop" });
  } 
}

const validateCrop =(method) => {
    switch (method) {
      case 'addEdit': {
       return [ 
          body('croptype_id', 'type_empty').notEmpty()
        ]   
      }
    }
  }
module.exports = {getCropsByConnectedUser,getSingleCrop, getCropsByField, validateCrop, addCrop, editCrop, deleteCrop}
