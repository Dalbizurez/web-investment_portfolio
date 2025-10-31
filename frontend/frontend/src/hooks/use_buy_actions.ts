import { useState } from "react";

/**
 * Hook personalizado para realizar compras de acciones mediante la API.
 *
 * @returns {object} Un objeto con:
 *   - buyStock(symbol: string, quantity: number): Promise<void> → función para ejecutar la compra.
 *   - loading: boolean → indica si la petición está en curso.
 *   - error: string | null → contiene el mensaje de error si ocurre alguno.
 *   - success: string | null → mensaje cuando la compra fue exitosa.
 */
export function useBuyStock() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  /**
   * Envía una solicitud de compra de acción al servidor.
   *
   * @param {string} symbol - El símbolo de la acción (por ejemplo: "AAPL", "MSFT").
   * @param {number} quantity - La cantidad de acciones a comprar.
   */
  const buyStock = async (symbol: string, quantity: number) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const token = localStorage.getItem("access_token");

      if (!token) {
        throw new Error("No se encontró un token de autenticación. Inicia sesión nuevamente.");
      }

      const response = await fetch("http://localhost:8000/api/stocks/transactions/buy/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ symbol, quantity }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al realizar la compra.");
      }

      setSuccess(`Compra exitosa: ${quantity} acciones de ${symbol}.`);
    } catch (err: any) {
      setError(err.message || "Error inesperado al comprar la acción.");
    } finally {
      setLoading(false);
    }
  };

  return { buyStock, loading, error, success };
}
