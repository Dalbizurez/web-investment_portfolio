import React, { useState } from "react";
import { useSearchActions } from "../hooks/use_search_actions";
import type { SearchResult } from "../hooks/use_search_actions";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";
import "../styles/search_actions.css";

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

  const { isAuthenticated, user, loginWithRedirect } = useAuth0();
  const navigate = useNavigate();

  const [purchases, setPurchases] = useState<SearchResult[]>([]);

  const displayResults = results && results.length > 0 ? results : mockData;

  const handleBuy = async (item: SearchResult) => {
    if (!isAuthenticated) {
      alert("Debes iniciar sesión o registrarte para comprar.");
      navigate("/register");
      return;
    }

    setPurchases((prev) => [...prev, item]);

    alert(`✅ Compra realizada por ${user?.name || "usuario"}: ${item.name}`);

    // backend:
    try {
      const response = await fetch("http://localhost:8000/api/compras/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.sub || ""}`,
        },
        body: JSON.stringify({
          id: item.id,
          name: item.name,
          category: item.category,
          price: item.price,
          user: user?.email,
        }),
      });

      if (!response.ok) {
        console.error("Error al registrar la compra:", response.status);
      }
    } catch (error) {
      console.error("Error de conexión al guardar la compra:", error);
    }
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

              <button className="buy-button" onClick={() => handleBuy(item)}>
                Comprar
              </button>
            </div>
          ))
        ) : (
          <p>No se encontraron resultados.</p>
        )}
      </div>

      {/* 👇 Vista de las compras guardadas */}
      {purchases.length > 0 && (
        <div className="purchases-section">
          <h3>🛍️ Tus compras</h3>
          <ul>
            {purchases.map((p, index) => (
              <li key={`${p.id}-${index}`}>
                <strong>{p.name}</strong> — {p.category} — ${p.price}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SearchActions;
