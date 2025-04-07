import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import Cookies from "js-cookie";

const ProtectedRoute = ({ children }) => {
  const [isValid, setIsValid] = useState(null);

  useEffect(() => {
    const token = Cookies.get("jwt-token");

    if (!token) {
      setIsValid(false);
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const now = Math.floor(Date.now() / 1000);

      if (payload.exp < now) {
        Cookies.remove("jwt-token");
        Cookies.remove("username");
        setIsValid(false);
      } else {
        setIsValid(true);
      }
    } catch (err) {
      Cookies.remove("jwt-token");
      Cookies.remove("username");
      setIsValid(false);
    }
  }, []);

  if (isValid === null) {
    return null; // sau un loader
  }

  return isValid ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
