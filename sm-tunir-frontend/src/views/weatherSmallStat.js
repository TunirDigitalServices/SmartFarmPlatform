import React, { useState, useEffect, useRef } from "react";
import { Col  } from "react-bootstrap";
import PropTypes from "prop-types";

import chanceflurries from "../assets/images/icons/chanceflurries.svg";
import chancerain from "../assets/images/icons/chancerain.svg";
import chancesleet from "../assets/images/icons/chancesleet.svg";
import chancesnow from "../assets/images/icons/chancesnow.svg";
import chancetstorms from "../assets/images/icons/chancetstorms.svg";
import clearnight from "../assets/images/icons/clear-night.jpg";
import clearday from "../assets/images/icons/clear.svg";
import cloudy from "../assets/images/icons/cloudy.svg";
import flurries from "../assets/images/icons/flurries.svg";
import fog from "../assets/images/icons/fog.svg";
import hail from "../assets/images/icons/hail.jpg";
import hazy from "../assets/images/icons/hazy.svg";
import mostlycloudynight from "../assets/images/icons/mostlycloudy-night.jpg";
import mostlycloudy from "../assets/images/icons/mostlycloudy-day.svg";
import mostlysunnynight from "../assets/images/icons/mostlysunny-night.jpg";
import mostlysunny from "../assets/images/icons/mostlysunny-day.svg";
import partlycloudynight from "../assets/images/icons/partlycloudy-night.jpg";
import partlycloudy from "../assets/images/icons/partlycloudy-day.svg";
import partlysunnynight from "../assets/images/icons/partlysunny-night.jpg";
import partlysunny from "../assets/images/icons/partlysunny-day.svg";
import rain from "../assets/images/icons/rain.svg";
import sleet from "../assets/images/icons/sleet.jpg";
import snow from "../assets/images/icons/snow.svg";
import sunnynight from "../assets/images/icons/sunny-night.svg";
import sunny from "../assets/images/icons/sunny.svg";
import tstorms from "../assets/images/icons/tstorms.svg";
import unknown from "../assets/images/icons/unknown.svg";
import wind from "../assets/images/icons/wind.jpg";

import "../assets/styling/Styles.css";
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
