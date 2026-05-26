"use client";

import {
  Check,
  LogOut,
  RefreshCw,
  ShieldCheck,
  UserRound,
  X
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";

type AdminUser = {
  id: string;
  email: string;
  fullName: string;
  primaryRole: string;
};

type ClubMember = {
  id: string;
  role: string;
  verificationStatus: string;
  user: {
    id: string;
    email: string;
    fullName: string;
    primaryRole: string;
    status: string;
  };
};

type PendingClub = {
  id: string;
  name: string;
  city: string | null;
  province: string | null;
  federationRegion: string | null;
  contactEmail: string | null;
  verificationStatus: string;
  createdAt: string;
  members: ClubMember[];
};

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3004/api/v1";

export default function AdminHome() {
  const [email, setEmail] = useState("admin@buscador-futbol.local");
  const [password, setPassword] = useState("Admin12345!");
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AdminUser | null>(null);
  const [clubs, setClubs] = useState<PendingClub[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [actingClubId, setActingClubId] = useState<string | null>(null);

  const pendingCount = clubs.length;
  const totalMembers = useMemo(
    () => clubs.reduce((sum, club) => sum + club.members.length, 0),
    [clubs]
  );

  useEffect(() => {
    const storedToken = window.localStorage.getItem("bpf_admin_token");
    const storedUser = window.localStorage.getItem("bpf_admin_user");

    if (storedToken) {
      setToken(storedToken);
    }

    if (storedUser) {
      setUser(JSON.parse(storedUser) as AdminUser);
    }
  }, []);

  useEffect(() => {
    if (token) {
      void loadPendingClubs(token);
    }
  }, [token]);

  async function apiRequest<T>(
    path: string,
    options: RequestInit = {},
    authToken = token
  ): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        "content-type": "application/json",
        ...(authToken ? { authorization: `Bearer ${authToken}` } : {}),
        ...(options.headers ?? {})
      }
    });

    const body = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(body?.message ?? "No se pudo completar la accion");
    }

    return body as T;
  }

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const session = await apiRequest<{
        accessToken: string;
        user: AdminUser;
      }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password })
      }, null);

      if (session.user.primaryRole !== "ADMIN") {
        throw new Error("Esta cuenta no tiene permisos de administracion");
      }

      window.localStorage.setItem("bpf_admin_token", session.accessToken);
      window.localStorage.setItem(
        "bpf_admin_user",
        JSON.stringify(session.user)
      );
      setToken(session.accessToken);
      setUser(session.user);
      setMessage("Sesion iniciada");
      await loadPendingClubs(session.accessToken);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Error de acceso");
    } finally {
      setLoading(false);
    }
  }

  async function loadPendingClubs(authToken = token) {
    if (!authToken) {
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const result = await apiRequest<PendingClub[]>(
        "/admin/clubs/pending",
        {},
        authToken
      );
      setClubs(result);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "No se pudieron cargar clubes"
      );
    } finally {
      setLoading(false);
    }
  }

  async function decideClub(clubId: string, action: "approve" | "reject") {
    setActingClubId(clubId);
    setMessage("");

    try {
      await apiRequest(`/admin/clubs/${clubId}/${action}`, {
        method: "POST"
      });
      setClubs((current) => current.filter((club) => club.id !== clubId));
      setMessage(action === "approve" ? "Club aprobado" : "Club rechazado");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "No se pudo actualizar el club"
      );
    } finally {
      setActingClubId(null);
    }
  }

  function logout() {
    window.localStorage.removeItem("bpf_admin_token");
    window.localStorage.removeItem("bpf_admin_user");
    setToken(null);
    setUser(null);
    setClubs([]);
    setMessage("");
  }

  return (
    <main className="admin-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Buscador Futbol</p>
          <h1>Panel Admin</h1>
        </div>
        {user ? (
          <div className="session">
            <span>
              <ShieldCheck size={16} />
              {user.fullName}
            </span>
            <button className="icon-button" onClick={logout} title="Cerrar sesion">
              <LogOut size={18} />
            </button>
          </div>
        ) : null}
      </header>

      {!token ? (
        <section className="login-panel">
          <form onSubmit={handleLogin}>
            <div className="form-heading">
              <ShieldCheck size={22} />
              <h2>Acceso administrativo</h2>
            </div>
            <label>
              Email
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
              />
            </label>
            <label>
              Contrasena
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
              />
            </label>
            <button className="primary-button" disabled={loading}>
              {loading ? "Entrando..." : "Entrar"}
            </button>
            {message ? <p className="form-message">{message}</p> : null}
          </form>
        </section>
      ) : (
        <>
          <section className="metrics">
            <article>
              <span>Clubes pendientes</span>
              <strong>{pendingCount}</strong>
            </article>
            <article>
              <span>Responsables a revisar</span>
              <strong>{totalMembers}</strong>
            </article>
            <article>
              <span>API</span>
              <strong>3004</strong>
            </article>
          </section>

          <section className="toolbar">
            <div>
              <h2>Clubes pendientes</h2>
              <p>Solicitudes de alta o verificacion manual.</p>
            </div>
            <button
              className="secondary-button"
              onClick={() => void loadPendingClubs()}
              disabled={loading}
            >
              <RefreshCw size={16} />
              Actualizar
            </button>
          </section>

          {message ? <p className="status-message">{message}</p> : null}

          <section className="table-panel">
            {clubs.length === 0 ? (
              <div className="empty-state">
                <ShieldCheck size={28} />
                <p>No hay clubes pendientes.</p>
              </div>
            ) : (
              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>Club</th>
                      <th>Zona</th>
                      <th>Contacto</th>
                      <th>Responsable</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clubs.map((club) => {
                      const owner = club.members[0]?.user;
                      return (
                        <tr key={club.id}>
                          <td>
                            <strong>{club.name}</strong>
                            <span>{club.federationRegion ?? "Sin federacion"}</span>
                          </td>
                          <td>
                            {club.city ?? "Sin ciudad"}
                            <span>{club.province ?? "Sin provincia"}</span>
                          </td>
                          <td>{club.contactEmail ?? "Sin email"}</td>
                          <td>
                            <span className="person">
                              <UserRound size={15} />
                              {owner?.fullName ?? "Sin responsable"}
                            </span>
                            <span>{owner?.email ?? ""}</span>
                          </td>
                          <td>
                            <span className="badge">{club.verificationStatus}</span>
                          </td>
                          <td>
                            <div className="actions">
                              <button
                                className="approve-button"
                                onClick={() => void decideClub(club.id, "approve")}
                                disabled={actingClubId === club.id}
                                title="Aprobar club"
                              >
                                <Check size={16} />
                              </button>
                              <button
                                className="reject-button"
                                onClick={() => void decideClub(club.id, "reject")}
                                disabled={actingClubId === club.id}
                                title="Rechazar club"
                              >
                                <X size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
    </main>
  );
}
