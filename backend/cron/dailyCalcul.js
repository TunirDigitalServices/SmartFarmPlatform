const cron = require('node-cron');

const Field = require('../models/Field')
const CalculSensor = require('../models/CalculSensor')
const { body, validationResult } = require('express-validator');
const logger = require('../logs.js');


const fetch = require('node-fetch');
const Citiesweather = require('../models/Citiesweather')
const Farm = require('../models/Farm')
const Recommendation = require('../models/Recommendation')

const addDays = (date, days) => {
    let result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}

const getRainFromConfig = async (city_id) => {
    let dataWeather = {};
    const citiesWeather = await new Citiesweather({ 'city_id': city_id, deleted_at: null })

        .fetch({ require: false })
        .then(async result => {
            if (result) {
                dataWeather = JSON.parse(JSON.stringify(result));
            }
        }).catch(error => {
            return res.status(500).json({ type: "danger", message: "error_city" });

        })
    let weatherByDay = dataWeather.weather_data_days
    let weatherByMonth = dataWeather.weather_data

    let rainByDay = {}
    if (weatherByDay) {
        rainByDay = Object.values(weatherByDay)[2]
    }
    let rainByMonth = {};
    if (weatherByMonth) {
        rainByMonth = Object.values(weatherByMonth)[2]
    }

    return { rainByDay, rainByMonth };
}

const getRainFromWeather = async (lat, lon) => {
    let rain = [];
    const linkApi = 'https://api.openweathermap.org/data/2.5/forecast';
    const keyOpenWeather =  '482a3988a736d910de52ac8ac007e1ba';
    const response = await fetch(`${linkApi}?lat=${lat}&lon=${lon}&units=metric&appid=${keyOpenWeather}`);
    const data = await response.json();
    let list = data.list
    if (typeof list !== 'undefined') {
        list.map(async (weather) => {
            let date = weather.dt_txt.substr(0, 10);
            if (typeof weather.rain !== 'undefined') {
                rain.push({ "date": date, "rain": weather.rain['3h'] });
            }

        })
        var r = rain.reduce(function (pv, cv) {
            if (pv[cv.date]) {
                pv[cv.date] += cv.rain;
            } else {
                pv[cv.date] = cv.rain;
            }
            return pv;
        }, {});

        return r;
    } else {
        return [];
    }

}

