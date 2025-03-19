import { useState } from "react";

export default function useToken() {
  var param = true;
  const getToken = () => {
    var tokenString = "";
    if (param == true) {
      tokenString = localStorage.getItem("token");
    } else {
      tokenString = sessionStorage.getItem("token");
    }

    const userToken = JSON.parse(tokenString);
    if (userToken) {
      return userToken.token;
    } else {
      return null;
    }
  };

  const [token, setToken] = useState(getToken());

  const saveToken = userToken => {
    if (param == true) {
      localStorage.setItem("token", JSON.stringify(userToken));
    } else {
      sessionStorage.setItem("token", JSON.stringify(userToken));
    }

    setToken(userToken.token);
  };

  return {
    setToken: saveToken,
    token
  };
}
