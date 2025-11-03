import React, { useState, useEffect } from "react";
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

const SellActions: React.FC = () => {
  const { token, isLoadingProfile } = useUser();
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [sellQuantity, setSellQuantity] = useState<number>(0);
  const [sellLoading, setSellLoading] = useState(false);

  // Fetch user portfolio
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
        setError("Error loading portfolio");
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolio();
  }, [token]);

  const openSellModal = (stock: Stock) => {
    setSelectedStock(stock);
    setSellQuantity(0);
  };

  const closeSellModal = () => {
    setSelectedStock(null);
    setSellQuantity(0);
  };

  const handleSell = async () => {
    if (!selectedStock) return;
    if (sellQuantity <= 0) return alert("Enter a valid quantity");
    if (sellQuantity > selectedStock.quantity) {
      return alert("You do not have enough shares to sell this quantity");
    }
    if (!token) return alert("You are not logged in");

    setSellLoading(true);

    try {
      await axios.post(
        SELL_URL,
        { symbol: selectedStock.symbol, quantity: sellQuantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(`Successfully sold ${sellQuantity} shares of ${selectedStock.stock_name}`);
      // Update portfolio locally
      setStocks((prev) =>
        prev.map((s) =>
          s.symbol === selectedStock.symbol
            ? { ...s, quantity: s.quantity - sellQuantity }
            : s
        )
      );
      closeSellModal();
    } catch (err: any) {
      console.error("Error selling shares", err.response?.data || err.message);
      alert("Error executing sale. Please try again.");
    } finally {
      setSellLoading(false);
    }
  };

  if (isLoadingProfile || loading) return <p>Loading portfolio...</p>;
  if (!token) return <p style={{ color: "red" }}>No authentication token found. Please log in.</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div>
      <h2>Your Portfolio</h2>
      {stocks.length === 0 && <p>You have no stocks in your portfolio.</p>}
      {stocks.map((stock) => (
        <div key={stock.symbol} onClick={() => openSellModal(stock)}>
          <p>{stock.stock_name}</p>
          <p>Quantity: {stock.quantity}</p>
          <p>Average Price: ${stock.average_price.toFixed(2)}</p>
          <p>Current Price: ${stock.current_price.toFixed(2)}</p>
          <p>Profit/Loss: {stock.profit_loss >= 0 ? `+$${stock.profit_loss.toFixed(2)}` : `$${stock.profit_loss.toFixed(2)}`}</p>
          <button>Sell</button>
        </div>
      ))}

      {/* Sell Modal */}
      {selectedStock && (
        <div className="modal-backdrop">
          <div className="modal">
            <h3>Sell {selectedStock.stock_name}</h3>
            <p>Available quantity: {selectedStock.quantity}</p>
            <input
              type="number"
              min={1}
              max={selectedStock.quantity}
              value={sellQuantity}
              onChange={(e) => {
                const value = Number(e.target.value);
                setSellQuantity(isNaN(value) ? 0 : value);
              }}
              placeholder="Enter quantity to sell"
            />
            <button onClick={handleSell} disabled={sellLoading}>
              {sellLoading ? "Selling..." : "Confirm Sale"}
            </button>
            <button onClick={closeSellModal}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellActions;
