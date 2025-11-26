import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import Breadcrumbs from './Breadcrumbs';

export default function CreateAdmin() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await api.post('/api/users/create-admin', { name, email });
      setSuccess(`Admin account for ${name} (${email}) created successfully.`);
      setName('');
      setEmail('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create admin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs crumbs={[
        { name: "Dashboard", path: "/" },
        { name: "User Management", path: "/user-management" },
        { name: "Create Admin" }
      ]} />
      <h2 className="text-2xl font-semibold text-slate-800">Create New Admin</h2>
      <form onSubmit={handleSubmit} className="p-6 bg-slate-50 border border-slate-300 rounded-lg shadow-sm space-y-4">
        {error && <div className="p-3 bg-red-100 text-red-700 rounded-md">{error}</div>}
        {success && <div className="p-3 bg-green-100 text-green-700 rounded-md">{success}</div>}
        <div>
          <label className="text-slate-700 font-medium">Full Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full p-3 border border-slate-300 rounded-md mt-1"
          />
        </div>
        <div>
          <label className="text-slate-700 font-medium">Email Address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full p-3 border border-slate-300 rounded-md mt-1"
          />
        </div>
        <div className="flex justify-end gap-4">
          <Link to="/user-management" className="text-slate-600 hover:underline px-4 py-2">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-700 disabled:bg-slate-400 text-white py-2 px-4 rounded-md hover:bg-blue-800"
          >
            {loading ? 'Creating...' : 'Create Admin'}
          </button>
        </div>
      </form>
    </div>
  );
}
