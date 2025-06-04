const User = require('./../../models/User.js');
const Farm = require('./../../models/Farm.js');
const { body, validationResult } = require('express-validator');

const getFarmsByConnectedUser = async (req, res) => {
    if (!(req.userUid) || req.userUid == "") return res.status(404).json({ type: "danger", message: "no_user" });
    const uid = req.userUid;
    try {
        const user = await new User({ 'uid': uid })

            .fetch({
                withRelated: [
                    { 'farms': (qb) => { qb.where('deleted_at', null); } }, { 'farms.fields': (qb) => { qb.where('deleted_at', null); } },
                    { 'farms.fields.sensors': (qb) => { qb.where('deleted_at', null); } }, 'farms.city'], require: false
            })
            .then(async result => {
                if (result === null) return res.status(404).json({ type: "danger", message: "no_user_farm" });
                const farms = result.related('farms').toJSON();
                const farmsWithUserUid = farms.map(farm => ({
                    ...farm,
                    user: { uid: result.get('uid') }
                }));

                return res.status(201).json({ farms: farmsWithUserUid });

            });
    } catch (error) {
        return res.status(500).json({ type: "danger", message: "error_user" });
    }
}

const searchFarms = async (req, res) => {
    const { search = '' } = req.query;
    const userUid = req.userUid;
    if (!userUid) {
        return res.status(401).json({ type: "danger", message: "unauthenticated" });
    }
    try {
        const user = await new User({ uid: userUid }).fetch({ require: true });
        const role = user.get('role');
        console.log(role);

        const farms = await Farm.query(qb => {
            qb.where('deleted_at', null);
            if (role !== "ROLE_ADMIN") {
                qb.andWhere('user_id', user.get('id'));
            }
            if (search) {
                qb.andWhereRaw('LOWER(name) LIKE ?', [`%${search.toLowerCase()}%`]);
            }
        })
            .fetchAll({ require: false });

        const response = farms.toJSON().map(farm => ({
            value: farm.uid,
            label: farm.name
        }));

        console.log("Search:", search);
        console.log("Result:", response);

        return res.status(200).json(response);
    } catch (error) {
        console.error("searchFarms error:", error);
        return res.status(500).json({ type: "danger", message: "error_fetching_farms" });
    }
};


const getSingleFarm = async (req, res) => {
    const farm_uid = req.body.farm_uid;
    const uid = req.userUid
    try {
        const user = await new User({ 'uid': uid })
            .fetch({ withRelated: [{ 'farms': (qb) => { qb.where('uid', farm_uid); } }], require: false })
            .then(async result => {
                if (result === null) return res.status(404).json({ type: "danger", message: "no_user_farm" });
                return res.status(201).json({ farm: result.related('farms') });
            });
    } catch (error) {
        return res.status(500).json({ type: "danger", message: "error_user" });
    }
}


const addFarm = async (req, res) => {
    const { name, name_group, description, address, city_id, user_uid, Longitude, Latitude, Coordinates } = req.body;
    const errors = validationResult(req);



    if (!errors.isEmpty()) {
        console.log("Validation errors:", errors.array());
        res.status(422).json({ errors: errors.array() });
        return;
    }
    if (!user_uid || user_uid == "") return res.status(404).json({ type: "danger", message: "no_user" });
    try {
        const user = new User({ 'uid': user_uid })
            .fetch({ require: false })
            .then(async result => {

                if (result === null) return res.status(404).json({ type: "danger", message: "no_user" });
                if (result) {

                    await new Farm({ name, name_group, description, address, city_id, user_id: result.get('id'), Longitude, Latitude, Coordinates }).save()
                        .then((result) => {
                            return res.status(201).json({ type: "success", farm: result });
                        }).catch(err => {
                            return res.status(500).json({ type: "danger", message: err });
                        });
                }
            });
    } catch (error) {
        res.status(500).json({ type: "danger", message: "error_user" });
    }
}

const editFarm = async (req, res) => {
    const { name, name_group, description, address, city_id, user_uid, farm_uid } = req.body;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        res.status(422).json({ errors: errors.array() });
        return;
    }

    try {
        if (!(farm_uid)) return res.status(404).json({ type: "danger", message: "no_id_farm" });
        let farm_user_id = "";
        const user = await new User({ 'uid': user_uid })
            .fetch({ require: false })
            .then(async result => {
                if (result === null) return res.status(404).json({ type: "danger", message: "no_user_farm" });
                if (result) farm_user_id = result.get("id");
            });

        const farm = new Farm({ 'uid': farm_uid })
            .fetch({ require: false })
            .then(async result => {
                if (result === null) return res.status(404).json({ type: "danger", message: "no_farm" });
                if (result) {
                    result.set({ name, name_group, description, address, city_id, user_id: farm_user_id });
                    result.save()
                        .then((result) => {
                            return res.status(201).json({ type: "success", farm: result });
                        }).catch(err => {
                            return res.status(500).json({ type: "danger", message: 'error_save_farm' });
                        });
                }
            });
    } catch (error) {
        return res.status(500).json({ type: "danger", message: "error_farm" });
    }
}

const deleteFarm = async (req, res) => {
    const { farm_uid } = req.body;
    

    if (!farm_uid) {
        return res.status(400).json({ type: "danger", message: "missing_farm_uid" });
    }

    try {
        const farm = await new Farm({ uid: farm_uid }).fetch({ require: false });

        if (!farm) {
            return res.status(404).json({ type: "danger", message: "no_farm" });
        }

        await farm.save({ deleted_at: new Date() }, { patch: true });

        return res.status(200).json({ type: "success", message: "farm_deleted" });
    } catch (error) {
        console.error("Error deleting farm:", error);
        return res.status(500).json({ type: "danger", message: "error_delete_farm" });
    }
};


const setFarmPosition = async (req, res) => {
    let idFarm = req.body.idFarm;
    let lat = req.body.Latitude;
    let lgt = req.body.Longitude;
    if (!(idFarm) || idFarm == "") return res.status(404).json({ type: "danger", message: "no_farm" });
    try {

        const farm = new Farm({ 'id': idFarm })
            .fetch({ require: false })
            .then(async result => {
                if (result === null) return res.status(404).json({ type: "danger", message: "no_farm" });
                if (result) {
                    result.set({ Latitude: lat, Longitude: lgt });
                    result.save()
                    return res.status(201).json({ type: "success", message: 'farm_position_changed' });
                }
            }).catch(err => {
                return res.status(500).json({ type: "danger", message: 'error_change_farm_position' });
            });;
    } catch (error) {
        return res.status(500).json({ type: "danger", message: "error_farm" });
    }
}

const validateFarm = (method) => {
    switch (method) {
        case 'addEdit': {
            return [
                body('name', 'name_empty').notEmpty(),
                body('user_uid', 'user_empty').notEmpty()
            ]
        }
    }
}
module.exports = { getFarmsByConnectedUser, searchFarms, getSingleFarm, addFarm, editFarm, deleteFarm, validateFarm, setFarmPosition }