import { useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useWidgetStore } from '../stores/useWidgetStore';
import { getUserLocation } from '../services/locationService';
import WeatherWidget from './widgets/WeatherWidget';
import NewsWidget from './widgets/NewsWidget';
import TodoWidget from './widgets/TodoWidget';
import QuickLinksWidget from './widgets/QuickLinksWidget';
import QuoteWidget from './widgets/QuoteWidget';
import CountdownWidget from './widgets/CountdownWidget';
import type { WidgetType } from '../stores/useWidgetStore';

function SortableWidget({ id, type }: { id: string; type: WidgetType }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: 'grab',
  };

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

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {renderWidget(type)}
    </div>
  );
}

export default function WidgetContainer() {
  const { widgets, setUserLocation, userLocation, reorderWidgets } = useWidgetStore();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    // 获取用户位置
    if (!userLocation) {
      getUserLocation().then(setUserLocation);
    }
  }, [userLocation, setUserLocation]);

  const enabledWidgets = widgets
    .filter((w) => w.enabled)
    .sort((a, b) => a.order - b.order);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = enabledWidgets.findIndex((w) => w.id === active.id);
      const newIndex = enabledWidgets.findIndex((w) => w.id === over.id);

      const newOrder = arrayMove(enabledWidgets, oldIndex, newIndex);
      reorderWidgets(newOrder.map((w) => w.id));
    }
  };

  if (enabledWidgets.length === 0) {
    return null;
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={enabledWidgets.map((w) => w.id)}
        strategy={rectSortingStrategy}
      >
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
          {enabledWidgets.map((widget) => (
            <SortableWidget key={widget.id} id={widget.id} type={widget.type} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
