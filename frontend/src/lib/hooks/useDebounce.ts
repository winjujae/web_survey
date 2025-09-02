//src/lib/hooks/useDebounce.ts
"use client";
import { useEffect, useState } from "react";
export function useDebounce<T>(value: T, delay = 180) {
  const [v, setV] = useState(value);
  useEffect(() => { const t = setTimeout(() => setV(value), delay); return () => clearTimeout(t); }, [value, delay]);
  return v;
}
