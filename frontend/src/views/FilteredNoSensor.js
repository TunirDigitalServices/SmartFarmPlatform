import React, { useEffect, useState } from 'react'
import { Row, Col, Container } from 'shards-react'
import { useHistory } from 'react-router-dom'

const FilteredNoSensor = ({ filteredFields, crops }) => {
    const history = useHistory()

    const [noSensorFields, setNoSensorFields] = useState([]);
    const routeToField = (fieldUid) => {
        if (fieldUid) {
            localStorage.setItem(
                "Field",
                fieldUid
            );
            history.push(`/Fields/${fieldUid}`)

        }
    }

    useEffect(() => {
        getNoSensorFields()
    }, [filteredFields])

    const getNoSensorFields = () => {
        let FieldsNoSensors = []
        filteredFields.map(field => {

            let noSensors = field.sensors;
            if (noSensors == 0) {
                FieldsNoSensors.push({
                    name: field.name,
                    description: field.description,
                    uid: field.uid,
                    farm_id: field.farm_id,
                    id: field.id,
                })
            }
        })
        setNoSensorFields(FieldsNoSensors)
    }



    return (
        <Container>
            <Row>
                {
                    noSensorFields.map(field => {
                        let cropT = ''
                        crops.map(crop => {
                            if (crop.fieldId === field.id) {
                                cropT = crop.type
                            }
                        })
                        let msg = "Please use the app to install/register a sensor.";
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
                                        <p style={{ textAlign: "center", color: "#7e7e7e", fontSize: "1rem" }}>
                                            {msg}
                                        </p>
                                    </div>
                                </div>
                            </Col>

                        )
                    })
                }


            </Row>
        </Container>
    )
}

export default FilteredNoSensor