import React, { useState } from "react";
import type { SearchResult } from "../hooks/use_search_actions";
import "../styles/buy_dialog.css";

interface BuyDialogProps {
  item: SearchResult | null;
  onClose: () => void;
  onConfirm: (item: SearchResult, percentage?: number) => void;
}

const BuyDialog: React.FC<BuyDialogProps> = ({ item, onClose, onConfirm }) => {
  const [usePercentage, setUsePercentage] = useState(false);
  const [percentage, setPercentage] = useState<number | "">("");

  if (!item) return null;

  const handleConfirm = () => {
    onConfirm(item, usePercentage ? Number(percentage) : undefined);
    onClose();
  };

  return (
    <div className="dialog-overlay">
      <div className="dialog-content">
        <h3>Comprar acción</h3>

        <div className="dialog-info">
          <p><strong>Nombre:</strong> {item.name}</p>
          <p><strong>Categoría:</strong> {item.category}</p>
          <p><strong>Precio:</strong> ${item.price}</p>
        </div>

        <div className="dialog-options">
          <label>
            <input
              type="checkbox"
              checked={usePercentage}
              onChange={(e) => setUsePercentage(e.target.checked)}
            />
             Especificar porcentaje de compra
          </label>
        
          <input
            type="number"
            placeholder="Porcentaje (%)"
            value={percentage}
            onChange={(e) => setPercentage(e.target.value === "" ? "" : Number(e.target.value))}
            disabled={!usePercentage}
            min={1}
            max={100}
          />
        </div>

        <div className="dialog-actions">
          <button onClick={handleConfirm} className="confirm-btn">
            Comprar acción
          </button>
          <button onClick={onClose} className="cancel-btn">
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default BuyDialog;
