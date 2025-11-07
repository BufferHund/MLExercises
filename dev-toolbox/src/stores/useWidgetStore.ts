import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type WidgetType = 'weather' | 'news' | 'todo' | 'quicklinks' | 'quote' | 'countdown';

export interface Widget {
  id: string;
  type: WidgetType;
  title: string;
  enabled: boolean;
  order: number;
}

interface WidgetState {
  widgets: Widget[];
  userLocation: { city: string; country: string; ip: string } | null;
  toggleWidget: (id: string) => void;
  reorderWidgets: (widgetIds: string[]) => void;
  setUserLocation: (location: { city: string; country: string; ip: string }) => void;
}

const defaultWidgets: Widget[] = [
  { id: 'weather', type: 'weather', title: '天气', enabled: true, order: 0 },
  { id: 'news', type: 'news', title: '新闻', enabled: true, order: 1 },
  { id: 'todo', type: 'todo', title: '待办事项', enabled: false, order: 2 },
  { id: 'quicklinks', type: 'quicklinks', title: '快捷链接', enabled: false, order: 3 },
  { id: 'quote', type: 'quote', title: '每日一句', enabled: false, order: 4 },
  { id: 'countdown', type: 'countdown', title: '倒计时', enabled: false, order: 5 },
];

export const useWidgetStore = create<WidgetState>()(
  persist(
    (set) => ({
      widgets: defaultWidgets,
      userLocation: null,

      toggleWidget: (id: string) => {
        set((state) => ({
          widgets: state.widgets.map((w) =>
            w.id === id ? { ...w, enabled: !w.enabled } : w
          ),
        }));
      },

      reorderWidgets: (widgetIds: string[]) => {
        set((state) => {
          const widgetMap = new Map(state.widgets.map((w) => [w.id, w]));
          const reorderedWidgets = widgetIds.map((id, index) => {
            const widget = widgetMap.get(id);
            return widget ? { ...widget, order: index } : null;
          }).filter((w): w is Widget => w !== null);

          // 保留未启用的widgets
          const disabledWidgets = state.widgets
            .filter((w) => !widgetIds.includes(w.id))
            .map((w, index) => ({ ...w, order: reorderedWidgets.length + index }));

          return { widgets: [...reorderedWidgets, ...disabledWidgets] };
        });
      },

      setUserLocation: (location) => {
        set({ userLocation: location });
      },
    }),
    {
      name: 'widget-storage',
    }
  )
);
