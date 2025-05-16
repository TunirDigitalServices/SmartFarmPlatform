const jwt = require('jsonwebtoken');
const User = require('./../models/User.js');
const session = require('express-session');
const fetch = require('node-fetch');
const Sensor = require('./../models/Sensor');
const DataMapping = require('../models/DataMapping.js');

const mappingMv = async (key, val, date, sensor_id) => {
    return await new DataMapping()
        .query((qb) => qb.where('deleted_at', null).andWhere('sensor_id', '=', sensor_id))
        .fetchAll({
            require: false
        })
        .then(result => {
            let valaueAfterMapping = val;
            if (result != null) {
                let data = JSON.parse(JSON.stringify(result));
                let arrayDatemv1 = [];
                let arrayDatemv2 = [];
                let arrayDatemv3 = [];
                data.map(dataMapping => {
                    if (key == 'Mv1') {
                        arrayDatemv1.push(dataMapping.date['Mv1_date'])
                    }
                    if (key == 'Mv2') {
                        arrayDatemv2.push(dataMapping.date['Mv2_date'])
                    }
                    if (key == 'Mv3') {
                        arrayDatemv3.push(dataMapping.date['Mv3_date'])
                    }
                })
                let dateMappingSelectedmv1 = "";
                let dateMappingSelectedmv2 = "";
                let dateMappingSelectedmv3 = "";
                if (arrayDatemv1.length > 0) {
                    arrayDatemv1.push(date.slice(0, 10));
                    arrayDatemv1.sort();
                    arrayDatemv1.map((dateMapping, i) => {
                        if (dateMapping == date.slice(0, 10)) {
                            if (typeof arrayDatemv1[i - 1] !== "undefined") {
                                dateMappingSelectedmv1 = arrayDatemv1[i - 1]
                            }
                        }
                    })

                }
                if (arrayDatemv2.length > 0) {
                    arrayDatemv2.push(date.slice(0, 10));
                    arrayDatemv2.sort();
                    arrayDatemv2.map((dateMapping, i) => {
                        if (dateMapping == date.slice(0, 10)) {
                            if (typeof arrayDatemv2[i - 1] !== "undefined") {
                                dateMappingSelectedmv2 = arrayDatemv2[i - 1]
                            }
                        }
                    })
                }
                if (arrayDatemv3.length > 0) {
                    arrayDatemv3.push(date.slice(0, 10));
                    arrayDatemv3.sort();
                    arrayDatemv3.map((dateMapping, i) => {
                        if (dateMapping == date.slice(0, 10)) {
                            if (typeof arrayDatemv3[i - 1] !== "undefined") {
                                dateMappingSelectedmv3 = arrayDatemv3[i - 1]
                            }
                        }
                    })

                }

                data.map(dataMapping => {
                    let keyData = key + '_date'
                    let keyDataMax = key + '_max'
                    let keyDataMin = key + '_min'


                    if (dateMappingSelectedmv1 != "" && key == 'Mv1') {
                        if (dateMappingSelectedmv1 == dataMapping.date[keyData]) {
                            if (val >= parseFloat(dataMapping.max[keyDataMax]) && val <= parseFloat(dataMapping.min[keyDataMin])) {
                                valaueAfterMapping = (((Number(dataMapping.min[keyDataMin]) - parseFloat(val)) / (dataMapping.min[keyDataMin] - dataMapping.max[keyDataMax])) * 100).toFixed(2)
                            } else if (val < parseFloat(dataMapping.max[keyDataMax])) {
                                valaueAfterMapping = 100;
                            } else if (val > parseFloat(dataMapping.min[keyDataMin])) {
                                valaueAfterMapping = 0;
                            }
                        }
                    }
                    if (dateMappingSelectedmv2 != "" && key == 'Mv2') {
                        if (dateMappingSelectedmv2 == dataMapping.date[keyData]) {
                            if (val >= parseFloat(dataMapping.max[keyDataMax]) && val <= parseFloat(dataMapping.min[keyDataMin])) {
                                valaueAfterMapping = (((Number(dataMapping.min[keyDataMin]) - parseFloat(val)) / (dataMapping.min[keyDataMin] - dataMapping.max[keyDataMax])) * 100).toFixed(2)
                            } else if (val < parseFloat(dataMapping.max[keyDataMax])) {
                                valaueAfterMapping = 100;
                            } else if (val > parseFloat(dataMapping.min[keyDataMin])) {
                                valaueAfterMapping = 0;
                            }
                        }
                    }
                    if (dateMappingSelectedmv3 != "" && key == 'Mv3') {
                        if (dateMappingSelectedmv3 == dataMapping.date[keyData]) {
                            if (val >= parseFloat(dataMapping.max[keyDataMax]) && val <= parseFloat(dataMapping.min[keyDataMin])) {
                                valaueAfterMapping = (((Number(dataMapping.min[keyDataMin]) - parseFloat(val)) / (dataMapping.min[keyDataMin] - dataMapping.max[keyDataMax])) * 100).toFixed(2)
                            } else if (val < parseFloat(dataMapping.max[keyDataMax])) {
                                valaueAfterMapping = 100;
                            } else if (val > parseFloat(dataMapping.min[keyDataMin])) {
                                valaueAfterMapping = 0;
                            }
                        }
                    }


                })

            }
            return valaueAfterMapping.toString();
        }).catch((error) => {
            console.log(error)
        });
}


