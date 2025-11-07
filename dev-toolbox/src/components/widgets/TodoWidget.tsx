import { useState } from 'react';
import { CheckSquare, Square } from 'lucide-react';

interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
}

export default function TodoWidget() {
  const [todos, setTodos] = useState<TodoItem[]>([
    { id: '1', text: '完成项目开发', completed: false },
    { id: '2', text: '代码review', completed: true },
  ]);

  const toggleTodo = (id: string) => {
    setTodos(todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  return (
    <div className="glass rounded-xl p-4 shadow-glass h-40 flex flex-col">
      <div className="flex items-center gap-2 mb-3">
        <CheckSquare className="w-4 h-4 text-green-400" />
        <h3 className="text-sm font-medium text-white">待办事项</h3>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2">
        {todos.map((todo) => (
          <div
            key={todo.id}
            onClick={() => toggleTodo(todo.id)}
            className="flex items-center gap-2 cursor-pointer hover:bg-slate-800/30 p-2 rounded transition-colors"
          >
            {todo.completed ? (
              <CheckSquare className="w-4 h-4 text-green-400 flex-shrink-0" />
            ) : (
              <Square className="w-4 h-4 text-slate-400 flex-shrink-0" />
            )}
            <span className={`text-xs ${todo.completed ? 'text-slate-500 line-through' : 'text-slate-200'}`}>
              {todo.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
