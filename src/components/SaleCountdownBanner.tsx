import { useState, useEffect } from "react";
import { Timer } from "lucide-react";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function getEndDate() {
  // Sale ends at the end of the current week (Sunday midnight)
  const now = new Date();
  const end = new Date(now);
  end.setDate(now.getDate() + (7 - now.getDay()));
  end.setHours(23, 59, 59, 999);
  return end;
}

function calcTimeLeft(endDate: Date): TimeLeft {
  const diff = Math.max(0, endDate.getTime() - Date.now());
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

export default function SaleCountdownBanner() {
  const [endDate] = useState(getEndDate);
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(calcTimeLeft(endDate));

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(calcTimeLeft(endDate)), 1000);
    return () => clearInterval(timer);
  }, [endDate]);

  const blocks = [
    { value: timeLeft.days, label: "Days" },
    { value: timeLeft.hours, label: "Hrs" },
    { value: timeLeft.minutes, label: "Min" },
    { value: timeLeft.seconds, label: "Sec" },
  ];

  return (
    <section className="bg-primary text-primary-foreground py-6">
      <div className="container-page flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 text-center">
        <div className="flex items-center gap-2">
          <Timer className="h-5 w-5" />
          <span className="font-display text-lg font-semibold uppercase tracking-wider">
            Weekend Sale — Up to 30% Off
          </span>
        </div>
        <div className="flex gap-3">
          {blocks.map((b) => (
            <div key={b.label} className="flex flex-col items-center">
              <span className="bg-primary-foreground text-primary font-display text-xl font-bold w-12 h-12 flex items-center justify-center rounded-md">
                {String(b.value).padStart(2, "0")}
              </span>
              <span className="text-[10px] font-body uppercase tracking-wider mt-1 opacity-70">
                {b.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
