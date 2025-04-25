const CropType = require('../../models/Croptype')
const SoilType = require('../../models/Soiltype')
const CropVarieties = require('../../models/CropVarieties')
const Citiesweather = require('../../models/Citiesweather')
const Simulation = require('../../models/Simulation')
const User = require('../../models/User')
const { body, validationResult } = require('express-validator');


const addDays = (date, days) => {
    let result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}


const calculSimulation = async (req, res) => {
    const {croptype_id, soiltype_id, city_id, cropvariety_id , name ,date,inputs} = req.body
    const uid = req.userUid
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.status(422).json({ errors: errors.array() });
      return;
    }
    let sumETC = 0
    let sumIrrig = 0
    let sumNbrIrrig = 0
    let sumRain = 0
    var elements = [];
    let resultFormule = []
    let ET0 = 2
    let ETC = 0
    let RuInitial = 0
    let RuMax = 0
    let Pe = 0
    let bilanHydrique = 0
    let Irrigation = 0
    let firstFormule = 0
    let formule = 0
    let firstFormuleIrrig = 0
    let formuleIrrig = 0
    let dataCrop = {}
    let dataSoil = 0
    let dataWeather = {}
    let IrrigationNbr = 0

    try {
        const cropType = await new CropType({ 'id': croptype_id, deleted_at: null })
            .fetch({require: false })
            .then(async response => {
                if (response == null) return res.status(404).json({ type: "danger", message: "no_croptype" });
                if (response) {
                    dataCrop = JSON.parse(JSON.stringify(response));
                }
            }).catch(error => {
                return res.status(500).json({ type: "danger", message: "error_croptype" });

            })
        if (cropvariety_id != "") {
            const cropVarities = await new CropVarieties({ 'id': cropvariety_id, deleted_at: null })

                .fetch({ require: false })
                .then(async response => {
                    if (response == null) return res.status(404).json({ type: "danger", message: "no_croptype" });
                    if (response) {
                        dataCrop = JSON.parse(JSON.stringify(response));
                    }
                }).catch(error => {

                    return res.status(500).json({ type: "danger", message: "error_croptype" });

                })
        }

        const soilType = await new SoilType({ 'id': soiltype_id, deleted_at: null })
            .fetch({ require: false })
            .then(async result => {
                if (result) {
                    dataSoil = JSON.parse(JSON.stringify(result));

                }
            }).catch(error => {
                return res.status(500).json({ type: "danger", message: "error_soiltype" });

            })

        const citiesWeather = await new Citiesweather({ 'city_id': city_id, deleted_at: null })
            .fetch({ require: false })
            .then(async result => {
                if (result) {
                    dataWeather = JSON.parse(JSON.stringify(result));
                }
            }).catch(error => {
                return res.status(500).json({ type: "danger", message: "error_city" });

            })

            //TODO test if exist data
            
        if (dataWeather) {

            let days = Number(inputs.days)
            let profondeur = Number(inputs.Profondeur)
            let ruPratique = Number(inputs.ruPratique)
            let weatherByDay = dataWeather.weather_data_days
            let weatherByMonth = dataWeather.weather_data
            RuMax = Number(inputs.RUmax) * Number(profondeur)
            RuInitial = Number(inputs.RUmax) * Number(profondeur)
            let Epuisement_maximal = (Number(inputs.RUmax) * Number(profondeur) * Number(ruPratique)) / 100
            let RuMin = Number(RuMax) - Number(Epuisement_maximal)
            let rainByDay = {}
            if (weatherByDay) {
                rainByDay = Object.values(weatherByDay)[2]
            }
            let rainByMonth = {};
            if (weatherByMonth) {
                rainByMonth = Object.values(weatherByMonth)[2]
            }

            for (let i = 1, j = days; i <= days; i++, j--) {
                let date = addDays(inputs.plantingDate, i - 1)
                var month = date.getMonth();
                var day = date.getDate();
                let rainData = 0;
                if (typeof rainByDay !== 'undefined' && typeof rainByDay[month + "_" + day + "_rain"] !== 'undefined') {
                    rainData = rainByDay[month + "_" + day + "_rain"];
                }
                if (typeof rainByDay !== 'undefined' && (typeof rainByDay[month + "_" + day + "_rain"] === 'undefined') &&
                typeof rainByMonth !== 'undefined' && typeof rainByMonth[month + "_rain"] !== 'undefined') {
                    rainData = rainByMonth[month + "_rain"]
                }

                Pe = Number(rainData) * Number(inputs.effPluie) / 100

                let kcValue = 0;
                if (typeof dataCrop.all_kc[i - 1] !== 'undefined') {
                    kcValue = dataCrop.all_kc[i - 1].kc

                }
                ETC = Number(kcValue) * Number(ET0)
                let prevResultBilan = 0
                
                
                firstFormule = (Number(RuInitial) + Number(Pe)) - Number(ETC)
                if (i > 1) {
                    prevResultBilan = resultFormule[(i - 1) - 1]
                    formuleIrrig = ((Number(RuMax) - Number(prevResultBilan)) + Number(ETC)) / (Number(inputs.effIrrig) / 100)
                    formule = (Number(prevResultBilan) + parseInt(Pe)) - (parseFloat(ETC).toFixed(1) + Irrigation)
                }
                firstFormuleIrrig = (Number(RuMax) - Number(firstFormule)) / Number(inputs.effIrrig)

                if (i === 1) {
                    if (firstFormule <= RuMax) {
                        bilanHydrique = firstFormule
                    } else {
                        bilanHydrique = RuMax
                    }
                    if (RuInitial <= RuMin) {
                        Irrigation = firstFormuleIrrig
                    } else {
                        Irrigation = 0
                    }
                } else {
                    if (formule <= RuMax) {
                        bilanHydrique = formule
                    } else {
                        bilanHydrique = RuMax
                    }
                    if (prevResultBilan <= RuMin) {
                        Irrigation = formuleIrrig
                    } else {
                        Irrigation = 0
                    }
                }
                if (Irrigation === 0) {

                    IrrigationNbr = 0
                } else {
                    IrrigationNbr = 1
                }
                resultFormule.push(bilanHydrique)
                if (ETC) {
                    sumETC = sumETC + ETC
    
                }
                if (Irrigation > 0) {
                    sumNbrIrrig = sumNbrIrrig + IrrigationNbr
                    sumIrrig = sumIrrig + Irrigation
                }
                sumRain = sumRain + rainData 

                elements.push({
                    days: i,
                    date: date,
                    bilan: bilanHydrique,
                    pe: Pe,
                    Etc:ETC,
                    rain: rainData,
                    kc: kcValue,
                    irrigation: Irrigation,
                    irrigationNbr: IrrigationNbr
                })

            }

        }
       const user = new User({"uid" : uid})
       .fetch({require: false})
       .then(async result => {
        if (result === null) return res.status(404).json({ type:"danger", message: "no_user"});
        if(result){
            const simulation = new Simulation({"name" : name , "user_id" : result.get('id') ,'deleted_at' :null})
            .fetch({require: false})
            .then(async data => {
                if(data) return res.status(200).json({ type:"danger", message: "Exist simulation name"})
                if(data === null){
                    await new Simulation({user_id: result.get('id'),croptype_id, soiltype_id, city_id, cropvariety_id ,name ,date, result :elements,inputs}).save()
                    .then((result) => {
                        return res.status(200).json({ type:"success", simulation : result,sumETC : sumETC ,sumIrrig : sumIrrig,sumNbrIrrig : sumNbrIrrig,sumRain : sumRain});
                    }).catch(err => {
                        return res.status(500).json({ type:"danger", message: "error_save_simulation" });
                    });

                }

            }).catch(err => {
                return res.status(500).json({ type:"danger", message: "Name simulation exist" });
            });

        }
       }).catch(error=>{
        return res.status(500).json({ type:"danger", message: "error_save_simulation" });
            
       })

    } catch (error) {
        return res.status(500).json({ type: "danger", message: error });

    }
}

