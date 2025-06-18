import React, { useEffect, useState } from "react";

import {
  Container,
  Card,
  Row,
  Col,
  Form,
  ButtonGroup,
  Button,
  Modal,
} from "react-bootstrap";
import PageTitle from "../components/common/PageTitle";
import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";
import {
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import api from "../api/api";
import swal from "sweetalert";
import Pagination from "../views/Pagination";
import { Line } from "react-chartjs-2";
import moment from "moment";

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

const ConfigurationCropsVariety = () => {
  const [cropsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [SearchName, setSearchName] = useState("");
  const [allCrops, setAllCrops] = useState([]);
  const [allVarieties, setAllVarieties] = useState([]);
  const [toggle, setToggle] = useState(false);
  const [toggleEdit, setToggleEdit] = useState(false);
  const [singleCrop, setSingleVariety] = useState({});
  const [resultCalculKc, setResultCalculKc] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [fieldRows, setFieldRows] = useState([]);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const { t } = useTranslation();
  const [varietyData, setVarietyData] = useState({
    crop: "",
    cropVariety: "",
    init: "",
    dev: "",
    mid: "",
    late: "",
    rootMin: "",
    rootMax: "",
    kcInit: "",

    kcMid: "",
    kcLate: "",
    allKcList: [],
    varietyAr: "",
    varietyEn: "",
    varietyPhoto: "",
  });

  const chartData = {
    labels: varietyData?.allKcList?.map((item) => `Day ${item.day}`),
    datasets: [
      {
        label: "Kc",
        data: varietyData?.allKcList?.map((item) => parseFloat(item.kc)),
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
  const columns = [
    { field: "fieldId", headerName: "Field ID", width: 130 },
    { field: "name", headerName: t("Field Name"), flex: 1 },
    { field: "status", headerName: t("Status"), width: 160 },
  ];

  const getCrops = async () => {
    try {
      await api
        .get("/crops/get-crops")
        .then((response) => {
          if (response.data.type === "success") {
            let listCrops = response.data.Crops;
            setAllCrops(listCrops);
          }
        })
        .catch((error) => {
          console.log(error);
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
            console.log(listVarieties, "listVarieties");

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

  useEffect(() => {
    getCrops();
    getVarieties();
  }, []);

  const getSingleVariety = (varietyId, title) => {
    let data = {
      variety_id: varietyId,
    };

    api
      .post("/varieties/get-variety", data)
      .then((res) => {
        let dataVarieties = res.data.variety;

        setSingleVariety(dataVarieties);

        setVarietyData({
          cropVariety: dataVarieties.crop_variety,

          init: dataVarieties.init,
          dev: dataVarieties.dev,
          mid: dataVarieties.mid,
          late: dataVarieties.late,
          rootMin: dataVarieties.root_min,
          rootMax: dataVarieties.root_max,
          kcInit: dataVarieties.kc_init,

          kcMid: dataVarieties.kc_mid,
          kcLate: dataVarieties.kc_late,
          allKcList: dataVarieties.all_kc,
          varietyAr: dataVarieties.variety_ar,
          varietyEn: dataVarieties.variety_en,
        });
        if (title === "Edit") {
          setToggleEdit(!toggleEdit);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const addVarieties = () => {
    let data = {
      crop_id: varietyData.crop,
      crop_variety: varietyData.cropVariety,
      init: varietyData.init,
      dev: varietyData.dev,
      mid: varietyData.mid,
      late: varietyData.late,
      kc_init: varietyData.kcInit,

      kc_mid: varietyData.kcMid,
      kc_late: varietyData.kcLate,
      root_max: varietyData.rootMax,
      root_min: varietyData.rootMin,
      all_kc: resultCalculKc,
    };
    console.log(data, "data for check pd");

    api
      .post("/varieties/add-varieties", data)
      .then((response) => {
        if (response && response.data.type === "success") {
          swal(`${t("Crop Variety Added")}`, { icon: "success" });
          setToggle(false);
          getVarieties();
        }
        if (response && response.data.type === "danger") {
          swal(`${t("Crop Variety Added")}`, { icon: "error" });
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const handleEdit = (varietyId) => {
    setIsSaving(true);
    let data = {
      variety_id: varietyId,
      crop_variety: varietyData.cropVariety,
      init: varietyData.init,
      dev: varietyData.dev,
      mid: varietyData.mid,
      late: varietyData.late,
      kc_init: varietyData.kcInit,

      kc_mid: varietyData.kcMid,
      kc_late: varietyData.kcLate,
      root_max: varietyData.rootMax,
      root_min: varietyData.rootMin,
      all_kc: resultCalculKc,
    };

    api
      .post("/varieties/edit-variety", data)
      .then((response) => {
        if (response.data.type === "success") {
          const recalculation = response.data.recalculation_message;
          const successIds = recalculation.successfulFields || []; // [1, 2, 3]
          const failedIds = recalculation.failedFields || [];
          console.log(successIds);
          console.log(failedIds);

          // Combine all IDs to fetch field names
          const allIds = [...new Set([...successIds, ...failedIds])];

          if (allIds.length === 0) {
            swal("✅ Updated Variety\n\nNo fields needed recalculation.", {
              icon: "success",
            });
            setToggleEdit(false);
            getVarieties();
            setIsSaving(false);
            return;
          }

          // Fetch names from your new API
          api
            .post("/fields/by-ids", { fieldIds: allIds })
            .then((fieldsRes) => {
              const fieldMap = {};

              if (
                fieldsRes.data &&
                fieldsRes.data.type === "success" &&
                Array.isArray(fieldsRes.data.fields)
              ) {
                fieldsRes.data.fields.forEach((field) => {
                  fieldMap[field.id] = field.name || `Field ${field.id}`;
                });
              }
              // Extract only visible (i.e., returned) field IDs
              const visibleIds = Object.keys(fieldMap).map((id) =>
                parseInt(id)
              );

              // Filter visible success/failure
              const visibleSuccess = successIds.filter((id) =>
                visibleIds.includes(id)
              );
              const visibleFailed = failedIds.filter((id) =>
                visibleIds.includes(id)
              );

              const skippedIds = allIds.filter(
                (id) => !visibleIds.includes(id)
              );

              const rows = [
                ...visibleSuccess,
                ...visibleFailed,
                ...skippedIds,
              ].map((id, index) => ({
                id: index + 1,
                fieldId: id,
                name: fieldMap[id] || `ID: ${id}`,
                status: visibleSuccess.includes(id)
                  ? "✅ " + t("Success")
                  : visibleFailed.includes(id)
                  ? "❌ " + t("Error")
                  : "⚠️ " + t("Skipped"),
              }));

             
              setFieldRows(rows);
              setToggleEdit(false);
                setOpenDialog(true);
              getVarieties();
              setIsSaving(false);
            })
            .catch((err) => {
              console.error("❌ Failed to fetch field names", err);
              swal("✅ Variety updated, but failed to fetch field names.", {
                icon: "warning",
              });
              setToggleEdit(false);
              getVarieties();
              setIsSaving(false);
            });
        }
        if (response.data.type && response.data.type == "danger") {
          swal({
            icon: "error",
            title: "Oops...",
            text: "error_edit_variety",
          });
          return false;
        }
      })
      .catch((error) => {
        swal({
          icon: "error",
          title: "Oops...",
          text: "error_edit_variety",
        });
        setIsSaving(false);
      });
  };

  const handleDelete = async (varietyId) => {
    let data = {
      variety_id: varietyId,
    };
    await api
      .delete("/varieties/delete-variety", { data: data })
      .then((response) => {
        if (response.data.type && response.data.type == "danger") {
          swal({
            title: "Cannot Delete Variety",
            icon: "warning",
          });
        }
        if (response.data.type == "success") {
          getVarieties();
        }
      })
      .catch((error) => {
        swal({
          title: "Cannot Delete Variety",
          icon: "error",
          text: "error_delete_variety",
        });
      });
  };

  const confirmDelete = (cropId) => {
    swal({
      title: "Are you sure?",
      text: "Once deleted, you will not be able to recover this variety!",
      icon: "warning",
      buttons: true,
      dangerMode: true,
    })
      .then((Delete) => {
        if (Delete) {
          handleDelete(cropId);
          swal(" Variety has been deleted!", {
            icon: "success",
          });
        }
      })
      .catch((error) => {
        swal({
          title: "Cannot Delete Variety",
          icon: "error",
          text: "error_delete_variety",
        });
      });
  };

  const filteredCrops = allVarieties.filter((cropsVariety) => {
    if (SearchName !== "") {
      return cropsVariety.crop_variety
        .toLowerCase()
        .includes(SearchName.toLowerCase());
    }

    return cropsVariety;
  });

  const indexOfLastPost = currentPage * cropsPerPage;
  const indexOfFirstPost = indexOfLastPost - cropsPerPage;
  const sortedVarieties = [...filteredCrops].sort((a, b) => {
    const cropA =
      allCrops.find((crop) => crop.id === a.crop_id)?.crop?.toLowerCase() || "";
    const cropB =
      allCrops.find((crop) => crop.id === b.crop_id)?.crop?.toLowerCase() || "";
    return cropA.localeCompare(cropB);
  });

  const currentVarieties = sortedVarieties.slice(
    indexOfFirstPost,
    indexOfLastPost
  );

  const onChangeHandler = async (e, idx) => {
    //modifier le setResultCalculKc pour ensuite ajouter le resultCalculKc dans l'action save pour inserer un objet clé (1,2,3..) valeur (kc dans le tableau html) dans la base de données colonne kc par jour
    // setResultCalculKc(state => ([...state ,{['day'] : day ,  ['kc'] : value }]), [])
    const value = e.target.value;
    const clone = [...varietyData.allKcList];
    clone[idx] = { ...clone[idx], kc: value };

    setVarietyData((prev) => ({
      ...prev,
      allKcList: clone,
    }));

    setResultCalculKc(clone);
  };

  useEffect(() => {
    if (
      varietyData.init &&
      varietyData.dev &&
      varietyData.mid &&
      varietyData.late &&
      varietyData.kcInit &&
      varietyData.kcMid &&
      varietyData.kcLate
    ) {
      const { results } = tableConfigKc();
      setResultCalculKc(results);
      setVarietyData((prev) => ({
        ...prev,
        allKcList: results,
      }));
    }
  }, [
    varietyData.init,
    varietyData.dev,
    varietyData.mid,
    varietyData.late,
    varietyData.kcInit,
    varietyData.kcMid,
    varietyData.kcLate,
  ]);

  const tableConfigKc = () => {
    let elements = [];
    let results = [];

    const init = parseInt(varietyData.init);
    const dev = parseInt(varietyData.dev);
    const mid = parseInt(varietyData.mid);
    const late = parseInt(varietyData.late);

    const kcInit = parseFloat(varietyData.kcInit);
    const kcMid = parseFloat(varietyData.kcMid);

    const kcLate = parseFloat(varietyData.kcLate);

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
          {/* <td>{date}</td> */}
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

  useEffect(() => {
    setCurrentPage(1);
  }, [SearchName]);

  return (
    <>
      <Container className="p-4">
        <Row noGutters className="page-header py-4">
          <PageTitle
            sm="4"
            title={t("Crops Varieties Configuration")}
            subtitle={t("Crops Varieties Configuration")}
            className="text-sm-left"
          />
        </Row>
        <Row>
          <PageTitle sm="4" subtitle={t("search")} className="text-sm-left" />
        </Row>
        <Row form className="d-flex justify-content-center">
          <Col md="3" className="form-group">
            <Form.Group>
              <div className="d-flex">
                <Form.Control
                  value={SearchName}
                  onChange={(e) => setSearchName(e.target.value)}
                  id="search"
                  placeholder="Search By Name "
                />
              </div>
            </Form.Group>
          </Col>
        </Row>
        <Row>
          <PageTitle
            sm="4"
            subtitle={t("my actions")}
            className="text-sm-left"
          />
        </Row>
        <Row form className="py-2 d-flex justify-content-center">
          <ButtonGroup>
            <Button
              variant="outline-primary"
              onClick={() => {
                setVarietyData({
                  crop: "",
                  cropVariety: "",
                  varietyAr: "",
                  varietyEn: "",
                  kcInit: "",
                  kcMid: "",
                  kcLate: "",
                  init: "",
                  dev: "",
                  mid: "",
                  late: "",
                  rootMin: "",
                  rootMax: "",
                  allKcList: [],
                });
                setToggle(true);
              }}
            >
              Add Variety
            </Button>
          </ButtonGroup>
        </Row>
        <Card>
          <Card.Header className="border-bottom">
            <div>
              <h5>Crops Varieties Info</h5>
            </div>
          </Card.Header>
          <Card.Body>
            <table className="table mb-0 text-center  table-responsive-lg">
              <thead className="bg-light">
                <tr>
                  <th scope="col" className="border-0">
                    {t("Crop")}
                  </th>
                  <th scope="col" className="border-0">
                    {t("Crop Variety")}
                  </th>
                  <th scope="col" className="border-0"></th>
                </tr>
              </thead>
              <tbody>
                {console.log(currentVarieties, "cur")}
                {currentVarieties.map((crop) => {
                  let cropName = "";
                  allCrops.map((crops) => {
                    if (crop.crop_id === crops.id) {
                      cropName = crops.crop;
                    }
                  });

                  return (
                    <tr>
                      <td>{cropName}</td>
                      <td>{crop.crop_variety}</td>
                      <td>
                        <ButtonGroup size="sm" className="mr-2">
                          <Button
                            title="Edit"
                            onClick={() => {
                              getSingleVariety(crop.id, "Edit");
                            }}
                            squared
                          >
                            <i className="material-icons">&#xe3c9;</i>
                          </Button>
                          <Button
                            title="Delete"
                            onClick={() => {
                              confirmDelete(crop.id);
                            }}
                            squared
                            variant="danger"
                          >
                            <i className="material-icons">&#xe872;</i>
                          </Button>
                        </ButtonGroup>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Card.Body>
        </Card>
        <Row className="py-4 justify-content-center">
          <Pagination
            usersPerPage={cropsPerPage}
            totalUsers={filteredCrops.length}
            paginate={paginate}
          />
        </Row>
      </Container>
      <Modal
        size="lg"
        className="custom-modal-height"
        centered={true}
        show={toggle}
      >
        <Modal.Header className="d-flex justify-content-between align-items-center">
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "10px",
              width: "100%",
            }}
          >
            <Button
              // theme="success"
              onClick={() => {
                addVarieties();
              }}
              className="mb-2 mr-1 btn btn-success"
            >
              <i class={`fa fa-check mx-2`}></i>
              {t("save")}
            </Button>
            <Button
              // theme="success"
              className="mb-2 mr-1 btn btn-danger"
              onClick={() => {
                setToggle(false);
              }}
            >
              <i class={`fa fa-times mx-2`}></i>
              {t("cancel")}
            </Button>
          </div>
        </Modal.Header>
        <Modal.Body>
          <Row className="gap-2">
            <Col lg="7" md="12" sm="12" className="border-right">
              <Card.Body>
                <Row className="gap-2">
                  <Col lg="5" md="12" sm="12">
                    <Form.Group>
                      <label htmlFor="crop">Crop Type</label>
                      <Form.Select
                        id="crop"
                        placeholder="Crop Type"
                        value={varietyData.crop || ""}
                        onChange={(e) =>
                          setVarietyData({
                            ...varietyData,
                            crop: e.target.value,
                          })
                        }
                      >
                        <option value="">Select Crop</option>
                        {allCrops.map((crop) => {
                          return <option value={crop.id}>{crop.crop}</option>;
                        })}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col lg="5" md="12" sm="12">
                    <Form.Group className="d-flex justify-content-center  flex-column">
                      <label htmlFor="type">Variety Type</label>

                      <Form.Control
                        id="type"
                        style={{ height: "40px" }}
                        value={varietyData.cropVariety}
                        onChange={(e) =>
                          setVarietyData({
                            ...varietyData,
                            cropVariety: e.target.value,
                          })
                        }
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <h6 className="mt-2">Roots</h6>
                <Row className="gap-2">
                  <Col lg="5" md="12" sm="12">
                    <div className="d-flex justify-content-around align-items-center">
                      <Form.Control
                        placeholder="Min"
                        value={varietyData.rootMin}
                        onChange={(e) =>
                          setVarietyData({
                            ...varietyData,
                            rootMin: e.target.value,
                          })
                        }
                      />
                    </div>
                  </Col>
                  <Col lg="5" md="12" sm="12">
                    <div className="d-flex justify-content-around align-items-center">
                      <Form.Control
                        placeholder="Max"
                        value={varietyData.rootMax}
                        onChange={(e) =>
                          setVarietyData({
                            ...varietyData,
                            rootMax: e.target.value,
                          })
                        }
                      />
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Col>

            <Col lg="4" md="12" sm="12" className="">
              <h6>Kc</h6>
              <div className="d-flex justify-content-center align-items-center">
                <Form.Control
                  placeholder=""
                  className="m-1"
                  value={varietyData.kcInit}
                  onChange={(e) =>
                    setVarietyData({ ...varietyData, kcInit: e.target.value })
                  }
                />

                <Form.Control
                  placeholder=""
                  className="m-1"
                  value={varietyData.kcMid}
                  onChange={(e) =>
                    setVarietyData({ ...varietyData, kcMid: e.target.value })
                  }
                />
                <Form.Control
                  placeholder=""
                  value={varietyData.kcLate}
                  onChange={(e) =>
                    setVarietyData({ ...varietyData, kcLate: e.target.value })
                  }
                />
              </div>
              <h6>Stage (Days)</h6>
              <div className="d-flex justify-content-around align-items-center">
                <Form.Control
                  placeholder="Init"
                  className="m-1"
                  value={varietyData.init}
                  onChange={(e) =>
                    setVarietyData({ ...varietyData, init: e.target.value })
                  }
                />
                <Form.Control
                  placeholder="Dev"
                  value={varietyData.dev}
                  onChange={(e) =>
                    setVarietyData({ ...varietyData, dev: e.target.value })
                  }
                />
                <Form.Control
                  placeholder="Mid"
                  className="m-1"
                  value={varietyData.mid}
                  onChange={(e) =>
                    setVarietyData({ ...varietyData, mid: e.target.value })
                  }
                />
                <Form.Control
                  placeholder="Late"
                  value={varietyData.late}
                  onChange={(e) =>
                    setVarietyData({ ...varietyData, late: e.target.value })
                  }
                />
              </div>
            </Col>
          </Row>
          <Row>
            {varietyData.allKcList && varietyData.allKcList.length > 0 && (
              <Col lg="12" md="12" sm="12" className="mt-1">
                <Line data={chartData} options={chartOptions} />
              </Col>
            )}
          </Row>
          <Row className="border-top mt-2">
            {varietyData.allKcList && varietyData.allKcList.length > 0 && (
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

                  {varietyData.allKcList &&
                    varietyData.allKcList.map((result, indx) => (
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
        </Modal.Body>
      </Modal>
      <Modal
        className="custom-modal-height"
        size="lg"
        centered={true}
        show={toggleEdit}
      >
        <Modal.Header className="d-flex justify-content-between align-items-center">
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "10px",
              width: "100%",
            }}
          >
            <Button
              // theme="success"
              onClick={() => {
                handleEdit(singleCrop.id);
              }}
              className="mb-2 mr-1 btn btn-success"
              disabled={isSaving}
            >
              {/* <i class={`fa fa-check mx-2`}></i> */}

              {isSaving ? (
                <>
                  <CircularProgress
                    size={20}
                    color="inherit"
                    style={{ marginRight: 8 }}
                  />
                  {t("Saving...")}
                </>
              ) : (
                t("save")
              )}
            </Button>
           
            <Button
              // theme="success"
              className="mb-2 mr-1 btn btn-danger"
              disabled={isSaving}

              onClick={() => {
                setToggleEdit(false);
              }}
            >
              <i class={`fa fa-times mx-2`}></i>
              {t("cancel")}
            </Button>
          </div>
        </Modal.Header>
        <Modal.Body>
          <Row className="gap-2">
            <Col lg="7" md="12" sm="12" className="border-right">
              <Card.Body>
                <Row className="gap-2">
                  <Row className="gap-2 mt-2 mb-2">
                    <Col lg="5" md="12" sm="12">
                      <Form.Group className="">
                        <label htmlFor="type" className="">
                          Variety Type
                        </label>

                        <Form.Control
                          id="type"
                          value={varietyData.cropVariety}
                          onChange={(e) =>
                            setVarietyData({
                              ...varietyData,
                              cropVariety: e.target.value,
                            })
                          }
                        />
                      </Form.Group>
                    </Col>
                    <Col lg="5" md="12" sm="12">
                      <Form.Group>
                        <label htmlFor="Varietyar">Variety Type (Ar)</label>
                        <Form.Control
                          id="Varietyar"
                          placeholder="Variety Type"
                          value={varietyData.varietyAr}
                          onChange={(e) =>
                            setVarietyData({
                              ...varietyData,
                              varietyAr: e.target.value,
                            })
                          }
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  <Row className="gap-2">
                    <Col lg="5" md="12" sm="12">
                      <Form.Group>
                        <label htmlFor="Varietyen">Variety Type (En)</label>
                        <Form.Control
                          id="Varietyen"
                          placeholder="Variety Type"
                          value={varietyData.varietyEn}
                          onChange={(e) =>
                            setVarietyData({
                              ...varietyData,
                              varietyEn: e.target.value,
                            })
                          }
                        />
                      </Form.Group>
                    </Col>

                    {/* <Col lg='5' md="12" sm="12"> */}
                    {/* <Form.Group>
                                            <label htmlFor="crop">Variety Photo</label>
                                            <Form.Control
                                                id='crop'
                                                type="file"
                                                placeholder="Crop Photo"
                                                // value={cropData.cropPhoto}
                                                onChange={onFileChange}
                                            />
                                            <button style={{ background: "#E5E5E5", border: "2px solid #d7d7d7", borderRadius: 5, padding: 3, margin: 3 }} onClick={onFileUploadEdit}>Upload</button>
                                            {uploadedFile ? <h6 style={{ fontWeight: "bold" }}>{uploadedFile.message}</h6> : null}

                                        </Form.Group> */}
                    {/* </Col> */}
                  </Row>
                </Row>

                {/* <Form.Group> */}
                {/* <label htmlFor="feDescription">{t('desc')}</label>
                                    <Form.Control
                                        as="textarea"
                                        placeholder={t('desc')}
                                        id="feDescription"
                                        rows="3" />

                                </Form.Group> */}
              </Card.Body>
            </Col>

            <Col lg="4" md="12" sm="12" className="">
              <h6>Kc</h6>
              <div className="d-flex justify-content-center align-items-center">
                <Form.Control
                  placeholder=""
                  className="m-1"
                  value={varietyData.kcInit}
                  onChange={(e) =>
                    setVarietyData({ ...varietyData, kcInit: e.target.value })
                  }
                />

                <Form.Control
                  placeholder=""
                  className="m-1"
                  value={varietyData.kcMid}
                  onChange={(e) =>
                    setVarietyData({ ...varietyData, kcMid: e.target.value })
                  }
                />
                <Form.Control
                  placeholder=""
                  value={varietyData.kcLate}
                  onChange={(e) =>
                    setVarietyData({ ...varietyData, kcLate: e.target.value })
                  }
                />
              </div>
              <h6>Stage (Days)</h6>
              <div className="d-flex justify-content-around align-items-center">
                <Form.Control
                  placeholder="Init"
                  className="m-1"
                  value={varietyData.init}
                  onChange={(e) =>
                    setVarietyData({ ...varietyData, init: e.target.value })
                  }
                />
                <Form.Control
                  placeholder="Dev"
                  value={varietyData.dev}
                  onChange={(e) =>
                    setVarietyData({ ...varietyData, dev: e.target.value })
                  }
                />
                <Form.Control
                  placeholder="Mid"
                  className="m-1"
                  value={varietyData.mid}
                  onChange={(e) =>
                    setVarietyData({ ...varietyData, mid: e.target.value })
                  }
                />
                <Form.Control
                  placeholder="Late"
                  value={varietyData.late}
                  onChange={(e) =>
                    setVarietyData({ ...varietyData, late: e.target.value })
                  }
                />
              </div>
              <h6>Roots</h6>
              <div className="d-flex justify-content-around align-items-center">
                <Form.Control
                  placeholder="Min"
                  className="m-1"
                  value={varietyData.rootMin}
                  onChange={(e) =>
                    setVarietyData({ ...varietyData, rootMin: e.target.value })
                  }
                />
                <Form.Control
                  placeholder="Max"
                  value={varietyData.rootMax}
                  onChange={(e) =>
                    setVarietyData({ ...varietyData, rootMax: e.target.value })
                  }
                />
              </div>
            </Col>
          </Row>
          <Row>
            <Col lg="12" md="12" sm="12" className="mt-1">
              <Line data={chartData} options={chartOptions} />
            </Col>
          </Row>
          <Row className="border-top mt-2">
            <Col lg="12" md="12" sm="12" className="mt-1">
              {/* <button onClick={() => tableConfigKc()}>Calculer</button> */}
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
                <tbody>
                  {varietyData.allKcList &&
                    varietyData.allKcList?.map((result, indx) => {
                      return (
                        <tr>
                          <td>{result.day}</td>

                          <td>
                            <input
                              name={indx}
                              key={indx}
                              className="my-1"
                              value={result.kc}
                              onChange={(e) => onChangeHandler(e, indx)}
                            />
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
              <div className="mt-4"></div>
            </Col>
          </Row>
        </Modal.Body>
      </Modal>
       <Dialog
              open={openDialog}
              onClose={() => setOpenDialog(false)}
              fullWidth
              maxWidth="md"
            >
              <DialogTitle>{t("Field Recalculation Report")}</DialogTitle>
              <DialogContent>
                <div style={{ height: 500, width: "100%" }}>
                  <DataGrid
                    rows={fieldRows}
                    columns={columns}
                    pageSize={5}
                    rowsPerPageOptions={[5, 10]}
                  />
                </div>
              </DialogContent>
            </Dialog>
    </>
  );
};

export default ConfigurationCropsVariety;
