import { useState, useEffect } from "react";
import { useUser } from "./UserContext";
import axios from "axios";

interface Stock {
  symbol: string;
  stock_name: string;
  quantity: number;
  average_price: number;
  current_price: number;
  profit_loss: number;
}

const API_URL = "http://localhost:8000/api/stocks/transactions/get_user_portfolio/";
const SELL_URL = "http://localhost:8000/api/stocks/transactions/sell/";

const SellActions = () => {
  const { token, isLoadingProfile } = useUser();
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;

    const fetchPortfolio = async () => {
      try {
        const res = await axios.get(API_URL, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStocks(res.data.portfolio);
      } catch (err: any) {
        console.error(err);
        setError("Error al cargar el portafolio");
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolio();
  }, [token]);

  const handleSell = async (stock: Stock) => {
    const confirmed = window.confirm(`¿Estás seguro de vender ${stock.quantity} acciones de ${stock.stock_name}?`);
    if (!confirmed) return;

    try {
      const res = await axios.post(
        SELL_URL,
        {
          symbol: stock.symbol,
          quantity: stock.quantity,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert(`Venta realizada correctamente: ${res.data.message || "Éxito"}`);

      setStocks((prev) => prev.filter((s) => s.symbol !== stock.symbol));
    } catch (err: any) {
      console.error(err);
      alert("Error al vender la acción");
    }
  };

  if (isLoadingProfile || loading)
    return <p style={{ textAlign: "center", padding: "20px" }}>Cargando portafolio...</p>;

  if (!token)
    return <p style={{ color: "red", textAlign: "center" }}>No se encontró token de autenticación.</p>;

  if (error) return <p style={{ color: "red", textAlign: "center" }}>{error}</p>;

  return (
    <div className="sell-actions-container">
      {stocks.map((stock) => {
        const profitColor = stock.profit_loss >= 0 ? "green" : "red";

        return (
          <div key={stock.symbol} className="sell-action-row">
            <span>{stock.stock_name}</span>
            <span>Valor comprado: ${stock.average_price.toFixed(2)}</span>
            <span>Valor ahora: ${stock.current_price.toFixed(2)}</span>
            <span>Cantidad: {stock.quantity}</span>
            <span className="profit" style={{ color: profitColor }}>
              {stock.profit_loss >= 0 ? `+${stock.profit_loss.toFixed(2)}` : stock.profit_loss.toFixed(2)}
            </span>
            <button onClick={() => handleSell(stock)}>Vender</button>
          </div>
        );
      })}
    </div>
  );
};

export default SellActions;
