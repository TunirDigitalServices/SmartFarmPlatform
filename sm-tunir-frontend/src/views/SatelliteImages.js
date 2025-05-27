import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form
} from "react-bootstrap";
import PageTitle from "../components/common/PageTitle";
import { useTranslation } from "react-i18next";
import LeafletMap from "./map";
import { Line } from "react-chartjs-2";
import SatteliteMap from "./SatteliteMap";
import moment from "moment";
import api from "../api/api";
import CircularProgress from "@mui/material/CircularProgress";
import { Box, LinearProgress } from "@mui/material";
import Button from "@mui/material/Button";
import SatelliteAltIcon from "@mui/icons-material/SatelliteAlt";
import ListAltIcon from "@mui/icons-material/ListAlt";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import ndvi from "../assets/images/NDVI.png";
import ndwi from "../assets/images/NDWI.png";
import moisture from "../assets/images/MOISTURE-INDEX.png";
import swir from "../assets/images/SWIR.png";
import terrain from "../assets/images/terrain.png";

const SatelliteImages = () => {
  const [coords, setCoords] = useState({
    Latitude: "",
    Longitude: "",
    zoom: "",
    center: [],
    fromAction: false
  });
  const [mapConfig, setMapConfig] = useState({
    zoom: "",
    center: [],
    fromAction: false,
    draw: {
      polygon: false,
      circle: false,
      rectangle: false,
      polyline: false,
      marker: false,
      circlemarker: false
    }
  });
  const [dates, setDates] = useState([]);
  const [fields, setFields] = useState([]);
  const [farms, setFarms] = useState([]);
  const [selectedField, setSelectedField] = useState([]);
  const [satellitesImages, setSatellitesImages] = useState([]);
  const [selectedImages, setSelectedImages] = useState([]);
  const [dataDisplayed, setDataDisplayed] = useState([]);
  const [polygonDisplayed, setPolygonDisplayed] = useState([]);
  const [loadingImages, setLoadingImages] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState(null);
  const [selectedDate, setSelectedDate] = useState(
    moment().format("D MMM YYYY")
  );
  const [selectedImageType, setSelectedImageType] = useState(null);

  const getSatelliteImages = async () => {
    try {
      setLoadingImages(true);
      const fieldId = selectedField[0].Id;
      let userUid = JSON.parse(localStorage.getItem("user")).id;
      let coordinates = JSON.parse(selectedField[0].coordinates).map(elem => {
        return [elem.Long, elem.Lat];
      });

      const apiUrl = `/add-satellite-images/${userUid}/${fieldId}`;
      const response = await api.post(apiUrl, {
        date: formatDate(selectedDate),
        coordinates
      });



      setSatellitesImages(response.data.images);
      setLoadingImages(false);
    } catch (error) {
      console.error("API error:", error);
      setLoadingImages(false);
    }
  };


  useEffect(() => {
    const getDataFields = async () => {
      await api.get("/field/fields").then(res => {
        const newData = res.data.farms;
        setFarms(newData);
        let Fields = [];
        newData.map(item => {
          let fields = item.fields;
          if (fields) {
            fields.map(itemfield => {
              Fields.push({
                title: itemfield.name,
                status: itemfield.status,
                description: itemfield.description,
                Uid: itemfield.uid,
                farm_id: itemfield.farm_id,
                Latitude: itemfield.Latitude,
                Longitude: itemfield.Longitude,
                coordinates: itemfield.coordinates,
                Id: itemfield.id
              });
            });
          }
        });
        setFields(Fields);
      });
    };
    getDataFields();
  }, []);

  useEffect(() => {
    if (selectedField.length > 0) {
      getSatelliteImages();
    }
  }, [selectedField, selectedDate]);

  const { t, i18n } = useTranslation();



  const formatDate = dateString => {
    // Parse the input date string using Moment.js
    const parsedDate = moment(dateString, "D MMM YYYY");

    // Format the date in the desired format (YYYY-MM-DD)
    const formattedDate = parsedDate.format("YYYY-MM-DD");

    return formattedDate;
  };

  const handleDateClick = async date => {
    setSelectedDate(date);
    const formattedDate = formatDate(date);

  };
  const getSelectedField = e => {
    const selectedId = e.target.value;
    const selected = fields && fields.filter(field => field.Id == selectedId);
    setSelectedField(selected);
  };

  useEffect(() => {
    setSelectedImages(satellitesImages);
  }, [selectedDate, selectedField, satellitesImages]);

  const handleClick = image => {
    if (image) {
      const imageUrl = `${process.env.REACT_APP_BASE_URL}${image.image_url}`; // Prepend the backend URL
      setSelectedImageUrl(imageUrl); // Save the full image URL with localhost
      setDataDisplayed(image.data || []); // Save data for the selected image (e.g., coordinates or metadata)
      setPolygonDisplayed(image.polygon || []); // Save polygon data if applicable
      setSelectedImageType(image.type);
      

    }
  };
  const designationImageMap = {
    ndvi: "densité de végétation",
    ndwi: "Irrigation index",
    moisture: "humidité",
    swir: "stress hydrique"
  };
  const typeIcons = {
    ndvi,
    ndwi,
    moisture,
    swir
  };
 

  const renderImageGallery = () => {
    if (loadingImages) {
      return (
        <Box display="flex" justifyContent="center" my={2}>
          <CircularProgress />
        </Box>
      );
    }

    if (selectedImages.length === 0) {
      return (
        <div style={{ color: "#bebebe", textAlign: "center", padding: "20px" }}>
          <p>{t("Please select a date")}</p>
        </div>
      );
    }

    return (
      <div
        className="d-flex justify-content-between flex-wrap"
      >
        {selectedImages.map((image, index) => (
          <div
            key={index}
            onClick={() => handleClick(image)}
            className={`btn w-25 ${selectedImageUrl !== image.image_url ? "btn-light" : "btn-primary"
              }`}
          >
            <div
              style={{
                textAlign: "center"
              }}
            >
              <img
                src={typeIcons[image.type]}
                alt={image.type}
                style={{ height: "32px", borderRadius: "50%" }}
              />
            </div>
            <p className="mt-2">{designationImageMap[image.type]}</p>
          </div>
        ))}
        <div
          className={`btn w-25 ${selectedImageUrl === 'terrain' ? 'btn-primary' : 'btn-light'}`}
          onClick={() => {
            setSelectedImageUrl('');
            setDataDisplayed([]);
            setSelectedImageType(null);
            setPolygonDisplayed([]);
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <img
              src={terrain} // Replace with the icon for terrain
              alt="Terrain"
              style={{ height: '32px', width: "32px", borderRadius: '50%', objectFit: "cover" }}
            />
          </div>
          <p className="mt-1">Terrain </p>
        </div>
      </div>
    );
  };
  return (
    <Container fluid className="main-content-container px-3 pb-2">
      <Row className="page-header py-2 mb-4">
        <PageTitle
          subtitle={t("overview")}
          title={t("Satellite Images")}
          className=" mb-1"
        />
      </Row>

      <Container className="main-content-container p-3 border bg-light rounded">
        <Row className="gap-2 justify-content-between">
          <Col lg="8" md="12" sm="12">
            <Row className="pt-4">
              <Col lg="8" md="12" sm="12" className="py-2 d-md-block d-lg-none">
                {/* Select input on mobile view */}
                <Card className="mt-0" style={{ height: "100%" }}>
                  <Card.Header className="border-bottom">
                    <Form.Select
                      value={selectedField}
                      onChange={getSelectedField}
                    >
                      <option value="">{t("select_field")}</option>
                      {fields.map(field => {
                        return (
                          <option key={field.Id} value={field.Id}>
                            {field.title}
                          </option>
                        );
                      })}
                    </Form.Select>
                  </Card.Header>
                </Card>
              </Col>
              <Col lg="12" md="12" sm="12">
                <SatteliteMap
                  farms={farms}
                  data={selectedField}
                  satellitesImages={selectedImages}
                  selectedData={dataDisplayed}
                  drawn={polygonDisplayed}
                  draw={mapConfig.draw}
                  edit={mapConfig.edit}
                  zoom={coords.zoom}
                  center={coords.center}
                  fromAction={coords.fromAction}
                  selectedImageUrl={selectedImageUrl}
                  renderImageGallery={renderImageGallery}
                  selectedImageType={selectedImageType}
                />
              </Col>
            </Row>
          </Col>

          <Col lg="3" md="12" sm="12" className="my-2">
            <Card className="mt-0" style={{ height: "100%" }}>
              {fields.length === 0 ? (
                <LinearProgress />
              ) : (
                <>
                  <Card.Header className="border-bottom d-none d-lg-block">
                    <Form.Select
                      value={selectedField}
                      onChange={getSelectedField}
                    >
                      <option value="">{t("select_field")}</option>
                      {fields.map(field => {
                        return (
                          <option key={field.Id} value={field.Id}>
                            {field.title}
                          </option>
                        );
                      })}
                    </Form.Select>
                  </Card.Header>
                  <Card.Body className="p-1">
                    {selectedField.length > 0 &&
                      selectedField.map(field => {
                        return (
                          <>
                            <Row>
                              <Col lg="12" md="12" sm="12">
                                <h5
                                  style={{ fontSize: 14, textAlign: "center" }}
                                >
                                  {t("lat")}{" "}
                                  <span
                                    style={{
                                      fontWeight: "bold",
                                      textAlign: "center"
                                    }}
                                  >
                                    {field.Latitude}
                                  </span>
                                </h5>
                              </Col>
                              <Col lg="12" md="12" sm="12">
                                <h5
                                  style={{ fontSize: 14, textAlign: "center" }}
                                >
                                  {t("lon")}{" "}
                                  <span
                                    style={{
                                      fontWeight: "bold",
                                      textAlign: "center"
                                    }}
                                  >
                                    {field.Longitude}
                                  </span>
                                </h5>
                              </Col>
                            </Row>
                            <Row className="border-bottom">
                              <Col lg="12" md="12" sm="12">
                                <h6
                                  style={{ fontSize: 14, textAlign: "center" }}
                                >
                                  {t("name_field")} <br />{" "}
                                  <span
                                    style={{
                                      fontWeight: "bold",
                                      textAlign: "center"
                                    }}
                                  >
                                    {field.title}
                                  </span>
                                </h6>
                              </Col>
                            </Row>
                          </>
                        );
                      })}
                    {selectedField.length === 0 && (
                      <div
                        style={{
                          color: "#bebebe",
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          flexDirection: "column",
                          padding: "10px"
                        }}
                      >
                        <p style={{ color: "#bebebe", textAlign: "center" }}>
                          {t("message_image")}
                        </p>
                        <i
                          className="fas fa-satellite"
                          style={{ fontSize: "40px" }}
                        ></i>
                      </div>
                    )}
                    <Row className="my-2">
                      <Col lg="12" md="12" sm="12">
                        {selectedField.length > 0 && (
                          <>
                            <h5 style={{ fontSize: 14, textAlign: "center" }}>
                              {" "}
                              Satellite Images List
                            </h5>
                            <Calendar
                              onChange={date =>
                                handleDateClick(
                                  moment(date).format("D MMM YYYY")
                                )
                              }
                              value={
                                selectedDate
                                  ? new Date(moment(selectedDate, "D MMM YYYY"))
                                  : null
                              }
                              locale={
                                localStorage.getItem("local")
                                  ? `${localStorage.getItem(
                                    "local"
                                  )}-${localStorage
                                    .getItem("local")
                                    .toUpperCase()}`
                                  : "en-EN"
                              }
                              tileContent={({ date, view }) => {
                                const formattedDate = moment(date).format(
                                  "D MMM YYYY"
                                );
                                const hasSatelliteImages = satellitesImages.some(
                                  data =>
                                    moment(data.created_at).format(
                                      "D MMM YYYY"
                                    ) === formattedDate
                                );

                                return view === "month" &&
                                  hasSatelliteImages ? (
                                  <span
                                    style={{
                                      fontWeight: "bold",
                                      color: "#29B2C4"
                                    }}
                                  >
                                    •
                                  </span>
                                ) : null;
                              }}
                            />
                          </>
                        )}
                      </Col>
                    </Row>
                  </Card.Body>
                </>
              )}
            </Card>
          </Col>
        </Row>
      </Container>
    </Container>
  );
};

export default SatelliteImages;