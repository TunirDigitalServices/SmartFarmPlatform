const Field = require('./../../models/Field.js');
const Farm = require('./../../models/Farm.js');
const User = require('./../../models/User.js');
const Sensor = require('./../../models/Sensor.js');
const data_mapping = require('./../../models/DataMapping.js');
const Datasensor = require('./../../models/Datasensor.js');
const logger = require('./../../logs.js');

var elasticsearch = require('elasticsearch');
const fetch = require('node-fetch');

var client = new elasticsearch.Client({
    hosts: [process.env.ELASTICSEARCH_HOST],
    keepAlive: true
});


const { body, validationResult } = require('express-validator');
const Zone = require('../../models/Zone.js');
const DataMapping = require('../../models/DataMapping.js');

const getSensorsByConnectedUser = async (req, res) => {
    if (!(req.userUid) || req.userUid == "") return res.status(404).json({ type: "danger", message: "no_user" });
    const uid = req.userUid;

    try {
        const user = await new User({ 'uid': uid })
            .fetch({ withRelated: [{ 'sensors': (qb) => { qb.where('deleted_at', null); } }], require: false })
            .then(async result => {
                if (result == null) return res.status(404).json({ type: "danger", message: "no_user" });
                let data = result.related('sensors');
                if (result) return res.status(201).json(data);
            });
    } catch (error) {
        return res.status(500).json({ type: "danger", message: "error_user" });
    }
}
const mappingMv = async (req, res) => {


    const {
        vals,
        date,
        sensor_id } = req.body;


    await new DataMapping()
        .query((qb) => qb.where('deleted_at', null).andWhere('sensor_id', '=', sensor_id))
        .fetchAll({
            require: false
        })
        .then(result => {
            let valaueAfterMapping = [];
            if (result != null) {
                let data = JSON.parse(JSON.stringify(result));
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

                        let keyData = 'Mv'+num+'_date'
                        let keyDataMax = 'Mv'+num+'_max'
                        let keyDataMin = 'Mv'+num+'_min'
                        if(dateMappingSelectedmv1 != "" && num == 1){
                            if(dateMappingSelectedmv1 == dataMapping.date[keyData]){
                                if(val >= parseFloat(dataMapping.max[keyDataMax])  && val <= parseFloat(dataMapping.min[keyDataMin])){
                                    valaueAfterMapping[index] = (((parseFloat(val) - dataMapping.min[keyDataMin]) / (dataMapping.min[keyDataMin] - dataMapping.max[keyDataMax])) * 100).toFixed(2)
                                } else if (val < parseFloat(dataMapping.max[keyDataMax])) {
                                    valaueAfterMapping[index] = 100;
                                } else if (val > parseFloat(dataMapping.min[keyDataMin])) {
                                    valaueAfterMapping[index] = 0;
                                }

                            }
                         }
                        if(dateMappingSelectedmv2 != ""  && num == 2){
                            if(dateMappingSelectedmv2 == dataMapping.date[keyData]){
                                if(val >= parseFloat(dataMapping.max[keyDataMax])  && val <= parseFloat(dataMapping.min[keyDataMin])){
                                    valaueAfterMapping[index] = (((parseFloat(val) - dataMapping.min[keyDataMin]) / (dataMapping.min[keyDataMin] - dataMapping.max[keyDataMax])) * 100).toFixed(2)
                                } else if (val < parseFloat(dataMapping.max[keyDataMax])) {
                                    valaueAfterMapping[index] = 100;
                                } else if (val > parseFloat(dataMapping.min[keyDataMin])) {
                                    valaueAfterMapping[index] = 0;
                                }
                            }
                        }
                        if(dateMappingSelectedmv3 != "" &&  num == 3){
                            if(dateMappingSelectedmv3 == dataMapping.date[keyData]){
                                if(val >= parseFloat(dataMapping.max[keyDataMax])  && val <= parseFloat(dataMapping.min[keyDataMin])){
                                    valaueAfterMapping[index] = (((parseFloat(val) - dataMapping.min[keyDataMin]) / (dataMapping.min[keyDataMin] - dataMapping.max[keyDataMax])) * 100).toFixed(2)
                                } else if (val < parseFloat(dataMapping.max[keyDataMax])) {
                                    valaueAfterMapping[index] = 100;
                                } else if (val > parseFloat(dataMapping.min[keyDataMin])) {
                                    valaueAfterMapping[index] = 0;
                                }
                            }
                        }
                    })
                })

            }
            return res.status(201).json({ type: "success", valMapping: valaueAfterMapping })
        }).catch((error) => {
            console.log(error)
        });
}

