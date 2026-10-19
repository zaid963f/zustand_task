'use client';

import { useState, useSyncExternalStore } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import {
  Plus,
  Trash,
  Check,
  Timer,
  Briefcase,
  User,
  BookOpen,
  Flag,
  Sparkles,
  ListTodo,
  Flame,
  ChevronDown,
  Minus,
} from 'lucide-react';
import { useTodoStore } from '@/store/useTodoStore';

type Task = ReturnType<typeof useTodoStore.getState>['tasks'][number];
type Filter = ReturnType<typeof useTodoStore.getState>['filter'];
type Category = Task['category'];
type Priority = Task['priority'];

const CATEGORIES: Record<Category, { label: string; icon: typeof User; chip: string }> = {
  work: { label: 'عمل', icon: Briefcase, chip: 'bg-sky-500/15 text-sky-300 ring-sky-500/30' },
  personal: { label: 'شخصي', icon: User, chip: 'bg-fuchsia-500/15 text-fuchsia-300 ring-fuchsia-500/30' },
  study: { label: 'دراسة', icon: BookOpen, chip: 'bg-amber-500/15 text-amber-300 ring-amber-500/30' },
};

const PRIORITIES: Record<Priority, { label: string; bar: string; chip: string }> = {
  low: { label: 'منخفضة', bar: 'bg-emerald-400', chip: 'bg-emerald-500/15 text-emerald-300 ring-emerald-500/30' },
  medium: { label: 'متوسطة', bar: 'bg-amber-400', chip: 'bg-amber-500/15 text-amber-300 ring-amber-500/30' },
  high: { label: 'عالية', bar: 'bg-rose-500', chip: 'bg-rose-500/15 text-rose-300 ring-rose-500/30' },
};

const FILTERS: { value: Filter; label: string }[] = [
  { value: 'all', label: 'الكل' },
  { value: 'active', label: 'النشطة' },
  { value: 'completed', label: 'المكتملة' },
];

// The store only exposes add/toggle/delete, so the extra fields are written
// through zustand's built-in setState without touching the store file.
const updateTask = (id: string, patch: Partial<Task>) =>
  useTodoStore.setState((s) => ({
    tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)),
  }));

const setFilter = (filter: Filter) => useTodoStore.setState({ filter });

// The store rehydrates from localStorage on the client only; render the list
// after mount so server and client markup match.
const useMounted = () =>
  useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

