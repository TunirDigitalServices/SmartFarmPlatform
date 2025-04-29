import React, { useState , useEffect } from "react";
// import {
//   Row,
//   Col,
//   Form,
//   Card,
//   CardBody,
//   CardHeader,
  
//   FormGroup,

// } from "shards-react";
import { Row, Col, Form } from 'react-bootstrap';

import PivotForm from "./pivotForm";
import LateralForm from "./lateralForm";
import DripForm from "./dripForm";
import { useTranslation } from "react-i18next";
import api from "../../api/api";



function FieldIrrigationForm(props) {

  const { t, i18n } = useTranslation();


  const [typeInfo ,setTypeInfo] = useState({
    flowrate : props.flowrate,
    irrigated_already : props.irrigated_already,
   irrigation_syst : props.irrigation_syst,
   effIrrig : props.effIrrig,
   lateral : props.lateral,
   pivot_coord :props.pivot_coord,
   pivot_length:props.pivot_length,
   pivot_shape:props.pivot_shape,
   full_runtime:props.full_runtime,
   Name : props.name
  })

  const [listIrrigations, setListIrrigations] = useState([])
  const [irrigData,setIrrigData] = useState({
   effIrrig : ""
  })
  

  useEffect(() => {
    const getIrrigations = async () => {
      try {
        await api.get('/irrigations/get-irrigations')
          .then(response => {
            if (response) {
              let dataIrrig = response.data.Irrigations
              setListIrrigations(dataIrrig)
            }
          })

      } catch (error) {
        console.log(error)
      }
    }
    getIrrigations()
  }, [])



  const [irrigationMethod, setIM] = useState(props.Type);
  const IrrigationMethods = [
  { label : `${t('None')}`, value :'none'},
   {label : `${t('Drip')}` , value :"drip" },
   {label : `${t('Pivot')}`,value:'pivot'},
    {label :`${t('Lateral')}`,value : "lateral"},
    {label :`${t('SDI')}`,value : "sdi"},
    {label :`${t('Furrow')}`,value : "furrow"},
    {label :`${t('Sprinkler')}`,value : "sprinkler"}
  ];
  const irrigationMethodForm = () => {
    switch (irrigationMethod) {
      case `${t('Pivot')}`:
        return <PivotForm 
        handleFlowRate={props.handleFlowrate}
        handleIrrgSyst={props.handleIrrgSyst}
        handleRunTime={props.handleRunTime}
        handlePivotCoord={props.handlePivotCoord}
        handlePivotLength={props.handlePivotLength}
        handlePivotShape={props.handlePivotShape} 
        handleName={props.handleName}
        name={typeInfo.Name}
        flowrate={typeInfo.flowrate}
        irrigation_syst={typeInfo.irrigation_syst}
        pivot_coord={typeInfo.pivot_coord}
        pivot_length={typeInfo.pivot_length}
        pivot_shape={typeInfo.pivot_shape}
        full_runtime={typeInfo.full_runtime}
        />;
      case `${t('Lateral')}`:
        return <LateralForm 
        handleLateral={props.handleLateral}
        handlePivotLength={props.handlePivotLength}
        handleRunTime={props.handleRunTime}
        handleName={props.handleName}
        handleFlowRate={props.handleFlowrate}
        full_runtime={typeInfo.full_runtime}
        flowrate={typeInfo.flowrate}        
        name={typeInfo.name}
        pivot_length={typeInfo.pivot_length} 
        lateral={typeInfo.lateral}
        />;
      case `${t('None')}`:
        return null;
      default:
        return (
          <DripForm
          handleIrrigAlrd={props.handleIrrigAlrd}
          handleFlowRate={props.handleFlowrate}
          flowrate={typeInfo.flowrate}
          drippers={props.drippers}
          handleDrippers={props.handleDrippers}
          drippersSpacing={props.drippersSpacing}
          handleDrippersSpacing={props.handleDrippersSpacing}
          irrigated_already={typeInfo.irrigated_already}
          />
        );
    }
  };

  const handleIrrigPick = (e) => {
    e.preventDefault();
     const irrigation = listIrrigations.find((irrigation) => {
      return irrigation.irrigation == e.target.value
  
     })
     setIM(irrigation.irrigation)
    props.handleType(irrigation.irrigation)
    props.handleEffIrrig(irrigation.effIrrig)

    if (irrigation) {
        setIrrigData({
            ...irrigData,
            effIrrig : irrigation.effIrrig
        });
    }
  };

  return (
    <Col lg="12" sm="12" md="6">
      <Form>
        <Row form>
          <Col md="6" className="form-group">
            <p style={{ margin: "0px" }}>{t('irrigation_zone')}</p>
            <Form.Select
            value={props.zone}
            onChange={props.handleZone}
            >
               <option>{t('select_zone')}</option>

              {
                props.zones.map((item,indx) =>{       
                 return <option value={item.Uid}>{item.name}</option>
                })
              }
            </Form.Select>
          </Col>
          <Col md="6" className="form-group">
            <p style={{ margin: "0px" }}>{t('irrigation_crop')}</p>
            <Form.Select
            value={props.crop}
            onChange={props.handleCrop}
            >
              <option>{t('select_crop')}</option>
              {
                props.crops.map((item,indx) =>{       
                 return <option value={item.Uid}>{item.croptype.crop}</option>
                })
              }
            </Form.Select>
          </Col>
         
          <Col md="6" className="form-group">
            <p style={{ margin: "0px" }}>{t('Irrigation_system_type')}</p>
            <Form.Select
                className={props.typeErrorIrrig == '' ? '' : 'is-invalid'}
                onChange={evt => {
                handleIrrigPick(evt)
              }}
            >
              <option disabled selected value="">{t('select_irriagtion')}</option>
              {listIrrigations.map(item => {
                // if (item.value === irrigationMethod) {
                //   return <option value={item.value} selected={true}>{item.type}</option>;
                // } else {
                //   return <option value={item.value} selected={false}>{item.type}</option>;
                // }
                return <option value={item.irrigation} >{t(`${item.irrigation}`)}</option>;
              })}
            </Form.Select>
          </Col>
          <Col lg="4" md="8" sm="8">
              <Form.Group>
                <p style={{ margin: "0px" }}>{t('efficience_irrigation')} (%) </p>
                <Form.Control type="number" value={props.effIrrig} onChange={ e => props.handleEffIrrig(e.target.value)} id='effIrrig' placeholder={t('efficience_irrigation')}
                />

              </Form.Group>

            </Col>
            <Col lg="4" md="8" sm="8">
              <Form.Group>
                <p style={{ margin: "0px" }}>{t('type_reseau')}</p>
                <Form.Control value={props.pumpType} onChange={props.handlePumpType} id='debitReseau' placeholder={t('type_reseau')}
                />

              </Form.Group>

            </Col>
            <Col lg="4" md="8" sm="8">
              <Form.Group>
                <p style={{ margin: "0px" }}>{t('debit_reseau')} (l/s) </p>
                <Form.Control type="number" value={props.pumpFlow} onChange={props.handlePumpFlow} id='debitReseau' placeholder={t('debit_reseau')}
                />

              </Form.Group>

            </Col>
            <Col lg="4" md="8" sm="8">
                    <Form.Group>
                      <p style={{ margin: "0px" }}>{t('nbr_ligne')}</p>
                      <Form.Control type='number' value={props.linesNumber} onChange={props.handleLinesNumber} id='nbr_ligne' placeholder={t('nbr_ligne')}
                      />
      
                    </Form.Group>
      
                  </Col>
          {irrigationMethodForm()}
        </Row>
      </Form>
    </Col>
  );
}

export default FieldIrrigationForm;