const mappingMvHistory = async (key, val, date, sensor_id) => {
    return await new DataMapping()
             .query((qb) => qb.where('deleted_at', null).andWhere('sensor_id','=',sensor_id))
             .fetchAll({
                 require: false
             })
             .then(result => {
                 let valaueAfterMapping = val;
                 if(result != null){
                 let data = JSON.parse(JSON.stringify(result));
                 let arrayDatemv1 = [];
                 let arrayDatemv2 = [];
                 let arrayDatemv3 = [];
                 data.map(dataMapping => {
                     if(key == 'Mv1'){
                         arrayDatemv1.push(dataMapping.date['Mv1_date'])
                     }
                     if(key == 'Mv2'){
                         arrayDatemv2.push(dataMapping.date['Mv2_date'])
                     }
                     if(key == 'Mv3'){
                         arrayDatemv3.push(dataMapping.date['Mv3_date'])
                     }  
                 })
                 let dateMappingSelectedmv1 = "";
                 let dateMappingSelectedmv2 = "";
                 let dateMappingSelectedmv3 = "";
                 if(arrayDatemv1.length > 0){
                     arrayDatemv1.push(date.slice(0, 10));
                     arrayDatemv1.sort();
                     arrayDatemv1.map((dateMapping, i) => {
                         if(dateMapping == date.slice(0, 10)){
                             if(typeof arrayDatemv1[i-1] !== "undefined"){
                                 dateMappingSelectedmv1 = arrayDatemv1[i-1]
                             }
                         }
                     })
                     
                 }
                 if(arrayDatemv2.length > 0){
                     arrayDatemv2.push(date.slice(0, 10));
                     arrayDatemv2.sort();
                     arrayDatemv2.map((dateMapping, i) => {
                         if(dateMapping == date.slice(0, 10)){
                             if(typeof arrayDatemv2[i-1] !== "undefined"){
                                 dateMappingSelectedmv2 = arrayDatemv2[i-1]
                             }
                         }
                     })
                 }
                 if(arrayDatemv3.length > 0){
                     arrayDatemv3.push(date.slice(0, 10));
                     arrayDatemv3.sort();
                     arrayDatemv3.map((dateMapping, i) => {
                         if(dateMapping == date.slice(0, 10)){
                             if(typeof arrayDatemv3[i-1] !== "undefined"){
                                 dateMappingSelectedmv3 = arrayDatemv3[i-1]
                             }
                         }
                     })
                     
                 }
                 
                 data.map(dataMapping => {
                     let keyData = key+'_date'
                     let keyDataMax = key+'_max'
                     let keyDataMin = key+'_min'
 
                     
                     if(dateMappingSelectedmv1 != "" && key == 'Mv1'){
                        if(dateMappingSelectedmv1 == dataMapping.date[keyData]){
                            if(val >= parseFloat(dataMapping.max[keyDataMax])  && val <= parseFloat(dataMapping.min[keyDataMin])){
                                 valaueAfterMapping =  (((parseFloat(val) - dataMapping.min[keyDataMin]) / (dataMapping.max[keyDataMax] - dataMapping.min[keyDataMin])) * 100).toFixed(2)
                          
                                }else if (val < parseFloat(dataMapping.max[keyDataMax])) {
                                    valaueAfterMapping = 100;
                                } else if (val > parseFloat(dataMapping.min[keyDataMin])) {
                                    valaueAfterMapping = 0;
                                }
                        }
                    }
                    if(dateMappingSelectedmv2 != ""  && key == 'Mv2'){
                        if(dateMappingSelectedmv2 == dataMapping.date[keyData]){
                            if(val >= parseFloat(dataMapping.max[keyDataMax])  && val <= parseFloat(dataMapping.min[keyDataMin])){
                                valaueAfterMapping =  (((parseFloat(val) - dataMapping.min[keyDataMin]) / (dataMapping.max[keyDataMax] - dataMapping.min[keyDataMin])) * 100).toFixed(2)
                            }else if (val < parseFloat(dataMapping.max[keyDataMax])) {
                                valaueAfterMapping = 100;
                            } else if (val > parseFloat(dataMapping.min[keyDataMin])) {
                                valaueAfterMapping = 0;
                            }
                        }
                    }
                    if(dateMappingSelectedmv3 != "" &&  key == 'Mv3'){
                        if(dateMappingSelectedmv3 == dataMapping.date[keyData]){
                            if(val >= parseFloat(dataMapping.max[keyDataMax])  && val <= parseFloat(dataMapping.min[keyDataMin])){
                                valaueAfterMapping =  (((parseFloat(val) - dataMapping.min[keyDataMin]) / (dataMapping.max[keyDataMax] - dataMapping.min[keyDataMin])) * 100).toFixed(2)
                            }else if (val < parseFloat(dataMapping.max[keyDataMax])) {
                                valaueAfterMapping = 100;
                            } else if (val > parseFloat(dataMapping.min[keyDataMin])) {
                                valaueAfterMapping = 0;
                            }
                        }
                    }


                 })
                 
             }
               return valaueAfterMapping.toString();  
             }).catch((error)=> {
                 console.log(error)
             });
 }

function addHours(numOfHours, date) {
    date.setTime(date.getTime() + numOfHours * 60 * 60 * 1000);

    return date;
}

