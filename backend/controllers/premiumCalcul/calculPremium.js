const Crop = require("../../models/Crop");
const Soil = require("../../models/Zone");
const CropVarieties = require("../../models/CropVarieties");
const Field = require("../../models/Field");
const User = require("../../models/User");
const CalculSensor = require("../../models/CalculSensor");
const { body, validationResult } = require("express-validator");
const Datasensor = require("../../models/Datasensor");
const logger = require("../../logs.js");
const path = require("path");
const fs = require("fs");
const pdf = require("pdf-creator-node");
const options = require("../../reports/options");

const fetch = require("node-fetch");
const Citiesweather = require("../../models/Citiesweather");
const Farm = require("../../models/Farm");
const Recommendation = require("../../models/Recommendation");
const Report = require("../../models/Report");
const DataMapping = require("../../models/DataMapping");
const option1 = require("../../reports/option1");
const Notification = require("../../models/Notification");

const addDays = (date, days) => {
  let result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};
const toSqlDate = (inputDate) => {
  const date = new Date(inputDate);
  const dateWithOffest = new Date(
    date.getTime() - date.getTimezoneOffset() * 60000
  );
  return dateWithOffest.toISOString().slice(0, 10);
};
const mappingMv = async (key, val, date, sensor_id) => {
  return await new DataMapping()
    .query((qb) =>
      qb.where("deleted_at", null).andWhere("sensor_id", "=", sensor_id)
    )
    .fetchAll({
      require: false,
    })
    .then((result) => {
      let valaueAfterMapping = val;
      if (result != null) {
        let data = JSON.parse(JSON.stringify(result));
        let arrayDatemv1 = [];
        let arrayDatemv2 = [];
        let arrayDatemv3 = [];
        data.map((dataMapping) => {
          if (key == "Mv1") {
            arrayDatemv1.push(dataMapping.date["Mv1_date"]);
          }
          if (key == "Mv2") {
            arrayDatemv2.push(dataMapping.date["Mv2_date"]);
          }
          if (key == "Mv3") {
            arrayDatemv3.push(dataMapping.date["Mv3_date"]);
          }
        });
        let dateMappingSelectedmv1 = "";
        let dateMappingSelectedmv2 = "";
        let dateMappingSelectedmv3 = "";
        if (arrayDatemv1.length > 0) {
          arrayDatemv1.push(date.slice(0, 10));
          arrayDatemv1.sort();
          arrayDatemv1.map((dateMapping, i) => {
            if (dateMapping == date.slice(0, 10)) {
              if (typeof arrayDatemv1[i - 1] !== "undefined") {
                dateMappingSelectedmv1 = arrayDatemv1[i - 1];
              }
            }
          });
        }
        if (arrayDatemv2.length > 0) {
          arrayDatemv2.push(date.slice(0, 10));
          arrayDatemv2.sort();
          arrayDatemv2.map((dateMapping, i) => {
            if (dateMapping == date.slice(0, 10)) {
              if (typeof arrayDatemv2[i - 1] !== "undefined") {
                dateMappingSelectedmv2 = arrayDatemv2[i - 1];
              }
            }
          });
        }
        if (arrayDatemv3.length > 0) {
          arrayDatemv3.push(date.slice(0, 10));
          arrayDatemv3.sort();
          arrayDatemv3.map((dateMapping, i) => {
            if (dateMapping == date.slice(0, 10)) {
              if (typeof arrayDatemv3[i - 1] !== "undefined") {
                dateMappingSelectedmv3 = arrayDatemv3[i - 1];
              }
            }
          });
        }

        data.map((dataMapping) => {
          let keyData = key + "_date";
          let keyDataMax = key + "_max";
          let keyDataMin = key + "_min";

          if (dateMappingSelectedmv1 != "" && key == "Mv1") {
            if (dateMappingSelectedmv1 == dataMapping.date[keyData]) {
              if (
                val >= parseFloat(dataMapping.max[keyDataMax]) &&
                val <= parseFloat(dataMapping.min[keyDataMin])
              ) {
                valaueAfterMapping = (
                  ((Number(dataMapping.min[keyDataMin]) - parseFloat(val)) /
                    (dataMapping.min[keyDataMin] -
                      dataMapping.max[keyDataMax])) *
                  100
                ).toFixed(2);
              }
            }
          }
          if (dateMappingSelectedmv2 != "" && key == "Mv2") {
            if (dateMappingSelectedmv2 == dataMapping.date[keyData]) {
              if (
                val >= parseFloat(dataMapping.max[keyDataMax]) &&
                val <= parseFloat(dataMapping.min[keyDataMin])
              ) {
                valaueAfterMapping = (
                  ((Number(dataMapping.min[keyDataMin]) - parseFloat(val)) /
                    (dataMapping.min[keyDataMin] -
                      dataMapping.max[keyDataMax])) *
                  100
                ).toFixed(2);
              }
            }
          }
          if (dateMappingSelectedmv3 != "" && key == "Mv3") {
            if (dateMappingSelectedmv3 == dataMapping.date[keyData]) {
              if (
                val >= parseFloat(dataMapping.max[keyDataMax]) &&
                val <= parseFloat(dataMapping.min[keyDataMin])
              ) {
                valaueAfterMapping = (
                  ((Number(dataMapping.min[keyDataMin]) - parseFloat(val)) /
                    (dataMapping.min[keyDataMin] -
                      dataMapping.max[keyDataMax])) *
                  100
                ).toFixed(2);
              }
            }
          }
        });
      }
      return valaueAfterMapping.toString();
    })
    .catch((error) => {
      console.log(error);
    });
};

const mappingMvHistory = async (key, val, date, sensor_id) => {
  return await new DataMapping()
    .query((qb) =>
      qb.where("deleted_at", null).andWhere("sensor_id", "=", sensor_id)
    )
    .fetchAll({
      require: false,
    })
    .then((result) => {
      let valaueAfterMapping = val;
      if (result != null) {
        let data = JSON.parse(JSON.stringify(result));
        let arrayDatemv1 = [];
        let arrayDatemv2 = [];
        let arrayDatemv3 = [];
        data.map((dataMapping) => {
          if (key == "Mv1") {
            arrayDatemv1.push(dataMapping.date["Mv1_date"]);
          }
          if (key == "Mv2") {
            arrayDatemv2.push(dataMapping.date["Mv2_date"]);
          }
          if (key == "Mv3") {
            arrayDatemv3.push(dataMapping.date["Mv3_date"]);
          }
        });
        let dateMappingSelectedmv1 = "";
        let dateMappingSelectedmv2 = "";
        let dateMappingSelectedmv3 = "";
        if (arrayDatemv1.length > 0) {
          arrayDatemv1.push(date.slice(0, 10));
          arrayDatemv1.sort();
          arrayDatemv1.map((dateMapping, i) => {
            if (dateMapping == date.slice(0, 10)) {
              if (typeof arrayDatemv1[i - 1] !== "undefined") {
                dateMappingSelectedmv1 = arrayDatemv1[i - 1];
              }
            }
          });
        }
        if (arrayDatemv2.length > 0) {
          arrayDatemv2.push(date.slice(0, 10));
          arrayDatemv2.sort();
          arrayDatemv2.map((dateMapping, i) => {
            if (dateMapping == date.slice(0, 10)) {
              if (typeof arrayDatemv2[i - 1] !== "undefined") {
                dateMappingSelectedmv2 = arrayDatemv2[i - 1];
              }
            }
          });
        }
        if (arrayDatemv3.length > 0) {
          arrayDatemv3.push(date.slice(0, 10));
          arrayDatemv3.sort();
          arrayDatemv3.map((dateMapping, i) => {
            if (dateMapping == date.slice(0, 10)) {
              if (typeof arrayDatemv3[i - 1] !== "undefined") {
                dateMappingSelectedmv3 = arrayDatemv3[i - 1];
              }
            }
          });
        }

        data.map((dataMapping) => {
          let keyData = key + "_date";
          let keyDataMax = key + "_max";
          let keyDataMin = key + "_min";

          if (dateMappingSelectedmv1 != "" && key == "Mv1") {
            if (dateMappingSelectedmv1 == dataMapping.date[keyData]) {
              if (
                val >= parseFloat(dataMapping.max[keyDataMax]) &&
                val <= parseFloat(dataMapping.min[keyDataMin])
              ) {
                valaueAfterMapping = (
                  ((parseFloat(val) - dataMapping.min[keyDataMin]) /
                    (dataMapping.max[keyDataMax] -
                      dataMapping.min[keyDataMin])) *
                  100
                ).toFixed(2);
              }
            }
          }
          if (dateMappingSelectedmv2 != "" && key == "Mv2") {
            if (dateMappingSelectedmv2 == dataMapping.date[keyData]) {
              if (
                val >= parseFloat(dataMapping.max[keyDataMax]) &&
                val <= parseFloat(dataMapping.min[keyDataMin])
              ) {
                valaueAfterMapping = (
                  ((parseFloat(val) - dataMapping.min[keyDataMin]) /
                    (dataMapping.max[keyDataMax] -
                      dataMapping.min[keyDataMin])) *
                  100
                ).toFixed(2);
              }
            }
          }
          if (dateMappingSelectedmv3 != "" && key == "Mv3") {
            if (dateMappingSelectedmv3 == dataMapping.date[keyData]) {
              if (
                val >= parseFloat(dataMapping.max[keyDataMax]) &&
                val <= parseFloat(dataMapping.min[keyDataMin])
              ) {
                valaueAfterMapping = (
                  ((parseFloat(val) - dataMapping.min[keyDataMin]) /
                    (dataMapping.max[keyDataMax] -
                      dataMapping.min[keyDataMin])) *
                  100
                ).toFixed(2);
              }
            }
          }
        });
      }
      return valaueAfterMapping.toString();
    })
    .catch((error) => {
      console.log(error);
    });
};

