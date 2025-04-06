const User = require('./../../models/User.js');
const Farm = require('./../../models/Farm.js');

const getAllFarms = async (req, res) => {
    try {
        const farm = new Farm()
        .fetchAll({withRelated: ["fields"]})
        .then(async farms => {
            return res.status(201).json({ farms });
        })
    } catch (error) {
        return res.status(500).json({ type:"danger", message: "error_get_farms" });
    }

}

const getFarmsByUser = async (req, res) => {
    var user_uid = req.params.uid;
    try {
        const user = await new User({'uid': user_uid})
        .fetch({withRelated: [{"farms" :(qb) => { qb.where('deleted_at', null); }},{'farms.fields': (qb) => { qb.where('deleted_at', null); }},{'farms.fields.sensors': (qb) => { qb.where('deleted_at', null); }}], require: false})
        .then(async result => {
            if (result === null) return res.status(404).json({ type:"danger", message: "no_user_farm"});
            if(result) return res.status(201).json({ farms: result.related('farms') });
        });        
    } catch (error) {
        res.status(500).json({ type:"danger", message: "error_user" });
    }
}

const getSingleFarm = async (req, res) => {
    const farm_uid  = req.body.farm_uid;
    let user_uid = req.body.user_uid
    try {
        const user = await new User({'uid': user_uid})
        .fetch({withRelated: [ {'farms': (qb) => { qb.where('uid', farm_uid); }}] ,require: false})
        .then(async result => {
            if (result === null) return res.status(404).json({ type:"danger", message: "no_user_farm"});
            return res.status(201).json({ farm: result.related('farms') });
        }); 
    } catch (error) {
        return res.status(500).json({ type:"danger", message: "error_user" });
    }
}


const addFarm = async (req,res) => {
    const { name, name_group, description, address, user_uid } = req.body;
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
                
                await new Farm({ name, name_group, description, address, user_id: result.get('id') }).save()
                .then((result) => {
                    return res.status(201).json({ type:"success", farm : result });
                }).catch(err => {
                    return res.status(500).json({ type:"danger", message: 'error_save_farm' });
                });
            }
        });        
    } catch (error) {
        res.status(500).json({ type:"danger", message: "error_user" });
    }
}  

const deleteFarm = async (req,res) => {
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

module.exports = {getAllFarms, getFarmsByUser,addFarm,deleteFarm,getSingleFarm}
