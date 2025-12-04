// src/components/MarbleInventory.jsx
import React from 'react';

export default function MarbleInventory({ marbles = [], inventory = { normal:0, gold:0, special:0 } }) {
  return (
    <div style={{ border:'1px solid #eee', padding:12, borderRadius:8 }}>
      <h3>Marbles</h3>
      <div style={{ display:'flex', gap:12, marginBottom:8 }}>
        <div><div style={{ fontSize:20 }}>{inventory.normal}</div><div className="small">Normal</div></div>
        <div><div style={{ fontSize:20 }}>{inventory.gold}</div><div className="small">Gold</div></div>
        <div><div style={{ fontSize:20 }}>{inventory.special}</div><div className="small">Special</div></div>
      </div>

      <details>
        <summary>All marbles ({marbles.length})</summary>
        <ul style={{ marginTop:8 }}>
          {marbles.map(m => (
            <li key={m.id}>
              {m.type?.toLowerCase()} — style: {m.style} — awarded: {new Date(m.awardedAt).toLocaleString()}
            </li>
          ))}
        </ul>
      </details>
    </div>
  );
}
