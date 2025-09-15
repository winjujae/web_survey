// src/app/components/WriteButton.tsx
"use client";
import { useRouter } from "next/navigation";
import { useAuthGuard } from "@/features/auth/withAuthGuard";

export default function WriteButton() {
  const router = useRouter();
  const guard = useAuthGuard();
  return (
    <button className="btn btn-primary" onClick={guard(() => router.push("/posts/new"))}>
      글쓰기
    </button>
  );
}