const generatePDF = async (req, res) => {
  let todayDate = new Date();
  let today = todayDate.toISOString().slice(0, 10);
  new CalculSensor()
    .query((qb) =>
      qb
        .where("deleted_at", null)
        .andWhere("start_date", "<=", today)
        .andWhere("end_date", ">=", today)
    )
    .fetchAll({
      withRelated: [
        {
          sensors: (qb) => {
            qb.where("deleted_at", null)
              .andWhere("synchronized", "1")
              .and.whereNotNull("Latitude")
              .and.whereNotNull("Longitude");
          },
        },
        {
          users: (qb) => {
            qb.where("deleted_at", null)
              .andWhere("is_active", "1")
              .andWhere("is_valid", "1");
          },
          "users.farms": (qb) => {
            qb.where("deleted_at", null);
          },
        },
        {
          fields: (qb) => {
            qb.where("deleted_at", null);
          },
          "fields.crops": (qb) => {
            qb.where("deleted_at", null);
          },
          "fields.crops.croptypes": (qb) => {
            qb.where("deleted_at", null);
          },
          "fields.crops.varieties": (qb) => {
            qb.where("deleted_at", null);
          },
          "fields.crops.irrigations": (qb) => {
            qb.where("deleted_at", null);
          },
          "fields.zones": (qb) => {
            qb.where("deleted_at", null);
          },
          "fields.zones.soiltypes": (qb) => {
            qb.where("deleted_at", null);
          },
        },
      ],
      require: false,
    })
    .then(async (result) => {
      let data = JSON.parse(JSON.stringify(result));
      await Promise.all(
        data.map(async (dataCalcul) => {
          let calcul = [];
          let arrWeather = [];
          let cropType = "";
          let plantDate = "";
          let soilType = "";
          let irrigType = "";
          let flowrate = "";
          let drippersNbr = "";
          let pumpFlow = "";
          let cropVariety = "";
          let farm = "";
          let userName = "";
          let phoneNumber = "";
          let irrigNumber = 0;
          let startDate = new Date(dataCalcul.start_date);
          let endDate = new Date(dataCalcul.end_date);
          let resultCalcul = dataCalcul.result;
          let dataSensor = dataCalcul.sensors;
          let dataSensorTemp = [];
          let dataSensorTempMin = [];
          let dataSensorTempMax = [];
          let dataSensorHumd = [];
          let dataSensorHumdMin = [];
          let dataSensorHumdMax = [];
          let dataSensorPress = [];
          let dataSensorPressMin = [];
          let dataSensorPressMax = [];
          let dataSensorHumd1 = [];
          let dataSensorHumd1Min = [];
          let dataSensorHumd1Max = [];
          let dataSensorHumd2 = [];
          let dataSensorHumd2Min = [];
          let dataSensorHumd2Max = [];
          let dataSensorHumd3 = [];
          let dataSensorHumd3Min = [];
          let dataSensorHumd3Max = [];
          let allDataSensor = [];

          const filteredResult = resultCalcul.filter((result) => {
            let resultDate = new Date(result.date).toISOString().slice(0, 10);
            return (
              toSqlDate(startDate) <= resultDate &&
              toSqlDate(endDate) >= resultDate &&
              result.codeSensor == dataCalcul.sensors.code
            );
          });
          let dateMonthStart = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
          let dateMonthEnd = new Date();

          const response = await fetch(
            `http://54.38.183.164:5000/api/sensor/filter-topic/34:86:5D:AE:12:E4/2023-02-15/2023-03-13/0/10`
          )
            .then((response) => response.json())
            .then(async (resultApi) => {
              if (resultApi != null) {
                let dataSensors = resultApi.rows;
                await Promise.all(
                  dataSensors.map(async (data) => {
                    const Mv1 = await mappingMvHistory(
                      "Mv1",
                      data.mv1,
                      data.time,
                      151
                    );
                    const Mv2 = await mappingMvHistory(
                      "Mv2",
                      data.mv2,
                      data.time,
                      151
                    );
                    const Mv3 = await mappingMvHistory(
                      "Mv3",
                      data.mv3,
                      data.time,
                      151
                    );

                    allDataSensor.push({
                      ref: data.ref,
                      time: data.time,
                      temperature: Number(data.temperature),
                      humidity: Number(data.humidity),
                      pressure: Number(data.pressure),
                      altitude: Number(data.altitude),
                      mv1: Number(Mv1),
                      mv2: Number(Mv2),
                      mv3: Number(Mv3),
                    });
                  })
                );
              }
            });
          let dateTemperatureMap = new Map();
          let dateTemperatureMinMap = new Map();
          let dateTemperatureMaxMap = new Map();
          let dateHumidityMap = new Map();
          let dateHumidityMinMap = new Map();
          let dateHumidityMaxMap = new Map();
          let datePressureMap = new Map();
          let datePressureMinMap = new Map();
          let datePressureMaxMap = new Map();
          let dateMV1 = new Map();
          let dateMinMV1 = new Map();
          let dateMaxMV1 = new Map();
          let dateMV2 = new Map();
          let dateMinMV2 = new Map();
          let dateMaxMV2 = new Map();
          let dateMV3 = new Map();
          let dateMinMV3 = new Map();
          let dateMaxMV3 = new Map();
          let tempArr = [];
          let humdArr = [];
          let pressArr = [];
          let niveau1 = [];
          let niveau2 = [];
          let niveau3 = [];
          allDataSensor.forEach(async (sensorData) => {
            // let Mv1 = await mappingMv("Mv1", sensorData.mv1,sensorData.time, sensorData.sensor_id)
            let date = new Date(sensorData.time).toLocaleString().slice(0, 10);
            let temperature = Number(sensorData.temperature);
            if (!dateTemperatureMap.has(date)) {
              let tempArr = [temperature];
              let tempMin = Math.min(...tempArr);
              let tempMax = Math.max(...tempArr);
              dateTemperatureMap.set(date, temperature);
              dateTemperatureMinMap.set(date, tempMin);
              dateTemperatureMaxMap.set(date, tempMax);
            } else {
              tempArr = tempArr.concat(temperature);
              let tempMin = Math.min(...tempArr);
              let tempMax = Math.max(...tempArr);
              dateTemperatureMap.set(date, temperature);
              dateTemperatureMinMap.set(
                date,
                Math.min(tempMin, dateTemperatureMinMap.get(date))
              );
              dateTemperatureMaxMap.set(
                date,
                Math.max(tempMax, dateTemperatureMaxMap.get(date))
              );
            }
            let humidity = parseFloat(sensorData.humidity).toFixed(2);
            if (!dateHumidityMap.has(date)) {
              let humdArr = [humidity];
              let humidityMin = Math.min(...humdArr);
              let humidityMax = Math.max(...humdArr);
              dateHumidityMap.set(date, humidity);
              dateHumidityMinMap.set(date, humidityMin);
              dateHumidityMaxMap.set(date, humidityMax);
            } else {
              humdArr = humdArr.concat(humidity);
              let humidityMin = Math.min(...humdArr);
              let humidityMax = Math.max(...humdArr);
              dateHumidityMap.set(date, humidity);
              dateHumidityMinMap.set(
                date,
                Math.min(humidityMin, dateHumidityMinMap.get(date))
              );
              dateHumidityMaxMap.set(
                date,
                Math.max(humidityMax, dateHumidityMaxMap.get(date))
              );
            }
            let press = Number(sensorData.pressure) / 1000;
            let pressure = parseFloat(press).toFixed(2);
            if (!datePressureMap.has(date)) {
              let pressArr = [pressure];
              let pressureMin = Math.min(...pressArr);
              let pressureMax = Math.max(...pressArr);
              datePressureMap.set(date, pressure);
              datePressureMinMap.set(date, pressureMin);
              datePressureMaxMap.set(date, pressureMax);
            } else {
              pressArr = pressArr.concat(pressure);
              let pressureMin = Math.min(...pressArr);
              let pressureMax = Math.max(...pressArr);
              datePressureMap.set(date, humidity);
              datePressureMinMap.set(
                date,
                Math.min(pressureMin, datePressureMinMap.get(date))
              );
              datePressureMaxMap.set(
                date,
                Math.max(pressureMax, datePressureMaxMap.get(date))
              );
            }
            let humidityNv1 = parseFloat(
              ((4095 - Number(sensorData.mv1)) / (4095 - 600)) * 100
            ).toFixed(2);
            niveau1.push(sensorData.mv1);
            // let Mv1Min = Math.min(...niveau1);
            // let Mv1Max = Math.max(...niveau1);
            let humidityNv2 = parseFloat(
              ((4095 - Number(sensorData.mv2)) / (4095 - 600)) * 100
            ).toFixed(2);
            niveau2.push(sensorData.mv2);
            // let Mv2Min = Math.min(...niveau2);
            // let Mv2Max = Math.max(...niveau2);
            let humidityNv3 = parseFloat(
              ((4095 - Number(sensorData.mv3)) / (4095 - 600)) * 100
            ).toFixed(2);
            niveau3.push(sensorData.mv3);
            // let Mv3Min = Math.min(...niveau3);
            // let Mv3Max = Math.max(...niveau3);
            // Temp
            if (!dateTemperatureMap.has(date)) {
              dateTemperatureMap.set(date, temperature);
            }
            if (!dateTemperatureMinMap.has(date)) {
              dateTemperatureMinMap.set(date, tempMin);
            }
            if (!dateTemperatureMaxMap.has(date)) {
              dateTemperatureMaxMap.set(date, tempMax);
            }
            // Humidity
            if (!dateHumidityMap.has(date)) {
              dateHumidityMap.set(date, humidity);
            }
            if (!dateHumidityMinMap.has(date)) {
              dateHumidityMinMap.set(date, humidityMin);
            }
            if (!dateHumidityMaxMap.has(date)) {
              dateHumidityMaxMap.set(date, humidityMax);
            }
            //Pressure
            if (!datePressureMap.has(date)) {
              datePressureMap.set(date, pressure);
            }
            if (!datePressureMinMap.has(date)) {
              datePressureMinMap.set(date, pressureMin);
            }
            if (!datePressureMaxMap.has(date)) {
              datePressureMaxMap.set(date, pressureMax);
            }

            // Mv1
            if (!dateMV1.has(date)) {
              dateMV1.set(date, sensorData.mv1);
            }
            // if (!dateMinMV1.has(date)) {
            //     dateMinMV1.set(date, Mv1Min);
            // }  if (!dateMaxMV1.has(date)) {
            //     dateMaxMV1.set(date, Mv1Max);
            // }
            //Mv2
            if (!dateMV2.has(date)) {
              dateMV2.set(date, sensorData.mv2);
            }
            // if (!dateMinMV2.has(date)) {
            //     dateMinMV2.set(date, Mv2Min);
            // }  if (!dateMaxMV2.has(date)) {
            //     dateMaxMV2.set(date, Mv2Max);
            // }
            //Mv3
            if (!dateMV3.has(date)) {
              dateMV3.set(date, sensorData.mv3);
            }
            // if (!dateMinMV3.has(date)) {
            //     dateMinMV3.set(date, Mv3Min);
            // }  if (!dateMaxMV3.has(date)) {
            //     dateMaxMV3.set(date, Mv3Max);
            // }
          });

          dateTemperatureMap.forEach((value, key) => {
            dataSensorTemp.push({ date: key, temp: value });
          });
          dateTemperatureMinMap.forEach((value, key) => {
            dataSensorTempMin.push({ date: key, min: value });
          });
          dateTemperatureMaxMap.forEach((value, key) => {
            dataSensorTempMax.push({ date: key, max: value });
          });
          //Humidity

          dateHumidityMap.forEach((value, key) => {
            dataSensorHumd.push({ date: key, humidity: value });
          });
          dateHumidityMinMap.forEach((value, key) => {
            dataSensorHumdMin.push({ date: key, min: value });
          });
          dateHumidityMaxMap.forEach((value, key) => {
            dataSensorHumdMax.push({ date: key, max: value });
          });
          //Pressure
          datePressureMap.forEach((value, key) => {
            dataSensorPress.push({ date: key, pressure: value });
          });
          datePressureMinMap.forEach((value, key) => {
            dataSensorPressMin.push({ date: key, min: value });
          });
          datePressureMaxMap.forEach((value, key) => {
            dataSensorPressMax.push({ date: key, max: value });
          });
          //Mv 1
          dateMV1.forEach((value, key) => {
            dataSensorHumd1.push({ date: key, mv1: value });
          });
          // dateMinMV1.forEach((value, key) => {
          //     dataSensorHumd1Min.push({ date: key, min: value });
          // })
          // dateMaxMV1.forEach((value, key) => {
          //     dataSensorHumd1Max.push({ date: key, max: value });
          // })
          //Mv 2
          dateMV2.forEach((value, key) => {
            dataSensorHumd2.push({ date: key, mv2: value });
          });
          //   dateMinMV2.forEach((value, key) => {
          //     dataSensorHumd2Min.push({ date: key, min: value });
          // })
          // dateMaxMV2.forEach((value, key) => {
          //     dataSensorHumd2Max.push({ date: key, max: value });
          // })
          //Mv 3
          dateMV3.forEach((value, key) => {
            dataSensorHumd3.push({ date: key, mv3: value });
          });
          //   dateMinMV3.forEach((value, key) => {
          //     dataSensorHumd3Min.push({ date: key, min: value });
          // })
          // dateMaxMV3.forEach((value, key) => {
          //     dataSensorHumd3Max.push({ date: key, max: value });
          // })
          if (dataCalcul) {
            if (dataCalcul.fields.crops) {
              dataCalcul.fields.crops.map((crops) => {
                cropType = crops.croptypes.crop;
                plantDate = crops.croptypes.plant_date;
                if (
                  typeof crops.varieties.crop_variety !== "undefined" &&
                  crops.varieties.crop_variety != null &&
                  crops.varieties.crop_variety != ""
                ) {
                  cropVariety = crops.varieties.crop_variety;
                }
                let irrig = crops.irrigations;
                if (irrig) {
                  irrig.map((irrig) => {
                    irrigType = irrig.type;
                    pumpFlow = irrig.pumpFlow;
                    flowrate = irrig.flowrate;
                    drippersNbr = irrig.drippers;
                  });
                }
              });
            }
            if (typeof dataCalcul.users !== "undefined") {
              userName = dataCalcul.users.name;
              phoneNumber = dataCalcul.users.phone_number;
              dataCalcul.users.farms &&
                dataCalcul.users.farms.map((farms) => {
                  if (farms) {
                    farm = farms.name;
                  }
                });
            }
          }
          let dailyDates = [];
          let dailyMaxTemp = [];
          let dailyMinTemp = [];
          let dailyWindSpeed = [];
          let dailyRain = [];
          let lat = parseFloat(dataCalcul.sensors.Latitude).toFixed(4);
          let lng = parseFloat(dataCalcul.sensors.Latitude).toFixed(4);
          let dateStart = addDays(startDate, 7);
          let dateEnd = addDays(endDate, 7);
          // await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&timezone=GMT&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,windspeed_10m_max&start_date=${toSqlDate(startDate)}&end_date=${toSqlDate(endDate)}`)
          // .then((res) => res.json())
          // .then((jsonData) => {
          //     if(jsonData){
          //         dailyDates = jsonData.daily.time
          //         dailyMaxTemp = jsonData.daily.temperature_2m_max
          //         dailyMinTemp = jsonData.daily.temperature_2m_min
          //         dailyRain = jsonData.daily.precipitation_sum
          //         dailyWindSpeed = jsonData.daily.windspeed_10m_max

          //     }
          //             for (let index = 0; index < dailyDates.length - 1; index++) {
          //                 arrWeather.push({
          //                     date: new Date(dailyDates[index]).toLocaleString().slice(0, 10),
          //                     maxTemp : dailyMaxTemp[index],
          //                     minTemp : dailyMinTemp[index],
          //                     rain : dailyRain[index],
          //                     windspeed : dailyWindSpeed[index],

          //                 });

          //             }

          // });
          let total = 0;
          if (filteredResult.length > 0) {
            for (let index = 0; index < filteredResult.length - 1; index++) {
              const element = filteredResult[index];
              total += element.irrigation;
              calcul.push({
                ET0: element.ET0,
                kc: element.kc,
                Etc: parseFloat(element.Etc).toFixed(2),
                date: new Date(element.date).toLocaleString().slice(0, 10),
                bilan: parseFloat(element.bilan).toFixed(1),
                irrigation: parseFloat(element.irrigation).toFixed(1),
              });
            }
          }
          let calculIrrigation = calcul.filter((irrig) => {
            return Number(irrig.irrigation) !== 0;
          });
          irrigNumber = calculIrrigation.length;
          const html = fs.readFile(
            path.join(__dirname, "../../reports/template.html"),
            "utf-8",
            async function (err, data) {
              const filename =
                dataCalcul.fields.uid +
                "_" +
                toSqlDate(startDate) +
                "_" +
                toSqlDate(endDate) +
                "_doc" +
                ".pdf";
              await pdf
                .create(
                  {
                    html: data,
                    data: {
                      products: [
                        {
                          nameFarm: farm,
                          nameField: dataCalcul.fields.name,
                          nameUser: userName,
                          phone: phoneNumber,
                          codeSensor: dataCalcul.sensors.code,
                          Lat: parseFloat(dataCalcul.sensors.Latitude).toFixed(
                            4
                          ),
                          Lon: parseFloat(dataCalcul.sensors.Longitude).toFixed(
                            4
                          ),
                          crop: cropType,
                          irrigtype: irrigType,
                          flowrate: flowrate,
                          drippers: drippersNbr,
                          pumpFlow: pumpFlow,
                          cropVariety: cropVariety,
                          plantDate: new Date(plantDate)
                            .toLocaleString()
                            .slice(0, 10),
                          soil: soilType,
                          startDate: addDays(startDate, -7)
                            .toLocaleString()
                            .slice(0, 10),
                          endDate: addDays(endDate, -7)
                            .toLocaleString()
                            .slice(0, 10),
                          startDateWeather: new Date(startDate)
                            .toLocaleString()
                            .slice(0, 10),
                          endDateWeather: new Date(endDate)
                            .toLocaleString()
                            .slice(0, 10),
                          totalIrrigation: parseFloat(total).toFixed(1),
                          irrigNumber: irrigNumber,
                        },
                      ],
                      calcul: calcul,
                      weather: arrWeather,
                      temp: dataSensorTemp,
                      minTemp: dataSensorTempMin,
                      maxTemp: dataSensorTempMax,
                      humidity: dataSensorHumd,
                      minHumd: dataSensorHumdMin,
                      maxHumd: dataSensorHumdMax,
                      pressure: dataSensorPress,
                      minPress: dataSensorPressMin,
                      maxPress: dataSensorPressMax,
                      niveau1: dataSensorHumd1,
                      // minNiveau1 : dataSensorHumd1Min,
                      // maxNiveau1 : dataSensorHumd1Max,
                      niveau2: dataSensorHumd2,
                      // minNiveau2 : dataSensorHumd2Min,
                      // maxNiveau2 : dataSensorHumd2Max,
                      niveau3: dataSensorHumd3,
                      // minNiveau3 : dataSensorHumd3Min,
                      // maxNiveau3 : dataSensorHumd3Max,
                    },
                    path: "./docs/" + filename,
                  },
                  options
                )

                .then(async (result) => {
                  console.log(result);
                  if (result) {
                    await new Report({
                      user_id: dataCalcul.users.id,
                      field_id: dataCalcul.fields.id,
                      filename: filename,
                    }).save();
                  }
                })
                .catch((error) => {
                  console.log(error);
                });
            }
          );
        })
      );
      return res.status(200).json({ type: "success", result: data });
    })
    .catch((err) => {
      console.log(err);
    });
};

