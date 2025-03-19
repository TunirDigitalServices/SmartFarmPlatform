const User = require('./../../models/User.js');
const Field = require('./../../models/Field');


const getCropsByUser = async (req, res) => {
    var user_uid = req.params.uid;
    try {
        const user = await new User({'uid': user_uid})
        .fetch({withRelated: [{'farms': (qb) => { qb.where('deleted_at', null); }},{'farms.fields': (qb) => { qb.where('deleted_at', null); }},{'farms.fields.crops': (qb) => { qb.where('deleted_at', null); }},{'farms.fields.crops.irrigations': (qb) => { qb.where('deleted_at', null); }}], require: false})
        .then(async result => {
            if (result === null) return res.status(404).json({ type:"danger", message: "no_user_crop"});
            if(result) return res.status(201).json({ crops: crops});
        });        
    } catch (error) {
        res.status(500).json({ type:"danger", message: "error_user" });
   
    }
}
       

module.exports = {getCropsByUser}