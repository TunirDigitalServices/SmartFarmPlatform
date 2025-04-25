const Croptype = require('../../models/Croptype')

const getCropType = async (req,res) => {
    
    try {
        const croptype = await new Croptype()
        .query((qb) => qb.where('deleted_at' , null))

        .fetchAll({require: false})
        .then(async result => {
            if(result == null) return res.status(404).json({ type:"danger", message: "no_croptype"});
            if(result) return res.status(201).json({type : "success" , Croptype : result});
        });
    } catch (error) {
        return res.status(500).json({ type:"danger", message: "error_user" });
    }

}

const getCropTypeByName = async (req,res) => {
            const {cropName} = req.body
    try {   
        const croptype = await new Croptype()
        .fetchAll({require: false})
        .then(async result => {
            if(result == null) return res.status(404).json({ type:"danger", message: "no_croptype"});
            if(result) return res.status(201).json({type : "success" , Croptype : result});
        });
    } catch (error) {
        return res.status(500).json({ type:"danger", message: "error_user" });
    }

}




module.exports = {getCropType}