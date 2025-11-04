import { useState } from "react";

/**
 * Hook para vender acciones
 *
 * @returns {object} Un objeto con:
 *   - sellStock(symbol: string, quantity: number): Promise<void> → función para ejecutar la venta.
 *   - loading: boolean → indica si la petición está en curso.
 *   - error: string | null → contiene el mensaje de error si ocurre alguno.
 *   - success: string | null → mensaje cuando la venta fue exitosa.
 */
export function useSellStock() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  /**
   * Envía una solicitud de venta de acción al servidor.
   *
   * @param {string} symbol - El símbolo de la acción (por ejemplo: "AAPL", "MSFT").
   * @param {number} quantity - La cantidad de acciones a vender.
   */
  const sellStock = async (symbol: string, quantity: number) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const token = localStorage.getItem("access_token");

      if (!token) {
        throw new Error("No se encontró un token de autenticación. Inicia sesión nuevamente.");
      }

      const response = await fetch("http://back.g4.atenea.lat/api/stocks/transactions/sell/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ symbol, quantity }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al realizar la venta.");
      }

      setSuccess(`Venta exitosa: ${quantity} acciones de ${symbol}.`);
    } catch (err: any) {
      setError(err.message || "Error inesperado al vender la acción.");
    } finally {
      setLoading(false);
    }
  };

  return { sellStock, loading, error, success };
}
