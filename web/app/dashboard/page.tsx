"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { api, getToken, setToken } from "@/lib/api";

type Account = { id: string; balance: string; label: string | null };

export default function DashboardPage() {
  const router = useRouter();
  const [me, setMe] = useState<{ id: string; email: string } | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [audit, setAudit] = useState<{ action: string; detail: unknown; createdAt: string }[]>(
    []
  );
  const [transfer, setTransfer] = useState({
    fromAccountId: "",
    toAccountId: "",
    amount: "",
  });
  const [txnMsg, setTxnMsg] = useState<string | null>(null);
  const [redisKey, setRedisKey] = useState("pref");
  const [redisVal, setRedisVal] = useState("demo");
  const [redisGetResult, setRedisGetResult] = useState<string | null>(null);
  const [redisKeys, setRedisKeys] = useState<string[]>([]);

  const load = useCallback(async () => {
    if (!getToken()) {
      router.replace("/login");
      return;
    }
    const meRes = await api<{ user?: { id: string; email: string }; error?: string }>(
      "/api/auth/me"
    );
    if (!meRes.ok) {
      setToken(null);
      router.replace("/login");
      return;
    }
    setMe(meRes.data.user ?? null);
    const accRes = await api<{ accounts: Account[] }>("/api/accounts");
    if (accRes.ok) setAccounts(accRes.data.accounts ?? []);
    const audRes = await api<{ items: typeof audit }>("/api/audit");
    if (audRes.ok) setAudit(audRes.data.items ?? []);
    const rk = await api<{ keys: string[] }>("/api/redis/keys");
    if (rk.ok) setRedisKeys(rk.data.keys ?? []);
  }, [router]);

  useEffect(() => {
    load();
  }, [load]);

  async function createAccount() {
    setTxnMsg(null);
    const res = await api<{ message?: string }>("/api/accounts", {
      method: "POST",
      json: { label: `extra-${Date.now()}` },
    });
    setTxnMsg(res.ok ? res.data.message ?? "OK" : JSON.stringify(res.data));
    await load();
  }

  async function doTransfer(e: React.FormEvent) {
    e.preventDefault();
    setTxnMsg(null);
    const amount = Number(transfer.amount);
    if (!transfer.fromAccountId || !transfer.toAccountId || !(amount > 0)) {
      setTxnMsg("Completa cuentas y monto.");
      return;
    }
    const res = await api<{ message?: string; error?: string }>("/api/transactions/transfer", {
      method: "POST",
      json: {
        fromAccountId: transfer.fromAccountId,
        toAccountId: transfer.toAccountId,
        amount,
      },
    });
    if (res.ok) {
      setTxnMsg(JSON.stringify(res.data, null, 2));
    } else {
      setTxnMsg(typeof res.data === "object" ? JSON.stringify(res.data) : String(res.data));
    }
    await load();
  }

  async function redisSet() {
    setTxnMsg(null);
    const res = await api("/api/redis/set", {
      method: "POST",
      json: { key: redisKey, value: redisVal, ttlSeconds: 3600 },
    });
    setTxnMsg(res.ok ? JSON.stringify(res.data) : JSON.stringify(res.data));
    await load();
  }

  async function fetchRedisGet() {
    const res = await api<{ value: string | null }>(
      `/api/redis/get?key=${encodeURIComponent(redisKey)}`
    );
    setRedisGetResult(res.ok ? res.data.value : JSON.stringify(res.data));
  }

  async function redisFlush() {
    if (!confirm("¿Ejecutar FLUSHALL? Borra todas las claves (incluye sesiones).")) return;
    const res = await api("/api/redis/flushall", { method: "POST" });
    setTxnMsg(JSON.stringify(res.data, null, 2));
    if (res.ok) {
      setToken(null);
      router.replace("/login");
    }
  }

  async function logout() {
    await api("/api/auth/logout", { method: "POST" });
    setToken(null);
    router.replace("/login");
  }

  if (!me) {
    return (
      <>
        <nav>
          <Link className="brand" href="/">
            Demo académica
          </Link>
        </nav>
        <p className="muted">Cargando…</p>
      </>
    );
  }

  return (
    <>
      <nav>
        <Link className="brand" href="/">
          Demo académica
        </Link>
        <span className="muted">{me?.email}</span>
        <button type="button" className="secondary" onClick={() => logout()}>
          Cerrar sesión
        </button>
      </nav>

      <h1>Panel</h1>
      <p className="muted">
        Rutas protegidas validan JWT y luego leen la sesión en Redis (<code>session:{'{id}'}</code>
        ).
      </p>

      <div className="card">
        <h2>Cuentas (PostgreSQL)</h2>
        <p className="muted">Creación de registros: añade una segunda cuenta para probar la transferencia.</p>
        <button type="button" onClick={createAccount}>
          Nueva cuenta
        </button>
        <ul style={{ marginTop: "0.75rem" }}>
          {accounts.map((a) => (
            <li key={a.id}>
              <code>{a.id}</code> — {a.label ?? ""} — saldo: <strong>{a.balance}</strong>
            </li>
          ))}
        </ul>
      </div>

      <div className="card">
        <h2>Transacción ACID (transferencia)</h2>
        <form onSubmit={doTransfer}>
          <div className="row">
            <div style={{ flex: 1, minWidth: 200 }}>
              <label>Desde cuenta ID</label>
              <select
                value={transfer.fromAccountId}
                onChange={(e) => setTransfer((t) => ({ ...t, fromAccountId: e.target.value }))}
              >
                <option value="">—</option>
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.label} ({a.balance})
                  </option>
                ))}
              </select>
            </div>
            <div style={{ flex: 1, minWidth: 200 }}>
              <label>Hacia cuenta ID</label>
              <select
                value={transfer.toAccountId}
                onChange={(e) => setTransfer((t) => ({ ...t, toAccountId: e.target.value }))}
              >
                <option value="">—</option>
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.label} ({a.balance})
                  </option>
                ))}
              </select>
            </div>
            <div style={{ width: 120 }}>
              <label>Monto</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={transfer.amount}
                onChange={(e) => setTransfer((t) => ({ ...t, amount: e.target.value }))}
              />
            </div>
          </div>
          <button type="submit">Ejecutar transacción</button>
        </form>
        {txnMsg && (
          <pre className="json" style={{ marginTop: "0.75rem" }}>
            {txnMsg}
          </pre>
        )}
      </div>

      <div className="card">
        <h2>Redis (SET / GET / keys)</h2>
        <p className="muted">Claves con prefijo demo:{'{userId}:'}:…</p>
        <div className="row">
          <div style={{ flex: 1 }}>
            <label>Clave corta</label>
            <input value={redisKey} onChange={(e) => setRedisKey(e.target.value)} />
          </div>
          <div style={{ flex: 2 }}>
            <label>Valor</label>
            <input value={redisVal} onChange={(e) => setRedisVal(e.target.value)} />
          </div>
        </div>
        <div className="row">
          <button type="button" onClick={redisSet}>
            SET
          </button>
          <button type="button" className="secondary" onClick={fetchRedisGet}>
            GET
          </button>
        </div>
        {redisGetResult !== null && (
          <p className="muted">
            Valor: <code>{redisGetResult}</code>
          </p>
        )}
        <p className="muted">Keys: {redisKeys.join(", ") || "(ninguna)"}</p>
        <button type="button" className="danger" onClick={redisFlush}>
          FLUSHALL (requiere ALLOW_REDIS_FLUSH=true)
        </button>
      </div>

      <div className="card">
        <h2>Auditoría (MongoDB Atlas)</h2>
        <p className="muted">Colección audit_logs (últimos eventos de este usuario).</p>
        <ul style={{ paddingLeft: "1.25rem" }}>
          {audit.map((a, i) => (
            <li key={i}>
              <strong>{a.action}</strong> — {new Date(a.createdAt).toLocaleString()} —{" "}
              <code>{JSON.stringify(a.detail)}</code>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
