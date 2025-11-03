// src/pages/admin/AdminUsers.tsx
import { useEffect, useState } from "react";
import api from "../../components/api";

type UserRow = {
  id: number; username: string; email: string; type: "standard"|"vip"|"admin";
  status: "pending"|"active"|"suspended";
  referral_code?: string; created_at: string; last_login?: string|null;
};

export default function AdminUsers() {
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<UserRow[]>([]);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/user_try/admin/users/`, { params: { q } });
      setRows(res.data.results);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const changeStatus = async (id: number, status: UserRow["status"]) => {
    await api.patch(`/user_try/admin/users/${id}/status/`, { status });
    await load();
  };

  const changeType = async (id: number, type: UserRow["type"]) => {
    await api.patch(`/user_try/admin/users/${id}/type/`, { type });
    await load();
  };

  return (
    <div>
      <h1>Users</h1>
      <div style={{display:"flex",gap:8,margin:"12px 0"}}>
        <input placeholder="Search user/email/referral" value={q} onChange={e=>setQ(e.target.value)} />
        <button onClick={load} disabled={loading}>Search</button>
      </div>
      <table className="table">
        <thead>
          <tr>
            <th>User</th><th>Email</th><th>Type</th><th>Status</th><th>Referral</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.id}>
              <td>{r.username}</td>
              <td>{r.email}</td>
              <td>
                <select value={r.type} onChange={(e)=>changeType(r.id, e.target.value as UserRow["type"])}>
                  <option value="standard">standard</option>
                  <option value="vip">vip</option>
                  <option value="admin">admin</option>
                </select>
              </td>
              <td>
                <select value={r.status} onChange={(e)=>changeStatus(r.id, e.target.value as UserRow["status"])}>
                  <option value="pending">pending</option>
                  <option value="active">active</option>
                  <option value="suspended">suspended</option>
                </select>
              </td>
              <td>{r.referral_code || "-"}</td>
              <td className="actions">
                <button onClick={()=>changeStatus(r.id,"active")}>Activate</button>
                <button onClick={()=>changeStatus(r.id,"suspended")}>Suspend</button>
              </td>
            </tr>
          ))}
          {!rows.length && !loading && <tr><td colSpan={6}>No data</td></tr>}
        </tbody>
      </table>
    </div>
  );
}
