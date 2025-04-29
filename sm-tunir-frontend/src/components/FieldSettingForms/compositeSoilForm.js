import React, { useState, useEffect, useRef } from "react";
import Nouislider from "nouislider-react";
import "nouislider/dist/nouislider.css";

import { Row, Col } from "react-bootstrap"; // use react-bootstrap instead of shards-react
import { useTranslation } from "react-i18next";

function CompositeSoil(props) {
  const [state, setState] = useState({ ...props });
  const { t } = useTranslation();

  const claySandSiltSlider = useRef(null);
  const OMslider = useRef(null);
  const ECDslider = useRef(null);
  const PHslider = useRef(null);

  useEffect(() => {
    // Set up pips for all sliders after mounting
    if (claySandSiltSlider.current) {
      claySandSiltSlider.current.noUiSlider.updateOptions({
        pips: {
          mode: "positions",
          values: [0, 25, 50, 75, 100],
          density: 5,
        },
      });
    }
    if (OMslider.current) {
      OMslider.current.noUiSlider.updateOptions({
        pips: {
          mode: "positions",
          values: [0, 25, 50, 75, 100],
          density: 5,
        },
      });
    }
    if (ECDslider.current) {
      ECDslider.current.noUiSlider.updateOptions({
        pips: {
          mode: "positions",
          values: [0, 25, 50, 75, 100],
          density: 5,
        },
      });
    }
    if (PHslider.current) {
      PHslider.current.noUiSlider.updateOptions({
        pips: {
          mode: "positions",
          values: [0, 50, 100],
          density: 5,
        },
      });
    }
  }, []);

  useEffect(() => {
    if (props.onChange) {
      props.onChange(state);
    }
  }, [state]);

  const handleClaySandSiltChange = (values) => {
    const clay = Math.round(parseFloat(values[0]));
    const sand = Math.round(parseFloat(values[1]) - parseFloat(values[0]));
    const silt = 100 - Math.round(parseFloat(values[1]));
    setState((prevState) => ({ ...prevState, clay, sand, silt }));
  };

  const handleSingleSliderChange = (field) => (values) => {
    setState((prevState) => ({ ...prevState, [field]: parseFloat(values[0]) }));
  };

  return (
    <Row className="d-flex justify-content-center align-items-center">
      <div className="d-flex justify-content-center gap-2">
        <Col md="3" className="form-group">
          <p style={{ margin: "0px" }}>{t('clay')}</p>
          <input
            type="number"
            style={{ textAlign: "center" }}
            className="form-control"
            value={state.clay}
            onChange={e => setState({ ...state, clay: parseFloat(e.target.value) || 0 })}
          />
        </Col>
        <Col md="3" className="form-group">
          <p style={{ margin: "0px" }}>{t('sand')}</p>
          <input
            type="number"
            style={{ textAlign: "center" }}
            className="form-control"
            value={state.sand}
            onChange={e => setState({ ...state, sand: parseFloat(e.target.value) || 0 })}
          />
        </Col>
        <Col md="3" className="form-group">
          <p style={{ margin: "0px" }}>{t('silt')}</p>
          <input
            type="number"
            style={{ textAlign: "center" }}
            className="form-control"
            value={state.silt}
            onChange={e => setState({ ...state, silt: parseFloat(e.target.value) || 0 })}
          />
        </Col>
      </div>

      {/* Clay/Sand/Silt Slider */}
      <Col md="12" className="form-group">
        <p style={{ margin: "0px" }}>{t('soil_composition')}</p>
        <Nouislider
          range={{ min: 0, max: 100 }}
          start={[state.clay, state.clay + state.sand]}
          connect={[true, true, true]}
          step={1}
          tooltips={true}
          behaviour="tap-drag"
          instanceRef={(instance) => {
            claySandSiltSlider.current = instance;
          }}
          onUpdate={handleClaySandSiltChange}
        />
      </Col>
      <div className="d-flex  justify-content-center gap-2">
      {/* Organic Matter */}
      <Col md="6" className="form-group">
        <p style={{ margin: "0px", paddingBottom: 15 }}>{t('organic_matter')}</p>
        <Nouislider
          range={{ min: 0, max: 80 }}
          start={[state.OM]}
          connect
          step={0.1}
          tooltips={true}
          behaviour="tap-drag"
          instanceRef={(instance) => {
            OMslider.current = instance;
          }}
          onUpdate={handleSingleSliderChange('OM')}
        />
      </Col>

      {/* Salinity */}
      <Col md="6" className="form-group">
        <p style={{ margin: "0px", paddingBottom: 15 }}>{t('soil_salinity')}</p>
        <Nouislider
          range={{ min: 0, max: 40 }}
          start={[state.Ecd]}
          connect
          step={0.1}
          tooltips={true}
          behaviour="tap-drag"
          instanceRef={(instance) => {
            ECDslider.current = instance;
          }}
          onUpdate={handleSingleSliderChange('Ecd')}
        />
      </Col>
      </div>
      {/* pH */}
      <Col md="6" className="form-group">
        <p style={{ margin: "0px", paddingBottom: 15 }}>{t('pH')}</p>
        <Nouislider
          range={{ min: 0, max: 10 }}
          start={[state.pH]}
          connect
          step={0.1}
          tooltips={true}
          behaviour="tap-drag"
          instanceRef={(instance) => {
            PHslider.current = instance;
          }}
          onUpdate={handleSingleSliderChange('pH')}
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
  pH: 7,
  OM: 0,
  CEC: 0,
  soilProprety: "Composite",
  soilType: ""
};

export default CompositeSoil;
