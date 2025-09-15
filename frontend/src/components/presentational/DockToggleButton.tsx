// src/app/components/DockToggleButton.tsx
"use client";
import { useUIStore } from "@/stores/useUIStore";

export default function DockToggleButton() {
  const open = useUIStore((s) => s.rightDockOpen);
  const toggle = useUIStore((s) => s.toggleDock);
  return (
    <button className="btn" onClick={toggle}>
      {open ? "패널 닫기" : "패널 열기"}
    </button>
  );
}