const calculSimulation = async (DataIrrigations,DataCrops,ruPratiqueData, RUmaxData,dosePercentage, effPluie, effIrrig, irrigArea, days, profondeur, startPlantingDate,dataCrop, rainConfig, latField, lonField, fieldsId, codeSensor) => {
    let dailyDates =  []
    let dailyET0 = []
    await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latField}&longitude=${lonField}&timezone=GMT&daily=et0_fao_evapotranspiration`, {
      
    }).then((response) => response.json()).then((jsonData) => {
      dailyDates = jsonData.daily.time
       dailyET0 = jsonData.daily.et0_fao_evapotranspiration
   
    });
    let surfaceOccup = 0
    let flowByTree = 0
    let sumETC = 0
    let sumIrrig = 0
    let sumNbrIrrig = 0
    let sumRain = 0
    var elements = [];
    let resultFormule = []; let ETC = 0; let RuInitial = 0; let Pe = 0; let bilanHydrique = 0; 
    let firstFormule = 0; let formule = 0; let firstFormuleIrrig = 0; let formuleIrrig = 0; let dataSoil = 0
    let IrrigationNbr = 0; let RuMax = 0; let ruPratique = 0
    if (dataCrop != null && Object.keys(dataCrop).length > 0 && typeof dataCrop.all_kc !== 'undefined' && days > 0 && latField != null && latField != "" && lonField != null && lonField != "") {
        ruPratique = Number(ruPratiqueData)
        RuMax = Number(RUmaxData) * Number(profondeur)
        RuInitial = Number(RUmaxData) * Number(profondeur)
        let Epuisement_maximal = (Number(RUmaxData) * Number(profondeur) * Number(ruPratique)) / 100
        let RuMin = Number(RuMax) - Number(Epuisement_maximal)
        let rainData = 0;
        // let dynamicRUmin = ((Number(RuMax)- Number(RuMin)) * dosePercentage) / 100
        for (let i = 1, j = days; i <= days; i++, j--) {

            if (typeof dataCrop.all_kc[i - 1] !== 'undefined') {
                let ET0 = 6
                let doseByTree = 0
                let IrrigTime = 0
                let Irrigation = 0
                let date = addDays(startPlantingDate, i - 1)
                var month = date.getMonth();
                var day = date.getDate();
                var year = date.getYear();

                let currentDate = new Date();
                let dateCurrent = currentDate.getDate();
                currentDate.setDate(currentDate.getDate() + 7)
                var currentMonth = currentDate.getMonth();
                var currentDay = currentDate.getDate();
                var currentYear = currentDate.getYear();
                let DateFormat = new Date(date)
                let dateET0 = DateFormat.toISOString().slice(0, 10)
                dailyDates.map((dayDate,indx)=>{
                    if(dateET0 == dayDate){
                        ET0 = dailyET0[indx]
                    }
                })   
                if(DataCrops.length > 0){
                    DataCrops.map(item=>{
                        surfaceOccup =  2 * 3
                    })
                
                }
                if(DataIrrigations.length > 0){
                    DataIrrigations.map(item=>{
                        item.map(value=>{
                            flowByTree =  Number(value.drippers) * Number(value.flowrate)
                        })     
                    })
                
                }

                if (typeof rainConfig.rainByDay !== 'undefined' && typeof rainConfig.rainByDay[month + "_" + day + "_rain"] !== 'undefined') {
                    rainData = rainConfig.rainByDay[month + "_" + day + "_rain"];
                }
                if (typeof rainConfig.rainByDay !== 'undefined' && (typeof rainConfig.rainByDay[month + "_" + day + "_rain"] === 'undefined') &&
                    typeof rainConfig.rainByMonth !== 'undefined' && typeof rainConfig.rainByMonth[month + "_rain"] !== 'undefined') {
                    rainData = rainConfig.rainByMonth[month + "_rain"]
                }

                if (currentMonth == month && day >= dateCurrent && day < currentDay && year == currentYear) {
                    //get weather data
                    let sataRainWeather = await getRainFromWeather(latField, lonField);
                    let key = date.getFullYear() + "-" + ('0' + parseInt(date.getMonth() + 1)).slice(-2) + "-" + ('0' + day).slice(-2)
                    if (sataRainWeather && typeof sataRainWeather[key] !== 'undefined') {
                        rainData = sataRainWeather[key];
                    } else {
                        rainData = 0;
                    }
                }

                Pe = Number(rainData) * Number(effPluie) / 100

                let kcValue = 0;
                if (typeof dataCrop.all_kc[i - 1] !== 'undefined') {
                    kcValue = dataCrop.all_kc[i - 1].kc
                }
                ETC = Number(kcValue) * Number(ET0)
                let prevResultBilan = 0


                firstFormule = (Number(RuInitial) + Number(Pe)) - Number(ETC)
                if (i > 1) {
                    prevResultBilan = resultFormule[(i - 1) - 1]
                    // formuleIrrig = ((Number(RuMax) - Number(prevResultBilan)) + Number(ETC)) / (Number(effIrrig) / 100)
                     formuleIrrig = (Number(RuMax) - Number(RuMin)) / (Number(effIrrig) / 100)

                    formule = (Number(prevResultBilan) + parseInt(Pe)) - (parseFloat(ETC).toFixed(1) + Irrigation)
                }
                firstFormuleIrrig = (Number(RuMax) - Number(firstFormule)) / Number(effIrrig)

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
                    if(formule <= RuMin  ){
                        Irrigation = formuleIrrig
                        bilanHydrique = formule + formuleIrrig
                    }else{
                        Irrigation = 0

                    }
  
                }
                if (Irrigation == 0) {
                    
                    IrrigationNbr = 0
                } else {
                    IrrigationNbr = 1
                    doseByTree = Number(surfaceOccup) * (Number(Irrigation) / 1000)
                    IrrigTime = (Number(doseByTree) / (Number(flowByTree) / 1000)) * 60
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
                    RUmax : RuMax,
                    RUMin:RuMin,
                    days: i,
                    date: date,
                    bilan: bilanHydrique,
                    pe: Pe,
                    Etc: ETC,
                    ET0 :ET0, 
                    rain: rainData,
                    kc: dataCrop.all_kc[i - 1].kc,
                    irrigation: Irrigation,
                    irrigationNbr: IrrigationNbr, 
                    codeSensor: codeSensor,
                    irrigationTime : IrrigTime
                })
            }
        }
    }
    return elements;

}


const addCalculSensorRecommnd = async (user_id, field_id) => {

    try {
    await new CalculSensor()
    .query((qb) => {
        qb.select('*');
        qb.where({ user_id: user_id });
    })
        .fetchAll({ require: false })
        .then(async result => {
            let resultCalcul = JSON.parse(JSON.stringify(result))
            let todayDate = new Date()
            let today = todayDate.toISOString().slice(0, 10)
            let filteredResult = [];
            let title = ''
            let description = ''
            resultCalcul.map(calcul => {
                let startDate = new Date(calcul.start_date).toISOString().slice(0, 10)
                let endDate = new Date(calcul.end_date).toISOString().slice(0, 10)
                let resultCalcul = calcul.result
                if (today >= startDate && today <= endDate) {
                    filteredResult = resultCalcul.filter(result => {
                        let resultDate = new Date(result.date).toISOString().slice(0, 10)
                        return startDate <= resultDate && endDate >= resultDate
                    })
                }
            })
            if(filteredResult.length > 0){
                let calculWithIrrigation = filteredResult.filter(calcul=>{
                   let irrig = calcul.irrigationNbr
                    return irrig !== 0
                })
                if(calculWithIrrigation.length > 0){
                    title =  "Irrigate"
                    description = "Soil water is now less than the refill point ,  Plant water stress can occur if refill status persists"
                }
                else{
                    title = "Don't Irrigate"
                    description = "Soil water is not expected to fall below the refill point within the next 7 days, even without irrigation"
                }

                await new Recommendation({ title,description,user_id,field_id}).save()
            }
        })     
    } catch (error) {
        console.log(error)
    }
}


// const calculBilanHydrique = async () => {
//     console.log('Running calculBilanHydrique cron');
  
//     try {
//         const fields = await new Field()
//         .query((qb) => qb.where('deleted_at', null).whereNotNull('Latitude').whereNotNull('Longitude'))
//         .fetchAll({
//                 withRelated: [
//                     { 'sensors': (qb) => qb.where('deleted_at', null).andWhere('synchronized', '1') },
//                     { 'crops': (qb) => qb.where('deleted_at', null) },
//                     { 'crops.irrigations': (qb) => qb.where('deleted_at', null) },
//                     { 'crops.croptypes': (qb) => qb.where('deleted_at', null) },
//                     { 'crops.varieties': (qb) => qb.where('deleted_at', null) },
//                     { 'zones': (qb) => qb.where('deleted_at', null) }
//                 ],
//                 require: false
//             });
            
//         if (!fields || fields.length === 0) {
//             console.log('No fields found');
//             return;
//         }

//         for (const field of fields) {
//             const DataCrops = field.related('crops');
//             const DataIrrigations = DataCrops.map(data => data.related('irrigations'));
//             let RUmax = 0;
//             let effPluie = 0;
//             let effIrrig = 0;
//             let irrigArea = 0;
//             let ruPratique = 0;
//             let dataCrop = {};
//             let days = 0;
//             let latField = field.get('Latitude');
//             let lonField = field.get('Longitude');
//             let dataCalcul = [];
//             let inputs = [];
//             let plantingDate = '';
//             let profondeur = 0;
//             let zoneData = [];

//             const zones = field.related('zones');
//             if (zones && zones.length > 0) {
//                 zoneData = zones.map(zone => ({
//                     ruPratique: ruPratique,
//                     RUmax: Number(zone.get('RUmax')),
//                     effIrrig: effIrrig,
//                     effPluie: Number(zone.get('effPluie')),
//                     irrigArea: Number(zone.get('irrigArea'))
//                 }));
//             }

//             for (const crop of DataCrops) {
//                 days = Number(crop.get('days'));
//                 profondeur = Number(crop.get('rootDepth'));
//                 plantingDate = crop.get('plantingDate');
//                 ruPratique = Number(crop.get('practical_fraction'));
//                 dataCrop = crop.related('croptypes');
//                 console.log(days)
//                 if (crop.related('varieties') && crop.related('varieties').length > 0) {
//                     dataCrop = crop.related('varieties');
//                 }

//                 const irrigations = crop.related('irrigations');
//                 // console.log(irrigations)
//                 if (irrigations && irrigations.length > 0) {
//                     effIrrig = Number(irrigations[0].get('effIrrig'));
//                 }
//             }

//             const sensors = field.related('sensors');
//             if (sensors && sensors.length > 0) {
//                 const city_id = field.get('city_id');
//                 const rainConfig = await getRainFromConfig(city_id);

//                 for (const sensor of sensors) {
//                     const codeSensor = sensor.get('code');
//                     const user_id = sensor.get('user_id');

//                     if (codeSensor && dataCrop && Object.keys(dataCrop).length > 0 && dataCrop.all_kc && days > 0 && latField && lonField) {
//                         console.log(`Calculating for sensor ID ${sensor.get('id')} in field ID ${field.get('id')}`);
//                         const resultCalcul = await calculSimulation(DataIrrigations, DataCrops, ruPratique, RUmax, effPluie, effIrrig, irrigArea, days, profondeur, plantingDate, dataCrop, rainConfig, latField, lonField, field.get('id'), codeSensor);

//                         dataCalcul.push({
//                             user_id: user_id,
//                             field_id: field.get('id'),
//                             sensor_id: sensor.get('id'),
//                             sensor_code: codeSensor,
//                             resultCalcul: resultCalcul
//                         });

//                         if (resultCalcul && resultCalcul.length > 0) {
//                             const dateStart = new Date();
//                             const dateEnd = new Date(dateStart.getTime());
//                             dateEnd.setDate(dateEnd.getDate() + 7);

//                             inputs.push({
//                                 ruPratique: ruPratique,
//                                 RUmax: RUmax,
//                                 effPluie: effPluie,
//                                 effIrrig: effIrrig,
//                                 irrigArea: irrigArea,
//                                 profondeur: profondeur,
//                                 plantingDate: plantingDate
//                             });

//                             const existingCalculs = await new CalculSensor().where({ sensor_id: sensor.get('id') }).fetchAll({ require: false });
//                             if (existingCalculs && existingCalculs.length > 0) {
//                                 for (const existingCalcul of existingCalculs) {
//                                     const endDate = existingCalcul.get('end_date');
//                                     const currentDay = dateStart.toISOString().slice(0, 10);

//                                     if (currentDay >= endDate) {
//                                         await new CalculSensor({ user_id: user_id, field_id: sensor.get('field_id'), sensor_id: sensor.get('id'), sensor_code: codeSensor, start_date: dateStart, end_date: dateEnd, result: resultCalcul, inputs: inputs }).save();
//                                         await addCalculSensorRecommnd(user_id, sensor.get('field_id'));
//                                         console.log(`Calcul saved for sensor ID ${sensor.get('id')} in field ID ${sensor.get('field_id')}`);
//                                     }
//                                 }
//                             } else {
//                                 await new CalculSensor({ user_id: user_id, field_id: sensor.get('field_id'), sensor_id: sensor.get('id'), sensor_code: codeSensor, start_date: dateStart, end_date: dateEnd, result: resultCalcul, inputs: inputs }).save();
//                                 await addCalculSensorRecommnd(user_id, sensor.get('field_id'));
//                                 console.log(`Calcul saved for sensor ID ${sensor.get('id')} in field ID ${sensor.get('field_id')}`);
//                             }
//                         }
//                     }
//                 }
//             }
//         }

//         console.log('Calculations completed successfully');
//     } catch (error) {
//         console.log('Error during calculations:', error);
//     }
// };


const calculBilanHydrique = async (req, res) => {

    try {

        const field = await new Field()
            .query((qb) => qb.where('deleted_at', null).and.whereNotNull('Latitude').and.whereNotNull('Longitude'))
            .fetchAll({
                withRelated: [
                    { 'sensors': (qb) => { qb.where('deleted_at', null).andWhere('synchronized', "1") } },
                    { 'crops': (qb) => { qb.where('deleted_at', null); } },
                    { 'crops.irrigations': (qb) => { qb.where('deleted_at', null); } },
                    { 'crops.croptypes': (qb) => { qb.where('deleted_at', null); } },
                    { 'crops.varieties': (qb) => { qb.where('deleted_at', null); } },
                    { 'zones': (qb) => { qb.where('deleted_at', null); } }],
                require: false
            })
            .then(async result => {
                if (result === null) return res.status(404).json({ type: "danger", message: "no_fields" });
                if (result) {
                    let data = JSON.parse(JSON.stringify(result));
                    // generatePDF(data)
                    sensorToRapport = [];
                    await Promise.all(data.map(async (fields) => {
                        let DataCrops = fields.crops
                        let DataIrrigations = []
                        let RUmax = 0; let effPluie = 0; let effIrrig = 0; let irrigArea = 0; let ruPratique = 0
                        let dosePercentage = 100
                        let dataCrop = {};
                        let days = 0;
                        let latField = fields.Latitude
                        let lonField = fields.Longitude
                        let dataCalcul = [];
                        let inputs = []
                        let plantingDate = "";
                        let profondeur = 0;
                        let zoneData = [];
                        
                        //Zone
                        if (fields.zones !== []) {
                            let soilsData = fields.zones
                            soilsData.map(soils => {
                                RUmax = Number(soils.RUmax)
                                effPluie = Number(soils.effPluie)
                                irrigArea = Number(soils.irrigArea)
                                zoneData.push({
                                    "ruPratique": ruPratique,
                                    "RUmax": RUmax,
                                    "effIrrig": effIrrig,
                                    "effPluie": effPluie,
                                    "irrigArea": irrigArea,
                                })
                            })

                        }
                        //Crops

                        if (fields.crops !== []) {
                            DataIrrigations = DataCrops.map(data=>{
                                return data.irrigations
                            })
                            
                           let cropsData = fields.crops
                            cropsData.map(async crops => {
                                days = Number(crops.days)
                                profondeur = Number(crops.rootDepth)
                                plantingDate = crops.plantingDate
                                ruPratique = Number(crops.practical_fraction)
                                dataCrop = crops.croptypes
                                if (typeof crops.varieties !== 'undefined' && crops.varieties != null && crops.varieties != "" && Object.keys(crops.varieties).length > 0) {
                                    dataCrop = {}
                                    dataCrop = crops.varieties;
                                }
                            })
                            DataCrops.map(data=>{
                                let irrigData = data.irrigations
                                    irrigData.map(irrig=>{
                                        if(typeof irrig.effIrrig !== "undefined" )
                                            effIrrig = Number(irrig.effIrrig)
                                    })
                                

                            })
                        }
                       
                        if (fields.sensors !== [] && fields.sensors!= null && Object.keys(fields.sensors).length > 0) {

                            let city_id = ""
                            let farmId = fields.farm_id
                            const farm = await new Farm({ 'id': farmId })
                                .fetch({ require: false })
                                .then(result => {
                                    let farms = JSON.parse(JSON.stringify(result))
                                    city_id = farms.city_id;
                                })
                            let rainConfig = await getRainFromConfig(city_id);

                            let sensorsData = fields.sensors
                            
                            sensorsData.map(async (sensors) => {
                                let codeSensor = sensors.code
                                let user_id = sensors.user_id
                                if (codeSensor != "" && dataCrop != null && Object.keys(dataCrop).length > 0 && typeof dataCrop.all_kc !== 'undefined' && days > 0 && latField != null && latField != "" && lonField != null && lonField != "") {
                                    //let RuMax = getDataFromApiSensor(codeSensor);
                                    let key = fields.id;
                                    let resultCalcul = null;
                                    resultCalcul = await calculSimulation(DataIrrigations,DataCrops,ruPratique, RUmax,dosePercentage, effPluie, effIrrig, irrigArea, days, profondeur, plantingDate,dataCrop, rainConfig, latField, lonField, fields.id, codeSensor);

                                    dataCalcul.push({
                                        "user_id": user_id,
                                        "field_id": key,
                                        "sensor_id": sensors.id,
                                        "sensor_code": sensors.code,
                                        "resultCalcul": resultCalcul
                                    });
                                    if (resultCalcul !== [] && Object.keys(resultCalcul).length > 0) {
                                        const dateStart = new Date();
                                        const dateEnd = new Date(dateStart.getTime());
                                        dateEnd.setDate(dateEnd.getDate() + 7);
                                        inputs.push({
                                            ruPratique: ruPratique,
                                            RUmax: RUmax,
                                            effPluie: effPluie,
                                            effIrrig: effIrrig,
                                            irrigArea: irrigArea,
                                            profondeur: profondeur,
                                            plantingDate: plantingDate

                                        })
                                        if(resultCalcul.length > 0){
                                            await new CalculSensor()
                                            .query((qb) => {
                                                qb.select('*');
                                                qb.where({ sensor_id: sensors.id });
                                            }).fetchAll({ require: false })
                                            .then(async dataFromCalcul => {
                                                let r = JSON.parse(JSON.stringify(dataFromCalcul))
                                                if (r.length > 0) {
                                                    //     let endDate = data.end_date.slice(0, 10)
                                                    //     let currentDay = dateStart.toISOString().slice(0, 10)
                                                    //     let startDate = data.start_date.slice(0, 10)
                                                    //     let lastDay = dateEnd.toISOString().slice(0, 10)
                                                    // if (currentDay >= endDate) {
                                                        // }
                                                     await new CalculSensor({user_id : user_id,field_id : sensors.field_id , sensor_id :sensors.id ,sensor_code :codeSensor,start_date:dateStart,end_date:dateEnd ,result :resultCalcul,inputs:inputs}).save()
                                                    // await addCalculSensorRecommnd(user_id,sensors.field_id )
                                                    logger.info( dateStart + " Calcul Saved successfully ")
                                                        // await new CalculSensor({user_id : user_id,field_id : sensors.field_id , sensor_id :sensors.id ,sensor_code :codeSensor,start_date:dateStart,end_date:dateEnd ,result :resultCalcul,inputs:inputs}).save()
                                                        // logger.info( "sensor_id ->" + sensors.id +" field_id -> " + sensors.field_id + "success")
                                                
                                                }
                                                // if (r.length == 0) {
                                                    // await new CalculSensor({user_id : user_id,field_id : sensors.field_id , sensor_id :sensors.id ,sensor_code :codeSensor,start_date:dateStart,end_date:dateEnd ,result :resultCalcul,inputs:inputs}).save()
                                                    // await addCalculSensorRecommnd(user_id,sensors.field_id )
                                                    // logger.info( "sensor_id ->" + sensors.id +" field_id -> " + sensors.field_id + "success")
                                                // }
                                            }).catch(err => {
                                                console.log('Calculations Error'+err);

                                            })
                                        }

                                    }
                                }
                            })
                           
                        }
                    }))
                    console.log('Calculations completed successfully');

                }
            }).catch(err => {
                logger.fatal('**Calcul cron ** '+ err)
            });
    } catch (error) {
        console.log(error)
        logger.fatal('**Calcul cron ** '+ error)
    }



}

    cron.schedule('0 4 * * *', async () => {
        await calculBilanHydrique();
    });