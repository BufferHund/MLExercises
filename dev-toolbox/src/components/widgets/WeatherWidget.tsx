import { useEffect, useState } from 'react';
import { Cloud, Loader2 } from 'lucide-react';
import { useUserStore } from '../../stores/useUserStore';
import { useWidgetStore } from '../../stores/useWidgetStore';
import { getWeatherFromGemini } from '../../services/geminiService';

export default function WeatherWidget() {
  const { geminiConfig } = useUserStore();
  const { userLocation } = useWidgetStore();
  const [weather, setWeather] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWeather = async () => {
      if (!geminiConfig.apiKey || !userLocation) {
        setLoading(false);
        return;
      }

      try {
        const data = await getWeatherFromGemini(geminiConfig.apiKey, userLocation.city);
        setWeather(data);
      } catch (error) {
        console.error('Failed to fetch weather:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, [geminiConfig.apiKey, userLocation]);

  if (loading) {
    return (
      <div className="glass rounded-xl p-4 shadow-glass flex items-center justify-center h-32">
        <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
      </div>
    );
  }

  if (!weather) {
    return (
      <div className="glass rounded-xl p-4 shadow-glass h-32 flex items-center justify-center">
        <p className="text-sm text-slate-400">暂无天气数据</p>
      </div>
    );
  }

  return (
    <div className="glass rounded-xl p-4 shadow-glass">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Cloud className="w-4 h-4 text-blue-400" />
          <span className="text-sm font-medium text-white">{userLocation?.city || '北京'}</span>
        </div>
        <div className="text-2xl font-bold text-white">{weather.temperature}°</div>
      </div>
      <div className="text-xs text-slate-400">{weather.condition}</div>
      <div className="mt-3 flex gap-3 text-xs">
        <div>
          <span className="text-slate-500">湿度</span>
          <span className="ml-1 text-slate-300">{weather.humidity}%</span>
        </div>
        <div>
          <span className="text-slate-500">风速</span>
          <span className="ml-1 text-slate-300">{weather.windSpeed}km/h</span>
        </div>
      </div>
    </div>
  );
}