const createBulletin = async (req, res) => {
  try {
    let todayDate = new Date();
    let today = todayDate.toISOString().slice(0, 10);
    new CalculSensor()
      .query((qb) =>
        qb
          .where("deleted_at", null)
          .andWhere(
            "start_date",
            "<=",
            addDays(today, +1).toISOString().slice(0, 10)
          )
          .andWhere(
            "end_date",
            ">=",
            addDays(today, +1).toISOString().slice(0, 10)
          )
      )
      .fetchAll({
        withRelated: [
          {
            sensors: (qb) => {
              qb.where("deleted_at", null)
                .andWhere("synchronized", "1")
                .and.whereNotNull("Latitude")
                .and.whereNotNull("Longitude");
            },
          },
          {
            users: (qb) => {
              qb.where("deleted_at", null)
                .andWhere("is_active", "1")
                .andWhere("is_valid", "1");
            },
            "users.farms": (qb) => {
              qb.where("deleted_at", null);
            },
          },
          {
            fields: (qb) => {
              qb.where("deleted_at", null);
            },
            "fields.crops": (qb) => {
              qb.where("deleted_at", null);
            },
            "fields.crops.croptypes": (qb) => {
              qb.where("deleted_at", null);
            },
            "fields.crops.varieties": (qb) => {
              qb.where("deleted_at", null);
            },
            "fields.crops.irrigations": (qb) => {
              qb.where("deleted_at", null);
            },
            "fields.zones": (qb) => {
              qb.where("deleted_at", null);
            },
            "fields.crops.irrigations": (qb) => {
              qb.where("deleted_at", null);
            },
            "fields.zones": (qb) => {
              qb.where("deleted_at", null);
            },
            "fields.zones.soiltypes": (qb) => {
              qb.where("deleted_at", null);
            },
          },
        ],
        require: false,
      })
      .then(async (result) => {
        let data = JSON.parse(JSON.stringify(result));
        await Promise.all(
          data.map(async (dataCalcul) => {
            let calcul = [];
            let bilan = [];

            let cropType = "";
            let plantDate = "";
            let soilType = "";
            let irrigType = "";
            let irrigTypeFr = "Goutte à goutte";
            let flowrate = "";
            let drippersNbr = "";
            let pumpFlow = "";
            let cropVariety = "-";
            let farm = "";
            let userName = "";
            let phoneNumber = "";
            let irrigNumber = 0;
            let irrigTime = 0;
            let irrigDates = [];
            let startDate = new Date(dataCalcul.start_date);
            let endDate = new Date(dataCalcul.end_date);
            let resultCalcul = dataCalcul.result;

            const filteredResult = resultCalcul.filter((result) => {
              let resultDate = new Date(result.date).toISOString().slice(0, 10);
              return (
                toSqlDate(startDate) <= resultDate &&
                toSqlDate(endDate) >= resultDate &&
                result.codeSensor == dataCalcul.sensors.code
              );
            });

            // console.log(dataCalcul.fields.zones.soilTypes)
            if (dataCalcul) {
              if (dataCalcul.fields.zones) {
                dataCalcul.fields.zones.map((soils) => {
                  if (typeof soils.soiltypes !== "undefined") {
                    // console.log(soils.soiltypes.soil)
                    soilType = soils.soiltypes.soil;
                  }
                });
              }
              if (dataCalcul.fields.crops) {
                dataCalcul.fields.crops.map((crops) => {
                  cropType = crops.croptypes.crop;
                  plantDate = crops.growingDate;
                  if (
                    typeof crops.varieties !== "undefined" &&
                    crops.varieties != null &&
                    crops.varieties != ""
                  ) {
                    cropVariety = crops.varieties.crop_variety;
                  }
                  let irrig = crops.irrigations;
                  if (irrig) {
                    irrig.map((irrig) => {
                      if (irrig.type == "drip") {
                        irrigType = irrigTypeFr;
                      } else {
                        irrigType = irrig.type;
                      }
                      pumpFlow = irrig.pumpFlow;
                      flowrate = irrig.flowrate;
                      drippersNbr = irrig.drippers;
                    });
                  }
                });
              }
              if (typeof dataCalcul.users !== "undefined") {
                userName = dataCalcul.users.name;
                phoneNumber = dataCalcul.users.phone_number;
                dataCalcul.users.farms &&
                  dataCalcul.users.farms.map((farms) => {
                    if (farms) {
                      farm = farms.name;
                    }
                  });
              }
            }
            let lat = parseFloat(dataCalcul.sensors.Latitude).toFixed(4);
            let lng = parseFloat(dataCalcul.sensors.Latitude).toFixed(4);
            let total = 0;
            if (filteredResult.length > 0) {
              for (let index = 0; index < filteredResult.length - 1; index++) {
                const element = filteredResult[index];
                total += element.irrigation;
                calcul.push({
                  ET0: element.ET0,
                  kc: element.kc,
                  Etc: parseFloat(element.Etc).toFixed(2),
                  date: new Date(element.date).toLocaleString().slice(0, 10),
                  RUmax: parseFloat(element.RUmax).toFixed(1),
                  irrigation: parseFloat(element.irrigation).toFixed(1),
                  irrigationTime: parseFloat(element.irrigationTime).toFixed(2),
                });
                const averageBilanValue =
                  element.bilan.reduce(
                    (acc, bilan) => acc + parseFloat(bilan.value),
                    0
                  ) / element.bilan.length;

                bilan.push({
                  value: parseFloat(averageBilanValue).toFixed(1),
                });
              }
            }
            let calculIrrigation = calcul.filter((irrig) => {
              return Number(irrig.irrigation) !== 0;
            });
            irrigNumber = calculIrrigation.length;
            if (calculIrrigation.length > 0) {
              calculIrrigation.map((irrig) => {
                irrigTime = parseFloat(irrig.irrigationTime).toFixed(0);
              });
            }
            if (calculIrrigation.length > 0) {
              calculIrrigation.forEach((irrig) => {
                irrigDates.push(irrig.date);
              });
            }
            const minutes = irrigTime % 60;
            const hours = Math.floor(irrigTime);
            let irrigationDuration = `${hours}h`;
            const html = fs.readFile(
              path.join(__dirname, "../../reports/bulletin.html"),
              "utf-8",
              async function (err, data) {
                const filename =
                  dataCalcul.fields.uid +
                  "_" +
                  toSqlDate(startDate) +
                  "_" +
                  toSqlDate(endDate) +
                  "_doc" +
                  ".pdf";
                await pdf
                  .create(
                    {
                      html: data,
                      data: {
                        products: [
                          {
                            nameFarm: farm,
                            nameField: dataCalcul.fields.name,
                            nameUser: userName,
                            phone: phoneNumber,
                            codeSensor: dataCalcul.sensors.code,
                            Lat: parseFloat(
                              dataCalcul.sensors.Latitude
                            ).toFixed(4),
                            Lon: parseFloat(
                              dataCalcul.sensors.Longitude
                            ).toFixed(4),
                            crop: cropType,
                            irrigtype: irrigType,
                            flowrate: flowrate,
                            drippers: drippersNbr,
                            pumpFlow: pumpFlow,
                            cropVariety: cropVariety,
                            plantDate: new Date(plantDate).getFullYear(),
                            soil: soilType,
                            startDate: new Date(startDate)
                              .toLocaleString()
                              .slice(0, 10),
                            endDate: addDays(endDate, -1)
                              .toLocaleString()
                              .slice(0, 10),
                            totalIrrigation: parseFloat(total).toFixed(1),
                            irrigNumber: irrigNumber,
                            irrigTime: irrigationDuration,
                            irrigDate: irrigDates,
                          },
                        ],
                        calcul: calcul,
                        bilan: bilan,
                      },
                      path: "./docs/" + filename,
                    },
                    option1
                  )

                  .then(async (result) => {
                    if (result) {
                      console.log(result);
                      await new Report({
                        user_id: dataCalcul.users.id,
                        field_id: dataCalcul.fields.id,
                        filename: filename,
                      }).save();
                      // await addNotifWhenCreateBulletin(dataCalcul.users.id)
                      // if (phoneNumber && phoneNumber != "") {
                      //  await sendSMStoUsers(phoneNumber, irrigNumber, irrigDates, irrigTime)

                      // }
                    }
                  })
                  .catch((error) => {
                    console.log(error);
                  });
              }
            );
          })
        );
        return res.status(200).json({ type: "success", result: data });
      })
      .catch((err) => {
        console.log(err);
      });
  } catch (error) {
    return res
      .status(500)
      .json({ type: "danger", message: "Error Creating Report" });
  }
};

