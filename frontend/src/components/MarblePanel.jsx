import { useEffect, useState } from "react";
import * as api from "../api";
import PhysicsGlassBowl3D from "./PhysicsGlassBowl3D";

// ✅ SAFE LOCAL YYYY-MM-DD FORMATTER
function toLocalYMD(date) {
  const d = new Date(date);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export default function MarblePanel({ date }) {
  const [allMarbles, setAllMarbles] = useState([]);

  // ✅ LOAD MARBLES
  const loadMarbles = async () => {
    try {
      const data = await api.getMarbles();
      setAllMarbles(data);
    } catch (err) {
      console.error("Marble load failed", err);
    }
  };

  useEffect(() => {
    loadMarbles();
  }, []);

  // ✅ RELOAD WHEN TASK COMPLETES
  useEffect(() => {
    const reload = () => loadMarbles();
    window.addEventListener("marbles-updated", reload);
    return () => window.removeEventListener("marbles-updated", reload);
  }, []);

  // ✅ USE LOCAL DATE — NOT UTC
  const selectedDate = date ? toLocalYMD(date) : null;

  // ✅ FILTER CORRECTLY BY LOCAL DATE
  const marblesForDay = selectedDate
    ? allMarbles.filter((m) => {
        if (!m.awardedAt) return false;
        const marbleDate = toLocalYMD(m.awardedAt);
        return marbleDate === selectedDate;
      })
    : [];

  return <PhysicsGlassBowl3D marbles={marblesForDay} />;
}
