// src/pages/admin/AdminStocks.tsx
import { useEffect, useState } from "react";
import api from "../../components/api";

type Stock = {
  id:number; symbol:string; name:string; current_price:number;
  currency:string; exchange:string; sector:string; is_active:boolean;
};

export default function AdminStocks() {
  const [q,setQ] = useState("");
  const [rows,setRows] = useState<Stock[]>([]);
  const [form,setForm] = useState<Partial<Stock>>({symbol:"", name:"", current_price:0, currency:"USD"});

  const load = async () => {
    const res = await api.get(`/user_try/admin/stocks/`, { params: { q } });
    setRows(res.data.results);
  };
  useEffect(()=>{ load(); },[]);

  const create = async () => {
    await api.post(`/user_try/admin/stocks/create/`, {
      symbol: form.symbol, name: form.name, current_price: form.current_price,
      currency: form.currency, exchange: form.exchange, sector: form.sector
    });
    setForm({symbol:"", name:"", current_price:0, currency:"USD"});
    await load();
  };

  const update = async (id:number, patch: Partial<Stock>) => {
    await api.patch(`/user_try/admin/stocks/${id}/`, patch);
    await load();
  };

  const softDelete = async (id:number) => {
    await api.delete(`/user_try/admin/stocks/${id}/delete/`);
    await load();
  };

  return (
    <div>
      <h1>Stocks</h1>
      <div style={{display:"flex",gap:8,margin:"12px 0"}}>
        <input placeholder="Search symbol or name" value={q} onChange={e=>setQ(e.target.value)} />
        <button onClick={load}>Search</button>
      </div>

      <h3>Create Stock</h3>
      <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:16}}>
        <input placeholder="SYMBOL" value={form.symbol||""} onChange={e=>setForm({...form,symbol:e.target.value})}/>
        <input placeholder="Name" value={form.name||""} onChange={e=>setForm({...form,name:e.target.value})}/>
        <input placeholder="Price" type="number" value={form.current_price||0} onChange={e=>setForm({...form,current_price:parseFloat(e.target.value)})}/>
        <input placeholder="Currency" value={form.currency||"USD"} onChange={e=>setForm({...form,currency:e.target.value})}/>
        <input placeholder="Exchange" value={form.exchange||""} onChange={e=>setForm({...form,exchange:e.target.value})}/>
        <input placeholder="Sector" value={form.sector||""} onChange={e=>setForm({...form,sector:e.target.value})}/>
        <button onClick={create}>Create</button>
      </div>

      <table className="table">
        <thead>
          <tr>
            <th>Symbol</th><th>Name</th><th>Price</th><th>Active</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(s=>(
            <tr key={s.id}>
              <td>{s.symbol}</td>
              <td><input defaultValue={s.name} onBlur={(e)=>update(s.id,{name:e.target.value})}/></td>
              <td><input type="number" defaultValue={s.current_price} onBlur={(e)=>update(s.id,{current_price:parseFloat(e.target.value)})}/></td>
              <td>
                <select value={s.is_active ? "1" : "0"} onChange={(e)=>update(s.id,{is_active: e.target.value==="1"})}>
                  <option value="1">Yes</option>
                  <option value="0">No</option>
                </select>
              </td>
              <td className="actions">
                <button onClick={()=>softDelete(s.id)}>Soft delete</button>
              </td>
            </tr>
          ))}
          {!rows.length && <tr><td colSpan={5}>No data</td></tr>}
        </tbody>
      </table>
    </div>
  )
}
