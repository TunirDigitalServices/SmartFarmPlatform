const Cities = require('../../models/Cities')

const getCities = async (req,res) => {
    
    try {
        const cities = await new Cities()
        .fetchAll({require: false})
        .then(async result => {
            if(result == null) return res.status(404).json({ type:"danger", message: "no_cities"});
            if(result) return res.status(201).json({type : "success" , Cities : result});
        });
    } catch (error) {
        return res.status(500).json({ type:"danger", message: "error_user" });
    }

}





module.exports = {getCities}