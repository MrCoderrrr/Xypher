import { Zap } from "lucide-react";
import { useEffect, useState } from "react";

function TokenBadge({ value = 0 }) {
  const [count, setCount] = useState(value);

  useEffect(() => {
    const start = count;
    const diff = value - start;
    if (!diff) return;
    let frame = 0;
    const timer = setInterval(() => {
      frame += 1;
      setCount(Math.round(start + (diff * frame) / 18));
      if (frame >= 18) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, [value]);

  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-2 text-sm font-semibold text-indigo-200">
      <Zap size={15} fill="currentColor" />
      {count.toLocaleString()} tokens
    </span>
  );
}

export default TokenBadge;
