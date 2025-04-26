import React, { useEffect, useState } from "react";

import { Row, Col, Form } from 'react-bootstrap';

import api from '../../api/api';
import { useTranslation } from "react-i18next";
import { Carousel } from "react-responsive-carousel";

function FieldCropForm(props) {
  const { t, i18n } = useTranslation();

  const [checked,setChecked] = useState(false)
  const [listCrop, setListCrop] = useState([])
  const [allVarieties,setAllVarieties] = useState([])
  const [cropData,setCropData] = useState({
    cropType:"",
    variety: '',
    cropVariety: [],
    Profondeur: "",
    days: "",
    plantingDate: "",
    kcList: []
  })
  const [otherInfo, setOI] = useState({
    type: props.cropType,
    plantDate:props.plantingDate,
    rootDepth:props.rootDepth,
    days:props.days,
    cropVariety:props.cropVariety,
    //  previous_type: props.previous_type,
    startDate: props.startDate,
    endDate: props.endDate,
    field_uid: props.field_uid,
    density : props.density
    // GDD: props.gdd
  });
  // useEffect(()=>{
  //   const getZones= async () => {
  //     const response = await api.get('/zones')
  //     const newData = await response.data;
  //     setData(newData.farms.fields);
  //     console.log(newData.farms.fields)
  //   };
  //   getZones();

  // },[])


  useEffect(() => {


    let CardValues = JSON.stringify(otherInfo);
    props.onChange(CardValues);
  }, [props.saved]);


  useEffect(() => {
    const getCropType = async () => {
      try {
        await api.get('/croptype/list-crop')
          .then(response => {
            if (response) {
              let dataCrop = response.data.Croptype
              setListCrop(dataCrop)
            }
          })

      } catch (error) {
        console.log(error)
      }
    }
    const getVarieties = async () => {
      try {
          await api.get('/varieties/get-varieties')
              .then(response => {
                  if (response.data.type === "success") {
                      let listVarieties = response.data.Varieties
                      setAllVarieties(listVarieties)

                  }
              }).catch(error => {
                  console.log(error)
              })

      } catch (error) {
          console.log(error)
      }
  }
    getVarieties()
    getCropType()
  }, [])

  const handleCropPick = (e) => {
    e.preventDefault()
    props.handleCropType(e)
    const crop = listCrop.find(
      (crop) => crop.id == e.target.value
      );
      if(e.target.value !== ''){
        setOI({...otherInfo, type : crop.id})
        props.handleRuPractical(crop.practical_fraction)
        props.handleDays(crop.total)
        props.handleRootDepth(crop.root_max)
        props.handlePlantingDate(crop.plant_date.slice(0, 11).replace('T', ''))

      }
      let varieties = []
      if (crop) {
        const variety = allVarieties.map((variety) => {
          if (variety.crop_id === crop.id) {
            varieties.push({
              varietyId :variety.id,
              variety: variety.crop_variety
            })
          }
        });
        
        setCropData({
          ...cropData,
            cropType: crop.id,
            variety: crop.crop_variety,
            cropVariety: varieties,
            Profondeur: crop.root_max,
            days: crop.total,
            plantingDate: crop.plant_date.slice(0, 11).replace('T', ''),
            kcList: crop.all_kc
          });
          

    }
};
const handleVarietyPick = (e) => {
  e.preventDefault();
  const variety = allVarieties.find(
   
      (variety) => variety.id == e.target.value

  )
  if(e.target.value !== ''){
    props.handleCropVariety(e)
    // props.handleDays(variety.total)
    // props.handleRootDepth(variety.root_max)
    // props.handlePlantingDate(variety.plant_date.slice(0, 11).replace('T', ''))

  }
  if (variety) {
      setCropData({
          ...cropData,
          cropType: "",
          variety: variety.id,
          // Profondeur: variety.root_max,
          // days: variety.total,
          // plantingDate: variety.plant_date.slice(0, 11).replace('T', ''),
          // kcList: variety.all_kc
      });
  }
};

useEffect(()=>{
  if(props.ecartInter !== "" && props.ecartIntra !== ""){
  
  let formule  = 10000 / (Number(props.ecartInter) * Number(props.ecartIntra))
    console.log(formule)
    setOI({ ...otherInfo,density : formule})
}
},[props.ecartInter,props.ecartIntra])
console.log(otherInfo.density)
  return (
    <Col lg="12" sm="12" md="12">
      <Form>
        <Row className="py-2 d-flex justify-content-start border-bottom align-items-center">
          <Col lg="4" sm="12" md="12" >

            <Carousel  
            >
                    {
                      listCrop.map(crop => {
                        return (
                          <>
                          <img
                          className="h-100"
                          src={`${process.env.REACT_APP_BASE_URL}/static/${crop.crop_photo}`}  
                          alt={crop.crop}
                          width="110"
                          />
                          <span>{crop.crop}</span>
                          </>

                        )
                      })
                    }

             </Carousel>
          
          </Col>
          <Col lg='4' md="12" sm="12" className="form-group pt-4">
            <p style={{ margin: "0px" }}>{t('crop_type')}</p>
            <Form.Select
              onChange={handleCropPick}
              placeholder={t('crop_type')}
              value={otherInfo.type}
            >
              <option value="">Select Crop</option>
              {
                listCrop.map(crop => {
                  return (
                    <option value={crop.id}>{crop.crop}</option>

                  )
                })
              }
            </Form.Select>

              <p style={{ margin: "0px" }}>{t('crop_variety')}</p>
              <Form.Select value={cropData.variety || ""} onChange={handleVarietyPick} id="cropVariety">
                <option value="">{t('crop_variety')}</option>
                  {
                      cropData.cropVariety.map(variety => (
                          <option value={variety.varietyId}>{variety.variety}</option>
                      ))
                  }
              </Form.Select>
              <input type="checkbox" name="Autre" id="check" onClick={() => setChecked(!checked)} /> {t('other')}
                  {
                      checked
                      ?

                      <Form.Control 
                      value={cropData.variety || ""}
                      placeholder={t('crop_variety')}
                      id="cropVariety"
                      onChange={e => setCropData({...cropData , variety : e.target.value})}
                      />

                      :
                      null
                  }
                      
          </Col>   
          < Col lg="4" md="12" sm="12" className="form-group">
            <p style={{ margin: "0px" }}>{t('crop_zone')}</p>
            <Form.Select
              onChange={props.handleZone}
              placeholder={t('crop_zone')}
            >
              <option>{t('select_zone')}</option>

              {
                props.zones.map((item, indx) => {
                  return <option value={item.Uid}>{item.name}</option>
                })
              }
            </Form.Select>
            <p style={{ margin: "0px" }}>{t('crop_field')}</p>
            <Form.Select
              value={otherInfo.field_uid}
              onChange={props.handleUidField}
              placeholder={t('crop_zone')}
            >
              <option>{t('select_field')}</option>
              {
                props.fields.map((item, indx) => {
                  return <option value={item.Uid}>{item.title}</option>
                })
              }
            </Form.Select>

          </Col>     
        </Row>  
        <Row className="py-2">
           {/* <Col lg='4' md="12" sm="12" className="form-group">
            <p style={{ margin: "0px" }}>{t('prev_type')}</p>
            <Form.Control
              onChange={props.handlePrevType}
              placeholder={t('prev_type')}
            />
          </Col> */}
          <Col lg="4" md="12" sm="12">
            <Form.Group>
              <p style={{ margin: "0px" }}>{t('depth')} (m)</p>
              <Form.Control type="number" value={props.rootDepth} onChange={e => props.handleRootDepth(e.target.value)} id='z' placeholder={t('depth')}
              />

            </Form.Group>

          </Col>
          <Col lg="4" md="12" sm="12">
            <Form.Group>
              <p style={{ margin: "0px" }}>{t('Days')}</p>

              <Form.Control type="number" value={props.days} id='days' onChange={e => props.handleDays(e.target.value)} placeholder={t('Days')} />

            </Form.Group>

          </Col>
          <Col lg="4" md="12" sm="12">
            <Form.Group>
              <p style={{ margin: "0px" }}>{t('planting_date')}</p>
              <Form.Control type="date" value={props.growingDate} onChange={props.handleGrowingDate} id='days' />

            </Form.Group>

          </Col>
          <Col hidden lg="4" md="12" sm="12">
            <Form.Group >
              <p style={{ margin: "0px" }}>{t('growing_season')}</p>
              <Form.Control type="date"  value={props.plantingDate} onChange={e => props.handlePlantingDate(e.target.value)} id='days' />

            </Form.Group>

          </Col>
          <Col lg="4" md="12" sm="12">
              <Form.Group>
                <p style={{ margin: "0px" }}>{t('fraction_pratique')} (%) </p>
                <Form.Control type="number" value={props.ruPratique} onChange={e => props.handleRuPractical(e.target.value)} id='ruPratique' placeholder={t('fraction_pratique')}
                />
              </Form.Group>

            </Col>
            <Col lg="4" md="12" sm="12">
              <Form.Group>
                <p style={{ margin: "0px" }}>{t('ecart_inter')} (m)</p>
                <Form.Control type="number" value={props.ecartInter} onChange={props.handleEcartInter} id='ecartInter' placeholder={t('ecart_inter')}
                />
              </Form.Group>

            </Col>
            <Col lg="4" md="12" sm="12">
              <Form.Group>
                <p style={{ margin: "0px" }}>{t('ecart_intra')} (m) </p>
                <Form.Control type="number" value={props.ecartIntra} onChange={props.handleEcartIntra} id='ecartIntra' placeholder={t('ecart_intra')}
                />
              </Form.Group>

            </Col>
            <Col lg="4" md="12" sm="12">
              <Form.Group>
                <p style={{ margin: "0px" }}>{t('densité')} (plants/ha)</p>
                <Form.Control type="number" value={otherInfo.density} onChange={props.handleCropDensity} id='densité' placeholder={t('densité')}
                />
              </Form.Group>

            </Col>
        </Row>
      </Form>
    </Col>
  );
}

FieldCropForm.defaultProps = {
  crop: "Crop A",
  prevCrop: "Crop B"
};

export default FieldCropForm;
