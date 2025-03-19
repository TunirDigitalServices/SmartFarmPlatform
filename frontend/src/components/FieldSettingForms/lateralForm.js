import React, { useState, useEffect } from "react";
import {
  Row,
  Col,
  Form,
  FormSelect,
  Button,
  Slider,
  FormRadio,
  FormInput
} from "shards-react";
import { useTranslation } from "react-i18next";


function LateralForm(props) {
  const { t, i18n } = useTranslation();

  return (
    <>
      <Col md="12" className="form-group">
        <p style={{ marginBottom: "0px" }}>{t('Irrigation_system_calculations')}</p>
      </Col>

      <Col md="12" className="form-group">
        <FormInput value={props.name} placeholder={t('name')} required onChange={props.handleName} />
      </Col>
      <Col md="6" className="form-group">
        <FormSelect 
        onChange={props.handleLateral}
        >
          <option value="lateral_ns">Lateral NS</option>
          <option value="lateral_ew">Lateral EW</option>
        </FormSelect>
      </Col>
      <Col md="6" className="form-group">
        <FormInput
        type="number"
          value={props.pivot_length}
          placeholder={t('pivot_length')}
          required
          onChange={props.handlePivotLength}
        />
      </Col>
      <Col md="6" className="form-group">
        <FormInput
        type="number"
          value={props.flowrate}
          placeholder={t('FlowRate')}
          required
          onChange={props.handleFlowRate}
        />
      </Col>
      <Col md="6" className="form-group">
        <FormInput
          value={props.full_runtime}
          placeholder={t('full_run_time')}
          required
          onChange={props.handleRunTime}
        />
      </Col>
    </>
  );
}

export default LateralForm;
