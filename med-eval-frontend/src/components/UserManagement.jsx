import React, { useState, useEffect } from "react";
import api from "../utils/api";
import { useAuth } from "../hooks/useAuth";
import { Link } from "react-router-dom";
import Breadcrumbs from "./Breadcrumbs";

export default function UserManagement() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/users");
      // Filter out the current user from the list
      const filteredUsers = res.data.users.filter(user => user.user_id !== currentUser.id);
      setUsers(filteredUsers);
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch users.");
      setLoading(false);
    }
  };

  const handleDelete = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      try {
        await api.delete(`/api/users/${userId}`);
        setUsers(users.filter((user) => user.user_id !== userId));
      } catch (err) {
        alert("Failed to delete user.");
      }
    }
  };

  if (loading) return <div className="p-6 text-center">Loading users...</div>;
  if (error) return <div className="p-6 text-center text-red-600">{error}</div>;

  return (
    <div className="space-y-6">
      <Breadcrumbs crumbs={[{ name: "Dashboard", path: "/" }, { name: "User Management" }]} />
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-slate-800">User Management</h2>
        <Link to="/create-admin" className="bg-blue-700 text-white px-4 py-2 rounded-md hover:bg-blue-800">
          Create New Admin
        </Link>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-slate-300">
          <thead>
            <tr className="bg-slate-50">
              <th className="py-3 px-6 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Name</th>
              <th className="py-3 px-6 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Email</th>
              <th className="py-3 px-6 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Role</th>
              <th className="py-3 px-6 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {users.map((user) => (
              <tr key={user.user_id}>
                <td className="py-4 px-6 whitespace-nowrap">
                  <Link to={`/profile/${user.user_id}`} className="text-blue-600 hover:underline">
                    {user.name}
                  </Link>
                </td>
                <td className="py-4 px-6 whitespace-nowrap">{user.email}</td>
                <td className="py-4 px-6 whitespace-nowrap">{user.role}</td>
                <td className="py-4 px-6 whitespace-nowrap text-right">
                  <button
                    onClick={() => handleDelete(user.user_id)}
                    className="text-red-600 hover:text-red-900 font-medium"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
