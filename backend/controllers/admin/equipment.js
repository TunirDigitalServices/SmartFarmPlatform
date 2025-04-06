const Farm = require('./../../models/Farm.js');
const User = require('./../../models/User.js');
const Equipment = require('./../../models/Equipment.js');


const getEquipments = async (req, res) => {
    try {
        const equipment = new Equipment()
        .fetchAll()
        .then(async equipments => {
            return res.status(201).json({ equipments });
        })
    } catch (error) {
        return res.status(500).json({ type:"danger", message: "error_get_equipments" });
    }

}


const addEquipment = async (req, res) => {  
    const {name, code} = req.body;

    try {
        const equipment = new Equipment({ 'code' : code  ,deleted_at: null})
        .fetch({require: false})
        .then(async result => {
            if (result != null) return res.status(404).json({ type:"danger", message: "existed_equipment"});
            if(result === null){
                await new Equipment({name, code}).save()
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

const assignEquipmentToUser = async (req,res) => {
    const {user_uid,code} = req.body
    let user_id = null;
    if(user_uid !== "" && typeof user_uid !== 'undefined'){
        const user = await new User({'uid': user_uid, deleted_at: null})
        .fetch({require: false})
        .then(async users => {
          user_id = users.get('id');
        });
    }

    try {
        const equipment = new Equipment({ 'code' : code , deleted_at: null})
        .fetch({require: false})
        .then(async result => {
           if (result === null) return res.status(404).json({ type:"danger", message: "no_Equipment"});
            if(result){
                result.set({user_id: user_id});
                result.save()
                .then((result) => {
                    return res.status(201).json({ type:"success", equipment : result });
                }).catch(err => {
                    return res.status(500).json({ type:"danger", message: "error_edit_Equipment" });
                });
            }
        });        
    } catch (error) {
        res.status(500).json({ type:"danger", message: "error_Equipment" });
    }
}



module.exports = {addEquipment , getEquipments,assignEquipmentToUser}