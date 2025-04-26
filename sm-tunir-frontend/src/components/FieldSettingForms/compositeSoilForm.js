import React, { useState, useEffect } from "react";

import { Row, Col, Form } from 'react-bootstrap';

import { useTranslation } from "react-i18next";


function CompositeSoil(props) {
  const [isDisabled, setIsDisabled] = useState(true);
  const [state, setState] = useState({ ...props });
  const { t, i18n } = useTranslation();

  console.log(props.clay)

  useEffect(() => {
    if (state.depth != 0) {
      setIsDisabled(false);
    }
  }, []);

  useEffect(() => {
    if (props.onChange) {
      props.onChange(state);
    }
  }, [state]);

  const depthInput = () => {
    return (
      <input
        style={{ textAlign: "center" }}
        disabled={isDisabled}
        className="form-control"
        onChange={evt => setState({ ...state, depth: evt.target.value })}
        value={state.depth}
      />
    );
  };

  console.log(state.sand)

  return (
    <Row className="d-flex justify-content-center align-items-center">
      <Col md="12" className="form-group">
        <p style={{ margin: "0px" }}>{t('soil_composition')}</p>
      </Col>
      {/* <Col md="3" className="form-group">
        <p style={{ margin: "0px" }}>{t('depth')}</p>
        {depthInput()}
      </Col> */}
      <Col md="3" className="form-group">
        <p style={{ margin: "0px" }}>{t('clay')}</p>
        <input
        type="number"
          style={{ textAlign: "center" }}
          className="form-control"
          value={state.clay}
          onChange={e => setState({...state ,clay : e.target.value}) }
        />
      </Col>
      <Col md="3" className="form-group">
        <p style={{ margin: "0px" }}>{t('sand')}</p>
        <input
        type="number"
          style={{ textAlign: "center" }}
          className="form-control"
          value={state.sand}
          onChange={e => setState({...state ,sand : e.target.value}) }

        />
      </Col>
      <Col md="3" className="form-group">
        <p style={{ margin: "0px" }}>{t('silt')}</p>
        <input
        type="number"
          style={{ textAlign: "center" }}
          className="form-control"
          value={state.silt}
          onChange={e => setState({...state ,silt : e.target.value}) }

        />
      </Col>
      <Col md="12" className="form-group">
        <div
          style={{
            marginTop: "-25px"
          }}
        >
          <Form.Range
            onSlide={value => {
              setState({
                ...state,
                clay: parseInt(parseFloat(value[0]).toFixed(1)),
                sand: parseInt((value[1] - value[0]).toFixed(1)),
                silt: parseInt((100 - value[1]).toFixed(1))
              });
            }}
            connect
            start={[
              parseInt(state.clay),
              parseInt(state.clay) + parseInt(state.sand)
            ]}
            pips={{
              mode: "positions",
              values: [0, 25, 50, 75, 100],
              stepped: true,
              density: 5
            }}
            range={{ min: 0, max: 100 }}
          />
        </div>
      </Col>
      <Col md="6" className="form-group">
        <p style={{ margin: "0px", paddingBottom: 15 }}>{t('organic_matter')}</p>
        <Form.Range
          onSlide={value => setState({ ...state, OM: parseFloat(value[0]) })}
          theme="info"
          className="my-4"
          connect={[true, false]}
          start={[parseFloat(state.OM)]}
          range={{ min: 0, max: 80 }}
          tooltips
        />
      </Col>
      <Col md="6" className="form-group">
        <p style={{ margin: "0px", paddingBottom: 15 }}>{t('soil_salinity')}</p>
        <Form.Range
          onSlide={value => setState({ ...state, Ecd: parseFloat(value[0]) })}
          theme="info"
          className="my-4"
          connect={[true, false]}
          start={[parseFloat(state.Ecd)]}
          range={{ min: 0, max: 40 }}
          tooltips
        />
      </Col>
      <Col md="6" className="form-group">
        <p style={{ margin: "0px", paddingBottom: 15 }}>{t('pH')}</p>
        <Form.Range
          onSlide={value => {
            setState({ ...state, pH: parseFloat(value[0]) });
          }}
          theme="info"
          className="my-4"
          connect={[true, false]}
          start={[parseFloat(state.pH)]}
          range={{ min: 0, max: 10 }}
          tooltips
        />
      </Col>
    </Row>
  );
}

CompositeSoil.defaultProps = {
  depth: 0,
  clay: 20,
  sand: 60,
  silt: 20,
  Ecd: 0,
  ph: 0,
  OM: 0,
  CEC: 0,
  soilProprety:"Composite",
  soilType:""
};

export default CompositeSoil;