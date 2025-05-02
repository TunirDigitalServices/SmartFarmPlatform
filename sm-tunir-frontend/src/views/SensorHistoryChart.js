import moment from 'moment';
import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { useTranslation } from "react-i18next";

const SensorHistoryChart = ({ data }) => {
  const [state, setState] = useState(null);
  const { t, i18n } = useTranslation();
  const [legendItems, setLegendItems] = useState([]); // State to hold legend items

  const getChartData = () => {
    let labels = [];
    let dataMv1 = [];
    let dataMv2 = [];
    let dataMv3 = [];
    let temperature = [];
    let humidity = [];
    let tempSubSoil = [];
    let altitude = [];
    let pressure = [];

    data &&
      data.forEach(sensorData => {
        const dateTime = moment(sensorData.time);
        const hour = dateTime.format('MMM Do HH:00');
        dataMv1.push(parseFloat(sensorData.mv1).toFixed(2));
        dataMv2.push(parseFloat(sensorData.mv2).toFixed(2));
        dataMv3.push(parseFloat(sensorData.mv3).toFixed(2));
        temperature.push(parseFloat(sensorData.temperature).toFixed(2));
        altitude.push(parseFloat(sensorData.altitude));
        pressure.push(parseFloat(sensorData.pressure).toFixed(2) / 1000);
        tempSubSoil.push(parseFloat(sensorData.ts).toFixed(2));
        humidity.push(parseFloat(sensorData.humidity).toFixed(2));
        labels.push(hour);
      });

    labels.reverse();
    dataMv1.reverse();
    dataMv2.reverse();
    dataMv3.reverse();
    temperature.reverse();
    altitude.reverse();
    pressure.reverse();
    tempSubSoil.reverse();
    humidity.reverse();

    const initialState = {
      labels: labels,
      datasets: [
        {
          label: 'Temperature',
          lineTension: 0.5,
          borderWidth: 2,
          data: temperature,
          fill: false,
          backgroundColor: "rgba(75,192,192,0.2)",
          borderColor: "#f46835",
          hidden: true, // Initially hidden
        },
        {
          label: 'Humidity',
          lineTension: 0.5,
          borderWidth: 2,
          data: humidity,
          fill: false,
          backgroundColor: "rgba(75,192,192,0.2)",
          borderColor: "#2D40E5",
          hidden: true, // Initially hidden
        },
        {
          label: 'Pressure',
          lineTension: 0.5,
          borderWidth: 2,
          data: pressure,
          fill: false,
          backgroundColor: "rgba(75,192,192,0.2)",
          borderColor: "#4BC0C0",
          hidden: true, // Initially hidden
        },
        {
          label: 'Altitude',
          lineTension: 0.5,
          borderWidth: 2,
          data: altitude,
          fill: false,
          backgroundColor: "rgba(75,192,192,0.2)",
          borderColor: "#B7990D",
          hidden: true, // Initially hidden
        },
        {
          label: 'Temperature subsoil',
          lineTension: 0.5,
          borderWidth: 2,
          data: tempSubSoil,
          fill: false,
          backgroundColor: "rgba(75,192,192,0.2)",
          borderColor: "#8621e4",
          hidden: true, // Initially hidden
        },
        {
          label: 'Niveau 1',
          lineTension: 0.5,
          borderWidth: 2,
          data: dataMv1,
          fill: false,
          backgroundColor: "rgba(75,192,192,0.2)",
          borderColor: "#FC5566",
          hidden: true, // Initially hidden
        },
        {
          label: 'Niveau 2',
          lineTension: 0.5,
          borderWidth: 2,
          data: dataMv2,
          fill: false,
          backgroundColor: "rgba(75,192,192,0.2)",
          borderColor: "#3CB371",
          hidden: true, // Initially hidden
        },
        {
          label: 'Niveau 3',
          lineTension: 0.5,
          borderWidth: 2,
          data: dataMv3,
          fill: false,
          backgroundColor: "rgba(75,192,192,0.2)",
          borderColor: "#1E90FF",
          hidden: true, // Initially hidden
        },
      ]
    };
    setState(initialState);
  };

  useEffect(() => {
    getChartData();
  }, [data]);
  
  useEffect(() => {
    if (state) {
      // Generate legend items based on dataset labels and fillStyles
      const items = state.datasets.map((dataset, index) => ({
        text: dataset.label,
        fillStyle: dataset.borderColor,
        hidden: true, // Initially hidden
        index,
      }));
      setLegendItems(items);
    }
  }, [state]);

  const handleCheckboxChange = (index) => {
    // Toggle visibility of dataset based on index
    const updatedState = { ...state };
    updatedState.datasets[index].hidden = !updatedState.datasets[index].hidden;
    setState(updatedState);
  };
  
  return (
    <>
     { state && <Line
        data={state}
        options={{
          title: {
            display: true,
            text: `${t('Sensor History')}`,
            fontSize: 20
          },
          legend: {
            display: false,
            position: 'bottom'
          },
          scales: {
            yAxes: [{
              ticks: {
                beginAtZero: true,
                max: 100,
                min: 0,
                stepSize: 25,
                fontColor: '#000',
                fontSize: 14,
              },
              gridLines: {
                color: 'rgba(0,0,0,0.2)',
                lineWidth: 1,
              },
              scaleOverride: true,
              scaleSteps: 4,
              scaleStepWidth: 25,
              scaleStartValue: 0
            }],
            xAxes: [{
              ticks: {
                autoSkip: false,
                maxRotation: 90,
                fontColor: '#000',
                fontSize: 10,
              },
              gridLines: {
                color: 'rgba(0,0,0,0.2)',
                lineWidth: 1,
              },
            }]
          }
        }}
      />}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center',flexWrap:'wrap', padding: '10px' }}>
        {legendItems.map((item, index) => (
          <div key={index} style={{ display: 'inline-block', marginRight: '10px' }}>
            <input
              type="checkbox"
              id={`checkbox-${index}`}
              checked={!state.datasets[index].hidden} // Set checked based on hidden property
              onChange={() => handleCheckboxChange(index)}
            />
            <label htmlFor={`checkbox-${index}`} style={{ color: item.fillStyle , marginLeft : '4px'}}>{item.text}</label>
          </div>
        ))}
      </div>
    </>
  );
};

export default SensorHistoryChart;
