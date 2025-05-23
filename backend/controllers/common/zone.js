const Zone = require('./../../models/Zone');
const Field = require('./../../models/Field');
const Crop = require('./../../models/Crop.js');
const User = require('./../../models/User')

const { body, validationResult } = require('express-validator');



const getZonesByConnectedUser = async (req, res) => {
    if (!(req.userUid) || req.userUid == "") return res.status(404).json({ type: "danger", message: "no_user" });
    const uid = req.userUid;

    try {
        const user = await new User({ 'uid': uid })
            .fetch({ withRelated: [{ 'farms': (qb) => { qb.where('deleted_at', null); } }, { 'farms.fields': (qb) => { qb.where('deleted_at', null); } }, { 'farms.fields.zones': (qb) => { qb.where('deleted_at', null); } }], require: false })
            .then(async result => {
                if (result == null) return res.status(404).json({ type: "danger", message: "no_user" });
                let farms = result.related('farms');
                if (result) return res.status(201).json({ farms: farms });
            });
    } catch (error) {
        return res.status(500).json({ type: "danger", message: "error_user" });
    }
}

const searchAllZones = async (req, res) => {
    const { search = '' } = req.query;
    const uid = req.userUid

    try {

        const user = await new User({ uid }).fetch({
            withRelated: [
                { 'farms': qb => qb.where('deleted_at', null) },
                { 'farms.fields': qb => qb.where('deleted_at', null) },
                { 'farms.fields.zones': qb => qb.where('deleted_at', null) }
            ],
            require: false
        });

        if (!user) {
            return res.status(404).json({ type: "danger", message: "User not found" });
        }

        const role = user.get('role');

      
        
        let zones;
        if (role === "ROLE_ADMIN") {
          zones = await Zone.query(qb => {
                qb.where('deleted_at', null);
                if (search) {
                    qb.andWhereRaw('LOWER(name) LIKE ?', [`%${search.toLowerCase()}%`]);
                }
            }).fetchAll({ require: false });
        } else {
          

              const userZones = user.related('farms')
                .reduce((acc, farm) => {
                    const fields = farm.related('fields');
                    fields.forEach(field => {
                        const zones = field.related('zones').filter(zone => {
                            if (!zone || zone.get('deleted_at')) return false;
                            return !search || zone.get('name').toLowerCase().includes(search.toLowerCase());
                        });
                        acc = acc.concat(zones);
                    });
                    return acc;
                }, []);

            zones = {
                toJSON: () => userZones.map(zone => zone.toJSON())
            };
        }



           const response = zones.toJSON().map(zone => ({
            value: zone.uid,
            label: zone.name
        }));


        return res.status(200).json(response);
    } catch (error) {
        console.error("searchFields error:", error);
        return res.status(500).json({ type: "danger", message: "fields" });
    }
};







const getSingleZone = async (req, res) => {
    const zone_uid = req.body.zone_uid;

    try {
        const zone = new Zone({ 'uid': zone_uid, deleted_at: null })
            .fetch({ require: false })
            .then(async result => {
                if (result === null) return res.status(404).json({ type: "danger", message: "no_zone" });
                if (result) {
                    return res.status(201).json({ type: "success", zone: result });
                };
            })
    } catch (err) {
        return res.status(500).json({ type: "danger", message: 'error_get_zone' });
    }

}


const getZonesByField = async (req, res) => {

    let fieldUid = req.params.uid;
    if (!(fieldUid) || fieldUid == "") return res.status(404).json({ type: "danger", message: "no_field_found" });

    try {
        const field = new Field({ 'uid': fieldUid, deleted_at: null })
            .fetch({ withRelated: [{ 'zones': (qb) => { qb.where('deleted_at', null); } }], require: false })
            .then(async result => {
                if (result === null) return res.status(404).json({ type: "danger", message: "no_field" });
                if (result) {
                    return res.status(201).json({ zones: result.related('zones') });
                }
            }).catch(err => {
                return res.status(500).json({ type: "danger", message: 'error_get_field' });
            });;
    } catch (error) {
        return res.status(500).json({ type: "danger", message: "error_user" });
    }

}


const getZonesByCrop = async (req, res) => {

    let cropUid = req.params.uid;
    if (!(cropUid) || cropUid == "") return res.status(404).json({ type: "danger", message: "no_crop_found" });

    try {
        const crop = new Crop({ 'uid': cropUid, deleted_at: null })
            .fetch({ withRelated: [{ 'zones': (qb) => { qb.where('deleted_at', null); } }], require: false })
            .then(async result => {
                if (result === null) return res.status(404).json({ type: "danger", message: "no_crop" });
                if (result) {
                    return res.status(201).json({ zones: result.related('zones') });
                }
            }).catch(err => {
                return res.status(500).json({ type: "danger", message: 'error_get_crop' });
            });;
    } catch (error) {
        return res.status(500).json({ type: "danger", message: "error_user" });
    }

}