const editSimulation = async (req,res) => {
    const {simulation_id,croptype_id, soiltype_id, city_id, cropvariety_id , name ,date,inputs} = req.body
    const uid = req.userUid
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.status(422).json({ errors: errors.array() });
      return;
    }
    let sumETC = 0
    let sumIrrig = 0
    let sumNbrIrrig = 0
    let sumRain = 0
    var elements = [];
    let resultFormule = []
    let ET0 = 2
    let ETC = 0
    let RuInitial = 0
    let RuMax = 0
    let Pe = 0
    let bilanHydrique = 0
    let Irrigation = 0
    let firstFormule = 0
    let formule = 0
    let firstFormuleIrrig = 0
    let formuleIrrig = 0
    let dataCrop = {}
    let dataSoil = 0
    let dataWeather = {}
    let IrrigationNbr = 0

    try {
        const cropType = await new CropType({ 'id': croptype_id, deleted_at: null })
            .fetch({require: false })
            .then(async response => {
                if (response == null) return res.status(404).json({ type: "danger", message: "no_croptype" });
                if (response) {
                    dataCrop = JSON.parse(JSON.stringify(response));
                }
            }).catch(error => {
                return res.status(500).json({ type: "danger", message: error});

            })
        if (cropvariety_id != "") {
            const cropVarities = await new CropVarieties({ 'id': cropvariety_id, deleted_at: null })

                .fetch({ require: false })
                .then(async response => {
                    if (response == null) return res.status(404).json({ type: "danger", message: "no_croptype" });
                    if (response) {
                        dataCrop = JSON.parse(JSON.stringify(response));
                    }
                }).catch(error => {
                    return res.status(500).json({ type: "danger", message: error });

                })
        }

        const soilType = await new SoilType({ 'id': soiltype_id, deleted_at: null })
            .fetch({ require: false })
            .then(async result => {
                if (result) {
                    dataSoil = JSON.parse(JSON.stringify(result));

                }
            }).catch(error => {
                return res.status(500).json({ type: "danger", message: "error_soiltype" });

            })

        const citiesWeather = await new Citiesweather({ 'city_id': city_id, deleted_at: null })
            .fetch({ require: false })
            .then(async result => {
                if (result) {
                    dataWeather = JSON.parse(JSON.stringify(result));
                }
            }).catch(error => {
                return res.status(500).json({ type: "danger", message: "error_city" });

            })

            //TODO test if exist data
            
        if (dataWeather) {

            let days = Number(inputs.days)
            let profondeur = Number(inputs.Profondeur)
            let ruPratique = Number(inputs.ruPratique)
            let weatherByDay = dataWeather.weather_data_days
            let weatherByMonth = dataWeather.weather_data
            RuMax = Number(inputs.RUmax) * Number(profondeur)
            RuInitial = Number(RuMax) * Number(profondeur)
            let Epuisement_maximal = (Number(RuMax) * Number(profondeur) * Number(ruPratique)) / 100
            let RuMin = Number(RuMax) - Number(Epuisement_maximal)
            let rainByDay = {}
            if (weatherByDay) {
                rainByDay = Object.values(weatherByDay)[2]
            }
            let rainByMonth = {};
            if (weatherByMonth) {
                rainByMonth = Object.values(weatherByMonth)[2]
            }

            for (let i = 1, j = days; i <= days; i++, j--) {
                let date = addDays(inputs.plantingDate, i - 1)
                var month = date.getMonth();
                var day = date.getDate();
                let rainData = 0;
                if (typeof rainByDay !== 'undefined' && typeof rainByDay[month + "_" + day + "_rain"] !== 'undefined') {
                    rainData = rainByDay[month + "_" + day + "_rain"];
                }
                if (typeof rainByDay !== 'undefined' && (typeof rainByDay[month + "_" + day + "_rain"] === 'undefined') &&
                typeof rainByMonth !== 'undefined' && typeof rainByMonth[month + "_rain"] !== 'undefined') {
                    rainData = rainByMonth[month + "_rain"]
                }

                Pe = Number(rainData) * Number(inputs.effPluie) / 100

                let kcValue = 0;
                if (typeof dataCrop.all_kc[i - 1] !== 'undefined') {
                    kcValue = dataCrop.all_kc[i - 1].kc
                }
                ETC = Number(kcValue) * Number(ET0)
                let prevResultBilan = 0


                firstFormule = (Number(RuInitial) + Number(Pe)) - Number(ETC)

                if (i > 1) {
                    prevResultBilan = resultFormule[(i - 1) - 1]
                    formule = (Number(prevResultBilan) + Number(Pe)) - (Number(ETC) + 0)
                    formuleIrrig = ((Number(RuMax) - Number(prevResultBilan)) + Number(ETC)) / Number(inputs.effIrrig)
                }
                firstFormuleIrrig = (Number(RuMax) - Number(firstFormule)) / Number(inputs.effIrrig)



                if (i === 1) {
                    if (firstFormule <= RuMax) {
                        bilanHydrique = firstFormule
                    } else {
                        bilanHydrique = RuMax
                    }
                    if (RuInitial <= RuMin) {
                        Irrigation = firstFormuleIrrig
                    } else {
                        Irrigation = 0
                    }
                } else {
                    if (formule <= RuMax) {
                        bilanHydrique = formule
                    } else {
                        bilanHydrique = RuMax
                    }
                    if (prevResultBilan <= RuMin) {
                        Irrigation = formuleIrrig
                    } else {
                        Irrigation = 0
                    }
                }
                if (Irrigation === 0) {

                    IrrigationNbr = 0
                } else {
                    IrrigationNbr = 1
                }
                resultFormule.push(bilanHydrique)
                if (ETC) {
                    sumETC = sumETC + ETC
    
                }
                if (Irrigation > 0) {
                    sumNbrIrrig = sumNbrIrrig + IrrigationNbr
                    sumIrrig = sumIrrig + Irrigation
                }
                sumRain = sumRain + rainData 

                elements.push({
                    days: i,
                    date: date,
                    bilan: bilanHydrique,
                    pe: Pe,
                    Etc:ETC,
                    rain: rainData,
                    kc: kcValue,
                    irrigation: Irrigation,
                    irrigationNbr: IrrigationNbr
                })

            }

        }
       const user = new User({"uid" : uid})
       .fetch({require: false})
       .then(async dataUser => {
        if (dataUser === null) return res.status(404).json({ type:"danger", message: "no_user"});
        if(dataUser){
            
                    const simulation = await new Simulation({'id' : simulation_id})
                    .fetch({require : false})
                    .then((result) => {
                        if (result === null) return res.status(404).json({ type:"danger", message: "no_simulation"});
                       if(result){
                           result.set({user_id: dataUser.get('id'),croptype_id, soiltype_id, city_id, cropvariety_id ,name ,date, result :elements,inputs});
                           result.save()
                           .then((result) => {
                            return res.status(201).json({ type:"success", simulation : result });
                        }).catch(err => {
                            return res.status(500).json({ type:"danger", message: 'error_save_simulation' });
                        });
                       }

            }).catch(err => {
                return res.status(500).json({ type:"danger", message: "name_simulation_exist" });
            });

        }
       }).catch(error=>{
        return res.status(500).json({ type:"danger", message: "error_save_simulation" });
            
       })

    } catch (error) {
        return res.status(500).json({ type: "danger", message: error });

    }
}

