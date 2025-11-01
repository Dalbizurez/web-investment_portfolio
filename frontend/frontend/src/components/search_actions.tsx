import React, { useState } from "react";
import { useSearchActions } from "../hooks/use_search_actions";
import type { SearchResult } from "../hooks/use_search_actions";
import "../styles/search_actions.css";
import BuyDialog from "./buy-dialog";

interface SearchActionsProps {
  categories: string[];
  renderItem: (item: SearchResult) => React.ReactNode;
  mockData?: SearchResult[];
}

const SearchActions: React.FC<SearchActionsProps> = ({
  categories,
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

  const [selectedItem, setSelectedItem] = useState<SearchResult | null>(null);

  const displayResults = results && results.length > 0 ? results : mockData;

  const handleConfirmPurchase = (item: SearchResult) => {
  console.log("Compra confirmada:", item);
  setSelectedItem(null);
};
  
  return (
    <div className="search-actions">
      {/* Filtros */}
      <div className="filters">
        <input
          type="text"
          placeholder="Buscar por nombre..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">Todas las categorías</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        <select
          value={extraFilter}
          onChange={(e) => setExtraFilter(e.target.value)}
        >
          <option value="">Todos</option>
          <option value="high">Alto rendimiento</option>
          <option value="medium">Rendimiento medio</option>
          <option value="low">Bajo rendimiento</option>
        </select>
      </div>

      <button className="search-button" onClick={handleSearch}>
        Buscar
      </button>

      {/* Resultados */}
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
              >
                Comprar
              </button>
            </div>
          ))
        ) : (
          <p>No se encontraron resultados.</p>
        )}
      </div>

      {/* Dialogo de compra */}
      <BuyDialog
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
        onConfirm={handleConfirmPurchase}
      />
    </div>
  );
};

export default SearchActions;
