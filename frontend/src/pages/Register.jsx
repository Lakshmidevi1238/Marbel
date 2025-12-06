import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../auth/AuthProvider";
import { useToast } from "../components/Toast";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { showToast } = useToast();

  const handleRegister = async () => {
    try {
      await register({ name, email, password });
      showToast("Reistered", "success");
      navigate("/");
    } catch (err) {
      showToast("Registration failed", "error");
    }
  };

  return (
    <div className="h-screen flex items-center justify-center">
      <div className="w-80 p-6 border rounded-xl">
        <h2 className="text-2xl mb-4 text-center">Register</h2>

        <input
          type="text"
          placeholder="Name"
          className="w-full p-2 mb-3 border rounded"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          type="email"
          placeholder="Email"
          className="w-full p-2 mb-3 border rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full p-2 mb-4 border rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleRegister}
          className="w-full p-2 bg-black text-white rounded cursor-pointer"
        >
          Register
        </button>

        <p className="mt-4 text-center text-sm">
          Already have an account? <Link to="/">Login</Link>
        </p>
      </div>
    </div>
  );
}
