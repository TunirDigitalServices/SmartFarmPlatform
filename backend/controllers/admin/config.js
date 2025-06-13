const Cities = require('../../models/Cities')
// const CitiesList = require('../../models/CitiesList')
const Croptype = require('../../models/Croptype')
const Countries = require('../../models/Countries')
const Soiltype = require('../../models/Soiltype')
const Irrigationtype = require('../../models/Irrigationtype')
const CropVarieties = require('../../models/CropVarieties')
const multer = require('multer')


// Countries & Cities

const getCountries = async (req, res) => {

    try {
        const countries = await new Countries()
            .fetchAll({ require: false })
            .then(async result => {
                if (result == null) return res.status(404).json({ type: "danger", message: "no_cities" });
                if (result) return res.status(201).json({ type: "success", Countries: result });
            });
    } catch (error) {
        return res.status(500).json({ type: "danger", message: "error_user" });
    }

}

const getSingleCountry = async (req, res) => {

    const iso = req.body.iso;
    try {
        const countries = await new Countries({ 'iso': iso })

            .fetch({ require: false })
            .then(async result => {
                if (result === null) return res.status(404).json({ type: "danger", message: "no_country" });
                return res.status(201).json({ country: result });
            });
    } catch (error) {
        return res.status(500).json({ type: "danger", message: "error_user" });
    }
}

const addCountries = async (req, res) => {

    const { name, iso } = req.body

    try {
        const countries = await new Countries({ "iso": iso })
            .fetch({ require: false })
            .then(async (response) => {
                console.log(response)
                if (response != null) return res.status(404).json({ type: "danger", message: "existed_country" });
                if (response === null) {
                    await new Countries({ name, iso }).save()
                        .then((result) => {
                            return res.status(201).json({ type: "success", Country: result });
                        }).catch(err => {
                            return res.status(500).json({ type: "danger", message: err });
                        });

                }
            })
    } catch (error) {
        res.status(500).json({ type: "danger", message: error });
    }

}

const getSingleCity = async (req, res) => {

    const city_id = req.body.city_id;
    try {
        const cities = await new Cities({ 'id': city_id })
            .fetch({ require: false })
            .then(async result => {
                if (result === null) return res.status(404).json({ type: "danger", message: "no_city" });
                return res.status(201).json({ city: result });
            });
    } catch (error) {
        return res.status(500).json({ type: "danger", message: error });
    }
}

const getCities = async (req, res) => {

    try {
        const cities = await new Cities()
            .query((qb) => {
                qb.where('deleted_at', null)
            })
            .fetchAll({ require: false })
            .then(async result => {
                if (result == null) return res.status(404).json({ type: "danger", message: "no_cities" });
                if (result) return res.status(201).json({ type: "success", Cities: result });
            });
    } catch (error) {
        return res.status(500).json({ type: "danger", message: "error_user" });

    }

}



const addCities = async (req, res) => {

    const { country, iso, city, lat, lon } = req.body
    console.log(country, "+", iso)

    try {
        const countries = await new Countries({ "iso": iso })
            .fetch({ require: false })
            .then(async (response) => {
                if (response === null) return res.status(404).json({ type: "danger", message: "no_country" });
                if (response) {
                    await new Cities({ country, iso, city, lat, lon }).save()
                        .then((result) => {
                            return res.status(201).json({ type: "success", Cities: result });
                        }).catch(err => {
                            return res.status(500).json({ type: "danger", message: "error_save_City" });
                        });

                }
            })
    } catch (error) {
        res.status(500).json({ type: "danger", message: error });
    }

}

const editCities = async (req, res) => {

    const { city_id, country, iso, city, lat, lon } = req.body

    try {
        const cities = new Cities({ 'id': city_id, deleted_at: null })
            .fetch({ require: false })
            .then(async result => {
                if (result) {
                    result.set({ country, city, iso, lat, lon });
                    result.save()
                        .then((result) => {
                            return res.status(201).json({ type: "success", City: result });
                        }).catch(err => {
                            return res.status(500).json({ type: "danger", message: "error_edit_city" });
                        });
                }
            });
    } catch (error) {
        res.status(500).json({ type: "danger", message: error });
    }

}

