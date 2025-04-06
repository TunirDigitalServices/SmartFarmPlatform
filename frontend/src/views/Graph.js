import React ,{useState,useEffect} from "react";
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  CardFooter,
  Badge,
  CardHeader,
  Button,
  FormSelect
} from "shards-react";

import PageTitle from "../components/common/PageTitle";
import Chart from "../components/blog/Chart";
import "./../assets/Styles.css";
import api from '../api/api';
import LoadingSpinner from "../components/common/LoadingSpinner";
import { useTranslation } from "react-i18next";
import TempChart from "../components/blog/TempChart";
import PressionChart from "../components/blog/PressionChart";
import HumidityChart from "../components/blog/HumidityChart";
import SubSoilHumidityChart from "../components/blog/SubSoilHumidityChart";
import swal from "sweetalert";


const Graph = () => {
  const [selectedChart, setSelectedChart] = useState("");


  const handleSelectChart = (chartName) => {
    setSelectedChart(chartName);
  };

  
  const handleClearSelection = () => {
    setSelectedChart(null);
  };
  const { t, i18n } = useTranslation();

      const [name,setName] = useState('')
      const [sensors,setSensors ] = useState([])
      const [dataSensor,setDataSensors] = useState([])
      const [value ,setValue ] = useState(localStorage.getItem('code'))
      const [isLoading,setIsLoading]= useState(true)
 
  let Uid = localStorage.getItem('Field')

  useEffect(()=>{
    getHistorySensor()
    getSensorsCodes()
    getSelectedField()
  },[])
  
  const getSelectedField = async () => {

    let dataField = {
        field_uid: Uid,
    }

    await api.post('/field', dataField)
        .then(res => {
            let fieldData = res.data.field
            setName(fieldData.name)                      
        }).catch(error => {
            swal({
                title: "Error",
                icon: "error",

            });

        })
}


const getHistorySensor = async (page) => {
  
  let dateEnd = new Date();
  let dateStart = new Date(dateEnd); 
  
  dateStart.setDate(dateEnd.getDate() - 7);
    await  api.get(`/sensor/sensor-history/${value}/${dateStart}/${dateEnd}?pageNum=${1}&limit=21`)
      .then(response=>{
          let historyResult = response.data.history
          let sensorCoords = response.data.sensor_id
          setDataSensors(historyResult)
        

      })
      .catch(err=>{
          console.log(err)
      }).finally(() => setIsLoading(false))

  
 }
 console.log(dataSensor)
  const getSensorsCodes = async () => {
   await api.get(`/field/${Uid}/sensors`)
    .then(response => {
      let sensors = response.data.sensors
        setSensors(sensors)
    })
    .catch(err=>{
      console.log(err)
    })
    
  }


 
    return (
      <Container fluid className="main-content-container px-4">
        {/* Page Header */}
        <Row noGutters className="page-header py-4">
          <PageTitle
            sm="4"
            title={name}
            subtitle="Detailed Graphs"
            className="text-sm-left"
          />
        </Row>
        {
          isLoading
          ?
          <LoadingSpinner />
          :
          <>
        <Row className="d-flex justify-content-center py-4">
          <Col lg="4" md="6" sm="6" >
          <FormSelect value={value} onChange={e => setValue( e.target.value)}>
            <option value="">{t('select_sensor')}</option>
            {
              sensors.map(sensor =>{
                return <option value={sensor.code} >{sensor.code}</option>
              })
            }
          </FormSelect>
          </Col>
        </Row>
        {/* First Row of Posts */}
        <Row>
        {selectedChart ? ( 
          <Col lg="12" md="12" sm="12" className="mb-4">
            <Row className="d-flex justify-content-center m-2">
                  <Button onClick={handleClearSelection} outline theme="info">
                    {t("see_all")}
                  </Button>
                </Row>
            {selectedChart === "TempChart" && (
              <TempChart title={t("Temp.")} data={dataSensor} onSelect={handleSelectChart} />
            )}
            {selectedChart === "PressionChart" && (
              <PressionChart
                title={t("Pression.")}
                data={dataSensor}
                onSelect={handleSelectChart}
              />
            )}
            {selectedChart === "HumidityChart" && (
              <HumidityChart
                title={t("Humidity")}
                data={dataSensor}
                onSelect={handleSelectChart}
              />
            )}
            {selectedChart === "SubSoilHumidityChart" && (
              <SubSoilHumidityChart
                title="Subsoil Humidity"
                data={dataSensor}
                onSelect={handleSelectChart}
              />
            )}
           
          </Col>
        ) : ( // If no chart is selected, show all four charts
          <>
            <Col lg="6" md="12" sm="12" className="mb-4">
              <TempChart title={t("Temp.")} data={dataSensor} onSelect={handleSelectChart} />
            </Col>
            <Col lg="6" md="12" sm="12" className="mb-4">
              <PressionChart
                title={t("Pression.")}
                data={dataSensor}
                onSelect={handleSelectChart}
              />
            </Col>
            <Col lg="6" md="12" sm="12" className="mb-4">
              <HumidityChart
                title={t("Humidity")}
                data={dataSensor}
                onSelect={handleSelectChart}
              />
            </Col>
            <Col lg="6" md="12" sm="12" className="mb-4">
              <SubSoilHumidityChart
                title="Subsoil Humidity"
                data={dataSensor}
                onSelect={handleSelectChart}
              />
            </Col>
          </>
        )}
      </Row>
      {/* <Row className="d-flex justify-content-center py-4">
        <Col lg="4" md="6" sm="6">
          <Button
            onClick={() => handleSelectChart("TempChart")}
            theme="info"
            className="mr-2"
          >
            {t("Show Temp. Chart")}
          </Button>
          <Button
            onClick={() => handleSelectChart("PressionChart")}
            theme="info"
            className="mr-2"
          >
            {t("Show Pression Chart")}
          </Button>
          <Button
            onClick={() => handleSelectChart("HumidityChart")}
            theme="info"
            className="mr-2"
          >
            {t("Show Humidity Chart")}
          </Button>
          <Button
            onClick={() => handleSelectChart("SubSoilHumidityChart")}
            theme="info"
          >
            {t("Show Subsoil Humidity Chart")}
          </Button>
        </Col>
      </Row> */}
        </>
        }
      </Container>
    );
  }

export default Graph;
