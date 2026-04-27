import { create } from "zustand";

function load() {
  try { return JSON.parse(localStorage.getItem("notifications") || "[]"); }
  catch { return []; }
}

function save(notifications) {
  try { localStorage.setItem("notifications", JSON.stringify(notifications.slice(0, 200))); }
  catch {}
}

const useNotificationStore = create((set) => ({
  notifications: load(),

  addNotification: ({ type = "info", title, message, reportId = null }) =>
    set((state) => {
      const entry = {
        id: Date.now(),
        type,        // "success" | "error" | "warning" | "info"
        title,
        message,
        reportId,
        timestamp: new Date().toISOString(),
        read: false,
      };
      const notifications = [entry, ...state.notifications].slice(0, 200);
      save(notifications);
      return { notifications };
    }),

  markRead: (id) =>
    set((state) => {
      const notifications = state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n,
      );
      save(notifications);
      return { notifications };
    }),

  markAllRead: () =>
    set((state) => {
      const notifications = state.notifications.map((n) => ({ ...n, read: true }));
      save(notifications);
      return { notifications };
    }),

  dismiss: (id) =>
    set((state) => {
      const notifications = state.notifications.filter((n) => n.id !== id);
      save(notifications);
      return { notifications };
    }),

  clearAll: () =>
    set(() => {
      save([]);
      return { notifications: [] };
    }),
}));

export default useNotificationStore;
