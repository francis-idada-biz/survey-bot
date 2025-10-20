// src/components/Register.js
import { useState } from 'react';

export default function Register() {
  const params = new URLSearchParams(window.location.search);
  const token = params.get('token');
  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [year, setYear] = useState('');
  const [department, setDepartment] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    const res = await fetch(`http://localhost:4000/api/register?token=${token}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, dob, year_in_med_school: year, department, password })
    });
    const data = await res.json();
    if (res.ok) setMsg('✅ Registration successful, you can now log in.');
    else setMsg(`❌ Error: ${data.error}`);
  }

  return (
    <div>
      <h2>Complete Registration</h2>
      <form onSubmit={handleSubmit}>
        <input placeholder="Full Name" value={name} onChange={e=>setName(e.target.value)} />
        <input type="date" value={dob} onChange={e=>setDob(e.target.value)} />
        <input placeholder="Year in Med School" value={year} onChange={e=>setYear(e.target.value)} />
        <input placeholder="Department" value={department} onChange={e=>setDepartment(e.target.value)} />
        <input type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} />
        <button type="submit">Register</button>
      </form>
      <p>{msg}</p>
    </div>
  );
}