const updateSensorsApiByUser = async (req, res) => {
    const userUid = req.body.userUid;
    const fieldUid = req.body.fieldUid;

    let field_id = ""

    if (!userUid || userUid == "") return res.status(404).json({ type: "danger", message: "no_user" });
    if(fieldUid && fieldUid !== "" && fieldUid !=="0" ){
        const field = await new Field({'uid': fieldUid, deleted_at: null})
        .fetch({require: false})
        .then(async result => {
            if (result === null) return res.status(404).json({ type:"danger", message: "no_field"});
            field_id = result.get('id')
        });  

    }
    try {
       if(field_id ===""){
           const user = await new User({ 'uid': userUid })
           .fetch({
             withRelated: [
               {
                 'sensors': (qb) => {
                   return qb.where('deleted_at', null).andWhere('synchronized', '=', '1');
                 },
                 'sensors.dataMapping': (qb) => {
                   return qb.where('deleted_at', null);
                 }
               }
             ],
             require: false
           });
       
   //   const user = await new User({ 'uid': userUid })
   //     .fetch({
   //       withRelated: [
   //         {
   //           'sensors': (qb) => {
   //             return qb.where('deleted_at', null).andWhere('field_id', '=', field_id).andWhere('synchronized', '=', '1');
   //           },
   //           'sensors.dataMapping': (qb) => {
   //             return qb.where('deleted_at', null);
   //           }
   //         }
   //       ],
   //       require: false
   //     });
 
     if (!user) {
       return res.status(404).json({ type: "danger", message: "no_user" });
     }
 
     const data = user.related('sensors');
     const sensors = JSON.parse(JSON.stringify(data));
     if (!data || data.length === 0) {
       return res.status(200).json({ sensors: [], dataMapping: [] });
     }
 
     let aggregatedSensorData = [];
 
     for (const item of data) {
       let codeSensor = item.get('code').replace(/\n|\r/g, '');
       if (codeSensor != "") {
         try {
           const response = await fetch(`http://cp.smartfarm.com.tn/api/sensor/last-topic/${codeSensor}`);
           const resultApi = await response.json();
           
           let time = "";
           let code = "";
           let temperature = "";
           let humidity = "";
           let pressure = "";
           let charge = "";
           let signal = "";
           let adc = "";
           let ts = "";
           let mv1 = "";
           let mv2 = "";
           let mv3 = "";
           let altitude = "";
 
           if (resultApi && resultApi.length > 0) {
             const dataResponseApi = resultApi[0];
             time = dataResponseApi.time;
             code = dataResponseApi.ref;
             temperature = dataResponseApi.temperature;
             humidity = dataResponseApi.humidity;
             pressure = dataResponseApi.pressure;
             charge = dataResponseApi.charge;
             signal = dataResponseApi.signal
             adc = dataResponseApi.adc;
             ts = dataResponseApi.ts;
             mv1 = dataResponseApi.mv1;
             mv2 = dataResponseApi.mv2;
             mv3 = dataResponseApi.mv3;
             altitude = dataResponseApi.altitude;
           }
 
           aggregatedSensorData.push({
             time,
             code,
             temperature,
             humidity,
             pressure,
             charge,
             signal,
             adc,
             ts,
             mv1,
             mv2,
             mv3,
             altitude,
             sensor_id: item.get('id')
           });
       
         } catch (error) {
           console.log(error);
           return res.status(500).json({ type: "danger", message: error });
         }
       }
     }
     let dataMapping = [];
     for (const sensor of sensors) {
       if (sensor.dataMapping && Array.isArray(sensor.dataMapping) && sensor.dataMapping.length > 0) {
         dataMapping.push(...sensor.dataMapping);
       }
     }
     return res.status(200).json({ sensors: aggregatedSensorData, dataMapping });

       } else {
         const user = await new User({ 'uid': userUid })
    .fetch({
      withRelated: [
        {
          'sensors': (qb) => {
            return qb.where('deleted_at', null).andWhere('field_id', '=', field_id).andWhere('synchronized', '=', '1');
          },
          'sensors.dataMapping': (qb) => {
            return qb.where('deleted_at', null);
          }
        }
      ],
      require: false
    });

  if (!user) {
    return res.status(404).json({ type: "danger", message: "no_user" });
  }

  const data = user.related('sensors');
  const sensors = JSON.parse(JSON.stringify(data));
  if (!data || data.length === 0) {
    return res.status(200).json({ sensors: [], dataMapping: [] });
  }

  let aggregatedSensorData = [];

  for (const item of data) {
    let codeSensor = item.get('code').replace(/\n|\r/g, '');
    if (codeSensor != "") {
      try {
        const response = await fetch(`http://cp.smartfarm.com.tn/api/sensor/last-topic/${codeSensor}`);
        const resultApi = await response.json();
        
        let time = "";
        let code = "";
        let temperature = "";
        let humidity = "";
        let pressure = "";
        let charge = "";
        let signal = "";
        let adc = "";
        let ts = "";
        let mv1 = "";
        let mv2 = "";
        let mv3 = "";
        let altitude = "";

        if (resultApi && resultApi.length > 0) {
          const dataResponseApi = resultApi[0];
          time = dataResponseApi.time;
          code = dataResponseApi.ref;
          temperature = dataResponseApi.temperature;
          humidity = dataResponseApi.humidity;
          pressure = dataResponseApi.pressure;
          charge = dataResponseApi.charge;
          signal = dataResponseApi.signal;
          adc = dataResponseApi.adc;
          ts = dataResponseApi.ts;
          mv1 = dataResponseApi.mv1;
          mv2 = dataResponseApi.mv2;
          mv3 = dataResponseApi.mv3;
          altitude = dataResponseApi.altitude;
        }

        aggregatedSensorData.push({
          time,
          code,
          temperature,
          humidity,
          pressure,
          charge,
          signal,
          adc,
          ts,
          mv1,
          mv2,
          mv3,
          altitude,
          sensor_id: item.get('id')
        });
    
      } catch (error) {
        console.log(error);
        return res.status(500).json({ type: "danger", message: error });
      }
    }
  }
  let dataMapping = [];
  for (const sensor of sensors) {
    if (sensor.dataMapping && Array.isArray(sensor.dataMapping) && sensor.dataMapping.length > 0) {
      dataMapping.push(...sensor.dataMapping);
    }
  }
  return res.status(200).json({ sensors: aggregatedSensorData, dataMapping });
       }
    } catch (error) {
      console.log(error);
      return res.status(500).json({ type: "danger", message: error });
    }
  }
  
