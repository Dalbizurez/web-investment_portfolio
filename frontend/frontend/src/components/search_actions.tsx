import React from "react";
import { useSearchActions } from "../hooks/use_search_actions";
import type { SearchResult } from "../hooks/use_search_actions";
import "../styles/search_actions.css";

interface SearchActionsProps {
  categories: string[];
  renderItem: (item: SearchResult) => React.ReactNode;
}

const SearchActions: React.FC<SearchActionsProps> = ({ categories, renderItem }) => {
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

        <select value={extraFilter} onChange={(e) => setExtraFilter(e.target.value)}>
          <option value="">Todos</option>
          <option value="high">Alto rendimiento</option>
          <option value="medium">Rendimiento medio</option>
          <option value="low">Bajo rendimiento</option>
        </select>
      </div>

      <button className="search-button" onClick={handleSearch}>
        Buscar
      </button>

      <div className="results">
        {loading ? (
          <p>Cargando...</p>
        ) : results.length > 0 ? (
          results.map((item) => (
            <div className="result-item" key={item.id}>
              {renderItem(item)}
            </div>
          ))
        ) : (
          <p>No se encontraron resultados.</p>
        )}
      </div>
    </div>
  );
};

export default SearchActions;
