export function todayDateString(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

export function toDateInputValue(date) {
  const d = new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function getWeekStart(date = new Date()) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay() || 7;
  d.setDate(d.getDate() - day + 1);
  return d;
}

export function getTaskDueInfo(task, today = new Date()) {
  if (!task?.due) return { days: null };
  const start = new Date(today);
  start.setHours(0, 0, 0, 0);
  const due = new Date(task.due);
  due.setHours(0, 0, 0, 0);
  return { days: Math.ceil((due - start) / 86400000) };
}

export function isOverdue(due, now = new Date()) {
  if (!due) return false;
  const d = new Date(due);
  d.setHours(23, 59, 59);
  return d < now;
}

export function getOverdueDays(due, today = new Date()) {
  if (!due) return 0;
  const start = new Date(today);
  start.setHours(0, 0, 0, 0);
  const d = new Date(due);
  d.setHours(0, 0, 0, 0);
  return Math.max(0, Math.floor((start - d) / 86400000));
}

export function formatMissionTime(seconds) {
  const safe = Math.max(0, Number(seconds) || 0);
  const h = Math.floor(safe / 3600);
  const m = Math.floor((safe % 3600) / 60);
  const s = safe % 60;
  return h > 0
    ? `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
    : `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}