//   const updateSensorsApiByUser = async (req, res) => {
//     const userUid = req.body.userUid;
//     if (!(userUid) || userUid == "") return res.status(404).json({ type: "danger", message: "no_user" });
//     let user_id = "";
//     try {
//         const user = await new User({ 'uid': userUid })
//             .fetch({ withRelated: [{ 'sensors': (qb) => { qb.where('deleted_at', null).andWhere('synchronized', '=', '1') }
//         ,'sensors.dataMapping': (qb) => { qb.where('deleted_at', null); }
    
//     }], require: false })
//             .then(async result => {
//                 if (result == null) {
//                     return res.status(404).json({ type: "danger", message: "no_user" });
//                 }
//                 let data = result.related('sensors');
//                 user_id = result.get('id');
//                 data = JSON.parse(JSON.stringify(data));
                
//                 if (data != null) {
//                     let dailyDates = []
//                     let hourlyDates = []
//                     let dailyTerrestRad = []
//                     let dailyDirectRad = []
//                     let dailyDiffRad = []
//                     let arrRad = []
//                     let arrET0 = []

//                     await fetch(`https://api.open-meteo.com/v1/forecast?latitude=36.86&longitude=10.27&timezone=GMT&daily=et0_fao_evapotranspiration&hourly=direct_radiation,diffuse_radiation,terrestrial_radiation`)
//                         .then((res) => res.json())
//                         .then((jsonData) => {
//                             if (jsonData) {
//                                 dailyDates = jsonData.daily.time
//                                 dailyET0 = jsonData.daily.et0_fao_evapotranspiration
//                                 hourlyDates = jsonData.hourly.time
//                                 dailyDirectRad = jsonData.hourly.direct_radiation
//                                 dailyTerrestRad = jsonData.hourly.terrestrial_radiation
//                                 dailyDiffRad = jsonData.hourly.diffuse_radiation
//                             }
//                             var sum = dailyDirectRad.map((num, idx) => {
//                                 return (num + dailyDiffRad[idx]) - dailyTerrestRad[idx];
//                             });
//                             for (let index = 0; index < hourlyDates.length; index++) {
//                                 arrRad.push({
//                                     date: hourlyDates[index],
//                                     radiation: sum[index],
//                                 });

//                             }
//                             for (let index = 0; index < dailyDates.length; index++) {
//                                 arrET0.push({
//                                     date: dailyDates[index],
//                                     ET0: dailyET0[index],
//                                 });

//                             }

//                         });

//                     await data.map(async item => {
//                         // let sensorLat = item.Latitude
//                         // let sensorLon = item.Longitude
//                         // let locationData = null
//                         // await fetch(`https://api.wheretheiss.at/v1/coordinates/${sensorLat},${sensorLon}`)
//                         // .then((response) => response.json())
//                         // .then((data) => 
//                         //         locationData = data
//                         // );
//                         let codeSensor = item['code'].replace(/\n|\r/g, '');
//                         let sensor_id = item['id'];
//                         if (codeSensor != "") {
//                             const response = fetch(`http://54.38.183.164:5000/api/sensor/last-topic/${codeSensor}`)
//                                 .then(response => response.json())
//                                 .then(async resultApi => {
//                                     let time = ""
//                                     let code = ""
//                                     let temperature = ""
//                                     let humidity = ""
//                                     let pressure = ""
//                                     let charge = ""
//                                     let adc = ""
//                                     let ts = ""
//                                     let mv1 = ""
//                                     let mv2 = ""
//                                     let mv3 = ""
//                                     let altitude = ""
//                                     if (resultApi != null) {
//                                         resultApi.map(dataResponseApi => {
//                                             time = dataResponseApi.time;
//                                             code = dataResponseApi.ref;
//                                             temperature = dataResponseApi.temperature;
//                                             humidity = dataResponseApi.humidity;
//                                             pressure = dataResponseApi.pressure;
//                                             charge = dataResponseApi.charge;
//                                             adc = dataResponseApi.adc;
//                                             ts = dataResponseApi.ts;
//                                             mv1 = dataResponseApi.mv1;
//                                             mv2 = dataResponseApi.mv2;
//                                             mv3 = dataResponseApi.mv3;
//                                             altitude = dataResponseApi.altitude;
//                                         })
//                                     }
//                                     return res.status(200).json({ sensors: 
//                                         {
//                                         time: time,
//                                         code: code,
//                                         temperature: temperature,
//                                         humidity: humidity,
//                                         pressure: pressure,
//                                         charge: charge,
//                                         adc: adc,
//                                         ts: ts,
//                                         mv1: mv1,
//                                         mv2: mv2,
//                                         mv3: mv3,
//                                         altitude: altitude,
//                                         sensor_id: sensor_id
//                                     },
//                                     dataMapping: item.dataMapping
                                        
//                                     });
//                                 })
//                                 .catch((error) => {
//                                     console.log(error)
//                                     return res.status(500).json({ type: "danger", message: error });
//                                 });
//                         }
//                     })
//                 }

//             });
//     } catch (error) {
//         console.log(error)
//         return res.status(500).json({ type: "danger", message: error });
//     }
// }


  

