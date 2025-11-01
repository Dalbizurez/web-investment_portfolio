import React, { useState } from "react";
import { useSearchActions } from "../hooks/use_search_actions";
import { useBuyStock } from "../hooks/use_buy_actions"; 
import type { SearchResult } from "../hooks/use_search_actions";
import BuyDialog from "./buy-dialog";
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
  // Hook de búsqueda
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

  // Hook de compra
  const { buyStock, loading: buying, error, success } = useBuyStock();

  // Estado del ítem seleccionado para comprar
  const [selectedItem, setSelectedItem] = useState<SearchResult | null>(null);

  // Mostrar resultados reales o de prueba
  const displayResults = results.length > 0 ? results : mockData;

  // Confirmar compra (llama a la API)
  const handleConfirmPurchase = async (item: SearchResult, percentage?: number) => {
    try {
      // Si el usuario especifica porcentaje, calculamos cantidad estimada
      // (puedes ajustar esta lógica según tu modelo o API)
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

      <button className="search-button" onClick={handleSearch} disabled={loading}>
        {loading ? "Buscando..." : "Buscar"}
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

      {/* Mensajes de estado de compra */}
      <div className="status-messages">
        {buying && <p>Procesando compra...</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}
        {success && <p style={{ color: "green" }}>{success}</p>}
      </div>

      {/* Diálogo de compra */}
      <BuyDialog
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
        onConfirm={handleConfirmPurchase}
      />
    </div>
  );
};

export default SearchActions;
