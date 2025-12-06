import { Link , useNavigate} from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../auth/AuthProvider";
import { useToast} from "../components/Toast"

export default function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { showToast } = useToast();

  const handleLogin = async () => {
    try{
        await login({ email, password});
        showToast("Login successful", "success");
        navigate("/dashboard");
    }catch (err) {
        showToast("Invalid credentials", "error");
    }
  };

  return (
    <div className="h-screen flex items-center justify-center">
      <div className="w-80 p-6 border rounded-xl">
        <h2 className="text-2xl mb-4 text-center">Login</h2>

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
        onClick={handleLogin}
        className="w-full p-2 bg-black text-white rounded cursor-pointer">
          Login
        </button>

        <p className="mt-4 text-center text-sm">
          No account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
}
