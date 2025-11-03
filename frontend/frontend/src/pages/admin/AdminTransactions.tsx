// src/pages/admin/AdminTransactions.tsx
import { useEffect, useState } from "react";
import api from "../../components/api";

type Row = {
  id:number; user:string; type:string; symbol?:string|null;
  quantity?:number|null; price?:number|null; amount:number; fee:number;
  created_at:string;
};

export default function AdminTransactions(){
  const [rows,setRows] = useState<Row[]>([]);
  const [qUser,setQUser] = useState("");
  const [type,setType] = useState("");
  const [from,setFrom] = useState("");
  const [to,setTo] = useState("");

  const load = async ()=>{
    const res = await api.get(`/user_try/admin/transactions/`, { params: {
      user: qUser || undefined, type: type || undefined, from: from || undefined, to: to || undefined
    }});
    setRows(res.data.results);
  };
  useEffect(()=>{ load(); },[]);

  return (
    <div>
      <h1>Transactions</h1>
      <div style={{display:"flex",gap:8,flexWrap:"wrap",margin:"12px 0"}}>
        <input placeholder="User/email" value={qUser} onChange={e=>setQUser(e.target.value)}/>
        <select value={type} onChange={(e)=>setType(e.target.value)}>
          <option value="">All</option>
          <option value="DEPOSIT">DEPOSIT</option>
          <option value="WITHDRAWAL">WITHDRAWAL</option>
          <option value="BUY">BUY</option>
          <option value="SELL">SELL</option>
          <option value="REFERRAL">REFERRAL</option>
        </select>
        <input type="date" value={from} onChange={e=>setFrom(e.target.value)}/>
        <input type="date" value={to} onChange={e=>setTo(e.target.value)}/>
        <button onClick={load}>Filter</button>
      </div>

      <table className="table">
        <thead>
          <tr><th>Date</th><th>User</th><th>Type</th><th>Symbol</th><th>Qty</th><th>Price</th><th>Amount</th><th>Fee</th></tr>
        </thead>
        <tbody>
          {rows.map(r=>(
            <tr key={r.id}>
              <td>{new Date(r.created_at).toLocaleString()}</td>
              <td>{r.user}</td>
              <td>{r.type}</td>
              <td>{r.symbol || "-"}</td>
              <td>{r.quantity ?? "-"}</td>
              <td>{r.price ?? "-"}</td>
              <td>{r.amount}</td>
              <td>{r.fee}</td>
            </tr>
          ))}
          {!rows.length && <tr><td colSpan={8}>No data</td></tr>}
        </tbody>
      </table>
    </div>
  )
}
