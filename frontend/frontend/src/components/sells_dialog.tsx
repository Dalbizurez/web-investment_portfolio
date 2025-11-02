
import React, { useState, useMemo } from "react";
import "../styles/sell_actions.css";
import type { SellActionItem } from "./sell_actions";

interface SellDialogProps {
  item: SellActionItem | null;
  onClose: () => void;
  onConfirm: (item: SellActionItem, percent: number, quantity: number) => void;
}

const SellDialog: React.FC<SellDialogProps> = ({ item, onClose, onConfirm }) => {
  const [quantity, setQuantity] = useState<number>(item?.quantity ?? 0);
  const [orderType, setOrderType] = useState<string>("Mercado");
  const [usePercent, setUsePercent] = useState<boolean>(false);
  const [percent, setPercent] = useState<number>(0); // porcentaje por defecto 0
  const commission = 2.5; // comisión simulada fija

  // Calcula cantidad basada en porcentaje si checkbox activo
  const computedQuantity = useMemo(() => {
    if (!item) return 0;
    return usePercent ? Math.max(1, Math.round((percent / 100) * (item.quantity ?? 1))) : quantity;
  }, [usePercent, percent, quantity, item]);

  const { total, net } = useMemo(() => {
    const subtotal = (item?.price ?? 0) * computedQuantity;
    const neto = subtotal - commission;
    return { total: subtotal, net: neto };
  }, [computedQuantity, item]);

  if (!item) return null;

  const handleConfirm = () => {
    const percentValue = usePercent ? percent : 0;
    onConfirm(item, percentValue, computedQuantity);
  };

  return (
    <div className="sell-modal-overlay" onClick={onClose}>
      <div className="sell-modal" onClick={(e) => e.stopPropagation()}>
        <h2>Confirmar venta</h2>

        <div className="sell-details">
          <p>
            <strong>Acción:</strong> {item.name}
          </p>
          <p>
            <strong>Precio actual del mercado:</strong> ${item.price.toFixed(2)}
          </p>

          <div className="input-group">
            <label><p>Activar Porcentaje</p>
              <input
                type="checkbox"
                checked={usePercent}
                onChange={(e) => setUsePercent(e.target.checked)}
              />
              Ingresar porcentaje
            </label>
            {usePercent && (
              <input
                type="number"
                min={1}
                max={100}
                value={percent}
                onChange={(e) => setPercent(Math.min(100, Math.max(1, parseInt(e.target.value) || 1)))}
                placeholder="% a vender"
              />
            )}
          </div>

          {!usePercent && (
            <div className="input-group">
              <label>Cantidad de acciones a vender:</label>
              <input
                type="number"
                min={1}
                max={item.quantity ?? 1}
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value))}
              />
            </div>
          )}

          <div className="input-group">
            <label>Tipo de orden:</label>
            <select value={orderType} onChange={(e) => setOrderType(e.target.value)}>
              <option value="Mercado">Mercado</option>
              <option value="Límite">Límite</option>
              <option value="Stop">Stop</option>
            </select>
          </div>

          <hr />

          <p>
            <strong>Valor total estimado:</strong> ${total.toFixed(2)}
          </p>
          <p>
            <strong>Comisiones y tarifas:</strong> ${commission.toFixed(2)}
          </p>
          <p>
            <strong>Monto neto estimado a recibir:</strong> ${net.toFixed(2)}
          </p>

          <div className="sell-warning">
            ¿Estás seguro de que deseas vender <strong>{computedQuantity}</strong> acciones de{" "}
            <strong>{item.name}</strong> por un valor estimado de <strong>${net.toFixed(2)}</strong>?
          </div>

          <div className="modal-buttons">
            <button className="cancel" onClick={onClose}>
              Cancelar
            </button>
            <button className="confirm" onClick={handleConfirm}>
              Confirmar venta
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellDialog;
