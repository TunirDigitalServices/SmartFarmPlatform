import React, { useState, useEffect } from 'react'
import {  Row, Col, Container } from 'react-bootstrap'
import api from '../api/api'
import PageTitle from '../components/common/PageTitle'
import moment from "moment";

const AllNotifications = () => {

    const [notifs, setNotifs] = useState([])

    const getNotifications = async () => {
        await api.get('/notification/all-notifications')
            .then(response => {
                let notifications = response.data.notifications
                setNotifs(notifications)
            }).catch(err => {
                console.log(err)
            })
    }

    useEffect(() => {
        getNotifications()
    }, [])


    const markAsRead = (itemUid) => {
        let notification_uid = itemUid

        api.post('/notification/viewed', { notification_uid })
            .then(response => {
                if (response.data.type === "success") {
                    getNotifications()

                }
            }).catch(err => {
                console.log(err)
            })
    }

    const markAsNotRead = (itemUid) => {
        let notification_uid = itemUid

        api.post('/notification/not-viewed', { notification_uid })
            .then(response => {
                if (response.data.type === "success") {
                    getNotifications()

                }
            }).catch(err => {
                console.log(err)
            })
    }
    return (
        <>
            <Container fluid className="main-content-container p-4 ">
                <Row className='page-header py-4'>
                    {/* <PageTitle title='My Notifications ' /> */}
                    <div className='d-flex align-items-center'>

                        <h2 className='page-title' style={{ padding: 2 }}>My Notifications</h2> <i className="material-icons" style={{ fontSize: 25 }}>&#xE7F4;</i>
                    </div>

                </Row>
                {
                   notifs && notifs.map(notif => {
                    let dateTime = notif.created_at
                    let dateNotif  = moment(dateTime).format('MMMM Do YYYY')

                        return (
                            <Row  className={`${notif.is_view == 0 ? 'font-weight-bold bg-white my-2 p-2 notif ' : 'bg-white my-2 p-2 notif '}`}>
                                <Col lg='12' md='12' sm='12' className="d-flex flex-column align-items-start">
                                    <div className='d-flex justify-content-between align-items-center border-bottom w-100'>
                                        <h6>{notif.object}</h6>
                                        <h6>{dateNotif}</h6>                                       
                                         {
                                            notif.is_view == 0
                                                ?
                                                <i title='Marquer comme lu' onClick={() => markAsRead(notif.uid)} className="material-icons" style={{ fontSize: 16, cursor: 'pointer' }}>&#xf18a;</i>
                                                :
                                                <i title='Marquer comme non lu' onClick={() => markAsNotRead(notif.uid)} className="material-icons" style={{ fontSize: 16, cursor: 'pointer' }}>&#xf18c;</i>


                                        }
                                    </div>
                                    <div className="d-flex justify-content-between align-items-center m-2 ">
                                        <span className="d-flex mr-2 flex-column justify-content-between">
                                            <i className="material-icons" style={{ fontSize: 25, border: "1px solid gray ", borderRadius: 50, padding: "4px" }}>&#xe645;</i>
                                        </span>
                                        <>{notif.description} </>

                                    </div>

                                </Col>
                            </Row>

                        )
                    })
                }

                {/* <Row>
                            <Col className="border-left">
                                Lorem ipsum, dolor sit amet consectetur adipisicing elit. Debitis atque nobis nisi deserunt sequi laborum nihil obcaecati fugiat accusantium, molestiae aliquam, ab rem officiis. Iste, repellendus magnam! Fugit, obcaecati laboriosam?
                            </Col>
                        </Row>
                        <Row>
                            <Col className="border-left">
                                Lorem ipsum, dolor sit amet consectetur adipisicing elit. Debitis atque nobis nisi deserunt sequi laborum nihil obcaecati fugiat accusantium, molestiae aliquam, ab rem officiis. Iste, repellendus magnam! Fugit, obcaecati laboriosam?
                            </Col>
                        </Row>
                        <Row>
                            <Col className="border-left">
                                Lorem ipsum, dolor sit amet consectetur adipisicing elit. Debitis atque nobis nisi deserunt sequi laborum nihil obcaecati fugiat accusantium, molestiae aliquam, ab rem officiis. Iste, repellendus magnam! Fugit, obcaecati laboriosam?
                            </Col>
                        </Row> */}


            </Container>
        </>
    )
}

export default AllNotifications