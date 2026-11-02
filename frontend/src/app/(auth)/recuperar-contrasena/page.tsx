'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { api } from '../../../services/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    try { await api.post('/auth/forgot-password', { email }); setMessage('Si el correo existe, recibirás instrucciones para recuperar tu contraseña.'); }
    catch (err: any) { setError(err.response?.data?.message || 'No se pudo procesar la solicitud.'); }
  };
  return <main className="flex min-h-screen items-center justify-center bg-[#08111f] p-4"><form onSubmit={submit} className="surface w-full max-w-md space-y-4 rounded-2xl p-8"><h1 className="text-2xl font-black text-white">Recuperar contraseña</h1><p className="text-sm text-slate-400">Te enviaremos un enlace válido durante 60 minutos.</p><input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="tu@email.com" className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-3 text-white" /><button className="primary-button w-full">Enviar enlace</button>{message && <p className="text-sm text-emerald-300">{message}</p>}{error && <p className="text-sm text-rose-300">{error}</p>}<Link href="/login" className="block text-center text-sm text-amber-300">Volver al inicio de sesión</Link></form></main>;
}
