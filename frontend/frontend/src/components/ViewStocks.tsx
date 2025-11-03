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
    <div className="view-stocks-container">
      <h2> Explore Stocks</h2>

      {/* === SEARCH BAR === */}
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search by symbol or company..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button onClick={handleSearch}>Search</button>
      </div>

      {/* === FILTERS === */}
      <div className="filter-section">
        <input
          type="text"
          placeholder="Sector"
          value={sector}
          onChange={(e) => setSector(e.target.value)}
        />
        <input
          type="text"
          placeholder="Exchange"
          value={exchange}
          onChange={(e) => setExchange(e.target.value)}
        />
        <input
          type="number"
          placeholder="Min Price"
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
        />
        <input
          type="number"
          placeholder="Max Price"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
        />
      </div>

      {/* === LOADING & ERROR === */}
      {loading && <p className="status-msg">Searching stocks...</p>}
      {error && <p className="status-msg error">{error}</p>}

      {/* === RESULTS GRID === */}
      <div className="results-grid">
        {results.map((item) => (
          <div key={item.symbol} className="result-card">
            <h3>{item.displaySymbol}</h3>
            <p className="description">{item.description}</p>
            <p>
              <strong>Sector:</strong> {item.sector || "Unknown"}
            </p>
            <p>
              <strong>Exchange:</strong> {item.exchange || "N/A"}
            </p>
            <p>
              <strong>Price:</strong>{" "}
              {item.current_price ? `$${item.current_price.toFixed(2)}` : "N/A"}
            </p>
          </div>
        ))}
      </div>

      {/* === NO RESULTS MESSAGE === */}
      {results.length === 0 && !loading && !error && (
        <div className="no-results">
          <p> No stocks found. Try a different search or adjust filters.</p>
        </div>
      )}
    </div>
  );
};

export default ViewStocks;