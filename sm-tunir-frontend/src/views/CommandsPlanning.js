import React, { useState, useCallback, useEffect } from 'react'
import { Container, Row, Col, Card, CardHeader, CardBody, Form, FormGroup, FormCheckbox, FormInput, FormSelect, Button } from 'shards-react'
import api from '../api/api'
import PageTitle from "../components/common/PageTitle";
import { useTranslation } from "react-i18next";
import { useHistory } from 'react-router-dom'
import { withStyles } from "@material-ui/core/styles";
import { ToggleButtonGroup } from '@mui/material';
import { ToggleButton } from '@mui/material';
import PlanningList from './PlanningList'
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import swal from 'sweetalert';
import { useRef } from 'react';


const CommandsPlanning = () => {

  const userUid = JSON.parse(localStorage.getItem('user')).id
  const { t, i18n } = useTranslation();
  const history = useHistory()
  let inputRef = useRef()


  const [days, setDays] = useState([]);
  const [daysErr, setDaysErr] = useState('');

  const DAYS = [
    {
      key: "sunday",
      label: "S"
    },
    {
      key: "monday",
      label: "M"
    },
    {
      key: "tuesday",
      label: "T"
    },
    {
      key: "wednesday",
      label: "W"
    },
    {
      key: "thursday",
      label: "T"
    },
    {
      key: "friday",
      label: "F"
    },
    {
      key: "saturday",
      label: "S"
    }
  ];

  const StyledToggleButtonGroup = withStyles(theme => ({
    grouped: {
      margin: theme.spacing(2),
      padding: theme.spacing(0, 1),
      "&:not(:first-child)": {
        border: "1px solid",
        borderColor: "#eee",
        borderRadius: "10%"
      },
      "&:first-child": {
        border: "1px solid",
        borderColor: "#eee",
        borderRadius: "10%"
      }
    }
  }))(ToggleButtonGroup);

  const StyledToggle = withStyles({
    root: {
      color: "#27A6B7",
      "&$selected": {
        color: "white",
        background: "#27A6B7"
      },
      "&:hover": {
        color: "#27A6B7",
        background: "#27A6B7"
      },
      "&:hover$selected": {
        color: "#27A6B7",
        background: "#27A6B7"
      },
      textTransform: "unset",
      fontSize: "1.75rem"
    },
    selected: {}
  })(ToggleButton);

  const [launchTimes, setLaunchTimes] = useState({})
  const [equipments, setEquipments] = useState([])
  const [equipmentUid, setEquipmentUid] = useState({})
  const [relays, setRelays] = useState([])
  const [relayName, setRelayName] = useState([])
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [startTime, setStartTime] = useState({})
  const [endTime, setEndTime] = useState({})
  const [planningData, setPlanningData] = useState([])
  const [planningList, setPlanningList] = useState([])

  const [rowsData, setRowsData] = useState([{}])

  const addTableRows = () => {

    setRowsData([...rowsData , {id: ''}])

  }

  const deleteTableRows =(index,e)=>{
      setRowsData(rowsData.filter((data,i)=>{
        return i !== index
      })
      )
}

  const getEquipments = () => {
    api.get('/equipment/equipments')
      .then(response => {
        let equipmentData = response.data
        setEquipments(equipmentData)
      }).catch(err => {
        console.log(err)
      })
  }

  const getRelays = () => {
    let data = {

       equipment_uid : Object.values(equipmentUid)
    }
    if (data.equipment_uid != '') {
      api.post('/relay/relays', data)
        .then(response => {
          let relaysData = response.data
          setRelays(relaysData)
        }).catch(err => {
          console.log(err)
        })
    }

  }

  const getPlanning = async () => {
    await api.get('/planning/plannings')
      .then(response => {
        let planningData = response.data
        setPlanningList(planningData)
      }).catch(err => {
        console.log(err)
      })
  }
  useEffect(() => {
    getEquipments()
    getPlanning()
  }, [])

  useEffect(() => {
    getRelays()
  }, [equipmentUid])

//   const isValidate = () => {
//     let daysErr = ''
//     let equipErr = ''
//     if (!days) {
//         daysErr = 'You need to choose schedule'
//         setDaysErr(daysErr)
//         return false
//     }
//     return true
// }

// const submitPlanning = () => {
//   let isValid = isValidate()
//   if (isValid) {
//     addPlanning()
//   }
// }



  const addPlanning = async () => {

    let data = {
      equipment_uid: equipmentUid,
      user_uid: userUid,
      start_date: startDate,
      end_date: endDate,
      days: JSON.stringify(days),
      relays: planningData,
      relayids: relayName,
    }

    await api.post('/planning/add-planning', data)
      .then(response => {
        if (response.data.type === 'success') {
          swal(`${t('Planning added')}`, {
            icon: "success",
          })
          getPlanning()
          resetForm()
        }
        if (response.data.type === 'danger') {
          swal(`${t('error')}`, {
            icon: "error",
          })
          resetForm()
        }
      }).catch(err => {
        console.log(err)
      })

  }
  
  const resetForm = () => {
    setTimeout(() => {
      setEquipmentUid('')
      setDays([])
      setStartDate('')
      setEndDate('')
      setLaunchTimes('1')
      setStartTime({})
      setEndTime({})
      setRelayName([])
    }, 1500)
  }


  const onChangeHandlerStart = useCallback(
    ({ target: { name, value } }) => setStartTime(state => ({ ...state, [name]: value }), [])
  );

  const onChangeHandlerEnd = useCallback(
    ({ target: { name, value } }) => setEndTime(state => ({ ...state, [name]: value }), [])
  );

  const onChangeHandlerRelay = useCallback(
    ({ target: { name, value } }) => setRelayName(state => ({ ...state, [name]: value }), [])
  );

  const onChangeHandlerDevice = useCallback(
    ({ target: { name, value } }) => setEquipmentUid(state => ({ ...state, [name] : value }), [])
  );


  const addItem = () => {
    const newRelay = relayName;
    const newStartTime = startTime;
    const newEndTime = endTime;
    let arr = []
    var obj = {};
    var keyDataTimeStart = Object.keys(newStartTime);
    var keyDataTimeEnd = Object.keys(newEndTime);

    if (keyDataTimeStart.length > 0 && keyDataTimeEnd.length > 0) {
      for (var i = 0; i < rowsData.length; i++) {
        obj.startTime = newStartTime;
        obj.endTime = newEndTime;

      }
      arr.push(obj);
    }

    setPlanningData(arr)
  }

  useEffect(() => {
    addItem()
  }, [relayName,startTime, endTime])
  
  return (
    <>
      <Container fluid className="main-content-container p-4">
        <Row noGutters className="page-header py-4">
          <PageTitle
            sm="4"
            title={t('Add Commands Planning')}
            subtitle={t('overview')}
            className="text-sm-left"
          />
        </Row>
        <Row>
          <Col lg='12' md='12' sm='12'>
            <Card>
              <CardHeader className="border-bottom">
                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-start",
                    width: "auto",
                    float: "left"
                  }}
                >
                  <h6 className="m-0">{t('Planning Setup')}</h6>{" "}
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",

                  }}
                >
                  <Button
                    // theme="success"
                    className="mb-2 mr-1 btn btn-success"
                    onClick={() => addPlanning()}
                  >
                    <i className={`fa fa-check mx-2`}></i>
                    {t('save')}
                  </Button>
                  <Button
                    // theme="success"
                    className="mb-2 mr-1 btn btn-danger"
                  >
                    <i className={`fa fa-times mx-2`}></i>
                    {t('cancel')}
                  </Button>
                </div>

              </CardHeader>
              <CardBody>
                <Row className='py-2 d-flex justify-content-center align-items-center'>
                  <Col className='border p-2 d-flex justify-content-center flex-column align-items-center' lg='8' md='12' sm='12'>
                    <Row form>
                      <Col lg='6' md="12" sm='12' className="form-group">
                        <p style={{ margin: "0px" }}>{t('start_date')}</p>
                        <FormInput
                          type="date"
                          placeholder="Start Date"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          
                        />
                      </Col>
                      <Col lg='6' md="12" sm='12' className="form-group">
                        <p style={{ margin: "0px" }}>{t('end_date')}</p>
                        <FormInput
                          type="date"
                          placeholder="End Date"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}

                        />

                      </Col>
                    </Row>
                    <Row className="d-flex justify-content-center flex-column align-items-center my-2">
                      <p>Choose irrigation schedule</p>

                      <Row>
                        <StyledToggleButtonGroup
                          size="small"
                          arial-label="Days of the week"
                          value={days}
                          onChange={(event, value) => setDays(value)}
                        >
                          {DAYS.map((day, index) => (
                            <StyledToggle key={day.key} value={index} aria-label={day.key}>
                              {day.key}
                            </StyledToggle>
                          ))}
                        </StyledToggleButtonGroup>
                      </Row>
                      {/* <div className="invalid-feedback text-center">{daysErr}</div> */}

                    </Row>

                  </Col>
                </Row>
                <Row>
                  <table className="table mb-0 text-center table-bordered tabel-responsive-lg">
                    <thead className="bg-light">
                      <tr>
                        <th scope="col" className="border-0">{t('Device')}</th>
                        <th scope="col" className="border-0">{t('Equipments')}</th>
                        <th scope="col" className="border-0">{t('Start & End time')}</th>
                        <th scope="col" className="border-0"></th>

                      </tr>
                    </thead>
                    <tbody>
                      {
                        rowsData.map((item, indx) => {
                          return (
                            <>
                            <tr key={indx}>
                              <td>
                                <FormControl sx={{ m: 0, minWidth: 170 }} size="small">
                                  <InputLabel id="demo-select-small">Select Device</InputLabel>
                                  <Select
                                    labelId="demo-select-small"
                                    id="demo-select-small"
                                    value={equipmentUid.indx}
                                    name={indx}
                                    onChange={onChangeHandlerDevice}
                                  >

                                    {
                                      equipments.map(item => (
                                        <MenuItem
                                          key={item.id}
                                          value={item.uid}
                                        >
                                          {item.name}
                                        </MenuItem>
                                      ))}
                                  </Select>
                                </FormControl>
                              </td>
                              <td>
                                <FormControl sx={{ m: 0, minWidth: 170 }} size="small">
                                  <InputLabel id="demo-select-small">Select Equipment</InputLabel>
                                  <Select
                                    labelId="demo-select-small"
                                    id="demo-select-small"
                                    value={relayName.indx}
                                    name={indx}
                                    onChange={onChangeHandlerRelay}
                                  >

                                    {relays.map((relay) => (
                                      <MenuItem
                                        key={relay.id}
                                        value={relay.id}
                                      >
                                        {relay.port}
                                      </MenuItem>
                                    ))}
                                  </Select>
                                </FormControl>
                              </td>
                              <td>

                                <div className='d-flex justify-content-center align-items-center m-1'>
                                  <input
                                    name={`${indx}_${relayName[indx]}`}
                                    style={{ minHeight: 32, marginRight: 5, outline: 'none', border: '1px solid #e4e4e4' }}
                                    // key={indx}
                                    value={startTime.indx}
                                    onChange={onChangeHandlerStart}
                                    type="time"
                                    // id={indx}
                                  />

                                  <input
                                     name={`${indx}_${relayName[indx]}`}
                                    style={{ minHeight: 32, marginRight: 5, outline: 'none', border: '1px solid #e4e4e4' }}
                                     value={endTime.indx}
                                    onChange={onChangeHandlerEnd}
                                    type="time"
                                    // id={indx}
                                  />

                                </div>

                              </td>
                              <td>
                                <button style={{ outline: 'none', border: 'none', background: 'transparent' ,paddingTop:10}} onClick={(e) => deleteTableRows(indx,e)}><i style={{fontSize :20,color:"#27A6B7"}}  className="material-icons">&#xe872;</i></button>

                              </td>
                            </tr>
                            </>
                          )
                        })
                      }
                            <>
                              
                                <>
                                <button style={{ outline: 'none', border: 'none', background: 'transparent' }} onClick={() => addTableRows()}><i style={{fontSize :35,color:"#27A6B7"}} className='material-icons'>&#xe147;</i></button>
                                </>


                            </>
                      



                    </tbody>
                  </table>
                </Row>
              </CardBody>
            </Card>
          </Col>

        </Row>
        <Row noGutters className="page-header py-4">
          <PageTitle
            sm="4"
            title={t('My Planning')}
            subtitle={t('My Planning')}
            className="text-sm-left"
          />
        </Row>
        <Row>
          <Col lg="12" md="12" sm="12" className="mb-4">
            <Card>
              <CardHeader className="border-bottom">{t('Active Plannings')}</CardHeader>

              <CardBody>
                <PlanningList equipmentData={equipments} planningList={planningList} />

              </CardBody>

            </Card>
          </Col>
        </Row>
      </Container>
    </>
  )
}

export default CommandsPlanning