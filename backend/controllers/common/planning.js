const Farm = require('../../models/Farm.js');
const User = require('../../models/User.js');
const Equipment = require('../../models/Equipment.js');
const Planning = require('../../models/Planning')


const { body, validationResult } = require('express-validator');
const Timerelay = require('../../models/Timerelay.js');

const getPlanningByConnectedUser = async (req,res) => {
    if(!(req.userUid) || req.userUid == "") return res.status(404).json({ type:"danger", message: "no_user"});
    const uid  = req.userUid;
    
    try {
        const user = await new User({'uid': uid})
        .fetch({withRelated: [{'plannings': (qb) => { qb.where('deleted_at', null); }}], require: false})
        .then(async result => {
            if(result == null) return res.status(404).json({ type:"danger", message: "no_user"});
            let data = result.related('plannings');
            if(result) return res.status(201).json(data);
        });
    } catch (error) {
        return res.status(500).json({ type:"danger", message: error });
    }
}



const addPlanning = async (req, res) => {
  
    const {equipment_uid, start_date, end_date, days, relays, user_uid,relayids} = req.body;
    let equipment_id = "";
    let user_id = ""
    const equipment = await new Equipment({'uid': equipment_uid, deleted_at: null})
    .fetch({require: false})
    .then(async result => {
      if(result === null) return res.status(404).json({ type:"danger", message: "no_equipment_selected"});
      equipment_id = result.get('id');
    });

    const user = await new User({'uid': user_uid, deleted_at: null})
    .fetch({require: false})
    .then(async result => {
      if(result === null) return res.status(404).json({ type:"danger", message: "no_user_selected"});
      user_id = result.get('id');
    });
    try {
        await new Planning({ equipment_id : equipment_id,user_id : user_id,start_date,end_date,days}).save()
        .then(async (response) => { 
            if(response){
                relays.map(async (relay,index)=>{
                    let id = "";
                    for (const key in relay.startTime) {
                        id = key.split("_")[1]
                        if(id != '')
                            await new Timerelay({relay_id : id , start_time : relay.startTime[key],end_time : relay.endTime[key]}).save()
                    }
                })
            }
        })
        .then((result) => {
            if (result === null) return res.status(404).json({ type:"danger", message: "error_save_planning"});
                return res.status(201).json({ type:"success", Planning : result });
        }).catch(err => {
            return res.status(500).json({ type:"danger", message: err });
        });
    } catch (error) {
        res.status(500).json({ type:"danger", message: "error_user" });
    }
}


const editPlanning = async (req, res) => {
    
    const { planning_uid,equipment_uid,start_date,end_date,days} = req.body;


    let equipment_id = "";
    const equipment = await new Equipment({'uid': equipment_uid, deleted_at: null})
    .fetch({require: false})
    .then(async result => {
      if(result === null) return res.status(404).json({ type:"danger", message: "no_equipment_selected"});
      equipment_id = result.get('id');
    });
    try {
        const planning = new Planning({'uid': planning_uid, deleted_at: null})
        .fetch({require: false})
        .then(async result => {
            if (result === null) return res.status(404).json({ type:"danger", message: "no_planning"});
            if(result){
                result.set({equipment_id : equipment_id,start_date,end_date,days});
                result.save()
                .then((result) => {
                    return res.status(201).json({ type:"success", planning : result });
                }).catch(err => {
                    return res.status(500).json({ type:"danger", message: "error_edit_Planning" });
                });
            }
        });        
    } catch (error) {
        res.status(500).json({ type:"danger", message: "error_user" });
    }
}


const deletePlanning = async (req, res) => {
    planning_uid = req.body.planning_uid;
    try {
        const planning = new Planning({'uid': planning_uid})
        .fetch({require: false})
        .then(async result => {
            if (result === null) return res.status(404).json({ type:"danger", message: "no_planning"});
            if(result){
                result.set({deleted_at: new Date()});
                result.save()
                return res.status(201).json({ type:"success", message: 'planning_deleted' });
            }
        }).catch(err => {
            return res.status(500).json({ type:"danger", message: 'error_delete_planning' });
        });;
    } catch (error) {
        return res.status(500).json({ type:"danger", message: "error_planning" });
    } 
}

module.exports = {addPlanning,editPlanning,deletePlanning,getPlanningByConnectedUser}