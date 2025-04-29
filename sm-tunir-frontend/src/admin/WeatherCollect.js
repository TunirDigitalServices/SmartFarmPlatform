import React, { useEffect, useState } from 'react'
import { Container, Row, Col, FormGroup, FormInput, Button, ButtonGroup, Card ,Nav,NavItem,NavLink} from 'shards-react'
import PageTitle from '../components/common/PageTitle';
import { useTranslation } from 'react-i18next';
import api from '../api/api';
import Pagination from '../views/Pagination';



const WeatherCollect = () => {
    
const { t, i18n } = useTranslation();
const [collectData, setCollectData] = useState([])
const [searchCity, setSearchCity] = useState("")
const [searchDate, setSearchDate] = useState("")



useEffect(() => {
    getCollectWeatherData()
  }, [])

    const getCollectWeatherData = async () => {
    await api.get(`/admin/weather-collect`)
        .then(res => {
        let collect = res.data.result;
        setCollectData(collect)
        }).catch(error => {
        console.log(error)

        })
    }
    const getSearchResult = async () => {

        let data = {
            city: searchCity,
            date: searchDate
        }

        await api.post('/admin/weather-collect/search', data)
            .then(res => {
                let serachResult = res.data.result
                setCollectData(serachResult);
            }).catch(error => {
                console.log(error)

            })
    }
    

    return (
        <>
        <Container className="py-4">
        <Row className="justify-content-center">
            <Col md="4" className="form-group">
                <FormGroup>
                    <div className="d-flex">
                        <FormInput
                            value={searchCity}
                            onChange={(e) => setSearchCity(e.target.value)}
                            id="search"
                            placeholder="Search By city" />

                    </div>
                </FormGroup>
            </Col>
            <Row className="d-flex justify-content-center">
                <Col md="4" className="form-group">
                    <ButtonGroup>
                        <Button outline onClick={() => getSearchResult()}>Search</Button>
                    </ButtonGroup>
                </Col>
            </Row>
        </Row>
        <Card>
        
            <table className="table mb-0 text-center">
                <thead className="bg-light">
                    <tr>
                        <th scope="col" className="border-0">{t('City')}</th>
                        <th scope="col" className="border-0">{t('temp')}</th>
                        <th scope="col" className="border-0">{t('temp_min')}</th>
                        <th scope="col" className="border-0">{t('temp_max')}</th>
                        <th scope="col" className="border-0">{t('pressure')}</th>
                        <th scope="col" className="border-0">{t('humidity')}</th>
                        <th scope="col" className="border-0">{t('date')}</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        collectData.map((item, indx) => {
                            return (

                                <tr>
                                    <td>{item.city}</td>
                                    <td>{item.data.main.temp}</td>
                                    <td>{item.data.main.temp_min}</td>
                                    <td>{item.data.main.temp_max}</td>
                                    <td>{item.data.main.pressure}</td>
                                    <td>{item.data.main.humidity}</td>
                                    <td>{item.created_at.slice(0,10)}</td>
                                </tr>
                            )
                        })
                    }
                </tbody>
            </table>
            </Card>
            </Container>
        </>
        )
}
export default WeatherCollect