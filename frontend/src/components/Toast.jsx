// src/components/Toast.jsx
import React, { createContext, useContext, useCallback, useState } from 'react';
import "../pages/Toast.css";
const ToastContext = createContext();

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const push = useCallback((msg, opts = {}) => {
    const id = Date.now() + Math.random();
    const toast = { id, msg, ...opts };
    setToasts((s) => [...s, toast]);
    if (!opts.sticky) {
      setTimeout(() => setToasts((s) => s.filter((t) => t.id !== id)), opts.duration || 3500);
    }
    return id;
  }, []);

  const remove = useCallback((id) => setToasts((s) => s.filter((t) => t.id !== id)), []);

  return (
    <ToastContext.Provider value={{ push, remove }}>
      {children}
      <div className="toast-wrap" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`toast ${t.type || 'info'}`}>
            <div className="toast-msg">{t.msg}</div>
            <button className="toast-close" onClick={() => remove(t.id)}>✕</button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
