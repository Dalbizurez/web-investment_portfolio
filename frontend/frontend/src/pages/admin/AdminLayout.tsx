// src/pages/admin/AdminLayout.tsx
import { NavLink, Outlet } from "react-router-dom";
import "./admin.css";

export default function AdminLayout() {
  return (
    <div className="admin-wrap">
      <aside className="admin-aside">
        <h2>Admin Panel</h2>
        <nav>
          <NavLink to="/admin/users">Users</NavLink>
          <NavLink to="/admin/stocks">Stocks</NavLink>
          <NavLink to="/admin/transactions">Transactions</NavLink>
        </nav>
      </aside>
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}
