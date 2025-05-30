import moment from "moment";
import React, { useState, useEffect } from "react";
import { useHistory } from 'react-router-dom';
import { Button, Col } from "shards-react";
import "./../assets/Styles.css";
import { useTranslation } from "react-i18next";


export default function DBSensor({ filteredSensors }) {

  // const [batteryLevel, setBL] = useState({ BL: "High", numericBL: chargeLevel });
  const [signalLevel, setSL] = useState({ SL: "High", numericSL: 86 });
  const history = useHistory()
  const { t, i18n } = useTranslation();


  const [fieldStatus, setFS] = useState({
    resultState: 0, state: ''
  })

  const returnBL = () => {
    if ((Number(filteredSensors.charge) >= 90)) {
      return <i className="fas fa-battery-full"></i>;
    } else if ((Number(filteredSensors.charge) < 90) && (Number(filteredSensors.charge) > 70)) {
      return <i className="fas fa-battery-three-quarters"></i>;
    } else if (Number(filteredSensors.charge) === 50) {
      return <i className="fas fa-battery-half"></i>;
    } else if ((Number(filteredSensors.charge) > 40) && (Number(filteredSensors.charge) < 50)) {
      return <i className="fas fa-battery-quarter"></i>;
    } else {
      return <i className="fas fa-battery-empty"></i>;
    }
  };

  const percentageSensorData = () => {
    let moyenne = ""
    let percentage = ""
    moyenne = (parseFloat(filteredSensors.mv1) + parseFloat(filteredSensors.mv2) + parseFloat(filteredSensors.mv3)) / 3;
    percentage = (moyenne / 80) * 100;
    return percentage
  }
  const calculateLeftPosition = (value) => {
    const minValue = 20;
    const maxValue = 75;
    const adjustedValue = Math.max(minValue, Math.min(maxValue, parseFloat(value)));
    return `calc(${adjustedValue}% - 6px)`;
  };

  return (
    <Col lg="6" md="12" sm="12">
      <div className="sensor border">
        <div className="sensorHeader">
          <div className="sensorNameWrapper">
            {/* <p>{fieldsData.name}</p>
              <p>{fieldsData.soil_zone}</p> */}
          </div>

          <div className="sensorInfo">
            <div>
              <p style={{ marginRight: 5 }}>{parseInt(filteredSensors.signal).toFixed(0)}%</p>
              <i className="fas fa-signal"></i>
            </div>
            <div>
              <p style={{ marginLeft: 5, marginRight: 5 }}>
                {parseInt(filteredSensors.charge).toFixed(0)}%
              </p>
              {returnBL()}
            </div>
          </div>
        </div>
        <div>
          <p>QR: {filteredSensors.code}</p>
        </div>
          <section className="ProgressBarWrapper">
            <div className="stats-dates">
            <p style={{ fontSize: 13 }}>{t('niveau')} 1</p>
              <div className="Marker-tomorrow" style={{ left: calculateLeftPosition(filteredSensors.humidityMV1) }}>
                <svg _ngcontent-pxc-c161="" xmlns="http://www.w3.org/2000/svg" width="11" height="13" viewBox="0 0 14 17" class="drop-element ng-star-inserted" style={{ left: "calc(59.7044% - 6px)" }}><g _ngcontent-pxc-c161="" fill="none"><path _ngcontent-pxc-c161="" d="M7.8 0.4L7.5 0 7.1 0.4C6.9 0.7 1.1 7.3 1.1 11.9 1.1 15.1 4 17.6 7.5 17.6 11 17.6 13.8 15.1 13.8 11.9 13.8 7.3 8.1 0.7 7.8 0.4Z" fill="#FE3C65" class="drop" style={{ fill: "rgb(16, 201, 160)" }}></path><path _ngcontent-pxc-c161="" d="M13.8 11.9C13.8 7.3 8.1 0.7 7.8 0.4L7.5 0 7.1 0.4C7 0.6 5 2.8 3.4 5.5 2.2 7.6 1.1 9.9 1.1 11.9 1.1 15.1 4 17.6 7.5 17.6 11 17.6 13.8 15.1 13.8 11.9Z" stroke="#FFF"></path></g></svg>
              </div>
              <div className="Segment1"></div>
            </div>
            <div className="stats-dates">
            <span style={{ fontSize: 13 }}>{t('niveau')} 2</span>
              <div className='Marker' style={{ left: calculateLeftPosition(filteredSensors.humidityMV2) }}>
                <svg _ngcontent-pxc-c161="" xmlns="http://www.w3.org/2000/svg" width="14" height="17" viewBox="0 0 14 17" class="drop-element ng-star-inserted"><g _ngcontent-pxc-c161="" fill="none"><path _ngcontent-pxc-c161="" d="M7.8 0.4L7.5 0 7.1 0.4C6.9 0.7 1.1 7.3 1.1 11.9 1.1 15.1 4 17.6 7.5 17.6 11 17.6 13.8 15.1 13.8 11.9 13.8 7.3 8.1 0.7 7.8 0.4Z" fill="#FE3C65" class="drop" style={{ fill: "rgb(16, 201, 160)" }}></path><path _ngcontent-pxc-c161="" d="M13.8 11.9C13.8 7.3 8.1 0.7 7.8 0.4L7.5 0 7.1 0.4C7 0.6 5 2.8 3.4 5.5 2.2 7.6 1.1 9.9 1.1 11.9 1.1 15.1 4 17.6 7.5 17.6 11 17.6 13.8 15.1 13.8 11.9Z" stroke="#FFF"></path></g></svg>
              </div>
              <div className="Segment2"></div>
            </div>
            <div className="stats-dates">
            <p style={{ fontSize: 13 }}>{t('niveau')} 3</p>
              <div className='Marker' style={{ left: calculateLeftPosition(filteredSensors.humidityMV3) }}>
                <svg _ngcontent-pxc-c161="" xmlns="http://www.w3.org/2000/svg" width="14" height="17" viewBox="0 0 14 17" class="drop-element ng-star-inserted" style={{ left: "calc(59.7044% - 6px)" }}><g _ngcontent-pxc-c161="" fill="none"><path _ngcontent-pxc-c161="" d="M7.8 0.4L7.5 0 7.1 0.4C6.9 0.7 1.1 7.3 1.1 11.9 1.1 15.1 4 17.6 7.5 17.6 11 17.6 13.8 15.1 13.8 11.9 13.8 7.3 8.1 0.7 7.8 0.4Z" fill="#FE3C65" class="drop" style={{ fill: "rgb(16, 201, 160)" }}></path><path _ngcontent-pxc-c161="" d="M13.8 11.9C13.8 7.3 8.1 0.7 7.8 0.4L7.5 0 7.1 0.4C7 0.6 5 2.8 3.4 5.5 2.2 7.6 1.1 9.9 1.1 11.9 1.1 15.1 4 17.6 7.5 17.6 11 17.6 13.8 15.1 13.8 11.9Z" stroke="#FFF"></path></g></svg>
              </div>
              <div className="Segment3"></div>
            </div>
            <div className="status">
              <div>{t('Critical')}</div>
              <div style={{ color: "#26cc94" }}>{t('Optimal')}</div>
              <div>{t('Full')}</div>
            </div>
          </section>
          <div className="sensorFooter">
            <p>{t('last_reading')} :</p>
            <p>{moment(filteredSensors.time).locale('fr').format('L, LT')}</p>
          </div>
          <div className="sensorFooter d-flex justify-content-around align-items-center ">
            <Button theme="info" onClick={() => { history.push(`/my-history/${filteredSensors.code}`) }}><i className='material-icons'>&#xe889;</i> {t('history')}</Button>
            {/* <Button theme="info" onClick={() => { history.push(`/my-sensor/${filteredSensors.code}`)}}><i className='material-icons'>&#xe889;</i> View Sensor Stats</Button> */}

          </div>

      </div>
    </Col>





  );
}
