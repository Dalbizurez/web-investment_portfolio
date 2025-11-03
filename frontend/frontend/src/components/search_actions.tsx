import React, { useState } from "react";
import SideBar from "../components/sidebar";
import Header from "../components/header_search";
import axios from "axios";
import { useUser } from "./UserContext";

const API_URL = "http://localhost:8000/api/stocks/search/";
const DETAIL_URL = "http://localhost:8000/api/stocks/";
const BUY_URL = "http://localhost:8000/api/stocks/transactions/buy/";

interface SearchResult {
  description: string;
  displaySymbol: string;
  symbol: string;
  type: string;
  current_price?: number | null;
  sector?: string;
  exchange?: string;
}

const SearchActions: React.FC = () => {
  const [query, setQuery] = useState("");
  const [sector, setSector] = useState("");
  const [exchange, setExchange] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedStock, setSelectedStock] = useState<SearchResult | null>(null);
  const [stockDetail, setStockDetail] = useState<any>(null);
  const [quantity, setQuantity] = useState<number>(0);
  const [buyLoading, setBuyLoading] = useState(false);

  const { token, isLoadingProfile } = useUser();

  const handleSearch = async () => {
    if (!query.trim()) return alert("Please enter a symbol or name to search.");
    if (!token) return alert("You are not logged in.");
    setLoading(true);
    setError(null);

    try {
      const params: Record<string, string> = { q: query };
      if (sector) params["sector"] = sector;
      if (exchange) params["exchange"] = exchange;
      if (minPrice) params["min_price"] = minPrice;
      if (maxPrice) params["max_price"] = maxPrice;

      const response = await axios.get(API_URL, {
        params,
        headers: { Authorization: `Bearer ${token}` },
      });

      const stocks: SearchResult[] = response.data.results || [];

      const updatedStocks = await Promise.all(
        stocks.map(async (stock) => {
          try {
            const detailResp = await axios.get(`${DETAIL_URL}${stock.symbol}/`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            const detail = detailResp.data;
            return { 
              ...stock, 
              current_price: detail.quote?.current_price ?? null,
              sector: detail.profile?.finnhubIndustry ?? stock.sector,
              exchange: detail.profile?.exchange ?? stock.exchange,
            };
          } catch {
            return { ...stock, current_price: null };
          }
        })
      );

      setResults(updatedStocks);
    } catch (err) {
      setError("Error searching for stocks. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openStockModal = async (stock: SearchResult) => {
    setSelectedStock(stock);
    if (!token) return;
    try {
      const response = await axios.get(`${DETAIL_URL}${stock.symbol}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStockDetail(response.data);
      setQuantity(0);
    } catch (err) {
      console.error("Error loading stock details", err);
      setStockDetail(null);
    }
  };

  const handleConfirmPurchase = async () => {
    if (!quantity || quantity <= 0) return alert("Please enter a valid quantity");
    if (!token) return alert("You are not logged in.");
    if (!selectedStock) return;

    setBuyLoading(true);
    try {
      const res = await axios.post(
        BUY_URL,
        { symbol: selectedStock.symbol, quantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert(`Purchase confirmed: ${quantity} shares of ${selectedStock.displaySymbol}`);
      console.log("API response:", res.data);
      closeModal();
    } catch (err: any) {
      console.error("Error executing purchase", err.response?.data || err.message);
      alert("Error executing purchase. Please try again.");
    } finally {
      setBuyLoading(false);
    }
  };

  const closeModal = () => {
    setSelectedStock(null);
    setStockDetail(null);
    setQuantity(0);
  };

  if (isLoadingProfile)
    return (
      <div className="content-home">
        <p style={{ textAlign: "center", padding: "20px" }}>Loading profile...</p>
      </div>
    );

  if (!token)
    return (
      <div className="content-home">
        <p style={{ color: "red", textAlign: "center" }}>
          Authentication token not found. Please log in to buy stocks.
        </p>
      </div>
    );

  return (
    <main className="search-navigation">
      <SideBar />
      <Header />

      <div className="content-home">
        <section className="search-section">
          <h2>Search Stocks</h2>

          <div className="search-bar">
            <input
              type="text"
              placeholder="Example: AAPL, TSLA, AMZN..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="search-input"
            />
            <button onClick={handleSearch} className="search-button">
              Search
            </button>
          </div>

          <div className="filter-section">
            <input
              type="text"
              placeholder="Sector (optional)"
              value={sector}
              onChange={(e) => setSector(e.target.value)}
            />
            <input
              type="text"
              placeholder="Exchange (NASDAQ, NYSE...)"
              value={exchange}
              onChange={(e) => setExchange(e.target.value)}
            />
            <input
              type="number"
              placeholder="Minimum price"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
            />
            <input
              type="number"
              placeholder="Maximum price"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
            />
          </div>

          {loading && <p>Searching stocks...</p>}
          {error && <p className="error">{error}</p>}

          <div className="results-grid">
            {results.map((item) => (
              <div
                key={item.symbol}
                className="result-card"
                onClick={() => openStockModal(item)}
              >
                <h3>{item.displaySymbol}</h3>
                <p>{item.description}</p>
                <p>
                  <strong>Sector:</strong> {item.sector || "Unknown"}
                </p>
                <p>
                  <strong>Exchange:</strong> {item.exchange || "N/A"}
                </p>
                <p>
                  <strong>Current Price:</strong>{" "}
                  {item.current_price
                    ? `$${item.current_price.toFixed(2)}`
                    : "Not available"}
                </p>
              </div>
            ))}
          </div>

          {results.length === 0 && !loading && !error && (
            <p>No results found.</p>
          )}

          {selectedStock && stockDetail && (
            <div className="modal-backdrop">
              <form
                className="modal"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleConfirmPurchase();
                }}
              >
                <h2>
                  {selectedStock.displaySymbol} - {selectedStock.description}
                </h2>
                <p>Exchange: {stockDetail.profile?.exchange || "Not available"}</p>
                <p>Industry: {stockDetail.profile?.finnhubIndustry || "Not available"}</p>
                <p>
                  Current Price:{" "}
                  {stockDetail.quote?.current_price
                    ? `$${stockDetail.quote.current_price.toFixed(2)}`
                    : "Not available"}
                </p>

                <div className="purchase-section">
                  <input
                    type="number"
                    min={1}
                    placeholder="Number of shares"
                    value={quantity}
                    onChange={(e) => {
                      const value = Number(e.target.value);
                      setQuantity(isNaN(value) || value < 0 ? 0 : value);
                    }}
                    required
                  />
                  <button type="submit" disabled={buyLoading}>
                    {buyLoading ? "Buying..." : "Execute Purchase"}
                  </button>
                </div>

                <button type="button" onClick={closeModal} className="close-modal">
                  Close
                </button>
              </form>
            </div>
          )}
        </section>
      </div>
    </main>
  );
};

export default SearchActions;
