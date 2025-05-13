import moment from 'moment';
import React, { useState, useEffect } from 'react'
import { Line } from 'react-chartjs-2';

// import { Row, Col, Card, CardHeader, CardBody, Button } from "shards-react";
import api from '../../api/api';
import { useTranslation } from "react-i18next";



const SubSoil = ({ data, codeSensor }) => {

  const { t, i18n } = useTranslation();

  const addDays = (date, days) => {
    let result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  const [historyData, setHistoryData] = useState([])
  const [dateValue, setDateValue] = useState({
    dateStart: new Date(),
    dateEnd: new Date()
  })
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  useEffect(() => {
    const getHistorySensor = async (page) => {

      await api.get(`/sensor/sensor-history/${codeSensor}/${addDays(dateValue.dateStart, -7)}/${dateValue.dateEnd}?pageNum=1&limit=28`)
        .then(response => {
          let historyResult = response.data.history
          let sensorCoords = response.data.sensor_id
          setHistoryData(historyResult)
          setCurrentPage(page);
          setTotalPages(response.data.totalPages);

        })
        .catch(err => {
          console.log(err)
        })


    }
    getHistorySensor()
  }, [codeSensor])




  const [state, setState] = useState(null)

  const getChartData = () => {
    const historyDataCopy = [...historyData];

    const dataMv1 = [];
    const dataMv2 = [];
    const dataMv3 = [];
    const labels = [];
    historyDataCopy.sort((a, b) => {
      return moment(a.time) - moment(b.time);
    });
    historyDataCopy.forEach(sensorData => {
      const dateTime = moment(sensorData.time); // use the full timestamp
      const formattedDateTime = dateTime.format('MMM Do HH:mm'); // format date as "MMM Do HH:mm"
      const mv1 = parseFloat(sensorData.mv1);
      const mv2 = parseFloat(sensorData.mv2);
      const mv3 = parseFloat(sensorData.mv3);

      labels.push(formattedDateTime);
      dataMv1.push(mv1);
      dataMv2.push(mv2);
      dataMv3.push(mv3);
    });

    // sort labels in ascending order
    labels.sort((a, b) => {
      const timestampA = moment(a, 'MMM Do HH:mm').valueOf();
      const timestampB = moment(b, 'MMM Do HH:mm').valueOf();
      return timestampA - timestampB;
    });

    const state = {
      labels: labels,
      datasets: [
        {
          label: `${t('niveau')} 1`,
          lineTension: 0.2,
          borderWidth: 2,
          data: dataMv1,
          fill: false,
          backgroundColor: [
            "rgba(75,192,192,0.2)",
            "rgba(75,192,192,0.4)",
            "rgba(75,192,192,0.6)"
          ],
          borderColor: "#FC5566",
        },
        {
          label: `${t('niveau')} 2`,
          lineTension: 0.2,
          borderWidth: 2,
          data: dataMv2,
          fill: false,
          backgroundColor: [
            "rgba(75,192,192,0.2)",
            "rgba(75,192,192,0.4)",
            "rgba(75,192,192,0.6)"
          ],
          borderColor: "#3CB371",
        },
        {
          label: `${t('niveau')} 3`,
          lineTension: 0.2,
          borderWidth: 2,
          data: dataMv3,
          fill: false,
          backgroundColor: [
            "rgba(75,192,192,0.2)",
            "rgba(75,192,192,0.4)",
            "rgba(75,192,192,0.6)"
          ],
          borderColor: "#1E90FF",
        }
      ]
    };

    setState(state);
  };


  useEffect(() => {
    getChartData()
  }, [historyData])

  // const options = {
  //   title: {
  //     display: false,
  //     text: 'Subsoil Humidity (%)',
  //     fontSize: 15
  //   },
  //   legend: {
  //     display: true,
  //     position: 'bottom',
  //     fontSize: 10

  //   },
  //   scales: {
  //     yAxes: [{
  //       ticks: {
  //         beginAtZero: true,
  //         max: 100,
  //         min: 0,
  //         stepSize: 25,
  //         fontColor: '#000',
  //         fontSize: 14,
  //       },
  //       gridLines: {
  //         color: 'rgba(0,0,0,0.2)',
  //         lineWidth: 1,
  //       },
  //       scaleOverride: true,
  //       scaleSteps: 4,
  //       scaleStepWidth: 25,
  //       scaleStartValue: 0,
  //       scaleBackgroundColor: function (context) {
  //         if (context.tick.value <= 25) {
  //           return '#fdd';
  //         } else if (context.tick.value <= 50) {
  //           return '#dfd';
  //         } else if (context.tick.value <= 75) {
  //           return '#ddf';
  //         } else {
  //           return '#ffd';
  //         }
  //       }
  //     }],
  //     xAxes: [{
  //       ticks: {
  //         autoSkip: false,
  //         maxRotation: 90,
  //         fontColor: '#000',
  //         fontSize: 10,
  //       },
  //       gridLines: {
  //         color: 'rgba(0,0,0,0.2)',
  //         lineWidth: 1,
  //       },
  //     }]
  //   }

  // };
  const options = {
    plugins: {
      title: {
        display: false,
        text: 'Subsoil Humidity (%)',
        font: {
          size: 15
        }
      },
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          font: {
            size: 10
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        min: 0,
        max: 100,
        ticks: {
          stepSize: 25,
          color: '#000',
          font: {
            size: 14
          }
        },
        grid: {
          color: 'rgba(0,0,0,0.2)',
          lineWidth: 1
        }
      },
      x: {
        ticks: {
          autoSkip: false,
          maxRotation: 90,
          color: '#000',
          font: {
            size: 10
          }
        },
        grid: {
          color: 'rgba(0,0,0,0.2)',
          lineWidth: 1
        }
      }
    }
  };


  return (
    <div>

      {state && (
        <Line
          data={state}
          options={options}
          height={263}
          style={{ height: '100%', width: '80%', margin: '0 auto' }}
        />
      )}




    </div>
  )
}

export default SubSoil