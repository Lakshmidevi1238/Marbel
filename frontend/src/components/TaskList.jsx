// src/components/TaskList.jsx
import React from 'react';
import TaskItem from './TaskItem.jsx';

export default function TaskList({ tasks = [], onDelete, onComplete }) {
  if (!tasks.length) return <div>No tasks yet. Add your first task!</div>;
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
      {tasks.map(task => (
        <TaskItem
          key={task.id}
          task={task}
          onDelete={() => onDelete(task.id)}
          onComplete={() => onComplete(task.id)}
        />
      ))}
    </div>
  );
}
