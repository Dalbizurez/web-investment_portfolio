import React, { useState } from "react";
import type { SearchResult } from "../hooks/use_search_actions";
import "../styles/buy_dialog.css";

interface BuyDialogProps {
  item: SearchResult | null;
  onClose: () => void;
  onConfirm: (item: SearchResult, quantity?: number, percentage?: number) => void;
}

const BuyDialog: React.FC<BuyDialogProps> = ({ item, onClose, onConfirm }) => {
  const [mode, setMode] = useState<"single" | "multiple" | "percentage">("single");
  const [value, setValue] = useState<number | "">("");

  if (!item) return null;

  const handleConfirm = () => {
    if (mode === "multiple" && value) {
      onConfirm(item, Number(value));
    } else if (mode === "percentage" && value) {
      onConfirm(item, undefined, Number(value));
    } else {
      onConfirm(item); // single action
    }
    onClose();
  };

  const renderInput = () => {
    if (mode === "single") return null;
    const placeholder = mode === "multiple" ? "Cantidad de acciones" : "Porcentaje (%)";
    const min = 1;
    const max = mode === "percentage" ? 100 : undefined;
    return (
      <input
        type="number"
        placeholder={placeholder}
        value={value}
        onChange={(e) => setValue(e.target.value === "" ? "" : Number(e.target.value))}
        min={min}
        max={max}
        className="buy-input"
      />
    );
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
          <select
            value={mode}
            onChange={(e) => { setMode(e.target.value as any); setValue(""); }}
            className="buy-select"
          >
            <option value="single">Comprar 1 acción</option>
            <option value="multiple">Comprar varias acciones</option>
            <option value="percentage">Comprar por porcentaje</option>
          </select>

          {renderInput()}
        </div>

        <div className="dialog-actions">
          <button onClick={handleConfirm} className="confirm-btn">
            Confirmar
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
