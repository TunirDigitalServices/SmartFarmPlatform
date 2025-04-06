const User = require('./../../models/User.js');
const Sensor = require('./../../models/Sensor.js');
const Field = require('./../../models/Field');
const Supplier = require('../../models/Supplier.js');
const DataMapping = require('../../models/DataMapping')
const fetch = require('node-fetch');

// const getSensors = async (req, res) => {
//     try {
//         const sensor = new Sensor()
//         .query((qb) => {
//             qb.where('deleted_at', null)
//         })
//         .fetchAll({require: false})
//         .then(async sensors => {
//             return res.status(201).json({ sensors });
//         })
//     } catch (error) {
//         return res.status(500).json({ type:"danger", message: "error_get_sensors" });
//     }

// }
const getSensors = async (req, res) => {
    try {
        const sensors = await new Sensor()
            .query((qb) => {
                qb.where('deleted_at', null);
            })
            .fetchAll({ require: false });

        const sensorDataPromises = sensors.map(async (sensor) => {
            const codeSensor = sensor.get('code'); // Assuming 'code' is the property holding the sensor code
            const apiUrl = `http://cp.smartfarm.com.tn/api/sensor/last-topic/${codeSensor}`;
            const apiUrlConfig = `http://cp.smartfarm.com.tn/api/sensor/config/frequence/${codeSensor}`;


            try {
                const [responseData, responseConfig] = await Promise.all([
                    fetch(apiUrl),
                    fetch(apiUrlConfig),
                ]);
                const sensorData = await responseData.json();
                const sensorConfig = await responseConfig.json();
                return {
                    sensor: sensor.toJSON(),
                    data: sensorData[0],
                    config: sensorConfig,

                };
            } catch (error) {
                console.error(`Error fetching data for sensor ${codeSensor}:`, error);
                return {
                    sensor: sensor.toJSON(),
                    error: 'Failed to fetch data',
                };
            }
        });

        const aggregatedData = await Promise.all(sensorDataPromises);

        return res.status(201).json({ sensors: aggregatedData });
    } catch (error) {
        console.error('Error in getSensors:', error);
        return res.status(500).json({ type: 'danger', message: 'error_get_sensors' });
    }
};


const getInactiveSensors = async (req, res) => {
    try {
        const sensors = await new Sensor()
            .query((qb) => {
                qb.where('deleted_at', null);
            })
            .fetchAll({ require: false });

        const inactiveSensors = [];

        const sensorDataPromises = sensors.map(async (sensor) => {
            const codeSensor = sensor.get('code');
            const apiUrl = `http://cp.smartfarm.com.tn/api/sensor/last-topic/${codeSensor}`;
            const apiUrlConfig = `http://cp.smartfarm.com.tn/api/sensor/config/frequence/${codeSensor}`;

            try {
                const [responseData, responseConfig] = await Promise.all([
                    fetch(apiUrl),
                    fetch(apiUrlConfig),
                ]);

                const sensorData = await responseData.json();
                const sensorConfig = await responseConfig.json();

                // Extract relevant information
                if(sensorData[0]){
                    const lastDataTime = new Date(sensorData[0].time);
                    const frequency = sensorConfig.frequence * 1000;
                    const currentTime = new Date();
                    const timeStartDifference = lastDataTime.getTime() - currentTime.getTime();
                    const timeEndDifference = lastDataTime.getTime() + frequency - currentTime.getTime();
                    const timeEndAfterRange = timeEndDifference + (15 * 60 * 1000);
    
                    const sensorState = timeStartDifference < 0 && timeEndAfterRange > 0 ? 'Active' : 'Inactive';
    
                    if (sensorState === 'Inactive') {
                        // Add to the list of inactive sensors
                        inactiveSensors.push({
                            sensor: sensor.toJSON(),
                            data: sensorData[0],
                            config: sensorConfig,
                        });
                    }
    
                    return {
                        sensor: sensor.toJSON(),
                        data: sensorData[0],
                        config: sensorConfig,
                        state: sensorState,
                    };

                }
            } catch (error) {
                console.error(`Error fetching data for sensor ${codeSensor}:`, error);
                return {
                    sensor: sensor.toJSON(),
                    error: 'Failed to fetch data',
                    state: 'Unknown',
                };
            }
        });

        const aggregatedData = await Promise.all(sensorDataPromises);

        return res.status(201).json({ sensors: aggregatedData, inactiveSensors });
    } catch (error) {
        console.error('Error in getInactiveSensors:', error);
        return res.status(500).json({ type: 'danger', message: 'error_get_inactive_sensors' });
    }
};



const getSensorsByUser = async (req, res) => {
    var user_uid = req.params.uid;
    try {
        const user = await new User({'uid': user_uid})
        .fetch({withRelated: [{"sensors" :(qb) => { qb.where('deleted_at', null); }}] , require: false})
        .then(async result => {
            if (result === null) return res.status(404).json({ type:"danger", message: "no_user_sensor"});
            if(result) return res.status(201).json({ sensors: result.related('sensors') });
        });        
    } catch (error) {
        res.status(500).json({ type:"danger", message: "error_user" });
    }
}