const authApiExternal = async (req, res, next) => {
    try {
        const allowedMethods = [
            "GET"
        ];

        if (!allowedMethods.includes(req.method)) {
            return res.status(405).json({ type: "danger", message: `${req.method} not allowed.` });
        }
        let externalToken = req.params.token;
        let sensorCode = req.params.sensorCode;
        const user = await new User({ 'external_api_token': externalToken, is_valid: '1', is_active: '1' })
            .fetch({ require: false })

        if (!user) {
            return res.status(501).json({ type: "danger", message: 'no_user' });
        }
        const sensor = await new Sensor({ 'code': sensorCode, deleted_at: null }).fetch({ require: false })
        if (!sensor) {
            return res.status(404).json({ type: "danger", message: "error_sensor" });
        }
        const { Latitude: Lat, Longitude: Lon, id: sensor_id } = sensor.toJSON();
        if (!sensorCode) {
            return res.status(401).json({ type: "danger", message: 'no_sensor' });
        }
        let responseApi;
        try {
            const rawResponse = await fetch(`http://cp.smartfarm.com.tn/api/sensor/last-topic/${sensorCode}`);
            responseApi = await rawResponse.json();
        } catch (error) {
            return res.status(500).json({ type: "danger", message: "error_get_data" });
        }
        if (!responseApi || !Array.isArray(responseApi) || responseApi.length === 0) {
            return res.status(404).json({ type: "danger", message: "no_sensor_data" });
        }
        const Mv1 = await mappingMv("Mv1", responseApi[0].mv1, responseApi[0].time, sensor_id)
        const Mv2 = await mappingMv("Mv2", responseApi[0].mv2, responseApi[0].time, sensor_id)
        const Mv3 = await mappingMv("Mv3", responseApi[0].mv3, responseApi[0].time, sensor_id)

        const weatherResponse = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${Lat}&longitude=${Lon}&timezone=GMT&daily=et0_fao_evapotranspiration&daily=precipitation_sum&hourly=direct_radiation,diffuse_radiation,terrestrial_radiation`)


        const weatherData = await weatherResponse.json();
        const { daily, hourly } = weatherData;
        let dailyDates = daily.time
        let hourlyDates = hourly.time
        let dailyTerrestRad = hourly.terrestrial_radiation
        let dailyET0 = daily.et0_fao_evapotranspiration
        let dailyRain = daily.precipitation_sum
        let dailyDirectRad = hourly.direct_radiation
        let dailyDiffRad = hourly.diffuse_radiation
        let arrRad = []
        let arrET0 = []
        let arrRain = []
        let radiationSolar = []
        const timeSensor = new Date(responseApi[0].time);
        var sum = dailyDirectRad.map((num, idx) => {
            return (num + dailyDiffRad[idx])
        });

        for (let index = 0; index < hourlyDates.length; index++) {

            let timeSolar = new Date(hourlyDates[index])
            if ((timeSensor.getHours() === timeSolar.getHours())) {

                arrRad.push({
                    date: timeSolar,
                    radiation: sum[index],
                });
            }


        }
        let resultRad = arrRad.filter(value => {
            return value.date.getDate() === timeSensor.getDate()
        })
        if (resultRad.length > 0) {
            radiationSolar = resultRad
        } else {
            radiationSolar = arrRad[0]
        }
        for (let index = 0; index < 1; index++) {
            arrET0.push({
                date: dailyDates[0],
                ET0: dailyET0[0],
            });
            arrRain.push({
                rain: dailyRain[0]
            })
        }
        const allDataSensor = responseApi.map(result => ({
            ref: result.ref,
            time: result.time,
            charge: result.charge,
            day_num: result.day_num,
            temperature: Number(result.temperature),
            humidity: Number(result.humidity),
            pressure: Number(result.pressure) / 1000,
            altitude: Number(result.altitude),
            adc: result.adc,
            ts: result.ts,
            mv1: Number(Mv1),
            mv2: Number(Mv2),
            mv3: Number(Mv3),
            et0: JSON.stringify(Object.values(arrET0)[0].ET0),
            rain: JSON.stringify(Object.values(arrRain)[0].rain),
            radiation: JSON.stringify(Object.values(radiationSolar)[0].radiation),
            latitude: Lat,
            longitude: Lon
        }));

        let coord = {
            latitude: Lat,
            longitude: Lon
        }
        return res.status(201).json({ allDataSensor })



    } catch (error) {
        console.log(error)
        return res.status(401).json({ type: "danger", message: 'token_error' });
    }
};

module.exports = { authApiExternal };
