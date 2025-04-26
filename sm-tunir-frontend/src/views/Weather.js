import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  CardHeader,
  CardBody,
  FormSelect,
} from "shards-react";

import PageTitle from "../components/common/PageTitle";
import "./../assets/Styles.css";
import "./Styles.css";
import WeatherSmallStat from "./weatherSmallStat";
import api from "../api/api"
import moment from 'moment'
import LoadingSpinner from '../components/common/LoadingSpinner'

const Weather = () => { 


  let offer = JSON.parse(localStorage.getItem('user')).offer_type
  const [coord,setCoord] = useState({lat : '36.799746', lon : '10.186000'})
  const [isLoading,setIsLoading] = useState(true)
  const [farms,setFarms] = useState([])
  const [farmSelected,setFarmSelected] = useState("")
  const [weatherData, setWeatherData] = useState([]);
  const [currentWeatherData, setCurrentWeatherData] = useState({});
  const [todayWeatherForecast, setTodayWeatherForecast] = useState([]);
  const [isTemp, setFlag] = useState(true);
  const [t, st] = useState("snow");
  



  const  getFarms = () => {
    api.get('/farm/farms')
    .then(res =>{
      const DataFarm = res.data;
      setFarms(DataFarm.farms);
      if(DataFarm.farms.length > 0 ){
          setCoord({
            lat : DataFarm.farms[0].Latitude,
            lon : DataFarm.farms[0].Longitude
          })
          setFarmSelected(DataFarm.farms[0].name)
      }
      console.log(DataFarm)
  }).catch(error=>{
    console.log(error)
  })
  }

  useEffect(()=>{
    getFarms()
  },[])


  useEffect(() => {

    const weather = async () => {

      await api.post("/weather/get-data",{type : 'day' ,lat : coord.lat , lon : coord.lon})
      
      .then((response) => {
        var today = {};
        let weatherData = response.data.data
        today.city = weatherData.name
        today.wind = weatherData.wind.speed;
        today.windDirection = weatherData.wind.deg;
        today.date = new Date(weatherData.dt*1000);
        today.temp = ((weatherData.main.feels_like)).toFixed(1);
        today.tempMax = ((weatherData.main.temp_max)).toFixed(1);
        today.tempMin = ((weatherData.main.temp_min)).toFixed(1);
        today.main = weatherData.weather[0].main;
        today.description = weatherData.weather[0].description;
        today.icon = weatherData.weather[0].icon;
        today.humidity = weatherData.main.humidity;
        today.pressure = weatherData.main.pressure;
        today.visibility = weatherData.visibility;
        if (typeof weatherData.rain !== 'undefined') {
          today.rain = weatherData.rain['1h'];
      }
        setCurrentWeatherData(today)
      })
      .catch(function(error) {
        console.log(error);
      })
    }
 
     const weatherForecast = async () => {
      let data = {
        type  : 'forecast',
        lat  : coord.lat,
        lon : coord.lon
      }
    await api.post("/weather/get-data",data)
      .then((response) => {
          let weatherData = response.data.data;
          let listForecast = weatherData.list;
          let days = [];
  for(let i = 0; i < listForecast.length; i+=8) { 
      var temp = {};
      temp.date = new Date(listForecast[i+5].dt_txt);
      temp.temp = ((listForecast[i].main.feels_like)).toFixed(0);
      temp.temp_max = ((listForecast[i].main.temp_max)).toFixed(0);
      temp.temp_min = ((listForecast[i].main.temp_min)).toFixed(0);
      temp.humidity = listForecast[i].main.humidity;
      temp.pressure = listForecast[i].main.pressure;
      temp.wind = listForecast[i].wind.speed;
      temp.main = listForecast[i].weather[0].main;
      temp.description = listForecast[i+3].weather[0].description;
      temp.icon = listForecast[i].weather[0].icon;
      days.push(temp);
    }   
          setWeatherData(days)
          setTodayWeatherForecast(listForecast.slice(0,4))
      })
      .catch(function(error) {
        console.log(error);
      }).finally(() => setTimeout(()=>{
        setIsLoading(false)

        },1500)
      )
    }
    weather()
    weatherForecast()
  }, [coord.lat , coord.lon]);
  return (
    <Container fluid className="main-content-container px-4 py-2">
      {/* Page Header */}
      <Row noGutters className="page-header py-4">
        <PageTitle
          sm="4"
          title="Weather Forecast"
          subtitle="Overview"
          className="text-sm-left"
        />
      </Row>
      <h5>Today's forecast</h5>
      <Row>
        <Col lg="12" md="12" sm="12" className="mb-4">
          <Card small className="h-100">
            {
              offer === '2'
              ?
            <CardHeader className="border-bottom d-flex align-items-center justify-content-center">
                <FormSelect onChange={(e)=> {setCoord({lat :  e.target.value.split(",")[0],lon : e.target.value.split(",")[1] }); setFarmSelected(e.target.selectedOptions[0].text)}} value={coord}>
                  <option value="">Select Farm</option>
                      {
                        farms.map(farm=>{
                          
                          return(
                            <option value={`${farm.Latitude},${farm.Longitude}`}>{farm.name}</option>

                          )
                        })
                      }

                </FormSelect>
                
            </CardHeader>
              :
              null
            }
            {
              isLoading
              ?
              <LoadingSpinner />
              :
            <CardBody>
              <Row>
              <Col lg="12" md="12" sm="12" className="mb-12"><h3>{farmSelected}</h3></Col>
                <Col lg="3" md="12" sm="12" className="m-4 p-2" style={{borderRadius:20,boxShadow :"1px 2px 7px #bbb"}}>
                    <h5 style={{textAlign : 'center' ,fontWeight :'bold' ,fontSize : 24}}>
                      {moment(currentWeatherData.date).locale('En').format("dddd, D MMM")}
                    </h5> 
                    <h6  style={{textTransform:"uppercase",textAlign : 'center' ,fontWeight :'lighter' ,fontSize : 18}}>{currentWeatherData.description}</h6>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "row"
                      }}
                    >
                      <img
                        src={`http://openweathermap.org/img/w/${currentWeatherData.icon}.png`}
                        style={{ width: "100%", maxWidth: 120 }}
                        alt="weather SVG"
                      />
                      <h2
                        style={{
                          fontSize: "80px",
                          margin: 0,
                          lineHeight: "110px",
                          marginLeft: -10
                        }}
                      >
                        {parseFloat(currentWeatherData.temp).toFixed(0)}
                      </h2>
                      <h4 style={{ lineHeight: "80px", marginLeft: 5 }}>°C</h4>

                  </div>
                  <Row > 
                    <Col lg="7" md="12" sm="12">
                  <p style={{ margin: 5 ,fontSize : 14 }}> Temp Moy:{(Number(currentWeatherData.tempMax) + Number(currentWeatherData.tempMin) )/ 2 } °C</p> 
                  <p style={{ margin: 5 ,fontSize : 14 }}> Humidity:{currentWeatherData.humidity} %</p> 
                  <p style={{ margin: 5 ,fontSize : 14 }}> Pressure:{currentWeatherData.pressure} Pa</p> 
                  <p style={{ margin: 5 ,fontSize : 14 }}> Wind:{currentWeatherData.wind} Km/h</p>
                        
                    </Col>
                    <Col lg="5" md="12" sm="12">
                    
                  <p style={{ margin: 5 ,fontSize : 14 }}> Rain: {currentWeatherData.rain ? currentWeatherData.rain : 0} mm</p> 
                    </Col>
                  </Row>

                </Col>
                <Col lg="8" md="12" sm="12" className="mb-4">
                    <Row className="d-flex justify-content-center align-items-center" >

                    {
                      todayWeatherForecast && todayWeatherForecast.map(todayForecast=>{
                        let time = moment(todayForecast.dt_txt).format('LT')

                        return(
                          <WeatherSmallStat
                          icon={todayForecast.weather[0].icon}
                          Temp={todayForecast.main.temp}
                          humidity={todayForecast.main.humidity}
                          wind={todayForecast.wind.speed}
                          date={time}
                          />

                        )
                      })
                    }
                    </Row>
                </Col>
              </Row>
            </CardBody>
            }
          </Card>
        </Col>
      </Row>
      <h5>Upcomming days forecast</h5>
        <Card small className="d-flex p-2" >
      <Row className="d-flex justify-content-center align-items-center ">

            {
              weatherData && weatherData.map(forecast=>{
                let date = moment(forecast.date).locale('En').format('dddd, MMM D')
                return (
                    <WeatherSmallStat
                      icon={forecast.icon}
                      humidity={forecast.humidity}
                      Temp={forecast.temp}
                      maxTemp={forecast.temp_max}
                      minTemp={forecast.temp_min}
                      wind={forecast.wind}
                      date={date}
                    />
                )
              })
            }
      </Row>
        </Card>
    </Container>
  );
};

export default Weather;
