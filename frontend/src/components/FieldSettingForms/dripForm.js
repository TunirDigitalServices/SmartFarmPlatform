import React, { useState, useEffect } from "react";
import {
  Row,
  Col,
  FormGroup,
  FormInput
} from "shards-react";
import { useTranslation } from "react-i18next";


function DripForm(props) {
  const { t, i18n } = useTranslation();


  return (
    <>
      <Col lg="4" md="12" sm="12" className="form-group">
        <p style={{ margin: "0px" }}>{t('FlowRate')} (l/h)</p>
        <FormInput
          type="number"
          value={props.flowrate}
          placeholder={t('FlowRate')}
          required
          onChange={props.handleFlowRate}
        />
      </Col>
      <Col lg="4" md="12" sm="12" className="form-group">
        <p style={{ margin: "0px" }}>{t('Drippers')} (pieds)</p>
        <FormInput
          type="number"
          value={props.drippers}
          placeholder={t('Drippers')}
          required
          onChange={props.handleDrippers}
        />
      </Col>
      <Col lg="4" md="12" sm="12" className="form-group">
        <p style={{ margin: "0px" }}>{t('espace_drippers')} (m)</p>
        <FormInput
          type="number"
          value={props.drippersSpacing}
          placeholder={t('espace_drippers')}
          required
          onChange={props.handleDrippersSpacing}
        />
      </Col>
    </>
  );
}

export default DripForm;
