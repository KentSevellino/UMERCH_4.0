import { useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';

export function useInactivityTimer(timeout: number = 300000) {
  const { isAuthenticated, logout } = useAuth();
  const inactivityTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const warningTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const modalRef = useRef<HTMLDivElement | null>(null);
  const warningSecondsRef = useRef(5);

  const dismissModal = useCallback(() => {
    if (modalRef.current) {
      modalRef.current.remove();
      modalRef.current = null;
    }
    if (warningTimerRef.current) {
      clearInterval(warningTimerRef.current);
      warningTimerRef.current = null;
    }
    resetTimer();
  }, [isAuthenticated, logout, timeout]);

  const doLogout = useCallback(() => {
    if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
    logout();
  }, [logout]);

  const showWarning = useCallback(() => {
    if (modalRef.current) return;
    warningSecondsRef.current = 5;

    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,0.6);display:flex;align-items:center;justify-content:center;font-family:Montserrat,sans-serif;';
    overlay.innerHTML = `
      <div style="background:#F6F6F6;box-shadow:0 4px 20px rgba(0,0,0,0.15);border-radius:16px;padding:20px;text-align:center;max-width:380px;width:90%;">
        <div style="padding:20px 10px;display:flex;flex-direction:column;align-items:center;">
          <div style="font-size:18px;font-weight:600;color:black;margin-bottom:16px;">Are you still there?</div>
          <p style="margin:0 0 20px;font-size:14px;color:#555;">You'll be logged out in <span id="inactivity-countdown" style="color:#9C0306;font-weight:bold;">5</span> seconds due to inactivity.</p>
          <div style="display:flex;flex-direction:row;gap:12px;">
            <button id="inactivity-stay-btn" style="background:#9C0306;color:white;border:none;border-radius:5px;padding:10px 0;font-size:14px;cursor:pointer;font-weight:600;width:120px;height:40px;">I'm here</button>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
    modalRef.current = overlay;

    document.getElementById('inactivity-stay-btn')?.addEventListener('click', dismissModal);

    warningTimerRef.current = setInterval(() => {
      warningSecondsRef.current--;
      const countdownEl = document.getElementById('inactivity-countdown');
      if (countdownEl) countdownEl.textContent = String(warningSecondsRef.current);
      if (warningSecondsRef.current <= 0) {
        if (warningTimerRef.current) clearInterval(warningTimerRef.current);
        warningTimerRef.current = null;
        if (modalRef.current) modalRef.current.remove();
        modalRef.current = null;
        doLogout();
      }
    }, 1000);
  }, [dismissModal, doLogout]);

  const resetTimer = useCallback(() => {
    if (warningTimerRef.current) {
      clearInterval(warningTimerRef.current);
      warningTimerRef.current = null;
    }
    if (modalRef.current) {
      modalRef.current.remove();
      modalRef.current = null;
    }
    if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
    if (!isAuthenticated) return;

    const warningTime = timeout - 5000;
    inactivityTimerRef.current = setTimeout(showWarning, warningTime);
  }, [isAuthenticated, timeout, showWarning]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    const handler = () => resetTimer();

    events.forEach((event) => window.addEventListener(event, handler));
    resetTimer();

    return () => {
      events.forEach((event) => window.removeEventListener(event, handler));
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
      if (warningTimerRef.current) clearInterval(warningTimerRef.current);
      if (modalRef.current) modalRef.current.remove();
    };
  }, [isAuthenticated, resetTimer]);
}
