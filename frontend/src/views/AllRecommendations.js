import React, { useEffect, useState } from 'react'
import { Button, ButtonGroup, Modal, ModalBody, ModalHeader, Row, Col, FormInput, FormGroup, Form, Container, Card } from 'shards-react'
import { useTranslation } from "react-i18next";
import api from '../api/api';
import PageTitle from '../components/common/PageTitle';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useParams,useHistory } from 'react-router-dom';


const AllRecommendations = () => {

    const history = useHistory()
    const params = useParams()
    let id = params.id
    const [isLoading, setIsLoading] = useState(true)
    const [recommendations, setRecmnd] = useState([])

    const { t, i18n } = useTranslation();

    const [toggle, setToggle] = useState(false)

    const [oneRec, setOneRec] = useState('')
    const [descriptionRec, setRecDescription] = useState('')
    const [titleRec,setRecTitle] = useState('')

    useEffect(() => {
        getRecommendation();

    }, [])



    const getRecommendation = async () => {
        let field_id = id
        await api.get(`/recommendations/${field_id}`)
            .then(response => {
                let recommendations = response.data.recommendations
                setRecmnd(recommendations)
                setIsLoading(false)
            }).catch(err => {
                console.log(err)
            })
    }

    const openModal = (itemUid) => {
        let recommendation_uid = itemUid
        api.post('/recommendation/single-recommendation', { recommendation_uid })
            .then(response => {
                let recommendation = response.data.recommendation
                setOneRec(recommendation)
                setRecDescription(recommendation.description)
                setRecTitle(recommendation.title)

            })

        setToggle(true)

    }

        const markAsRead = (itemUid) =>{
            let recommendation_uid = itemUid

            api.post('/recommendation/viewed',{recommendation_uid})
            .then(response=>{
                getRecommendation()
            }).catch(err=>{
                console.log(err)
            })
        }

        const markAsNotRead = (itemUid) => {
            let recommendation_uid = itemUid
    
            api.post('/recommendation/not-viewed', { recommendation_uid })
                .then(response => {
                    if (response.data.type === "success") {
                        getRecommendation()
                    }
                }).catch(err => {
                    console.log(err)
                })
        }


    return (
        <>
            <Container fluid className="main-content-container p-4 ">
                <Row noGutters className="page-header py-4">
                    <PageTitle
                        sm="4"
                        title='My recommendations'
                        subtitle={t('overview')}
                        className="text-sm-left"
                    />
                </Row>
                {
                    isLoading
                    ?
                        <LoadingSpinner />
                    :
                    <Card>
                        <Row className='mx-2'>
                            <Col lg='4' md='12' sm='12' className='border-right'>
                                <div className="p-4">
                                    <h5 className='underline'>
                                        Latest recommendation
                                    </h5>

                                </div>

                            </Col>
                            <Col lg='8' md='12' sm='12'>
                                <table class="table mb-0">
                                    <thead>
                                        <tr>
                                            <th scope="col" class="border-0">Title</th>
                                            <th scope="col" class="border-0">Date</th>
                                            <th scope="col" class="border-0"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {
                                           recommendations && recommendations.map(item => {
                                                let dateTime = item.created_at
                                                let dateRecmnd = dateTime.slice(0, 16).replace('T', ' ');
                                                return (

                                                    <tr className={`${item.viewed == 0 ? 'font-weight-bold statsBox' : ''}`}>
                                                        <td onClick={() => openModal(item.uid)} style={{cursor:"pointer"}} className='text-uppercase '>{item.title}</td>
                                                        <td>{dateRecmnd}</td>
                                                        <td>
                                                            {
                                                                item.viewed == 0
                                                                ?
                                                                <i title='Marquer comme lu' onClick={()=> markAsRead(item.uid)} className="icon-viewed material-icons">&#xf18a;</i>
                                                                :
                                                                <i title='Marquer comme non lu' onClick={() => markAsNotRead(item.uid)} className="icon-viewed material-icons">&#xf18c;</i>
                                                                

                                                            }
                                                        </td>

                                                    </tr>
                                                )

                                            })
                                        }
                                    </tbody>
                                </table>

                            </Col>

                        </Row>
                    </Card>

                }
            </Container>
            <Modal centered={true} backdrop={false} open={toggle}>
                <ModalHeader>
                    <div className="d-flex text-uppercase align-items-center justify-content-between">
                        <h5>{titleRec}</h5>
                        <div>
                            <i onClick={() => setToggle(false)} className="pointer material-icons">&#xe5cd;</i>

                        </div>

                    </div>
                </ModalHeader>
                <ModalBody>
                    {descriptionRec}

                </ModalBody>
            </Modal>
        </>

    )
}

export default AllRecommendations