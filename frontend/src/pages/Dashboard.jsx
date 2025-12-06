import { useState } from "react";
import { useAuth } from "../auth/AuthProvider";
import TaskCard from "../components/TaskPanel";
import MarblePanel from "../components/MarblePanel";


export default function Dashboard() {
  const { logout } = useAuth();

  // ✅ CENTER DATE INDEX (DRIVES THE LOOP)
  const [centerDate, setCenterDate] = useState(new Date());

  // ✅ CARD POSITIONS (TOP → CENTER → BOTTOM)
  const [slots, setSlots] = useState([
    new Date(new Date().setDate(new Date().getDate() - 1)),
    new Date(),
    new Date(new Date().setDate(new Date().getDate() + 1)),
  ]);

  // ✅ MOVE DOWN (INFINITE LOOP)
  const rollDown = () => {
    setSlots(([top, center, bottom]) => {
      const newBottom = new Date(bottom);
      newBottom.setDate(newBottom.getDate() + 1);

      const newCenter = bottom;
      setCenterDate(newCenter);

      return [center, bottom, newBottom];
    });
  };

  // ✅ MOVE UP (INFINITE LOOP)
  const rollUp = () => {
    setSlots(([top, center, bottom]) => {
      const newTop = new Date(top);
      newTop.setDate(newTop.getDate() - 1);

      const newCenter = top;
      setCenterDate(newCenter);

      return [newTop, top, center];
    });
  };

  // ✅ CALENDAR BAR (DRIVEN BY CENTER DATE)
  const monthName = centerDate.toLocaleString("default", { month: "long" });
  const year = centerDate.getFullYear();
  const daysInMonth = new Date(year, centerDate.getMonth() + 1, 0).getDate();

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

      {/* ✅ REAL CALENDAR BAR */}
      <div className="mb-6 border rounded-xl p-4 bg-white">
        <div className="text-center font-semibold mb-3">
          {monthName} {year}
        </div>

        <div className="flex gap-2 overflow-x-auto justify-center">
          {[...Array(daysInMonth)].map((_, i) => {
            const day = i + 1;
            return (
              <div
                key={day}
                className={`min-w-[38px] h-[38px] flex items-center justify-center rounded-full
                ${
                  centerDate.getDate() === day
                    ? "bg-black text-white"
                    : "bg-gray-200"
                }`}
              >
                {day}
              </div>
            );
          })}
        </div>
      </div>

      {/* ✅ MAIN LAYOUT */}
      <div className="grid grid-cols-3 gap-6">

        {/* ✅ INFINITE 3-SLOT LOOP */}
        <div className="col-span-2 relative h-[640px] flex flex-col items-center justify-center gap-6 overflow-hidden">

          {/* ⬆ UP */}
          <button
            onClick={rollUp}
            className="absolute top-2 text-2xl cursor-pointer z-20"
          >
            ⬆
          </button>

          {/* ✅ TOP SLOT */}
          <div
            onClick={rollUp}
            className="w-[92%] h-[160px] border rounded-xl p-4 bg-[#f9f3ed]
                       opacity-60 cursor-pointer transition-all duration-500"
          >
            <h2 className="font-semibold mb-1">
              {slots[0].toDateString()}
            </h2>
            <p className="text-sm">Previous day</p>
          </div>

          {/* ✅ CENTER SLOT (ACTIVE — TASK ENGINE LIVES HERE) */}
          <div
            className="w-[96%] h-[280px] border rounded-xl p-5 bg-white shadow-2xl
                       transition-all duration-500 flex flex-col"
          >
            <h2 className="font-semibold mb-2">
              {slots[1].toDateString()}
            </h2>

            {/* ✅ BACKEND CONNECTED TASK SYSTEM */}
            <TaskCard date={slots[1]} />
          </div>

          {/* ✅ BOTTOM SLOT */}
          <div
            onClick={rollDown}
            className="w-[92%] h-[160px] border rounded-xl p-4 bg-[#f9f3ed]
                       opacity-60 cursor-pointer transition-all duration-500"
          >
            <h2 className="font-semibold mb-1">
              {slots[2].toDateString()}
            </h2>
            <p className="text-sm">Next day</p>
          </div>

          {/* ⬇ DOWN */}
          <button
            onClick={rollDown}
            className="absolute bottom-2 text-2xl cursor-pointer z-20"
          >
            ⬇
          </button>

        </div>

        {/* ✅ MARBLE BOWL */}
        {/* ✅ MARBLE BOWL */}
<div className="border rounded-xl p-2 h-[450px] bg-white overflow-hidden">
  <MarblePanel date={slots[1]} />
</div>



      </div>
    </div>
  );
}
