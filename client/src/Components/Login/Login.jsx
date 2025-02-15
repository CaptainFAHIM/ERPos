import { useState } from "react";
import { motion } from "framer-motion";
import { FaUser, FaLock, FaBook } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const LoginForm = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null); // Reset error message

    try {
      const response = await axios.post("http://localhost:4000/api/users/login", {
        username,
        password,
      });

      if (response.status === 200 && response.data?.user?.role) {
        const { role } = response.data.user; // Extract role correctly

        if (role === "admin") {
          navigate("/admin");
        } else if (role === "cashier") {
          navigate("/cashier");
        } else {
          setError("Invalid role received from server.");
        }
      } else {
        setError("Unexpected response from server.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-100 via-green-200 to-green-300 relative overflow-hidden">
      {/* Animated book background */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute text-green-800 opacity-10"
          initial={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            rotate: Math.random() * 360,
          }}
          animate={{
            y: [0, -10, 0],
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            duration: 8 + Math.random() * 5,
            ease: "easeInOut",
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "reverse",
          }}
        >
          <FaBook size={30 + Math.random() * 40} />
        </motion.div>
      ))}

      {/* Login Form */}
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md p-8 bg-white bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-2xl shadow-xl"
      >
        <div className="flex items-center justify-center mb-6">
          <FaBook className="text-4xl text-green-700 mr-2" />
          <h1 className="text-3xl font-bold text-green-800">Book Palace 2</h1>
        </div>
        <h2 className="text-2xl font-bold mb-6 text-center text-green-900">Login</h2>
        
        {error && <p className="text-red-600 text-center">{error}</p>}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <FaUser className="absolute top-3 left-3 text-green-600" />
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-10 py-2 bg-green-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-green-900 placeholder-green-400"
              required
            />
          </div>
          <div className="relative">
            <FaLock className="absolute top-3 left-3 text-green-600" />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-10 py-2 bg-green-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-green-900 placeholder-green-400"
              required
            />
          </div>
          <div className="text-center text-green-800 text-sm">
            <p>Admin can change cashier's password.</p>
          </div>
          <motion.button
            type="submit"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full py-2 px-4 bg-gradient-to-r from-green-500 to-green-700 text-white font-semibold rounded-lg shadow-md hover:from-green-600 hover:to-green-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-75"
          >
            Log In
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};

export default LoginForm;