const deleteCities = async (req, res) => {

    city_id = req.body.city_id

    try {
        const cities = new Cities({ 'id': city_id })
            .fetch({ require: false })
            .then(async result => {
                if (result === null) return res.status(404).json({ type: "danger", message: "no_city" });
                if (result) {
                    result.set({ deleted_at: new Date() });
                    result.save()
                    return res.status(201).json({ type: "success", message: 'city_deleted' });
                }
            }).catch(err => {
                return res.status(500).json({ type: "danger", message: 'error_delete_city' });
            });;
    } catch (error) {
        res.status(500).json({ type: "danger", message: error });
    }

}


const getCitiesByCountry = async (req, res) => {

    const countryIso = req.params.iso;
    try {
        new Cities()
            .query((qb) => {
                qb.select('*');
                qb.where({ iso: countryIso })
                qb.where('deleted_at', null)

            })
            .fetchAll({ require: false })
            .then(async result => {
                if (result === null) return res.status(404).json({ type: "danger", message: "no_cities" });
                return res.status(201).json({ cities: result });



            });
    } catch (error) {
        return res.status(500).json({ type: "danger", message: error });
    }
}


// Crops
const getSingleCrop = async (req, res) => {

    const crop_id = req.body.crop_id;
    try {
        const crops = await new Croptype({ 'id': crop_id })
            .fetch({ require: false })
            .then(async result => {
                if (result === null) return res.status(404).json({ type: "danger", message: "no_crop" });
                return res.status(201).json({ crop: result });
            });
    } catch (error) {
        return res.status(500).json({ type: "danger", message: "error_user" });
    }
}

const storageCrop = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'docs/img/crop');
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    },
    fileFilter: (req, file, callback) => {
        if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg") {
            callback(null, true);
        } else {
            callback(null, false);
            return callback(new Error('Only .png, .jpg and .jpeg format allowed!'));
        }
    }
});

const uploadCrop = multer({ storage: storageCrop }).single('photo');

const uploadCropPicture = async (req, res) => {
    uploadCrop(req, res, function (err) {
        if (err) {
            return res.status(500).json({ type: "danger", message: err });
        } else {
            const { crop } = req.body;
            const crops = new Croptype({ crop: crop, deleted_at: null })
                .fetch({ require: false })
                .then(async result => {
                    if (result) {
                        result.set({ crop_photo: req.file.originalname });
                        result.save();
                    }
                });
        }
        res.status(201).json({ type: "success", message: 'File is uploaded' });
    });
};


const storageSoil = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'docs/img/soil');
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    },
    fileFilter: (req, file, callback) => {
        if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg") {
            callback(null, true);
        } else {
            callback(null, false);
            return callback(new Error('Only .png, .jpg and .jpeg format allowed!'));
        }
    }
});

const uploadSoil = multer({ storage: storageSoil }).single('photo');

const uploadSoilPicture = async (req, res) => {
    uploadSoil(req, res, function (err) {
        if (err) {
            return res.status(500).json({ type: "danger", message: err });
        } else {
            const { soil } = req.body;
            const soils = new Soiltype({ soil: soil, deleted_at: null })
                .fetch({ require: false })
                .then(async result => {
                    if (result) {
                        result.set({ soil_photo: req.file.originalname });
                        result.save();
                    }
                });
        }
        res.status(201).json({ type: "success", message: 'File is uploaded' });
    });

}

const storageVarieties = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'docs/img/variety');
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    },
    fileFilter: (req, file, callback) => {
        if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg") {
            callback(null, true);
        } else {
            callback(null, false);
            return callback(new Error('Only .png, .jpg and .jpeg format allowed!'));
        }
    }
});

const uploadVariety = multer({ storage: storageVarieties }).single('photo');

const uploadVarietyPicture = async (req, res) => {
    uploadVariety(req, res, function (err) {
        if (err) {
            return res.status(500).json({ type: "danger", message: err });
        } else {
            const { variety } = req.body;
            const varieties = new CropVarieties({ crop_variety: variety, deleted_at: null })
                .fetch({ require: false })
                .then(async result => {
                    if (result) {
                        result.set({ variety_photo: req.file.originalname });
                        result.save();
                    }
                });
        }
        res.status(201).json({ type: "success", message: 'File is uploaded' });
    });

}

