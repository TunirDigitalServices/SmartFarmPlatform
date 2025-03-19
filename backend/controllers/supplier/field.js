const User = require("../../models/User");




const getFields = async (req,res) => {
    if(!(req.userUid) || req.userUid == "") return res.status(404).json({ type:"danger", message: "no_user"});
    const uid  = req.userUid;
    
        let supplier_id =""
    
        const user = await new User({ 'uid' : uid})
        .fetch({require : false})
        .then(async result => {
            if (result === null) return res.status(404).json({ type:"danger", message: "no_user"})
            if (result) supplier_id = result.get("supplier_id")
        })
        if(supplier_id && supplier_id !== ""){
        try {
                const user = new User()
                .query(qb => qb.where('supplier_id' ,'=',supplier_id)
                .andWhere('role', '=' , 'ROLE_USER')
                .andWhere('deleted_at', 'is' , null))
                .fetchAll({withRelated: [{'farms': (qb) => { qb.where('deleted_at', null); }},{'farms.fields': (qb) => { qb.where('deleted_at', null); }},{'farms.fields.sensors': (qb) => { qb.where('deleted_at', null); }},{'farms.fields.reports': (qb) => { qb.where('deleted_at', null); }}],require : false})
                .then(async users => {
                    return res.status(201).json({ users });
                })

            } catch (error) {
                return res.status(500).json({ type:"danger", message: "error_get_users" });
            }
        }
    }


    module.exports = {getFields}