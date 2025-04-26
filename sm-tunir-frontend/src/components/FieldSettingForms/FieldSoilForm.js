import React, { useState, useEffect } from "react";

import {
  Row,
  Col,
  Form,
  Button
} from 'react-bootstrap';

import CompositeSoil from "./compositeSoilForm";
import StandardSoil from "./standardSoil";
import { useTranslation } from "react-i18next";
import { Carousel } from "react-responsive-carousel";

function FieldSoilForm(props) {
  const { t, i18n } = useTranslation();
  const [isStandardSoil, setSoilType] = useState(props.isStandard);
  const [currentDepthLevel, setDepthLevel] = useState(0);
  const [depthLevel, setLevel] = useState(props.depth);
  const [otherInfo, setOI] = useState({
    zone: 1,
    mode: "Manual",
    type: props.SoilProp,
    listSoils : props.listSoils,
    irrigArea : props.irrigArea
  });

  const [soilData,setSoilData] = useState({
    soilType :"",
    RUmax: props.RUmax,
    effPluie: props.effPluie,
    ruPratique: props.ruPratique,
    effIrrig: props.effIrrig,
  })

  // useEffect(() => {
  //   //console.log)
  //   let CardValues = JSON.stringify(otherInfo);
  //   props.onChange(CardValues);
  // }, [props.saved]);

  // useEffect(() => {
  //   soilTypeForm();
  //   props.handleDepth(props.depth)
  // }, [currentDepthLevel]);

  const handleSoilPick = (e) => {
    e.preventDefault()
    const soilType = otherInfo.listSoils.find(
        (soil) => soil.soil == e.target.value
    );
    // props.handleEffIrrig(soilType.fc)
    if(e.target.value !== ""){
      props.handleEffRain(soilType.rain_eff)
      props.handleRuPractical(soilType.practical_fraction)
      props.handleRuMax(soilType.ru)

    }
    if (typeof soilType !== "undefined") {
        setSoilData({
            ...soilData,
            soilType: soilType.soil,
            RUmax: soilType.ru,
            effIrrig: soilType.fc,
            ruPratique: soilType.practical_fraction,
            effPluie: soilType.rain_eff
        });

    }
};


  const soilTypeForm = () => {
    if (isStandardSoil == true)
      return (
          null
        // <StandardSoil
        //   listSoils={otherInfo.listSoils}
        //   key={currentDepthLevel}
        //   depth={depthLevel[currentDepthLevel].depth}
        //   uni={depthLevel[currentDepthLevel].uni}
        //   onChange={value => {
        //     depthLevel[currentDepthLevel].uni = value.uni;
        //     depthLevel[currentDepthLevel].depth = value.depth;
        //   }}
        // />
      );
    else {
      return (
        <CompositeSoil
          key={currentDepthLevel + 1}
          depth={depthLevel[currentDepthLevel].depth}
          clay={depthLevel[currentDepthLevel].clay}
          sand={depthLevel[currentDepthLevel].sand}
          silt={depthLevel[currentDepthLevel].silt}
          OM={depthLevel[currentDepthLevel].OM}
          pH={depthLevel[currentDepthLevel].pH}
          Ecd={depthLevel[currentDepthLevel].Ecd}
          CEC={depthLevel[currentDepthLevel].CEC}
          soilProprety={otherInfo.type}
          soilType={soilData.soilType}
          onChange={value => {
            depthLevel[currentDepthLevel] = value;
          }}
        />
      );
    }
  };

  console.log(soilData.soilType)

  const deleteDepthLevelButton = () => {
    if (depthLevel[currentDepthLevel].depth != 10) {
      return (
        <Col md="12" className="form-group">
          <Button
            theme="danger"
            onClick={evt => {
              evt.preventDefault();
              depthLevel.splice(currentDepthLevel, 1);
              setDepthLevel(currentDepthLevel - 1);
            }}
          >
            delete current depth level
          </Button>
        </Col>
      );
    }
  };



  return (
    <>
      <Col lg="12" sm="12" md="12">
        <Form>
          <Row  className="py-2 d-flex justify-content-start border-bottom align-items-center" >
            <Col lg="4" sm="12" md="12">
              <Carousel>
                  {
                    otherInfo.listSoils.map(item => {
                      return (
                        <>
                        <img
                        className="h-100"
                        src={`${process.env.REACT_APP_BASE_URL}/static/${item.soil_photo}`}  
                        alt={item.soil}
                        width="110"
                        />
                        <span>{item.soil}</span>
                        </>

                      )
                    })
                  }

                </Carousel>
            
            </Col>
            <Col lg='4' md="12" sm="12" className="form-group">
              <p style={{ margin: "0px" }}>{t('soil_zone')}</p>
              <Form.Control
                value={props.zoneName}
                placeholder={t('soil_zone')}
                required
                onChange={props.handleZoneName}

              />
                <p style={{ margin: "0px" }}>{t('soil_type')}</p>
            <Form.Select
            value={soilData.soilType}
              onChange={handleSoilPick}
            >
              <option value="">{t('select_soil')}</option>
              {
                otherInfo.listSoils.map((item, index) => {  
                    return <option value={item.soil} >{item.soil}</option>;
                
                })
              }
            </Form.Select>


            </Col>       
            <Col lg='4' md="12" sm="12" className="form-group">
              <p style={{ margin: "0px" }}>{t('soil_prop')}</p>
              <Form.Select
                onChange={evt => {
                  setOI({ ...otherInfo, type: evt.target.value });
                  props.handleSoilProprety(evt.target.value)
                  //if (
                  //window.confirm(
                  //  "Changing soil type risks of deleting all existing depth levels, are you sure to continue?"
                  //
                  //) {
                  setSoilType(!isStandardSoil);
                  //depthLevel.soilProprety = evt.target.value
                  //setDepthLevel({soilProprety: evt.target.value});
                  //setDepthLevel(0);
                  //depthLevel.splice(1, depthLevel.length - 1);
                  //} else {
                  //evt.preventDefault();
                  //}
                }}
              >
                <option selected={isStandardSoil}>Standard</option>
                <option selected={!isStandardSoil}>Composite</option>
              </Form.Select>
              <p style={{ margin: "0px" }}>{t('name_field')}</p>
              <Form.Select
                value={otherInfo.field_uid}
                onChange={props.handleUidField}
                placeholder={t('name_field')}
              >
                <option value="">{t('select_field')}</option>
                {props.fields.map((item, index) => {
                  return <option value={item.Uid}>{item.title}</option>;
                })}
              </Form.Select>
            </Col>
          </Row>
          <Row form>
            {soilTypeForm()}
          </Row>
          <Row form className="py-2" >
        
            <Col lg="4" md="12" sm="12">
              <Form.Group>
                <p style={{ margin: "0px" }}>{t('efficacité_pluie')} (%)</p>
                <Form.Control type="number" value={props.effPluie} onChange={e => props.handleEffRain(e.target.value)} id='effPluie' placeholder={t('efficacité_pluie')}
                />

              </Form.Group>
            </Col>
            <Col lg="4" md="12" sm="12">
              <Form.Group>
                <p style={{ margin: "0px" }}>RU max (mm/m)</p>
                <Form.Control type="number" value={props.RUmax} onChange={e => props.handleRuMax(e.target.value)} id='ruMax' placeholder="RU max"
                />

              </Form.Group>

            </Col>
          </Row>
        </Form>
      </Col>

    </>
  );
}

FieldSoilForm.defaultProps = {
  isStandard: true,
  SoilProp: "Standard",
  depth: [
    {
      depth: 10,
      clay: 20,
      sand: 60,
      silt: 20,
      CEC: 1,
      OM: 1,
      pH: 2,
      Ecd: 1,
      uni: "Clay",
      soilProprety: "Standard"
    }
  ]
};

export default FieldSoilForm;