const getDataFromApiSensor = async (codeSensor) => {
  let mv1 = 0;
  let mv2 = 0;
  let mv3 = 0;
  let ruMax = 0;
  const response = fetch(
    `http://54.38.183.164:5000/api/sensor/last-topic/${codeSensor}`
  )
    .then((response) => response.json())
    .then((resultApi) => {
      if (resultApi != null) {
        resultApi.map((dataResponseApi) => {
          if (
            typeof dataResponseApi !== "undefined" &&
            dataResponseApi !== null &&
            typeof dataResponseApi.mv3 !== "undefined"
          ) {
            mv1 = dataResponseApi.mv1;
            mv2 = dataResponseApi.mv2;
            mv3 = dataResponseApi.mv3;
          }
        });
        //ruMax =  Ajouter formulaire de calcul à partir des données sensor
      }
    });
  return ruMax;
};

// const calculSimulation = async (DataIrrigations, DataCrops, ruPratiqueData, RUmaxData, dosePercentage, effPluie, effIrrig, irrigArea, days, profondeur, startPlantingDate, dataCrop, rainConfig, latField, lonField, fieldsId, codeSensor) => {
//     let dailyDates = [];
//     let dailyET0 = [];
//     await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latField}&longitude=${lonField}&timezone=GMT&daily=et0_fao_evapotranspiration`, {})
//         .then((response) => response.json())
//         .then((jsonData) => {
//             dailyDates = jsonData.daily.time;
//             dailyET0 = jsonData.daily.et0_fao_evapotranspiration;
//         });

//     let surfaceOccup = 0;
//     let flowByTree = 0;
//     let sumETC = 0;
//     let sumIrrig = 0;
//     let sumNbrIrrig = 0;
//     let sumRain = 0;
//     var elements = [];

//     let resultFormule = [];
//     let ETC = 0;
//     let RuInitial = 0;
//     let Pe = 0;
//     let bilanHydrique = 0;
//     let firstFormule = 0;
//     let formule = 0;
//     let firstFormuleIrrig = 0;
//     let formuleIrrig = 0;
//     let dataSoil = 0;
//     let IrrigationNbr = 0;
//     let RuMax = 0;
//     let ruPratique = 0;
//     if (dataCrop != null && Object.keys(dataCrop).length > 0 && typeof dataCrop.all_kc !== 'undefined' && days > 0 && latField != null && latField != "" && lonField != null && lonField != "") {
//         ruPratique = Number(ruPratiqueData);
//         RuMax = Number(RUmaxData) * Number(profondeur);
//         RuInitial = Number(RUmaxData) * Number(profondeur);
//         let Epuisement_maximal = (Number(RUmaxData) * Number(profondeur) * Number(ruPratique)) / 100;
//         let RuMin = Number(RuMax) - Number(Epuisement_maximal);
//         let rainData = 0;
//         let prevHourlyBilan = RuInitial;
//         let rainfall = 0;
//         let IrrigTime = 0;

//         for (let i = 1; i <= days; i++) {
//             if (typeof dataCrop.all_kc[i - 1] !== 'undefined') {
//                 let ET0 = 6;
//                 let doseByTree = 0;
//                 let Irrigation = 0;

//                 let date = addDays(startPlantingDate, i - 1);
//                 var month = date.getMonth();
//                 var day = date.getDate();
//                 var year = date.getFullYear();

//                 let currentDate = new Date();
//                 let dateCurrent = currentDate.getDate();
//                 currentDate.setDate(currentDate.getDate() + 7);
//                 var currentMonth = currentDate.getMonth();
//                 var currentDay = currentDate.getDate();
//                 var currentYear = currentDate.getFullYear();
//                 let DateFormat = new Date(date);
//                 let dateET0 = DateFormat.toISOString().slice(0, 10);

//                 dailyDates.map((dayDate, indx) => {
//                     if (dateET0 == dayDate) {
//                         ET0 = dailyET0[indx];
//                     }
//                 });

//                 if (DataCrops.length > 0) {
//                     DataCrops.map((item) => {
//                         surfaceOccup = item.surface;
//                     });
//                 }
//                 if (DataIrrigations.length > 0) {
//                     DataIrrigations.map((item) => {
//                         item.map((value) => {
//                             flowByTree = Number(value.drippers) * Number(value.flowrate);
//                         });
//                     });
//                 }

//                 if (typeof rainConfig.rainByDay !== 'undefined' && typeof rainConfig.rainByDay[month + "_" + day + "_rain"] !== 'undefined') {
//                     rainData = rainConfig.rainByDay[month + "_" + day + "_rain"];
//                 }
//                 if (typeof rainConfig.rainByDay !== 'undefined' && (typeof rainConfig.rainByDay[month + "_" + day + "_rain"] === 'undefined') && typeof rainConfig.rainByMonth !== 'undefined' && typeof rainConfig.rainByMonth[month + "_rain"] !== 'undefined') {
//                     rainData = rainConfig.rainByMonth[month + "_rain"];
//                 }

//                 if (currentMonth == month && day >= dateCurrent && day < currentDay && year == currentYear) {
//                     // Get weather data
//                     let sataRainWeather = await getRainFromWeather(latField, lonField);
//                     let key = year + "-" + ('0' + parseInt(month + 1)).slice(-2) + "-" + ('0' + day).slice(-2);

//                     if (sataRainWeather && typeof sataRainWeather[key] !== 'undefined') {
//                         rainData = sataRainWeather[key];
//                     } else {
//                         rainData = 0;
//                     }
//                 }

//                 Pe = Number(rainData) * Number(effPluie) / 100;

//                 let kcValue = 0;
//                 if (typeof dataCrop.all_kc[i - 1] !== 'undefined') {
//                     kcValue = dataCrop.all_kc[i - 1].kc;
//                 }
//                 ETC = Number(kcValue) * Number(ET0);
//                 let prevResultBilan = 0;

//                 firstFormule = (Number(RuInitial) + Number(Pe)) - Number(ETC);
//                 if (i > 1) {
//                     prevResultBilan = resultFormule[i - 2];
//                     formuleIrrig = (Number(RuMax) - Number(RuMin)) / (Number(effIrrig) / 100);
//                     formule = (Number(prevResultBilan) + parseInt(Pe)) - (parseFloat(ETC).toFixed(1) + Irrigation);
//                 }
//                 firstFormuleIrrig = (Number(RuMax) - Number(firstFormule)) / Number(effIrrig);

//                 if (i === 1) {
//                     if (firstFormule <= RuMax) {
//                         bilanHydrique = firstFormule;
//                     } else {
//                         bilanHydrique = RuMax;
//                     }
//                     if (RuInitial <= RuMin) {
//                         Irrigation = firstFormuleIrrig;
//                     } else {
//                         Irrigation = 0;
//                     }
//                 } else {
//                     if (formule <= RuMax) {
//                         bilanHydrique = formule;
//                     } else {
//                         bilanHydrique = RuMax;
//                     }
//                     if (formule <= RuMin) {
//                         Irrigation = formuleIrrig;
//                         bilanHydrique = formule + formuleIrrig;
//                     } else {
//                         Irrigation = 0;
//                     }
//                 }

//                 if (Irrigation == 0) {
//                     IrrigationNbr = 0;
//                 } else {
//                     IrrigationNbr = 1;
//                     rainfall = Number(flowByTree) / Number(surfaceOccup);

//                     doseByTree = Number(surfaceOccup) * (Number(Irrigation) / 1000);
//                     // IrrigTime = (Number(doseByTree) / (Number(flowByTree) / 1000)) * 60;
//                     IrrigTime = Number(Irrigation) / Number(rainfall)
//                 }

//                 let hourlyBilan = [];
//                 let requiredIrrigation = 0;
//                 let hoursToIrrigate = 0;

//                 for (let hour = 0; hour < 24; hour++) {
//                     // let prevHourlyBilan = hourlyBilan.length > 0 ? hourlyBilan[hourlyBilan.length - 1].value : RuInitial;
//                     let hourlyETC = ETC / 24;
//                     let hourlyBilanValue = (prevHourlyBilan + Pe / 24) - hourlyETC;

//                     if (hourlyBilanValue <= RuMin) {
//                        requiredIrrigation = (Number(RuMax) - Number(RuMin)) / (Number(effIrrig) / 100)
//                       Irrigation += requiredIrrigation;
//                       IrrigationNbr = 1;
//                      hourlyBilanValue = RuMax;
//                     hoursToIrrigate = parseFloat(IrrigTime).toFixed(0);
//                     }

//                     if(hourlyBilanValue > RuMax){
//                         hourlyBilanValue = RuMax
//                     }
//                     hourlyBilan.push({
//                         hour: hour,
//                         value: hourlyBilanValue,
//                     });
//                     if (Irrigation > 0) {
//                         sumNbrIrrig = sumNbrIrrig + IrrigationNbr;
//                         sumIrrig = sumIrrig + Irrigation;
//                         rainfall = Number(flowByTree) / Number(surfaceOccup);
//                         IrrigTime = Number(Irrigation) / Number(rainfall)

