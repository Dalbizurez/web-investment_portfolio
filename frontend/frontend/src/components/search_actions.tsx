import React, { useState } from "react";
import { useSearchActions } from "../hooks/use_search_actions";
import { useBuyStock } from "../hooks/use_buy_actions";
import type { SearchResult } from "../hooks/use_search_actions";
import BuyDialog from "./buy-dialog";
import "../styles/search_actions.css";

import { STOCK_THEMATIC_FILTERS, STOCK_CATEGORIES } from "../hooks/fil.ts";

interface SearchActionsProps {
  renderItem: (item: SearchResult) => React.ReactNode;
  mockData?: SearchResult[];
}

const SearchActions: React.FC<SearchActionsProps> = ({
  renderItem,
  mockData = [],
}) => {
  const {
    query,
    setQuery,
    category,
    setCategory,
    extraFilter,
    setExtraFilter,
    results,
    loading,
    handleSearch,
  } = useSearchActions();

  const { buyStock, loading: buying, error, success } = useBuyStock();
  const [selectedItem, setSelectedItem] = useState<SearchResult | null>(null);

  const displayResults = results.length > 0 ? results : mockData;

  const handleConfirmPurchase = async (item: SearchResult, percentage?: number) => {
    try {
      const quantity = percentage ? Math.max(1, Math.round((percentage / 100) * 10)) : 1;
      await buyStock(item.id, quantity);
      alert(`✅ Compra exitosa: ${quantity} acciones de ${item.id}`);
    } catch (err) {
      console.error("Error al comprar:", err);
      alert("❌ Error al realizar la compra. Intenta nuevamente.");
    } finally {
      setSelectedItem(null);
    }
  };

  return (
    <div className="search-actions">
      {/* 🔍 Filtros */}
      <div className="filters">
        <input
          type="text"
          placeholder="Buscar por nombre..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        {/* 🏛️ Filtros oficiales de Finnhub */}
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">Todas las categorías oficiales</option>
          {STOCK_CATEGORIES.map((cat) => (
            <option key={cat.code} value={cat.code}>
              {cat.name}
            </option>
          ))}
        </select>

        {/* 🎨 Filtros personalizados temáticos */}
        <select
          value={extraFilter}
          onChange={(e) => setExtraFilter(e.target.value)}
        >
          <option value="">Todos los filtros personalizados</option>
          {STOCK_THEMATIC_FILTERS.map((filter) => (
            <option key={filter.category} value={filter.category}>
              {filter.category}
            </option>
          ))}
        </select>
      </div>

      <button className="search-button" onClick={handleSearch} disabled={loading}>
        {loading ? "Buscando..." : "Buscar"}
      </button>

      {/* 📊 Resultados */}
      <div className="results">
        {loading ? (
          <p>Cargando...</p>
        ) : displayResults.length > 0 ? (
          displayResults.map((item) => (
            <div className="result-item" key={item.id}>
              {renderItem(item)}
              <button
                className="buy-button"
                onClick={() => setSelectedItem(item)}
                disabled={buying}
              >
                Comprar
              </button>
            </div>
          ))
        ) : (
          <p>No se encontraron resultados.</p>
        )}
      </div>

      {/* Mensajes de estado */}
      <div className="status-messages">
        {buying && <p>Procesando compra...</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}
        {success && <p style={{ color: "green" }}>{success}</p>}
      </div>

      <BuyDialog
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
        onConfirm={handleConfirmPurchase}
      />
    </div>
  );
};

export default SearchActions;
