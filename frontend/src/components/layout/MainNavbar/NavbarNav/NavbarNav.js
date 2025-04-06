import React from "react";
import { Nav } from "shards-react";

import Notifications from "./Notifications";
import UserActions from "./UserActions";
import Language from "./Language";


export default () => (
  <Nav navbar className="border-left flex-row h-100">
    <Notifications />
    <UserActions />
    {/* <Language /> */}
  </Nav>
);
