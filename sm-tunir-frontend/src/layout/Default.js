import React from "react";
import PropTypes from "prop-types";
import { Container, Row, Col } from "react-bootstrap";

import MainNavbar from "../components/layout/MainNavbar/MainNavbar";
import MainSidebar from "../components/layout/MainSidebar/MainSidebar";
import { Outlet } from "react-router";

const DefaultLayout = ({  noNavbar, noFooter }) => (
  <div fluid>
  {!noNavbar && <MainNavbar />} 
  <Row>
    <MainSidebar />
    <Col
      className="main-content p-0"
      lg={{ size: 10, offset: 2 }}
      md={{ size: 9, offset: 3 }}
      sm="12"
      tag="main"
    >
      <Outlet />
    </Col>
  </Row>
</div>

);

DefaultLayout.propTypes = {
  /**
   * Whether to display the navbar, or not.
   */
  noNavbar: PropTypes.bool,
  /**
   * Whether to display the footer, or not.
   */
  noFooter: PropTypes.bool
};

DefaultLayout.defaultProps = {
  noNavbar: false,
  noFooter: false
};

export default DefaultLayout;
