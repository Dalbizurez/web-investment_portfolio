import { useState, useEffect } from "react";
import { useUser } from "./UserContext";
import axios from "axios";

interface Stock {
  symbol: string;
  name: string;
  sector: string;
  quantity: number;
  average_price: number;
  current_price: number;
  profit_loss: number;
}

const API_URL = "http://back.g4.atenea.lat/api/stocks/portfolio/";
const SELL_URL = "http://back.g4.atenea.lat/api/stocks/transactions/sell/";

const SellActions = () => {
  const { token, isLoadingProfile } = useUser();
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [sellQuantity, setSellQuantity] = useState<number>(1);
  const [sellLoading, setSellLoading] = useState(false);

  useEffect(() => {
    if (!token) return;

    const fetchPortfolio = async () => {
      try {
        const res = await axios.get(API_URL, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data && res.data.portfolio) {
          setStocks(res.data.portfolio);
        } else {
          setError("Portfolio data not found");
        }
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
    setSellQuantity(1);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedStock(null);
  };

  const handleConfirmSell = async () => {
    if (!selectedStock || sellQuantity <= 0 || sellQuantity > selectedStock.quantity) {
      alert("Please enter a valid quantity.");
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to sell ${sellQuantity} shares of ${selectedStock.name}?`
    );
    if (!confirmed) return;

    try {
      setSellLoading(true);
      const res = await axios.post(
        SELL_URL,
        { symbol: selectedStock.symbol, quantity: sellQuantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert(`Sale successful: ${res.data.message || "Success"}`);

      setStocks((prev) =>
        prev
          .map((s) =>
            s.symbol === selectedStock.symbol
              ? { ...s, quantity: s.quantity - sellQuantity }
              : s
          )
          .filter((s) => s.quantity > 0)
      );

      closeModal();
    } catch (err: any) {
      console.error(err);
      alert("Error selling the stock");
    } finally {
      setSellLoading(false);
    }
  };

  if (isLoadingProfile || loading)
    return <p style={{ textAlign: "center", padding: "20px" }}>Loading portfolio...</p>;

  if (!token)
    return <p style={{ color: "red", textAlign: "center" }}>Authentication token not found.</p>;

  if (error) return <p style={{ color: "red", textAlign: "center" }}>{error}</p>;

  return (
    <div className={`sell-actions-container ${modalOpen ? "blurred" : ""}`}>
      {/* === ENCABEZADO CON ESTILO DE VENTAS === */}
      <div className="sell-header">
        <h1> Sell Your Stocks</h1>
        <p>
          Review your current holdings and make quick, secure sales with one click.
        </p>
      </div>

      {/* === LISTA DE ACCIONES === */}
      {stocks.map((stock) => {
        const profitColor = stock.profit_loss >= 0 ? "green" : "red";

        return (
          <div key={stock.symbol} className="sell-action-row">
            <span>{stock.name}</span>
            <span>Purchase: ${stock.average_price.toFixed(2)}</span>
            <span>Current: ${stock.current_price.toFixed(2)}</span>
            <span>Qty: {stock.quantity}</span>
            <span className="profit" style={{ color: profitColor }}>
              {stock.profit_loss >= 0
                ? `+${stock.profit_loss.toFixed(2)}`
                : stock.profit_loss.toFixed(2)}
            </span>
            <button onClick={() => openSellModal(stock)} className="sell-button">
              Sell
            </button>
          </div>
        );
      })}

      {/* === MODAL DE VENTA === */}
      {modalOpen && selectedStock && (
        <>
          <div className="modal-overlay" onClick={closeModal}></div>
          <form
            className="modal"
            onSubmit={(e) => {
              e.preventDefault();
              handleConfirmSell();
            }}
          >
            <h2>{selectedStock.name}</h2>
            <p>Purchase: ${selectedStock.average_price.toFixed(2)}</p>
            <p>Current: ${selectedStock.current_price.toFixed(2)}</p>
            <p>Available: {selectedStock.quantity}</p>

            <div className="sell-section">
              <input
                type="number"
                min={1}
                max={selectedStock.quantity}
                placeholder="Quantity to sell"
                value={sellQuantity}
                onChange={(e) => {
                  const value = Number(e.target.value);
                  setSellQuantity(isNaN(value) || value < 0 ? 1 : value);
                }}
                required
              />
              <button type="submit" disabled={sellLoading}>
                {sellLoading ? "Selling..." : "Confirm Sale"}
              </button>
            </div>

            <button type="button" onClick={closeModal} className="close-modal">
              Close
            </button>
          </form>
        </>
      )}
    </div>
  );
};

export default SellActions;