const formatDataDepth = async (depth_data) => {
    let depthData = {};
    if (depth_data) {
        for (var i = 0; i < depth_data.length; i++) {

            depthData[depth_data[i].depth] = {
                "soilType": depth_data[i].uni,
                "soil_property": depth_data[i].soilProprety,
                "clay": depth_data[i].clay,
                "sand": depth_data[i].sand,
                "silt": depth_data[i].silt,
                "cec": depth_data[i].CEC,
                "ph": depth_data[i].ph,
                "om": depth_data[i].OM,
                "ecd": depth_data[i].Ecd
            }
        }
    }
    return depthData;

}

const formatEditDataDepth = async (depth_data) => {
    let depthData = {};
    if (depth_data) {
        for (var i in depth_data) {
            let depthCm = i;
            if (depth_data[i].depth && depth_data[i].depth != "") {
                depthCm = depth_data[i].depth;
            }
            depthData[depthCm] = {
                "soilType": depth_data[i].soilType,
                "soil_property": depth_data[i].soil_property,
                "clay": depth_data[i].clay,
                "sand": depth_data[i].sand,
                "silt": depth_data[i].silt,
                "cec": depth_data[i].CEC,
                "ph": depth_data[i].pH,
                "om": depth_data[i].OM,
                "ecd": depth_data[i].Ecd,
                "depth": depthCm
            }
        }
    }
    return depthData;

}

const addZone = async (req, res) => {
    const { name, description, source, depth_data, field_uid, RUmax, effPluie, irrigArea, soiltype_id } = req.body;
    //exemple data
    /*{"name":'zone1',
     "description":'testDesc',
     "source":'1',
     "field_uid":1,
     "depth_data":
     [
        {
        "soil_property":""
        "depth":0,
        "soilType":"",
        "clay":"",
        "sand":"",
        "sil":"",
        "cec":"",
        "ph":"",
        "om":"",
        "ecd":""
        },
        {
        "soil_property":""
        "depth":30,
        "soilType":"",
        "clay":"",
        "sand":"",
        "sil":"",
        "cec":"",
        "ph":"",
        "om":"",
        "ecd":""
        }
     ]
    }*/


    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        res.status(422).json({ errors: errors.array() });
        return;
    }
    let depthData = await formatDataDepth(depth_data);
    if (!(req.body.field_uid) || req.body.field_uid == "") return res.status(404).json({ type: "danger", message: "no_field_selected" });

    try {
        const field = await new Field({ 'uid': field_uid, deleted_at: null })
            .fetch({ require: false })
            .then(async result => {
                if (result === null) return res.status(404).json({ type: "danger", message: "no_field_found" });
                if (result) {
                    await new Zone({ name, description, source, RUmax,soiltype_id,effPluie, irrigArea, depth_data: depthData, field_id: result.get('id') }).save()
                        .then(result => {
                            return res.status(201).json({ type: "success", zone: result })
                        })
                        .catch(err => {
                            return res.status(500).json({ type: "danger", message: "data_error_or_exist_field" });
                        })
                }
            })
    } catch (error) {
        res.status(500).json({ type: "danger", message: "error_user" });
    }

}

const editZone = async (req, res) => {
    try {
        const { name, source, field_uid, zone_uid, RUmax, effPluie, irrigArea, soiltype_id } = req.body;

        if (!field_uid || field_uid === "") {
            return res.status(404).json({ type: "danger", message: "no_field_selected" });
        }

        const { id: field_id } = await new Field({ uid: field_uid, deleted_at: null, }).fetch({ require: false });

        if (!field_id) {
            return res.status(404).json({ type: "danger", message: "no_field" });
        }
        const updatedZone = await new Zone({ uid: zone_uid, deleted_at: null })
            .fetch({ require: false })
            .then(async (zone) => {
                if (!zone) {
                    return res.status(404).json({ type: "danger", message: "no_zone" });
                }

                const updatedZone = await zone.save({ name, source, field_id, RUmax, effPluie, soiltype_id });

                return updatedZone;
            });
        return res.status(201).json({ type: "success", zone: updatedZone });
    } catch (error) {
        return res.status(500).json({ type: "danger", message: "error_user" });
    }
};


const deleteZone = async (req, res) => {
    const zone_uid = req.body.zone_uid;
    if (!(req.body.zone_uid) || req.body.zone_uid == '') return res.status(404).json({ type: "danger", message: "no_zone_selected" });
    try {
        const zone = new Zone({ 'uid': zone_uid, deleted_at: null })
            .fetch({ require: false })
            .then(async result => {
                if (result === null) return res.status(404).json({ type: "danger", message: "no_zone" });
                if (result) {
                    result.set({ deleted_at: new Date() });
                    result.save()
                    return res.status(201).json({ type: "success", message: 'zone_deleted' });
                }
            })
            .catch(err => {
                return res.status(500).json({ type: "danger", message: 'error_delete_zone' });
            });;

    } catch (error) {
        return res.status(500).json({ type: "danger", message: "error_zone" });

    }
}

const validateZone = (method) => {
    switch (method) {
        case 'addEdit': {
            return [
                body('name', 'name_empty').notEmpty(),

            ]
        }
    }
}


module.exports = { validateZone, getSingleZone, searchAllZones, getZonesByField, getZonesByCrop, addZone, editZone, deleteZone, getZonesByConnectedUser }