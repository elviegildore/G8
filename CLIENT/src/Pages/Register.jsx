import React, { useState, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Register = ({ onSuccess }) => {
  const showBackButton = window.location.pathname !== "/";
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

  // ✅ Password strength validation
  useEffect(() => {
    const password = formData.password || "";
    setPasswordValidation({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    });
  }, [formData.password]);

  // ✅ Fullname validation
  const validateFullname = (value) => {
    const v = (value || "").trim();
    if (v.length < 3) return false;
    return /^[A-Za-zÀ-ÖØ-öø-ÿ'\-\s]+$/.test(v);
  };

  // ✅ Serial number validation
  const validateSerialNumber = (value) => {
    if (!value) return false;
    return /^\d{3,}$/.test(value); // must be at least 3 digits
  };

  // ✅ Silent form validity check (for disabling submit)
  const isFormValidSilent = () => {
    const required = [
      "rank",
      "fullname",
      "serial_number",
      "unit",
      "office_designation",
      "skills",
      "password",
      "confirmPassword",
    ];
    for (const f of required) {
      if (!formData[f] || formData[f].toString().trim() === "") return false;
    }
    if (!validateFullname(formData.fullname)) return false;
    if (!validateSerialNumber(formData.serial_number)) return false;
    if (formData.password !== formData.confirmPassword) return false;
    if (Object.values(passwordValidation).includes(false)) return false;
    return true;
  };

  // ✅ Check uniqueness from DB
  const checkUnique = async (field, value) => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/check-unique?field=${field}&value=${encodeURIComponent(
          value.trim()
        )}`
      );
      if (!res.ok) return true; // assume unique if API fails
      const data = await res.json();
      return data.isUnique;
    } catch (err) {
      console.error(`Error checking ${field}:`, err);
      return true; // assume unique if error
    }
  };

  // ✅ Handle field changes
  const handleChange = async (e) => {
    const { name, value } = e.target;
    let newValue = value;

    if (name === "serial_number") {
      newValue = value.replace(/\D/g, ""); // digits only
    }

    setFormData((prev) => ({ ...prev, [name]: newValue }));

    if (name === "fullname") {
      const invalid = !validateFullname(newValue);
      setFieldErrors((prev) => ({ ...prev, fullname: invalid }));
      if (!invalid && newValue.trim() !== "") {
        const unique = await checkUnique("fullname", newValue);
        if (!unique) {
          setFieldErrors((prev) => ({ ...prev, fullname: true }));
          setMessage("Fullname already exists.");
        } else {
          setMessage("");
        }
      }
    }

    if (name === "serial_number") {
      const invalid = !validateSerialNumber(newValue);
      setFieldErrors((prev) => ({ ...prev, serial_number: invalid }));
      if (!invalid && newValue.trim() !== "") {
        const unique = await checkUnique("serial_number", newValue);
        if (!unique) {
          setFieldErrors((prev) => ({ ...prev, serial_number: true }));
          setMessage("Serial number already exists.");
        } else {
          setMessage("");
        }
      }
    }

    if (name === "password" || name === "confirmPassword") {
      setFieldErrors((prev) => ({
        ...prev,
        password: false,
        confirmPassword: false,
      }));
    }
  };

  // ✅ Validate all fields before submit
  const checkAllValidAndSetErrors = () => {
    const newErrors = {};
    if (!formData.rank) newErrors.rank = true;
    if (!formData.fullname || !validateFullname(formData.fullname))
      newErrors.fullname = true;
    if (!formData.serial_number || !validateSerialNumber(formData.serial_number))
      newErrors.serial_number = true;
    if (!formData.unit) newErrors.unit = true;
    if (!formData.office_designation) newErrors.office_designation = true;
    if (!formData.skills) newErrors.skills = true;

    if (!formData.password) newErrors.password = true;
    if (formData.password !== formData.confirmPassword) {
      newErrors.password = true;
      newErrors.confirmPassword = true;
    }
    if (Object.values(passwordValidation).includes(false))
      newErrors.password = true;

    setFieldErrors((prev) => ({ ...prev, ...newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  // ✅ Handle register submit
  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!checkAllValidAndSetErrors()) {
      setMessage("Please fix the highlighted fields before submitting.");
      return;
    }

    try {
      const { confirmPassword, ...payload } = formData;
      const res = await fetch("http://localhost:5000/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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
        setFieldErrors({});
        if (onSuccess) onSuccess();
      } else {
        if (data.fieldErrors) {
          setFieldErrors((prev) => ({ ...prev, ...data.fieldErrors }));
        }
        setMessage(data.message || data.error || "Registration failed.");
      }
    } catch (err) {
      console.error(err);
      setMessage("Something went wrong: " + err.message);
    }
  };

  const isFormValid = isFormValidSilent();

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

        {message && <p className="text-center text-sm text-red-600">{message}</p>}

        <form onSubmit={handleRegister} className="space-y-3">
          {/* Rank */}
          <select
            name="rank"
            value={formData.rank}
            onChange={handleChange}
            className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#57564F] font-[Poppins] ${
              fieldErrors.rank ? "border-red-500" : ""
            }`}
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

          {/* Fullname */}
          <div>
            <input
              type="text"
              name="fullname"
              value={formData.fullname}
              onChange={handleChange}
              placeholder="Fullname"
              className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#57564F] font-[Poppins] ${
                fieldErrors.fullname ? "border-red-500" : ""
              }`}
              required
              aria-invalid={fieldErrors.fullname ? "true" : "false"}
              onBlur={() =>
                setFieldErrors((prev) => ({
                  ...prev,
                  fullname: !validateFullname(formData.fullname),
                }))
              }
            />
            {fieldErrors.fullname && (
              <p className="text-xs text-red-600 mt-1">
                Fullname is invalid or already exists.
              </p>
            )}
          </div>

          {/* Serial Number */}
          <div>
            <input
              type="text"
              inputMode="numeric"
              pattern="\d*"
              name="serial_number"
              value={formData.serial_number}
              onChange={handleChange}
              placeholder="Serial Number"
              className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#57564F] font-[Poppins] ${
                fieldErrors.serial_number ? "border-red-500" : ""
              }`}
              required
              aria-invalid={fieldErrors.serial_number ? "true" : "false"}
            />
            {fieldErrors.serial_number && (
              <p className="text-xs text-red-600 mt-1">
                Serial number is invalid or already exists.
              </p>
            )}
          </div>

          {/* Unit */}
          <select
            name="unit"
            value={formData.unit}
            onChange={handleChange}
            className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#57564F] font-[Poppins] ${
              fieldErrors.unit ? "border-red-500" : ""
            }`}
            required
          >
            <option value="">Select Unit</option>
            <option value="HHC">HHC</option>
            <option value="ESC">ESC</option>
            <option value="542ECB">542ECB</option>
            <option value="543ECB">543ECB</option>
            <option value="546ECB">546ECB</option>
            <option value="552ECB">552ECB</option>
          </select>

          {/* Office */}
          <input
            type="text"
            name="office_designation"
            value={formData.office_designation}
            onChange={handleChange}
            placeholder="Office/Unit Designation"
            className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#57564F] font-[Poppins] ${
              fieldErrors.office_designation ? "border-red-500" : ""
            }`}
            required
          />

          {/* Skills */}
          <input
            type="text"
            name="skills"
            value={formData.skills}
            onChange={handleChange}
            placeholder="Skills"
            className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#57564F] font-[Poppins] ${
              fieldErrors.skills ? "border-red-500" : ""
            }`}
            required
          />

          {/* Password */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
              className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#57564F] font-[Poppins] ${
                fieldErrors.password ? "border-red-500" : ""
              }`}
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

          {/* Confirm Password */}
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm Password"
              className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#57564F] font-[Poppins] ${
                fieldErrors.confirmPassword ? "border-red-500" : ""
              }`}
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

          {/* Password rules */}
          {formData.password && (
            <ul className="text-xs text-red-600 list-disc list-inside">
              {!passwordValidation.length && <li>At least 8 characters</li>}
              {!passwordValidation.uppercase && <li>At least 1 uppercase letter</li>}
              {!passwordValidation.number && <li>At least 1 number</li>}
              {!passwordValidation.special && <li>At least 1 special character</li>}
            </ul>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={!isFormValid}
            className={`w-full text-white p-3 rounded-md font-semibold transition duration-200 font-[Montserrat] ${
              isFormValid
                ? "bg-[#57564F] hover:bg-black"
                : "bg-gray-300 cursor-not-allowed"
            }`}
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
