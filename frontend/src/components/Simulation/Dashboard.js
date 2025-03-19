import React ,{useEffect,useState} from 'react'
import { Calendar, momentLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import moment from "moment";
import "moment/locale/nb";
import { useTranslation } from 'react-i18next'
import { Container, Row, Col, Card, CardHeader, CardBody,CardFooter, Form, FormGroup, Nav, NavItem, NavLink, FormInput, FormSelect, Button } from 'shards-react'
import api from '../../api/api'
import PageTitle from "../common/PageTitle";
import { useHistory } from 'react-router-dom';
import  DashboardChart from './DashboardChart'

const localizer = momentLocalizer(moment);
const Dashboard = () => {
    const { t, i18n } = useTranslation();

    let currentDate = moment().locale('En').format('MMM Do')
    const [chartData, setChartData] = useState([])
    const [irrigNote,setIrrigNote] = useState({
       note : `${t('no_irrigation')}`,
       volume : 0
    })
    const [events, setEvents] = useState([
        {
        title: 'Irrigation 1 ',
        allDay: true,
        start: new Date(),
        end: new Date()
        },
        {
            title: 'Irrigation 2',
            allDay: true,
            start: new Date(),
            end: new Date()
            }
]);
    const history = useHistory()
    const [activeSimulations,setActiveSimulations] = useState([])
    const [allSimulations,setAllSimulations] = useState([])

    useEffect(() => {
        const getActiveSimulations = async () => {
            try {
                await api.get('/simulation/get-simulations')
                    .then(result => {
                        let listSimulations = result.data.simulations
                        if (result.data.type === "success") {
                            setActiveSimulations(listSimulations)
                        }
                    }).catch(err => {
                        console.log(err)
                    })
            } catch (error) {
                console.log(error)
            }
        }
        const getAllSimulations = async () => {
            try {
                await api.get('/simulation/get-all-simulations')
                    .then(result => {
                        let listSimulations = result.data.simulations
                        if (result.data.type === "success") {
                            setAllSimulations(listSimulations)
                        }
                    }).catch(err => {
                        console.log(err)
                    })
            } catch (error) {
                console.log(error)
            }
        }
       
        getActiveSimulations()
        getAllSimulations()
    }, [])

    useEffect(() => {
        let data = []
        let lastOne = activeSimulations[0]
        activeSimulations.map(result=>{
            if(result){
                let simulResult = result.result
                let irrig = simulResult.filter(simulation=>{

                    return simulation.irrigationNbr === 1
                })
                let irrigationNote = ''
                if(irrig){
                    irrig.map((irrigation,indx)=>{
                        if(moment(irrigation.date).locale('En').format('l') == moment().format('l')){
                            irrigationNote = `${t('irrigate')}`
                            setIrrigNote({ note : irrigationNote , volume : irrigation.irrigation })
                        }
                    })
                }
                if(lastOne.id === result.id){
                    simulResult.map(resultSimulation=>{
                        data.push({
                           bilan: resultSimulation.bilan,
                            dates :resultSimulation.date
                        })
                    })

                }

                
            }
        })
        setChartData(data)
    }, [activeSimulations])


    return (
        <Container fluid className="main-content-container p-4">
             <Row noGutters className="page-header py-4">
                <PageTitle
                    sm="4"
                    title={t('overview')}
                    className="text-sm-left"
                />
            </Row>
            <Row>
                <Col lg='8' md='12' sm='12'>
                    <Row>
                        <Col lg="6" md ="12" sm="12">
                            <Card>
                                <CardHeader>
                                    <i className='material-icons' style={{fontSize:20,color :"#3CB379"}}>&#xe614;</i>
                                </CardHeader>
                                <CardBody>
                                <div><h2 style={{color :"#3CB379"}}>{activeSimulations.length}</h2></div>
                                    <div><h6 style={{color :"#3CB379"}}> {t('active_simulations')}</h6></div>
                                </CardBody>
                            </Card>
                        </Col>
                        <Col lg="6" md ="12" sm="12">
                            <Card>
                                <CardHeader>
                                <i className='material-icons' style={{fontSize:20,color :"#1E8FFD"}}>&#xe0ee;</i>
                                </CardHeader>
                                <CardBody>
                                <div><h2 style={{color :"#35ABBB"}}>{allSimulations.length}</h2></div>
                                <div><h6 style={{color :"#35ABBB"}}>{t('all_simulations')}</h6></div>
                                </CardBody>
                            </Card>
                        </Col>
                    </Row>
                </Col>
                <Col  lg='4' md='12' sm='12'>
                    <Card>
                        <CardHeader>
                            <div className='d-flex justify-content-between align-items-center px-1'  style={{borderBottom:"2px solid #3CB379"}}><h5 className='m-1'>{t('today')}</h5><i className='material-icons' style={{fontSize: 20}}>&#xebcc;</i></div>
                        </CardHeader>
                        <CardBody>
                                <h4 className='text-center m-0'>{currentDate}</h4>
                                <div>
                                <div style={{border : "1px solid #35ABBB",borderRadius:8 ,padding:12,margin:10,textAlign:'center',textTransform:'capitalize'} }>{irrigNote.note}</div>
                                <div style={{border : "1px solid #35ABBB" ,borderRadius:8,padding:12,margin:10,textAlign:'center',textTransform:'capitalize'}}>{t('volume')} : {irrigNote.volume} m³</div>

                                </div>
                        </CardBody>
                        <CardFooter className="border-top d-flex justify-content-center align-items-center">
                            <Button outline onClick={() => history.push('/Calendar') }>{t('see_all')}</Button>
                        </CardFooter>
                    </Card>
                </Col>
            </Row>
            <Row noGutters className="page-header py-4">
                <PageTitle
                    sm="4"
                    title={t('latest_simulations')}
                    className="text-sm-left"
                />
            </Row>
            <Row>
                <Col lg='12' md='12' sm='12'>
                    <Card>
                         <DashboardChart data={chartData} />

                    </Card>
                </Col>
            </Row>
        </Container>
  )
}

export default Dashboard