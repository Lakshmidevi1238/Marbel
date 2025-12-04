// src/components/TaskItem.jsx
import React from 'react';

export default function TaskItem({ task, onDelete, onComplete }) {
  // When user requests delete, show explicit confirmation explaining marbles are permanent
  function handleDeleteClick() {
    // Custom message clarifying behavior
    const msg = `Are you sure you want to delete the task "${task.title}"?\n\n` +
                `Note: Deleting this task will NOT remove any marbles previously awarded for it. ` +
                `If you want to remove associated marbles, use the Marbles inventory page (if deletion is supported).`;

    if (window.confirm(msg)) {
      onDelete();
    }
  }

  return (
    <div style={{
      border: '1px solid #eee', padding:12, borderRadius:8, display:'flex', justifyContent:'space-between', alignItems:'center'
    }}>
      <div>
        <div style={{ display:'flex', gap:8, alignItems:'center' }}>
          <strong>{task.title}</strong>
          {task.priority && <span style={{ fontSize:12, color:'#666', padding:'4px 8px', borderRadius:6, background:'#f3f6ff' }}>{task.priority}</span>}
          {task.completed && <span style={{ fontSize:12, color:'green', marginLeft:8 }}>Completed</span>}
        </div>
        {task.description && <div style={{ marginTop:6, color:'#444' }}>{task.description}</div>}
        {/* show provenance if available */}
        {task.awardedMarbleId && (
          <div style={{ marginTop:6, fontSize:12, color:'#555' }}>
            Awarded marble: #{task.awardedMarbleId}
          </div>
        )}
      </div>

      <div style={{ display:'flex', gap:8 }}>
        {!task.completed && <button onClick={onComplete}>Complete</button>}
        <button onClick={handleDeleteClick} style={{ background:'#ff6b6b', color:'#fff' }}>Delete</button>
      </div>
    </div>
  );
}
