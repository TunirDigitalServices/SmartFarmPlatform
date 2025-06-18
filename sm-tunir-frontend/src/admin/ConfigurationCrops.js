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
import moment from "moment";
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

const ConfigurationCrops = () => {
  const [cropsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const [SearchName, setSearchName] = useState("");

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const { t, i18n } = useTranslation();

  const [kcByDays, setKcByDays] = useState([]);

  const [plantDateErr, setPlantDateErr] = useState("");

  const [allCrops, setAllCrops] = useState([]);
  const [resultCalculKc, setResultCalculKc] = useState([]);

  const [cropData, setCropData] = useState({
    crop: "",
    crop_id: "",
    cropVariety: "",
    init: "",
    dev: "",
    mid: "",
    late: "",
    plantDate: "",
    rootMin: "",
    rootMax: "",
    kcInit: "",
    kcDev: "",
    kcMid: "",
    kcLate: "",
    allKcList: [],
    fractionRuPratique: "",
    cropAr: "",
    cropEn: "",
    cropPhoto: "",
    totalHours: "",
    minTemp: "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [fieldRows, setFieldRows] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadedFile, setUploadedFile] = useState({});
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

    const columns = [
    { field: "fieldId", headerName: "Field ID", width: 130 },
    { field: "name", headerName: t("Field Name"), flex: 1 },
    { field: "status", headerName: t("Status"), width: 160 },
  ];


  const [toggle, setToggle] = useState(false);
  const [toggleEdit, setToggleEdit] = useState(false);
  const [singleCrop, setSingleCrop] = useState({});

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

  useEffect(() => {
    getCrops();
  }, []);

  const getSingleCrop = (cropId, title) => {
    let data = {
      crop_id: cropId,
    };

    api
      .post("/crops/get-crop", data)
      .then((res) => {
        let dataCrops = res.data.crop;
        let date = dataCrops.plant_date;
        setSingleCrop(dataCrops);

        setCropData((prev) => ({
          ...prev,
          crop_id: dataCrops.crop_id,
          crop: dataCrops.crop,
          cropVariety: dataCrops.crop_variety,
          fractionRuPratique: dataCrops.practical_fraction,
          plantDate: date.slice(0, 10),
          init: dataCrops.init,
          dev: dataCrops.dev,
          mid: dataCrops.mid,
          late: dataCrops.late,
          rootMin: dataCrops.root_min,
          rootMax: dataCrops.root_max,
          minTemp: dataCrops.temperature,
          totalHours: dataCrops.hours,
          kcInit: dataCrops.kc_init,
          kcDev: dataCrops.kc_dev,
          kcMid: dataCrops.kc_mid,
          kcLate: dataCrops.kc_late,
          allKcList: dataCrops.all_kc,
        }));
      })
      .catch((error) => {
        console.log(error);
      });
    if (title === "Edit") {
      setToggleEdit(!toggleEdit);
    }
  };

  const onFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };
  const onFileUploadAdd = async () => {
    const formData = new FormData();
    formData.append("photo", selectedFile);
    formData.append("crop", cropData.crop);

    try {
      const res = await api.post("/crop/upload-photo", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setUploadedFile(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const onFileUploadEdit = async () => {
    const formData = new FormData();
    formData.append("photo", selectedFile);
    formData.append("crop", singleCrop.crop);

    try {
      const res = await api.post("/crop/upload-photo", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setUploadedFile(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const isValidate = () => {
    let plantDateErr = "";
    if (!cropData.plantDate) {
      plantDateErr = "Please select a date !";
      setPlantDateErr(plantDateErr);
    }
    if (plantDateErr) {
      setPlantDateErr(plantDateErr);
      return false;
    }
    return true;
  };

  const addCrops = () => {
    let isValid = isValidate();
    let data = {
      crop: cropData.crop,
      crop_variety: cropData.cropVariety,
      plant_date: cropData.plantDate,
      init: cropData.init,
      dev: cropData.dev,
      mid: cropData.mid,
      late: cropData.late,
      kc_init: cropData.kcInit,
      kc_dev: cropData.kcDev,
      kc_mid: cropData.kcMid,
      kc_late: cropData.kcLate,
      root_max: cropData.rootMax,
      root_min: cropData.rootMin,
      hours: cropData.totalHours,
      temperature: cropData.minTemp,
      all_kc: resultCalculKc,
      practical_fraction: cropData.fractionRuPratique,
      crop_ar: cropData.cropAr,
      crop_en: cropData.cropEn,
    };
    api
      .post("/crops/add-crops", data)
      .then((response) => {
        if (response && response.data.type === "success") {
          swal(`${t("Crop Added")}`, { icon: "success" });
          setToggle(false);
          getCrops();
        }
        if (response && response.data.type === "danger") {
          swal(`${t("Crop Added")}`, { icon: "error" });
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const handleEdit = (cropId) => {
    
    setIsSaving(true);

    let data = {
      crop_id: cropId,
      crop: cropData.crop,
      crop_variety: cropData.cropVariety,
      plant_date: cropData.plantDate,
      init: cropData.init,
      dev: cropData.dev,
      mid: cropData.mid,
      late: cropData.late,
      kc_init: cropData.kcInit,
      kc_dev: cropData.kcDev,
      kc_mid: cropData.kcMid,
      kc_late: cropData.kcLate,
      root_max: cropData.rootMax,
      root_min: cropData.rootMin,
      hours: cropData.totalHours,
      temperature: cropData.minTemp,
      all_kc: resultCalculKc,
      practical_fraction: cropData.fractionRuPratique,
    };

    api
      .post("/crops/edit-crop", data)
      .then((response) => {
        
        if (response.data.type == "success") {
       
   
             const recalculation = response.data.recalculation_message;
            
             
                      const successIds = recalculation.successfulFields || []; 
                      const failedIds = recalculation.failedFields || [];
                      console.log(successIds);
                      console.log(failedIds);
            
                      // Combine all IDs to fetch field names
                      const allIds = [...new Set([...successIds, ...failedIds])];
            
                      if (allIds.length === 0) {
                        swal("✅ Updated Crop\n\nNo fields needed recalculation.", {
                          icon: "success",
                        });
                        setToggleEdit(false);
                        getCrops();
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
                              : "⚠️ " + t("Deleted"),
                          }));
            
                          setFieldRows(rows);
                          setToggleEdit(false);
                          setOpenDialog(true);
                          getCrops();
                          setIsSaving(false);
                        })
                        .catch((err) => {
                          console.error("❌ Failed to fetch field names", err);
                          swal("✅ Crop updated, but failed to fetch field names.", {
                            icon: "warning",
                          });
                         
                     
                          setIsSaving(false);
                        
                    
        //   swal(" Crop has been updated", {
        //     icon: "success",
        //   });
          setToggleEdit(false);
          getCrops();
          });
        }
        if (response.data.type && response.data.type == "danger") {
        console.log(response.data.type,'type');

          swal({
            icon: "error",
            title: "Oops...",
            text: "error_edit_crop",
          });
          return false;
        }
      })
      .catch((error) => {
          console.error("Error editing crop:", error);
        swal({
          icon: "error",
          title: "Oops...",
          text: "error_edit_crop",
        });
      });
  };

  const handleDelete = async (cropId) => {
    let data = {
      crop_id: cropId,
    };
    await api
      .delete("/crops/delete-crop", { data: data })
      .then((response) => {
        if (response.data.type && response.data.type == "danger") {
          swal({
            title: "Cannot Delete Crop",
            icon: "warning",
          });
        }
        if (response.data.type == "success") {
          getCrops();
        }
      })
      .catch((error) => {
          console.error("Error editing crop:", error);
        swal({
          title: "Cannot Delete Crop",
          icon: "error",
          text: "error_delete_crop",
        });
        setIsSaving(false);

      });
  };

  const confirmDelete = (cropId) => {
    swal({
      title: "Are you sure?",
      text: "Once deleted, you will not be able to recover this crop!",
      icon: "warning",
      buttons: true,
      dangerMode: true,
    })
      .then((Delete) => {
        if (Delete) {
          handleDelete(cropId);
          swal(" Crop has been deleted!", {
            icon: "success",
          });
        }
      })
      .catch((error) => {
        swal({
          title: "Cannot Delete Crop",
          icon: "error",
          text: "error_delete_crop",
        });
      });
  };

  const filteredCrops = allCrops.filter((crops) => {
    if (SearchName !== "") {
      return crops.crop.toLowerCase().includes(SearchName.toLowerCase());
    }

    return crops;
  });

  const indexOfLastPost = currentPage * cropsPerPage;
  const indexOfFirstPost = indexOfLastPost - cropsPerPage;
  const currentCrops = filteredCrops.slice(indexOfFirstPost, indexOfLastPost);



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
        cropData.kcInit &&
        cropData.kcMid &&
        cropData.kcLate
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
      cropData.kcInit,
      cropData.kcMid,
      cropData.kcLate,
    ]);
  const tableConfigKc = (async) => {
   
    let elements = [];
    let results = [];
    const init = parseInt(cropData.init);
    const dev = parseInt(cropData.dev);
    const mid = parseInt(cropData.mid);
    const late = parseInt(cropData.late);

    const kcInit = parseFloat(cropData.kcInit);
    const kcMid = parseFloat(cropData.kcMid);

    const kcLate = parseFloat(cropData.kcLate);

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
    <>
      <Container className="p-4">
        <Row noGutters className="page-header py-4">
          <PageTitle
            sm="4"
            title={t("Crops Configuration")}
            subtitle={t("Crops Configuration")}
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
                setToggle(true);
              }}
            >
              Add Crop
            </Button>
          </ButtonGroup>
        </Row>
        <Card>
          <Card.Header className="border-bottom">
            <div>
              <h5>Crops Info</h5>
            </div>
          </Card.Header>
          <Card.Body>
            <table className="table mb-0 text-center">
              <thead className="bg-light">
                <tr>
                  <th scope="col" className="border-0">
                    {t("Crop")}
                  </th>
                  <th scope="col" className="border-0">
                    {t("Planting Date")}
                  </th>
                  <th scope="col" className="border-0"></th>
                </tr>
              </thead>
              <tbody>
                {currentCrops.map((crop) => {
                  let plantDate = moment(crop.plant_date)
                    .locale("En")
                    .format("MMM Do YYYY ");
                  return (
                    <tr>
                      <td>{crop.crop}</td>
                      <td>{plantDate}</td>

                      <td>
                        <ButtonGroup size="sm" className="mr-2">
                          <Button
                            title="Edit"
                            onClick={() => {
                              getSingleCrop(crop.id, "Edit");
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
            totalUsers={allCrops.length}
            paginate={paginate}
          />
        </Row>
      </Container>
      <Modal
        size="lg"
        centered={true}
        show={toggle}
        className="custom-modal-height"
      >
        <Modal.Header className="d-flex justify-content-between align-items-center">
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              width: "100%",
              gap: "10px",
            }}
          >
            <Button
              // theme="success"
              onClick={() => {
                addCrops();
              }}
              className="mb-2 mr-1 btn btn-success"
            >
              <i class={`fa fa-check mx-2`}></i>
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
                      <Form.Control
                        id="crop"
                        placeholder="Crop Type"
                        value={cropData.crop}
                        onChange={(e) =>
                          setCropData({ ...cropData, crop: e.target.value })
                        }
                      />
                    </Form.Group>
                  </Col>
                  <Col lg="5" md="12" sm="12">
                    <Form.Group>
                      <label htmlFor="crop">Crop Type (Ar)</label>
                      <Form.Control
                        id="crop"
                        placeholder="Crop Type"
                        value={cropData.cropAr}
                        onChange={(e) =>
                          setCropData({ ...cropData, cropAr: e.target.value })
                        }
                      />
                    </Form.Group>
                  </Col>
                  <Col lg="5" md="12" sm="12">
                    <Form.Group>
                      <label htmlFor="crop">Crop Type (En)</label>
                      <Form.Control
                        id="crop"
                        placeholder="Crop Type"
                        value={cropData.cropEn}
                        onChange={(e) =>
                          setCropData({ ...cropData, cropEn: e.target.value })
                        }
                      />
                    </Form.Group>
                  </Col>
                  {/* <Col lg='6' md="12" sm="12">
                                        <Form.Group>
                                            <label htmlFor="crop">Crop Photo</label>
                                            <Form.Control
                                                id='crop'
                                                type="file"
                                                placeholder="Crop Photo"
                                                // value={cropData.cropPhoto}
                                                onChange={onFileChange}
                                            />
                                            <button style={{background :"#E5E5E5" , border:"2px solid #d7d7d7",borderRadius:5,padding:3,margin:3}} onClick={onFileUpload}>Upload</button>
                                        </Form.Group>
                                    </Col>            */}
                  <Col lg="5" md="12" sm="12">
                    <Form.Group>
                      <label htmlFor="plantDate">Planting Date</label>
                      <Form.Control
                        id="plantDate"
                        placeholder="Planting Date"
                        type="date"
                        className={`form-control form-control-md ${
                          plantDateErr ? "is-invalid" : ""
                        }`}
                        value={cropData.plantDate}
                        onChange={(e) =>
                          setCropData({
                            ...cropData,
                            plantDate: e.target.value,
                          })
                        }
                      />
                      <div className="invalid-feedback">{plantDateErr}</div>
                    </Form.Group>
                  </Col>
                  <Col lg="5" md="12" sm="12">
                    <Form.Group className="d-flex justify-content-center align-items-center flex-column">
                      <label htmlFor="Practical Fraction Ru">
                        Practical Fraction Ru
                      </label>
                      <Form.Control
                        id="Practical Fraction Ru"
                        placeholder="Practical Fraction Ru"
                        value={cropData.fractionRuPratique}
                        onChange={(e) => {
                          setCropData({
                            ...cropData,
                            fractionRuPratique: e.target.value,
                          });
                        }}
                      />
                    </Form.Group>
                  </Col>
                  <Col lg="5" md="12" sm="12">
                    <Form.Group className="d-flex justify-content-center align-items-center flex-column">
                      <label htmlFor="_hours">{t("Temp.")}</label>
                      <Form.Control
                        id="_hours"
                        placeholder={t("Temp.")}
                        value={cropData.minTemp}
                        onChange={(e) => {
                          setCropData({ ...cropData, minTemp: e.target.value });
                        }}
                        type="number"
                      />
                    </Form.Group>
                  </Col>
                  <Col lg="5" md="12" sm="12">
                    <Form.Group className="d-flex justify-content-center align-items-center flex-column">
                      <label htmlFor="_hours">Number of hours</label>
                      <Form.Control
                        id="_hours"
                        placeholder="Number of hours of cold"
                        value={cropData.totalHours}
                        onChange={(e) => {
                          setCropData({
                            ...cropData,
                            totalHours: e.target.value,
                          });
                        }}
                        type="number"
                      />
                    </Form.Group>
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
                  value={cropData.kcInit}
                  onChange={(e) =>
                    setCropData({ ...cropData, kcInit: e.target.value })
                  }
                />
           
                <Form.Control
                  placeholder=""
                  className="m-1"
                  value={cropData.kcMid}
                  onChange={(e) =>
                    setCropData({ ...cropData, kcMid: e.target.value })
                  }
                />
                <Form.Control
                  placeholder=""
                  value={cropData.kcLate}
                  onChange={(e) =>
                    setCropData({ ...cropData, kcLate: e.target.value })
                  }
                />
              </div>
              <h6>Stage (Days)</h6>
              <div className="d-flex justify-content-around align-items-center">
                <Form.Control
                  placeholder="Init"
                  className="m-1"
                  value={cropData.init}
                  onChange={(e) =>
                    setCropData({ ...cropData, init: e.target.value })
                  }
                />
                <Form.Control
                  placeholder="Dev"
                  value={cropData.dev}
                  onChange={(e) =>
                    setCropData({ ...cropData, dev: e.target.value })
                  }
                />
                <Form.Control
                  placeholder="Mid"
                  className="m-1"
                  value={cropData.mid}
                  onChange={(e) =>
                    setCropData({ ...cropData, mid: e.target.value })
                  }
                />
                <Form.Control
                  placeholder="Late"
                  value={cropData.late}
                  onChange={(e) =>
                    setCropData({ ...cropData, late: e.target.value })
                  }
                />
              </div>
              <h6>Roots</h6>
              <div className="d-flex justify-content-around align-items-center">
                <Form.Control
                  placeholder="Min"
                  className="m-1"
                  value={cropData.rootMin}
                  onChange={(e) =>
                    setCropData({ ...cropData, rootMin: e.target.value })
                  }
                />
                <Form.Control
                  placeholder="Max"
                  value={cropData.rootMax}
                  onChange={(e) =>
                    setCropData({ ...cropData, rootMax: e.target.value })
                  }
                />
              </div>
            </Col>
          </Row>
           <Row>
                      {cropData.allKcList && cropData.allKcList.length > 0 && (
                        <Col lg="12" md="12" sm="12" className="mt-1">
                          <Line data={chartData} options={chartOptions} />
                        </Col>
                      )}
                    </Row>
          <Row className="border-top mt-2">
             {cropData.allKcList && cropData.allKcList.length > 0 &&(
            <Col lg="12" md="12" sm="12" className="mt-1">
              {/* <button onClick={() => tableConfigKc()}>Calculer</button> */}
              <table className="table mb-0 border text-center">
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
            </Col>)}
          </Row>
        </Modal.Body>
      </Modal>
      <Modal
        size="lg"
        centered={true}
        show={toggleEdit}
        className="custom-modal-height"
      >
        <Modal.Header className="d-flex justify-content-between align-items-center">
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              width: "100%",
              gap: "10px",
            }}
          >
            <Button
              // theme="success"
              onClick={() => {
                handleEdit(singleCrop.id);
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
                setToggleEdit(false);
              }}
            >
              <i class={`fa fa-times mx-2`}></i>
              {t("cancel")}
            </Button>
          </div>
        </Modal.Header>
        <Modal.Body>
          <Row className="">
            <Col lg="12" md="12" sm="12">
              <Card.Body>
                <Row className="gap-3">
                  <Col lg="4" md="12" sm="12">
                    <Form.Group>
                      <label htmlFor="crop">Crop Type</label>
                      <Form.Control
                        id="crop"
                        placeholder="Crop Type"
                        value={cropData.crop}
                        onChange={(e) =>
                          setCropData({ ...cropData, crop: e.target.value })
                        }
                      />
                    </Form.Group>
                  </Col>
                  <Col lg="4" md="12" sm="12">
                    <Form.Group>
                      <label htmlFor="crop">Crop Type (Ar)</label>
                      <Form.Control
                        id="crop"
                        placeholder="Crop Type"
                        value={cropData.cropAr}
                        onChange={(e) =>
                          setCropData({ ...cropData, cropAr: e.target.value })
                        }
                      />
                    </Form.Group>
                  </Col>
                  <Col lg="3" md="12" sm="12">
                    <Form.Group>
                      <label htmlFor="crop">Crop Type (En)</label>
                      <Form.Control
                        id="crop"
                        placeholder="Crop Type"
                        value={cropData.cropEn}
                        onChange={(e) =>
                          setCropData({ ...cropData, cropEn: e.target.value })
                        }
                      />
                    </Form.Group>
                  </Col>
                  <Col lg="5" md="12" sm="12">
                    <Form.Group>
                      <label htmlFor="crop">Crop Photo</label>
                      <div className="d-flex">
                        <Form.Control
                          id="crop"
                          type="file"
                          placeholder="Crop Photo"
                          // value={cropData.cropPhoto}
                          onChange={onFileChange}
                        />
                        <button
                          style={{
                            background: "#E5E5E5",
                            border: "2px solid #d7d7d7",
                            borderRadius: 5,
                            padding: 3,
                            margin: 3,
                          }}
                          onClick={onFileUploadEdit}
                        >
                          Upload
                        </button>
                      </div>
                      {uploadedFile ? (
                        <h6 style={{ fontWeight: "bold" }}>
                          {uploadedFile.message}
                        </h6>
                      ) : null}
                    </Form.Group>
                  </Col>
                  <Col lg="3" md="12" sm="12">
                    <Form.Group>
                      <label htmlFor="plantDate">Planting Date</label>
                      <Form.Control
                        id="plantDate"
                        placeholder="Planting Date"
                        type="date"
                        className={`form-control form-control-md ${
                          plantDateErr ? "is-invalid" : ""
                        }`}
                        value={cropData.plantDate}
                        onChange={(e) =>
                          setCropData({
                            ...cropData,
                            plantDate: e.target.value,
                          })
                        }
                      />
                      <div className="invalid-feedback">{plantDateErr}</div>
                    </Form.Group>
                  </Col>
                  <Col lg="3" md="12" sm="12">
                    <Form.Group className="d-flex justify-content-center  flex-column">
                      <label htmlFor="Practical Fraction Ru">
                        Practical Fraction Ru
                      </label>
                      <Form.Control
                        id="Practical Fraction Ru"
                        placeholder="Practical Fraction Ru"
                        value={cropData.fractionRuPratique}
                        onChange={(e) => {
                          setCropData({
                            ...cropData,
                            fractionRuPratique: e.target.value,
                          });
                        }}
                      />
                    </Form.Group>
                  </Col>
                  <Col lg="4" md="12" sm="12">
                    <Form.Group className="d-flex justify-content-center flex-column">
                      <label htmlFor="_hours">{t("Temp.")}</label>
                      <Form.Control
                        id="_hours"
                        placeholder={t("Temp.")}
                        value={cropData.minTemp}
                        onChange={(e) => {
                          setCropData({ ...cropData, minTemp: e.target.value });
                        }}
                        type="number"
                      />
                    </Form.Group>
                  </Col>
                  <Col lg="4" md="12" sm="12">
                    <Form.Group className="d-flex justify-content-center  flex-column">
                      <label htmlFor="_hours">Number of hours of cold</label>
                      <Form.Control
                        id="_hours"
                        placeholder="Number of hours of cold"
                        value={cropData.totalHours}
                        onChange={(e) => {
                          setCropData({
                            ...cropData,
                            totalHours: e.target.value,
                          });
                        }}
                        type="number"
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </Card.Body>
            </Col>

            <Col lg="12" md="12" sm="12" className="mt-4">
              <h6>Roots</h6>
              <div className="d-flex justify-content-around align-items-center">
                <Form.Control
                  placeholder="Min"
                  className="m-1"
                  value={cropData.rootMin}
                  onChange={(e) =>
                    setCropData({ ...cropData, rootMin: e.target.value })
                  }
                />
                <Form.Control
                  placeholder="Max"
                  value={cropData.rootMax}
                  onChange={(e) =>
                    setCropData({ ...cropData, rootMax: e.target.value })
                  }
                />
              </div>
              <h6 className="mt-2">Kc</h6>
              <div className="d-flex justify-content-center align-items-center">
                <Form.Control
                  placeholder=""
                  className="m-1"
                  value={cropData.kcInit}
                  onChange={(e) =>
                    setCropData({ ...cropData, kcInit: e.target.value })
                  }
                />

                <Form.Control
                  placeholder=""
                  className="m-1"
                  value={cropData.kcMid}
                  onChange={(e) =>
                    setCropData({ ...cropData, kcMid: e.target.value })
                  }
                />
                <Form.Control
                  placeholder=""
                  value={cropData.kcLate}
                  className="px-2"
                  onChange={(e) =>
                    setCropData({ ...cropData, kcLate: e.target.value })
                  }
                />
              </div>
              <h6 className="mt-2">Stage (Days)</h6>
              <div className="d-flex justify-content-around align-items-center">
                <Form.Control
                  placeholder="Init"
                  className="m-1"
                  value={cropData.init}
                  onChange={(e) =>
                    setCropData({ ...cropData, init: e.target.value })
                  }
                />
                <Form.Control
                  placeholder="Dev"
                  value={cropData.dev}
                  onChange={(e) =>
                    setCropData({ ...cropData, dev: e.target.value })
                  }
                />
                <Form.Control
                  placeholder="Mid"
                  className="m-1"
                  value={cropData.mid}
                  onChange={(e) =>
                    setCropData({ ...cropData, mid: e.target.value })
                  }
                />
                <Form.Control
                  placeholder="Late"
                  value={cropData.late}
                  onChange={(e) =>
                    setCropData({ ...cropData, late: e.target.value })
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
              <table className="table mb-0 border text-center">
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
                  {cropData.allKcList &&
                    cropData.allKcList.map((result, indx) => {
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

export default ConfigurationCrops;
