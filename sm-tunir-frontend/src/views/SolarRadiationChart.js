import moment from 'moment';
import React , {useState,useEffect}from 'react'
import { Line } from  'react-chartjs-2';
import { useTranslation } from "react-i18next";

const SensorHistoryChart = ({data}) => {

    const [state,setState] = useState(null)
    const { t, i18n } = useTranslation();


    const getChartData = () => {
        let labels = []   
        let solarRad = []
       data && data.map(solarData=>{
            let date = solarData.date
            solarRad.push(parseFloat(solarData.value).toFixed(2))
            labels.push(moment(date.slice(0,10)).locale('en-En').format('ddd, h a'))
            // labels = ([...new Set(labels)])
        })
       ;  
        const state = {
            labels: labels,
            datasets: [
                {
                    label: 'Solar Radiation',
                    lineTension: 0.5,
                    borderWidth: 2,
                    data: solarRad,
                    fill: false,
                    backgroundColor: "rgba(75,192,192,0.2)",
                    borderColor: "#d66915"
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
              text:`${t('Week Solar Radiation')}`,
              fontSize:20
            },
            legend:{
              display:true,
              position:'bottom'
            }
          }}
      />
  )
}

export default SensorHistoryChart