const getSensorsHistory = async (req, res) => {
    let codeSensor = req.params.codeSensor;
    let dateStart = req.params.dateStart;
    let dateEnd = req.params.dateEnd;
let dateEndPlusOneDay = new Date(dateEnd);
dateEndPlusOneDay.setDate(dateEndPlusOneDay.getDate() + 1);
dateEndPlusOneDay = dateEndPlusOneDay.toISOString().split('T')[0];
    let pageNum = req.query.pageNum || 1;
    let limit = req.query.limit || 60;
    try {
      if (codeSensor != "") {
        let sensor_id = "";
        let dataMappingObject = {};
        const sensor = await new Sensor({
          code: codeSensor,
          deleted_at: null,
        })
          .fetch({
            withRelated: [
              {
                dataMapping: (qb) => {
                  qb.where("deleted_at", null);
                },
              },
            ],
            require: false,
          })
          .then(async (result) => {
            if (result === null)
              return res
                .status(404)
                .json({ type: "danger", message: "no_sensor_selected" });
            sensor_id = result.get("id");
            let dataMapping = result.related("dataMapping");
            dataMappingObject = JSON.parse(JSON.stringify(dataMapping));
          });
        const response = fetch(
          `http://cp.smartfarm.com.tn/api/sensor/filter-topic/${codeSensor}/${dateStart}/${dateEndPlusOneDay}/${pageNum}/${limit}`
        )
          .then((response) => response.json())
          .then( async (resultApi) => {
            if (resultApi != null) {
              const totalRows = resultApi.count;
              const totalPages = Math.ceil(totalRows / limit);
              const nextPage = pageNum < totalPages ? pageNum + 1 : null;
              const prevPage = pageNum > 1 ? pageNum - 1 : null;
              let dataSensor = resultApi.rows 

              let allDataSensor = [];
              await Promise.all(
                dataSensor.map(async (data) => {
                  const Mv1 = await mappingMvHistory(
                    "Mv1",
                    data.mv1,
                    data.time,
                    sensor_id
                  );
                  const Mv2 = await mappingMvHistory(
                    "Mv2",
                    data.mv2,
                    data.time,
                    sensor_id
                  );
                  const Mv3 = await mappingMvHistory(
                    "Mv3",
                    data.mv3,
                    data.time,
                    sensor_id
                  );
  
                  allDataSensor.push({
                    ref: data.ref,
                    time: data.time,
                    charge: data.charge,
                    day_num: data.day_num,
                    temperature: Number(data.temperature),
                    humidity: Number(data.humidity),
                    pressure: Number(data.pressure),
                    altitude: Number(data.altitude),
                    adc: data.adc,
                    ts: data.ts,
                    niv1:data.mv1,
                    niv2:data.mv2,
                    niv3:data.mv3,
                    mv1: Number(Mv1),
                    mv2: Number(Mv2),
                    mv3: Number(Mv3),
                  });
                })
              );
              allDataSensor.sort((a, b) => b.time.localeCompare(a.time));

              return res.status(201).json({
                type: "success",
                history: allDataSensor,
                sensor_id: sensor_id,
                dataMapping: dataMappingObject,
                totalPages: totalPages,
                totalRows: totalRows,
                nextPage: nextPage,
                prevPage: prevPage,
              });
            }
          })
          .catch((error) => {
            console.log(error);
            return res
              .status(500)
              .json({ type: "danger", message: "error_get_data" });
          });
      }
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .json({ type: "danger", message: "error_get_history" });
    }
  };
  

const getSunRadiation = async (req, res) => {
    let dailyDates = []
    let dailyHourly = []
    let dailyTerrestRad = []
    let dailyDirectRad = []
    let dailyDiffRad = []
    let dataET0 = []
    try {
        await fetch(`https://api.open-meteo.com/v1/forecast?latitude=36.86&longitude=10.27&timezone=GMT&daily=et0_fao_evapotranspiration&hourly=direct_radiation,diffuse_radiation,terrestrial_radiation`)
            .then((response) => response.json())
            .then((jsonData) => {
                dailyDates = jsonData.daily.time
                dailyET0 = jsonData.daily.et0_fao_evapotranspiration
                dailyHourly = jsonData.hourly.time
                dailyDirectRad = jsonData.hourly.direct_radiation
                dailyTerrestRad = jsonData.hourly.terrestrial_radiation
                dailyDiffRad = jsonData.hourly.diffuse_radiation

            });
        var sum = dailyDirectRad.map((num, idx) => {

            return (num + dailyDiffRad[idx]) - dailyTerrestRad[idx];
        });
        for (let index = 0; index < dailyDates.length; index++) {
            dataET0.push({
                date: dailyDates[index],
                ET0: dailyET0[index],
            });

        }
        return res.status(201).json({ type: "success", radiation: sum, dateTime: dailyDates, ET0: dataET0 });
    } catch (error) {
        return res.status(500).json({ type: "danger", message: "error_user" });

    }
}


const getSingleSensor = async (req, res) => {
    const sensor_uid = req.body.sensor_uid;
    const uid = req.userUid
    try {
        const user = await new User({ 'uid': uid })
            .fetch({ withRelated: [{ 'sensors': (qb) => { qb.where('uid', sensor_uid); } }], require: false })
            .then(async result => {
                if (result === null) return res.status(404).json({ type: "danger", message: "no_user_sensor" });
                return res.status(201).json({ sensor: result.related('sensors') });
            });
    } catch (error) {
        return res.status(500).json({ type: "danger", message: "error_user" });
    }
}




const getSensorsByField = async (req, res) => {
    let fieldUid = req.params.uid;
    if (!(fieldUid) || fieldUid == "") return res.status(404).json({ type: "danger", message: "no_field" });

    try {
        const field = new Field({ 'uid': fieldUid, deleted_at: null })
            .fetch({ withRelated: [{ 'sensors': (qb) => { qb.where('deleted_at', null); } }], require: false })
            .then(async result => {
                if (result === null) return res.status(404).json({ type: "danger", message: "no_field" });
                if (result) {
                    return res.status(201).json({ sensors: result.related('sensors') });
                }
            }).catch(err => {
                return res.status(500).json({ type: "danger", message: 'error_get_sensors' });
            });
    } catch (error) {
        return res.status(500).json({ type: "danger", message: error });
    }
}

