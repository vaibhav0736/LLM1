import { useState } from "react";
import api from "../api/axiosInstance";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [adminKey, setAdminKey] = useState(""); 
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { name, email, password };
      if (adminKey.trim() !== "") {
        payload.adminKey = adminKey;
      }

      await api.post("/auth/register", payload);
      alert("Registered successfully!");
      navigate("/");
    } catch (err) {
      alert("Registration failed: " + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <input
          type="password"
          placeholder="Admin Access Key (optional)"
          value={adminKey}
          onChange={(e) => setAdminKey(e.target.value)}
        />
        <button type="submit">Register</button>
      </form>
    </div>
  );
};

export default Register;
