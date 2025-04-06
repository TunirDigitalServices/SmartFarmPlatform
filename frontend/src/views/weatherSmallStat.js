import React, { useState, useEffect, useRef } from "react";
import { Container, Row, Col, Card, CardBody, CardHeader } from "shards-react";
import PropTypes from "prop-types";

import chanceflurries from "../images/icons/chanceflurries.svg";
import chancerain from "../images/icons/chancerain.svg";
import chancesleet from "../images/icons/chancesleet.svg";
import chancesnow from "../images/icons/chancesnow.svg";
import chancetstorms from "../images/icons/chancetstorms.svg";
import clearnight from "../images/icons/clear-night.jpg";
import clearday from "../images/icons/clear.svg";
import cloudy from "../images/icons/cloudy.svg";
import flurries from "../images/icons/flurries.svg";
import fog from "../images/icons/fog.svg";
import hail from "../images/icons/hail.jpg";
import hazy from "../images/icons/hazy.svg";
import mostlycloudynight from "../images/icons/mostlycloudy-night.jpg";
import mostlycloudy from "../images/icons/mostlycloudy-day.svg";
import mostlysunnynight from "../images/icons/mostlysunny-night.jpg";
import mostlysunny from "../images/icons/mostlysunny-day.svg";
import partlycloudynight from "../images/icons/partlycloudy-night.jpg";
import partlycloudy from "../images/icons/partlycloudy-day.svg";
import partlysunnynight from "../images/icons/partlysunny-night.jpg";
import partlysunny from "../images/icons/partlysunny-day.svg";
import rain from "../images/icons/rain.svg";
import sleet from "../images/icons/sleet.jpg";
import snow from "../images/icons/snow.svg";
import sunnynight from "../images/icons/sunny-night.svg";
import sunny from "../images/icons/sunny.svg";
import tstorms from "../images/icons/tstorms.svg";
import unknown from "../images/icons/unknown.svg";
import wind from "../images/icons/wind.jpg";

import "./../assets/Styles.css";
import "./Styles.css";

const WeatherSmallStat = props => {
  const [svg, setSVG] = useState("");

  useEffect(() => {
    switch (props.icon) {
      case "chanceflurries":
        setSVG(chanceflurries);
        break;
      case "chancerain":
        setSVG(chancerain);
        break;
      case "chancesleet":
        setSVG(chancesleet);
        break;
      case "chancesnow":
        setSVG(chancesnow);
        break;
      case "chancetstorms":
        setSVG(chancetstorms);
        break;
      case "clearnight":
        setSVG(clearnight);
        break;
      case "clearday":
        setSVG(clearday);
        break;
      case "cloudy":
        setSVG(cloudy);
        break;
      case "flurries":
        setSVG(flurries);
        break;
      case "fog":
        setSVG(fog);
        break;
      case "hail":
        setSVG(hail);
        break;
      case "hazy":
        setSVG(hazy);
        break;
      case "mostlycloudynight":
        setSVG(mostlycloudynight);
        break;
      case "mostlycloudyday":
        setSVG(mostlycloudy);
        break;
      case "mostlysunnynight":
        setSVG(mostlysunnynight);
        break;
      case "mostlysunnyday":
        setSVG(mostlysunny);
        break;
      case "partlycloudynight":
        setSVG(partlycloudynight);
        break;
      case "partlycloudyday":
        setSVG(partlycloudy);
        break;
      case "partlysunnynight":
        setSVG(partlysunnynight);
        break;
      case "partlysunnyday":
        setSVG(partlysunny);
        break;
      case "rain":
        setSVG(rain);
        break;
      case "sleet":
        setSVG(sleet);
        break;
      case "snow":
        setSVG(snow);
        break;
      case "sunnynight":
        setSVG(sunnynight);
        break;
      case "sunny":
        setSVG(sunny);
        break;
      case "tstorms":
        setSVG(tstorms);
        break;

      case "wind":
        setSVG(wind);
        break;

      default:
        setSVG(unknown);
        break;
    }
    if (props.onChange) {
      props.onChange(
        <img
          src={svg}
          alt="svg"
          style={{ height: 120, width: 120, marginRight: 20 }}
        />
      );
    }
  }, [props.icon]);

  return (
    <Col lg="2" md="6" sm="6" className="my-4" style={{borderRadius:20,boxShadow :"1px 2px 9px #bbb",marginRight : 10 }}>
      <div  className="h-100">
        <div className="px-0 d-flex flex-column align-items-center">
          <h6 style={{ margin: 0 ,fontWeight: "bold"}}>
            {props.date}
          </h6>
          <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "60%"
              }}
            >
              <img
                src={`http://openweathermap.org/img/w/${props.icon}.png`}
                style={{ width: "100%", maxWidth: 150}}
                alt="weather SVG"
              />
            </div>
        </div>
        <div className="pt-0 ">
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              textAlign:"center"
            }}
          >
              <p style={{ margin: 0 }}>
               {parseFloat(props.Temp).toFixed(0)}°C {" "}
              </p>
              <p style={{ margin: 0 }}>Wind: {props.wind} Km/h </p>
     
              <p style={{ margin: 0 }}>Hum: {props.humidity}%</p>
           
          </div>
        </div>
      </div>
    </Col>
  );
};

WeatherSmallStat.prototype = {
  icon: PropTypes.string
};

export default WeatherSmallStat;