const addSensor = async (req, res) => {
    const { code, frequency, dataMapping, simNumber, simIdentify } = req.body;
  
    try {
      const sensor = await new Sensor({ code: code, deleted_at: null }).fetch({ require: false });
  
      if (sensor !== null) {
        return res.status(404).json({ type: "danger", message: "existed_sensor" });
      }
        const newSensor = await new Sensor({ code }).save();
      const resultSensor = JSON.parse(JSON.stringify(newSensor));
      const sensor_id = resultSensor.id;
  
      if (dataMapping) {
        await Promise.all(
          dataMapping.map(async (data) => {
            await new DataMapping({
              sensor_id: sensor_id,
              min: data.min,
              max: data.max,
              date: data.date,
              frequency,
              simIdentify,
              simNumber,
            }).save();
          })
        );
      }
  
      // Making the HTTP POST request to the external API
      const dataFetch = { ref: code, frequence: frequency};
      console.log(dataFetch)
      const response = await fetch(`http://cp.smartfarm.com.tn/api/sensor/config/create`, {
        method: 'POST',
        body: JSON.stringify(dataFetch),
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) {
        const responseBody = await response.text();
        console.log(responseBody);
        return res.status(500).json({ type: "danger", message: "error_save_sensor" });
      }
  
      return res.status(201).json({ type: "success", Sensor: resultSensor });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ type: "danger", message: "error_get_sensor" });
    }
  };
  

const addMapping = async (req, res) => {
    
    const {code , frequency,dataMapping,simNumber,simIdentify} = req.body;
    try {
        const sensor = new Sensor({ 'code' : code , deleted_at: null})
        .fetch({require: false})
        .then(async result => {
            if (result === null) return res.status(404).json({ type:"danger", message: "error_sensor"});
            if (result !== null){
                    let resultSensor = JSON.parse(JSON.stringify(result))
                    let sensor_id = ""
                    if(resultSensor){
                        let dataFetch = {ref : code , frequence:frequency}
                        fetch(`http://cp.smartfarm.com.tn/api/sensor/config/create`,{method : 'POST' ,body :  JSON.stringify(dataFetch)})
                            sensor_id = resultSensor.id
                        dataMapping.map(async data=>{
                            await new DataMapping({sensor_id : sensor_id, min : data.min , max :data.max ,date :data.date,frequency,simIdentify,simNumber}).save()
                            })
                    
                    }
                    return res.status(201).json({ type:"success", Sensor : result });
                }
            }).catch(err => {
                console.log(err)
                return res.status(500).json({ type:"danger", message: "error_save_sensor" });
            });
       
    } catch (error) {
        res.status(500).json({ type:"danger", message: "error_get_sensor" });
    }
}


const editSensor = async (req, res) => {
    
    const {user_uid ,code,supplier_uid} = req.body;
    let user_id_sensor = null;
    let supplier_id = null;
    if(user_uid !== "" && typeof user_uid !== 'undefined'){
        const user = await new User({'uid': user_uid, deleted_at: null})
        .fetch({require: false})
        .then(async users => {
          user_id_sensor = users.get('id');
        });
    }

    
    if(supplier_uid !== ""&& typeof supplier_uid !== 'undefined') {
        const user= await new Supplier({'uid' : supplier_uid})
        .fetch({require: false})
        .then(async result => {
         supplier_id = result.get('id');
        });
    }
    try {
        const sensor = new Sensor({ 'code' : code , deleted_at: null})
        .fetch({require: false})
        .then(async result => {
            if (result === null) return res.status(404).json({ type:"danger", message: "no_field"});
            if(result){
                result.set({user_id: user_id_sensor, supplier_id:supplier_id});
                result.save()
                .then((result) => {
                    return res.status(201).json({ type:"success", Sensor : result });
                }).catch(err => {
                    return res.status(500).json({ type:"danger", message: "error_edit_sensor" });
                });
            }
        });        
    } catch (error) {
        res.status(500).json({ type:"danger", message: "error_user" });
    }
}

const editDataMapping = async (req,res) => {
    const {code , frequency,dataMapping,simNumber,simIdentify,sensor_id,lat,lon} = req.body;
    try {
        const sensor = await new DataMapping({ 'sensor_id' : sensor_id , deleted_at: null})
        .fetch({require: false})
        .then(async result => {
            console.log(result)
            if (result === null) {
                let dataFetch = {ref : code.trim() , frequence:frequency}
                await fetch(`http://cp.smartfarm.com.tn/api/sensor/config/create`,{method : 'POST' ,body :  JSON.stringify(dataFetch), headers: { 'Content-Type': 'application/json' }})
                dataMapping && dataMapping.map(async data=>{
                    await new DataMapping({sensor_id : sensor_id, min : data.min , max :data.max ,date :data.date,frequency,simIdentify,simNumber}).save()
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
                        result.set({sensor_id : sensor_id, min : data.min , max :data.max ,date :data.date,frequency,simIdentify,simNumber});
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


const getDataMapping = async (req,res) => {
    const {code , frequency,dataMapping,simNumber,simIdentify,sensor_id} = req.body;

    try {
        
    } catch (error) {
        res.status(500).json({ type:"danger", message: "error_get_sensor" });

    }
}


const getSingleSensor = async (req, res) => {
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

const deleteDataMapping = async (req,res) => {
    let dataMapping_id = req.body.dataMapping_id;

    try {
        const dataMapping = new DataMapping({'id': dataMapping_id})
        .fetch({require: false})
        .then(async result => {
            if (result === null) return res.status(404).json({ type:"danger", message: "no_dataMapping"});
            if(result){
                result.set({deleted_at: new Date()});
                result.save()
                return res.status(201).json({ type:"success", message: 'dataMapping_deleted' });
            }
        }).catch(err => {
            return res.status(500).json({ type:"danger", message: 'error_delete_dataMapping' });
        });;
    } catch (error) {
        return res.status(500).json({ type:"danger", message: "error_dataMapping" });
    } 
} 

module.exports = {getSensorsByUser,editSensor,getSensors,addSensor,getSingleSensor,editDataMapping,addMapping,deleteDataMapping , getInactiveSensors}