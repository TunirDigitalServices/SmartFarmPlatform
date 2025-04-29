import React, { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  CardBody,
  CardHeader,
  Card,
  FormSelect
} from "shards-react";
import moment from "moment";
import { useTranslation } from "react-i18next";
import PageTitle from "../components/common/PageTitle";
import Calendar from "react-calendar";
import { LinearProgress } from "@mui/material";
import api from "../api/api";
import SatteliteMap from "./SatteliteMap copy";

const formatDate = dateString => {
  // Parse the input date string using Moment.js
  const parsedDate = moment(dateString, "D MMM YYYY");

  // Format the date in the desired format (YYYY-MM-DD)
  const formattedDate = parsedDate.format("YYYY-MM-DD");

  return formattedDate;
};

export default function SatellitePage() {
  const apiKey =
    "apk.4e8c771435de030fcee7b1aa265ecd24ac0f9eb57ce758a71ac101796dcbc07e";
  const { t, i18n } = useTranslation();
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

  const [fields, setFields] = useState([]);
  const [polygonId, setPolygonId] = useState(null);
  const [satellitesImages, setSatellitesImages] = useState([]);
  const [dataDisplayed, setDataDisplayed] = useState([]);
  const [polygonDisplayed, setPolygonDisplayed] = useState([]);

  const [selectedDate, setSelectedDate] = useState(
    moment().format("D MMM YYYY")
  );
  const [selectedField, setSelectedField] = useState(null);
  const [selectedImages, setSelectedImages] = useState([]);
  const [images, setImages] = useState([]);
  const [typeImage, setTypeImage] = useState(null);

  useEffect(() => {
    const getDataFields = async () => {
      const res = await api.get("/field/fields");

      if (res.data.farms) {
        let auxFields = [];
        res.data.farms.map(item => {
          let fields = item.fields;
          fields.map(itemfield => {
            auxFields.push({
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
          setFields(auxFields);
        });
      }
    };

    getDataFields();
  }, []);
  useEffect(() => {
    (async () => {
      if (selectedField) {
        const response = await api.get(
          `http://localhost:8000/view-image-field/${polygonId}`
        );
        console.log(response.data);
        const urlResponse = await api.get(
          `/imageSatteliteEos/${response.data.task_id}`
        );
        console.log(urlResponse.data);

        // const buffer = response.data;
        // const uint8Array = new Uint8Array(buffer.data);
        // const blob = new Blob([uint8Array], { type: "image/png" });
        // const imageUrl = URL.createObjectURL(blob);
        // setImage(imageUrl);

        // .then((res) => res.json())
        // .then((data) => {
        //   setImage(`data:image/png;base64,${data.data.image}`); // Convert to data URL
        // });
        //   fetch( `http://localhost:8000/view-image-field/${polygonId}`)
        // .then((res) => res.blob()) // Get binary data as Blob
        // .then((blob) => {
        //   console.log(blob);
        //   const url = URL.createObjectURL(blob); // Create object URL
        //   setImage(url);
        // });
      }
    })();
  }, [selectedDate]);

  const handleDateClick = async date => {
    setSelectedDate(date);
  };

  const getSelectedField = async e => {
    const selectedId = e.target.value;
    const selected = fields.find(field => field.Id == selectedId);
    setSelectedField(selected);
    const coordinates = JSON.parse(selected.coordinates).map(elem => {
      return [elem.Long, elem.Lat];
    });
    console.log("coordinates : ", coordinates);

    // const response = await api.post("/create-polygon", {
    //   coordinates // coordinates: array of [lat, long]s
    // });

    // setPolygonId(response.data.id);
    const userId = JSON.parse(localStorage.getItem("user")).id;
    console.log(userId);

    const response = await api.post(
      "/add-satellite-images/" + userId + "/" + selectedId,
      {
        coordinates // coordinates: array of [lat, long]s
      }
    );
    setImages(response.data.images);
    setSatellitesImages(response.data.images);
    setTypeImage(response.data.images[0].type);

    // setPolygonId(response.data.id);
  };
  console.log(selectedField);

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
                      value={[selectedField]}
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
                  data={selectedField}
                  satellitesImages={selectedImages}
                  selectedData={dataDisplayed}
                  drawn={polygonDisplayed}
                  draw={mapConfig.draw}
                  edit={mapConfig.edit}
                  zoom={coords.zoom}
                  center={coords.center}
                  fromAction={coords.fromAction}
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
                    {selectedField && (
                      <>
                        <Row>
                          <Col lg="12" md="12" sm="12">
                            <h5 style={{ fontSize: 14, textAlign: "center" }}>
                              {t("lat")}{" "}
                              <span
                                style={{
                                  fontWeight: "bold",
                                  textAlign: "center"
                                }}
                              >
                                {selectedField.Latitude}
                              </span>
                            </h5>
                          </Col>
                          <Col lg="12" md="12" sm="12">
                            <h5 style={{ fontSize: 14, textAlign: "center" }}>
                              {t("lon")}{" "}
                              <span
                                style={{
                                  fontWeight: "bold",
                                  textAlign: "center"
                                }}
                              >
                                {selectedField.Longitude}
                              </span>
                            </h5>
                          </Col>
                        </Row>
                        <Row className="border-bottom">
                          <Col lg="12" md="12" sm="12">
                            <h6 style={{ fontSize: 14, textAlign: "center" }}>
                              {t("name_field")} <br />{" "}
                              <span
                                style={{
                                  fontWeight: "bold",
                                  textAlign: "center"
                                }}
                              >
                                {selectedField.title}
                              </span>
                            </h6>
                          </Col>
                        </Row>
                      </>
                    )}
                    {selectedField && (
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
                        {selectedField && (
                          <>
                            <h5 style={{ fontSize: 14, textAlign: "center" }}>
                              {" "}
                              Satellite Images List
                            </h5>
                            {images.length ? (
                              <div>
                                {images
                                  .filter(elem => elem.type === typeImage)
                                  .map(image => (
                                    <img
                                      src={
                                        process.env.REACT_APP_BASE_URL +
                                        image.image_url
                                      }
                                      alt={image.type}
                                      style={{
                                        maxWidth: "100%",
                                        height: "auto",
                                        borderRadius: "12px",
                                        boxShadow: "0 0 10px rgba(0,0,0,0.2)"
                                      }}
                                    />
                                  ))}
                                {images.map((elem, i) => (
                                  <button
                                    className={`btn ${elem.type===typeImage?'btn-primary':'btn-light'}`}
                                    onClick={() => setTypeImage(elem.type)}
                                  >
                                    {elem.type}
                                  </button>
                                ))}
                              </div>
                            ) : (
                              <p>Loading image...</p>
                            )}
                            <Calendar
                              onChange={date =>
                                setSelectedDate(
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
}
