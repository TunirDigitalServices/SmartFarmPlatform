import React, { useEffect, useState } from "react";

import { useTranslation } from "react-i18next";
import {
  Container,
  Row,
  Col,
  Form,
  Card,
  InputGroup,
  Button,
} from "react-bootstrap";
import PageTitle from "../components/common/PageTitle";
import swal from "sweetalert";
import api from "../api/api";
import FarmSelect from "../components/FarmSelect";
import { useLocation, useNavigate } from "react-router";

export default function AddCropInfo() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const { fieldId, fieldName, zoneId, zoneName } = location.state || {};
  console.log(zoneId, zoneName);

  const [validated, setValidated] = useState(false);
  const [listCrop, setListCrop] = useState([]);
  const [allVarieties, setAllVarieties] = useState([]);

  const [checked, setChecked] = useState(false);
  const [zones, setZones] = useState([]);

  const [cropData, setCropData] = useState({
    field_uid: fieldId ? fieldId : "",
    zone_uid: zoneId ? zoneId : "",
    cropType: "",
    variety: "",
    cropVariety: [],
    Profondeur: "",
    days: "",
    plantingDate: "",
    growingDate: "",
    rootDepth: "",
    ecartInter: "",
    ecartIntra: "",
    density: "",
    ruPratique: "",
    kcList: [],
    surface: "",
    kc_init: "",
    kc_mid: "",
    kc_late: "",
    init: "",
    dev: "",
    mid: "",
    late: "",
  });
  const [defaultKcPeriod, setDefaultKcPeriod] = useState({
    kc_init: "",
    kc_mid: "",
    kc_late: "",
    period_init: "",
    period_dev: "",
    period_mid: "",
    period_late: "",
  });
  const [isKcModified, setIsKcModified] = useState(false);
  console.log(cropData, "cd");

  useEffect(() => {
    const getCropType = async () => {
      try {
        await api.get("/croptype/list-crop").then((response) => {
          if (response) {
            let dataCrop = response.data.Croptype;
            setListCrop(dataCrop);
          }
        });
      } catch (error) {
        console.log(error);
      }
    };

    const getVarieties = async () => {
      try {
        await api
          .get("/varieties/get-varieties")
          .then((response) => {
            if (response.data.type === "success") {
              let listVarieties = response.data.Varieties;
              setAllVarieties(listVarieties);
            }
          })
          .catch((error) => {
            console.log(error);
          });
      } catch (error) {
        console.log(error);
      }
    };
    getVarieties();
    // getIrrigations()
    // getSoils()
    getCropType();
  }, []);

  useEffect(() => {
    const getDataFields = async () => {
      if (cropData.field_uid) {
        await api
          .post("/field", { field_uid: cropData.field_uid })
          .then((res) => {
            console.log(res.data.field.zones, "--------------res");
            setZones(res.data.field.zones);
            // setCrops(Crops)
          });
      }
    };
    getDataFields();
  }, [cropData.field_uid]);
  const handleVarietyPick = (e) => {
    e.preventDefault();
    const variety = allVarieties.find(
      (variety) => variety.id == e.target.value
    );
    console.log(variety, "var");
    if (variety) {
      const hasKcValues =
        variety.kc_init ||
        variety.kc_mid ||
        variety.kc_late ||
        variety.init ||
        variety.dev ||
        variety.mid ||
        variety.late;

      const kcData = {
        kc_init: hasKcValues ? variety.kc_init : defaultKcPeriod.kc_init,
        kc_mid: hasKcValues ? variety.kc_mid : defaultKcPeriod.kc_mid,
        kc_late: hasKcValues ? variety.kc_late : defaultKcPeriod.kc_late,
        init: hasKcValues ? variety.init : defaultKcPeriod.init,
        dev: hasKcValues ? variety.dev : defaultKcPeriod.dev,
        mid: hasKcValues ? variety.mid : defaultKcPeriod.mid,
        late: hasKcValues ? variety.late : defaultKcPeriod.late,
      };

      setCropData((prev) => ({
        ...prev,
        variety: variety.id,
        ...kcData,
      }));

      // setDefaultKcPeriod(kcData);
    }
  };
  const handleCropPick = (e) => {
    e.preventDefault();
    // props.handleCropType(e)

    const crop = listCrop.find((crop) => crop.id == e.target.value);
    if (e.target.value !== "") {
      setCropData((prev) => ({
        ...prev,
        cropType: crop.id,
        ruPratique: crop.practical_fraction,
        days: crop.total,
        rootDepth: crop.root_max,
        plantingDate: crop.plant_date.slice(0, 11).replace("T", ""),
      }));
    }
    let varieties = [];
    if (crop) {
      const kcs = {
        kc_init: crop.kc_init || "",
        kc_mid: crop.kc_mid || "",
        kc_late: crop.kc_late || "",
        init: crop.init || "",
        dev: crop.dev || "",
        mid: crop.mid || "",
        late: crop.late || "",
      };

      setDefaultKcPeriod(kcs);
      const variety = allVarieties.map((variety) => {
        if (variety.crop_id === crop.id) {
          varieties.push({
            varietyId: variety.id,
            variety: variety.crop_variety,
          });
        }
      });

      setCropData({
        ...cropData,
        cropType: crop.id,
        variety: crop.crop_variety,
        cropVariety: varieties,
        rootDepth: crop.root_max,
        ruPratique: crop.practical_fraction,
        days: crop.total,
        plantingDate: crop.plant_date.slice(0, 11).replace("T", ""),
        ...kcs,
      });
    }
  };
  const checkIfKcModified = () => {
    if (!defaultKcPeriod) return false;

    return (
      cropData.kc_init !== defaultKcPeriod.kc_init ||
      cropData.kc_mid !== defaultKcPeriod.kc_mid ||
      cropData.kc_late !== defaultKcPeriod.kc_late ||
      cropData.init !== defaultKcPeriod.init ||
      cropData.dev !== defaultKcPeriod.dev ||
      cropData.mid !== defaultKcPeriod.mid ||
      cropData.late !== defaultKcPeriod.late
    );
  };
  useEffect(() => {
    setIsKcModified(checkIfKcModified());
  }, [
    cropData.kc_init,
    cropData.kc_mid,
    cropData.kc_late,
    cropData.init,
    cropData.dev,
    cropData.mid,
    cropData.late,
    defaultKcPeriod,
  ]);

  const addCrop = () => {
    let data = {
      zone_uid: cropData.zone_uid ? cropData.zone_uid : zoneId,
      field_uid: cropData.field_uid ? cropData.field_uid : fieldId,
      croptype_id: cropData.cropType,
      previous_type: cropData.previous_type,
      plantingDate: cropData.plantingDate,
      rootDepth: cropData.rootDepth,
      days: cropData.days,
      crop_variety_id: cropData.variety,
      practical_fraction: cropData.ruPratique,
      density: cropData.density,
      ecart_inter: cropData.ecartInter,
      ecart_intra: cropData.ecartIntra,
      surface: cropData.surface,
      growingDate: cropData.growingDate,
      kc_init: cropData.kc_init,
      kc_mid: cropData.kc_mid,
      kc_late: cropData.kc_late,
      init: cropData.init,
      dev: cropData.dev,
      mid: cropData.mid,
      late: cropData.late,
      is_kc_modified: isKcModified,
    };
    console.log(data, "submitted crop data");

    api
      .post("/crop/add-crop", data)
      .then((res) => {
        if (res.data.type && res.data.type == "danger") {
          swal(`Error`, {
            icon: "error",
          });
        }
        if (res.data.type && res.data.type == "success") {
          // swal(`${t('crop_added')}`, {
          //     icon: "success",
          // });
          setValidated(false);
          console.log(res.data);

          swal({
            title: `${t("crop_added")}`,
            text: "Would you like to continue to create an irrigation type ?",
            icon: "success",
            buttons: {
              cancel: "No",
              confirm: {
                text: "Yes",
                value: true,
              },
            },
          }).then((willContinue) => {
            if (willContinue) {
              navigate("/add-irrigation", {
                state: { fieldId, fieldName, zoneId, zoneName },
              });
            } else {
              navigate("/AddField");
            }
          });
        }
      })
      .catch((err) => {
        const message =
          err.response?.data?.message ||
          err.message ||
          "An unknown error occurred.";

        swal("Error", message, "error");
      });
  };
  const handleSubmit = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      event.stopPropagation();
      setValidated(true);
    } else {
      if (!cropData.zone_uid || cropData.zone_uid === "") {
        swal("Error", "Please select a crop zone before submitting.", "error");
        return;
      }
      await addCrop();
      setValidated(false);
      form.reset();
    }

    setValidated(true);
  };

  console.log("zone_uid from API:", zones);

  return (
    <Container className="p-md-5 p-3">
      <Row className="pb-2">
        <PageTitle subtitle={`${t("crop_info")}`} className="mb-1" />
        <Card className="bg-light border-0 rounded shadow-sm ">
          <Card.Body>
            <p style={{ fontSize: "16px", lineHeight: "1.5", margin: "0" }}>
              To add your crop type configuration, please provide the
              appropriate details and associate it with the appropriate field
              and soil type. This will help us to provide personalized
              recommendations for managing your crops and achieving optimal
              yields.
            </p>
          </Card.Body>
          <Form
            noValidate
            validated={validated}
            onSubmit={handleSubmit}
            className="p-md-5 p-3"
          >
            <Row className="mb-3 gap-3 justify-content-between">
              <Form.Group as={Col} md="4" controlId="validationCustom01">
                <Form.Label>{t("crop_type")} *</Form.Label>
                <Form.Select
                  onChange={handleCropPick}
                  placeholder={t("crop_type")}
                  value={cropData.cropType}
                  required
                >
                  <option value="">Select Crop</option>
                  {listCrop.map((crop) => {
                    return <option value={crop.id}>{crop.crop}</option>;
                  })}
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  Please select a crop type.
                </Form.Control.Feedback>
                <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
              </Form.Group>
              <Form.Group as={Col} md="3" controlId="validationCustom02">
                <Form.Label>{t("crop_variety")} *</Form.Label>
                <Form.Select
                  value={cropData.variety}
                  onChange={handleVarietyPick}
                  required
                >
                  <option value="">{t("crop_variety")}</option>
                  {cropData.cropVariety.map((variety) => (
                    <option value={variety.varietyId}>{variety.variety}</option>
                  ))}
                </Form.Select>
                <input
                  type="checkbox"
                  name="Autre"
                  id="check"
                  onClick={() => setChecked(!checked)}
                />{" "}
                {t("other")}
                {checked ? (
                  <Form.Control
                    value={cropData.variety || ""}
                    placeholder={t("crop_variety")}
                    id="cropVariety"
                    onChange={(e) =>
                      setCropData({ ...cropData, variety: e.target.value })
                    }
                  />
                ) : null}
                <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                <Form.Control.Feedback type="invalid">
                  Please select the crop variety.
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group
                as={Col}
                md="4"
                controlId="validationCustom03"
                className="mt-2"
              >
                <Form.Label>{t("crop_field")} *</Form.Label>

                <FarmSelect
                  defaultval={{ value: fieldId, label: fieldName }}
                  url="/field/search-all-fields"
                  onChange={(selected) => {
                    setCropData((prev) => ({
                      ...prev,
                      field_uid: selected?.value || "",
                      zone_uid: "",
                    }));
                  }}
                  placeholder={"Search fields..."}
                />

                <Form.Control.Feedback type="invalid">
                  Please select the crop field.
                </Form.Control.Feedback>
              </Form.Group>
            </Row>

            <Row className="mb-3 gap-3 justify-content-between">
              <Form.Group as={Col} md="4" controlId="validationCustomUsername">
                <Form.Label>{t("crop_zone")} *</Form.Label>
                <Form.Select
                  value={cropData.zone_uid}
                  onChange={(e) =>
                    setCropData({ ...cropData, zone_uid: e.target.value })
                  }
                  placeholder={t("crop_zone")}
                  required
                >
                  <option value="" disabled>
                    {t("select_zone")}
                  </option>

                  {zones.map((zone) => {
                    console.log(zone.uid, "zone.Uid");

                    return <option value={zone.uid}>{zone.name}</option>;
                  })}
                </Form.Select>

                <Form.Control.Feedback type="invalid">
                  Please choose the crop zone.
                </Form.Control.Feedback>
              </Form.Group>
              <Form.Group
                as={Col}
                md="3"
                controlId="validationCustom03"
                className="mt-3"
              >
                <Form.Label className="m-0">{t("surface")} (m²) *</Form.Label>
                <Form.Control
                  type="number"
                  required
                  value={cropData.surface}
                  onChange={(e) =>
                    setCropData({ ...cropData, surface: e.target.value })
                  }
                  placeholder={t("surface")}
                />
                <Form.Control.Feedback type="invalid">
                  Please provide the surface .
                </Form.Control.Feedback>
              </Form.Group>
              <Form.Group
                as={Col}
                md="4"
                controlId="validationCustom04"
                className="mt-2"
              >
                <Form.Label>{t("depth")} (m) </Form.Label>
                <Form.Control
                  type="number"
                  value={cropData.rootDepth}
                  onChange={(e) =>
                    setCropData({ ...cropData, rootDepth: e.target.value })
                  }
                  placeholder={t("depth")}
                />
                <Form.Control.Feedback type="invalid">
                  Please provide the depth.
                </Form.Control.Feedback>
              </Form.Group>
            </Row>
            <Row className="mb-3 gap-3 justify-content-between">
              <Form.Group
                as={Col}
                md="4"
                controlId="validationCustom03"
                className="mt-3"
              >
                <Form.Label className="m-0">{t("Days")} </Form.Label>
                <Form.Control
                  type="number"
                  value={cropData.days}
                  onChange={(e) =>
                    setCropData({ ...cropData, days: e.target.value })
                  }
                  placeholder={t("Days")}
                />

                <Form.Control.Feedback type="invalid">
                  Please provide the days .
                </Form.Control.Feedback>
              </Form.Group>
              <Form.Group
                as={Col}
                md="3"
                controlId="validationCustom05"
                className="mt-2"
              >
                <Form.Label>{t("planting_date")} *</Form.Label>
                <Form.Control
                  type="date"
                  required
                  value={cropData.growingDate}
                  onChange={(e) =>
                    setCropData({ ...cropData, growingDate: e.target.value })
                  }
                />

                <Form.Control.Feedback type="invalid">
                  Please provide the plantingDate.
                </Form.Control.Feedback>
              </Form.Group>
              <Form.Group
                as={Col}
                md="4"
                controlId="validationCustom06"
                className="mt-3"
              >
                <Form.Label className="m-0">{t("growing_season")}</Form.Label>
                <Form.Control
                  type="date"
                  value={cropData.plantingDate}
                  onChange={(e) =>
                    setCropData({ ...cropData, plantingDate: e.target.value })
                  }
                  id="days"
                />

                <Form.Control.Feedback type="invalid">
                  Please provide the growing season .
                </Form.Control.Feedback>
              </Form.Group>
            </Row>

            <Row className="mb-3 gap-3 justify-content-between">
              <Form.Group
                as={Col}
                md="4"
                controlId="validationCustom05"
                className="mt-2"
              >
                <Form.Label>{t("fraction_pratique")} (%) </Form.Label>
                <Form.Control
                  type="number"
                  value={cropData.ruPratique}
                  onChange={(e) =>
                    setCropData({ ...cropData, ruPratique: e.target.value })
                  }
                  placeholder={t("fraction_pratique")}
                />
                <Form.Control.Feedback type="invalid">
                  Please provide the fraction pratique.
                </Form.Control.Feedback>
              </Form.Group>
              <Form.Group
                as={Col}
                md="3"
                controlId="validationCustom06"
                className="mt-3"
              >
                <Form.Label className="m-0">
                  {t("ecart_inter")} (m) *
                </Form.Label>
                <Form.Control
                  type="number"
                  required
                  value={cropData.ecartInter}
                  onChange={(e) =>
                    setCropData({ ...cropData, ecartInter: e.target.value })
                  }
                  placeholder={t("ecart_inter")}
                />

                <Form.Control.Feedback type="invalid">
                  Please provide the ecartInter .
                </Form.Control.Feedback>
              </Form.Group>
              <Form.Group
                as={Col}
                md="4"
                controlId="validationCustom05"
                className="mt-2"
              >
                <Form.Label>{t("ecart_intra")} (m) *</Form.Label>
                <Form.Control
                  type="number"
                  required
                  value={cropData.ecartIntra}
                  onChange={(e) =>
                    setCropData({ ...cropData, ecartIntra: e.target.value })
                  }
                  placeholder={t("ecart_intra")}
                />
                <Form.Control.Feedback type="invalid">
                  Please provide the fraction pratique.
                </Form.Control.Feedback>
              </Form.Group>
            </Row>

            <Row className="mb-3 gap-3 justify-content-between">
              <Form.Group
                as={Col}
                md="4"
                controlId="validationCustom06"
                className="mt-3"
              >
                <Form.Label className="m-0">
                  {t("densité")} (plants/ha) *
                </Form.Label>
                <Form.Control
                  type="number"
                  required
                  value={cropData.density}
                  onChange={(e) =>
                    setCropData({ ...cropData, density: e.target.value })
                  }
                  placeholder={t("densité")}
                />

                <Form.Control.Feedback type="invalid">
                  Please provide the density .
                </Form.Control.Feedback>
              </Form.Group>
            </Row>
            <h6 className="text-muted small mt-5">
              - Kc Values (Crop Coefficient)
            </h6>
            <div className="border rounded px-3  ">
              <Row className="mb-2 mt-2 gap-3 justify-content-between">
                <Form.Group as={Col} md="4">
                  <Form.Label>Kc Init</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    placeholder="e.g. 0.30"
                    value={cropData.kc_init}
                    onChange={(e) =>
                      setCropData({ ...cropData, kc_init: e.target.value })
                    }
                  />
                </Form.Group>
                <Form.Group as={Col} md="3">
                  <Form.Label>Kc Mid</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    placeholder="e.g. 1.15"
                    value={cropData.kc_mid}
                    onChange={(e) =>
                      setCropData({ ...cropData, kc_mid: e.target.value })
                    }
                  />
                </Form.Group>
                <Form.Group as={Col} md="4">
                  <Form.Label>Kc Late</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    placeholder="e.g. 0.70"
                    value={cropData.kc_late}
                    onChange={(e) =>
                      setCropData({ ...cropData, kc_late: e.target.value })
                    }
                  />
                </Form.Group>

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() =>
                    setCropData((prev) => ({
                      ...prev,
                      kc_init: defaultKcPeriod.kc_init,
                      kc_mid: defaultKcPeriod.kc_mid,
                      kc_late: defaultKcPeriod.kc_late,
                    }))
                  }
                >
                  Reset Kc
                </Button>
              </Row>
            </div>
            <h6 className="text-muted small mt-5">
              - Crop Development Periods (Days)
            </h6>
            <div className="border rounded px-3  mb-5">
              <Row className="mb-2 mt-2 gap-3 justify-content-between">
                <Form.Group as={Col} md="3">
                  <Form.Label>Initial Period (days)</Form.Label>
                  <Form.Control
                    type="number"
                    placeholder="e.g. 20"
                    value={cropData.init}
                    onChange={(e) =>
                      setCropData({ ...cropData, init: e.target.value })
                    }
                  />
                </Form.Group>
                <Form.Group as={Col} md="3">
                  <Form.Label>Development Period (days)</Form.Label>
                  <Form.Control
                    type="number"
                    placeholder="e.g. 35"
                    value={cropData.dev}
                    onChange={(e) =>
                      setCropData({ ...cropData, dev: e.target.value })
                    }
                  />
                </Form.Group>
                <Form.Group as={Col} md="3">
                  <Form.Label>Mid Period (days)</Form.Label>
                  <Form.Control
                    type="number"
                    placeholder="e.g. 40"
                    value={cropData.mid}
                    onChange={(e) =>
                      setCropData({ ...cropData, mid: e.target.value })
                    }
                  />
                </Form.Group>
                <Form.Group as={Col} md="2">
                  <Form.Label>Late Period (days)</Form.Label>
                  <Form.Control
                    type="number"
                    placeholder="e.g. 25"
                    value={cropData.late}
                    onChange={(e) =>
                      setCropData({ ...cropData, late: e.target.value })
                    }
                  />
                </Form.Group>

                <Button
                  variant="secondary"
                  onClick={() =>
                    setCropData((prev) => ({
                      ...prev,
                      init: defaultKcPeriod.init,
                      dev: defaultKcPeriod.dev,
                      mid: defaultKcPeriod.mid,
                      late: defaultKcPeriod.late,
                    }))
                  }
                >
                  Reset Periods
                </Button>
              </Row>
            </div>
            <div className="d-flex justify-content-end">
              <Button type="submit mt-4">Submit form</Button>
            </div>
          </Form>
        </Card>
      </Row>
    </Container>
  );
}
