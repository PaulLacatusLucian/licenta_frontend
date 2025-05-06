import React, { useState } from "react";
import axios from "../../axiosConfig";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { FaUserAlt, FaLock, FaSignInAlt, FaSchool } from "react-icons/fa";
import logo from "../../assets/logo.png";

function Login() {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrorMessage("");
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await axios.post("/auth/login", formData);
      const token = response.data.token;

      const base64Payload = token.split('.')[1];
      const payload = JSON.parse(atob(base64Payload));
      const username = payload.sub.toLowerCase();

      Cookies.set("jwt-token", token, { expires: 1 / 8 });
      Cookies.set("username", username, { expires: 1 / 8 });

      // Redirect based on user role
      if (username.endsWith(".parent")) {
        navigate("/parent");
      } else if (username.endsWith(".student")) {
        navigate("/stud");
      } else if (username.endsWith(".admin")) {
        navigate("/admin");
      } else if (username.endsWith(".prof")) {
        navigate("/teacher");
      } else if (username.endsWith(".chef")) {
        navigate("/chef");
      } else {
        throw new Error("Rol necunoscut.");
      }
    } catch (error) {
      console.error("Login error:", error);
      
      // Check for specific error message patterns
      const errorMsg = error.response?.data?.message || "";
      
      if (errorMsg.includes("null") && errorMsg.includes("getPassword")) {
        // User not found in database
        setErrorMessage("Utilizatorul nu există în sistem. Verificați numele de utilizator.");
      } else if (error.response && error.response.status === 401) {
        // Authentication failed
        setErrorMessage("Nume de utilizator sau parolă greșită. Vă rugăm să încercați din nou.");
      } else if (errorMsg) {
        // Use server provided message
        setErrorMessage(errorMsg);
      } else {
        // Default error message
        setErrorMessage("Eroare la autentificare. Verificați numele de utilizator și parola.");
      }
      
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary to-secondary">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-64 h-64 bg-white opacity-5 rounded-full"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-white opacity-5 rounded-full"></div>
        <div className="absolute top-1/3 right-1/4 w-40 h-40 bg-white opacity-5 rounded-full"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Card */}
        <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary opacity-90"></div>
            <div className="relative p-8 text-center">
              <div className="w-24 h-24 bg-white rounded-full mx-auto flex items-center justify-center shadow-xl border-4 border-white">
                <img 
                  src={logo} 
                  alt="School Logo" 
                  className="w-18 h-18 object-contain" 
                />
              </div>
              <h1 className="text-dark text-3xl font-bold mt-6">Bine ați venit</h1>
              <p className="text-dark2 mt-2">Conectați-vă pentru a accesa portalul școlii</p>
            </div>
            
            {/* Wave divider */}
            <div className="absolute -bottom-1 left-0 right-0">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 120">
                <path fill="#ffffff" fillOpacity="1" d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"></path>
              </svg>
            </div>
          </div>

          {/* Form */}
          <div className="px-8 py-10 pt-2">
            <div className="flex items-center justify-center mb-6">
              <div className="h-1 flex-1 bg-gray-100 rounded-full"></div>
              <span className="px-4 text-gray-500 font-medium">Autentificare</span>
              <div className="h-1 flex-1 bg-gray-100 rounded-full"></div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center" htmlFor="username">
                  <FaUserAlt className="w-4 h-4 mr-2 text-primary" />
                  Nume de utilizator
                </label>
                <div className="relative">
                  <input
                    className="w-full px-4 py-3 bg-light border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                    id="username"
                    type="text"
                    placeholder="Introduceți numele de utilizator"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    autoComplete="username"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center" htmlFor="password">
                  <FaLock className="w-4 h-4 mr-2 text-primary" />
                  Parolă
                </label>
                <div className="relative">
                  <input
                    className="w-full px-4 py-3 bg-light border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Introduceți parola"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    onClick={togglePasswordVisibility}
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                        <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {errorMessage && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm flex items-start border border-red-100">
                  <svg className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  className={`w-full flex items-center justify-center bg-gradient-to-r from-primary to-secondary text-dark font-medium py-3 px-4 rounded-xl hover:opacity-95 focus:ring-2 focus:ring-secondary focus:ring-offset-2 transition-all shadow-md ${
                    isLoading ? "opacity-80 cursor-not-allowed" : ""
                  }`}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-dark" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Se încarcă...
                    </>
                  ) : (
                    <>
                      <FaSignInAlt className="mr-2" />
                      Conectare
                    </>
                  )}
                </button>
              </div>
            </form>

            <div className="mt-8 text-center space-y-2">
              <div className="flex items-center justify-center space-x-2">
                <FaSchool className="text-primary" />
                <span className="text-sm font-semibold text-gray-700">Portal Școlar</span>
              </div>
              <p className="text-xs text-gray-500">
                Probleme cu autentificarea? Contactați administratorul școlii.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-white/80 text-sm">
          © {new Date().getFullYear()} Liceul Teoretic German "Johann Ettinger". Toate drepturile rezervate.
        </div>
      </div>
    </div>
  );
}

export default Login;