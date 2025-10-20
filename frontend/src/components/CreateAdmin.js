// src/components/CreateAdmin.js
import { useState } from 'react';

export default function CreateAdmin() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    const res = await fetch('http://localhost:4000/api/users/create-admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email })
    });
    const data = await res.json();
    if (res.ok) setMsg(`✅ Admin created: ${data.name} (${data.email})`);
    else setMsg(`❌ Error: ${data.error}`);
  }

  return (
    <div>
      <h2>Create Admin</h2>
      <form onSubmit={handleSubmit}>
        <input placeholder="Full name" value={name} onChange={e=>setName(e.target.value)} />
        <input placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
        <button type="submit">Create</button>
      </form>
      <p>{msg}</p>
    </div>
  );
}
