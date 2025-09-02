// src/app/posts/new/page.tsx
"use client";

// 기존: import NewPostForm from "@/features/posts/components/NewPostForm";
import NewPostForm from "../../../features/posts/components/NewPostForm";

export default function NewPostPage() {
  return (
    <div className="card" style={{ padding: 16 }}>
      <NewPostForm />
    </div>
  );
}
