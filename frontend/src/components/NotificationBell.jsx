import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Bell, CheckCheck, Trash2, X, CheckCircle, XCircle, AlertTriangle, Info } from "lucide-react";
import useNotificationStore from "../store/useNotificationStore";

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

const TYPE_META = {
  success: { Icon: CheckCircle,    cls: "notif-success" },
  error:   { Icon: XCircle,        cls: "notif-error"   },
  warning: { Icon: AlertTriangle,  cls: "notif-warning" },
  info:    { Icon: Info,           cls: "notif-info"    },
};

export default function NotificationBell() {
  const notifications  = useNotificationStore((s) => s.notifications);
  const markRead       = useNotificationStore((s) => s.markRead);
  const markAllRead    = useNotificationStore((s) => s.markAllRead);
  const dismiss        = useNotificationStore((s) => s.dismiss);
  const clearAll       = useNotificationStore((s) => s.clearAll);

  const [open, setOpen] = useState(false);
  const [panelPos, setPanelPos] = useState({ left: 0, bottom: 0 });
  const panelRef = useRef(null);
  const btnRef   = useRef(null);

  const unread = notifications.filter((n) => !n.read).length;

  // Position the panel relative to the bell button
  useEffect(() => {
    if (!open || !btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    setPanelPos({
      left: rect.left,
      bottom: window.innerHeight - rect.top + 8,
    });
  }, [open]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handler(e) {
      if (
        panelRef.current && !panelRef.current.contains(e.target) &&
        btnRef.current   && !btnRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  function handleBellClick() {
    setOpen((v) => !v);
  }

  function handleNotifClick(id) {
    markRead(id);
  }

  const panel = open ? createPortal(
    <div
      ref={panelRef}
      className="notif-panel"
      style={{
        position: "fixed",
        left: panelPos.left,
        bottom: panelPos.bottom,
        zIndex: 99999,
      }}
    >
      <div className="notif-panel-header">
        <h3 className="notif-panel-title">Notifications</h3>
        <div className="notif-panel-actions">
          {unread > 0 && (
            <button
              className="notif-action-btn"
              onClick={markAllRead}
              title="Mark all as read"
            >
              <CheckCheck size={14} /> All read
            </button>
          )}
          {notifications.length > 0 && (
            <button
              className="notif-action-btn notif-action-danger"
              onClick={clearAll}
              title="Clear all notifications"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>

      <div className="notif-list">
        {notifications.length === 0 ? (
          <div className="notif-empty">
            <Bell size={24} />
            <p>No notifications</p>
          </div>
        ) : (
          notifications.map((n) => {
            const meta = TYPE_META[n.type] ?? TYPE_META.info;
            return (
              <div
                key={n.id}
                className={`notif-item ${meta.cls} ${n.read ? "notif-read" : "notif-unread"}`}
                onClick={() => handleNotifClick(n.id)}
              >
                <div className="notif-item-icon">
                  <meta.Icon size={15} />
                </div>
                <div className="notif-item-body">
                  <p className="notif-item-title">{n.title}</p>
                  <p className="notif-item-msg">{n.message}</p>
                  <p className="notif-item-time">{timeAgo(n.timestamp)}</p>
                </div>
                <button
                  className="notif-dismiss-btn"
                  onClick={(e) => { e.stopPropagation(); dismiss(n.id); }}
                  title="Dismiss"
                >
                  <X size={13} />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>,
    document.body,
  ) : null;

  return (
    <div className="notif-bell-wrap">
      <button
        ref={btnRef}
        className="notif-bell-btn"
        onClick={handleBellClick}
        aria-label={`Notifications${unread > 0 ? ` — ${unread} unread` : ""}`}
        title="Notifications"
      >
        <Bell size={18} />
        {unread > 0 && (
          <span className="notif-badge">{unread > 99 ? "99+" : unread}</span>
        )}
      </button>
      {panel}
    </div>
  );
}
