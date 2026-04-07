"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api, setToken } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    const { ok, data } = await api<{ token?: string; message?: string; error?: string }>(
      "/api/auth/login",
      { method: "POST", json: { email, password } }
    );
    if (ok && data && "token" in data && data.token) {
      setToken(data.token);
      setMsg({ type: "ok", text: data.message ?? "Sesión en Redis + JWT emitido." });
      router.push("/dashboard");
      return;
    }
    const err =
      typeof data === "object" && data && "error" in data
        ? String((data as { error: unknown }).error)
        : "Error";
    setMsg({ type: "err", text: err });
  }

  return (
    <>
      <nav>
        <Link className="brand" href="/">
          Demo académica
        </Link>
        <Link href="/register">Registro</Link>
        <Link href="/dashboard">Panel</Link>
      </nav>
      <h1>Iniciar sesión</h1>
      <p className="muted">
        Tras el login, la API guarda la sesión en Redis y devuelve un token JWT que referencia esa
        sesión.
      </p>
      <div className="card" style={{ maxWidth: 420 }}>
        <form onSubmit={onSubmit}>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <label htmlFor="password">Contraseña</label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {msg && <div className={`msg ${msg.type === "ok" ? "ok" : "err"}`}>{msg.text}</div>}
          <button type="submit">Entrar</button>
        </form>
      </div>
    </>
  );
}
