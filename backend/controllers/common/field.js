const Field = require('./../../models/Field.js');
const Farm = require('./../../models/Farm.js');
const User = require('./../../models/User.js');

const { body, validationResult } = require('express-validator');
const Event = require('../../models/Event.js');
const fetch = require('node-fetch');

const getFieldsByConnectedUser = async (req, res) => {
    if (!(req.userUid) || req.userUid == "") return res.status(404).json({ type: "danger", message: "no_user" });
    const uid = req.userUid

    try {
        const user = await new User({ 'uid': uid })
            .fetch({ withRelated: [{ 'farms': (qb) => { qb.where('deleted_at', null); } }, { 'farms.fields': (qb) => { qb.where('deleted_at', null); } }, { 'farms.fields.zones': (qb) => { qb.where('deleted_at', null); } }, { 'farms.fields.crops': (qb) => { qb.where('deleted_at', null); } }, { 'farms.fields.sensors': (qb) => { qb.where('deleted_at', null); } }, { 'farms.fields.reports': (qb) => { qb.where('deleted_at', null).orderBy('id', 'DESC') } }], require: false })
            .then(async result => {
                if (result == null) return res.status(404).json({ type: "danger", message: "no_user" });
                if (result) return res.status(201).json({ farms: result.related('farms') });
            });
    } catch (error) {
        return res.status(500).json({ type: "danger", message: "error_user" });
    }
}

const searchAllFields = async (req, res) => {
    const { search = '' } = req.query;
    const uid = req.userUid;

    

    try {
        const user = await new User({ uid }).fetch({ require: true });
        const role = user.get('role');
        const userId = user.get('id');

      

        const fields = await Field.query(qb => {
            console.log("[STEP 4] Building query for fields...");

            qb.where('deleted_at', null);

            if (search) {
                console.log("[STEP 5] Applying search filter...");
                qb.andWhereRaw('LOWER(name) LIKE ?', [`%${search.toLowerCase()}%`]);
            }

            if (role !== 'ROLE_ADMIN') {
                console.log("[STEP 6] Filtering by user-owned farms...");
                qb.whereIn('fields.farm_id', function () {
                    this.select('id')
                        .from('farms')
                        .where('user_id', userId)
                        .andWhere('deleted_at', null);
                });
            }

        }).fetchAll({ require: false });

    

        const response = fields.toJSON().map(farm => ({
            value: farm.uid,
            label: farm.name
        }));

        console.log("[STEP 8] Final response prepared:", response);

        return res.status(200).json(response);
    } catch (error) {
        console.error("[ERROR] searchAllFields:", error);
        return res.status(500).json({ type: "danger", message: "fields" });
    }
};


const getSingleField = async (req, res) => {
    const field_uid = req.body.field_uid;

    try {
        const field = new Field({ 'uid': field_uid, deleted_at: null })
            .fetch({ withRelated: [{ 'zones': (qb) => { qb.where('deleted_at', null); } }], require: false })
            .then(async result => {
                if (result === null) return res.status(404).json({ type: "danger", message: "no_field" });
                if (result) {
                    return res.status(201).json({ type: "success", field: result });
                };
            })
    } catch (err) {
        return res.status(500).json({ type: "danger", message: 'error_get_field' });
    }

}




const getFieldsByFarm = async (req, res) => {
    let farmUid = req.params.uid;
    if (!(farmUid) || farmUid == "") return res.status(404).json({ type: "danger", message: "no_farm" });

    try {
        const farm = new Farm({ 'uid': farmUid, deleted_at: null })
            .fetch({ withRelated: [{ 'fields': (qb) => { qb.where('deleted_at', null); } }], require: false })
            .then(async result => {
                if (result === null) return res.status(404).json({ type: "danger", message: "no_farm" });
                if (result) {
                    return res.status(201).json({ fields: result.related('fields') });
                }
            }).catch(err => {
                return res.status(500).json({ type: "danger", message: 'error_get_field' });
            });
    } catch (error) {
        return res.status(500).json({ type: "danger", message: "error_user" });
    }
}

