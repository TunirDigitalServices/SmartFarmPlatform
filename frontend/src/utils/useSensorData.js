import React ,{useEffect,useState} from 'react'
import { useLocation } from 'react-router-dom';
import api from '../api/api'

const useSensorData = () => {
    const [sensorData, setSensorData] = useState([]);
    const [allDataSensor, setAllDataSensor] = useState([]);
    let location = useLocation()
    let userId = location.pathname.split('/')[2]
    let userUid = JSON.parse(localStorage.getItem('user')).id
    let fieldUid = localStorage.getItem('Field')
    let url = '/sensor/sensor-update-data'
    if((JSON.parse(localStorage.getItem('user')).role === "ROLE_SUPPLIER") && location.pathname === `/Fields/${userId}/${fieldUid}`){
      url = '/supplier/sensor-data'
    }
    if((JSON.parse(localStorage.getItem('user')).role === "ROLE_SUPPLIER") && location.pathname === `/Dashboard-supplier`){
        url = '/supplier/get-sensors-data'
      }
    let data = {
        userUid : userUid,
        fieldUid : fieldUid,
        userId : userId
      }
      const getDataSensor = async () => {
        try {
            const response = await api.post(url, data);
            const sensors = response.data.sensors;
            const dataMappings = response.data.dataMapping;
    
            const updatedSensorData = sensors.map(sensor => {
                const valaueAfterMapping = [];
                let mappedCharge = 0
                const date = sensor.time;
                const vals = [sensor.mv1, sensor.mv2, sensor.mv3];
                if (sensor) {
                    const chargeMin = 73;
                    const chargeMax = 100;

                    mappedCharge = ((Number(sensor.charge) - chargeMin) / (chargeMax - chargeMin) * 100).toFixed(2);
                    mappedCharge = Math.max(0, Math.min(100, mappedCharge));
                }
                dataMappings.forEach(dataMapping => {
                    const dateMappings = dataMapping.date;
                    const num = vals.length;
    
                    const dateMappingSelected = dateMappings[`Mv${num}_date`] || "";
    
                    if (dateMappingSelected !== "") {
                        const keyDataMax = `Mv${num}_max`;
                        const keyDataMin = `Mv${num}_min`;
    
                        if (dateMappingSelected === dateMappings[`Mv${num}_date`]) {
                            vals.forEach((val, index) => {
                                valaueAfterMapping[index] = val;
    
                                if (val >= parseFloat(dataMapping.max[keyDataMax]) && val <= parseFloat(dataMapping.min[keyDataMin])) {
                                    valaueAfterMapping[index] = (((parseFloat(val) - dataMapping.min[keyDataMin]) / (dataMapping.max[keyDataMax] - dataMapping.min[keyDataMin])) * 100).toFixed(2);
                                } else if (val < parseFloat(dataMapping.max[keyDataMax])) {
                                    valaueAfterMapping[index] = 100;
                                } else if (val > parseFloat(dataMapping.min[keyDataMin])) {
                                    valaueAfterMapping[index] = 0;
                                }
                            });
                        }
                    }
                });
                return {
                    code: sensor.code,
                    sensor_id: sensor.sensor_id,
                    time: sensor.time,
                    temperature: sensor.temperature,
                    humidity: sensor.humidity,
                    pressure: sensor.pressure,
                    charge: mappedCharge,
                    signal : sensor.signal,
                    adc: sensor.adc,
                    ts: sensor.ts,
                    mv1: valaueAfterMapping[0],
                    mv2: valaueAfterMapping[1],
                    mv3: valaueAfterMapping[2],
                    originalmv1: sensor.mv1,
                    originalmv2: sensor.mv2,
                    originalmv3: sensor.mv3,
                    altitude: sensor.altitude,
                    mapping: response.data.dataMapping,
                };
            });
    
            setSensorData(sensors);
            setAllDataSensor(updatedSensorData);
        } catch (error) {
            console.log(error);
        }
    };
    
    useEffect(() => {
        getDataSensor();
    
        const intervalId = setInterval(() => {
            getDataSensor();
        }, 30000);
    
        return () => clearInterval(intervalId);
    
    }, []);
    
    return allDataSensor;
}

export default useSensorData