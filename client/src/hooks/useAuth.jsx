import { useState, useEffect } from "react";

/**
 * Mock Authentication Hook
 * Replaces @kinde-oss/kinde-auth-react useKindeAuth
 */
export const useAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  const user = {
    id: "cm1234567890guest",
    email: "guest@dailytm.app",
    name: "",
    given_name: "",
    family_name: "",
    picture: null,
  };

  const loginWithRedirect = () => {
    console.log("Mock Login Redirect triggered");
    window.location.href = "/dashboard";
  };

  const registerWithRedirect = () => {
    console.log("Mock Register Redirect triggered");
    window.location.href = "/dashboard";
  };

  const logout = () => {
    console.log("Mock Logout triggered");
    // Redirect to home
    window.location.href = "/";
  };

  const getToken = async () => "mock-token";

  return {
    isAuthenticated,
    isLoading,
    user,
    login: loginWithRedirect,
    register: registerWithRedirect,
    loginWithRedirect,
    registerWithRedirect,
    logout,
    getToken,
  };
};
