import React from "react";
import { Nav, Collapse, Dropdown } from "react-bootstrap";
import i18n from "../../../../i18n";

export default class Language extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      visible: false,
      langSelected: localStorage.getItem("local") || "",
    };

    this.toggleLanguages = this.toggleLanguages.bind(this);
    this.toggleLanguagesDrap = this.toggleLanguagesDrap.bind(this);
  }

  toggleLanguages() {
    this.setState((prevState) => ({
      visible: !prevState.visible,
    }));
  }

  toggleLanguagesDrap(e, lang) {
    e.preventDefault();
    this.setState({
      langSelected: lang,
      visible: false,
    });
    i18n.changeLanguage(lang);
    localStorage.setItem("local", lang);
  }

  render() {
    const { visible, langSelected } = this.state;

    return (
      <Nav.Item
        className="bg-light border-left languages dropdown-menu-left"
        style={{ lineHeight: "38px", position: "relative" }}
      >
        <Nav.Link
          className="nav-link-icon text-center"
          onClick={this.toggleLanguages}
        >
          <div className="nav-link-icon__wrapper text-uppercase">
            {langSelected}
          </div>
        </Nav.Link>

        <Collapse in={visible}>
          <div
            className="dropdown-menu dropdown-menu-small show"
            style={{ minWidth: "60px", position: "absolute" }}
          >
            {["fr", "en", "it", "ar"].map((lang) => (
              <Dropdown.Item
                key={lang}
                onClick={(e) => this.toggleLanguagesDrap(e, lang)}
                style={{
                  width: "100%",
                  padding: "0.5rem 1.25rem",
                  height: "40px",
                  lineHeight: "0",
                }}
              >
                {lang.toUpperCase()}
              </Dropdown.Item>
            ))}
          </div>
        </Collapse>
      </Nav.Item>
    );
  }
}
