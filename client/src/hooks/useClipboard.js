import React, { useState, useEffect } from "react";

export const ClipboardCtx = { value: "", listeners: [] };
export function setClipboard(text) {
  ClipboardCtx.value = text;
  ClipboardCtx.listeners.forEach((fn) => fn(text));
  try { navigator.clipboard.writeText(text); } catch (e) {}
}
export function useClipboard() {
  const [val, setVal] = useState(ClipboardCtx.value);
  useEffect(() => {
    ClipboardCtx.listeners.push(setVal);
    return () => { ClipboardCtx.listeners = ClipboardCtx.listeners.filter((f) => f !== setVal); };
  }, []);
  return [val, setClipboard];
}