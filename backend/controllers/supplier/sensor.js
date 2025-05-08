const User = require('./../../models/User.js');
const Sensor = require('./../../models/Sensor.js');
const Field = require('./../../models/Field');
const Supplier = require('../../models/Supplier.js');
const Datasensor = require('../../models/Datasensor.js');
const CalculSensor = require('../../models/CalculSensor.js');


const fetch = require('node-fetch');

const addSensorToUser = async (req,res) => {
    const {code, user_uid,field_uid} = req.body;
    let user_id = "";
    let field_id= "";

    const user = await new User({'uid': user_uid, deleted_at: null})
    .fetch({require: false})
    .then(async result => {
      if(result === null) return res.status(404).json({ type:"danger", message: "no_user_selected"});
      user_id = result.get('id');
    });
    try {
        const field = new Field({'uid': field_uid, deleted_at: null})
        .fetch({require: false})
        .then(async result => {
            if (result === null) return res.status(404).json({ type:"danger", message: "no_field"});
            field_id = result.get('id')
        });  
        const sensor = new Sensor({ 'code' : code , deleted_at: null})
        .fetch({require: false})
        .then(async result => {
            // if (result != null) return res.status(404).json({ type:"danger", message: "existed_sensor"});
            if (result){
                result.set({code,user_id : user_id , field_id : field_id});
                result.save()
                //await new Sensor({code,user_id : user_id , field_id : field_id}).save()
                .then(async (result) => {
                    return res.status(201).json({ type:"success", Sensor : result });
                }).catch(err => {
                    console.log(err)
                    return res.status(500).json({ type:"danger", message: "error_save_sensor" });
                });
            }
        })
       
    } catch (error) {
        res.status(500).json({ type:"danger", message: "error_get_sensor" });
    }
}

const getSensors = async (req, res) => {
    if(!(req.userUid) || req.userUid == "") return res.status(404).json({ type:"danger", message: "no_user"});
    const uid  = req.userUid;

    let supplier_id = ""
    let user_id = ""

    const user = await new User({ 'uid' : uid , role : 'ROLE_SUPPLIER'})
    .fetch({require: false})
    .then(async result => {
       supplier_id = result.get('supplier_id')
       user_id = result.get('id')

    })
    try {
        const sensor = await new Sensor()
        .query({where: {deleted_at : null, supplier_id : supplier_id}})
        .fetchAll({require: false})
        .then(async sensors => {
            return res.status(201).json({ sensors });
        })
    } catch (error) {
        return res.status(500).json({ type:"danger", message: "error_get_sensors" });
    }

}


const updateSensorsApiByField = async (req, res) => {
    const { fieldUid,userUid ,userId} = req.body;
    if(!(userUid) || userUid == "") return res.status(404).json({ type:"danger", message: "no_user"});
    let user_id = "";
    let field_id = ""
    const field = await new Field({'uid': fieldUid, deleted_at: null})
    .fetch({require: false})
    .then(async result => {
        if (result === null) return res.status(404).json({ type:"danger", message: "no_field"});
        field_id = result.get('id')
    });  
    try {
        if(field_id ===""){
            const user = await new User({ 'id': userId })
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
              signal=  dataResponseApi.signal
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
          const user = await new User({ 'id': userId })
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
        }
     } catch (error) {
       console.log(error);
       return res.status(500).json({ type: "danger", message: error });
     }
}

const getDataByConnectedSupplier = async (req,res) => {
  if(!(req.userUid) || req.userUid == "") return res.status(404).json({ type:"danger", message: "no_user"});
  const { fieldUid,userUid ,userId} = req.body;
  let supplierId = ""
  try {
    const user = await new User({'uid': userUid, deleted_at: null , role : 'ROLE_SUPPLIER'})
    .fetch({require: false})
    .then(async result => {
        if (result === null) return res.status(404).json({ type:"danger", message: "no_user"});
        supplierId = result.get('supplier_id')
    }); 
      if (supplierId !== ''){
        const user = await new User({'supplier_id': supplierId, deleted_at: null , role : 'ROLE_USER'})
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
    return res.status(500).json({ type: "danger", message: "error_user" });

  }


}


const getCalculSensorBySupplier = async (req, res) => {
    if (!(req.userUid) || req.userUid == "") return res.status(404).json({ type: "danger", message: "no_user" });
    const uid = req.userUid;

    let sensorCode = req.params.sensorCode
    let user_id = req.params.userId
    let supplier_id =""
    const user = await new User({ 'uid' : uid})
    .fetch({require : false})
    .then(async result => {
        if (result === null) return res.status(404).json({ type:"danger", message: "no_user"})
        if (result) supplier_id = result.get("supplier_id")
    })
    try {
        const user = new User({'id':user_id,'supplier_id' : supplier_id , deleted_at : null,role : "ROLE_USER"})
                // .query(qb => qb.where('supplier_id' ,'=',supplier_id)
                // .andWhere('role', '=' , 'ROLE_USER')
                // .andWhere('deleted_at', 'is' , null))
                .fetch({require : false})
                .then(async result => {
                    if (result === null) return res.status(404).json({ type: "danger", message: "no_user" });
                    if (result) {
                        await new CalculSensor()
                        .query((qb) => {
                            qb.select('*');
                            qb.where({ sensor_code: sensorCode });
                            qb.where({ user_id: user_id });
                        })
                            .fetchAll({ require: false })
                            .then(async result => {
                                if (result === null) return res.status(404).json({ type: "danger", message: "no_user_calcul" });
                                let resultCalcul = JSON.parse(JSON.stringify(result))
                                let todayDate = new Date()
                                let today = todayDate.toISOString().slice(0, 10)
                                let filteredResult = [];
                                let inputsCalcul = [];
                
                                resultCalcul.map(calcul => {
                                    let startDate = new Date(calcul.start_date).toISOString().slice(0, 10)
                                    let endDate = new Date(calcul.end_date).toISOString().slice(0, 10)
                                    let resultCalcul = calcul.result
                                     inputsCalcul = calcul.inputs
                                    if (today >= startDate && today <= endDate) {
                                        filteredResult = resultCalcul.filter(result => {
                                            let resultDate = new Date(result.date).toISOString().slice(0, 10)
                                            return startDate <= resultDate && endDate >= resultDate && result.codeSensor == sensorCode
                                        })
                                    }
                                })
                                return res.status(201).json({ calcul: filteredResult , inputs : inputsCalcul });
                            }).catch(err => {
                                console.log(err)
                                return res.status(500).json({ type: "danger", message: "error_get_calcul" });
                            })

                    }
                });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ type: "danger", message: "error_user" });
    }
}


module.exports = {getSensors , addSensorToUser ,updateSensorsApiByField,getCalculSensorBySupplier,getDataByConnectedSupplier}