export default function Home() {
  const tasks = useTodoStore((state) => state.tasks);
  const filter = useTodoStore((state) => state.filter);
  const addTask = useTodoStore((state) => state.addTask);
  const toggleTask = useTodoStore((state) => state.toggleTask);
  const deleteTask = useTodoStore((state) => state.deleteTask);
  const mounted = useMounted();

  const [inputTitle, setInputTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Category>('work');
  const [priority, setPriority] = useState<Priority>('medium');
  const [showDetails, setShowDetails] = useState(false);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputTitle.trim()) return;

    addTask(inputTitle.trim());
    const created = useTodoStore.getState().tasks.at(-1);
    if (created) {
      updateTask(created.id, {
        category,
        priority,
        description: description.trim() || undefined,
      });
    }
    setInputTitle('');
    setDescription('');
  };

  const total = tasks.length;
  const done = tasks.filter((t) => t.completed).length;
  const pomodoros = tasks.reduce((sum, t) => sum + t.completedPomodoros, 0);
  const progress = total ? done / total : 0;

  const visible = tasks.filter((t) =>
    filter === 'active' ? !t.completed : filter === 'completed' ? t.completed : true,
  );

  const counts: Record<Filter, number> = {
    all: total,
    active: total - done,
    completed: done,
  };

  return (
    <main dir="rtl" className="relative min-h-screen overflow-hidden bg-[#07070c] text-gray-100">
      <Backdrop />

      <div className="relative z-10 mx-auto flex w-full max-w-xl flex-col gap-6 px-4 py-12">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="flex items-center justify-between"
        >
          <div>
            <p className="mb-1 flex items-center gap-1.5 text-xs font-medium text-emerald-300/80">
              <Sparkles className="size-3.5" />
              نظّم يومك
            </p>
            <h1 className="bg-linear-to-l from-emerald-300 via-teal-200 to-sky-300 bg-clip-text text-4xl font-black text-transparent">
              قائمة المهام
            </h1>
          </div>
          <ProgressRing value={mounted ? progress : 0} />
        </motion.header>

        {/* Stats */}
        <motion.section
          initial="hidden"
          animate="show"
          variants={{ show: { transition: { staggerChildren: 0.08, delayChildren: 0.15 } } }}
          className="grid grid-cols-3 gap-3"
        >
          <Stat icon={ListTodo} label="المهام" value={mounted ? total : 0} tone="text-sky-300" />
          <Stat icon={Check} label="مكتملة" value={mounted ? done : 0} tone="text-emerald-300" />
          <Stat icon={Flame} label="بومودورو" value={mounted ? pomodoros : 0} tone="text-orange-300" />
        </motion.section>

        {/* Add form */}
        <motion.form
          onSubmit={handleAdd}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="rounded-3xl border border-white/10 bg-white/4 p-4 shadow-2xl shadow-black/40 backdrop-blur-xl"
        >
          <div className="flex gap-2">
            <input
              type="text"
              value={inputTitle}
              onChange={(e) => setInputTitle(e.target.value)}
              placeholder="ما الذي تريد إنجازه؟"
              className="flex-1 rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm placeholder:text-gray-500 transition focus:border-emerald-400/60 focus:outline-none focus:ring-4 focus:ring-emerald-400/10"
            />
            <motion.button
              type="submit"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.92 }}
              disabled={!inputTitle.trim()}
              className="flex items-center gap-1.5 rounded-2xl bg-linear-to-br from-emerald-400 to-teal-500 px-5 text-sm font-bold text-emerald-950 shadow-lg shadow-emerald-500/25 transition disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Plus className="size-4" strokeWidth={3} />
              إضافة
            </motion.button>
          </div>

          <button
            type="button"
            onClick={() => setShowDetails((v) => !v)}
            className="mt-3 flex items-center gap-1 text-xs text-gray-400 transition hover:text-gray-200"
          >
            <motion.span animate={{ rotate: showDetails ? 180 : 0 }}>
              <ChevronDown className="size-3.5" />
            </motion.span>
            تفاصيل المهمة
          </button>

          <AnimatePresence initial={false}>
            {showDetails && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <div className="space-y-4 pt-4">
                  <OptionGroup label="التصنيف">
                    {(Object.keys(CATEGORIES) as Category[]).map((key) => {
                      const { label, icon: Icon, chip } = CATEGORIES[key];
                      return (
                        <Pill key={key} active={category === key} activeClass={chip} onClick={() => setCategory(key)}>
                          <Icon className="size-3.5" />
                          {label}
                        </Pill>
                      );
                    })}
                  </OptionGroup>

                  <OptionGroup label="الأولوية">
                    {(Object.keys(PRIORITIES) as Priority[]).map((key) => {
                      const { label, bar, chip } = PRIORITIES[key];
                      return (
                        <Pill key={key} active={priority === key} activeClass={chip} onClick={() => setPriority(key)}>
                          <span className={`size-2 rounded-full ${bar}`} />
                          {label}
                        </Pill>
                      );
                    })}
                  </OptionGroup>

                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="وصف اختياري..."
                    rows={2}
                    className="w-full resize-none rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm placeholder:text-gray-500 transition focus:border-emerald-400/60 focus:outline-none focus:ring-4 focus:ring-emerald-400/10"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.form>

        {/* Filters */}
        <LayoutGroup>
          <div className="flex gap-1 rounded-2xl border border-white/10 bg-white/3 p-1 backdrop-blur-xl">
            {FILTERS.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setFilter(value)}
                className={`relative flex-1 rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
                  filter === value ? 'text-emerald-950' : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                {filter === value && (
                  <motion.span
                    layoutId="filter-pill"
                    transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                    className="absolute inset-0 rounded-xl bg-linear-to-br from-emerald-300 to-teal-400"
                  />
                )}
                <span className="relative flex items-center justify-center gap-1.5">
                  {label}
                  <span
                    className={`rounded-full px-1.5 text-[10px] tabular-nums ${
                      filter === value ? 'bg-emerald-950/15' : 'bg-white/10'
                    }`}
                  >
                    {mounted ? counts[value] : 0}
                  </span>
                </span>
              </button>
            ))}
          </div>
        </LayoutGroup>

        {/* Task list */}
        <motion.ul layout className="space-y-3">
          <AnimatePresence mode="popLayout" initial={false}>
            {mounted && visible.length === 0 && (
              <EmptyState key="empty" filter={filter} />
            )}
            {mounted &&
              visible.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onToggle={() => toggleTask(task.id)}
                  onDelete={() => deleteTask(task.id)}
                />
              ))}
          </AnimatePresence>
        </motion.ul>
      </div>
    </main>
  );
}

function TaskItem({
  task,
  onToggle,
  onDelete,
}: {
  task: Task;
  onToggle: () => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);
  const cat = CATEGORIES[task.category];
  const pri = PRIORITIES[task.priority];
  const CatIcon = cat.icon;

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 16, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: -60, scale: 0.9, transition: { duration: 0.25 } }}
      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
      whileHover={{ y: -2 }}
      className={`group relative overflow-hidden rounded-2xl border bg-white/4 backdrop-blur-xl transition-colors ${
        task.completed ? 'border-white/5' : 'border-white/10 hover:border-white/20'
      }`}
    >
      <span className={`absolute inset-y-0 right-0 w-1 ${pri.bar} ${task.completed ? 'opacity-30' : ''}`} />

      <div className="flex items-start gap-3 p-4 pr-5">
        <motion.button
          onClick={onToggle}
          whileTap={{ scale: 0.8 }}
          aria-label={task.completed ? 'إلغاء الإكمال' : 'إكمال المهمة'}
          className={`mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
            task.completed
              ? 'border-emerald-400 bg-emerald-400 text-emerald-950'
              : 'border-gray-500 hover:border-emerald-400'
          }`}
        >
          <AnimatePresence>
            {task.completed && (
              <motion.span
                initial={{ scale: 0, rotate: -90 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 20 }}
              >
                <Check className="size-3.5" strokeWidth={3.5} />
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>

        <div className="min-w-0 flex-1">
          <button
            onClick={() => task.description && setOpen((v) => !v)}
            className={`relative block max-w-full text-right text-[15px] font-medium transition-colors ${
              task.completed ? 'text-gray-500' : 'text-gray-100'
            } ${task.description ? 'cursor-pointer' : 'cursor-default'}`}
          >
            <span className="wrap-break-word">{task.title}</span>
            <motion.span
              initial={false}
              animate={{ scaleX: task.completed ? 1 : 0 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              style={{ originX: 1 }}
              className="absolute inset-x-0 top-1/2 h-px bg-gray-500"
            />
          </button>

          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] ring-1 ${cat.chip}`}>
              <CatIcon className="size-3" />
              {cat.label}
            </span>
            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] ring-1 ${pri.chip}`}>
              <Flag className="size-3" />
              {pri.label}
            </span>
            {task.description && (
              <button
                onClick={() => setOpen((v) => !v)}
                className="inline-flex items-center gap-0.5 text-[11px] text-gray-500 hover:text-gray-300"
              >
                <motion.span animate={{ rotate: open ? 180 : 0 }}>
                  <ChevronDown className="size-3" />
                </motion.span>
                الوصف
              </button>
            )}
          </div>

          <AnimatePresence initial={false}>
            {open && task.description && (
              <motion.p
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden text-sm leading-relaxed text-gray-400"
              >
                <span className="block pt-2">{task.description}</span>
              </motion.p>
            )}
          </AnimatePresence>

          <Pomodoro task={task} />
        </div>

        <motion.button
          onClick={onDelete}
          whileHover={{ scale: 1.1, rotate: -8 }}
          whileTap={{ scale: 0.85 }}
          aria-label="حذف المهمة"
          className="rounded-xl p-2 text-gray-500 opacity-60 transition hover:bg-rose-500/10 hover:text-rose-400 group-hover:opacity-100"
        >
          <Trash className="size-4" />
        </motion.button>
      </div>
    </motion.li>
  );
}

function Pomodoro({ task }: { task: Task }) {
  const count = task.completedPomodoros;
  const change = (delta: number) =>
    updateTask(task.id, { completedPomodoros: Math.max(0, count + delta) });

  return (
    <div className="mt-3 flex items-center gap-2">
      <Timer className="size-3.5 text-orange-300/70" />
      <div className="flex items-center gap-0.5">
        <AnimatePresence initial={false}>
          {Array.from({ length: Math.min(count, 8) }).map((_, i) => (
            <motion.span
              key={i}
              initial={{ scale: 0, y: 6 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 18 }}
            >
              <Flame className="size-3.5 fill-orange-400/80 text-orange-400" />
            </motion.span>
          ))}
        </AnimatePresence>
        {count > 8 && <span className="text-[11px] text-orange-300">+{count - 8}</span>}
        {count === 0 && <span className="text-[11px] text-gray-500">لا جلسات بعد</span>}
      </div>
      <div className="mr-auto flex items-center gap-1">
        <motion.button
          whileTap={{ scale: 0.85 }}
          onClick={() => change(-1)}
          disabled={count === 0}
          aria-label="إنقاص جلسة"
          className="rounded-lg p-1 text-gray-500 transition hover:bg-white/5 hover:text-gray-300 disabled:opacity-30"
        >
          <Minus className="size-3" />
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.85 }}
          onClick={() => change(1)}
          aria-label="إضافة جلسة"
          className="flex items-center gap-1 rounded-lg bg-orange-500/10 px-2 py-1 text-[11px] font-medium text-orange-300 ring-1 ring-orange-500/20 transition hover:bg-orange-500/20"
        >
          <Plus className="size-3" />
          جلسة
        </motion.button>
      </div>
    </div>
  );
}

function ProgressRing({ value }: { value: number }) {
  const r = 26;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative size-16">
      <svg viewBox="0 0 64 64" className="size-16 -rotate-90">
        <defs>
          <linearGradient id="ring" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#6ee7b7" />
            <stop offset="100%" stopColor="#7dd3fc" />
          </linearGradient>
        </defs>
        <circle cx="32" cy="32" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
        <motion.circle
          cx="32"
          cy="32"
          r={r}
          fill="none"
          stroke="url(#ring)"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={c}
          initial={false}
          animate={{ strokeDashoffset: c * (1 - value) }}
          transition={{ type: 'spring', stiffness: 80, damping: 18 }}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-sm font-bold tabular-nums">
        {Math.round(value * 100)}%
      </span>
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof User;
  label: string;
  value: number;
  tone: string;
}) {
  return (
    <motion.div
      variants={{ hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0 } }}
      whileHover={{ y: -3 }}
      className="rounded-2xl border border-white/10 bg-white/4 p-3 backdrop-blur-xl"
    >
      <Icon className={`mb-2 size-4 ${tone}`} />
      <motion.p
        key={value}
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl font-black tabular-nums"
      >
        {value}
      </motion.p>
      <p className="text-xs text-gray-400">{label}</p>
    </motion.div>
  );
}

function OptionGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-xs text-gray-500">{label}</p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function Pill({
  active,
  activeClass,
  onClick,
  children,
}: {
  active: boolean;
  activeClass: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.92 }}
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ring-1 transition ${
        active ? activeClass : 'bg-white/3 text-gray-400 ring-white/10 hover:text-gray-200'
      }`}
    >
      {children}
    </motion.button>
  );
}

