const History = require("../../services/historicMongo");
const Sensor = require('../../models/Sensor');
const DataMapping = require('../../models/DataMapping');
const fetch = require('node-fetch');

const mappingMv = async (dataMapping, vals, date) => {
  let valaueAfterMapping = [];
  let idMapping = [];
  if (dataMapping != null) {
    let data = dataMapping;
    let arrayDatemv1 = [];
    let arrayDatemv2 = [];
    let arrayDatemv3 = [];
    data.map(dataMapping => {
      arrayDatemv1.push(dataMapping.date['Mv1_date'])
      arrayDatemv2.push(dataMapping.date['Mv2_date'])
      arrayDatemv3.push(dataMapping.date['Mv3_date'])
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
    if (data.length == 0) {
      vals.map((val, index) => {
        valaueAfterMapping[index] = parseFloat(val);
      })
    }
    data.map(dataMapping => {

      vals.map((val, index) => {
        valaueAfterMapping[index] = val;
        let num = parseInt(index + 1);

        let keyData = 'Mv' + num + '_date'
        let keyDataMax = 'Mv' + num + '_max'
        let keyDataMin = 'Mv' + num + '_min'
        if (dateMappingSelectedmv1 != "" && num == 1) {
          if (dateMappingSelectedmv1 == dataMapping.date[keyData]) {
            if (val >= parseFloat(dataMapping.max[keyDataMax]) && val <= parseFloat(dataMapping.min[keyDataMin])) {
              valaueAfterMapping[index] = (((parseFloat(val) - dataMapping.max[keyDataMax]) / (dataMapping.min[keyDataMin] - dataMapping.max[keyDataMax])) * 100).toFixed(2)
              idMapping[index] = dataMapping.id
            }

          }
        }

        if (dateMappingSelectedmv2 != "" && num == 2) {
          if (dateMappingSelectedmv2 == dataMapping.date[keyData]) {
            if (val >= parseFloat(dataMapping.max[keyDataMax]) && val <= parseFloat(dataMapping.min[keyDataMin])) {
              valaueAfterMapping[index] = (((parseFloat(val) - dataMapping.max[keyDataMax]) / (dataMapping.min[keyDataMin] - dataMapping.max[keyDataMax])) * 100).toFixed(2)
              idMapping[index] = dataMapping.id
            }
          }
        }
        if (dateMappingSelectedmv3 != "" && num == 3) {
          if (dateMappingSelectedmv3 == dataMapping.date[keyData]) {
            if (val >= parseFloat(dataMapping.max[keyDataMax]) && val <= parseFloat(dataMapping.min[keyDataMin])) {
              valaueAfterMapping[index] = (((parseFloat(val) - dataMapping.max[keyDataMax]) / (dataMapping.min[keyDataMin] - dataMapping.max[keyDataMax])) * 100).toFixed(2)
              idMapping[index] = dataMapping.id
            }
          }
        }
      })
    })

  }
  return [valaueAfterMapping, idMapping];
}

const createHistory = async (req, res) => {
  try {
    const codeSensor = req.body.codeSensor;
    const sensor = await new Sensor({ code: codeSensor, deleted_at: null }).fetch({ require: false });
    if (!sensor) return res.status(404).json({ type: "danger", message: "no_sensor_selected" });

    const [response] = await Promise.all([
      fetch(`http://54.38.183.164:5000/api/sensor/topic/${codeSensor}`),
      sensor
    ]);
    const resultApi = await response.json();
    let lat = sensor.attributes.Latitude
    let lon = sensor.attributes.Longitude
    if (!resultApi.rows.length) return res.status(404).json({ type: "danger", message: "no_data_found" });
    const historyData = resultApi.rows.map(dataResponseApi => {
      const { time, ref, temperature, humidity, pressure, charge, adc, ts, mv1, mv2, mv3, altitude } = dataResponseApi;
      return { time, ref, temperature, humidity, pressure, charge, adc, ts, mv1, mv2, mv3, altitude, lat, lon }
    });
    await History.create(historyData);
    res.json({ status: "success" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const addSensorsHistory = async (req, res) => {
  try {
    const allSensors = await new Sensor()
      .query((qb) => {
        qb.where("deleted_at", null)
          .andWhere("synchronized", "=", "1")
          ;
      })
      .fetchAll({ withRelated: ['dataMapping'], require: false });
    if (!allSensors) {
      return res.status(404).json({ type: "danger", message: "no_sensor_selected" });
    }
    let data = JSON.parse(JSON.stringify(allSensors))
    for (const sensor of data) {

      const [response] = await Promise.all([
        fetch(`http://54.38.183.164:5000/api/sensor/topic/${sensor.code}`),
        sensor
      ]);
      const resultApi = await response.json();

      if (resultApi.rows.length > 0) {
        await resultApi.rows.map(async dataResponseApi => {
          const mappingData = await mappingMv(sensor.dataMapping, [dataResponseApi.mv1, dataResponseApi.mv2, dataResponseApi.mv3], dataResponseApi.time)
          const historyData = {
            time: dataResponseApi.time,
            ref: dataResponseApi.ref,
            temperature: dataResponseApi.temperature,
            humidity: dataResponseApi.humidity,
            pressure: dataResponseApi.pressure,
            charge: dataResponseApi.charge,
            adc: dataResponseApi.adc,
            ts: dataResponseApi.ts,
            mv1: dataResponseApi.mv1,
            mv2: dataResponseApi.mv2,
            mv3: dataResponseApi.mv3,
            mv1WithMapping: mappingData[0][0],
            mv2WithMapping: mappingData[0][1],
            mv3WithMapping: mappingData[0][2],
            mv1MappingId: mappingData[1][0],
            mv2MappingId: mappingData[1][1],
            mv3MappingId: mappingData[1][2],
            altitude: dataResponseApi.altitude,
            lat: sensor.Latitude,
            lon: sensor.Longitude
          };

          await History.createHistoryIfNotExist(historyData);
        });

      }

    }

    res.json({ status: "success" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }

};

const getSensorHistory = async (req, res) => {
  const codeSensor = req.params.codeSensor;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  try {
    if (codeSensor) {
      const history = await History.find({ ref: codeSensor, deleted_at: null })
        .skip(skip)
        .limit(limit);
      const total = await History.countDocuments({ ref: codeSensor, deleted_at: null });
      return res.status(200).json({ history, total });
    } else {
      return res.status(400).json({ type: "danger", message: "Missing codeSensor in request parameters" });
    }
  } catch (error) {
    return res.status(500).json({ type: "danger", message: "Error getting history data" });
  }
};

module.exports = { createHistory, addSensorsHistory, getSensorHistory }