import React from "react";
import PropTypes from "prop-types";
import { Navbar, Container } from "react-bootstrap";
import logo from "../../../assets/images/Logo smart farm1.jpg"


class SidebarMainNavbar extends React.Component {
  constructor(props) {
    super(props);

  }



  render() {
    const { hideLogoText, handleToggleSidebar } = this.props;
    return (
      <div className="main-navbar">
        <div
          className="align-items-stretch bg-white flex-md-nowrap border-bottom p-0"
          type="light"
        >
          <Navbar.Brand
            className="w-100 mr-0"
            href="#"
            style={{ lineHeight: "25px" }}
          >
            <div className="d-table m-auto pt-3">
              <div style={{ height: 60, width: "100%", overflow: "hidden" }} >
                <img
                  id="main-logo"
                  className="d-inline-block align-top mr-1"
                  style={{ maxWidth: "125px", marginTop: -25 }}
                  src={logo}
                  alt="Smart Farm"
                />
                <a
                  className="toggle-sidebar d-sm-inline d-md-none d-lg-none mb-3"
                >
                  <i className="material-icons " style={{top:'-16px'}} onClick={handleToggleSidebar} >&#xE5C4;</i>
                </a>
              </div>
              {/*!hideLogoText && (
                <span className="d-none d-md-inline ml-1">Smart Farm</span>
              )*/}

            </div>
          </Navbar.Brand>
          {/* eslint-disable-next-line */}

        </div>
      </div>
    );
  }
}

SidebarMainNavbar.propTypes = {
  /**
   * Whether to hide the logo text, or not.
   */
  hideLogoText: PropTypes.bool
};

SidebarMainNavbar.defaultProps = {
  hideLogoText: false
};

export default SidebarMainNavbar;
