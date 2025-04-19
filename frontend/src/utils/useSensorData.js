import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../api/api';

const useSensorData = () => {
  const [sensorData, setSensorData] = useState([]);
  const [allDataSensor, setAllDataSensor] = useState([]);
  let location = useLocation();
  let userId = location.pathname.split('/')[2];
  let userUid = JSON.parse(localStorage.getItem('user')).id;
  let fieldUid = localStorage.getItem('Field');
  let url = '/sensor/sensor-update-data';

  if ((JSON.parse(localStorage.getItem('user')).role === "ROLE_SUPPLIER") && location.pathname === `/Fields/${userId}/${fieldUid}`) {
    url = '/supplier/sensor-data';
  }

  if ((JSON.parse(localStorage.getItem('user')).role === "ROLE_SUPPLIER") && location.pathname === `/Dashboard-supplier`) {
    url = '/supplier/get-sensors-data';
  }

  let data = {
    userUid: userUid,
    fieldUid: fieldUid,
    userId: userId,
  };

  const getDataSensor = async () => {
    try {
      const response = await api.post(url, data);
      const sensors = response.data.sensors;
      const dataMappings = response.data.dataMapping; // dataMappings is an array

      const updatedSensorData = sensors.map(sensor => {
        const valaueAfterMapping = [];
        let mappedCharge = 0;
        const date = sensor.time;
        const vals = [sensor.mv1, sensor.mv2, sensor.mv3];

        if (sensor) {
          const chargeMin = 73;
          const chargeMax = 100;

          mappedCharge = ((Number(sensor.charge) - chargeMin) / (chargeMax - chargeMin) * 100).toFixed(2);
          mappedCharge = Math.max(0, Math.min(100, mappedCharge));
        }

        // Iterate over dataMappings to apply the correct min/max for each sensor value
        dataMappings.forEach(dataMapping => {
          vals.forEach((val, index) => {
            const keyDataMax = `Mv${index + 1}_max`; // Mv1_max, Mv2_max, or Mv3_max
            const keyDataMin = `Mv${index + 1}_min`; // Mv1_min, Mv2_min, or Mv3_min

            let max = parseFloat(dataMapping.max[keyDataMax]);
            let min = parseFloat(dataMapping.min[keyDataMin]);

            // Debugging: log the values
            console.log(`val: ${val}, max: ${max}, min: ${min}`);

            // Adjust calculation for when min > max
            if (val >= max && val <= min) {
              valaueAfterMapping[index] = (((parseFloat(val) - min) / (max - min)) * 100).toFixed(2);
            } else if (val < min) {
              valaueAfterMapping[index] = 0;
            } else if (val > max) {
              valaueAfterMapping[index] = 100;
            }
          });
        });

        return {
          code: sensor.code,
          sensor_id: sensor.sensor_id,
          time: sensor.time,
          temperature: sensor.temperature,
          humidity: sensor.humidity,
          pressure: sensor.pressure,
          charge: mappedCharge,
          signal: sensor.signal,
          adc: sensor.adc,
          ts: sensor.ts,
          mv1: valaueAfterMapping[0] || sensor.mv1, // Fallback to original value if mapping fails
          mv2: valaueAfterMapping[1] || sensor.mv2, // Fallback to original value if mapping fails
          mv3: valaueAfterMapping[2] || sensor.mv3, // Fallback to original value if mapping fails
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
};

export default useSensorData;