const searchSensorsByCode = async (req, res) => {
    const code = req.body.code;
    if (!(code) || code == "") return res.status(404).json({ type: "danger", message: "no_sensor_code" });


    try {
        const sensor = await new Sensor.getSensorByCode(code)
            .then(async result => {
                if (result === null) return res.status(404).json({ type: "danger", message: "no_sensor" });
                if (result) {
                    return res.status(201).json({ sensors: result });
                }
            }).catch(err => {
                return res.status(500).json({ type: "danger", message: 'error_get_sensors' });
            });
    } catch (error) {
        return res.status(500).json({ type: "danger", message: error });
    }
}

//TODO ADMIN ACTION
const getSensorsByUser = async (req, res) => {
    let userUid = req.params.uid;
    if (!(userUid) || userUid == "") return res.status(404).json({ type: "danger", message: "no_user" });

    try {
        const user = new User({ 'uid': userUid, deleted_at: null })
            .fetch({ withRelated: [{ 'sensors': (qb) => { qb.where('deleted_at', null); } }], require: false })
            .then(async result => {
                if (result === null) return res.status(404).json({ type: "danger", message: "no_user" });
                if (result) {
                    return res.status(201).json({ sensors: result.related('sensors') });
                }
            }).catch(err => {
                return res.status(500).json({ type: "danger", message: 'error_get_sensors' });
            });
    } catch (error) {
        return res.status(500).json({ type: "danger", message: "error_user" });
    }
}

const addSensor = async (req, res) => {

    if (!(req.body.field_uid) || req.body.field_uid == "") return res.status(404).json({ type: "danger", message: "no_field_selected" });

    const { code, field_uid, user_uid, zone_uid, Latitude, Longitude } = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(422).json({ errors: errors.array() });
        return;
    }
    let user_id_sensor = "";
    const user = await new User({ 'uid': user_uid, deleted_at: null })
        .fetch({ require: false })
        .then(async result => {
            if (result === null) return res.status(404).json({ type: "danger", message: "no_user_selected" });
            user_id_sensor = result.get('id');
        });
    let zone_id = "";
    const zone = await new Zone({ 'uid': zone_uid, deleted_at: null })
        .fetch({ require: false })
        .then(async result => {
            if (result === null) return res.status(404).json({ type: "danger", message: "no_zone_selected" });
            zone_id = result.get('id');
        });

    try {
        const field = new Field({ 'uid': field_uid, deleted_at: null })
            .fetch({ require: false })
            .then(async result => {
                if (result === null) return res.status(404).json({ type: "danger", message: "no_field" });
                if (result) {
                    const sensor = await new Sensor({ 'code': code, deleted_at: null })
                        .fetch({ require: false })
                        .then(async response => {
                            if (response === null) return res.status(404).json({ type: "danger", message: "no_sensor" });
                            if (response) {
                                response.set({ user_id: user_id_sensor, zone_id: zone_id, field_id: result.get('id'), Latitude, Longitude });
                                response.save()
                                    .then((sensor) => {
                                        return res.status(201).json({ type: "success", Sensor: sensor });
                                    }).catch(err => {
                                        return res.status(500).json({ type: "danger", message: "error_edit_sensor" });
                                    });
                            }
                        });
                }
            });
    } catch (error) {
        res.status(500).json({ type: "danger", message: "error_user" });
    }
}

const editSensor = async (req, res) => {

    const { code, user_uid, sensor_uid , field_id , zone_id } = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(422).json({ errors: errors.array() });
        return;
    }
    let user_id_sensor = "";
    const user = await new User({ 'uid': user_uid, deleted_at: null })
        .fetch({ require: false })
        .then(async result => {
            if (result === null) return res.status(404).json({ type: "danger", message: "no_user_selected" });
            user_id_sensor = result.get('id');
        });
    
    try {
        const sensor = new Sensor({ 'uid': sensor_uid, deleted_at: null })
            .fetch({ require: false })
            .then(async result => {
                if (result === null) return res.status(404).json({ type: "danger", message: "no_field" });
                if (result) {
                    result.set({ code, user_id: user_id_sensor,zone_id:zone_id,field_id: field_id});
                    result.save()
                        .then((result) => {
                            return res.status(201).json({ type: "success", Sensor: result });
                        }).catch(err => {
                            return res.status(500).json({ type: "danger", message: "error_edit_sensor" });
                        });
                }
            });
    } catch (error) {
        res.status(500).json({ type: "danger", message: "error_user" });
    }
}

const deleteSensor = async (req, res) => {
    let sensor_uid = req.body.sensor_uid;
    try {
        const sensor = new Sensor({ 'uid': sensor_uid })
            .fetch({ require: false })
            .then(async result => {
                if (result === null) return res.status(404).json({ type: "danger", message: "no_sensor" });
                if (result) {
                    result.set({ deleted_at: new Date() });
                    result.save()
                    return res.status(201).json({ type: "success", message: 'sensor_deleted' });
                }
            }).catch(err => {
                console.log(err)
                return res.status(500).json({ type: "danger", message: err });
            });
    } catch (error) {
        return res.status(500).json({ type: "danger", message: "error_sensor" });
    }
}