//                     }

//                     prevHourlyBilan = hourlyBilanValue;
//                 }

//                 resultFormule.push(hourlyBilan);
//                 if (ETC) {
//                     sumETC = sumETC + ETC;
//                 }

//                 sumRain = sumRain + rainData;

//                 elements.push({
//                     RUmax: RuMax,
//                     RUMin: RuMin,
//                     days: i,
//                     date: date,
//                     bilan: hourlyBilan, // Store the hour-specific bilan
//                     pe: Pe,
//                     Etc: ETC,
//                     ET0: ET0,
//                     rain: rainData,
//                     kc: kcValue,
//                     irrigation: Irrigation,
//                     irrigationNbr: IrrigationNbr,=
//                     codeSensor: codeSensor,
//                     irrigationTime: IrrigTime,
//                 });

//             }
//         }
//     }

//     return elements;
// };

const calculSimulation = async (
  DataIrrigations,
  DataCrops,
  ruPratiqueData,
  RUmaxData,
  dosePercentage,
  effPluie,
  effIrrig,
  irrigArea,
  days,
  profondeur,
  startPlantingDate,
  dataCrop,
  rainConfig,
  latField,
  lonField,
  fieldsId,
  codeSensor
) => {
  let dailyDates = [];
  let dailyET0 = [];

  // Fetch daily evapotranspiration data
  if (!latField || !lonField || isNaN(latField) || isNaN(lonField)) {
    console.warn(`❌ Field ${fieldsId} skipped in simulation: invalid lat/lon`);
    return [];
  }
  await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${latField}&longitude=${lonField}&timezone=GMT&daily=et0_fao_evapotranspiration`,
    {}
  )
    .then((response) => response.json())
    .then((jsonData) => {
      console.log(latField, "jsondata");

      dailyDates = jsonData.daily.time;
      dailyET0 = jsonData.daily.et0_fao_evapotranspiration;
    });

  // Initialize variables
  let surfaceOccup = 0;
  let flowByTree = 0;
  let sumETC = 0;
  let sumIrrig = 0;
  let sumNbrIrrig = 0;
  let sumRain = 0;
  let elements = [];

  let RuInitial = Number(RUmaxData) * Number(profondeur);
  let ruPratique = Number(ruPratiqueData);
  let RuMax = RuInitial;
  let Epuisement_maximal = (RuMax * ruPratique) / 100;
  let RuMin = RuMax - Epuisement_maximal;
  let prevHourlyBilan = RuInitial;

  if (
    dataCrop &&
    Object.keys(dataCrop).length > 0 &&
    typeof dataCrop.all_kc !== "undefined" &&
    days > 0 &&
    latField &&
    lonField
  ) {
    // Main loop for each day
    for (let i = 1; i <= days; i++) {
      if (typeof dataCrop.all_kc[i - 1] !== "undefined") {
        let ET0 = 6;
        let date = addDays(startPlantingDate, i - 1);
        let month = date.getMonth();
        let day = date.getDate();
        let year = date.getFullYear();
        let dateET0 = date.toISOString().slice(0, 10);

        // Retrieve ET0 for the specific day
        dailyDates.forEach((dayDate, indx) => {
          if (dateET0 === dayDate) {
            ET0 = dailyET0[indx];
          }
        });

        // Calculate surface occupied and flow by tree
        if (DataCrops.length > 0) {
          surfaceOccup = DataCrops[0].surface;
        }
        if (DataIrrigations.length > 0) {
          flowByTree = DataIrrigations[0].reduce(
            (acc, value) =>
              acc + Number(value.drippers) * Number(value.flowrate),
            0
          );
        }

        // Get rainfall data
        let rainData = getRainData(rainConfig, month, day);
        if (isCurrentWeek(month, day, year)) {
          let sataRainWeather = await getRainFromWeather(latField, lonField);
          rainData = sataRainWeather[getFormattedDate(year, month, day)] || 0;
        }

        let Pe = (Number(rainData) * Number(effPluie)) / 100;
        let kcValue = dataCrop.all_kc[i - 1]?.kc || 0;
        let ETC = kcValue * Number(ET0);

        let {
          bilanHydrique,
          Irrigation,
          IrrigationNbr,
          IrrigTime,
          pluieArrosage,
        } = calculateIrrigation(
          i,
          Pe,
          ETC,
          RuMax,
          RuMin,
          RuInitial,
          prevHourlyBilan,
          effIrrig,
          surfaceOccup,
          flowByTree
        );

        // Update sums
        sumETC += ETC;
        sumRain += rainData;
        sumNbrIrrig += IrrigationNbr;
        sumIrrig += Irrigation;

        elements.push({
          RUmax: RuMax,
          RUMin: RuMin,
          days: i,
          date: date,
          bilan: bilanHydrique,
          pe: Pe,
          Etc: ETC,
          ET0: ET0,
          rain: rainData,
          kc: kcValue,
          irrigation: Irrigation,
          irrigationNbr: IrrigationNbr,
          pluieArrosage: pluieArrosage,
          codeSensor: codeSensor,
          irrigationTime: IrrigTime,
        });

        prevHourlyBilan = bilanHydrique[bilanHydrique.length - 1].value;
        // console.log(`Day ${i}: Kc = ${dataCrop.all_kc[i - 1]?.kc}`);
      } else {
        console.warn(`Day ${i}: Missing Kc value`);
      }
    }
  }

  return elements;
};

// Helper functions

const getRainData = (rainConfig, month, day) => {
  if (!rainConfig) {
    // console.log("Rain config is null or undefined, returning default value 0.");
    return 0;
  }

  let dayKey = `${month}_${day}_rain`;
  let monthKey = `${month}_rain`;

  return (
    (rainConfig.rainByDay && rainConfig.rainByDay[dayKey]) ||
    (rainConfig.rainByMonth && rainConfig.rainByMonth[monthKey]) ||
    0
  );
};

const isCurrentWeek = (month, day, year) => {
  let currentDate = new Date();
  let dateCurrent = currentDate.getDate();
  currentDate.setDate(currentDate.getDate() + 7);
  return (
    currentDate.getMonth() === month &&
    day >= dateCurrent &&
    day < currentDate.getDate() &&
    year === currentDate.getFullYear()
  );
};

const getFormattedDate = (year, month, day) => {
  return `${year}-${("0" + (month + 1)).slice(-2)}-${("0" + day).slice(-2)}`;
};

const calculateIrrigation = (
  i,
  Pe,
  ETC,
  RuMax,
  RuMin,
  RuInitial,
  prevHourlyBilan,
  effIrrig,
  surfaceOccup,
  flowByTree
) => {
  let bilanHydrique = [];
  let Irrigation = 0;
  let IrrigationNbr = 0;
  let IrrigTime = 0;
  let formule = prevHourlyBilan + Pe - ETC;
  let formuleIrrig = (RuMax - RuMin) / (effIrrig / 100);
  let prevResultBilan = i > 1 ? prevHourlyBilan : RuInitial;
  let pluieArrosage = flowByTree / surfaceOccup;
  for (let hour = 0; hour < 24; hour++) {
    let hourlyETC = ETC / 24;
    let hourlyBilanValue = prevResultBilan + Pe / 24 - hourlyETC;

    if (hourlyBilanValue <= RuMin) {
      Irrigation = formuleIrrig;
      hourlyBilanValue = RuMax;
      IrrigationNbr = 1;
      IrrigTime = (Irrigation / pluieArrosage) * 60;
    }

    hourlyBilanValue = Math.min(hourlyBilanValue, RuMax);
    bilanHydrique.push({ hour: hour, value: hourlyBilanValue });

    prevResultBilan = hourlyBilanValue;
  }

  return { bilanHydrique, Irrigation, IrrigationNbr, IrrigTime, pluieArrosage };
};

const getRainFromConfig = async (city_id) => {
  let dataWeather = {};
  const citiesWeather = await new Citiesweather({
    city_id: city_id,
    deleted_at: null,
  })

    .fetch({ require: false })
    .then(async (result) => {
      if (result) {
        dataWeather = JSON.parse(JSON.stringify(result));
      }
    })
    .catch((error) => {
      return res.status(500).json({ type: "danger", message: "error_city" });
    });
  let weatherByDay = dataWeather.weather_data_days;
  let weatherByMonth = dataWeather.weather_data;

  let rainByDay = {};
  if (weatherByDay) {
    rainByDay = Object.values(weatherByDay)[2];
  }
  let rainByMonth = {};
  if (weatherByMonth) {
    rainByMonth = Object.values(weatherByMonth)[2];
  }

  return { rainByDay, rainByMonth };
};

const getRainFromWeather = async (lat, lon) => {
  let rain = [];
  const linkApi = process.env.URL_API_OPENWEATHER_FORECAST;
  const response = await fetch(
    `${linkApi}?lat=${lat}&lon=${lon}&units=metric&appid=${process.env.KEY_OPENWEATHER}`
  );
  const data = await response.json();
  let list = data.list;
  if (typeof list !== "undefined") {
    list.map(async (weather) => {
      let date = weather.dt_txt.substr(0, 10);
      if (typeof weather.rain !== "undefined") {
        rain.push({ date: date, rain: weather.rain["3h"] });
      }
    });
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
};
// cron calcul
const calculBilanHydrique = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    res.status(422).json({ errors: errors.array() });
    return;
  }
  const allowedStartTime = new Date();
  allowedStartTime.setHours(2, 0, 0, 0);

  const allowedEndTime = new Date();
  allowedEndTime.setHours(3, 0, 0, 0);
  const today = new Date();
  if (today.getDay() !== 1 || today !== allowedStartTime) {
    return res.status(200).json({
      type: "success",
      message: "Calculation skipped. Calculations should start on Mondays.",
    });
  }

  try {
    const field = new Field()
      .query((qb) =>
        qb
          .where("deleted_at", null)
          .and.whereNotNull("Latitude")
          .and.whereNotNull("Longitude")
      )
      .fetchAll({
        withRelated: [
          {
            sensors: (qb) => {
              qb.where("deleted_at", null).andWhere("synchronized", "1");
            },
          },
          {
            crops: (qb) => {
              qb.where("deleted_at", null);
            },
          },
          {
            "crops.irrigations": (qb) => {
              qb.where("deleted_at", null);
            },
          },
          {
            "crops.croptypes": (qb) => {
              qb.where("deleted_at", null);
            },
          },
          {
            "crops.varieties": (qb) => {
              qb.where("deleted_at", null);
            },
          },
          {
            zones: (qb) => {
              qb.where("deleted_at", null);
            },
          },
        ],
        require: false,
      })
      .then(async (result) => {
        if (result === null)
          return res.status(404).json({ type: "danger", message: "no_fields" });

        if (result) {
          let data = JSON.parse(JSON.stringify(result));
          // generatePDF(data)
          sensorToRapport = [];
          await Promise.all(
            data.map(async (fields) => {
              let DataCrops = fields.crops;
              let DataIrrigations = [];
              let RUmax = 0;
              let effPluie = 0;
              let effIrrig = 0;
              let irrigArea = 0;
              let ruPratique = 0;
              let dosePercentage = 100;
              let dataCrop = {};
              let days = 0;
              let latField = fields.Latitude;
              let lonField = fields.Longitude;
              let dataCalcul = [];
              let inputs = [];
              let plantingDate = "";
              let profondeur = 0;
              let zoneData = [];

              //Zone
              if (fields.zones !== []) {
                let soilsData = fields.zones;
                soilsData.map((soils) => {
                  // ruPratique = Number(soils.ruPratique)
                  RUmax = Number(soils.RUmax);
                  effPluie = Number(soils.effPluie);
                  // effIrrig = Number(soils.effIrrig)
                  irrigArea = Number(soils.irrigArea);
                  zoneData.push({
                    ruPratique: ruPratique,
                    RUmax: RUmax,
                    effIrrig: effIrrig,
                    effPluie: effPluie,
                    irrigArea: irrigArea,
                  });
                });
              }
              //Crops

              if (fields.crops !== []) {
                DataIrrigations = DataCrops.map((data) => {
                  return data.irrigations;
                });

                let cropsData = fields.crops;
                cropsData.map(async (crops) => {
                  days = Number(crops.days);
                  profondeur = Number(crops.rootDepth);
                  plantingDate = crops.plantingDate;
                  ruPratique = Number(crops.practical_fraction);
                  dataCrop = crops.croptypes;
                  if (
                    typeof crops.varieties !== "undefined" &&
                    crops.varieties != null &&
                    crops.varieties != "" &&
                    Object.keys(crops.varieties).length > 0
                  ) {
                    dataCrop = {};
                    dataCrop = crops.varieties;
                  }
                  if (
                    typeof crops.dose_efficiency !== "undefined" &&
                    crops.dose_efficiency !== null
                  ) {
                    dosePercentage = Number(crops.dose_efficiency);
                  }
                });
                DataCrops.map((data) => {
                  let irrigData = data.irrigations;
                  irrigData.map((irrig) => {
                    if (typeof irrig.effIrrig !== "undefined")
                      effIrrig = Number(irrig.effIrrig);
                  });
                });
              }

              if (
                fields.sensors !== [] &&
                fields.sensors != null &&
                Object.keys(fields.sensors).length > 0
              ) {
                let city_id = "";
                //add 'city_id' in farm table
                let farmId = fields.farm_id;
                const farm = await new Farm({ id: farmId })
                  .fetch({ require: false })
                  .then((result) => {
                    let farms = JSON.parse(JSON.stringify(result));
                    city_id = farms.city_id;
                  });
                let rainConfig = await getRainFromConfig(city_id);

                let sensorsData = fields.sensors;

                sensorsData.map(async (sensors) => {
                  let codeSensor = sensors.code;
                  let user_id = sensors.user_id;
                  if (
                    codeSensor != "" &&
                    dataCrop != null &&
                    Object.keys(dataCrop).length > 0 &&
                    typeof dataCrop.all_kc !== "undefined" &&
                    days > 0 &&
                    latField != null &&
                    latField != "" &&
                    lonField != null &&
                    lonField != ""
                  ) {
                    //let RuMax = getDataFromApiSensor(codeSensor);
                    let key = fields.id;
                    let resultCalcul = null;
                    resultCalcul = await calculSimulation(
                      DataIrrigations,
                      DataCrops,
                      ruPratique,
                      RUmax,
                      dosePercentage,
                      effPluie,
                      effIrrig,
                      irrigArea,
                      days,
                      profondeur,
                      plantingDate,
                      dataCrop,
                      rainConfig,
                      latField,
                      lonField,
                      fields.id,
                      codeSensor
                    );

                    dataCalcul.push({
                      user_id: user_id,
                      field_id: key,
                      sensor_id: sensors.id,
                      sensor_code: sensors.code,
                      resultCalcul: resultCalcul,
                    });

                    if (
                      resultCalcul !== [] &&
                      Object.keys(resultCalcul).length > 0
                    ) {
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
                        plantingDate: plantingDate,
                      });
                      if (resultCalcul.length > 0) {
                        await new CalculSensor()
                          .query((qb) => {
                            qb.select("*");
                            qb.where({ sensor_id: sensors.id });
                          })
                          .fetchAll({ require: false })
                          .then(async (dataFromCalcul) => {
                            let r = JSON.parse(JSON.stringify(dataFromCalcul));
                            if (r.length > 0) {
                              //  await r.map(async data => {
                              // let startDate = data.start_date.slice(0, 10)
                              // let endDate = data.end_date.slice(0, 10)
                              // let currentDay = dateStart.toISOString().slice(0, 10)
                              // let lastDay = dateEnd.toISOString().slice(0, 10)
                              // console.log(new Date(startDate) <= today && new Date(endDate) >= today && today.getDay() === 1)
                              // if (startDate <= today && endDate >= today && today.getDay() === 1) {
                              await new CalculSensor({
                                user_id: user_id,
                                field_id: sensors.field_id,
                                sensor_id: sensors.id,
                                sensor_code: codeSensor,
                                start_date: dateStart,
                                end_date: dateEnd,
                                result: resultCalcul,
                                inputs: inputs,
                              }).save();
                              // }
                              //logger.info( "sensor_id ->" + sensors.id +" field_id -> " + sensors.field_id + "success")
                              await addCalculSensorRecommnd(
                                user_id,
                                sensors.field_id
                              );

                              // })
                            }
                            if (r.length == 0) {
                              await new CalculSensor({
                                user_id: user_id,
                                field_id: sensors.field_id,
                                sensor_id: sensors.id,
                                sensor_code: codeSensor,
                                start_date: dateStart,
                                end_date: dateEnd,
                                result: resultCalcul,
                                inputs: inputs,
                              }).save();
                              //logger.info( "sensor_id ->" + sensors.id +" field_id -> " + sensors.field_id + "success")
                              await addCalculSensorRecommnd(
                                user_id,
                                sensors.field_id
                              );
                            }
                          })
                          .catch((err) => {
                            console.log(err);
                            return res.status(500).json({
                              type: "danger",
                              message: "error_select_calcul",
                            });
                          });
                      }
                    }
                  }
                });
              }
            })
          );
          return res.status(200).json({ type: "success", message: "ok" });
        }
      })
      .catch((err) => {
        console.log(err);
        return res.status(500).json({ type: "danger", message: err });
      });
  } catch (error) {
    return res.status(500).json({ type: "danger", message: "error_calcul" });
  }
};
// admin calcul
const calculBilanHydriqueByField = async (req, res) => {
  const errors = validationResult(req);
  const { fieldId, userId } = req.body;

  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  const allowedStartTime = new Date();

  allowedStartTime.setHours(2, 0, 0, 0);

  const allowedEndTime = new Date();
  allowedEndTime.setHours(3, 0, 0, 0);

  const today = new Date();

  try {
    savedCalcul = "";
    const field = await new Field({ id: fieldId })
      .query((qb) =>
        qb
          .where("deleted_at", null)
          .and.whereNotNull("Latitude")
          .and.whereNotNull("Longitude")
      )
      .fetch({
        withRelated: [
          // { 'sensors': qb => { qb.where('deleted_at', null).andWhere('synchronized', "1"); } },
          {
            crops: (qb) => {
              qb.where("deleted_at", null);
            },
          },
          {
            "crops.irrigations": (qb) => {
              qb.where("deleted_at", null);
            },
          },
          {
            "crops.croptypes": (qb) => {
              qb.where("deleted_at", null);
            },
          },
          {
            "crops.varieties": (qb) => {
              qb.where("deleted_at", null);
            },
          },
          {
            zones: (qb) => {
              qb.where("deleted_at", null);
            },
          },
        ],
        require: false,
      });

    if (field === null) {
      return res.status(404).json({ type: "danger", message: "no_fields" });
    }

    let data = JSON.parse(JSON.stringify(field));
    let allCalculations = [];
    const feedback = [];

    for (let fields of [data]) {
      let skipReasons = [];

      let DataCrops = fields.crops;
      let DataIrrigations = [];
      let RUmax = 0,
        effPluie = 0,
        effIrrig = 0,
        irrigArea = 0,
        ruPratique = 0;
      let dosePercentage = 100;
      let dataCrop = {};
      let days = 0;
      let latField = fields.Latitude;
      let lonField = fields.Longitude;
      let dataCalcul = [];
      let inputs = [];
      let plantingDate = "";
      let profondeur = 0;
      let zoneData = [];

      // Zone
      if (fields.zones.length > 0) {
        let soilsData = fields.zones;
        for (let soils of soilsData) {
          RUmax = Number(soils.RUmax);
          effPluie = Number(soils.effPluie);
          irrigArea = Number(soils.irrigArea);
          zoneData.push({
            ruPratique: ruPratique,
            RUmax: RUmax,
            effIrrig: effIrrig,
            effPluie: effPluie,
            irrigArea: irrigArea,
          });
        }
      } else {
        skipReasons.push("No zones (soil data) defined for the field");
      }

      // Crops
      if (fields.crops.length > 0) {
        DataIrrigations = DataCrops.map((data) => data.irrigations);

        let cropsData = fields.crops;
        for (let crops of cropsData) {
          days = Number(crops.days);
          profondeur = Number(crops.rootDepth);
          plantingDate = crops.plantingDate;
          ruPratique = Number(crops.practical_fraction);
          // dataCrop = crops.croptypes;

          // if (
          //   crops.varieties &&
          //   crops.varieties.all_kc.length > 0 &&
          //   crops.varieties.all_kc !== null
          // ) {
          //   dataCrop = crops.varieties;
          // }
          // if (crops.dose_efficiency) {
          //   dosePercentage = Number(crops.dose_efficiency);
          // }
          if (crops.is_kc_modified) {
            // use the custom kc values directly from the crop
            dataCrop = crops;
          } else if (
            crops.varieties &&
            crops.varieties.all_kc &&
            crops.varieties.all_kc.length > 0
          ) {
            dataCrop = crops.varieties;
          } else {
            dataCrop = crops.croptypes;
          }
        }

        for (let data of DataCrops) {
          let irrigData = data.irrigations;
          for (let irrig of irrigData) {
            if (irrig.effIrrig) {
              effIrrig = Number(irrig.effIrrig);
            }
          }
        }
      } else {
        skipReasons.push("No crop data available");
      }

      // Check if sensors exist
      // if (fields.sensors && fields.sensors.length > 0) {
      let farmId = fields.farm_id;
      const farm = await new Farm({ id: farmId }).fetch({ require: false });
      let city_id = farm ? farm.toJSON().city_id : "";

      let rainConfig = await getRainFromConfig(city_id);

      let canCalculate = true;
      if (!dataCrop || Object.keys(dataCrop).length === 0) {
        skipReasons.push("Missing crop type or variety data");
        canCalculate = false;
      }
      if (!days || days <= 0) {
        skipReasons.push("Invalid or missing crop duration (days)");
        canCalculate = false;
      }
      if (
        latField == null ||
        lonField == null ||
        isNaN(latField) ||
        isNaN(lonField)
      ) {
        skipReasons.push("Missing or invalid latitude or longitude");
        canCalculate = false;
      }
      if (!RUmax) {
        skipReasons.push("Missing soil RUmax value");
        canCalculate = false;
      }

      if (canCalculate) {
        let resultCalcul = await calculSimulation(
          DataIrrigations,
          DataCrops,
          ruPratique,
          RUmax,
          dosePercentage,
          effPluie,
          effIrrig,
          irrigArea,
          days,
          profondeur,
          plantingDate,
          dataCrop,
          rainConfig,
          latField,
          lonField,
          fields.id,
          null
        );
        if (resultCalcul.length > 0) {
          const today = new Date();
          const day = today.getDay();
          const diffToMonday = (day === 0 ? -6 : 1) - day;

          const start_date = new Date(today);
          start_date.setDate(today.getDate() + diffToMonday);

          const end_date = new Date(start_date);
          end_date.setDate(start_date.getDate() + 7);
          inputs.push({
            ruPratique: ruPratique,
            RUmax: RUmax,
            effPluie: effPluie,
            effIrrig: effIrrig,
            irrigArea: irrigArea,
            profondeur: profondeur,
            plantingDate: plantingDate,
          });

          let calcData = {
            user_id: userId,
            field_id: fields.id,
            sensor_id: null,
            sensor_code: null,
            start_date,
            end_date,
            result: resultCalcul,
            inputs: inputs,
          };

          allCalculations.push(calcData);
          savedCalcul = await new CalculSensor(calcData).save();
        } else {
          let debugMessage = `⚠️ Simulation ran but returned no data — possibly due to:\n`;
          if (!dataCrop || Object.keys(dataCrop).length === 0)
            debugMessage += " dataCrop is empty.";
          else if (!dataCrop.all_kc || dataCrop.all_kc.length === 0)
            debugMessage += " - Missing all_kc values\n";
          else if (days > dataCrop.all_kc.length)
            debugMessage += ` all_kc has fewer values (${dataCrop.all_kc.length}) than required days (${days}).`;
          else debugMessage += `- Possibly empty ET0/rain data from API\n`;
          skipReasons.push(debugMessage.trim());
        }
      }

      if (skipReasons.length > 0) {
        feedback.push({
          field_id: fields.id,
          skipped: true,
          reasons: skipReasons,
        });
      }
    }
    // }
    if (allCalculations.length > 0) {
      // console.log(allCalculations,"allCalculations");
      // console.log(savedCalcul.id,"savedCalcul.id");

      return res
        .status(201)
        .json({ data: allCalculations, id: savedCalcul.id });
    } else {
      return res.status(200).json({
        type: "info",
        message: "No valid data found for calculation",
        feedback,
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ type: "danger", message: "error_calcul" });
  }
};

const EditBilanHydriqueByField = async (req, res) => {
  const errors = validationResult(req);
  const {
    fieldId,
    RUmax,
    effPluie,
    effIrrig,
    irrigArea,
    ruPratique,
    profondeur,
  } = req.body;
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  const allowedStartTime = new Date();
  allowedStartTime.setHours(2, 0, 0, 0);
  const allowedEndTime = new Date();
  allowedEndTime.setHours(3, 0, 0, 0);
  const today = new Date();

  // Uncomment this section if you want to restrict execution to Mondays only
  // if (today.getDay() !== 1 || today !== allowedStartTime) {
  //     return res.status(200).json({ type: 'success', message: 'Calculation skipped. Calculations should start on Mondays.' });
  // }

  try {
    const field = await new Field({ id: fieldId })
      .query((qb) =>
        qb
          .where("deleted_at", null)
          .and.whereNotNull("Latitude")
          .and.whereNotNull("Longitude")
      )
      .fetch({
        withRelated: [
          {
            sensors: (qb) => {
              qb.where("deleted_at", null).andWhere("synchronized", "1");
            },
          },
          {
            crops: (qb) => {
              qb.where("deleted_at", null);
            },
          },
          {
            "crops.irrigations": (qb) => {
              qb.where("deleted_at", null);
            },
          },
          {
            "crops.croptypes": (qb) => {
              qb.where("deleted_at", null);
            },
          },
          {
            "crops.varieties": (qb) => {
              qb.where("deleted_at", null);
            },
          },
          {
            zones: (qb) => {
              qb.where("deleted_at", null);
            },
          },
        ],
        require: false,
      });

    if (field === null) {
      return res.status(404).json({ type: "danger", message: "no_fields" });
    }

    let data = JSON.parse(JSON.stringify(field));
    let allCalculations = [];

    for (let fields of [data]) {
      let DataCrops = fields.crops;
      let DataIrrigations = [];
      let dosePercentage = 100;
      let dataCrop = {};
      let days = 0;
      let latField = fields.Latitude;
      let lonField = fields.Longitude;
      let dataCalcul = [];
      let inputs = [];
      let plantingDate = "";
      let zoneData = [];

      // Zone
      if (fields.zones.length > 0) {
        let soilsData = fields.zones;
        zoneData.push({
          ruPratique: ruPratique,
          RUmax: RUmax,
          effIrrig: effIrrig,
          effPluie: effPluie,
          irrigArea: irrigArea,
        });
      }

      // Crops
      if (fields.crops.length > 0) {
        DataIrrigations = DataCrops.map((data) => data.irrigations);

        let cropsData = fields.crops;
        for (let crops of cropsData) {
          days = Number(crops.days);
          plantingDate = crops.plantingDate;
          dataCrop = crops.croptypes;
          if (crops.varieties) {
            dataCrop = crops.varieties;
          }
          if (crops.dose_efficiency) {
            dosePercentage = Number(crops.dose_efficiency);
          }
        }
      }

      if (fields.sensors && fields.sensors.length > 0) {
        let farmId = fields.farm_id;
        const farm = await new Farm({ id: farmId }).fetch({ require: false });
        let city_id = farm ? farm.toJSON().city_id : "";

        let rainConfig = await getRainFromConfig(city_id);

        for (let sensors of fields.sensors) {
          let codeSensor = sensors.code;
          let user_id = sensors.user_id;
          if (
            codeSensor &&
            dataCrop &&
            Object.keys(dataCrop).length > 0 &&
            dataCrop.all_kc &&
            days > 0 &&
            latField &&
            lonField
          ) {
            let key = fields.id;
            let resultCalcul = await calculSimulation(
              DataIrrigations,
              DataCrops,
              ruPratique,
              RUmax,
              dosePercentage,
              effPluie,
              effIrrig,
              irrigArea,
              days,
              profondeur,
              plantingDate,
              dataCrop,
              rainConfig,
              latField,
              lonField,
              fields.id,
              codeSensor
            );

            dataCalcul.push({
              user_id: user_id,
              field_id: key,
              sensor_id: sensors.id,
              sensor_code: sensors.code,
              resultCalcul: resultCalcul,
            });

            if (resultCalcul.length > 0) {
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
                plantingDate: plantingDate,
              });

              let calcData = {
                user_id: user_id,
                field_id: sensors.field_id,
                sensor_id: sensors.id,
                sensor_code: codeSensor,
                start_date: dateStart,
                end_date: dateEnd,
                result: resultCalcul,
                inputs: inputs,
              };

              allCalculations.push(calcData);

              // await new CalculSensor()
              //     .query(qb => {
              //         qb.select('*');
              //         qb.where({ sensor_id: sensors.id });
              //     })
              //     .fetchAll({ require: false })
              //     .then(async dataFromCalcul => {
              //         let existingCalcs = JSON.parse(JSON.stringify(dataFromCalcul));
              //         if (existingCalcs.length > 0) {
              //             // Return immediately if there are existing calculations
              //             return res.status(201).json(calcData);
              //         } else {
              //             // Save new calculations
              //             // Uncomment and use this if you want to save the new calculation
              //             // await new CalculSensor(calcData).save();
              //         }
              //     })
              //     .catch(err => {
              //         console.error(err);
              //         return res.status(500).json({ type: "danger", message: "error_select_calcul" });
              //     });
            }
          }
        }
      }
    }

    if (allCalculations.length > 0) {
      return res.status(201).json({ data: allCalculations });
    } else {
      return res.status(200).json({ type: "success", message: "ok" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ type: "danger", message: "error_calcul" });
  }
};

const sendSMStoUsers = async (
  phoneNumber,
  irrigNumber,
  irrigDates,
  irrigTime
) => {
  const minutes = irrigTime % 60;
  const hours = Math.floor(irrigTime / 60);
  let irrigationDuration = `${hours}h ${parseFloat(minutes).toFixed(0)}m`;
  const apiKey = process.env.WINSMS_API_KEY;
  const from = "SmartFarmTN";
  //    const arIrrigNumber = () => {
  //        switch (irrigNumber) {
  //             case "1":
  //                 return  "مرة واحدة"
  //             case "2":
  //                     return  "مرتين "
  //             case "3":
  //                 return "ثلاث مرات"
  //             case "4":
  //                 return "أربع مرات"
  //             case "5":
  //                 return "خمس مرات"
  //             default:
  //                 break;
  //         }

  //    }
  // let message = `Il est recommandé de répartir les besoins en eau de votre parcelle sur ${irrigNumber} fois par semaine. Pour la prochaine irrigation, prévoyez les dates suivantes : ${irrigDates.join(", ")} pendant ${irrigationDuration} minutes.`
  let message = `Nous vous remercions de votre confiance. Nous vous enverrons bientôt un SMS avec le planning d'arrosage de votre ferme. Merci de votre patience et de votre compréhension.`;
  // .في الأسبوع ${arIrrigNumber()} يُنصَح بتوزيع الاحتياجات المائية لقطعة الأرض الخاصة بك
  // دقيقة ${irrigTime} لمدة ${irrigDate} للري القادم، قم بالتخطيط له في
  try {
    const response = await fetch(
      `https://www.winsmspro.com/sms/sms/api?action=send-sms&api_key=${apiKey}&to=216${phoneNumber}&from=${from}&sms=${message}`
    );
    if (!response.ok) {
      throw new Error(`Failed to send SMS. Status code: ${response.status}`);
    }
    const jsonData = await response.json();

    if (jsonData.code === "ok") {
      console.log("SMS sent successfully!");
      console.log("Response:", jsonData);
    } else {
      console.log("Failed to send SMS.");
    }
  } catch (error) {
    console.log(error);
  }
};
const sendSMStoSelectedUser = async (req, res) => {
  const apiKey = process.env.WINSMS_API_KEY;
  const from = "SmartFarmTN";
  let phoneNumber = req.body.phoneNumber;
  let message = req.body.message;

  try {
    const response = await fetch(
      `https://www.winsmspro.com/sms/sms/api?action=send-sms&api_key=${apiKey}&to=216${phoneNumber}&from=${from}&sms=${message}`
    );
    if (!response.ok) {
      throw new Error(`Failed to send SMS. Status code: ${response.status}`);
    }
    const jsonData = await response.json();

    if (jsonData.code === "ok") {
      console.log("SMS sent successfully!");
      return res
        .status(200)
        .json({ type: "success", message: "SMS sent successfully" });
    } else {
      console.log("Failed to send SMS.");
      return res
        .status(500)
        .json({ type: "danger", message: "Error when sending SMS" });
    }
  } catch (error) {
    console.log(error);
  }
};

