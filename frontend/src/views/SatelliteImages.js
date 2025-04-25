import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  CardBody,
  CardHeader,
  Card,
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  Tooltip,
  FormInput,
  FormSelect,
  FormGroup,
  Form
} from "shards-react";
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

  const getSatelliteImages = async () => {
    try {
      setLoadingImages(true);
      const fieldId = selectedField[0].Id;
      const apiUrl = `/field/get-sattelite-images/${fieldId}`;
      const response = await api.get(apiUrl);
      
      // Assuming the backend now returns image URLs
      const fetchedData = response.data.imagesData.map(image => ({
        ...image,
        // Add a preview URL if needed (for thumbnails)
        previewUrl: image.image_url // or generate thumbnails on backend
      }));
      
      setSatellitesImages(fetchedData);
      setLoadingImages(false);
    } catch (error) {
      console.error("API error:", error);
      setLoadingImages(false);
    }
  };

  console.log(satellitesImages)
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
  }, [selectedField]);

  const { t, i18n } = useTranslation();

  useEffect(() => {
    // Generate an array of dates for the next 7 days
    const next7Days = Array.from({ length: 6 }, (_, index) =>
      moment()
        .subtract(index, "days")
        .format("D MMM YYYY")
    );

    const ascendingDates = next7Days.reverse();

    setDates(ascendingDates);
  }, []);

  const formatDate = dateString => {
    // Parse the input date string using Moment.js
    const parsedDate = moment(dateString, "D MMM YYYY");

    // Format the date in the desired format (YYYY-MM-DD)
    const formattedDate = parsedDate.format("YYYY-MM-DD");

    return formattedDate;
  };

  const handleDateClick = async (date) => {
    setSelectedDate(date);
    const formattedDate = formatDate(date);
    
    // Filter existing images first
    const filteredData = satellitesImages.filter(
      data => moment(data.created_at).format("D MMM YYYY") === date
    );
    
    setSelectedImages(filteredData);
    
    // If no images for this date, fetch from backend
    if (filteredData.length === 0) {
      try {
        setLoadingImages(true);
        const fieldId = selectedField[0].Id;
        const userId = JSON.parse(localStorage.getItem("user")).id;
        const apiUrl = `/satellite-images/${userId}/${fieldId}/${formattedDate}`;
        
        const response = await api.get(apiUrl);
        if (response.data.imagesData && response.data.imagesData.length > 0) {
          const newImages = response.data.imagesData.map(img => ({
            ...img,
            previewUrl: img.image_url
          }));
          
          setSatellitesImages(prev => [...prev, ...newImages]);
          setSelectedImages(newImages);
        }
      } catch (error) {
        console.error("API error:", error);
      } finally {
        setLoadingImages(false);
      }
    }
  };
  const getSelectedField = e => {
    const selectedId = e.target.value;
    const selected = fields && fields.filter(field => field.Id == selectedId);
    setSelectedField(selected);
  };

  useEffect(() => {
    const filtredData = satellitesImages.filter(data => {
      return (
        moment(data.created_at).format("D MMM YYYY") === selectedDate &&
        data.field_id === selectedField[0].Id
      );
    });
    setSelectedImages(filtredData);
  }, [selectedDate, selectedField]);

  const handleClick = (image) => {
    if (image) {
      const imageUrl = `http://localhost:8000${image.image_url}`; // Prepend the backend URL
      setSelectedImageUrl(imageUrl); // Save the full image URL with localhost
      setDataDisplayed(image.data || []); // Save data for the selected image (e.g., coordinates or metadata)
      setPolygonDisplayed(image.polygon || []); // Save polygon data if applicable
    }
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
        <div style={{ 
          color: "#bebebe", 
          textAlign: "center",
          padding: "20px"
        }}>
          <p>{t("Please select a date")}</p>
        </div>
      );
    }

    return (
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 200px)",
        gap: "10px",
        padding: "10px"
      }}>
        {selectedImages.map((image, index) => (
          <div 
            key={index}
            onClick={() => handleClick(image)}
            style={{
              cursor: "pointer",
              border: selectedImageUrl === image.image_url 
                ? "2px solid #29B2C4" 
                : "1px solid #ddd",
              borderRadius: "4px",
              overflow: "hidden"
            }}
          >
            {/* <img 
              src={image.previewUrl || image.image_url} 
              alt={`Satellite ${index}`}
              style={{
                width: "100%",
                height: "80px",
                objectFit: "cover"
              }}
            /> */}
            <div style={{
              padding: "4px",
              fontSize: "18px",
              textAlign: "center",
              textTransform:'uppercase',
              fontWeight:'bold'
            }}>
              {image.type}
            </div>
          </div>
        ))}
      </div>
    );
  };
console.log(selectedImageUrl)
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
        <Row>
          <Col lg="8" md="12" sm="12">
            <Row className="pt-4">
              <Col lg="8" md="12" sm="12" className="py-2 d-md-block d-lg-none">
                {/* Select input on mobile view */}
                <Card className="mt-0" style={{ height: "100%" }}>
                  <CardHeader className="border-bottom">
                    <FormSelect
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
                    </FormSelect>
                  </CardHeader>
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

                />
              </Col>
            </Row>
          </Col>

          <Col lg="4" md="12" sm="12" className="my-2">
            <Card className="mt-0" style={{ height: "100%" }}>
              {fields.length === 0 ? (
                <LinearProgress />
              ) : (
                <>
                  <CardHeader className="border-bottom d-none d-lg-block">
                    <FormSelect
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
                    </FormSelect>
                  </CardHeader>
                  <CardBody className="p-1">
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
                  </CardBody>
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
