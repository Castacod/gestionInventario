"use client";

import Link from "next/link";
import { useState } from "react";
import { api } from "@/lib/api";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    const { ok, data } = await api<{ message?: string; userId?: string; error?: unknown }>(
      "/api/auth/register",
      { method: "POST", json: { email, password } }
    );
    if (ok) {
      setMsg({
        type: "ok",
        text: `Usuario creado en PostgreSQL (registro). userId: ${(data as { userId?: string }).userId ?? ""}. Puedes iniciar sesión.`,
      });
      return;
    }
    const err =
      typeof data === "object" && data && "error" in data
        ? JSON.stringify((data as { error: unknown }).error)
        : "Error";
    setMsg({ type: "err", text: err });
  }

  return (
    <>
      <nav>
        <Link className="brand" href="/">
          Demo académica
        </Link>
        <Link href="/login">Iniciar sesión</Link>
      </nav>
      <h1>Registro</h1>
      <p className="muted">Crea usuario en Postgres y cuenta inicial con saldo demo (1000).</p>
      <div className="card" style={{ maxWidth: 420 }}>
        <form onSubmit={onSubmit}>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <label htmlFor="password">Contraseña (mín. 6)</label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
          {msg && <div className={`msg ${msg.type === "ok" ? "ok" : "err"}`}>{msg.text}</div>}
          <button type="submit">Registrar</button>
        </form>
      </div>
    </>
  );
}
