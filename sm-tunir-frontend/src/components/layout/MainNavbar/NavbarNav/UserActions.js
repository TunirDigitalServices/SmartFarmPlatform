import React from "react";
import { Link} from "react-router-dom";
// import {
//   Dropdown,
//   DropdownToggle,
//   DropdownMenu,
//   DropdownItem,
//   Collapse,
//   NavItem,
//   NavLink
// } from "shards-react";
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import DropdownItem from 'react-bootstrap/DropdownItem';
import Collapse from 'react-bootstrap/Collapse';
import Nav from 'react-bootstrap/Nav';
import NavItem from 'react-bootstrap/NavItem';
import NavLink from 'react-bootstrap/NavLink';

// import setToken from "../../../../useToken";
import { withTranslation } from "react-i18next";
import avatar from "../../../../assets/images/avatars/default-avatar.png"
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
    this.img = avatar
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
      <Dropdown  as={NavItem} onToggle={this.toggleUserActions} caret >
        <Dropdown.Toggle as={NavLink} caret  className="text-nowrap px-3 h-100" style={{heigth:"100%"}}>
          <img
            className="rounded-circle mr-2 "
            style={{width: "35px" ,height:"35px"}}
            src={`${this.avatar == null ? this.img : `${process.env.REACT_APP_BASE_URL}/static/`+this.avatar}`}
            alt="User Avatar"
          />{" "}
          <span className="d-none d-md-inline-block">{this.nameUser}</span>
        </Dropdown.Toggle>
        <Dropdown.Menu  right small open={this.state.visible}>
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
          <Dropdown.Divider />
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
        </Dropdown.Menu>
      </Dropdown >
    );
  }
}

export default withTranslation()(UserActions);
