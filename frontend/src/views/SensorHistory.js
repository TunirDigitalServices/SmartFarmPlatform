import React ,{useEffect,useState,useRef} from 'react'
import { Button, Row, Col, FormGroup, Form, FormInput, Container, Card,CardBody,CardHeader ,FormSelect, Nav, NavItem, NavLink } from 'shards-react'
import PageTitle from '../components/common/PageTitle'
import { useTranslation } from "react-i18next";
import RangeDatePicker from '../components/common/RangeDatePicker';
import api from '../api/api';
import PaginateHistory from './PaginateHistory';
import { useHistory, useParams   } from 'react-router-dom';
import moment from 'moment';
import { DownloadTableExcel } from "react-export-table-to-excel";
import SensorHistoryChart from './SensorHistoryChart';
import SolarRadiationChart from './SolarRadiationChart';


const SensorHistory = () => {
    const table = useRef(null)
    const [toggle, setToggle] = useState(true)
    const [toggleView, setToggleView] = useState(true)
    const { t, i18n } = useTranslation();
    const history = useHistory()
    const [codeSensor,setCodeSensor] = useState('')
    const [clicked,setClicked] = useState(false)
    const [pageNum,setPageNum] = useState(1)
    const [limit,setLimit] = useState(10)
    const [historyData,setHistoryData] = useState('')
    const [sensorId,setSensorId] = useState("")
    const [sensorList,setSensorList] = useState([])
    const [dateValue,setDateValue] = useState({
        dateStart: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        dateEnd : new Date()
    })
    let role = JSON.parse(localStorage.getItem('user')).role
    const [radData,setRadData] = useState([])
    const [dataET0,setDataET0] = useState([])
    const [mappingData,setMappingData] = useState([])
    const [mappingMv1,setMappingMv1] = useState("")
    const [mappingMv2,setMappingMv2] = useState("")
    const [mappingMv3,setMappingMv3] = useState("")
    let { id } = useParams();
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
   useEffect(()=>{
       
        const getSunRadiation = async () => {
                try {
                    await api.get('/radiation')
                    .then(response =>{
                        let arr = []
                        if(response){
                            let dates = response.data.dateTime
                            let radValues = response.data.radiation
                            let dataET0 = response.data.ET0
                            for (let index = 0; index < dates.length; index++) {
                                arr.push({
                                    date: dates[index],
                                    value : radValues[index]
                                });
                                
                            }
                            setDataET0(dataET0)
                            setRadData(arr)
                        }
                    })
                    .catch(err =>{
                        console.log(err)
                    })
                } catch (error) {
                    console.log(error)
                }
        }
        
       const getSensorsList = async () => {
        try {
            await api.get(`/sensor/sensors`)
            .then(response=>{
                let sensors = response.data
                setSensorList(sensors)
            }).catch(err=>{
                console.log(err)
            })
            
        } catch (error) {
            console.log(error)
        }
        
           
        }
        getSunRadiation()
        getSensorsList()
   },[]) 


   const getHistorySensor = async (page) => {
    console.log(dateValue.dateEnd)
      await  api.get(`/sensor/sensor-history/${codeSensor}/${dateValue.dateStart}/${dateValue.dateEnd}?pageNum=${0}&limit=60`)
        .then(response=>{
            let historyResult = response.data.history
            let sensorCoords = response.data.sensor_id
            setHistoryData(historyResult)
            setCurrentPage(page);
            setTotalPages(response.data.totalPages);
            setMappingData(response.data.dataMapping)

        })
        .catch(err=>{
            console.log(err)
        })

    
   }
    useEffect(()=>{
        if(typeof id !== 'undefined'){
            setCodeSensor(id)
        }
        if(codeSensor !== "" && clicked) {
            getHistorySensor(currentPage)

        }
    },[codeSensor,dateValue.dateEnd,dateValue.dateStart,clicked])
    const mappingMv = ( date, idSensor, vals) => {
        let valaueAfterMapping = []
        
        let arrayDatemv1 = [];
        let arrayDatemv2 = [];
        let arrayDatemv3 = [];
        mappingData.map(dataMapping => {
            arrayDatemv1.push(dataMapping.date['Mv1_date'])
            arrayDatemv2.push(dataMapping.date['Mv2_date'])
            arrayDatemv3.push(dataMapping.date['Mv3_date'])
        })
        let dateMappingSelectedmv1 = "";
        let dateMappingSelectedmv2 = "";
        let dateMappingSelectedmv3 = "";
        
        if(arrayDatemv1.length > 0){
            arrayDatemv1.push(date.slice(0, 10));
            arrayDatemv1.sort();
            
            arrayDatemv1.map((dateMapping, i) => {
                if(dateMapping == date.slice(0, 10)){
                    if(typeof arrayDatemv1[i-1] !== "undefined"){
                        dateMappingSelectedmv1 = arrayDatemv1[i-1]
                    }
                }
            })
            
        }
        
        if(arrayDatemv2.length > 0){
            arrayDatemv2.push(date.slice(0, 10));
            arrayDatemv2.sort();
            arrayDatemv2.map((dateMapping, i) => {
                if(dateMapping == date.slice(0, 10)){
                    if(typeof arrayDatemv2[i-1] !== "undefined"){
                        dateMappingSelectedmv2 = arrayDatemv2[i-1]
                    }
                }
            })
        }
        if(arrayDatemv3.length > 0){
            arrayDatemv3.push(date.slice(0, 10));
            arrayDatemv3.sort();
            arrayDatemv3.map((dateMapping, i) => {
                if(dateMapping == date.slice(0, 10)){
                    if(typeof arrayDatemv3[i-1] !== "undefined"){
                        dateMappingSelectedmv3 = arrayDatemv3[i-1]
                    }
                }
            })
            
        }
        if(mappingData.length == 0){
            vals.map((val, index) => {
                valaueAfterMapping[index] = parseFloat(val);
            })
        }
        mappingData.map(dataMapping => {
            
            vals.map((val, index) => {
                valaueAfterMapping[index] = val;
                let num = parseInt(index+1);

                let keyData = 'Mv'+num+'_date'
                let keyDataMax = 'Mv'+num+'_max'
                let keyDataMin = 'Mv'+num+'_min'
                if(dateMappingSelectedmv1 != "" && num == 1){
                    
                    
                    if(dateMappingSelectedmv1 == dataMapping.date[keyData]){
                        if(val >= parseFloat(dataMapping.max[keyDataMax])  && val <= parseFloat(dataMapping.min[keyDataMin])){
                            valaueAfterMapping[index] = (((parseFloat(val) - dataMapping.max[keyDataMax]) / (dataMapping.min[keyDataMin] - dataMapping.max[keyDataMax])) * 100).toFixed(2)
                        }

                    }
                    
                }
                if(dateMappingSelectedmv2 != ""  && num == 2){
                    if(dateMappingSelectedmv2 == dataMapping.date[keyData]){
                        if(val >= parseFloat(dataMapping.max[keyDataMax])  && val <= parseFloat(dataMapping.min[keyDataMin])){
                            valaueAfterMapping[index]  = (((parseFloat(val) - parseFloat(dataMapping.max[keyDataMax]))  / (dataMapping.min[keyDataMin] - dataMapping.max[keyDataMax])) * 100).toFixed(2)
                    }
                    }
                }
                if(dateMappingSelectedmv3 != "" &&  num == 3){
                    if(dateMappingSelectedmv3 == dataMapping.date[keyData]){
                        if(val >= parseFloat(dataMapping.max[keyDataMax])  && val <= parseFloat(dataMapping.min[keyDataMin])){
                            valaueAfterMapping[index]  = (((parseFloat(val) - parseFloat(dataMapping.max[keyDataMax])) / (dataMapping.min[keyDataMin] - dataMapping.max[keyDataMax])) * 100).toFixed(2)
                        }
                    }
                }
            })
        })
        return valaueAfterMapping;
      }

//    const filteredHistory = historyData && historyData.filter(history => {
//         let arraymv = mappingMv(history.time, sensorId, [history.mv1, history.mv2, history.mv3]) 

//         history.mv1 = arraymv[0];
//         history.mv2 = arraymv[1];
//         history.mv3 = arraymv[2];
//     let dates = new Date(history.time)
//         let filterHistory = true
//         if (dateValue.startDate) {
//           filterHistory = filterHistory && (new Date(dateValue.startDate) < dates)
//         }
//         if (dateValue.endDate) {
//           filterHistory = filterHistory && (new Date(dateValue.endDate) > dates)
//         }
//         return filterHistory

// })

// const paginate = (pageNumber) => setPageNum(pageNumber);

// const indexOfLastItem = pageNum * limit;
// const indexOfFirstItem = indexOfLastItem - limit;
// const currentItems = historyData.slice(indexOfFirstItem, indexOfLastItem);

      const handlePageChange = (page) => {
        getHistorySensor(page);
      };

      const downloadHistoryData = async () => {
        let limit = historyData.length * totalPages
        try {
          const response = await api.get(`/sensor/sensor-history/${codeSensor}/${dateValue.dateStart}/${dateValue.dateEnd}?limit=${limit}`);
          const historyResult = response.data.history;
          const sensorCoords = response.data.sensor_id;
          
          let csvContent = 'Date,Temp (°C),Humidity (%),Pressure (kPa),Altitude (M),Soil Temp (°C),Humidity 20cm (%),Humidity 40cm (%),Humidity 60cm (%),Humidity 20cm,Humidity 40cm,Humidity 60cm\r\n';
          historyResult.forEach(history => {
            csvContent += `${history.time},${history.temperature},${history.humidity},${history.pressure},${history.altitude},${history.ts},${history.mv1},${history.mv2},${history.mv3},${history.niv1},${history.niv2},${history.niv3}\r\n`;
          });
      
          const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
      
          const downloadLink = document.createElement('a');
          downloadLink.href = URL.createObjectURL(blob);
          downloadLink.download = `sensor_history_${sensorCoords}_${moment(dateValue.dateStart).format('YYYYMMDD')}_${moment(dateValue.dateEnd).format('YYYYMMDD')}.csv`;
          downloadLink.click();
        } catch (error) {
          console.log(error);
        }
      };
      
      
return (
    <Container fluid className="main-content-container p-4">
        <Row noGutters className="page-header d-flex justify-content-between align-items-center py-4">
            <PageTitle 
                 sm="4"
                 subtitle={t('View your sensors data history')}
                 title='My Sensors History'
                 className="text-sm-left"
            />
            <div>
                <Button theme="info" onClick={() => history.push('/AddSensor')}><i className='material-icons'>&#xe145;</i> Add Sensor</Button>

            </div>
        </Row>
        <Row className="d-flex justify-content-around align-items-center">
            {
           (typeof id === 'undefined')
           ?
            <Col lg='4' md="12" sm="12">
            <FormGroup>
                    <FormSelect
                        onChange={(e) => setCodeSensor(e.target.value)}
                        value={codeSensor}
                    >
                        <option value="">{t('select_sensor')}</option>
                            {
                                    sensorList.map(sensor=>{
                                        return(
                                            
                                            <option style={{cursor :"pointer"}} value={sensor.code}>{sensor.code}</option>
                                            
                                            
                                            )
                                        })
                            }
                    </FormSelect>
            </FormGroup>
            </Col>
            :
            ''
            }
             <Col lg='4' md="12" sm='12' className="form-group">
                        <p style={{ margin: "0px" }}>{t('start_date')}</p>
                        <FormInput type="date" value={dateValue.dateStart} onChange={(e) => setDateValue({...dateValue,dateStart : e.target.value})} />
                      </Col>
                      <Col lg='4' md="12" sm='12' className="form-group">
                        <p style={{ margin: "0px" }}>{t('end_date')}</p>
                        <FormInput type="date" value={dateValue.dateEnd} onChange={(e) => setDateValue({...dateValue,dateEnd : e.target.value})}/>


                      </Col>
                      <Col lg='4' md="12" sm='12' className="form-group">
                        <p style={{ margin: "0px" }}>{t('search')}</p>
                        <Button onClick={() =>  setClicked(true)}>{t('search')}</Button>

                      </Col>
                      {/* {totalPages > 0 && (
                        <PaginateHistory
                        totalPages={totalPages}
                        currentPage={currentPage}
                        onPageChange={handlePageChange}
                        />
                    )} */}
        </Row>
        <Row>
            <Col lg='12' md="12" sm="12">
                <Card>
                    <CardHeader className="border-bottom">{codeSensor !== "" ? <span>{t('sensor_code')} : {codeSensor}</span> : null}</CardHeader>
                    <CardBody>
                        <Button onClick={() => setToggleView(!toggleView)}>{ toggleView ?  'View Solar Radiation' : 'View Sensor History' }</Button>
                        {
                                toggleView
                                ?
                                    <Row>
                                        <Col lg='12'md="12" sm="12">
                                            {
                                                historyData.length > 0 
                                                ?
                                            <div className='d-flex justify-content-end'>
                                                <DownloadTableExcel
                                                    filename="history table"
                                                    sheet="history"
                                                    currentTableRef={table.current}
                                                >
                                                <Button theme="info" ><i className='material-icons'>&#xf090;</i> Download this page</Button>

                                                </DownloadTableExcel>
                                                       <Button className="mx-2" theme="info" onClick={downloadHistoryData}>
                                                             <i className='material-icons'>&#xf090;</i> Download History
                                                        </Button>
                                                <Button className="mx-2" onClick={() => setToggle(!toggle)}>{toggle ? "View Chart"  : "View Table"}</Button>

                                            </div>

                                                :
                                                null
                                            }
                                            <div id="table-wrapper" className={`${toggle ? '' : 'd-none'}`}>
                                                <div id="table-scroll">
                                                    <table ref={table} className="table mb-4 table-hover table-bordered  tabel-responsive-lg " style={{overflowX : "scroll"}}>
                                        <thead className="bg-light text-center">
                                            <tr>
                                                <th style={{fontSize:12}} scope="col" className="border-0">{t('Date')} (GMT)</th>
                                                <th style={{fontSize:12}} scope="col" className="border-0">{t('Temp.')} (°C)</th>
                                                <th style={{fontSize:12}} scope="col" className="border-0">{t('Humidity')} (%)</th>
                                                <th style={{fontSize:12}} scope="col" className="border-0">{t('Pressure')} (kPa)</th>
                                                <th style={{fontSize:12}} scope="col" className="border-0">{t('Altitude')} (M)</th>
                                                <th style={{fontSize:12}} scope="col" className="border-0">{t('subsoil_Temp.')} (°C)</th>
                                                <th style={{fontSize:12}} scope="col" className="border-0">{t('Humidity')} 20cm(%)</th>
                                                <th style={{fontSize:12}} scope="col" className="border-0">{t('Humidity')} 40cm(%)</th>
                                                <th style={{fontSize:12}} scope="col" className="border-0">{t('Humidity')} 60cm(%)</th>
                                                <th style={{fontSize:12}} scope="col" className="border-0">{t('Humidity 20cm')} (%)</th>
                                                <th style={{fontSize:12}} scope="col" className="border-0">{t('Humidity 40cm')} (%)</th>
                                                <th style={{fontSize:12}} scope="col" className="border-0">{t('Humidity 60cm')} (%)</th>
                                                <th style={{fontSize:12}} scope="col" className="border-0">{t('Charge')}</th>    
                                                {/* <th style={{fontSize:12}} scope="col" className="border-0">{t('Voltage adc')}</th>                                                                    
                                                <th style={{fontSize:12}} scope="col" className="border-0">{t('ET0')}</th>                                     */}
                                            </tr>
                                        </thead>
                                            <tbody>
                                                        {
                                                       historyData && historyData.map(sensorData=>{
                                                            // let date = sensorData.time.slice(0,10)
                                                            let dailyET0 = "" 
                                                            let lat = ""
                                                            let lon = ""
                                                            // dataET0.map(value=>{
                                                            //     if(value.date == date){
                                                            //         dailyET0 = value.ET0
                                                                    
                                                            //     }
                                                            // })
                                                            let press = Number(sensorData.pressure) / 1000
                                                            let subSoilTemp = "-"
                                                            if(sensorData.ts !== "-127.000"){
                                                                subSoilTemp = sensorData.ts
                                                            }
                                                            return(
                                                                    <tr>
                                                                        <td>{sensorData.time} </td>
                                                                        {/* <td>{coords.latitude}</td>
                                                                        <td>{coords.longitude}</td> */}
                                                                        <td>{sensorData.temperature}</td>
                                                                        <td>{sensorData.humidity}</td>
                                                                        <td>{parseFloat(press).toFixed(2)}</td>
                                                                        <td>{sensorData.altitude}</td>
                                                                        <td className='text-center'>{subSoilTemp}</td>
                                                                        <td>{sensorData.mv1}</td>
                                                                        <td>{sensorData.mv2}</td>
                                                                        <td>{sensorData.mv3}</td>
                                                                        <td>{sensorData.niv1}</td>
                                                                        <td>{sensorData.niv2}</td>
                                                                        <td>{sensorData.niv3}</td>
                                                                        <td>{Number(sensorData.charge)}</td>
                                                                        {/* <td>{Number(sensorData.adc) * -1}</td> */}

                                                                        {/* <td>{dailyET0}</td> */}
                                                                    </tr>
                                                                    
                                                                    )
                                                                })
                                                            }

                                            </tbody>
                                                    </table>
                                                        
                                                
                                                </div>

                                            </div>
                                        </Col>
                                        <Col className={`${toggle ? 'd-none' : ''}`} lg="12" md="8" sm="8">
                                                <SensorHistoryChart data={historyData} />
                                            </Col>
                                    </Row>
                                :
                                    <Row>
                                        <Col lg='12'md="12" sm="12">
                                            {/* <PaginateHistory nPages={nPages} currentPage={currentPage} setCurrentPage={setCurrentPage} /> */}
                                            <div className='d-flex justify-content-end'>
                                                <DownloadTableExcel
                                                    filename="history table"
                                                    sheet="history"
                                                    currentTableRef={table.current}
                                                >
                                                <Button theme="info" ><i className='material-icons'>&#xf090;</i></Button>

                                                </DownloadTableExcel>
                                                <Button className="mx-2" onClick={() => setToggle(!toggle)}>{toggle ? "View Chart"  : "View Table"}</Button>

                                            </div>
                                            <div id="table-wrapper" className={`${toggle ? '' : 'd-none'}`}>
                                                <h5 className='text-center'>Week Solar Radiation</h5>
                                                <div id="table-scroll">
                                                    <table ref={table} className="table mb-4 table-hover table-bordered  tabel-responsive-lg " style={{overflowX : "scroll"}}>
                                        <thead className="bg-light text-center">
                                            <tr>
                                                <th scope="col" className="border-0">{t('Date')}</th>
                                                <th scope="col" className="border-0">{t('Solar Radiation')}</th>
                                                                    

                                            </tr>
                                        </thead>
                                            <tbody>
                                                        {
                                                    radData && radData.map(data=>{
                                                        let date = moment(data.date).locale('en-EN').format("ddd, h a")
                                                            return(
                                                                    <tr>
                                                                        <td>{date}</td>
                                                                        <td>{data.value}</td>


                                                                    </tr>
                                                                    
                                                                    )
                                                                })
                                                            }

                                            </tbody>
                                                    </table>
                                                        
                                                
                                                </div>

                                            </div> 
                                        </Col>
                                        <Col className={`${toggle ? 'd-none' : ''}`} lg="12" md="8" sm="8">
                                                <SolarRadiationChart data={radData} />
                                            </Col>
                                
                                    </Row>
                        }
                    </CardBody>
                </Card>

            </Col>
        </Row>
    </Container>
  )
}

export default SensorHistory