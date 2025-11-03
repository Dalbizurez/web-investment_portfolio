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

  // --- Buscar acciones ---
  const handleSearch = async () => {
    if (!query.trim()) return alert("Ingrese un símbolo o nombre para buscar.");
    if (!token) return alert("No has iniciado sesión.");
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

      // --- Llenar sector y exchange desde detalle ---
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
      setError("Error al buscar acciones. Intente nuevamente.");
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
      console.error("Error cargando detalles del stock", err);
      setStockDetail(null);
    }
  };

  const handleConfirmPurchase = async () => {
    if (!quantity || quantity <= 0) return alert("Ingrese una cantidad válida");
    if (!token) return alert("No has iniciado sesión.");
    if (!selectedStock) return;

    setBuyLoading(true);
    try {
      const res = await axios.post(
        BUY_URL,
        { symbol: selectedStock.symbol, quantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert(`Compra confirmada: ${quantity} acciones de ${selectedStock.displaySymbol}`);
      console.log("Respuesta API:", res.data);
      closeModal();
    } catch (err: any) {
      console.error("Error ejecutando la compra", err.response?.data || err.message);
      alert("Error al ejecutar la compra. Intente nuevamente.");
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
        <p style={{ textAlign: "center", padding: "20px" }}>Cargando perfil...</p>
      </div>
    );

  if (!token)
    return (
      <div className="content-home">
        <p style={{ color: "red", textAlign: "center" }}>
          No se encontró token de autenticación. Inicia sesión para comprar acciones.
        </p>
      </div>
    );

  return (
    <main className="search-navigation">
      <SideBar />
      <Header />

      <div className="content-home">
        <section className="search-section">
          <h2>Buscar acciones</h2>

          {/* --- BARRA DE BÚSQUEDA Y FILTROS --- */}
          <div className="search-bar">
            <input
              type="text"
              placeholder="Ejemplo: AAPL, TSLA, AMZN..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="search-input"
            />
            <button onClick={handleSearch} className="search-button">
              Buscar
            </button>
          </div>

          <div className="filter-section">
            <input
              type="text"
              placeholder="Sector (opcional)"
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
              placeholder="Precio mínimo"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
            />
            <input
              type="number"
              placeholder="Precio máximo"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
            />
          </div>

          {loading && <p>Buscando acciones...</p>}
          {error && <p className="error">{error}</p>}

          {/* --- RESULTADOS --- */}
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
                  <strong>Sector:</strong> {item.sector || "Desconocido"}
                </p>
                <p>
                  <strong>Exchange:</strong> {item.exchange || "N/D"}
                </p>
                <p>
                  <strong>Precio actual:</strong>{" "}
                  {item.current_price
                    ? `$${item.current_price.toFixed(2)}`
                    : "No disponible"}
                </p>
              </div>
            ))}
          </div>

          {results.length === 0 && !loading && !error && (
            <p>No se encontraron resultados.</p>
          )}

          {/* --- MODAL --- */}
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
                <p>Exchange: {stockDetail.profile?.exchange || "No disponible"}</p>
                <p>Industry: {stockDetail.profile?.finnhubIndustry || "No disponible"}</p>
                <p>
                  Current Price:{" "}
                  {stockDetail.quote?.current_price
                    ? `$${stockDetail.quote.current_price.toFixed(2)}`
                    : "No disponible"}
                </p>

                <div className="purchase-section">
                  <input
                    type="number"
                    min={1}
                    placeholder="Cantidad de acciones"
                    value={quantity}
                    onChange={(e) => {
                      const value = Number(e.target.value);
                      setQuantity(isNaN(value) || value < 0 ? 0 : value);
                    }}
                    required
                  />
                  <button type="submit" disabled={buyLoading}>
                    {buyLoading ? "Comprando..." : "Ejecutar compra"}
                  </button>
                </div>

                <button type="button" onClick={closeModal} className="close-modal">
                  Cerrar
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
