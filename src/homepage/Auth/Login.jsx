import React, { useState, useEffect } from "react";
import axios from "../../axiosConfig";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";

function Login() {
    const [formData, setFormData] = useState({ username: "", password: "" });
    const [errorMessage, setErrorMessage] = useState("");
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const [redirectToDashboard, setRedirectToDashboard] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
      
        try {
          const response = await axios.post("/auth/login", formData);
          const token = response.data.token;
      
          const base64Payload = token.split('.')[1];
          const payload = JSON.parse(atob(base64Payload));
          const username = payload.sub.toLowerCase();
      
          Cookies.set("jwt-token", token, { expires: 1 / 8 });
          Cookies.set("username", username, { expires: 1 / 8 });
          
      
          // 🔁 Fă redirectul direct aici!
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
          setErrorMessage("Eroare la autentificare.");
        }
      };
      
    

    return (
        <div className="min-h-screen bg-gray-100 flex justify-center items-center">
            <div className="bg-white shadow-md rounded-xl px-8 pt-6 pb-8 mb-4">
                <h2 className="text-2xl font-semibold mb-6">Login</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
                            Username
                        </label>
                        <input
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            id="username"
                            type="text"
                            placeholder="Username"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                            Password
                        </label>
                        <input
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            id="password"
                            type="password"
                            placeholder="Password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    {errorMessage && <div className="text-red-500 mb-4">{errorMessage}</div>}
                    <div className="flex items-center justify-between">
                        <button
                            className="bg-primary hover:bg-secondary text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                            type="submit"
                        >
                            Login
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Login;
