import React, { useState, useEffect } from "react";
import { Col, Form, Row } from 'react-bootstrap';

import { useTranslation } from "react-i18next";


function DripForm(props) {
  const { t, i18n } = useTranslation();


  return (
    <Row className="d-flex gap-2 justify-content-between">
      <Col lg="4" md="12" sm="12" className="form-group">
        <p style={{ margin: "0px" }}>{t('FlowRate')} (l/h) * </p>
        <Form.Control
          type="number"
          value={props.flowrate}
          placeholder={t('FlowRate')}
          required
          onChange={props.handleFlowRate}
        />
      </Col>
      <Col lg="3" md="12" sm="12" className="form-group">
        <p style={{ margin: "0px" }}>{t('Drippers')} (pieds) *</p>
        <Form.Control
          type="number"
          value={props.drippers}
          placeholder={t('Drippers')}
          required
          onChange={props.handleDrippers}
        />
      </Col>
      <Col lg="4" md="12" sm="12" className="form-group">
        <p style={{ margin: "0px" }}>{t('espace_drippers')} (m) *</p>
        <Form.Control
          type="number"
          value={props.drippersSpacing}
          placeholder={t('espace_drippers')}
          required
          onChange={props.handleDrippersSpacing}
        />
      </Col>
    </Row>
  );
}

export default DripForm;
