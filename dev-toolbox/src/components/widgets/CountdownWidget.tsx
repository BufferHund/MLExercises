import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';

export default function CountdownWidget() {
  const [days, setDays] = useState(0);

  useEffect(() => {
    const targetDate = new Date('2025-12-31');
    const calculateDays = () => {
      const now = new Date();
      const diff = targetDate.getTime() - now.getTime();
      const daysLeft = Math.ceil(diff / (1000 * 60 * 60 * 24));
      setDays(daysLeft);
    };

    calculateDays();
    const interval = setInterval(calculateDays, 1000 * 60 * 60); // 每小时更新

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="glass rounded-xl p-4 shadow-glass h-40 flex flex-col">
      <div className="flex items-center gap-2 mb-3">
        <Clock className="w-4 h-4 text-orange-400" />
        <h3 className="text-sm font-medium text-white">2025倒计时</h3>
      </div>

      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl font-bold text-white mb-2">{days}</div>
          <div className="text-sm text-slate-400">天</div>
        </div>
      </div>
    </div>
  );
}
