import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownItem from 'react-bootstrap/DropdownItem';
import Nav from 'react-bootstrap/Nav';
import NavItem from 'react-bootstrap/NavItem';
import NavLink from 'react-bootstrap/NavLink';
import { useTranslation } from "react-i18next";
import avatar from "../../../../assets/images/avatars/default-avatar.png";

const UserActions = () => {
  const [visible, setVisible] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const dataUser = JSON.parse(localStorage.getItem("user"));
  const role = dataUser?.role;
  const offer = dataUser?.offer_type;
  const nameUser = dataUser?.name || "";
  const avatarUser = dataUser?.avatar;
  const img = avatar;

  const toggleUserActions = () => {
    setVisible(!visible);
  };

  const goToProfile = () => {
    navigate('/user-profile');
    
  };

  const goToReport = () => {
    navigate('/my-reports');
    
  };

  
  const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
  localStorage.setItem("user", JSON.stringify(null));
  
  window.dispatchEvent(new Event("user-updated"));
  navigate('/');

};



  return (
    <Dropdown as={NavItem} onToggle={toggleUserActions}>
      <Dropdown.Toggle as={NavLink} className="text-nowrap px-3 h-100">
        <img
          className="rounded-circle mr-2"
          style={{ width: "35px", height: "35px" }}
          src={
            avatarUser == null
              ? img
              : `${process.env.REACT_APP_BASE_URL}/static/${avatarUser}`
          }
          alt="User Avatar"
        />{" "}
        <span className="d-none d-md-inline-block">{nameUser}</span>
      </Dropdown.Toggle>

      <Dropdown.Menu align="end" show={visible}>
        <DropdownItem onClick={goToProfile}>
          <i className="material-icons">&#xE7FD;</i> {t('profile')}
        </DropdownItem>

        {offer === "2" && (
          <DropdownItem onClick={goToReport}>
            <i className="material-icons">&#xef6e;</i> {t('reports')}
          </DropdownItem>
        )}

        {role === 'ROLE_SUPPLIER' && (
          <DropdownItem as={Link} to="/my-company">
            <i className="material-icons">&#xe8d1;</i> {t('my_company')}
          </DropdownItem>
        )}

        <Dropdown.Divider />

        <DropdownItem onClick={logout} className="text-danger">
          <i className="material-icons text-danger">&#xE879;</i> {t('logout')}
        </DropdownItem>
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default UserActions;
