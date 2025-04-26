import React,{useState,useEffect} from 'react'
import { useTranslation } from 'react-i18next';
import { useParams,Link, useHistory } from 'react-router-dom'
import { Container ,Row ,Col } from 'shards-react';
import api from '../../api/api';
import LoadingSpinner from '../common/LoadingSpinner';
import PageTitle from '../common/PageTitle';
import Chart from "./Chart";
import HumidityChart from './HumidityChart';
import PressionChart from './PressionChart';
import SubSoilHumidityChart from './SubSoilHumidityChart';
import TempChart from './TempChart';


const SingleChart = () => {
  const { t, i18n } = useTranslation();

    const params = useParams()
    const history = useHistory()
    let type = params.type
    const [dataSensor,setDataSensor] = useState([])  
    const [fieldIndex,setFieldIndex] = useState(localStorage.getItem("Field"))
    const [isLoading , setIsLoading] = useState(true)
   useEffect(()=>{
    let is_Mounted = true;
    if(is_Mounted){
      getDataSensors()
    }
    return () => {is_Mounted = false}
  },[])
  const getDataSensors =  async () => {
    await api.get('/datasensor/get-data')
        .then(res => {
          let dataSensor = res.data.Datasensor
          setDataSensor(dataSensor)
        })
        .catch(err =>{
          console.log(err)
        })
        .finally(() => setIsLoading(false))

  }

    const goBackToGraphs = () => {
      history.push('/Graphs')
      // window.location.reload()
    }  

    const selectedChart = () => {
      switch (type) {
        case 'Temperature':
            return <TempChart title={type} data={dataSensor} />
            case 'Pression.':
              return <PressionChart title={type} data={dataSensor} />
              case 'Humidity':
                return <HumidityChart title={type} data={dataSensor} />
                case 'Subsoil Humidity':
                  return <SubSoilHumidityChart title={type} data={dataSensor} />
          
      
        default:
          break;
      }
    }

    return (
    <Container fluid className="main-content-container px-4">  
    <div className="py-2 border-bottom">
      <Link onClick={goBackToGraphs}><i className='material-icons border-right'>&#xe5e0;</i> All Graphs</Link>
    </div>
    <Row noGutters className="page-header py-4">
          <PageTitle
            sm="4"
            title={`${type}`}
            subtitle="Sensor Graph"
            className="text-sm-left"
          />
        </Row>     
        {
          isLoading 
          ?
          <LoadingSpinner />
          :

        <Col lg="12" md="12" sm="8" className="mb-4">
          {selectedChart()}
           {/* <TempChart title={type} data={dataSensor} /> */}
        </Col>
        }
    </Container>
  )
}

export default SingleChart