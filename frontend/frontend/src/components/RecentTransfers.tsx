import { useState, useEffect } from "react";
import { useUser } from "./UserContext";
import axios from "axios";
import "../styles/transferencias.css";

const API_URL = "http://back.g4.atenea.lat/api";

interface Transaction {
  id: number;
  type: "toHapi" | "toBank";
  symbol: string | null;
  amount: number;
  transfer_reference: string;
  timestamp: string;
}

function RecentTransfers({ refreshKey }: { refreshKey: number }) {
  const { token } = useUser();
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const fetchRecent = async () => {
    if (!token) return;
    const res = await axios.get(`${API_URL}/stocks/transactions/history/`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setTransactions(res.data.transactions);
  };

  useEffect(() => {
    fetchRecent();
  }, [token, refreshKey]);

  const recent = transactions.slice(0, 3);

  return (
    <div className="recent-card">
      <h2>Recent Transfers</h2>

      {recent.length === 0 && (
        <div className="recent-box">
          <p className="recent-title">No transactions yet</p>
          <p className="recent-subtitle">
            Your latest transfers will appear here
          </p>
        </div>
      )}

      {recent.map((tx) => (
        <div key={tx.id} className="recent-box">
          <strong style={{ color: tx.type === "toHapi" ? "#4caf50" : "#d32f2f" }}>
            {tx.type === "toHapi" ? "⬆ Deposit" : "⬇ Withdraw"}:
          </strong>{" "}
          ${tx.amount}
          <p style={{ fontSize: "0.85rem", color: "#616677" }}>
            {tx.transfer_reference}
          </p>
        </div>
      ))}
    </div>
  );
}

export default RecentTransfers;
