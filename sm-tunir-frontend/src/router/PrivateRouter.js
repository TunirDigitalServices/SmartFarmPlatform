
import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ component: Component, user, roles }) => {
  if (user && roles.includes(user.role)) {
    return Component;
  } else {
    return <Navigate to="/" />;
  }
};

export default PrivateRoute;
