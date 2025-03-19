import React, { useEffect, useState } from 'react'
import { Row, Col, Container } from 'shards-react'
import api from '../api/api';
import swal from 'sweetalert';
import { useHistory } from 'react-router-dom';
import moment from 'moment';

const FilteredByStatus = ({ value, filteredByStatus, crops,sensorsData}) => {

    const [fieldsByStatus, setFieldsByStatus] = useState([]);
    const [allOptimalFields, setAllOptimalFields] = useState([])

    useEffect(() => {
        getFilteredFieldsByStatus()
    }, [filteredByStatus])

        console.log(filteredByStatus)

    const getFilteredFieldsByStatus = () => {
        let filteredFieldsByStatus = [];
        filteredByStatus.map(farm => {
            let fields = farm.fields
            if (fields) {
                fields.map(itemfield => {
                    filteredFieldsByStatus.push({
                        name: itemfield.name,
                        status: itemfield.status,
                        description: itemfield.description,
                        uid: itemfield.uid,
                        farm_id: itemfield.farm_id,
                        id: itemfield.id,
                        sensors: itemfield.sensors
                    });
                })
            }
        });
        setFieldsByStatus(filteredFieldsByStatus)
    }

    // const  FilterByStatus = async () =>{
    //     let data = {
    //       status :value
    //     }
    //      await api.post('/field/field-status',data)
    //      .then(response =>{ 
    //        let farmsData = response.data.farms
    //        setAllOptimalFields(farmsData);
    //      }).catch((err)=>{
    //       swal({
    //         title: 'Error',
    //         icon: "error"
    //     });
    //      })
    //   }

    //   useEffect(()=>{
    //     FilterByStatus()
    //   },[value])


    //   useEffect(()=>{
    //     OptimalFields()
    //   },[allOptimalFields])

    //     const OptimalFields = () => {
    //         let Optimalstatus = [];
    //         allOptimalFields.map(farm => {
    //        let fields = farm.fields
    //        if (fields) {
    //            fields.map(itemfield => {
    //                Optimalstatus.push({
    //                    name: itemfield.name,
    //                    status: itemfield.status,
    //                    description: itemfield.description,
    //                    uid: itemfield.uid,
    //                    farm_id: itemfield.farm_id,
    //                    id: itemfield.id,
    //                    sensors: itemfield.sensors
    //                });
    //            })
    //        }
    //     })
    //      setFieldsByStatus(Optimalstatus)
    //     }

    //     console.log(fieldsByStatus)
    const history = useHistory()

    const routeToField = (fieldUid) => {
        if (fieldUid) {
            localStorage.setItem(
                "Field",
                fieldUid
            );
            history.push(`/Fields/${fieldUid}`)

        }
    }
    return (
        <Container>
            <Row>
                {
                    fieldsByStatus.map(field => {
                        let cropT = ''
                        crops.map(crop => {
                            if (crop.fieldId === field.id) {
                                cropT = crop.type
                            }
                        })
                        let msg = ""
                        if (field.sensors == 0) msg = "Please use the app to install/register a sensor."
                        return (
                            <Col lg="4" md="6" sm="6">
                                <div onClick={() => routeToField(field.uid)} className="sensor">
                                    <div className="sensorHeader">
                                        <div className="sensorNameWrapper">
                                            <p style={{ fontSize: "1.2rem" }}>{field.name}</p>
                                            {/* <p>{fieldsData.soil_zone}</p> */}
                                        </div>
                                        <div className="sensorInfo">
                                            <div>
                                                {/* <p style={{ marginRight: 5 }}>{signalLevel.SL}</p> */}
                                                {/* <i className="fas fa-signal"></i> */}
                                            </div>
                                            <div>
                                                <p style={{ marginLeft: 5, marginRight: 5 }}>
                                                    {/* {batteryLevel.numericBL}% */}
                                                </p>
                                                {/* {returnBL()} */}
                                            </div>
                                        </div>
                                    </div>
                                    <hr />
                                    <div>
                                        {/* <p style={{ textAlign: "center", color: "#7e7e7e", fontSize: "1rem" }}>
                                            {msg}
                                        </p> */}
                                    </div>
                                    <>
                                        <div className="sensorBody">
                                            <div className="plantWrapper">
                                                {
                                                    cropT == ""
                                                        ?
                                                        null
                                                        :
                                                        <div className="plant">

                                                            <i className="fas fa-seedling"></i>
                                                            <p style={{ marginLeft: 5 }}>{cropT}</p>
                                                        </div>
                                                }
                                            </div>
                                        </div>
                                        <div>
                                            {/* <p>QR: {sensorsData.code}</p> */}
                                        </div>
                                        <section className="ProgressBarWrapper">
                                            <div className="stats-dates">
                                                <p> JUN 10 </p>
                                                <div className="Marker-tomorrow">
                                                    <svg _ngcontent-pxc-c161="" xmlns="http://www.w3.org/2000/svg" width="11" height="13" viewBox="0 0 14 17" class="drop-element ng-star-inserted" style={{ left: "calc(59.7044% - 6px)" }}><g _ngcontent-pxc-c161="" fill="none"><path _ngcontent-pxc-c161="" d="M7.8 0.4L7.5 0 7.1 0.4C6.9 0.7 1.1 7.3 1.1 11.9 1.1 15.1 4 17.6 7.5 17.6 11 17.6 13.8 15.1 13.8 11.9 13.8 7.3 8.1 0.7 7.8 0.4Z" fill="#FE3C65" class="drop" style={{ fill: "rgb(16, 201, 160)" }}></path><path _ngcontent-pxc-c161="" d="M13.8 11.9C13.8 7.3 8.1 0.7 7.8 0.4L7.5 0 7.1 0.4C7 0.6 5 2.8 3.4 5.5 2.2 7.6 1.1 9.9 1.1 11.9 1.1 15.1 4 17.6 7.5 17.6 11 17.6 13.8 15.1 13.8 11.9Z" stroke="#FFF"></path></g></svg>
                                                </div>
                                                <div className="Segment1"></div>
                                            </div>
                                            <div className="stats-dates">
                                                <p className="today">Today</p>
                                                <div className="Marker">
                                                    <svg _ngcontent-pxc-c161="" xmlns="http://www.w3.org/2000/svg" width="14" height="17" viewBox="0 0 14 17" class="drop-element ng-star-inserted" style={{ left: "calc(59.7044% - 6px)" }}><g _ngcontent-pxc-c161="" fill="none"><path _ngcontent-pxc-c161="" d="M7.8 0.4L7.5 0 7.1 0.4C6.9 0.7 1.1 7.3 1.1 11.9 1.1 15.1 4 17.6 7.5 17.6 11 17.6 13.8 15.1 13.8 11.9 13.8 7.3 8.1 0.7 7.8 0.4Z" fill="#FE3C65" class="drop" style={{ fill: "rgb(16, 201, 160)" }}></path><path _ngcontent-pxc-c161="" d="M13.8 11.9C13.8 7.3 8.1 0.7 7.8 0.4L7.5 0 7.1 0.4C7 0.6 5 2.8 3.4 5.5 2.2 7.6 1.1 9.9 1.1 11.9 1.1 15.1 4 17.6 7.5 17.6 11 17.6 13.8 15.1 13.8 11.9Z" stroke="#FFF"></path></g></svg>
                                                </div>
                                                <div className="Segment2"></div>
                                            </div>
                                            <div className="stats-dates">
                                                <p> JUN 08 </p>
                                                <div className="Marker-yesterday">
                                                    <svg _ngcontent-pxc-c161="" xmlns="http://www.w3.org/2000/svg" width="11" height="13" viewBox="0 0 14 17" class="drop-element ng-star-inserted" style={{ left: "calc(59.7044% - 6px)" }}><g _ngcontent-pxc-c161="" fill="none"><path _ngcontent-pxc-c161="" d="M7.8 0.4L7.5 0 7.1 0.4C6.9 0.7 1.1 7.3 1.1 11.9 1.1 15.1 4 17.6 7.5 17.6 11 17.6 13.8 15.1 13.8 11.9 13.8 7.3 8.1 0.7 7.8 0.4Z" fill="#FE3C65" class="drop" style={{ fill: "rgb(16, 201, 160)" }}></path><path _ngcontent-pxc-c161="" d="M13.8 11.9C13.8 7.3 8.1 0.7 7.8 0.4L7.5 0 7.1 0.4C7 0.6 5 2.8 3.4 5.5 2.2 7.6 1.1 9.9 1.1 11.9 1.1 15.1 4 17.6 7.5 17.6 11 17.6 13.8 15.1 13.8 11.9Z" stroke="#FFF"></path></g></svg>
                                                </div>
                                                <div className="Segment3"></div>
                                            </div>
                                            <div className="status">
                                                <div>Refill</div>
                                                <div style={{ color: "#26cc94" }}>Optimal</div>
                                                <div>Full</div>
                                            </div>
                                        </section>
                                        <div className="sensorFooter">
                                            <p>Last Reading :</p>
                                            {
                                                field.sensors.map(sensors=>{
                                                    return(
                                                        sensorsData.map(data => {
                                                            let LastTime = ""
                                                            if (data.code === sensors.code) {
                                                                LastTime = moment(data.time).locale('En').format('MMM Do YYYY, h:mm a')
    
                                                            }
                                                            return (
                                                                <p>{LastTime}</p>
    
                                                            )
                                                        })

                                                    )
                                                })
                                                        }
                                        </div>
                                    </>
                                </div>
                            </Col>

                        )
                    })
                }
            </Row>
        </Container>
    )
}

export default FilteredByStatus