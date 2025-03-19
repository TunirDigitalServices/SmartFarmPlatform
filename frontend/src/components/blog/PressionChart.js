import moment from 'moment';
import React , {useState,useEffect}from 'react'
import { Line } from  'react-chartjs-2';
import { useHistory } from 'react-router-dom';
import { Row, Col, Card, CardHeader, CardBody, Button } from "shards-react";


const PressionChart = ({data,title,onSelect}) => {

    const history = useHistory()

    const [state,setState] = useState(null)
 
    const getChartData = () => {
    
        let labels = []   
        let dataTemp = []
        let array = []

            data.map(sensorData=>{
              const dateTime = moment(sensorData.time); // use the full timestamp
              const hour = dateTime.format('MMM Do HH:00'); // format date as "MMM Do HH:00"
                let press = Number(sensorData.pressure) / 1000
                dataTemp.push(parseFloat(press).toFixed(2))
                labels.push(hour);
               

            })
             // Reverse both labels and dataTemp arrays
              labels.reverse();
              dataTemp.reverse();

        const state = {
            labels: labels,
            datasets: [
              {
                label: 'Pression',
                lineTension: 0.5,
                borderWidth: 2,
                data: dataTemp,
                fill: false,
                backgroundColor: "rgba(75,192,192,0.2)",
                borderColor: "rgba(75,192,192,1)"
              }
            ]
          }
          setState(state)
    }

    useEffect(()=>{
        getChartData()
    },[data])
   const goToSelctedChart = (title) => {
        history.push(`/Graphs/${title}`);
        window.location.reload();
      }

    return (
        <Card className="h-100">
        <CardHeader className="border-bottom d-flex justify-content-between">
            {title}
          <Button onClick={() => onSelect("PressionChart")} squared theme="light">
            <svg xmlns="http://www.w3.org/2000/svg" height="24" width="24"><path d="M5.075 21.2Q4.125 21.2 3.463 20.538Q2.8 19.875 2.8 18.925V5.075Q2.8 4.125 3.463 3.462Q4.125 2.8 5.075 2.8H12V5.075H5.075Q5.075 5.075 5.075 5.075Q5.075 5.075 5.075 5.075V18.925Q5.075 18.925 5.075 18.925Q5.075 18.925 5.075 18.925H18.925Q18.925 18.925 18.925 18.925Q18.925 18.925 18.925 18.925V12H21.2V18.925Q21.2 19.875 20.538 20.538Q19.875 21.2 18.925 21.2ZM9.875 15.7 8.3 14.125 17.35 5.075H14V2.8H21.2V10H18.925V6.65Z" /></svg>
          </Button>
        </CardHeader>
        <CardBody className="p-0">
      <Line
      data={state}
          options={{
            title:{
              display:true,
              text:'Pression (kPa)',
              fontSize:15
            },
            legend:{
              display:true,
              position:'bottom'
            }
          }}
      />
  </CardBody>
      </Card>
  );
}

export default PressionChart