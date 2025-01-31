import React, { useState } from "react";
import axios from "../../axiosConfig";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { use } from "react";

/**
 * Component for displaying the login form and handling its functionality.
 * @returns {JSX.Element} The Login component.
 */
function Login() {
    const [formData, setFormData] = useState({
        username: "",
        password: "",
    });
    const [errorMessage, setErrorMessage] = useState("");
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        try {
            // Trimite request-ul de login
            const response = await axios.post("/users/login", formData);
            const userId = response.data.id;
            const username = response.data.username;
    
            // Salvează userId și username în cookies (expiră în 3 ore)
            Cookies.set("userId", userId, { expires: 1 / 8 });
            Cookies.set("username", username, { expires: 1 / 8 });
    
            // Redirecționare bazată pe tipul de utilizator
            if (username.endsWith(".parent")) {
                navigate("/parent");
            } else if (username.endsWith(".stud")) {
                navigate("/stud");
            } else if (username.endsWith(".admin")) {
                navigate("/admin");
            } else if (username.endsWith(".prof")) {
                navigate("/teacher");
            } else if (username.endsWith(".chef")) {
                navigate("/chef");
            } else {
                throw new Error("Invalid username type");
            }
        } catch (error) {
            console.error("Login error:", error);
            const errorMessage =
                error.response?.data?.message || "An error occurred during login.";
            setErrorMessage(errorMessage);
        }
    };
    

    return (
        <div className="min-h-screen bg-gray-100 flex justify-center items-center">
            <div className="bg-white shadow-md rounded-xl px-8 pt-6 pb-8 mb-4">
                <h2 className="text-2xl font-semibold mb-6">Login</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label
                            className="block text-gray-700 text-sm font-bold mb-2"
                            htmlFor="username"
                        >
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
                        <label
                            className="block text-gray-700 text-sm font-bold mb-2"
                            htmlFor="password"
                        >
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
                    {errorMessage && (
                        <div className="text-red-500 mb-4">{errorMessage}</div>
                    )}
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
