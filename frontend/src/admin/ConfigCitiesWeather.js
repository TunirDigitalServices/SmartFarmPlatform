import React, { useEffect, useState ,useCallback} from 'react'
import { Container, Card, CardHeader, CardBody, ListGroup, ListGroupItem, Row, Col, Form, FormGroup, FormInput, FormSelect, FormTextarea, ButtonGroup, Button, Progress, Modal, ModalHeader, ModalBody, BreadcrumbItem, Breadcrumb, Nav, NavItem, NavLink } from "shards-react";
import PageTitle from '../components/common/PageTitle';
import { useTranslation } from 'react-i18next';
import { Link , useHistory , useParams } from 'react-router-dom';
import api from '../api/api';
import swal from 'sweetalert';
import Pagination from '../views/Pagination';
import moment from 'moment';

const ConfigCitiesWeather = () => {

    const params = useParams()
    let Id = params.id
    const { t, i18n } = useTranslation();



    const Months = moment.monthsShort()
    const [weatherTemp, setWeatherTemp] = useState({})
    const [weatherHumd, setWeatherHumd] = useState({})
    const [rainData, setRainData] = useState({})
    const [ET0, setET0Data] = useState({})

    const [weatherTempDay, setWeatherTempDay] = useState({})
    const [weatherHumdDay, setWeatherHumdDay] = useState({})
    const [rainDataDay, setRainDataDay] = useState({})
    const [ET0DataDay, setET0DataDay] = useState({})

    const [selectMonth,setSelectMonth ] = useState('')
    const [allWeatherDataDays,setAllWeatherDataDays] = useState([])
    const [allWeatherData,setAllWeatherData] = useState([])

    const addCitiesWeather = () => {
        let data = {
            city_id : Id,
            weather_data : allWeatherData,
            weather_data_days : allWeatherDataDays
        }

        api.post('/admin/add-citiesWeather',data)
        .then(response=>{
            if(response && response.data.type === "success"){
                swal(`${t('City Weather Added')}`, { icon: "success" });
            }
            if(response && response.data.type === "danger"){
                swal(`${t('Error adding City ')}`, { icon: "error" });
            }
        }).catch(error=>{
            console.log(error)
        })
    }

    const onChangeHandlerRain = (value,month,name) => {
        setRainData(state => ({ ...state, [`${month}_${name}`] : value }), [])

    }
    const onChangeHandlerTempMoy = (value,month,name) => {
        setWeatherTemp(state => ({ ...state, [`${month}_${name}`] : value}), [])

    }
    const onChangeHandlerHumidity = (value,month,name) => {
        setWeatherHumd(state => ({ ...state, [`${month}_${name}`] : value }), [])

    }
    const onChangeHandlerET0 = (value,month,name) => {
        setET0Data(state => ({ ...state, [`${month}_${name}`] : value }), [])

    }


    const onChangeHandlerDayRain = (value,day,month,name) => {
        setRainDataDay(state => ({ ...state, [`${month}_${day}_${name}`] : value }), [])

    }
    const onChangeHandlerDayTempMoy = (value,day,month,name) => {
        setWeatherTempDay(state => ({ ...state, [`${month}_${day}_${name}`] : value}), [])

    }
    const onChangeHandlerDayHumidity = (value,day,month,name) => {
        setWeatherHumdDay(state => ({ ...state, [`${month}_${day}_${name}`] : value }), [])

    }
    const onChangeHandlerDayET0 = (value,day,month,name) => {
        setET0DataDay(state => ({ ...state, [`${month}_${day}_${name}`] : value }), [])

    }
    
    useEffect(()=>{
        let dataArray = []
        if ((Object.keys(rainData).length == 12)){
            dataArray.push(weatherTemp,weatherHumd,rainData,ET0)
            setAllWeatherData(dataArray)
        }
    },[rainData,ET0])

    useEffect(()=>{
        let dataArray = []
        if ((Object.keys(rainDataDay).length >= 28) || (Object.keys(weatherTempDay).length >= 28) || (Object.keys(weatherHumdDay).length >= 28) || (Object.keys(ET0DataDay).length >= 28) ){
            dataArray.push(weatherTempDay,weatherHumdDay,rainDataDay,ET0DataDay)
            setAllWeatherDataDays(dataArray)
        }
    },[rainDataDay,ET0DataDay])

    const weatherByMonths = () => {
            let element = []
        for (let index = 0; index < Months.length; index++) {
                element.push(
                    <tbody>
                    <tr>
                        <td>{Months[index]}</td>   
                        <td>
                            <input 
                             name={'temp'}
                             style={{ minHeight: 32, marginRight: 5, outline: 'none', border: '1px solid #e4e4e4' }}
                             key={index}
                             value={weatherTemp.index}
                             onChange={e => onChangeHandlerTempMoy(e.target.value,index,'temp')}
                            />
                        </td>          
                        <td>
                            <input 
                             name={'humidity'}
                             style={{ minHeight: 32, marginRight: 5, outline: 'none', border: '1px solid #e4e4e4' }}
                             key={index}
                             value={weatherHumd.index}
                             onChange={e => onChangeHandlerHumidity(e.target.value,index,'humidity')}
                            />
                        </td>
                        <td>
                            <input 
                             name={'rain'}
                             style={{ minHeight: 32, marginRight: 5, outline: 'none', border: '1px solid #e4e4e4' }}
                             key={index}
                             value={rainData.index}
                             onChange={(e) => onChangeHandlerRain(e.target.value,index,'rain')}
                            />
                        </td>  
                        <td>
                            <input 
                             name={'et0'}
                             style={{ minHeight: 32, marginRight: 5, outline: 'none', border: '1px solid #e4e4e4' }}
                             key={index}
                             value={ET0.index}
                             onChange={(e) => onChangeHandlerET0(e.target.value,index,'et0')}
                            />
                        </td>     
                        {
                            selectMonth === "" 
                            ?
                            <td><Button outline theme="info" onClick={() => {setSelectMonth(index)}} >All days</Button></td>       

                            :
                            null
                        } 
                 </tr>



                 </tbody>
                    
                )
            
        }
        return element
    }

    const getDaysArray = (year, month) => {
        let monthIndex = month;
        let names = [ 'sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat' ];
        let date = new Date(year, monthIndex, 1);
        let result = [];
        while (date.getMonth() == monthIndex) {
            let daysIndex = date.getDate()
            result.push(
          <tbody>
          <tr>
              <td>{`${date.getDate()} ${names[date.getDay()]}`}</td>   
              <td>
                  <input 
                   name={'temp'}
                   style={{ minHeight: 32, marginRight: 5, outline: 'none', border: '1px solid #e4e4e4' }}
                   key={daysIndex}
                   value={weatherTempDay.daysIndex}
                   onChange={e => onChangeHandlerDayTempMoy(e.target.value,daysIndex,monthIndex,'temp')}
                  />
              </td>          
              <td>
                  <input 
                   name={'humidity'}
                   style={{ minHeight: 32, marginRight: 5, outline: 'none', border: '1px solid #e4e4e4' }}
                   key={daysIndex}
                   value={weatherHumdDay.daysIndex}
                   onChange={e => onChangeHandlerDayHumidity(e.target.value,daysIndex,monthIndex,'humidity')}
                  />
              </td>
              <td>
                  <input 
                   name={'rain'}
                   style={{ minHeight: 32, marginRight: 5, outline: 'none', border: '1px solid #e4e4e4' }}
                   key={daysIndex}
                   value={rainDataDay.daysIndex}
                   onChange={(e) => onChangeHandlerDayRain(e.target.value,daysIndex,monthIndex,'rain')}
                  />
              </td>     
              <td>
                  <input 
                   name={'et0'}
                   style={{ minHeight: 32, marginRight: 5, outline: 'none', border: '1px solid #e4e4e4' }}
                   key={daysIndex}
                   value={ET0.daysIndex}
                   onChange={(e) => onChangeHandlerDayET0(e.target.value,daysIndex,monthIndex,'et0')}
                  />
              </td>             
       </tr>



       </tbody>

          );
          date.setDate(date.getDate() + 1);
        }
        return result;
      }


  return (
         <Container className="p-4">
            <Link to='/admin/configuration/cities'> Go back</Link>
             <Row noGutters className="page-header py-4">
                <PageTitle
                    sm="4"
                    title={t('Weather Data Info')}
                    subtitle={t('Weather Data Info')}
                    className="text-sm-left"
                />
            </Row>
                <Row className='p-2 text-center d-flex justify-content-center'>
                        <Card>
                            {
                                selectMonth === ""
                                ?
                                null
                                :
                            <CardHeader>
                                <h5>Month : {Months.at(selectMonth)}</h5>
                                <Button outline theme="info" onClick={() => {setSelectMonth("")}} >All Months</Button>   
                            </CardHeader>

                            }
                            <CardBody>
                                <table className="table mb-0 border text-center  table-responsive">
                                    <thead className="bg-light">
                                        <tr>
                                            <th scope="col" className="border-0">{selectMonth === '' ? 'Months' : "Days"}</th>
                                            <th scope="col" className="border-0">{t('Temp Moy')} (°C)</th>
                                            <th scope="col" className="border-0">{t('Humidity Moy')} (%)</th>
                                            <th scope="col" className="border-0">{t('Rain Moy')} (mm)</th>
                                            <th scope="col" className="border-0">{t('ET0')} (mm)</th>
                                            
                                            {
                                             selectMonth === ''
                                             ?
                                            <th scope="col" className="border-0">{t('All days')}</th>
                                                    :
                                                    null
                                                }
                                        </tr>
                                    </thead>
                                        {
                                             selectMonth === ''
                                             ?
                                        weatherByMonths()
                                             :
                                             getDaysArray(2022,selectMonth)
                                        }       
                                        
                                </table>                                        

                            </CardBody>
                        </Card>

                 </Row>
                <Row  className='p-2 text-center d-flex justify-content-center align-items-center'>
                    <div
                        style={{
                        display: "flex",
                        justifyContent: "flex-end",
                        }}
                        >
                        <Button onClick={()  => addCitiesWeather()} className="mb-1 mr-1 btn btn-success"><i class={`fa fa-check mx-2`}></i>
                            {t('save')}
                        </Button>
                        <Button className="mb-1 mr-1 btn btn-danger" onClick={() => {} }> <i class={`fa fa-times mx-2`}></i>
                            {t('cancel')}
                        </Button>
                    </div>
                 </Row>
         </Container>   
  )
}

export default ConfigCitiesWeather