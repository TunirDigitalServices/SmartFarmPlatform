import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import { Col } from "react-bootstrap";

import SidebarMainNavbar from "./SidebarMainNavbar";
import SidebarSearch from "./SidebarSearch";
import SidebarNavItems from "./SidebarNavItems";

import { Store } from "../../../flux";
import { Dispatcher, Constants } from "../../../flux";


class MainSidebar extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      menuVisible: false,
      sidebarNavItems: Store.getSidebarItems()
    };

    this.onChange = this.onChange.bind(this);
    this.handleToggleSidebar = this.handleToggleSidebar.bind(this);

  }

  componentWillMount() {
    Store.addChangeListener(this.onChange);
  }

  componentWillUnmount() {
    Store.removeChangeListener(this.onChange);
  }

  onChange() {
    this.setState({
      ...this.state,
      menuVisible: Store.getMenuState(),
      sidebarNavItems: Store.getSidebarItems()
    });
  }
   handleToggleSidebar() {
    Dispatcher.dispatch({
      actionType: Constants.TOGGLE_SIDEBAR
    });
  }

  render() {
    const classes = classNames(
      "main-sidebar",
      "px-0",
      "col-12",
      this.state.menuVisible && "open"
    );

    return (
      <Col tag="aside" className={classes} lg={2} md={3} >
        <SidebarMainNavbar hideLogoText={this.props.hideLogoText} handleToggleSidebar={this.handleToggleSidebar}/>
        {/* <SidebarSearch /> */}
        <SidebarNavItems handleToggleSidebar={this.handleToggleSidebar}/>
      </Col>
    );
  }
}

MainSidebar.propTypes = {
  /**
   * Whether to hide the logo text, or not.
   */
  hideLogoText: PropTypes.bool
};

MainSidebar.defaultProps = {
  hideLogoText: false
};

export default MainSidebar;
