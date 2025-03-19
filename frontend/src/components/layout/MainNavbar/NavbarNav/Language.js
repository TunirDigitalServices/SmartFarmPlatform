import React from "react";
import { NavItem, NavLink, Badge, Collapse, DropdownItem } from "shards-react";
import i18n from '../../../../i18n'

export default class Language extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      visible: false,
      langSelected: localStorage.getItem("local") || ''
    };

    this.toggleLanguages = this.toggleLanguages.bind(this);
    this.toggleLanguagesDrap = this.toggleLanguagesDrap.bind(this);
  }

  toggleLanguages() {
    this.setState({
      visible: !this.state.visible
    });
  }

  toggleLanguagesDrap(e, lang){
    this.setState({
        langSelected: lang
      });
      i18n.changeLanguage(lang);
      localStorage.setItem("local",lang)
      this.setState({
        visible: !this.state.visible
      });
  }

  render() {
    return (
      <NavItem className="bg-light border-left languages dropdown-menu-left"
      style={{lineHeight: "38px", position: "relative"}}>
        <NavLink
          className="nav-link-icon text-center"
          onClick={this.toggleLanguages}
        >
          <div className="nav-link-icon__wrapper text-uppercase">
            {this.state.langSelected}
          </div>
        </NavLink>
        <Collapse
          open={this.state.visible}
          className="dropdown-menu dropdown-menu-small"
          style={{minWidth:"60px"}}
        >
          <DropdownItem onClick={(e) => this.toggleLanguagesDrap(e,'fr')} style={{width:"100%",padding: "0.5rem 1.25rem",height: "40px",lineHeight: "0"}}>
          Fr
          </DropdownItem>
          <DropdownItem onClick={(e) => this.toggleLanguagesDrap(e,'en')} style={{width:"100%", padding: "0.5rem 1.25rem",height: "40px",lineHeight: "0"}}>
          En
          </DropdownItem>
          <DropdownItem onClick={(e) => this.toggleLanguagesDrap(e,'it')} style={{width:"100%", padding: "0.5rem 1.25rem",height: "40px",lineHeight: "0"}}>
          It
          </DropdownItem>
          <DropdownItem onClick={(e) => this.toggleLanguagesDrap(e,'ar')} style={{width:"100%", padding: "0.5rem 1.25rem",height: "40px",lineHeight: "0"}}>
          Ar
          </DropdownItem>
        </Collapse>
      </NavItem>
    );
  }
}
