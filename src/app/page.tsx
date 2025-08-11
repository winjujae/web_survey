'use client';
import { useState } from 'react';

export default function Home() {
  const [form, setForm] = useState({ name: '', email: '', message: '', agree: false });
  const [ok, setOk] = useState<boolean|null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const r = await fetch('/api/submit', {
      method: 'POST',
      headers: { 'Content-Type':'application/json' },
      body: JSON.stringify(form)
    });
    setOk(r.ok);
  };

  return (
    <main className="min-h-dvh mx-auto max-w-md p-6">
      <h1 className="text-2xl font-semibold mb-4">문의/설문</h1>
      <form onSubmit={submit} className="space-y-3">
        <input className="w-full border p-2 rounded" placeholder="이름"
          onChange={e=>setForm(f=>({...f, name:e.target.value}))}/>
        <input type="email" className="w-full border p-2 rounded" placeholder="이메일"
          onChange={e=>setForm(f=>({...f, email:e.target.value}))}/>
        <textarea className="w-full border p-2 rounded" rows={4} placeholder="메시지"
          onChange={e=>setForm(f=>({...f, message:e.target.value}))}/>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" required
            onChange={e=>setForm(f=>({...f, agree:e.target.checked}))}/>
          개인정보 수집·이용에 동의합니다.
        </label>
        <button className="w-full bg-black text-white py-2 rounded">제출</button>
        {ok===true && <p className="text-green-600">제출 완료!</p>}
        {ok===false && <p className="text-red-600">제출 실패. 다시 시도해주세요.</p>}
      </form>
    </main>
  );
}
