import { useState, useRef } from "react";
import { useAuth } from "../auth/AuthProvider";

import TaskPanel from "../components/TaskPanel";
import MarblePanel from "../components/MarblePanel";
import HorizontalCalendar from "../components/HorizontalCalendar";
import MarbleToggle from "../components/MarbleToggle";
import AIAssistantPanel from "../components/AIAssistantPanel";
import MarbleAIIcon from "../components/MarbleAIIcon";
import { useToast } from "../components/Toast";

function todayYMD() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export default function Dashboard() {
  const { logout } = useAuth();
  const [selectedDate, setSelectedDate] = useState(todayYMD());
  const [aiOpen, setAiOpen] = useState(false);

  const { showToast } = useToast();

  // ref so AI can call into TaskPanel
  const aiAddTaskRef = useRef(null);

  const handleConfirmTaskFromAI = async (title, priority) => {
    if (!aiAddTaskRef.current) return;

    // show one toast when starting to add (first task)
    showToast("Adding tasks from AI…", "success");

    await aiAddTaskRef.current(title, priority);

    // optional: per-task toast (you can remove if too noisy)
    // showToast(`Added "${title}" as ${priority} priority.`, "success");
  };

  return (
    <div className="h-screen bg-[#f6efe8] flex flex-col overflow-hidden">
      {/* NAVBAR */}
      <header className="relative mt-4 mb-8 shrink-0">
        <div className="px-5 py-2 flex justify-between items-center">
          {/* LEFT: logo + text */}
          <div className="flex items-center">
            <h1 className="text-xl font-bold">Marble</h1>
          </div>

          {/* RIGHT: logout */}
          <button
            onClick={logout}
            className="px-3 py-1 border border-gray-300 bg-[#990000] text-sm text-[#f1efec] rounded hover:bg-[#ff4d4d]"
          >
            Logout
          </button>
        </div>

        {/* Divider + Marble */}
        <div className="relative -mx-6">
          <div className="h-[6px] bg-[#3a3535] w-full relative">
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#f6efe8] w-[64px] h-[70px] rounded-full" />
          </div>

          <div className="absolute left-1/2 -translate-x-1/2 -top-6 z-20">
            <MarbleToggle size={56} rotating />
          </div>
        </div>
      </header>

      {/* MAIN CARD */}
      <div
        className="
          bg-white
          
          shadow-xl
          p-4
          pt-12
          -mt-7
          flex-1
          min-h-0
          overflow-y-auto
        "
      >
        <div className="absolute -top-9 left-1/2 -translate-x-1/2 w-16 h-16 bg-[#f6efe8] rounded-full z-10" />

        <div className="mb-3">
          <HorizontalCalendar
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          {/* TASKS */}
          <div className="md:col-span-2 pr-3">
            <h2 className="text-[25px] mb-1">
              {new Date(selectedDate).toDateString()}
            </h2>
            <p className="text-xs text-gray-500 mb-3">
              Add and manage your tasks for this day
            </p>

            <TaskPanel date={selectedDate} aiAddTask={aiAddTaskRef} />
          </div>

          {/* MARBLE BOWL */}
          <div className="md:col-span-1 flex flex-col items-center">
            <p className="text-xs text-gray-500 mb-2">
              Completed tasks today
            </p>

            <div
              className="w-full h-[300px] rounded-xl bg-gray-50"
              title="Each marble represents a completed task"
            >
              <MarblePanel date={selectedDate} />
            </div>
          </div>
        </div>
      </div>

      {/* AI BUTTON */}
      <div className="fixed bottom-4 left-4 z-50 w-16 h-16">
        <MarbleAIIcon onClick={() => setAiOpen(true)} />
      </div>

      {/* AI MODAL */}
      {aiOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-4 relative">
            <button
              onClick={() => setAiOpen(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-black"
            >
              ✕
            </button>

            <AIAssistantPanel onConfirmTask={handleConfirmTaskFromAI} />
          </div>
        </div>
      )}
    </div>
  );
}
