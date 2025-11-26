import React, { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import api from "../utils/api";

export default function Register() {
  const [searchParams] = useSearchParams();
  const [token, setToken] = useState(null);
  const [formData, setFormData] = useState({
    email: "",
    role: "",
    name: "",
    year_in_med_school: "",
    department: "",
    password: "",
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);

  useEffect(() => {
    const t = searchParams.get("token");
    if (!t) {
      setError("No invitation token provided.");
      setLoading(false);
      return;
    }
    setToken(t);
    api.get(`/api/auth/verify-invite/${t}`)
      .then((res) => {
        setFormData((prev) => ({
          ...prev,
          email: res.data.email,
          role: res.data.role,
        }));
        setLoading(false);
      })
      .catch((err) => {
        setError(err.response?.data?.error || "Invalid token.");
        setLoading(false);
      });
  }, [searchParams]);
  
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await api.post("/api/auth/register", { ...formData, token });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-6 text-center">Verifying invitation...</div>;
  }

  // Handle case where token is invalid from the start
  if (error && !formData.email) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-md text-center space-y-4 text-slate-900">
        <h2 className="text-2xl font-semibold text-red-600">Error</h2>
        <p className="text-slate-700">{error}</p>
        <Link to="/" className="inline-block bg-blue-700 text-white px-5 py-3 rounded-md hover:bg-blue-800">
          Go Home
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="p-6 text-center space-y-4 text-slate-900">
        <h2 className="text-2xl font-semibold text-green-600">Registration Successful!</h2>
        <p className="text-slate-700">Thank you for registering. Here are the details you provided:</p>
        <div className="p-4 bg-slate-100 rounded-md text-left">
          <p><strong>Name:</strong> {formData.name}</p>
          <p><strong>Email:</strong> {formData.email}</p>
          <p><strong>Role:</strong> {formData.role}</p>
          {formData.role === 'student' && <p><strong>Year:</strong> {formData.year_in_med_school}</p>}
          {formData.role === 'evaluator' && <p><strong>Department:</strong> {formData.department}</p>}
        </div>
        <Link to="/login" className="inline-block bg-blue-700 text-white px-5 py-3 rounded-md hover:bg-blue-800">
          Proceed to Login
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-slate-800">Register</h2>
      <form
        onSubmit={handleSubmit}
        className="p-6 bg-slate-50 border border-slate-300 rounded-lg shadow-sm space-y-4 text-slate-900"
      >
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Error:</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
        )}
        <div>
          <label className="text-slate-700 font-medium">Email</label>
          <input type="email" value={formData.email} disabled className="w-full p-3 bg-slate-200 border border-slate-300 rounded-md mt-1" />
        </div>
        <div>
          <label className="text-slate-700 font-medium">Role</label>
          <input type="text" value={formData.role} disabled className="w-full p-3 bg-slate-200 border border-slate-300 rounded-md mt-1" />
        </div>
        <div>
          <label className="text-slate-700 font-medium">Full Name</label>
          <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full p-3 border border-slate-300 rounded-md mt-1" />
        </div>
        <div>
          <label className="text-slate-700 font-medium">Password</label>
          <div className="relative mt-1">
            <input
              type={passwordVisible ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full p-3 border border-slate-300 rounded-md"
            />
            <button
              type="button"
              onClick={() => setPasswordVisible(!passwordVisible)}
              className="absolute inset-y-0 right-0 px-4 py-2 m-1 bg-slate-200 rounded-md text-sm font-medium text-slate-600 hover:text-slate-900 z-10"
            >
              {passwordVisible ? "Hide" : "Show"}
            </button>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Password must be at least 8 characters long and contain an uppercase letter, a number, and a special character (!@#$%^&*).
          </p>
        </div>
        
        {formData.role === 'student' && (
          <div>
            <label className="text-slate-700 font-medium">Year in Medical School</label>
            <select name="year_in_med_school" value={formData.year_in_med_school} onChange={handleChange} required className="w-full p-3 border border-slate-300 rounded-md mt-1 bg-white">
              <option value="">-- Select Year --</option>
              <option value="1">First year</option>
              <option value="2">Second year</option>
              <option value="3">Third year</option>
              <option value="4">Fourth year</option>
            </select>
          </div>
        )}

        {formData.role === 'evaluator' && (
          <div>
            <label className="text-slate-700 font-medium">Department</label>
            <select name="department" value={formData.department} onChange={handleChange} required className="w-full p-3 border border-slate-300 rounded-md mt-1 bg-white">
              <option value="">-- Select Department --</option>
              <option value="Pediatric Emergency Department">Pediatric Emergency Department</option>
              <option value="Pediatrics Inpatient">Pediatrics Inpatient</option>
              <option value="Pediatrics Clinic">Pediatrics Clinic</option>
              <option value="Pediatrics Subspecialty">Pediatrics Subspecialty</option>
              <option value="Anesthesia">Anesthesia</option>
            </select>
          </div>
        )}

        <button type="submit" disabled={loading} className="w-full bg-blue-700 disabled:bg-slate-400 text-white py-3 rounded-md hover:bg-blue-800">
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>
    </div>
  );
}
