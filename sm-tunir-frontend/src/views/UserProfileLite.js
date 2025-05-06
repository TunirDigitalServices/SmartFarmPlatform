import React from "react";
import { Container, Row, Col } from "react-bootstrap";

import PageTitle from "../components/common/PageTitle";
import UserDetails from "../components/user-profile-lite/UserDetails.js"
import UserAccountDetails from "../components/user-profile-lite/UserAccountDetails.js"

const UserProfileLite = () => (
  <Container fluid className="main-content-container px-4">
    <Row noGutters className="page-header py-4">
      <PageTitle title="User Profile" subtitle="Overview" md="12" className="ml-sm-auto mr-sm-auto" />
    </Row>
    <Row className="gap-3">
      <Col lg="3">
        <UserDetails />
      </Col>
      <Col lg="8">
        <UserAccountDetails />
      </Col>
    </Row>
  </Container>
);

export default UserProfileLite;
