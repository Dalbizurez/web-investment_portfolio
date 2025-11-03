import React, { useState, useEffect } from "react";
import "../styles/sell_actions.css";
import SellDialog from "./sells_dialog";
import { useSellStock } from "../hooks/use_sell_actions";
import { useUserPurchases } from "../hooks/use_user_buys";

export interface SellActionItem {
  id: string;
  name: string;
  category: string;
  price: number;
  quantity?: number;
}

interface SellActionsProps {
  mockData?: SellActionItem[];
}

const SellActions: React.FC<SellActionsProps> = ({ mockData = [] }) => {
  const [actions, setActions] = useState<SellActionItem[]>(mockData);
  const [selectedItem, setSelectedItem] = useState<SellActionItem | null>(null);

  // 🔹 Hook de venta con Auth0
  const { sellStock, loading, error, success } = useSellStock();

  // 🔹 Hook de historial de compras
  const {
    purchases,
    loading: loadingPurchases,
    error: errorPurchases,
    refetch,
  } = useUserPurchases();

  // 🔹 Cargar las compras del usuario cuando lleguen
  useEffect(() => {
    if (purchases) {
      const userBuys = purchases
        .filter((p) => p.transaction_type === "BUY")
        .map((p) => ({
          id: p.stock_symbol,
          name: p.stock_name || p.stock_symbol,
          category: "Acción",
          price: p.price,
          quantity: p.quantity,
        }));

      setActions(userBuys);
    }
  }, [purchases]);

  // Abre el diálogo
  const handleSell = (item: SellActionItem) => {
    setSelectedItem(item);
  };

  // 🔹 Confirma la venta (usa el hook con Auth0)
  const handleConfirmSell = async (
    item: SellActionItem,
    percent: number,
    quantity: number
  ) => {
    try {
      await sellStock(item.id, quantity);
      await refetch(); // 🔄 actualiza lista tras vender
      setSelectedItem(null);
    } catch (err) {
      console.error("Error al vender:", err);
    }
  };

  return (
    <div className="sell-actions-container">
      <h2>📈 Mis acciones compradas</h2>

      {/* Estado de carga */}
      {loadingPurchases && <p>Cargando tus compras...</p>}
      {errorPurchases && (
        <p className="error-message">❌ {errorPurchases}</p>
      )}

      {/* Lista de acciones */}
      <div className="sell-actions-list">
        {actions.length > 0 ? (
          actions.map((item) => (
            <div className="sell-action" key={item.id}>
              <h3>{item.name}</h3>
              <p>Categoría: {item.category}</p>
              <p>Precio actual: ${item.price}</p>
              <p>Cantidad disponible: {item.quantity ?? 0}</p>
              <button
                onClick={() => handleSell(item)}
                disabled={loading}
                className="sell-button"
              >
                {loading ? "Procesando..." : "Vender acción"}
              </button>
            </div>
          ))
        ) : (
          !loadingPurchases && <p>No tienes compras registradas.</p>
        )}
      </div>

      {/* Mensajes de estado */}
      <div className="status-messages">
        {error && <p className="error-message">❌ {error}</p>}
        {success && <p className="success-message">✅ {success}</p>}
      </div>

      {/* Diálogo de confirmación */}
      <SellDialog
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
        onConfirm={handleConfirmSell}
      />
    </div>
  );
};

export default SellActions;