const addCrops = async (req, res) => {

    const { crop, plant_date, init, dev, mid, late, kc_init, kc_dev, kc_mid, kc_late, all_kc, root_min, root_max, hours, temperature, practical_fraction, crop_ar, crop_en } = req.body
    let total = Number(init) + Number(dev) + Number(mid) + Number(late)
    try {

        if (crop && plant_date) {

            await new Croptype({ crop, plant_date, init, dev, mid, late, total, kc_init, kc_dev, kc_mid, kc_late, all_kc, root_min, root_max, hours, temperature, practical_fraction, crop_ar, crop_en }).save()
                .then((result) => {
                    return res.status(201).json({ type: "success", Crops: result });
                }).catch(err => {
                    return res.status(500).json({ type: "danger", message: "error_save_Crops" });
                });
        }
    } catch (error) {
        res.status(500).json({ type: "danger", message: "error_user" });
    }

}

const getCrops = async (req, res) => {

    try {
        const crops = await new Croptype()
            .query((qb) => {
                qb.where('deleted_at', null)
            })
            .fetchAll({ require: false })
            .then(async result => {
                if (result == null) return res.status(404).json({ type: "danger", message: "no_crops" });
                if (result) return res.status(201).json({ type: "success", Crops: result });
            });
    } catch (error) {
        return res.status(500).json({ type: "danger", message: "error_user" });
    }

}

const editCrop = async (req, res) => {

    const { crop_id, crop, plant_date, init, dev, mid, late, kc_init, kc_dev, kc_mid, kc_late, all_kc, crop_variety, root_min, root_max, hours, temperature, practical_fraction } = req.body



    let total = ""
    if (init && dev && mid && late) {
        total = Number(init) + Number(dev) + Number(mid) + Number(late)

    }


    try {
        const crops = new Croptype({ 'id': crop_id, deleted_at: null })
            .fetch({ require: false })
            .then(async result => {
                if (result) {
                    result.set({ crop, plant_date, init, dev, mid, late, kc_init, kc_dev, kc_mid, kc_late, all_kc, crop_variety, total, root_min, root_max, hours, temperature, practical_fraction });
                    result.save()
                        .then((result) => {
                            return res.status(201).json({ type: "success", Crop: result });
                        }).catch(err => {
                            return res.status(500).json({ type: "danger", message: err });
                        });
                }
            });
    } catch (error) {
        res.status(500).json({ type: "danger", message: error });
    }

}

const deleteCrop = async (req, res) => {

    crop_id = req.body.crop_id

    try {
        const cities = new Croptype({ 'id': crop_id })
            .fetch({ require: false })
            .then(async result => {
                if (result === null) return res.status(404).json({ type: "danger", message: "no_city" });
                if (result) {
                    result.set({ deleted_at: new Date() });
                    result.save()
                    return res.status(201).json({ type: "success", message: 'crop_deleted' });
                }
            }).catch(err => {
                return res.status(500).json({ type: "danger", message: 'error_delete_rop' });
            });;
    } catch (error) {
        res.status(500).json({ type: "danger", message: error });
    }

}

// Crops Varieties

const addVariety = async (req, res) => {
    const { crop_id, plant_date, init, dev, mid, late, kc_init, kc_dev, kc_mid, kc_late, all_kc, crop_variety, root_min, root_max, variety_ar, variety_en } = req.body
    let total = Number(init) + Number(dev) + Number(mid) + Number(late)
console.log(plant_date,"------------ plant_date");

    if (!(req.body.crop_id) || req.body.crop_id == "") return res.status(404).json({ type: "danger", message: "no_crop_selected" });
    try {
        const crops = new Croptype({ 'id': crop_id, deleted_at: null })
            .fetch({ require: false })
            .then(async result => {
                if (result === null) return res.status(404).json({ type: "danger", message: "no_crop" });
                if (result) {
                    await new CropVarieties({ crop_id, plant_date, init, dev, mid, late, total, kc_init, kc_dev, kc_mid, kc_late, all_kc, crop_variety, root_min, root_max, variety_ar, variety_en }).save()
                        .then((result) => {
                            return res.status(201).json({ type: "success", cropVariety: result });
                        }).catch(err => {
                            return res.status(500).json({ type: "danger", message: err });
                        });
                }
            });
    } catch (error) {
        res.status(500).json({ type: "danger", message: "error_user" });
    }
}

const getSingleCropVariety = async (req, res) => {

    const variety_id = req.body.variety_id;
    try {
        const cropsVariety = await new CropVarieties({ 'id': variety_id })
            .fetch({ require: false })
            .then(async result => {
                if (result === null) return res.status(404).json({ type: "danger", message: "no_variety" });
                console.log(result,"resulttt");
                
                return res.status(201).json({ variety: result });
            });
    } catch (error) {
        return res.status(500).json({ type: "danger", message: error });
    }
}

