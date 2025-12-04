// src/components/TaskForm.jsx
import React, { useState } from 'react';

export default function TaskForm({ onCreate }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    if (!title.trim()) return;
    setBusy(true);
    try {
      await onCreate({ title: title.trim(), description: description.trim(), priority });
      setTitle(''); setDescription(''); setPriority('medium');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} style={{ display:'grid', gap:8 }}>
      <h3>Create Task</h3>
      <input placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} required />
      <textarea placeholder="Description (optional)" value={description} onChange={e => setDescription(e.target.value)} rows={3} />
      <label style={{ display:'flex', gap:8, alignItems:'center' }}>
        <span style={{ minWidth:60 }}>Priority</span>
        <select value={priority} onChange={e => setPriority(e.target.value)}>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </label>
      <div>
        <button type="submit" disabled={busy}>{busy ? 'Creating...' : 'Create Task'}</button>
      </div>
    </form>
  );
}
