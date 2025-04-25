import moment from 'moment';
import React , {useState,useEffect}from 'react'
import { Line } from  'react-chartjs-2';
import { useTranslation } from "react-i18next";
import { Col } from 'shards-react';


const EvapoChart = ({data}) => {
    const [state,setState] = useState(null)
    const { t, i18n } = useTranslation();


    const getChartData = () => {
    
        let labels = []   
        let dataETC = []
        for (let i = 0; i <= data.length; i++) {
          if(data[i] && data[i].dates){
            let allDate = data[i].dates
              let date = moment(allDate).locale('En').format('MMM DD YYYY')
               labels.push(date)
               dataETC.push(parseFloat(data[i].ETC).toFixed(2))
          }

        }
        const state = {
            labels: labels,
            datasets: [
              {
                label: `${t('ETC (mm)')}`,
                fill: false,
                lineTension: 0,
                backgroundColor: 'rgba(75,192,192,1)',
                borderColor: '#27A6B7',
                borderWidth: 2,
                data: dataETC
              },
              
            ]
          }
          setState(state)
    }

    useEffect(()=>{
        getChartData()
    },[data])

    return (
      <Line
      data={state}
          options={{
            title:{
              display:true,
              text:`${t('ETC')}`,
              fontSize:14
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
      />

  );
}

export default EvapoChart