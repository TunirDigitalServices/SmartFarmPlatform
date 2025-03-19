import React from "react";
import {
  Row,
  Col,
  Form,
  FormGroup,
  FormFeedback,
  FormInput,
  FormSelect,
  Button
} from "shards-react";

const FormValidation = () => (
  <Col sm="12" md="6">
    <Form>
      <Row form>
        <Col md="6" className="form-group">
          <FormInput
            value=""
            placeholder="Field Name"
            required
            onChange={() => {}}
          />
          <FormFeedback>The first name looks good!</FormFeedback>
        </Col>
        <Col md="6" className="form-group">
          <FormSelect>
            <option>Choose Farm</option>
            <option>...</option>
          </FormSelect>
        </Col>
      </Row>
      <FormGroup>
        <textarea class="form-control" placeholder="Description"></textarea>
        <FormFeedback>The username is taken.</FormFeedback>
      </FormGroup>
    </Form>
    <Form>
      <Row form>
        <Col md="12" className="form-group">
          <p style={{ margin: "0px" }}>Soil zone</p>
          <FormSelect>
            <option>Zone 1</option>
            <option>...</option>
          </FormSelect>
        </Col>
        <Col md="12" className="form-group">
          <p style={{ margin: "0px" }}>Source</p>
          <FormSelect>
            <option>Manual</option>
            <option>...</option>
          </FormSelect>
        </Col>
        <Col md="12" className="form-group">
          <p style={{ margin: "0px" }}>Property</p>
          <FormSelect>
            <option>Standard</option>
            <option>...</option>
          </FormSelect>
        </Col>
        <Col md="2" className="form-group">
          <div>
            <p style={{ margin: "0px" }}>Depth</p>
            <Button outline>0</Button>
          </div>
        </Col>
        <Col md="10" className="form-group">
          <div>
            <p style={{ margin: "0px" }}>Soil Type</p>
            <FormSelect>
              <option>Clay</option>
              <option>...</option>
            </FormSelect>
          </div>
        </Col>
      </Row>
    </Form>
  </Col>
);

export default FormValidation;
