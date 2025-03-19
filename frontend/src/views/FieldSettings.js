import React from "react";
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  CardHeader,
  Button
} from "shards-react";

import PageTitle from "../components/common/PageTitle";
import "./../assets/Styles.css";
import "./Styles.css";
import FieldSetupForm from "../components/FieldSettingForms/FieldSetupForm";
import FieldSoilForm from "../components/FieldSettingForms/FieldSoilForm";
import FieldCropForm from "../components/FieldSettingForms/FieldCropForm";
import FieldIrrigationForm from "../components/FieldSettingForms/FieldIrrigationForm";

import "react-responsive-carousel/lib/styles/carousel.min.css";
import { Carousel } from "react-responsive-carousel";
import Map from "./leafletMap";

class FieldSettings extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      setupCardSave: false,
      soilCardSave: false,
      cropsCardSave: false,
      irrigationCardSave: false,
      data: {
        fieldName: "a",
        farmName: "b",
        desc: "c",
        soilProp: "d",
        depth: [
          {
            depthLevel: "",
            soilType: "",
            clay: "",
            sand: "",
            silt: "",
            cec: "",
            ph: "",
            om: "",
            ecd: ""
          },
          {
            depthLevel: "",
            soilType: "",
            clay: "",
            sand: "",
            silt: "",
            cec: "",
            ph: "",
            om: "",
            ecd: ""
          },
          {
            depthLevel: "",
            soilType: "",
            clay: "",
            sand: "",
            silt: "",
            cec: "",
            ph: "",
            om: "",
            ecd: ""
          }
        ],
        crop: "",
        prevCrop: "",
        gdd: "",
        startDate: "",
        endDate: "",
        irrigationType: "",
        flowRate: "",
        irrigatedPercentage: ""
      }
    };
  }

  componentDidMount() {
    const fetchData = async () => {
      const response = await fetch(`http://127.0.0.1:9000/getFieldData`);
      const newData = await response.json();
      this.setState({ data: newData });
    };

    //fetchData();
  }

  render() {
    return (
      <Container fluid className="main-content-container px-4">
        {/* Page Header */}
        <Row noGutters className="page-header py-4">
          <PageTitle
            sm="4"
            title={this.state.data.fieldName}
            subtitle="Field Settings"
            className="text-sm-left"
          />
        </Row>

        <Row>
          <Col lg="12" md="8" sm="12" className="mb-4">
            <Carousel showThumbs={false}>
              <div>
                <Card small className="h-100">
                  <CardHeader className="border-bottom">
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between"
                      }}
                    >
                      <div>
                        <h6 className="m-0">Field Setup</h6>{" "}
                        <h7>
                          <a href="#">Menage field privileges</a>
                        </h7>
                      </div>
                      <Button
                        onClick={evt => {
                          this.setState({
                            setupCardSave: !this.state.setupCardSave
                          });
                          evt.preventDefault();
                        }}
                       // theme="success"
                       style={{ backgroundColor: "#0daaa2" }}



                        className="mb-2 mr-1"
                      >
                        Save
                      </Button>
                    </div>
                  </CardHeader>
                  <CardBody className="pt-0">
                    <div
                      style={{
                        display: "flex",
                        marginTop: "20px",
                        flexWrap: "wrap"
                      }}
                    >
                      <FieldSetupForm
                        key={this.state.data.fieldName}
                        fieldName={this.state.data.fieldName}
                        farmName={this.state.data.farmName}
                        desc={this.state.data.desc}
                        onChange={value => console.log(value)}
                        saved={this.state.setupCardSave}
                      />
                      <Col lg="8" md="12" sm="12" className="mb-4">
                        <h7>*You can edit field boundries on the map</h7>
                        <iframe
                          title="OverviewMap"
                          class="iFrame"
                          src="https://maps.google.com/maps?q=2880%20Broadway,%20New%20York&t=&z=13&ie=UTF8&iwloc=&output=embed"
                          frameborder="0"
                          scrolling="no"
                          marginheight="0"
                          marginwidth="0"
                        ></iframe>
                      </Col>
                    </div>
                  </CardBody>
                </Card>
              </div>
              <div>
                <Card small className="h-100">
                  <CardHeader className="border-bottom">
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center"
                      }}
                    >
                      <h6 className="m-0">Soil Info</h6>
                      <Button
                        onClick={evt => {
                          this.setState({
                            soilCardSave: !this.state.soilCardSave
                          });
                          evt.preventDefault();
                        }}
                       // theme="success"
                       style={{ backgroundColor: "#0daaa2" }}



                        className="mb-2 mr-1"
                      >
                        Save
                      </Button>
                    </div>
                  </CardHeader>
                  <CardBody className="pt-0">
                    <div
                      style={{
                        display: "flex",
                        marginTop: "20px",
                        flexWrap: "wrap"
                      }}
                    >
                      <FieldSoilForm
                        key={this.state.data.soilProp}
                        soilProp={this.state.data.soilProp}
                        depth={this.state.data.depth}
                        onChange={value => console.log(value)}
                        saved={this.state.soilCardSave}
                      />
                      <Col lg="7" md="12" sm="12" className="mb-4">
                        <h7>
                          *You can add multiple zones to your field on the map
                        </h7>
                        <iframe
                          title="OverviewMap"
                          class="iFrame"
                          src="https://maps.google.com/maps?q=2880%20Broadway,%20New%20York&t=&z=13&ie=UTF8&iwloc=&output=embed"
                          frameborder="0"
                          scrolling="no"
                          marginheight="0"
                          marginwidth="0"
                        ></iframe>
                      </Col>
                    </div>
                  </CardBody>
                </Card>
              </div>
              <div>
                <Card small className="h-100">
                  <CardHeader className="border-bottom">
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center"
                      }}
                    >
                      <h6 className="m-0">Crop Info</h6>{" "}
                      <Button
                        onClick={evt => {
                          this.setState({
                            cropsCardSave: !this.state.cropsCardSave
                          });
                          evt.preventDefault();
                        }}
                       // theme="success"
                       style={{ backgroundColor: "#0daaa2" }}



                        className="mb-2 mr-1"
                      >
                        Save
                      </Button>
                    </div>
                  </CardHeader>
                  <CardBody className="pt-0">
                    <div
                      style={{
                        display: "flex",
                        marginTop: "20px",
                        flexWrap: "wrap"
                      }}
                    >
                      <FieldCropForm
                        key={this.state.data.farmName}
                        crop={this.state.data.crop}
                        prevCrop={this.state.data.prevCrop}
                        gdd={this.state.data.gdd}
                        onChange={value => console.log(value)}
                        saved={this.state.cropsCardSave}
                      />
                      <Col lg="8" md="12" sm="12" className="mb-4">
                        <h7>
                          *You can add multiple crop zones to your field on the
                          map
                        </h7>
                        <iframe
                          title="OverviewMap"
                          class="iFrame"
                          src="https://maps.google.com/maps?q=2880%20Broadway,%20New%20York&t=&z=13&ie=UTF8&iwloc=&output=embed"
                          frameborder="0"
                          scrolling="no"
                          marginheight="0"
                          marginwidth="0"
                        ></iframe>
                      </Col>
                    </div>
                  </CardBody>
                </Card>
              </div>
              <div>
                <Card small className="h-100">
                  <CardHeader className="border-bottom">
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center"
                      }}
                    >
                      <h6 className="m-0">Irrigation Info</h6>{" "}
                      <Button
                        onClick={evt => {
                          this.setState({
                            irrigationCardSave: !this.state.irrigationCardSave
                          });
                          evt.preventDefault();
                        }}
                       // theme="success"
                        style={{ backgroundColor: "#0daaa2" }}



                        className="mb-2 mr-1"
                      >
                        Save
                      </Button>
                    </div>
                  </CardHeader>
                  <CardBody className="pt-0">
                    <div
                      style={{
                        display: "flex",
                        marginTop: "20px",
                        flexWrap: "wrap"
                      }}
                    >
                      <FieldIrrigationForm
                        key={this.state.data.desc}
                        irrigationType={this.state.data.irrigationType}
                        irrigatedPercentage={
                          this.state.data.irrigatedPercentage
                        }
                        flowRate={this.state.data.flowRate}
                        onChange={value => console.log(value)}
                        saved={this.state.irrigationCardSave}
                      />
                      <Col lg="7" md="12" sm="12" className="mb-4">
                        <h7>
                          *You can add multiple zones of irrigation methods to
                          your field on the map
                        </h7>
                        <iframe
                          title="OverviewMap"
                          class="iFrame"
                          src="https://maps.google.com/maps?q=2880%20Broadway,%20New%20York&t=&z=13&ie=UTF8&iwloc=&output=embed"
                          frameborder="0"
                          scrolling="no"
                          marginheight="0"
                          marginwidth="0"
                        ></iframe>
                      </Col>
                    </div>
                  </CardBody>
                </Card>
              </div>
            </Carousel>
          </Col>
        </Row>
      </Container>
    );
  }
}

export default FieldSettings;
