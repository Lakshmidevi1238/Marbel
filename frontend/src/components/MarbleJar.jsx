// src/components/MarbleJar.jsx
import React from "react";
import "../pages/MarbleJar.css";

export default function MarbleJar({ marbles = [], inventory = { normal: 0, gold: 0, special: 0 } }) {
  const maxPerRow = 8;      // how many marbles per row
  const spacing = 26;       // px between marbles
  const baseLeft = 18;      // starting left offset
  const baseBottom = 14;    // starting bottom offset

  return (
    <div className="jar-card">
      <h3 className="jar-title">Marbles</h3>

      <div className="jar-wrapper">
        <div className="jar-bowl">
          {marbles.map((m, index) => {
            const col = index % maxPerRow;
            const row = Math.floor(index / maxPerRow);
            const left = baseLeft + col * spacing;
            const bottom = baseBottom + row * spacing;

            let typeClass = "marble-normal";
            if (m.type === "GOLD") typeClass = "marble-gold";
            if (m.type === "SPECIAL") typeClass = "marble-special";

            return (
              <div
                key={m.id}
                className={`jar-marble ${typeClass}`}
                style={{
                  left: `${left}px`,
                  bottom: `${bottom}px`,
                  animationDelay: `${index * 0.05}s`,
                }}
                title={`${m.type?.toLowerCase()} marble`}
              />
            );
          })}
        </div>
      </div>

      <div className="jar-counts">
        <div>
          <div className="jar-count-number">{inventory.normal}</div>
          <div className="small">Normal</div>
        </div>
        <div>
          <div className="jar-count-number">{inventory.gold}</div>
          <div className="small">Gold</div>
        </div>
        <div>
          <div className="jar-count-number">{inventory.special}</div>
          <div className="small">Special</div>
        </div>
      </div>

      <div className="jar-total small">
        Total marbles: {marbles.length}
      </div>
    </div>
  );
}

