'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Task{
    id: string;
    title: string;
    category: 'work' | 'personal' | 'study';
    priority: 'low' | 'medium' | 'high';
    description?: string;
    completedPomodoros: number;
    completed: boolean;
}

interface TodoState{
  tasks: Task[];
  filter: 'all' | 'active' | 'completed';
  addTask: (title: string) => void;
  toggleTask: (id: string) => void;
    deleteTask: (id: string) => void;
}



export const useTodoStore = create<TodoState>()(
  persist(
    (set) => ({
      tasks: [],
      filter: 'all', 
      
      addTask: (title) => {
        set((state) => ({
          tasks: [
            ...state.tasks,
            { 
              id: Date.now().toString(), 
              title: title, 
              completed: false,
              category: 'work',       
              priority: 'medium',     
              completedPomodoros: 0   
            }
          ]
        }));
      },

      toggleTask: (id) => {
        set((state) => ({
          tasks: state.tasks.map((t) => {
            if (t.id === id) {
              return { ...t, completed: !t.completed };
            }
            return t;
          })
        }));
      },

      deleteTask: (id) => {
        set((state) => ({
          tasks: state.tasks.filter((t) => t.id !== id)
        }));
      },
    }),
    {
      name: 'todo-storage',     
    }
  )
);