// user calcul by sensor
const getCalculSensor = async (req, res) => {
  if (!req.userUid || req.userUid === "") {
    return res.status(404).json({ type: "danger", message: "no_user" });
  }

  const uid = req.userUid;
  const sensorCode = req.params.sensorCode || ""; // Default to empty string if not provided
  console.log(sensorCode);
  let user_id = "";
  let userRole = "";

  try {
    const user = await new User({ uid: uid, deleted_at: null }).fetch({
      require: false,
    });

    if (user === null) {
      return res.status(404).json({ type: "danger", message: "no_user" });
    }

    user_id = user.get("id");
    userRole = user.get("role");

    const query = new CalculSensor().query((qb) => {
      qb.select("*");
      if (sensorCode) {
        qb.where({ sensor_code: sensorCode });
      }
      if (userRole === "ROLE_USER") {
        qb.where({ user_id: user_id });
      }
    });

    const result = await query.fetchAll({ require: false });

    if (result === null || result.length === 0) {
      return res
        .status(404)
        .json({ type: "danger", message: "no_user_calcul" });
    }

    let resultCalcul = JSON.parse(JSON.stringify(result));
    let todayDate = new Date();
    let today = todayDate.toISOString().slice(0, 10);
    let filteredResult = [];
    let inputsCalcul = [];

    resultCalcul.map((calcul) => {
      let startDate = new Date(calcul.start_date).toISOString().slice(0, 10);
      let endDate = new Date(calcul.end_date).toISOString().slice(0, 10);
      inputsCalcul = calcul.inputs;

      if (today >= startDate && today <= endDate) {
        console.log("Here is sensor calcul " + calcul.id);
        filteredResult = calcul.result.filter((result) => {
          let resultDate = new Date(result.date).toISOString().slice(0, 10);
          return (
            startDate <= resultDate &&
            endDate >= resultDate &&
            (sensorCode === "" || result.codeSensor === sensorCode)
          );
        });
      }
    });

    return res
      .status(201)
      .json({ calcul: filteredResult, inputs: inputsCalcul });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ type: "danger", message: "error_user" });
  }
};

