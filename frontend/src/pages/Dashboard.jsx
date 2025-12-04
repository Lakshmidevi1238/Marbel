// src/pages/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import TaskForm from '../components/TaskForm.jsx';
import TaskList from '../components/TaskList.jsx';
import PhysicsGlassBowl3D from "../components/PhysicsGlassBowl3D.jsx";

import { useAuth } from '../auth/AuthProvider.jsx';
import { useToast } from '../components/Toast.jsx';
import * as api from '../api.js';

const logo = '/mnt/data/0e9c1eb7-05b1-4d2e-908a-3088e066d1fb.png';

export default function Dashboard() {
  const { doLogout } = useAuth();
  const toast = useToast();

  const [tasks, setTasks] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [marbles, setMarbles] = useState([]); // FRONTEND MARBLES ONLY

  async function loadAll() {
    setLoadingTasks(true);
    try {
      const t = await api.getTasks();   // only load tasks
      setTasks(t || []);
    } catch (err) {
      console.error('Failed to load dashboard data', err);
      toast.push('Failed to load data', { type: 'error' });
    } finally {
      setLoadingTasks(false);
    }
  }

  useEffect(() => { loadAll(); }, []);

  async function handleCreateTask(payload) {
    try {
      const newTask = await api.createTask(payload);
      setTasks(s => [newTask, ...s]);
      toast.push('Task created', { type: 'success' });
    } catch {
      toast.push('Failed to create task', { type: 'error' });
    }
  }

  // ✨ FRONTEND-ONLY MARBLE DELETE
  async function handleDeleteTask(id) {
    try {
      const deletedTask = tasks.find(t => t.id === id);

      await api.deleteTask(id);

      // Remove from UI
      setTasks(prev => prev.filter(t => t.id !== id));

      // Determine marble type to remove
      const marbleType =
        deletedTask.priority === "high" ? "GOLD" :
        deletedTask.priority === "medium" ? "SPECIAL" :
        "NORMAL";

      // Remove one marble with matching type
      setMarbles(prev => {
        const copy = [...prev];
        const index = copy.findIndex(m => m.type === marbleType);
        if (index !== -1) copy.splice(index, 1);
        return copy;
      });

      toast.push('Task deleted — marble removed', { type: 'success' });
    } catch {
      toast.push('Failed to delete task', { type: 'error' });
    }
  }

  // ✨ FRONTEND-ONLY MARBLE ADD
  async function handleCompleteTask(id) {
    try {
      const updated = await api.completeTask(id);

      // Update task state
      setTasks(prev =>
        prev.map(t => (t.id === id ? updated : t))
      );

      // Determine marble type
      const marbleType =
        updated.priority === "high" ? "GOLD" :
        updated.priority === "medium" ? "SPECIAL" :
        "NORMAL";

      // Add a marble
      setMarbles(prev => [
        ...prev,
        {
          id: crypto.randomUUID(),
          type: marbleType,
          style: "default",
          awardedAt: Date.now()
        }
      ]);

      toast.push("Task completed — marble awarded!", { type: "success" });
    } catch {
      toast.push('Failed to complete task', { type: 'error' });
    }
  }

  return (
    <main style={{ maxWidth: 1100, margin: '32px auto', padding: 16 }}>
      <header style={{
        display:'flex',
        alignItems:'center',
        justifyContent:'space-between'
      }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <img src={logo} alt="Mabel" style={{ height:56 }} />
          <h2>Mabel — Dashboard</h2>
        </div>
        <div>
          <button onClick={doLogout}>Logout</button>
        </div>
      </header>

      <section style={{
        display:'grid',
        gridTemplateColumns:'1fr 360px',
        gap:20,
        marginTop:18
      }}>
        <div>
          <TaskForm onCreate={handleCreateTask} />
          <hr style={{ margin:'16px 0' }} />

          {loadingTasks
            ? <div>Loading tasks…</div>
            : <TaskList
                tasks={tasks}
                onDelete={handleDeleteTask}
                onComplete={handleCompleteTask}
              />
          }
        </div>

        <aside>
          <PhysicsGlassBowl3D marbles={marbles} />
        </aside>

      </section>
    </main>
  );
}
