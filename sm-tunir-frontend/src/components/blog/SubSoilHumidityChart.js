import moment from 'moment';
import React , {useState,useEffect}from 'react'
import { Line } from  'react-chartjs-2';

import {  Card, Button } from "react-bootstrap";
import { useNavigate } from 'react-router';

const SubSoilHumidityChart = ({data,title,onSelect}) => {
   
    const navigate=useNavigate()

    const [state,setState] = useState(null)
 
    const getChartData = () => {
    
        let labels = []   
        let dataMv1 = []
        let dataMv2 = []
        let dataMv3 = []
        let array = []

        data.map(sensorData=>{
          const dateTime = moment(sensorData.time); // use the full timestamp
          const hour = dateTime.format('MMM Do HH:00'); // format date as "MMM Do HH:00"
                dataMv1.push(parseFloat(sensorData.mv1).toFixed(2))
                dataMv2.push(parseFloat(sensorData.mv2).toFixed(2))
                dataMv3.push(parseFloat(sensorData.mv3).toFixed(2))
                labels.push(hour);
               
            })
            
            labels.reverse();
            dataMv1.reverse();
            dataMv2.reverse();
            dataMv3.reverse();

        const state = {
            labels: labels,
            datasets: [
              {
                label: 'Humidity Mv1 ',
                lineTension: 0.5,
                borderWidth: 2,
                data: dataMv1,
                fill: false,
                backgroundColor: "rgba(75,192,192,0.2)",
                borderColor: "#FC5566",
              },
              {
                label: 'Humidity Mv2',
                lineTension: 0.5,
                borderWidth: 2,
                data: dataMv2,
                fill: false,
                backgroundColor: "rgba(75,192,192,0.2)",
                borderColor: "#3CB371",
              },
              {
                label: 'Humidity Mv3',
                lineTension: 0.5,
                borderWidth: 2,
                data: dataMv3,
                fill: false,
                backgroundColor: "rgba(75,192,192,0.2)",
                borderColor: "#1E90FF",
              }
            ]
          }
          setState(state)
    }

    useEffect(()=>{
        getChartData()
    },[data])
   const goToSelctedChart = (title) => {
        navigate(`/Graphs/${title}`);
        window.location.reload();
      }

    return (
        <Card className="h-100">
        <Card.Header className="border-bottom d-flex justify-content-between">
            {title}
          <Button onClick={() => onSelect("SubSoilHumidityChart")} squared variant="light">
            <svg xmlns="http://www.w3.org/2000/svg" height="24" width="24"><path d="M5.075 21.2Q4.125 21.2 3.463 20.538Q2.8 19.875 2.8 18.925V5.075Q2.8 4.125 3.463 3.462Q4.125 2.8 5.075 2.8H12V5.075H5.075Q5.075 5.075 5.075 5.075Q5.075 5.075 5.075 5.075V18.925Q5.075 18.925 5.075 18.925Q5.075 18.925 5.075 18.925H18.925Q18.925 18.925 18.925 18.925Q18.925 18.925 18.925 18.925V12H21.2V18.925Q21.2 19.875 20.538 20.538Q19.875 21.2 18.925 21.2ZM9.875 15.7 8.3 14.125 17.35 5.075H14V2.8H21.2V10H18.925V6.65Z" /></svg>
          </Button>
        </Card.Header>
        <Card.Body className="p-0">
     { state && <Line
      data={state}
          options={{
            title:{
              display:true,
              text:'Subsoil Humidity (%)',
              fontSize:15
            },
            legend:{
              display:true,
              position:'bottom'
            },
            scales: {
              yAxes: [{
                  ticks: {
                      beginAtZero: true,
                      min: 0
                  }
              }]
          },
          }}
      />}
  </Card.Body>
      </Card>
  );
}

export default SubSoilHumidityChart