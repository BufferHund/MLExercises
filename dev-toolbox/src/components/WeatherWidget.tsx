import { Cloud, Droplets, Wind, Eye, CloudRain, Sun } from 'lucide-react';

interface WeatherData {
  location: string;
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  visibility: number;
  forecast: {
    day: string;
    high: number;
    low: number;
    condition: string;
  }[];
}

// Mock 天气数据
const mockWeather: WeatherData = {
  location: '北京',
  temperature: 18,
  condition: '多云',
  humidity: 65,
  windSpeed: 12,
  visibility: 10,
  forecast: [
    { day: '今天', high: 22, low: 15, condition: 'cloudy' },
    { day: '明天', high: 24, low: 16, condition: 'sunny' },
    { day: '周五', high: 20, low: 14, condition: 'rainy' },
    { day: '周六', high: 19, low: 13, condition: 'cloudy' },
  ],
};

const getWeatherIcon = (condition: string) => {
  switch (condition) {
    case 'sunny':
      return <Sun className="w-5 h-5 text-yellow-400" />;
    case 'rainy':
      return <CloudRain className="w-5 h-5 text-blue-400" />;
    default:
      return <Cloud className="w-5 h-5 text-slate-400" />;
  }
};

export default function WeatherWidget() {
  return (
    <div className="glass rounded-2xl p-6 shadow-glass">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
            <Cloud className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">{mockWeather.location}</h3>
            <p className="text-xs text-slate-400">{mockWeather.condition}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-4xl font-bold text-white">{mockWeather.temperature}°</div>
        </div>
      </div>

      {/* Weather Details */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-3">
          <div className="flex items-center gap-2 mb-1">
            <Droplets className="w-4 h-4 text-blue-400" />
            <span className="text-xs text-slate-400">湿度</span>
          </div>
          <div className="text-lg font-semibold text-white">{mockWeather.humidity}%</div>
        </div>
        <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-3">
          <div className="flex items-center gap-2 mb-1">
            <Wind className="w-4 h-4 text-cyan-400" />
            <span className="text-xs text-slate-400">风速</span>
          </div>
          <div className="text-lg font-semibold text-white">{mockWeather.windSpeed}km/h</div>
        </div>
        <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-3">
          <div className="flex items-center gap-2 mb-1">
            <Eye className="w-4 h-4 text-purple-400" />
            <span className="text-xs text-slate-400">能见度</span>
          </div>
          <div className="text-lg font-semibold text-white">{mockWeather.visibility}km</div>
        </div>
      </div>

      {/* Forecast */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-slate-400 mb-3">未来天气</h4>
        {mockWeather.forecast.map((day, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between p-2 bg-slate-800/20 rounded-lg"
          >
            <span className="text-sm text-slate-300 w-12">{day.day}</span>
            <div className="flex items-center gap-2">
              {getWeatherIcon(day.condition)}
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-white font-medium">{day.high}°</span>
              <span className="text-slate-500">/</span>
              <span className="text-slate-400">{day.low}°</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