const activateSynch = async (req, res) => {
    let sensor_uid = req.body.sensor_uid
    try {
        const sensor = await new Sensor({ 'uid': sensor_uid })
            .fetch({ require: false })
            .then(async result => {
                if (result === null) return res.status(500).json({ type: "danger", message: "no_sensor" });
                result.set({ synchronized: '1' });
                result.save()
                    .then((result) => {
                        return res.status(201).json({ type: "success", message: "synchronized Activated" });
                    }).catch(err => {
                        return res.status(500).json({ type: "danger", message: "error_activate_synchronized" });
                    });
            })
    } catch (error) {
        return res.status(500).json({ type: "danger", message: "error_get_synchronized" });
    }
}




const search = function search(index, body) {
    return client.search({ index: index, body: body });
};
// const getDataSensorFromElastic = async (req, res) => {
//     if(!(req.body.sensor_code) || req.body.sensor_code == "") return res.status(404).json({ type:"danger", message: "no_sensor_selected"});
//     let sensor_code = req.body.sensor_code
//     let startDate = req.body.startDate ; 
//     let endDate = req.body.endDate;
//     let title = req.body.title;


//         client.ping({
//         requestTimeout: 30000,
//         }, function(error) {
//         if (error) {
//             return res.status(404).json({ type:"error", message: error });
//         } else {
//             let obj = [];
//             sensor_code.forEach(element => {
//                 obj.push({"match":{
//                     "code" : element
//                   }})

//             });
//         let body = {
//             size: 20,
//             from: 0,
//             query: {
//                 bool : {
//                     "should": obj,
//                     "filter": [{
//                         range: {
//                             dateTime: {
//                               gte: startDate,
//                               lte: endDate
//                             }
//                         }
//                     }]                
//             }
//             }
//           };

//           search('index-sonsor', body)
//           .then(results => {
//             var list = [];
//             if (results.hits.total.value > 0){
//                 results.hits.hits.forEach((hit, index) => list.push(hit._source));
//             }
//             return res.status(201).json({ type:"success", result: list, title:title });
//         })
//           .catch(console.error);


//         }
//     });
// }

const addSensorPosition = async (req, res) => {
    const { Latitude, Longitude, sensor_uid } = req.body

    try {
        const sensor = new Sensor({ 'uid': sensor_uid, deleted_at: null })
            .fetch({ require: false })
            .then(async result => {
                result.set({ Latitude, Longitude })
                result.save()
                    .then((result) => {
                        return res.status(201).json({ type: "success", Sensor: result });
                    }).catch(err => {
                        return res.status(500).json({ type: "danger", message: "error_save_sensor" });
                    });

            })

    } catch (error) {
        res.status(500).json({ type: "danger", message: "error_get_sensor" });
    }
}
/*const updateSensorsApiByUserSocket = async(userUid) => {

    return await new User({'uid': userUid})
    .fetch({withRelated: [{'sensors': (qb) => { qb.where('deleted_at', null).andWhere('synchronized','=','1'); }}, {'sensors.sensorsData': (qb) => { qb.where('deleted_at', null).orderBy('id','DESC'); }}], require: false})
    .then( result => {
        const data = result.related('sensors');
        return data;
    })
    .then( result => {
            const data = result.related('sensors');
            return data;
        })*/
/*const response = await fetch(`http://54.38.183.164:5000/api/sensor/last-topic/4C:11:AE:E8:13:80`);
const result = await response.json();
                    
return result;
}*/
const updateSensorsApiByUserSocket = (userUid) => {
    if (!(userUid) || userUid == "") return "no_user";
    let user_id = "";

    try {
        new User({ 'uid': userUid })
            .fetch({ withRelated: [{ 'sensors': (qb) => { qb.where('deleted_at', null).andWhere('synchronized', '=', '1'); } }, { 'sensors.sensorsData': (qb) => { qb.where('deleted_at', null).orderBy('id', 'DESC'); } }], require: false })
            .then(async result => {
                if (result == null) return "no_user";
                let data = result.related('sensors');
                user_id = result.get('id');
                data = JSON.parse(JSON.stringify(data));
                if (data != null) {
                    data.map(item => {
                        let codeSensor = item['code'].replace(/\n|\r/g, '');
                        let sensor_id = item['id'];
                        if (codeSensor != "") {
                            const response = fetch(`${process.env.API_SENSOR}/${codeSensor}`)
                                .then(response => response.json())
                                .then(resultApi => {
                                    if (resultApi != null) {
                                        resultApi.map(dataResponseApi => {
                                            let time = ""
                                            let code = ""
                                            let temperature = ""
                                            let humidity = ""
                                            let pressure = ""
                                            let charge = ""
                                            let adc = ""
                                            let ts = ""
                                            let mv1 = ""
                                            let mv2 = ""
                                            let mv3 = ""
                                            let altitude = ""
                                            const dataSensor = new Datasensor({ 'code': codeSensor, 'user_id': user_id })
                                                .fetch({ require: false })
                                                .then(resultDataSensorTable => {
                                                    if (resultDataSensorTable == null) {
                                                        time = dataResponseApi.time;
                                                        code = dataResponseApi.ref;
                                                        temperature = dataResponseApi.temperature;
                                                        humidity = dataResponseApi.humidity;
                                                        pressure = dataResponseApi.pressure;
                                                        charge = dataResponseApi.charge;
                                                        adc = dataResponseApi.adc;
                                                        ts = dataResponseApi.ts;
                                                        mv1 = dataResponseApi.mv1;
                                                        mv2 = dataResponseApi.mv2;
                                                        mv3 = dataResponseApi.mv3;
                                                        altitude = dataResponseApi.altitude;

                                                    }
                                                    if (time != "") {
                                                        new Datasensor({ sensor_id: sensor_id, user_id: user_id, time, code, temperature, humidity, pressure, charge, adc, ts, mv1, mv2, mv3, altitude }).save()
                                                            .catch(err => {
                                                                return "danger";
                                                            });
                                                    }

                                                })
                                        })

                                    }
                                })
                                .catch((error) => {
                                    return "here2";
                                });
                        }
                    })
                }

            });
        return new User({ 'uid': userUid })
            .fetch({ withRelated: [{ 'sensors': (qb) => { qb.column('id', 'code', 'user_id'); qb.where('deleted_at', null); } }, { 'sensors.sensorsData': (qb) => { qb.where('deleted_at', null); qb.orderBy('id', 'DESC'); qb.limit(1); } }], require: false })
            .then(async result => {

                if (result == null) return "danger"
                let data = result.related('sensors');
                return JSON.parse(JSON.stringify(data));
            }).catch((error) => {
                return error;
            });

    } catch (error) {
        return error;
    }
}

