import React from "react";
import { Nav } from "react-bootstrap";

import Notifications from "./Notifications";
import UserActions from "./UserActions";
import Language from "./Language";

const SidebarNav = () => (
  <Nav className="border-left flex-row h-100" navbar>
    <Notifications />
    <UserActions />
    {/* <Language /> */}
  </Nav>
);

export default SidebarNav;
