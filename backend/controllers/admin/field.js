const User = require('./../../models/User.js');
const Field = require('./../../models/Field.js');
const Farm = require('../../models/Farm.js');
const fetch = require('node-fetch');
const Cities = require('../../models/Cities');
const Sensor = require('../../models/Sensor.js');

const getFieldsByUser = async (req, res) => {
    let user_uid = req.params.uid;
    try {
        const user = await new User({'uid': user_uid})
        .fetch({withRelated: [{'farms': (qb) => { qb.where('deleted_at', null); }},{'farms.fields': (qb) => { qb.where('deleted_at', null); }},{'farms.fields.crops': (qb) => { qb.where('deleted_at', null); }},{'farms.fields.crops.irrigations': (qb) => { qb.where('deleted_at', null); }},{'farms.fields.crops.croptypes': (qb) => { qb.where('deleted_at', null); }},{'farms.fields.zones': (qb) => { qb.where('deleted_at', null); }},{'farms.fields.zones.crops': (qb) => { qb.where('deleted_at', null); }}], require: false})
        .then(async result => {
            if (result === null) return res.status(404).json({ type:"danger", message: "no_user_field"});
            if(result) return res.status(201).json({ type:"success" ,farms: result.related('farms') });
        });        
    } catch (error) {
        res.status(500).json({ type:"danger", message: "error_user" });
    }
}

const getAllFields = async (req, res) => {
    try {
        const fields = await Field.query((qb) => {
            qb.where('deleted_at', null)
                .whereNotNull('Latitude')
                .whereNotNull('Longitude');
        })
            .fetchAll({
                withRelated: [
                    {
                        'reports': (qb) => qb.where('deleted_at', null).orderBy('id','DESC'),
                    },
                    {
                        'crops.varieties': (qb) => qb.where('deleted_at', null),
                    },
                    {
                        'crops.croptypes': (qb) => qb.where('deleted_at', null),
                    },
                ],
            });

            const farms = await Farm.query((qb) => {
                qb.where('deleted_at', null)
                .whereNotNull('Latitude')
                .whereNotNull('Longitude')
            })
                .fetchAll({require: false});
                const sensors = await Sensor.query((qb) => {
                    qb.where('deleted_at', null)
                    .andWhere('synchronized', "1")
                    .whereNotNull('user_id')
                    .whereNotNull('field_id')
                    .whereNotNull('Latitude')
                    .whereNotNull('Longitude')
                })
                    .fetchAll({require: false});

                    const users = await User.query((qb) => {
                        qb.where('deleted_at', null)

                    })
                        .fetchAll({require: false});
        return res.status(201).json({ fields , farms ,sensors,users });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ type: "danger", message: "error_get_farms" });
    }
};




module.exports = {getFieldsByUser,getAllFields}