const getSingleSensorAllData = async (req, res) => {
    const sensor_id  = req.params.id;
    try {
        const sensor = await new Sensor({'id': sensor_id})
        .fetch({withRelated : [{"dataMapping" :(qb) => { qb.where('deleted_at', null); }}], require: false})
        .then(async result => {
            if (result === null) return res.status(404).json({ type:"danger", message: "no_user_sensor"});
            let resultSesnor = JSON.parse(JSON.stringify(result))
            let sensorLat = resultSesnor.Latitude
            let sensorLon = resultSesnor.Longitude
            let locationData = null
            await fetch(`https://api.wheretheiss.at/v1/coordinates/${sensorLat},${sensorLon}`)
            .then((response) => response.json())
            .then((data) => 
                    locationData = data
            );
            let supplier_id = result.get('supplier_id')
            let supplierData = null;
            if(supplier_id != null){
                await new User({'supplier_id': supplier_id}).fetch({require: false})
                .then(async data => {
                    supplierData = data;
                });
            }
            return res.status(201).json({ sensor: result, user: supplierData , location : locationData});
        }); 
    } catch (error) {
        console.log(error)
        return res.status(500).json({ type:"danger", message: "error_user" });
    }
}

const editDataMappingByUser = async (req,res) => {
    const {code , frequency,dataMapping,sensor_id,lat,lon} = req.body;
    try {
        const sensor = await new DataMapping({ 'sensor_id' : sensor_id , deleted_at: null})
        .fetch({require: false})
        .then(async result => {
            console.log(result)
            if (result === null) {
                let dataFetch = {ref : code.trim() , frequence:frequency}
                await fetch(`http://cp.smartfarm.com.tn/api/sensor/config/create`,{method : 'POST' ,body :  JSON.stringify(dataFetch), headers: { 'Content-Type': 'application/json' }})
                dataMapping && dataMapping.map(async data=>{
                    await new DataMapping({sensor_id : sensor_id, min : data.min , max :data.max ,date :data.date,frequency}).save()
                })
                return res.status(201).json({ type:"success", Sensor : result });
            }
            if(result){
                let dataFetch = {ref : code.trim() , frequence:frequency}
               await fetch(`http://cp.smartfarm.com.tn/api/sensor/config/update`,{method : 'POST' ,body :  JSON.stringify(dataFetch), headers: { 'Content-Type': 'application/json' }})
               .then((res) => {res.json()})
               .then((jsonData) => {
                    dataMapping && dataMapping.map(data=>{
                         if(data.date && data.min && data.max){
                             if(Object.keys(data.date).length == 0){
                                 data.date = null;
                             }
                             if(Object.keys(data.min).length == 0){
                                 data.min = null;
                             }
                             if(Object.keys(data.max).length == 0){
                                 data.max = null;
                             }
     
                         }
                        result.set({sensor_id : sensor_id, min : data.min , max :data.max ,date :data.date,frequency});
                         result.save()
     
                     })

                    
                })
                const sensor = new Sensor({ 'code' : code , deleted_at: null})
                .fetch({require: false})
                .then(result => {
                    if (result === null) return res.status(404).json({ type:"danger", message: "no_sensor"});
                    if(result){
                       result.set({Latitude: lat, Longitude:lon});
                        result.save()
                        
                    }
                });   
            }
            return res.status(201).json({ type:"success", Sensor : result });
            }).catch(err => {
                console.log(err)
                return res.status(500).json({ type:"danger", message: "error_edit_sensor" });
            })
    } catch (error) {
        res.status(500).json({ type:"danger", message: "error_get_sensor" });
        
    }
}

const validateSensor = (method) => {
    switch (method) {
        case 'addEdit': {
            return [
                body('code', 'code_empty').notEmpty(),
                body('user_uid', 'user_empty').notEmpty(),
                body('field_uid', 'field_empty').notEmpty()
            ]
        }
    }
}
module.exports = { getSensorsByConnectedUser, getSingleSensor, getSensorsByField, searchSensorsByCode, getSingleSensorAllData,validateSensor, addSensor, editSensor, deleteSensor, activateSynch, addSensorPosition, updateSensorsApiByUser, getSensorsHistory, updateSensorsApiByUserSocket, getSunRadiation, mappingMv , editDataMappingByUser }