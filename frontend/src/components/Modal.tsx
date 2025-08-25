// src/components/Modal.tsx
"use client";
import { useEffect, useRef } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  labelledBy?: string;
  children: React.ReactNode;
};

export default function Modal({ open, onClose, labelledBy, children }: Props) {
  const ref = useRef<HTMLDialogElement>(null);

  // open 상태에 맞춰 showModal/close 호출
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const onCancel = (e: Event) => { e.preventDefault(); onClose(); };
    el.addEventListener("cancel", onCancel);

    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();

    return () => el.removeEventListener("cancel", onCancel);
  }, [open, onClose]);

  return (
    <dialog className="modal" ref={ref} aria-modal="true" aria-labelledby={labelledBy}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
      {/* 바깥 클릭 닫기 */}
      <form method="dialog" onClick={onClose} style={{ position:"fixed", inset:0 }} />
    </dialog>
  );
}