const deleteSimulation = async (req, res) => {
   let simulation_id = req.body.simulation_id;



    try {
       
        const simulation = new Simulation({'id': simulation_id})
        .fetch({require: false})
        .then(async result => {
            if (result === null) return res.status(404).json({ type:"danger", message: "no_simulation"});
            if(result){
                result.set({deleted_at: new Date()});
                result.save()
                return res.status(201).json({ type:"success", message: 'simulation_deleted' });
            }
        }).catch(err => {
            return res.status(500).json({ type:"danger", message: 'error_delete_simulation' });
        });;
    } catch (error) {
        return res.status(500).json({ type:"danger", message: "error_farm" });
    } 
}

const getSimulationsByConnectedUser = async (req,res) =>{
    if(!(req.userUid) || req.userUid == "") return res.status(404).json({ type:"danger", message: "no_user"});
    const uid  = req.userUid;
    try {
        const user = await new User({'uid': uid})
        .fetch({require: false})
        .then(async result => {
            if (result === null) return res.status(404).json({ type:"danger", message: "no_user_simulation"});
            if(result){
                let user_id = result.get('id')
                const simulation =  await new Simulation()
                .query((qb) => {
                    qb.select('*');
                    qb.where({"user_id" : user_id })
                    qb.where('deleted_at', null)
                    qb.orderBy('id','DESC')
        
                })
                .fetchAll({require: false})
                .then(async result => {
                    return res.status(201).json({ type : "success" , simulations: result });
        
                });
            }
        }); 
    } catch (error) {
        return res.status(500).json({ type:"danger", message: "error_user" });
    }
}
const getAllSimulationsByConnectedUser = async (req,res) =>{
    if(!(req.userUid) || req.userUid == "") return res.status(404).json({ type:"danger", message: "no_user"});
    const uid  = req.userUid;
    try {
        const user = await new User({'uid': uid})
        .fetch({require: false})
        .then(async result => {
            if (result === null) return res.status(404).json({ type:"danger", message: "no_user_simulation"});
            if(result){
                let user_id = result.get('id')
                const simulation =  await new Simulation()
                .query((qb) => {
                    qb.select('*');
                    qb.where({"user_id" : user_id })
        
                })
                .fetchAll({require: false})
                .then(async result => {
                    return res.status(201).json({ type : "success" , simulations: result });
        
                });
            }
        }); 
    } catch (error) {
        return res.status(500).json({ type:"danger", message: "error_user" });
    }
}
const getSingleSimulation = async (req,res) =>{
    if(!(req.userUid) || req.userUid == "") return res.status(404).json({ type:"danger", message: "no_user"});
    const uid  = req.userUid;


    let simulation_id  = req.params.id;
    try {
        const user = await new User({'uid': uid})
        .fetch({require: false})
        .then(async userData => {
            if (userData === null) return res.status(404).json({ type:"danger", message: "no_user_simulation"});
            if(userData){
                const simulation = await new Simulation({'user_id': userData.get('id') ,'id' : simulation_id , deleted_at : null})
                .fetch({require: false})
                .then(async result => {
                    if(result == null) return res.status(404).json({ type:"danger", message: "no_simulation"});
                    if(result) return res.status(201).json({type : "success" , Simulation : result});
                });
            }
        })





        
    } catch (error) {
        return res.status(500).json({ type:"danger", message: "error_user" });
    }
}

const validateSimulation =(method) => {
    switch (method) {
      case 'addEdit': {
       return [ 
          body('name', 'name_empty').notEmpty(),
        ]   
      }
    }
  }

module.exports = { calculSimulation ,deleteSimulation ,getSimulationsByConnectedUser,getAllSimulationsByConnectedUser,getSingleSimulation,validateSimulation,editSimulation}

