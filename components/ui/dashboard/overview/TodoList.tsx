"use client";

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ListChecks, Pencil, X } from 'lucide-react';

interface Todo {
  id: number;
  text: string;
  date: string;
  completed: boolean;
}

const TodoItems = () => {
  const [todos, setTodos] = useState<Todo[]>([
    {
      id: 1,
      text: "Draft abstract for the Graph Neural Networks paper.",
      date: "2025-03-04 21:00:07",
      completed: false
    },
    {
      id: 2,
      text: "Annotate results from the weekend experiment run.",
      date: "2025-03-05 10:30:00",
      completed: false
    },
    {
      id: 3,
      text: "Prepare slides for Friday's weekly lab presentation.",
      date: "2025-03-06 14:15:00",
      completed: false
    },
    {
      id: 4,
      text: "Review the submitted paper on Transfer Learning.",
      date: "2025-03-07 09:00:00",
      completed: false
    },
    {
      id: 5,
      text: "Curate the shared dataset for the collaboration project.",
      date: "2025-03-02 16:45:00",
      completed: true
    },
    {
      id: 6,
      text: "Summarize literature on Attention Mechanisms.",
      date: "2025-03-01 11:20:00",
      completed: true
    },
    {
      id: 7,
      text: "Update the lab bibliography with new citations.",
      date: "2025-02-28 13:30:00",
      completed: true
    },
    {
      id: 8,
      text: "Finalize poster for the innovation showcase.",
      date: "2025-02-27 15:00:00",
      completed: true
    }
  ]);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState<string>("");

  const toggleComplete = (id: number) => {
    setTodos(todos.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const deleteTodo = (id: number) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  const startEdit = (todo: Todo) => {
    setEditingId(todo.id);
    setEditText(todo.text);
  };

  const saveEdit = (id: number) => {
    setTodos(todos.map(todo => 
      todo.id === id ? { ...todo, text: editText } : todo
    ));
    setEditingId(null);
    setEditText("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText("");
  };

  const addNewTodo = () => {
    const newTodo: Todo = {
      id: Date.now(),
      text: "New research task",
      date: new Date().toISOString().slice(0, 19).replace('T', ' '),
      completed: false
    };
    setTodos([newTodo, ...todos]);
  };

  const activeTodos = todos.filter(todo => !todo.completed);
  const completedTodos = todos.filter(todo => todo.completed);

  const TodoItem = ({ todo }: { todo: Todo }) => (
    <div className="flex items-center gap-3 py-3 border-b border-gray-100 last:border-b-0">
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={() => toggleComplete(todo.id)}
        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
      />
      <div className="flex-1">
        {editingId === todo.id ? (
          <input
            type="text"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') saveEdit(todo.id);
              if (e.key === 'Escape') cancelEdit();
            }}
            className="w-full px-2 py-1 border border-blue-400 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
        ) : (
          <>
            <p className={`text-sm ${todo.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>
              {todo.text}
            </p>
            <p className="text-xs text-gray-400 mt-1">{todo.date}</p>
          </>
        )}
      </div>
      <div className="flex items-center gap-2">
        {editingId === todo.id ? (
          <>
            <button
              onClick={() => saveEdit(todo.id)}
              className="text-green-600 hover:text-green-700 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </button>
            <button
              onClick={cancelEdit}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => startEdit(todo)}
              className="text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              onClick={() => deleteTodo(todo.id)}
              className="text-gray-500 hover:text-red-600 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </>
        )}
      </div>
    </div>
  );

  return (
    <div className="w-full py-4">
      <Card className="rounded-2xl shadow-lg overflow-hidden">
        <div className=" px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#1C1D1D0D] shadow-[0_0_38px_0_#00000012]">
              <ListChecks className="w-6 h-6 text-gray-700" aria-hidden />
            </div>
            <h1 className="text-lg font-semibold text-gray-800">My Research To-Dos</h1>
          </div>
          <button
            onClick={addNewTodo}
            className="px-2.5 py-1.25 bg-[#0000008C] hover:bg-gray-700 text-white text-sm rounded-[6px] transition-colors cursor-pointer"
          >
            Add +
          </button>
        </div>

        <CardContent className="px-5 space-y-6">
          {/* Latest to do's */}
          <div>
            <h2 className="text-sm font-semibold text-[#FFB200] mb-3">Latest to do{`'`}s</h2>
            <div className="space-y-1">
              {activeTodos.length > 0 ? (
                activeTodos.map(todo => <TodoItem key={todo.id} todo={todo} />)
              ) : (
                <p className="text-sm text-gray-400 py-4 text-center">No active todos</p>
              )}
            </div>
          </div>

          {/* Latest finished to do's */}
          <div>
            <h2 className="text-sm font-semibold text-green-500 mb-3">Latest finished to do{`'`}s</h2>
            <div className="space-y-1">
              {completedTodos.length > 0 ? (
                completedTodos.map(todo => <TodoItem key={todo.id} todo={todo} />)
              ) : (
                <p className="text-sm text-gray-400 py-4 text-center">No completed todos</p>
              )}
            </div>
          </div>

          {/* View All Button */}
          <button className="w-full py-1.25 px-2.5 bg-[#0000008C] hover:bg-gray-700 text-white text-sm font-medium rounded-[6px] transition-colors cursor-pointer">
            View All
          </button>
        </CardContent>
      </Card>
    </div>
  );
};

export default TodoItems;