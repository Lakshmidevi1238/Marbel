import { useMemo, useState } from "react";

function toLocalYMD(date) {
  const d = new Date(date);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}


export default function HorizontalCalendar({ selectedDate, setSelectedDate }) {
  const today = new Date();
  const todayYMD = toLocalYMD(today);

  const days = useMemo(() => {
    const y = today.getFullYear();
    const m = today.getMonth();
    const last = new Date(y, m + 1, 0).getDate();
    return Array.from({ length: last }, (_, i) => new Date(y, m, i + 1));
  }, []);

  const pageSize = 10;
  const [page, setPage] = useState(
    Math.floor((today.getDate() - 1) / pageSize)
  );

  const maxPage = Math.floor((days.length - 1) / pageSize);
  const visible = days.slice(page * pageSize, page * pageSize + pageSize);

  return (
    <div className="flex items-center gap-2 mb-4">
      <button
        disabled={page === 0}
        onClick={() => setPage(p => Math.max(0, p - 1))}
        className="px-2 text-base disabled:opacity-30"
      >
        <img
        src="/images/left-arrow.png"
        alt="Previous"
        className="w-4 h-4"
      />
      </button>

      <div className="flex gap-2 flex-1 justify-center">
        {visible.map(d => {
          const ymd = toLocalYMD(d);
          const isPast = ymd < todayYMD;
          const isActive = ymd === selectedDate;

          return (
            <button
              key={ymd}
              disabled={isPast}
              onClick={() => !isPast && setSelectedDate(ymd)}
              className={`w-11 py-1 rounded text-center text-sm transition
                ${
                  isActive
                    ? "bg-[#3a3535] text-white"
                    : "bg-white hover:bg-gray-100"
                }
                ${isPast ? "opacity-30 cursor-not-allowed" : ""}
              `}
            >
              <div className="text-[10px]">
                {d.toLocaleDateString("en-US", { weekday: "short" })}
              </div>
              <div className="font-semibold">{d.getDate()}</div>
            </button>
          );
        })}
      </div>

      <button
        disabled={page === maxPage}
        onClick={() => setPage(p => Math.min(maxPage, p + 1))}
        className="px-2 text-base disabled:opacity-30"
      >
        <img
  src="/images/left-arrow.png"
  alt="Next"
  className="w-4 h-4 rotate-180"
/>

      </button>
    </div>
  );
}
