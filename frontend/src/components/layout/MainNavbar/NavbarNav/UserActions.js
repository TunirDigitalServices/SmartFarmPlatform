import React from "react";
import { Link, withRouter } from "react-router-dom";
import {
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  Collapse,
  NavItem,
  NavLink
} from "shards-react";
import setToken from "../../../../useToken";
import { withTranslation } from "react-i18next";

 class UserActions extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      visible: false
    };
    this.role = JSON.parse(localStorage.getItem("user")).role;
    this.offer = JSON.parse(localStorage.getItem("user")).offer_type;

    this.toggleUserActions = this.toggleUserActions.bind(this);
    this.dataUser = JSON.parse(localStorage.getItem("user"));
    this.nameUser = "";
    this.avatar = "";
    if(this.dataUser != null) {
      this.nameUser = this.dataUser.name
      this.avatar = this.dataUser.avatar
    }
    this.img = require("../../../../images/avatars/default-avatar.png")
  }

  toggleUserActions() {
    this.setState({
      visible: !this.state.visible
    });
  }
  
  goToProfile = () => {
    this.props.history.push('/user-profile');
    window.location.reload()
  }

  goToReport = () => {
    this.props.history.push('/my-reports');
    window.location.reload()
  }

  render() {
    const { t } = this.props;

    return (
      <NavItem tag={Dropdown} caret toggle={this.toggleUserActions}>
        <DropdownToggle caret tag={NavLink} className="text-nowrap px-3 h-100" style={{heigth:"100%"}}>
          <img
            className="rounded-circle mr-2 "
            style={{width: "35px" ,height:"35px"}}
            src={`${this.avatar == null ? this.img : `${process.env.REACT_APP_BASE_URL}/static/`+this.avatar}`}
            alt="User Avatar"
          />{" "}
          <span className="d-none d-md-inline-block">{this.nameUser}</span>
        </DropdownToggle>
        <Collapse tag={DropdownMenu} right small open={this.state.visible}>
          <DropdownItem tag={Link} onClick={() => this.goToProfile() }>
            <i className="material-icons">&#xE7FD;</i> {t('profile')}
          </DropdownItem>
          {
            this.offer === "2" 
            ?
          <DropdownItem tag={Link} onClick={() => this.goToReport()}>
            <i className="material-icons">&#xef6e;</i> {t('reports')}
          </DropdownItem>
          :
          null
          }
          {
            this.role === 'ROLE_SUPPLIER'
            ?
            <DropdownItem tag={Link} to="/my-company">
              <i className="material-icons">&#xe8d1;</i> {t('my_company')}
            </DropdownItem>
            :
            null

          }
          <DropdownItem divider />
          <DropdownItem
            tag={Link}
            // to="/Login"
            //href="/"
            className="text-danger"
            onClick={ () => {
               this.props.history.push('/Login')
              localStorage.setItem("token", '{ "token": null }');
              localStorage.setItem("refreshToken", null);
              localStorage.setItem("user", null);
              window.location.reload();
            }}
          >
            <i className="material-icons text-danger">&#xE879;</i> {t('logout')}
          </DropdownItem>
        </Collapse>
      </NavItem>
    );
  }
}

export default withTranslation()(withRouter(UserActions));
