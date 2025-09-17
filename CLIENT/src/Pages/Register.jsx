import { useState, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Register = ({ onSuccess }) => {
  const showBackButton = location.pathname !== "/";

  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    rank: "",
    fullname: "",
    serial_number: "",
    unit: "",
    office_designation: "",
    skills: "",
    password: "",
    confirmPassword: "",
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordValidation, setPasswordValidation] = useState({
    length: false,
    uppercase: false,
    number: false,
    special: false,
  });

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
    setFieldErrors({ ...fieldErrors, [e.target.name]: false });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage("");
    setFieldErrors({});

    if (formData.password !== formData.confirmPassword) {
      setFieldErrors({ password: true, confirmPassword: true });
      return;
    }

    if (
      !passwordValidation.length ||
      !passwordValidation.uppercase ||
      !passwordValidation.number ||
      !passwordValidation.special
    ) {
      setFieldErrors({ password: true });
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, confirmPassword: undefined }),
      });
      const data = await res.json();

      if (res.ok) {
        setMessage("✅ Registration successful! You can now log in.");
        setFormData({
          rank: "",
          fullname: "",
          serial_number: "",
          unit: "",
          office_designation: "",
          skills: "",
          password: "",
          confirmPassword: "",
        });
      } else {
        if (data.fieldErrors) setFieldErrors(data.fieldErrors);
      }
    } catch (err) {
      console.error(err);
      setMessage("Something went wrong: " + err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 p-30">
      <div className="w-full max-w-lg bg-white rounded-xl shadow-lg p-10 space-y-4">

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
          Register
        </h2>

        {message && <p className="text-green-500 text-center">{message}</p>}

        <form onSubmit={handleRegister} className="space-y-3">
          <select
            name="rank"
            value={formData.rank}
            onChange={handleChange}
            className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#57564F] font-[Poppins]"
            required
          >
            <option value="">Select Rank</option>
            <option value="BGEN">BGEN</option>
            <option value="COL">COL</option>
            <option value="LTC">LTC</option>
            <option value="MAJ">MAJ</option>
            <option value="CPT">CPT</option>
            <option value="1LT">1LT</option>
            <option value="2LT">2LT</option>
            <option value="CMS">CMS</option>
            <option value="SMS">SMS</option>
            <option value="MSG">MSG</option>
            <option value="TSG">TSG</option>
            <option value="SSG">SSG</option>
            <option value="SGT">SGT</option>
            <option value="CPL">CPL</option>
            <option value="PFC">PFC</option>
            <option value="PVT">PVT</option>
          </select>

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
            required/>
 
          <select 
            name="unit"
            value={formData.unit}
            onChange={handleChange}
            className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#57564F] font-[Poppins]"
            required>
            
            <option value="">Select Unit</option>
            <option value="HHC">HHC</option>
            <option value="ESC">ESC</option>
            <option value="542ECB">542ECB</option>
            <option value="543ECB">543ECB</option>
            <option value="546ECB">546ECB</option>
            <option value="552ECB">552ECB</option>
            </select>
          

          <input
            type="text"
            name="office_designation"
            value={formData.office_designation}
            onChange={handleChange}
            placeholder="Office/Unit Designation"
            className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#57564F] font-[Poppins]"
            required
          />

          <input
            type="text"
            name="skills"
            value={formData.skills}
            onChange={handleChange}
            placeholder="Skills"
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
              className="absolute right-3 top-3 text-gray-600"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm Password"
              className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#57564F] font-[Poppins]"
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-3 text-gray-600"
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
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
            className="w-full bg-[#57564F] text-white p-3 rounded-md font-semibold hover:bg-black transition duration-200 font-[Montserrat]"
          >
            Register
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 font-[Montserrat]">
          Already have an account?{" "}
          <span
            onClick={() => navigate("/login")}
            className="text-[#57564F] hover:underline cursor-pointer"
          >
            Login
          </span>
        </p>
      </div>
    </div>
  );
};

export default Register;
