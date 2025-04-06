import { useEffect } from "react";
import weatherPin from "./weatherPin";

function WeatherPins(props) {
  const pinsArray = [];
  for (let index = 0; index < 4; index++) {
    if (props.isTemp == true) {
      pinsArray.push(
        weatherPin(
          props.pinsData[index].text,
          parseFloat(props.pinsData[index].tempValue).toFixed(0),
          props.pinsData[index].tempValue / 60,
          index,
          "°"
        )
      );
    } else {
      pinsArray.push(
        weatherPin(
          props.pinsData[index].text,
          parseFloat(props.pinsData[index].precipValue).toFixed(0),
          props.pinsData[index].precipValue / 140,
          index
        )
      );
    }
  }

  return pinsArray;
}

export default WeatherPins;
