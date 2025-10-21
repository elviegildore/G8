import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useUser } from "../Context/UserContext.jsx";

const Login = () => {
  const { login } = useUser(); // context login
  const navigate = useNavigate();
  const location = useLocation();
  const showBackButton = location.pathname !== "/";

  const [formData, setFormData] = useState({
    fullname: "",
    serial_number: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [passwordValidation, setPasswordValidation] = useState({
    length: false,
    uppercase: false,
    number: false,
    special: false,
  });
  const [message, setMessage] = useState("");

  useEffect(() => {
    const password = formData.password;
    setPasswordValidation({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    });
  }, [formData.password]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");

    if (
      !passwordValidation.length ||
      !passwordValidation.uppercase ||
      !passwordValidation.number ||
      !passwordValidation.special
    ) {
      setMessage(
        "Password must meet requirements: 8+ chars, 1 uppercase, 1 number, 1 special"
      );
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        // ✅ update context with full user object
        login({
          fullname: data.user.fullname,
          serial_number: data.user.serial_number,
          role: data.user.role,
        });

        // Redirect based on role
        if (data.user.role === "admin") {
          navigate("/admindashboard");
        } else {
          navigate("/userdashboard");
        }
      } else {
        setMessage(data.message || "Login failed. Check your credentials.");
      }
    } catch (err) {
      console.error(err);
      setMessage("Something went wrong: " + err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 space-y-4">
        {showBackButton && (
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="text-black mb-2"
          >
            ← Back
          </button>
        )}

        <h2 className="text-2xl font-bold text-center text-gray-800 font-[Montserrat]">
          Login
        </h2>

        {message && <p className="text-red-600 text-center text-sm">{message}</p>}

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="text"
            name="fullname"
            value={formData.fullname}
            onChange={handleChange}
            placeholder="Fullname"
            className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#57564F] font-[Poppins]"
            required
          />

          <input
            type="number"
            name="serial_number"
            value={formData.serial_number}
            onChange={handleChange}
            placeholder="Serial Number"
            className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#57564F] font-[Poppins]"
            required
          />

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
              className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#57564F] font-[Poppins]"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-[#57564F]"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {formData.password && (
            <ul className="text-xs text-red-600 list-disc list-inside">
              {!passwordValidation.length && <li>At least 8 characters</li>}
              {!passwordValidation.uppercase && <li>At least 1 uppercase letter</li>}
              {!passwordValidation.number && <li>At least 1 number</li>}
              {!passwordValidation.special && <li>At least 1 special character</li>}
            </ul>
          )}

          <button
            type="submit"
            className="w-full bg-[#6a6a63] text-white p-3 rounded-md font-semibold hover:bg-[#4f4e4b] transition duration-200 font-[Montserrat]"
          >
            Login
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 font-[Montserrat]">
          Don't have an account?{" "}
          <span
            onClick={() => navigate("/register")}
            className="text-[#57564F] hover:underline cursor-pointer"
          >
            Register
          </span>
        </p>
      </div>
    </div>
  );
};

export default Login;
