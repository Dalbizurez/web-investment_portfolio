import { useState, useEffect } from "react";
import { useUser } from "./UserContext";
import axios from "axios";
import "../styles/transferencias.css";

const API_URL = "http://localhost:8000/api";

interface Transaction {
  id: number;
  type: "toHapi" | "toBank";
  symbol: string | null;
  quantity: number;
  price: number | null;
  amount: number;
  fee: number;
  transfer_reference: string;
  timestamp: string;
}

function RecentTransfers() {
  const { token, isLoadingProfile } = useUser();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!token) return;
      try {
        setIsLoading(true);
        setError(null);
        const res = await axios.get(`${API_URL}/stocks/transactions/history/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTransactions(res.data.transactions); 
      } catch (err: any) {
        console.error(err);
        setError(err.response?.data?.error || err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();
  }, [token]);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount || 0);

  const formatDate = (isoDate: string) => {
    const date = new Date(isoDate);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoadingProfile || isLoading) {
    return (
      <div className="recent-card">
        <h2>Transferencias recientes</h2>
        <p style={{ textAlign: "center", padding: "10px" }}></p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="recent-card">
        <h2>Transferencias recientes</h2>
        <p style={{ color: "red", textAlign: "center" }}> Error: {error}</p>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="recent-card">
        <h2>Transferencias recientes</h2>
        <div className="recent-box">
          <p className="recent-title">No tienes ninguna transferencia reciente</p>
          <p className="recent-subtitle">Aquí podrás ver tus transferencias recientes</p>
        </div>
      </div>
    );
  }

  return (
    <div className="recent-card">
      <h2>Transferencias recientes</h2>
      <div className="recent-box">
        {transactions.map((tx) => (
          <div key={tx.id} className="transaction-item">
            <p>
              <strong>{tx.type === "toHapi" ? "Hapi" : "Banco"}:</strong>{" "}
              {formatCurrency(tx.amount)}
            </p>
            {tx.symbol && <p>Stock: {tx.symbol}</p>}
            <p>Referencia: {tx.transfer_reference}</p>
            <p style={{ fontSize: "0.85rem", color: "#616677" }}>
              {formatDate(tx.timestamp)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default RecentTransfers;
