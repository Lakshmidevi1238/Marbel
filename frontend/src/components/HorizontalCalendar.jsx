import { useMemo } from "react";

// ✅ LOCAL DATE FORMATTER (NO UTC SHIFT EVER)
function toLocalYMD(date) {
  const d = new Date(date);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export default function HorizontalCalendar({ selectedDate, setSelectedDate }) {
  const today = new Date();

  const days = useMemo(() => {
    const year = today.getFullYear();
    const month = today.getMonth();
    const lastDay = new Date(year, month + 1, 0).getDate();

    return Array.from(
      { length: lastDay - today.getDate() + 1 },
      (_, i) => new Date(year, month, today.getDate() + i)
    );
  }, []);

  return (
    <div className="flex gap-3 overflow-x-auto pb-2 mb-4">
      {days.map((d) => {
        const ymd = toLocalYMD(d); // ✅ CORRECT
        const isActive = ymd === selectedDate;

        return (
          <button
            key={ymd}
            onClick={() => setSelectedDate(ymd)} // ✅ STRING ONLY
            className={`min-w-[64px] p-2 rounded border text-center ${
              isActive
                ? "bg-black text-white"
                : "bg-white hover:bg-gray-100"
            }`}
          >
            <div className="text-xs">
              {d.toLocaleDateString("en-US", { weekday: "short" })}
            </div>
            <div className="text-lg font-bold">{d.getDate()}</div>
          </button>
        );
      })}
    </div>
  );
}
