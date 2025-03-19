import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Row, Col, Form, FormSelect, Button, Slider } from "shards-react";
import { useTranslation } from "react-i18next";

function StandardSoil(props) {
  const soilTypes = ["Clay", "Loamy sand", "Sand", "Loam"];
  const [isDisabled, setIsDisabled] = useState(true);
  const [state, setState] = useState({ ...props });
  const { t, i18n } = useTranslation();

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

  return (
    <>
      <>
        <Col md="3" className="form-group">
          <p style={{ margin: "0px" }}>{t('depth')}</p>
          {depthInput()}
        </Col>
        <Col lg='4' md="12" sm="12" className="form-group">
          <div>
            <p style={{ margin: "0px" }}>{t('soil_type')}</p>
            <FormSelect
              onChange={evt => setState({ ...state, uni: evt.target.value })}
            >
              {state.listSoils.map((item, index) => {
                if (index == state.listSoils.indexOf(state.uni)) {
                  return <option selected={true}>{item.soil}</option>;
                } else {
                  return <option>{item.soil}</option>;
                }
              })}
            </FormSelect>
          </div>
        </Col>
      </>
    </>
  );
}

StandardSoil.propTypes = {
  depth: PropTypes.number,
  uni: PropTypes.string
};

StandardSoil.defaultProps = {
  depth: 0,
  uni: "Clay",
  soilProprety:"Standard"
};

export default StandardSoil;