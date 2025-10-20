// src/components/InviteUser.js
import { useState } from 'react';

export default function InviteUser() {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('evaluator');
  const [msg, setMsg] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    const res = await fetch('http://localhost:4000/api/invitations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, role })
    });
    const data = await res.json();
    if (res.ok) setMsg(`✅ Invite sent. Link: http://localhost:3000/register?token=${data.token}`);
    else setMsg(`❌ Error: ${data.error}`);
  }

  return (
    <div>
      <h2>Invite User</h2>
      <form onSubmit={handleSubmit}>
        <input placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
        <select value={role} onChange={e=>setRole(e.target.value)}>
          <option value="evaluator">Evaluator</option>
          <option value="student">Student</option>
        </select>
        <button type="submit">Send Invite</button>
      </form>
      <p>{msg}</p>
    </div>
  );
}
