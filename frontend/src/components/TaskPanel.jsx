import { useEffect, useMemo, useState } from "react";
import * as api from "../api";

// ✅ CORRECT LOCAL DATE FORMAT (MATCHES BACKEND)
function toYMDLocal(date) {
  const d = new Date(date);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export default function TaskPanel({ date }) {
  const [allTasks, setAllTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [priority, setPriority] = useState("medium");

  const selectedDate = toYMDLocal(date);

  // ✅ ALWAYS LOAD FROM BACKEND
  const loadTasks = async () => {
    try {
      const data = await api.getTasks();
      setAllTasks(data);
    } catch (err) {
      console.error("Task load failed:", err);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  // ✅ PERFECT DATE FILTER
  const tasksForThisDay = useMemo(() => {
    return allTasks.filter(
      (task) => task.dueDate === selectedDate
    );
  }, [allTasks, selectedDate]);

  // ✅ ADD TASK
  const handleAdd = async () => {
    if (!newTask.trim()) return;

    await api.createTask({
      title: newTask,
      description: "",
      priority,
      dueDate: selectedDate,
    });

    setNewTask("");
    setPriority("medium");
    loadTasks(); // ✅ FORCE REFRESH
  };

  // ✅ COMPLETE TASK
  const handleComplete = async (id) => {
    await api.completeTask(id);
    loadTasks();
    window.dispatchEvent(new Event("marbles-updated"));
  };

  // ✅ DELETE TASK
  const handleDelete = async (id) => {
    await api.deleteTask(id);
    loadTasks();
  };

  return (
    <div className="flex flex-col h-full">

      {/* INPUT */}
      <div className="flex gap-2 mb-2">
        <input
          type="text"
          placeholder="Add new task..."
          className="w-full p-2 border rounded"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
        />
        <button
          onClick={handleAdd}
          className="px-3 py-2 bg-black text-white rounded text-sm"
        >
          Add
        </button>
      </div>

      {/* PRIORITY */}
      <div className="flex gap-2 mb-3 text-xs">
        {["high", "medium", "low"].map((p) => (
          <button
            key={p}
            onClick={() => setPriority(p)}
            className={`px-3 py-1 rounded border ${
              priority === p
                ? p === "high"
                  ? "bg-red-600 text-white"
                  : p === "medium"
                  ? "bg-yellow-500 text-white"
                  : "bg-green-600 text-white"
                : "bg-white"
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      {/* TASK LIST */}
      <div className="flex-1 overflow-y-auto pr-1">
        {tasksForThisDay.length === 0 && (
          <p className="text-sm text-gray-400">No tasks for this day.</p>
        )}

        {tasksForThisDay.map((task) => (
          <div
            key={task.id}
            className="flex items-center justify-between gap-2 mb-2"
          >
            <span className={`text-sm ${task.completed ? "line-through text-gray-400" : "text-gray-800"}`}>
              {task.title}
            </span>

            <span
              className={`text-[10px] px-2 py-[2px] rounded ${
                task.priority === "high"
                  ? "bg-red-600 text-white"
                  : task.priority === "medium"
                  ? "bg-yellow-500 text-white"
                  : "bg-green-600 text-white"
              }`}
            >
              {task.priority}
            </span>

            <div className="flex gap-1 text-xs">
              {!task.completed && (
                <button
                  onClick={() => handleComplete(task.id)}
                  className="px-2 py-1 bg-blue-600 text-white rounded"
                >
                  Done
                </button>
              )}

              <button
                onClick={() => handleDelete(task.id)}
                className="px-2 py-1 bg-red-600 text-white rounded"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