const getVarieties = async (req, res) => {

    try {
        const crops = await new CropVarieties()
            .query((qb) => {
                qb.where('deleted_at', null)
            }).orderBy('crop_variety', 'asc')
            .fetchAll({ require: false })
            .then(async result => {
                if (result == null) return res.status(404).json({ type: "danger", message: "no_varieties" });
                if (result) return res.status(201).json({ type: "success", Varieties: result });
            });
    } catch (error) {
        return res.status(500).json({ type: "danger", message: "error_user" });
    }

}

const editVariety = async (req, res) => {

    const { variety_id, plant_date, init, dev, mid, late, kc_init, kc_dev, kc_mid, kc_late, all_kc, crop_variety, root_min, root_max } = req.body
    let total = ""
    if (init && dev && mid && late) {
        total = Number(init) + Number(dev) + Number(mid) + Number(late)

    }


    try {
        const cropsVariety = new CropVarieties({ 'id': variety_id, deleted_at: null })
            .fetch({ require: false })
            .then(async result => {
                if (result) {
                    result.set({ plant_date, init, dev, mid, late, total, kc_init, kc_dev, kc_mid, kc_late, all_kc, crop_variety, root_min, root_max });
                    result.save()
                        .then((result) => {
                            return res.status(201).json({ type: "success", CropVariety: result });
                        }).catch(err => {
                            return res.status(500).json({ type: "danger", message: err });
                        });
                }
            });
    } catch (error) {
        res.status(500).json({ type: "danger", message: error });
    }

}

const deleteCropVariety = async (req, res) => {

    let variety_id = req.body.variety_id

    try {
        const variety = new CropVarieties({ 'id': variety_id })
            .fetch({ require: false })
            .then(async result => {
                if (result === null) return res.status(404).json({ type: "danger", message: "no_variety" });
                if (result) {
                    result.set({ deleted_at: new Date() });
                    result.save()
                    return res.status(201).json({ type: "success", message: 'crop_variety_deleted' });
                }
            }).catch(err => {
                return res.status(500).json({ type: "danger", message: 'error_delete_variety' });
            });;
    } catch (error) {
        res.status(500).json({ type: "danger", message: error });
    }

}

// Soils

const getSingleSoil = async (req, res) => {

    const soil_id = req.body.soil_id;
    try {
        const soils = await new Soiltype({ 'id': soil_id })
            .fetch({ require: false })
            .then(async result => {
                if (result === null) return res.status(404).json({ type: "danger", message: "no_soil" });
                return res.status(201).json({ soil: result });
            });
    } catch (error) {
        return res.status(500).json({ type: "danger", message: "error_user" });
    }
}

const addSoils = async (req, res) => {

    const { soil, ru, pwp, taw, fc, practical_fraction, rain_eff } = req.body
    try {
        await new Soiltype({ soil, ru, pwp, taw, fc, practical_fraction, rain_eff }).save()
            .then((result) => {
                return res.status(201).json({ type: "success", Soils: result });
            }).catch(err => {
                return res.status(500).json({ type: "danger", message: "error_save_Soils" });
            });
    } catch (error) {
        res.status(500).json({ type: "danger", message: "error_user" });
    }

}

const getSoils = async (req, res) => {

    try {
        const soils = await new Soiltype()
            .query((qb) => {
                qb.where('deleted_at', null)
            })
            .fetchAll({ require: false })
            .then(async result => {
                if (result == null) return res.status(404).json({ type: "danger", message: "no_soils" });
                if (result) return res.status(201).json({ type: "success", Soils: result });
            });
    } catch (error) {
        return res.status(500).json({ type: "danger", message: "error_user" });
    }

}

const editSoil = async (req, res) => {

    const { soil_id, soil, ru, pwp, taw, fc, practical_fraction, rain_eff } = req.body

    try {
        const soils = new Soiltype({ 'id': soil_id, deleted_at: null })
            .fetch({ require: false })
            .then(async result => {
                if (result) {
                    result.set({ soil, ru, pwp, taw, fc, practical_fraction, rain_eff });
                    result.save()
                        .then((result) => {
                            return res.status(201).json({ type: "success", Soil: result });
                        }).catch(err => {
                            return res.status(500).json({ type: "danger", message: err });
                        });
                }
            });
    } catch (error) {
        res.status(500).json({ type: "danger", message: error });
    }

}

