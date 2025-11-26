import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import api from "../utils/api";
import { formatInTimeZone } from "date-fns-tz";
import Breadcrumbs from "./Breadcrumbs";

export default function Profile() {
  const { user_id } = useParams();
  const { user: loggedInUser } = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user_id) {
      api.get(`/api/users/${user_id}`)
        .then(res => {
          setUser(res.data);
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
        });
    } else {
      setUser(loggedInUser);
      setLoading(false);
    }
  }, [user_id, loggedInUser]);

  const formatInUserTimeZone = (dateString, formatString) => {
    if (!dateString) return "N/A";
    try {
      const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      return formatInTimeZone(new Date(dateString), timeZone, formatString);
    } catch (error) {
      console.error("Failed to format date:", error);
      return "Invalid date";
    }
  };
  
  if (loading || !user) {
    return <div className="p-6 text-center">Loading profile...</div>;
  }

  const avatarUrl = user.picture_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || '')}&background=random`;

  const breadcrumbs = user_id
    ? [
        { name: "Dashboard", path: "/" },
        { name: "User Management", path: "/user-management" },
        { name: user.name },
      ]
    : [{ name: "Dashboard", path: "/" }, { name: "My Profile" }];

  return (
    <div className="space-y-6">
      <Breadcrumbs crumbs={breadcrumbs} />
      <div className="flex flex-col items-center">
        <img src={avatarUrl} alt={user.name} className="w-24 h-24 rounded-full mb-4" />
        <h2 className="text-2xl font-semibold text-slate-800">{user.name}</h2>
      </div>
      <div className="p-6 bg-slate-50 border border-slate-300 rounded-lg shadow-sm">
        <div className="space-y-2">
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Role:</strong> {user.role}</p>
          {user.department && <p><strong>Department:</strong> {user.department}</p>}
          {user.year_in_med_school && <p><strong>Year:</strong> {user.year_in_med_school}</p>}
          <p><strong>Joined:</strong> {formatInUserTimeZone(user.created_at, 'PPP')}</p>
          <p><strong>Last Seen:</strong> {formatInUserTimeZone(user.last_accessed_at, 'PPP p zzz')}</p>
        </div>
      </div>
    </div>
  );
}
