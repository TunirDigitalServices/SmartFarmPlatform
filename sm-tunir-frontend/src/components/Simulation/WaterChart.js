import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { useTranslation } from 'react-i18next';
import moment from 'moment';
import 'chartjs-adapter-moment';

// Chart.js v4 component registration
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  TimeScale,
  Title,
  Tooltip,
  Legend,
  CategoryScale,
} from 'chart.js';

ChartJS.register(
  LineElement,
  PointElement,
  LinearScale,
  TimeScale,
  Title,
  Tooltip,
  Legend,
  CategoryScale
);

const WaterChart = ({ data }) => {
  const [chartData, setChartData] = useState(null);
  const { t } = useTranslation();
  const [ruMax, setRuMax] = useState(0);
  const [ruMin, setRuMin] = useState(0);

  useEffect(() => {
    if (!data || data.length === 0) return;

    const labels = [];
    const dataBilan = [];
    const ruMaxArr = [];
    const ruMinArr = [];

    for (let i = 1; i < data.length; i++) {
      const hourlyBilan = data[i].bilan;
      for (let j = 0; j < hourlyBilan.length; j++) {
        const hourData = hourlyBilan[j];
        const date = moment(data[i].dates).add(hourData.hour, 'hours').toISOString();
        labels.push(date);
        dataBilan.push(parseFloat(hourData.value).toFixed(2));
        ruMaxArr.push(data[i].RUmax);
        ruMinArr.push(data[i].RUmin);
      }
    }

    setChartData({
      labels,
      datasets: [
        {
          label: t('water_balance'),
          data: dataBilan,
          borderColor: '#27A6B7',
          backgroundColor: 'rgba(75,192,192,0.3)',
          borderWidth: 2,
          tension: 0,
        },
        {
          label: t('Ru max (mm)'),
          data: ruMaxArr,
          borderColor: '#32CB8D',
          borderWidth: 1,
          tension: 0,
        },
        {
          label: t('Ru min (mm)'),
          data: ruMinArr,
          borderColor: '#e5331b',
          borderWidth: 1,
          tension: 0,
        },
      ],
    });

    setRuMax(Math.max(...ruMaxArr));
    setRuMin(Math.min(...ruMinArr));
  }, [data, t]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        text: t('water_balance'),
        font: {
          size: 14,
        },
      },
      legend: {
        display: true,
        position: 'bottom',
      },
    },
    scales: {
      x: {
        type: 'time',
        time: {
          unit: 'hour',
          displayFormats: {
            hour: 'DD-MM-YYYY HH:mm',
          },
        },
        ticks: {
          autoSkip: true,
          maxTicksLimit: 25,
        },
      },
      y: {
        beginAtZero: true,
        suggestedMin: Math.round(ruMin - 10),
        suggestedMax: ruMax > 100 ? ruMax + 10 : 100,
      },
    },
    elements: {
      point: {
        radius: 0,
      },
    },
  };

  if (!chartData) return <div>Loading chart...</div>;


  return (
    <div>

      {chartData && (
        <Line data={chartData} options={options}  height={263}
        style={{ height: '100%', width: '100%', margin: '0 auto' }} />
        )}
    </div>
  )
};

export default WaterChart;