const addFiel = async (req, res) => {
    const { name, soil_zone, source, soil_property, depth_level, soil_type, description, Latitude, Longitude, coordinates, address, farm_uid, longueur, largeur } = req.body;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        res.status(422).json({ errors: errors.array() });
        return;
    }
    if (!(req.body.farm_uid) || req.body.farm_uid == "") return res.status(404).json({ type: "danger", message: "no_farm_selected" });
    try {
        const farm = new Farm({ 'uid': farm_uid, deleted_at: null })
            .fetch({ require: false })
            .then(async result => {
                if (result === null) return res.status(404).json({ type: "danger", message: "no_farm" });
                if (result) {
                    await new Field({ name, description, Latitude, Longitude, coordinates, farm_id: result.get('id'), longueur, largeur }).save()
                        .then((result) => {
                            return res.status(201).json({ type: "success", field: result });
                        }).catch(err => {
                            return res.status(500).json({ type: "danger", message: err });
                        });
                }
            });
    } catch (error) {
        res.status(500).json({ type: "danger", message: "error_user" });
    }
}

const editField = async (req, res) => {
    const { name, soil_zone, source, soil_property, depth_level, soil_type, description, address, farm_uid, field_uid, longueur, largeur, coordinates, Latitude, Longitude } = req.body;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        res.status(422).json({ errors: errors.array() });
        return;
    }

    try {
        //if user admin change field to another farm
        if (!(farm_uid)) return res.status(404).json({ type: "danger", message: "no_id_farm" });
        let field_farm_id = "";
        const farm = await new Farm({ 'uid': farm_uid })
            .fetch({ require: false })
            .then(async result => {
                if (result === null) return res.status(404).json({ type: "danger", message: "no_farm_field" });
                if (result) field_farm_id = result.get("id");
            });

        const field = new Field({ 'uid': field_uid })
            .fetch({ require: false })
            .then(async result => {
                if (result === null) return res.status(404).json({ type: "danger", message: "no_field" });
                if (result) {
                    result.set({ name, soil_zone, source, soil_property, depth_level, soil_type, description, address, farm_id: field_farm_id, longueur, largeur, Latitude, Longitude, coordinates });
                    result.save()
                        .then((result) => {
                            return res.status(201).json({ type: "success", field: result });
                        }).catch(err => {
                            return res.status(500).json({ type: "danger", message: 'error_save_field' });
                        });
                }
            });
    } catch (error) {
        return res.status(500).json({ type: "danger", message: "error_field" });
    }
}

const deleteField = async (req, res) => {
    field_uid = req.body.field_uid;
    try {
        const field = new Field({ 'uid': field_uid })
            .fetch({ require: false })
            .then(async result => {
                if (result === null) return res.status(404).json({ type: "danger", message: "no_field" });
                if (result) {
                    result.set({ deleted_at: new Date() });
                    result.save()
                    return res.status(201).json({ type: "success", message: 'field_deleted' });
                }
            }).catch(err => {
                return res.status(500).json({ type: "danger", message: 'error_delete_field' });
            });;
    } catch (error) {
        return res.status(500).json({ type: "danger", message: "error_field" });
    }
}


const getFieldsByStatus = async (req, res) => {
    const { status, option } = req.body
    const uid = req.userUid;

    try {
        const user = await new User({ 'uid': uid })
            .fetch({ withRelated: [{ 'farms': (qb) => { qb.where('deleted_at', null); } }, { 'farms.fields': (qb) => { qb.where('deleted_at', null).andWhere('status', status); } }, { 'farms.fields.sensors': (qb) => { qb.where('deleted_at', null) } }], require: false })
            .then(async result => {
                if (result == null) return res.status(404).json({ type: "danger", message: "no_user" });
                if (result) return res.status(201).json({ farms: result.related('farms') });
            });
    } catch (error) {
        return res.status(500).json({ type: "danger", message: "error_user" });
    }
}