function EmptyState({ filter }: { filter: Filter }) {
  const text =
    filter === 'completed'
      ? 'لم تُكمل أي مهمة بعد. ابدأ بواحدة!'
      : filter === 'active'
        ? 'رائع! لا توجد مهام متبقية 🎉'
        : 'لا توجد مهام حالياً. أضف مهمتك الأولى بالأعلى!';

  return (
    <motion.li
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-white/10 py-14 text-center"
    >
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        className="rounded-2xl bg-linear-to-br from-emerald-400/20 to-sky-400/20 p-4 ring-1 ring-white/10"
      >
        <ListTodo className="size-7 text-emerald-300" />
      </motion.div>
      <p className="text-sm text-gray-400">{text}</p>
    </motion.li>
  );
}

function Backdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      <motion.div
        animate={{ x: [0, 60, 0], y: [0, 40, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -top-32 -right-24 size-96 rounded-full bg-emerald-500/20 blur-3xl"
      />
      <motion.div
        animate={{ x: [0, -50, 0], y: [0, 60, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-1/3 -left-32 size-96 rounded-full bg-sky-500/15 blur-3xl"
      />
      <motion.div
        animate={{ x: [0, 40, 0], y: [0, -40, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -bottom-40 right-1/4 size-112 rounded-full bg-fuchsia-500/10 blur-3xl"
      />
      <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.06)_1px,transparent_1px)] bg-size-[24px_24px] mask-[radial-gradient(ellipse_at_center,black_40%,transparent_75%)]" />
    </div>
  );
}
