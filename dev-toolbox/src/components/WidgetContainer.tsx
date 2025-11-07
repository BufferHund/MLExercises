import { useEffect } from 'react';
import { useWidgetStore } from '../stores/useWidgetStore';
import { getUserLocation } from '../services/locationService';
import WeatherWidget from './widgets/WeatherWidget';
import NewsWidget from './widgets/NewsWidget';
import TodoWidget from './widgets/TodoWidget';
import QuickLinksWidget from './widgets/QuickLinksWidget';
import QuoteWidget from './widgets/QuoteWidget';
import CountdownWidget from './widgets/CountdownWidget';
import type { WidgetType } from '../stores/useWidgetStore';

export default function WidgetContainer() {
  const { widgets, setUserLocation, userLocation } = useWidgetStore();

  useEffect(() => {
    // 获取用户位置
    if (!userLocation) {
      getUserLocation().then(setUserLocation);
    }
  }, [userLocation, setUserLocation]);

  const renderWidget = (type: WidgetType) => {
    switch (type) {
      case 'weather':
        return <WeatherWidget />;
      case 'news':
        return <NewsWidget />;
      case 'todo':
        return <TodoWidget />;
      case 'quicklinks':
        return <QuickLinksWidget />;
      case 'quote':
        return <QuoteWidget />;
      case 'countdown':
        return <CountdownWidget />;
      default:
        return null;
    }
  };

  const enabledWidgets = widgets
    .filter((w) => w.enabled)
    .sort((a, b) => a.order - b.order);

  if (enabledWidgets.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
      {enabledWidgets.map((widget) => (
        <div key={widget.id}>{renderWidget(widget.type)}</div>
      ))}
    </div>
  );
}
