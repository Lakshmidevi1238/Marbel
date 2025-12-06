import { useEffect, useState } from "react";
import * as api from "../api";
import PhysicsGlassBowl3D from "./PhysicsGlassBowl3D";

export default function MarblePanel({ date }) {
  const [allMarbles, setAllMarbles] = useState([]);

  // ✅ Fetch all marbles for the logged-in user
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

  // ✅ Reload when a task is completed
  useEffect(() => {
    const reload = () => loadMarbles();
    window.addEventListener("marbles-updated", reload);
    return () => window.removeEventListener("marbles-updated", reload);
  }, []);

  // ✅ FORMAT SELECTED DATE → YYYY-MM-DD
  const selectedDate = date
    ? new Date(date).toISOString().split("T")[0]
    : null;

  // ✅ FILTER MARBLES BY DATE (NO MORE `c` ERROR)
  const marblesForDay = selectedDate
    ? allMarbles.filter((m) => {
        if (!m.awardedAt) return false;
        return m.awardedAt.startsWith(selectedDate);
      })
    : [];

  return <PhysicsGlassBowl3D marbles={marblesForDay} />;
}
