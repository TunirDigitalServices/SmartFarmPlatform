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

function PivotForm(props) {
  const { t, i18n } = useTranslation();

  return (
    <>
      <Col md="12" className="form-group">
        <p style={{ margin: "0px" }}>{t('pivot_shape')}</p>
        <FormSelect value={props.pivot_shape} onChange={props.handlePivotShape}>
          <option value="circular">Circular</option>
          <option value="semi_circular">Semi-Circular</option>
        </FormSelect>
      </Col>
      <Col md="12" className="form-group">
        <p style={{ marginBottom: "10px" }}>{t('Irrigation_system_calculations')}</p>
        <div
          style={{
            display: "flex",
            justifyContent: "space-around",
            alignItems: "center"
          }}
          onChange={props.handleIrrgSyst}
        >
          <div>
            <input type="radio" name="IrrigationSys" value="flowrate"/> {t('by_flowrate')}
          </div>
          <div>
            <input type="radio" name="IrrigationSys"  value="depth" /> {t('by_depth')}
          </div>
        </div>
      </Col>

      <Col md="12" className="form-group">
        <FormInput placeholder={t('name')} required onChange={props.handleName} />
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
          value={props.pivot_coord}
          placeholder={t('pivot_center_coordinates')}
          required
          onChange={props.handlePivotCoord}
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

export default PivotForm;
