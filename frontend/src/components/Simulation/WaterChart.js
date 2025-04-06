import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { useTranslation } from 'react-i18next';
import { Col } from 'shards-react';
import moment from 'moment'; // Import moment library

const WaterChart = ({ data }) => {
  const [state, setState] = useState(null);
  const { t, i18n } = useTranslation();
  const [ruMax, setRuMax] = useState(0);
  const [ruMin, setRuMin] = useState(0);
  const getChartData = () => {
    let labels = [];
    let dataBilan = [];
    let RuMax = [];
    let RuMin = [];

    for (let i = 1; i < data.length; i++) {
      const hourlyBilan = data[i].bilan;
      for (let j = 0; j < hourlyBilan.length; j++) {
        const hourData = hourlyBilan[j];
        const date = moment(data[i].dates).add(hourData.hour, 'hours').locale('en').format('MMM DD YYYY HH:mm');
        labels.push(date);
        dataBilan.push(parseFloat(hourData.value).toFixed(2));
        RuMax.push(data[i].RUmax);
        RuMin.push(data[i].RUmin);
      }
    }
    const chartData = {
      labels: labels,
      datasets: [
        {
          label: `${t('water_balance')}`,
          fill: false,
          lineTension: 0,
          backgroundColor: 'rgba(75,192,192,1)',
          borderColor: '#27A6B7',
          borderWidth: 2,
          data: dataBilan,
        },
        {
          label: `${t('Ru max (mm)')}`,
          fill: false,
          lineTension: 0,
          backgroundColor: '#32CB8D',
          borderColor: '#32CB8D',
          borderWidth: 1,
          data: RuMax,
        },
        {
          label: `${t('Ru min (mm)')}`,
          fill: false,
          lineTension: 0,
          backgroundColor: '#e5331b',
          borderColor: '#e5331b',
          borderWidth: 1,
          data: RuMin,
        },
      ],
    };
    setState(chartData);
    setRuMax(RuMax[0]); // Find max RUmax value
    setRuMin(RuMin[0]); // Find min RUmin value
  };

  useEffect(() => {
    getChartData();
  }, [data]);

  return (
    <Line
      data={state}
      options={{
        title: {
          display: true,
          text: `${t('water_balance')}`,
          fontSize: 14,
        },
        legend: {
          display: true,
          position: 'bottom',
        },
        scales: {
          yAxes: [
            {
              ticks: {
                beginAtZero: true,
                max: ruMax > 100 ? ruMax + 10 : 100,
                min: Math.round(ruMin - 10),
              },
            },
          ],
          xAxes: [
            {
              type: 'time', // Use a time scale for x-axis
              time: {
                unit: 'hour', // Display time in hours
                stepSize: 1, // Display every hour
                displayFormats: {
                  hour: 'DD-MM-YYYY HH:mm', // Format of displayed time
                },
              },
            },
          ],
        },
        elements: {
          point:{
              radius: 0
          }
      }
      }}
    />
  );
};

export default WaterChart;
