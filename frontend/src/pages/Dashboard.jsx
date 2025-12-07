import { useState } from "react";
import { useAuth } from "../auth/AuthProvider";
import TaskPanel from "../components/TaskPanel";
import MarblePanel from "../components/MarblePanel";
import HorizontalCalendar from "../components/HorizontalCalendar";

function todayYMD() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`; // ✅ LOCAL DATE
}

export default function Dashboard() {
  const { logout } = useAuth();
  const [selectedDate, setSelectedDate] = useState(todayYMD());

  return (
    <div className="min-h-screen bg-[#f6efe8] p-6">

      {/* ✅ NAV BAR */}
      <div className="mb-6 flex justify-between items-center border rounded-xl p-3 bg-white">
        <h1 className="font-bold text-xl">MarbleJar</h1>
        <button
          onClick={logout}
          className="px-4 py-1 bg-black text-white rounded cursor-pointer"
        >
          Logout
        </button>
      </div>

      {/* ✅ HORIZONTAL CALENDAR */}
      <HorizontalCalendar
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
      />

      {/* ✅ MAIN LAYOUT */}
      <div className="grid grid-cols-3 gap-6">

        {/* ✅ TASK WORKSPACE */}
        <div className="col-span-2 border rounded-xl p-5 bg-white h-[640px] overflow-hidden">
          <h2 className="font-semibold mb-3 text-lg">
            Tasks for {new Date(selectedDate).toDateString()}
          </h2>

          <TaskPanel date={selectedDate} />
        </div>

        {/* ✅ MARBLE BOWL */}
        <div className="border rounded-xl p-2 h-[640px] bg-white overflow-hidden">
          <MarblePanel date={selectedDate} />
        </div>

      </div>
    </div>
  );
}
