'use client';

import { useState } from 'react';
import { useTodoStore } from '@/store/useTodoStore';

export default function Home() {
  const tasks = useTodoStore((state) => state.tasks);
  const addTask = useTodoStore((state) => state.addTask);
  const toggleTask = useTodoStore((state) => state.toggleTask);
  const deleteTask = useTodoStore((state) => state.deleteTask);

  const [inputTitle, setInputTitle] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputTitle.trim()) return; 

    addTask(inputTitle); 
    setInputTitle('');   
  };

  return (
    <main className="min-h-screen bg-gray-950 text-gray-100 flex flex-col items-center py-12 px-4">
      <div className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl">
        
        <h1 className="text-2xl font-bold mb-6 text-center text-emerald-400">
          قائمة المهام 
        </h1>

        <form onSubmit={handleAdd} className="flex gap-2 mb-6">
          <input
            type="text"
            value={inputTitle}
            onChange={(e) => setInputTitle(e.target.value)}
            placeholder="أضف مهمة جديدة..."
            className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-emerald-500"
          />
          <button
            type="submit"
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
          >
            إضافة
          </button>
        </form>

        <div className="space-y-3">
          {tasks.length === 0 ? (
            <p className="text-center text-gray-500 text-sm py-8">
              لا توجد مهام حالياً. أضف مهمتك الأولى بالأعلى!
            </p>
          ) : (
            tasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center justify-between bg-gray-800/50 border border-gray-800 p-3 rounded-xl hover:border-gray-700 transition"
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => toggleTask(task.id)}
                    className="w-4 h-4 accent-emerald-500 cursor-pointer"
                  />
                  <span
                    className={`text-sm ${
                      task.completed ? 'line-through text-gray-500' : 'text-gray-200'
                    }`}
                  >
                    {task.title}
                  </span>
                </div>

                <button
                  onClick={() => deleteTask(task.id)}
                  className="text-red-400 hover:text-red-300 text-xs px-2 py-1 transition"
                >
                  حذف
                </button>
              </div>
            ))
          )}
        </div>

      </div>
    </main>
  );
}