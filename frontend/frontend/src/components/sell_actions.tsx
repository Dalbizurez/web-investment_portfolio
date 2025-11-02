import React, { useState } from "react";
import "../styles/sell_actions.css";
import SellDialog from "./sells_dialog";

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
  const [actions] = useState<SellActionItem[]>(mockData);
  const [selectedItem, setSelectedItem] = useState<SellActionItem | null>(null);

  const handleSell = (item: SellActionItem) => {
    setSelectedItem(item);
  };

  const handleConfirmSell = (item: SellActionItem, percent: number, quantity: number) => {
    alert(
      `✅ Vendiendo ${percent}% (${quantity} acciones) de ${item.name} a $${item.price}`
    );
    setSelectedItem(null);
  };

  return (
    <div className="sell-actions-container">
      <div className="sell-actions-list">
        {actions.map((item) => (
          <div className="sell-action" key={item.id}>
            <h3>{item.name}</h3>
            <p>Categoría: {item.category}</p>
            <p>Precio actual: ${item.price}</p>
            <p>Cantidad disponible: {item.quantity ?? 0}</p>
            <button onClick={() => handleSell(item)}>Vender acción</button>
          </div>
        ))}
      </div>

      <SellDialog
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
        onConfirm={handleConfirmSell}
      />
    </div>
  );
};

export default SellActions;