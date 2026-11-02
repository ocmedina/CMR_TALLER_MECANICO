'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '../../../services/api';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    try { const token = new URLSearchParams(window.location.search).get('token'); await api.post('/auth/reset-password', { token, password }); setMessage('Contraseña actualizada.'); setTimeout(() => router.push('/login'), 1000); }
    catch (err: any) { setError(err.response?.data?.message || 'El enlace no es válido.'); }
  };
  return <main className="flex min-h-screen items-center justify-center bg-[#08111f] p-4"><form onSubmit={submit} className="surface w-full max-w-md space-y-4 rounded-2xl p-8"><h1 className="text-2xl font-black text-white">Nueva contraseña</h1><input required minLength={6} type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Mínimo 6 caracteres" className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-3 text-white" /><button className="primary-button w-full">Actualizar contraseña</button>{message && <p className="text-sm text-emerald-300">{message}</p>}{error && <p className="text-sm text-rose-300">{error}</p>}</form></main>;
}
