import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
const WS_BASE = import.meta.env.VITE_WS_URL || API_URL.replace(/^http/, "ws");
const HEALTH_WS_URL = `${WS_BASE}/ws/health`;

export type BackendStatus = "unknown" | "online" | "offline";

type Listener = (status: BackendStatus) => void;

const listeners = new Set<Listener>();
let statusGlobal: BackendStatus = "unknown";
let ws: WebSocket | null = null;
let heartbeatTimeout: number | null = null;
let reconnectTimeout: number | null = null;
let lastHeartbeatAt: number | null = null;
let initialized = false;

function notify(status: BackendStatus) {
  if (statusGlobal === status) return;
  statusGlobal = status;
  listeners.forEach((cb) => cb(status));
}

function scheduleOfflineTimeout() {
  if (heartbeatTimeout !== null) {
    window.clearTimeout(heartbeatTimeout);
  }
  heartbeatTimeout = window.setTimeout(() => {
    notify("offline");
  }, 6000);
}

function connect() {
  if (ws) return;

  try {
    ws = new WebSocket(HEALTH_WS_URL);
  } catch {
    notify("offline");
    return;
  }

  ws.onopen = () => {
    lastHeartbeatAt = Date.now();
    notify("online");
    scheduleOfflineTimeout();
  };

  ws.onmessage = () => {
    lastHeartbeatAt = Date.now();
    notify("online");
    scheduleOfflineTimeout();
  };

  ws.onerror = () => {
    notify("offline");
  };

  ws.onclose = () => {
    notify("offline");
    ws = null;
    if (heartbeatTimeout !== null) {
      window.clearTimeout(heartbeatTimeout);
      heartbeatTimeout = null;
    }
    if (reconnectTimeout === null) {
      reconnectTimeout = window.setTimeout(() => {
        reconnectTimeout = null;
        connect();
      }, 3000);
    }
  };
}

export function initBackendHealth() {
  if (initialized) return;
  initialized = true;
  if (typeof window !== "undefined") {
    connect();
  }
}

export function useBackendHealth() {
  const [status, setStatus] = useState<BackendStatus>(statusGlobal);
  const [lastBeat, setLastBeat] = useState<number | null>(lastHeartbeatAt);

  useEffect(() => {
    initBackendHealth();
    const listener: Listener = (nextStatus) => {
      setStatus(nextStatus);
      setLastBeat(lastHeartbeatAt);
    };
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  const lastHeartbeatSeconds =
    lastBeat != null ? Math.round((Date.now() - lastBeat) / 1000) : null;

  const isOnline = status === "online";

  return { status, isOnline, lastHeartbeatSeconds, healthUrl: HEALTH_WS_URL };
}