const getAllCalculByUser = async (req, res) => {
  if (!req.userUid || req.userUid == "")
    return res.status(404).json({ type: "danger", message: "no_user" });
  const uid = req.userUid;
  let userRole = "";
  let user_id = "";
  try {
    const user = await new User({ uid: uid, deleted_at: null })
      .fetch({ require: false })
      .then(async (result) => {
        if (result === null)
          return res.status(404).json({ type: "danger", message: "no_user" });
        if (result) user_id = result.get("id");
        if (result) userRole = result.get("role");
      });
    // if(userRole === "ROLE_ADMIN") {
    //     await new CalculSensor()
    //     .query((qb) => {
    //         qb.select('*');
    //         qb.where({ sensor_code: sensorCode });
    //         // qb.where({ user_id: user_id });
    //     })
    //         .fetchAll({ require: false })
    //         .then(async result => {
    //             if (result === null) return res.status(404).json({ type: "danger", message: "no_user_calcul" });
    //             let resultCalcul = JSON.parse(JSON.stringify(result))
    //             let todayDate = new Date()
    //             let today = todayDate.toISOString().slice(0, 10)
    //             let filteredResult = [];
    //             let inputsCalcul = [];

    //             resultCalcul.map(calcul => {
    //                 let startDate = new Date(calcul.start_date).toISOString().slice(0, 10)
    //                 let endDate = new Date(calcul.end_date).toISOString().slice(0, 10)
    //                 let resultCalcul = calcul.result
    //                  inputsCalcul = calcul.inputs
    //                 if (today >= startDate && today <= endDate) {
    //                     filteredResult = resultCalcul.filter(result => {
    //                         let resultDate = new Date(result.date).toISOString().slice(0, 10)
    //                         return startDate <= resultDate && endDate >= resultDate && result.codeSensor == sensorCode
    //                     })
    //                 }
    //             })
    //             return res.status(201).json({ calcul: filteredResult , inputs : inputsCalcul });
    //         }).catch(err => {
    //             console.log(err)
    //             return res.status(500).json({ type: "danger", message: "error_get_calcul" });
    //         })

    // }
    if (userRole === "ROLE_USER") {
      await new CalculSensor()
        .query((qb) => {
          qb.select("*");
          // qb.where({ sensor_code: sensorCode });
          qb.where({ user_id: user_id });
        })
        .fetchAll({ require: false })
        .then(async (result) => {
          if (result === null)
            return res
              .status(404)
              .json({ type: "danger", message: "no_user_calcul" });
          let resultCalcul = JSON.parse(JSON.stringify(result));
          let todayDate = new Date();
          let today = todayDate.toISOString().slice(0, 10);
          let filteredResult = [];
          let inputsCalcul = [];

          resultCalcul.map((calcul) => {
            let startDate = new Date(calcul.start_date)
              .toISOString()
              .slice(0, 10);
            let endDate = new Date(calcul.end_date).toISOString().slice(0, 10);
            let resultCalcul = calcul.result;
            inputsCalcul = calcul.inputs;
            filteredResult = resultCalcul.filter((result) => {
              let resultDate = new Date(result.date).toISOString().slice(0, 10);
              return (
                startDate <= resultDate &&
                endDate >= resultDate &&
                result.irrigationNbr !== 0
              );
            });
          });
          return res
            .status(201)
            .json({ calcul: resultCalcul, inputs: inputsCalcul });
        })
        .catch((err) => {
          console.log(err);
          return res
            .status(500)
            .json({ type: "danger", message: "error_get_calcul" });
        });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ type: "danger", message: "error_user" });
  }
};

