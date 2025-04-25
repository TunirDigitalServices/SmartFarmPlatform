import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import routes from "./routes";
import Login from "./components/auth/Login";
import Valid from "./components/auth/Valid";
import Register from "./components/auth/Register";
import ForgotPwd from "./components/auth/ForgotPwd";
import useToken from "./useToken";

import "bootstrap/dist/css/bootstrap.min.css";
import "./shards-dashboard/styles/shards-dashboards.1.1.0.min.css";
import NewPassValid from "./components/auth/NewPassValid";
import Terms from "./components/auth/Terms";
import Privacy from "./components/auth/Privacy";

export default () => {
  localStorage.setItem("RememberMe", false);
  const { token, setToken } = useToken();

  if (!token) {
    return (
      <Router>
        <Switch>
        <Route path="/Terms">
            <Terms />
          </Route>
          <Route path="/Privacy">
            <Privacy />
          </Route>
          <Route path="/Register">
            <Register setToken={setToken} />
          </Route>
          <Route path="/ForgotPwd">
            <ForgotPwd setToken={setToken}/>
          </Route>
          <Route path="/NewPassword/:ToValid">
            <NewPassValid setToken={setToken}/>
          </Route>
          <Route path="/Valid/:ToValid">
            <Valid setToken={setToken}/>
          </Route>
          <Route path="/">
            <Login setToken={setToken} />
          </Route>
        </Switch>
      </Router>
    );
  } else {
    return (
      <Router basename={process.env.REACT_APP_BASENAME || ""}>
        <div>
          {routes.map((route, index) => {
            return (
              <Route
                key={index}
                path={route.path}
                exact={route.exact}
                component={() => {
                  return (
                    <route.layout>
                      <route.component />
                    </route.layout>
                  );
                }}
              />
            );
          })}
        </div>
      </Router>
    );
  }
};