const searchField = async (req, res) => {
    const { name } = req.body;
    const uid = req.userUid;
    try {
        const user = await new User({ 'uid': uid })
            .fetch({ withRelated: [{ 'farms': (qb) => { qb.where('deleted_at', null); } }, { 'farms.fields': (qb) => { qb.where('deleted_at', null).andWhere('name', 'LIKE', '%' + name + '%'); } }], require: false })
            .then(async result => {
                if (result == null) return res.status(404).json({ type: "danger", message: "no_user" });
                if (result) return res.status(201).json({ farms: result.related('farms') });
            });
    } catch (error) {
        return res.status(500).json({ type: "danger", message: "error_user" });
    }
}


const addEvent = async (req, res) => {
    const { dose, time, start, title, end, field_uid } = req.body

    try {
        const field = await new Field({ 'uid': field_uid })
            .fetch({ require: false })
            .then(field => {
                if (!field) return res.status(404).json({ type: "danger", message: "no_field" });
                if (field) {
                    const event = new Event({ dose, time, start, title, end, field_id: field.get('id') }).save()
                        .then((result) => {
                            return res.status(201).json({ type: "success", event: result });
                        }).catch(err => {
                            return res.status(500).json({ type: "danger", message: err });
                        });

                }
            }).catch(err => {
                console.log(err)
                return res.status(500).json({ type: "danger", message: err });
            });

    } catch (error) {
        console.log(error)
        return res.status(500).json({ type: "danger", message: "error_user" });

    }
}

const getEvents = async (req, res) => {
    const fieldUid = req.params.Uid

    try {
        const field = await new Field({ 'uid': fieldUid })
            .fetch({ require: false })
            .then(async field => {
                if (!field) return res.status(404).json({ type: "danger", message: "no_field" });
                if (field) {
                    const event = await new Event()
                        .query((qb) => {
                            qb.select('*');
                            qb.where({ 'field_id': field.get('id') })
                            qb.where('deleted_at', null)

                        })
                        .fetchAll({ require: false })
                        .then(async result => {
                            if (result == null) return res.status(404).json({ type: "danger", message: "no_events" });
                            if (result) return res.status(201).json({ events: result });
                        });
                }
            })
    } catch (error) {
        return res.status(500).json({ type: "danger", message: "error_user" });

    }
}

const editEvent = async (req, res) => {
    const { dose, time, start, title, end, event_id } = req.body

    try {
        const event = await new Event({ 'id': event_id })
            .fetch({ require: false })
            .then(event => {
                if (!event) return res.status(404).json({ type: "danger", message: "no event" });
                if (event) {
                    event.set({ dose, time, start, end })
                    event.save()
                        .then((result) => {
                            return res.status(201).json({ type: "success", event: result });
                        }).catch(err => {
                            return res.status(500).json({ type: "danger", message: err });
                        });

                }
            }).catch(err => {
                console.log(err)
                return res.status(500).json({ type: "danger", message: err });
            });

    } catch (error) {
        console.log(error)
        return res.status(500).json({ type: "danger", message: "error_user" });

    }
}

const deleteEvent = async (req, res) => {
    const event_id = req.body.event_id;
    try {
        const event = new Event({ 'id': event_id })
            .fetch({ require: false })
            .then(async result => {
                if (result === null) return res.status(404).json({ type: "danger", message: "no_event" });
                if (result) {
                    result.set({ deleted_at: new Date() });
                    result.save()
                    return res.status(201).json({ type: "success", message: 'event_deleted' });
                }
            }).catch(err => {
                return res.status(500).json({ type: "danger", message: 'error_delete_event' });
            });;
    } catch (error) {
        return res.status(500).json({ type: "danger", message: "error_field" });
    }
}

const getSatteliteImages = async (req, res) => {
    try {
        const { polygon } = req.body;

        const apiUrl = 'https://app.satellite.robocare.tn/api/service/task/detail/';
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ polygon }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Server error:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}



const validateField = (method) => {
    switch (method) {
        case 'addEdit': {
            return [
                body('name', 'name_empty').notEmpty()
            ]
        }
    }
}
module.exports = { getFieldsByConnectedUser, searchAllFields, getSingleField, addFiel, editField, deleteField, getFieldsByFarm, validateField, getFieldsByStatus, searchField, addEvent, getEvents, editEvent, deleteEvent, getSatteliteImages }