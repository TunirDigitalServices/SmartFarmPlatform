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
import { Line } from "react-chartjs-2";

import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend
);

export default function AddCropInfo() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const { fieldId, fieldName, zoneId, zoneName } = location.state || {};

  const [validated, setValidated] = useState(false);
  const [listCrop, setListCrop] = useState([]);
  const [allVarieties, setAllVarieties] = useState([]);
  const [resultCalculKc, setResultCalculKc] = useState([]);

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

  const [cropKcPeriod, setCropKcPeriod] = useState({
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
    init: "",
    dev: "",
    mid: "",
    late: "",
  });
  const [isKcModified, setIsKcModified] = useState(false);
  const chartData = {
    labels: cropData?.allKcList?.map((item) => `Day ${item.day}`),
    datasets: [
      {
        label: "Kc",
        data: cropData?.allKcList?.map((item) => parseFloat(item.kc)),
        fill: false,
        pointRadius: 0,
        borderColor: "rgb(75, 192, 192)",
        tension: 0.3,
      },
    ],
  };
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: "top",
      },
      title: {
        display: true,
        text: "Kc Evolution by Day",
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Days",
        },
      },
      y: {
        title: {
          display: true,
          text: "Kc",
        },
        min: 0,
        max: 1.2,
      },
    },
  };

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
        kc_init: hasKcValues ? variety.kc_init : cropKcPeriod.kc_init,
        kc_mid: hasKcValues ? variety.kc_mid : cropKcPeriod.kc_mid,
        kc_late: hasKcValues ? variety.kc_late : cropKcPeriod.kc_late,
        init: hasKcValues ? variety.init : cropKcPeriod.init,
        dev: hasKcValues ? variety.dev : cropKcPeriod.dev,
        mid: hasKcValues ? variety.mid : cropKcPeriod.mid,
        late: hasKcValues ? variety.late : cropKcPeriod.late,
      };
      setDefaultKcPeriod(kcData);

      setCropData((prev) => ({
        ...prev,
        variety: variety.id,
        ...kcData,
      }));
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
      setCropKcPeriod(kcs);
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
  console.log(isKcModified, "isKcModified");

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
      all_kc: resultCalculKc,

      is_kc_modified: isKcModified,
    };

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

  const onChangeHandler = async (e, idx) => {
    //modifier le setResultCalculKc pour ensuite ajouter le resultCalculKc dans l'action save pour inserer un objet clé (1,2,3..) valeur (kc dans le tableau html) dans la base de données colonne kc par jour
    // setResultCalculKc(state => ([...state ,{['day'] : day ,  ['kc'] : value }]), [])
    const value = e.target.value;
    const clone = [...cropData.allKcList];
    clone[idx] = { ...clone[idx], kc: value };

    setCropData((prev) => ({
      ...prev,
      allKcList: clone,
    }));

    setResultCalculKc(clone);
  };
  useEffect(() => {
    if (
      cropData.init &&
      cropData.dev &&
      cropData.mid &&
      cropData.late &&
      cropData.kc_init &&
      cropData.kc_mid &&
      cropData.kc_late
    ) {
      const { results } = tableConfigKc();
      setResultCalculKc(results);
      setCropData((prev) => ({
        ...prev,
        allKcList: results,
      }));
    }
  }, [
    cropData.init,
    cropData.dev,
    cropData.mid,
    cropData.late,
    cropData.kc_init,
    cropData.kc_mid,
    cropData.kc_late,
  ]);

  const tableConfigKc = () => {
    let elements = [];
    let results = [];

    const init = parseInt(cropData.init);
    const dev = parseInt(cropData.dev);
    const mid = parseInt(cropData.mid);
    const late = parseInt(cropData.late);

    const kcInit = parseFloat(cropData.kc_init);
    const kcMid = parseFloat(cropData.kc_mid);

    const kcLate = parseFloat(cropData.kc_late);

    let totalDays = 365;

    for (let day = 1; day <= totalDays; day++) {
      let kc = 0;

      if (day <= init) {
        kc = kcInit;
      } else if (day <= init + dev) {
        const j = day - init;
        kc = kcInit + ((kcMid - kcInit) / dev) * j;
      } else if (day <= init + dev + mid) {
        kc = kcMid;
      } else if (day <= init + dev + mid + late) {
        const j = day - (init + dev + mid);
        kc = kcMid - ((kcMid - kcLate) / late) * j;
      } else {
        kc = kcLate;
      }

      kc = parseFloat(kc.toFixed(2));
      results.push({ day, kc });

      elements.push(
        <tr key={day}>
          <td>{day}</td>

          <td>
            <input
              name={`kc-${day}`}
              value={kc}
              onChange={(e) => onChangeHandler(e, day - 1)}
              className="my-1"
            />
          </td>
        </tr>
      );
    }

    return { elements, results };
  };

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
            <Row>
              <Col lg="12" md="12" sm="12" className="mt-1">
                 {cropData.allKcList && cropData.allKcList.length > 0 && (<Line data={chartData} options={chartOptions} />)}
              </Col>
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
             <Row className="border-top mt-2">
                        {cropData.allKcList && cropData.allKcList.length > 0 && (
                          <Col lg="12" sm="12" md="12">
                            <table className="table mb-0 border text-center  table-responsive">
                              <thead className="bg-light">
                                <tr>
                                  <th scope="col" className="border-0">
                                    {t("Day")}
                                  </th>
            
                                  <th scope="col" className="border-0">
                                    {t("Kc")}
                                  </th>
                                </tr>
                              </thead>
            
                              {cropData.allKcList &&
                                cropData.allKcList.map((result, indx) => (
                                  <tr key={result.day}>
                                    <td>{result.day}</td>
            
                                    <td>
                                      <input
                                        name={`kc-${result.day}`}
                                        className="my-1"
                                        value={result.kc}
                                        onChange={(e) => onChangeHandler(e, indx)}
                                      />
                                    </td>
                                  </tr>
                                ))}
                            </table>
                          </Col>
                        )}
                      </Row>
          </Form>
        </Card>
      </Row>
    </Container>
  );
}