// user calcul by field / calcul field page
const getAllCalculByField = async (req, res) => {
  if (!req.userUid || req.userUid == "")
    return res.status(404).json({ type: "danger", message: "no_user" });
  const fieldUid = req.params.fieldUid;
  console.log(fieldUid, "fieldUid");
  let field_id = "";
  let calcul_id = "";
  try {
    const field = await new Field({ uid: fieldUid, deleted_at: null }).fetch({
      require: false,
    });
    if (!field) {
      return res.status(404).json({ type: "danger", message: "no_field" });
    } else {
      field_id = field.get("id");
    }
    const query = new CalculSensor().query((qb) => {
      qb.select("*");
      qb.where({ field_id });
    });

    const result = await query.fetchAll({ require: false });
    console.log(query, "resultttt");

    if (result === null || result.length === 0) {
      return res
        .status(404)
        .json({ type: "danger", message: "no_field_calcul" });
    }

    let resultCalcul = JSON.parse(JSON.stringify(result));
    // console.log(resultCalcul, "result calcull");

    let todayDate = new Date();
    let today = todayDate.toISOString().slice(0, 10);
    let filteredResult = [];
    let inputsCalcul = [];
    console.log(
      resultCalcul[resultCalcul.length - 1].start_date,
      "resultCalcul[resultCalcul.length - 1].start_date"
    );

    let startDate = new Date(resultCalcul[resultCalcul.length - 1].start_date)
      .toISOString()
      .slice(0, 10);
    console.log(startDate, "startd");

    let endDate = new Date(resultCalcul[resultCalcul.length - 1].end_date)
      .toISOString()
      .slice(0, 10);

    filteredResult = resultCalcul[resultCalcul.length - 1].result.filter(
      (result) => {
        let resultDate = new Date(result.date).toISOString().slice(0, 10);

        return startDate <= resultDate && endDate >= resultDate;
      }
    );
    inputsCalcul = resultCalcul[resultCalcul.length - 1].inputs;

    const start_date = new Date(startDate);
    start_date.setDate(start_date.getDate() - 14);

    const end_date = new Date(endDate);
    end_date.setDate(end_date.getDate() - 14);

    console.log(
      "Current timezone:",
      Intl.DateTimeFormat().resolvedOptions().timeZone
    );
    console.log(
      "System timezone offset (min):",
      new Date().getTimezoneOffset()
    );
    console.log("Raw result.date:", result.date);
    console.log("Parsed result.date:", new Date(result.date));

    resultCalcul.forEach((calcul, index) => {
      // let startDate = new Date(calcul.start_date).toISOString().slice(0, 10);
      // let endDate = new Date(calcul.end_date).toISOString().slice(0, 10);

      if (
        today >= startDate &&
        today <= endDate &&
        index === resultCalcul.length - 1
      ) {
        inputsCalcul = calcul.inputs;

        calcul_id = calcul.id;
        console.log(calcul_id, "my id");

        filteredResult = calcul.result.filter((result) => {
          let resultDate = new Date(result.date).toISOString().slice(0, 10);
          return startDate <= resultDate && endDate >= resultDate;
        });
      }
    });

    return res
      .status(201)
      .json({ calcul: filteredResult, inputs: inputsCalcul, id: calcul_id });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ type: "danger", message: "error_user" });
  }
};

const addNotifWhenCreateBulletin = async (user_id) => {
  try {
    await new CalculSensor()
      .query((qb) => {
        qb.select("*");
        qb.where({ user_id: user_id });
      })
      .fetchAll({ require: false })
      .then(async (result) => {
        let resultCalcul = JSON.parse(JSON.stringify(result));
        let todayDate = new Date();
        let today = todayDate.toISOString().slice(0, 10);
        let filteredResult = [];
        let object = "";
        let description = "";
        let startDate = "";
        let endDate = "";
        let type = "Info";
        resultCalcul.map((calcul) => {
          startDate = new Date(calcul.start_date).toISOString().slice(0, 10);
          endDate = new Date(calcul.end_date).toISOString().slice(0, 10);
          let resultCalcul = calcul.result;
          if (today >= startDate && today <= endDate) {
            filteredResult = resultCalcul.filter((result) => {
              let resultDate = new Date(result.date).toISOString().slice(0, 10);
              return startDate <= resultDate && endDate >= resultDate;
            });
          }
        });
        if (filteredResult.length > 0) {
          object = "Votre bulletin hebdomadaire est prêt.";
          description = `Le bulletin hebdomadaire du ${toSqlDate(
            addDays(startDate, +1)
          )} au ${toSqlDate(
            addDays(endDate, +1)
          )} est prêt , n'hésitez pas à nous contacter si vous avez des questions ou des commentaires sur ce bulletin. `;

          await new Notification({ object, description, type, user_id }).save();
        }
      });
  } catch (error) {
    console.log(error);
  }
};

const addCalculSensorRecommnd = async (user_id, field_id) => {
  let irrigDates = [];
  let irrigTime = 0;
  let irrigNbr = 0;
  try {
    await new CalculSensor()
      .query((qb) => {
        qb.select("*");
        qb.where({ user_id: user_id });
      })
      .fetchAll({ require: false })
      .then(async (result) => {
        let resultCalcul = JSON.parse(JSON.stringify(result));
        let todayDate = new Date();
        let today = todayDate.toISOString().slice(0, 10);
        let filteredResult = [];
        let title = "";
        let description = "";
        resultCalcul.map((calcul) => {
          let startDate = new Date(calcul.start_date)
            .toISOString()
            .slice(0, 10);
          let endDate = new Date(calcul.end_date).toISOString().slice(0, 10);
          let resultCalcul = calcul.result;
          if (today >= startDate && today <= endDate) {
            filteredResult = resultCalcul.filter((result) => {
              let resultDate = new Date(result.date).toISOString().slice(0, 10);
              return startDate <= resultDate && endDate >= resultDate;
            });
          }
        });
        if (filteredResult.length > 0) {
          let calculWithIrrigation = filteredResult.filter((calcul) => {
            let irrig = calcul.irrigationNbr;
            return irrig !== 0;
          });

          irrigNbr = calculWithIrrigation.length;
          calculWithIrrigation.map((irrig) => {
            irrigTime = parseFloat(irrig.irrigationTime).toFixed(0);
          });

          calculWithIrrigation.forEach((irrig) => {
            irrigDates.push(new Date(irrig.date).toISOString().slice(0, 10));
          });
          const minutes = irrigTime % 60;
          const hours = Math.floor(irrigTime);
          let irrigationDuration = `${hours}h`;
          let message = `Il est recommandé de répartir les besoins en eau de votre parcelle sur ${irrigNbr} fois par semaine. Pour la prochaine irrigation, prévoyez les dates suivantes : ${irrigDates.join(
            ", "
          )} pendant ${irrigationDuration} minutes.`;

          if (calculWithIrrigation.length > 0) {
            title = "Irrigate";
            description =
              "Soil water is now less than the refill point ,  Plant water stress can occur if refill status persists";
          } else {
            title = "Don't Irrigate";
            description =
              "Soil water is not expected to fall below the refill point within the next 7 days, even without irrigation";
          }

          await new Recommendation({
            title,
            description,
            message,
            user_id,
            field_id,
          }).save();
        }
      });
  } catch (error) {
    console.log(error);
  }
};

const getReportsByField = async (req, res) => {
  const fieldId = req.body.fieldId;

  try {
    const field = new Field({ id: fieldId, deleted_at: null })
      .fetch({
        withRelated: [
          {
            reports: (qb) => {
              qb.where("deleted_at", null).orderBy("id", "DESC");
            },
          },
        ],
      })
      .then(async (result) => {
        if (result === null)
          return res.status(404).json({ type: "danger", message: "no_field" });
        if (result) {
          return res.status(201).json({ type: "success", field: result });
        }
      });
  } catch (error) {
    return res.status(500).json({ type: "danger", message: "error_get_field" });
  }
};

module.exports = {
  calculBilanHydrique,
  getCalculSensor,
  addCalculSensorRecommnd,
  generatePDF,
  createBulletin,
  sendSMStoUsers,
  getReportsByField,
  sendSMStoSelectedUser,
  getAllCalculByUser,
  getAllCalculByField,
  calculBilanHydriqueByField,
  EditBilanHydriqueByField,
};
