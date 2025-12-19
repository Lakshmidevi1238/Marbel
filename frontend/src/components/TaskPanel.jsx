import { useEffect, useMemo, useState } from "react";
import * as api from "../api";

export default function TaskPanel({ date, aiAddTask }) {
  const [allTasks, setAllTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [priority, setPriority] = useState("medium");

  const [openHigh, setOpenHigh] = useState(false);
  const [openMedium, setOpenMedium] = useState(false);
  const [openLow, setOpenLow] = useState(false);

  /* ===================== LOAD ===================== */
  const loadTasks = async () => {
    try {
      const data = await api.getTasks();
      setAllTasks(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  /* ===== expose addTask for AI via ref ===== */
  useEffect(() => {
    if (!aiAddTask) return;

    aiAddTask.current = async (title, priorityFromAI) => {
      if (!title?.trim()) return;

      await api.createTask({
        title: title.trim(),
        description: "",
        priority: priorityFromAI, // "high" | "medium" | "low"
        dueDate: date,
      });

      await loadTasks();
    };
  }, [aiAddTask, date]);

  /* ===================== FILTER ===================== */
  const tasksForThisDay = useMemo(
    () => allTasks.filter(t => t.dueDate === date),
    [allTasks, date]
  );

  const high = tasksForThisDay.filter(t => t.priority === "high");
  const medium = tasksForThisDay.filter(t => t.priority === "medium");
  const low = tasksForThisDay.filter(t => t.priority === "low");

  /* Auto-open High */
  useEffect(() => {
    if (high.length) {
      setOpenHigh(true);
      setOpenMedium(false);
      setOpenLow(false);
    }
  }, [high.length]);

  /* ===================== ACTIONS ===================== */
  const handleAdd = async () => {
    if (!newTask.trim()) return;

    await api.createTask({
      title: newTask.trim(),
      description: "",
      priority,
      dueDate: date,
    });

    setNewTask("");
    setPriority("medium");
    loadTasks();
  };

  const handleComplete = async id => {
    await api.completeTask(id);
    loadTasks();
    window.dispatchEvent(new Event("marbles-updated"));
  };

  const handleDelete = async id => {
    await api.deleteTask(id);
    loadTasks();
  };

  /* ===================== TASK ITEM ===================== */
  function TaskItem({ task, isLast }) {
    return (
      <div className="py-2">
        <div className="flex justify-between items-start gap-3">
          <span
            className={`text-[14px] font-semibold break-words ${
              task.completed
                ? "line-through text-gray-400"
                : "text-gray-800"
            }`}
          >
            {task.title}
          </span>

          <div className="flex gap-1 shrink-0">
            {!task.completed && (
              <button
                onClick={() => handleComplete(task.id)}
                className="text-[10px] px-2 py-1 rounded bg-[#3a3535] text-white"
              >
                Done
              </button>
            )}
            <button
              onClick={() => handleDelete(task.id)}
              className="text-[10px] px-2 py-1 rounded bg-[#990000] text-white"
            >
              ✕
            </button>
          </div>
        </div>

        {!isLast && <div className="mt-2 h-px bg-black/5" />}
      </div>
    );
  }

  /* ===================== SECTION ===================== */
  function Section({ title, tasks, open, onToggle, mist }) {
    return (
      <div className="mb-4">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-1">
          <h3 className="text-[14px] font-semibold">{title}</h3>

          <button
            onClick={onToggle}
            className={`w-6 h-6 rounded-full text-[11px] font-semibold flex items-center justify-center ${
              open ? "bg-[#3a3535] text-white" : "bg-gray-200 text-gray-700"
            }`}
          >
            {tasks.length}
          </button>
        </div>

        {/* CONTENT */}
        <div
          className={`transition-all duration-300 ${
            open ? "opacity-100" : "opacity-0 h-0 overflow-hidden"
          }`}
        >
          <div
            className={`
              mt-1 rounded-lg px-3 py-1 ${mist}
              max-h-[220px] overflow-y-auto
            `}
          >
            {tasks.length ? (
              tasks.map((task, i) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  isLast={i === tasks.length - 1}
                />
              ))
            ) : (
              <div className="py-2 text-xs italic text-gray-500">
                No tasks
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  /* ===================== UI ===================== */
  return (
    <div className="flex flex-col">
      {/* INPUT */}
      <div className="flex gap-2 mb-2">
        <input
          value={newTask}
          onChange={e => setNewTask(e.target.value)}
          placeholder="Add new task..."
          className="w-full p-2 border rounded text-sm"
        />
        <button
          onClick={handleAdd}
          className="px-3 py-2 bg-[#3a3535] text-white rounded text-sm"
        >
          Add
        </button>
      </div>

      {/* PRIORITY */}
      <p className="text-[11px] text-gray-500 mb-1">Select priority</p>
      <div className="flex gap-2 mb-3 text-xs">
        {["high", "medium", "low"].map(p => (
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

      {/* SECTIONS */}
      <Section
        title="High Priority"
        tasks={high}
        open={openHigh}
        onToggle={() => {
          setOpenHigh(!openHigh);
          setOpenMedium(false);
          setOpenLow(false);
        }}
        mist="bg-red-100"
      />

      <Section
        title="Medium Priority"
        tasks={medium}
        open={openMedium}
        onToggle={() => {
          setOpenMedium(!openMedium);
          setOpenHigh(false);
          setOpenLow(false);
        }}
        mist="bg-yellow-100"
      />

      <Section
        title="Low Priority"
        tasks={low}
        open={openLow}
        onToggle={() => {
          setOpenLow(!openLow);
          setOpenHigh(false);
          setOpenMedium(false);
        }}
        mist="bg-green-100"
      />
    </div>
  );
}
