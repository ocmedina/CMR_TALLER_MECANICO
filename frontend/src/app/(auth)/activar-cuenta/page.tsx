'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '../../../services/api';

export default function ActivateAccountPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    try {
      const token = new URLSearchParams(window.location.search).get('token');
      await api.post('/auth/reset-password', { token, password });
      setDone(true);
      setTimeout(() => router.push('/login'), 1200);
    } catch (err: any) {
      setError(err.response?.data?.message || 'La invitación no es válida o expiró.');
    }
  };

  return <main className="flex min-h-screen items-center justify-center bg-[#08111f] p-4"><form onSubmit={submit} className="surface w-full max-w-md space-y-4 rounded-2xl p-8"><h1 className="text-2xl font-black text-white">Activar cuenta de cliente</h1><p className="text-sm text-slate-400">Definí una contraseña para ingresar al portal del taller.</p><input required minLength={6} type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Mínimo 6 caracteres" className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-3 text-white" /><button className="primary-button w-full">Activar cuenta</button>{done && <p className="text-sm text-emerald-300">Cuenta activada. Redirigiendo al inicio de sesión...</p>}{error && <p className="text-sm text-rose-300">{error}</p>}</form></main>;
}
