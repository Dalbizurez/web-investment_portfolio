import React, { useState } from "react";
import axios from "axios";

const API_URL = "http://localhost:8000/api/stocks/search/";
const DETAIL_URL = "http://localhost:8000/api/stocks/";

interface SearchResult {
  description: string;
  displaySymbol: string;
  symbol: string;
  type: string;
  current_price?: number | null;
  sector?: string;
  exchange?: string;
}

const ViewStocks: React.FC = () => {
  const [query, setQuery] = useState("");
  const [sector, setSector] = useState("");
  const [exchange, setExchange] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!query.trim()) return alert("Please enter a symbol or name to search.");
    setLoading(true);
    setError(null);

    try {
      const params: Record<string, string> = { q: query };
      if (sector) params["sector"] = sector;
      if (exchange) params["exchange"] = exchange;
      if (minPrice) params["min_price"] = minPrice;
      if (maxPrice) params["max_price"] = maxPrice;

      const response = await axios.get(API_URL, { params });
      const stocks: SearchResult[] = response.data.results || [];

      const updatedStocks = await Promise.all(
        stocks.map(async (stock) => {
          try {
            const detailResp = await axios.get(`${DETAIL_URL}${stock.symbol}/`);
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

  return (
    <div className="view-stocks-container" style={{ textAlign: "left" }}>
      <h2>Search Stocks</h2>

      <div className="search-bar" style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Example: AAPL, TSLA, AMZN..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ padding: "8px", width: "250px", marginRight: "10px" }}
        />
        <button onClick={handleSearch} style={{ padding: "8px 12px" }}>
          Search
        </button>
      </div>

      <div className="filter-section" style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Sector (optional)"
          value={sector}
          onChange={(e) => setSector(e.target.value)}
          style={{ marginRight: "8px", padding: "6px" }}
        />
        <input
          type="text"
          placeholder="Exchange"
          value={exchange}
          onChange={(e) => setExchange(e.target.value)}
          style={{ marginRight: "8px", padding: "6px" }}
        />
        <input
          type="number"
          placeholder="Minimum price"
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
          style={{ marginRight: "8px", padding: "6px" }}
        />
        <input
          type="number"
          placeholder="Maximum price"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          style={{ padding: "6px" }}
        />
      </div>

      {loading && <p>Searching stocks...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      <div
        className="results-grid"
        style={{ display: "flex", flexWrap: "wrap", gap: "15px" }}
      >
        {results.map((item) => (
          <div
            key={item.symbol}
            className="result-card"
            style={{
              border: "1px solid #ddd",
              padding: "12px",
              borderRadius: "8px",
              width: "calc(33% - 10px)",
              background: "#fff",
            }}
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
              {item.current_price ? `$${item.current_price.toFixed(2)}` : "Not available"}
            </p>
          </div>
        ))}
      </div>

      {results.length === 0 && !loading && !error && (
        <p>No results found.</p>
      )}
    </div>
  );
};

export default ViewStocks;
