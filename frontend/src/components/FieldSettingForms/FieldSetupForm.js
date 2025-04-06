import React, { useEffect, useState } from "react";
import {
  Row,
  Col,
  Form,
  FormGroup,
  FormFeedback,
  FormInput,
  FormSelect
} from "shards-react";
import axios from "axios";
import { useTranslation } from "react-i18next";
import api from '../../api/api';

function FieldSetupForm(props) {

  const [ local, setLocal ] =  useState(localStorage.getItem("local")||"en");
  const { t, i18n } = useTranslation();

  const [data, setData] = useState([]);
  const [fieldInfo, setFieldInfo] = useState({
    name: props.name,
    farm: props.farmName,
    description: props.description,
    farm_uid: props.farm_uid
  });

   useEffect(() => {
    const getFarms = async () => {
      await api.get('/farm/farms')
      .then(response => {
         let farms = response.data.farms
         setData(farms);
        }).catch(err=>{
          console.log(err)
        })
        

    } 
      getFarms();
    let CardValues = JSON.stringify({
      name: fieldInfo.name,
      farm_uid: fieldInfo.farm_uid,
      description: fieldInfo.description
    });

  }, [props.saved]);

  return (
      <Form>
        <Row>
          <Col lg='6' md="12" sm='12' className="form-group">
            <p style={{ margin: "0px" , textAlign:"left"}}>{t('name_field')}</p>
            <FormInput
              value={props.name}
              placeholder={t('name_field')}
              className={props.nameError =='' ? '' : 'is-invalid'}
              required
              onChange={props.handleName}
            />
          <div className="invalid-feedback" style={{textAlign: "left"}}>{props.nameError}</div>
          </Col>
          <Col  lg='6' md="12" sm='12'  className="form-group">
            <p style={{ margin: "0px", textAlign:"left" }}>{t('name_farm')}</p>
            <FormSelect
                value={props.farm_uid}
                className={props.farmError =='' ? '' : 'is-invalid'}
                required
                onChange={props.handleUidFarm}
            >
              <option value="">{t('select_farm')}</option>;
              {data.map((item, index) => {
                return <option value={item.uid}>{item.name}</option>;
              })}
            </FormSelect>
          </Col>
        </Row>
        <Row>
        <Col lg='6' md="12" sm='12' className="form-group">
            <p style={{ margin: "0px" , textAlign:"left"}}>{t('width')}</p>
            <FormInput
            type="number"
            placeholder={t('width')}
            value={props.width}
            onChange={props.handleWidth}
            required
            />
          </Col>
          <Col lg='6' md="12" sm='12' className="form-group">
            <p style={{ margin: "0px" , textAlign:"left"}}>{t('length')}</p>
            <FormInput
            type="number"
            placeholder={t('length')}
            value={props.length}
            onChange={props.handleLength}
            required
            />
          </Col>
        </Row>
      </Form>
  );
}

FieldSetupForm.defaultProps = {
  name: "",
  // farmName: "",
  description: ""
};

export default FieldSetupForm;