const deleteSoil = async (req, res) => {

    soil_id = req.body.soil_id

    try {
        const soils = new Soiltype({ 'id': soil_id })
            .fetch({ require: false })
            .then(async result => {
                if (result === null) return res.status(404).json({ type: "danger", message: "no_soil" });
                if (result) {
                    result.set({ deleted_at: new Date() });
                    result.save()
                    return res.status(201).json({ type: "success", message: 'soil_deleted' });
                }
            }).catch(err => {
                return res.status(500).json({ type: "danger", message: 'error_delete_soil' });
            });;
    } catch (error) {
        res.status(500).json({ type: "danger", message: error });
    }

}

// Irrigations

const getSingleIrrigation = async (req, res) => {

    const irrigation_id = req.body.irrigation_id;
    try {
        const irrigations = await new Irrigationtype({ 'id': irrigation_id })
            .fetch({ require: false })
            .then(async result => {
                if (result === null) return res.status(404).json({ type: "danger", message: "no_irrigation" });
                return res.status(201).json({ irrigation: result });
            });
    } catch (error) {
        return res.status(500).json({ type: "danger", message: "error_user" });
    }
}

const addIrrigations = async (req, res) => {

    const { irrigation, pivot_shape, lateral, effIrrig } = req.body
    try {
        await new Irrigationtype({ irrigation, pivot_shape, lateral, effIrrig }).save()
            .then((result) => {
                return res.status(201).json({ type: "success", Irrigations: result });
            }).catch(err => {
                return res.status(500).json({ type: "danger", message: "error_save_Irrigations" });
            });
    } catch (error) {
        res.status(500).json({ type: "danger", message: "error_user" });
    }

}

const getIrrigations = async (req, res) => {

    try {
        const Irrigations = await new Irrigationtype()
            .query((qb) => {
                qb.where('deleted_at', null)
            }).orderBy('irrigation', 'asc')
            .fetchAll({ require: false })
            .then(async result => {
                if (result == null) return res.status(404).json({ type: "danger", message: "no_Irrigation" });
                if (result) return res.status(201).json({ type: "success", Irrigations: result });
            });
    } catch (error) {
        return res.status(500).json({ type: "danger", message: "error_user" });
    }

}

const editIrrigation = async (req, res) => {

    const { irrigation_id, irrigation, pivot_shape, lateral, effIrrig } = req.body

    try {
        const irrigations = new Irrigationtype({ 'id': irrigation_id, deleted_at: null })
            .fetch({ require: false })
            .then(async result => {
                if (result) {
                    result.set({ irrigation, pivot_shape, lateral, effIrrig });
                    result.save()
                        .then((result) => {
                            return res.status(201).json({ type: "success", Irrigations: result });
                        }).catch(err => {
                            return res.status(500).json({ type: "danger", message: err });
                        });
                }
            });
    } catch (error) {
        res.status(500).json({ type: "danger", message: error });
    }

}

const deleteIrrigation = async (req, res) => {

    irrigation_id = req.body.irrigation_id

    try {
        const irrigations = new Irrigationtype({ 'id': irrigation_id })
            .fetch({ require: false })
            .then(async result => {
                if (result === null) return res.status(404).json({ type: "danger", message: "no_irrigation" });
                if (result) {
                    result.set({ deleted_at: new Date() });
                    result.save()
                    return res.status(201).json({ type: "success", message: 'irrigation_deleted' });
                }
            }).catch(err => {
                return res.status(500).json({ type: "danger", message: 'error_delete_irrigation' });
            });;
    } catch (error) {
        res.status(500).json({ type: "danger", message: error });
    }

}

module.exports = {
    getSingleCrop, addCrops, getCrops, editCrop, deleteCrop, uploadCropPicture,
    getSingleCropVariety, addVariety, deleteCropVariety, editVariety, getVarieties, uploadVarietyPicture,
    getCountries, getSingleCountry, addCountries, addCities, getCities, getSingleCity, getCitiesByCountry, deleteCities, editCities,
    addSoils, getSoils, getSingleSoil, editSoil, deleteSoil, uploadSoilPicture,
    addIrrigations, getIrrigations, getSingleIrrigation, editIrrigation, deleteIrrigation
}








