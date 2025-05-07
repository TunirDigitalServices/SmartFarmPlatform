import React, { useState, useEffect } from "react";

import { Col, Form } from 'react-bootstrap';

import { useTranslation } from "react-i18next";

function PivotForm(props) {
  const { t, i18n } = useTranslation();

  return (
    <>
      <Col md="12" className="form-group">
        <p style={{ margin: "0px" }}>{t('pivot_shape')}</p>
        <Form.Select value={props.pivot_shape} onChange={props.handlePivotShape}>
          <option value="circular">Circular</option>
          <option value="semi_circular">Semi-Circular</option>
        </Form.Select>
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
        <Form.Control placeholder={t('name')} required onChange={props.handleName} />
      </Col>
      <Col md="6" className="form-group">
        <Form.Control
        type="number"
          value={props.pivot_length}
          placeholder={t('pivot_length')}
          required
          onChange={props.handlePivotLength}
        />
      </Col>
      <Col md="5" className="form-group">
        <Form.Control
        type="number"
          value={props.pivot_coord}
          placeholder={t('pivot_center_coordinates')}
          required
          onChange={props.handlePivotCoord}
        />
      </Col>
      <Col md="6" className="form-group">
        <Form.Control
        type="number"
          value={props.flowrate}
          placeholder={t('FlowRate')}
          required
          onChange={props.handleFlowRate}
        />
      </Col>
      <Col md="6" className="form-group">
        <Form.Control
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
