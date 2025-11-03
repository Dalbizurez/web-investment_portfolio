import { useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";

/**
 * Hook para vender acciones (con verificación de Auth0)
 *
 * @returns {object} Un objeto con:
 *   - sellStock(symbol: string, quantity: number): Promise<void> → función para ejecutar la venta.
 *   - loading: boolean → indica si la petición está en curso.
 *   - error: string | null → mensaje de error si ocurre alguno.
 *   - success: string | null → mensaje cuando la venta fue exitosa.
 */
export function useSellStock() {
  const { isAuthenticated, getAccessTokenSilently, loginWithRedirect } = useAuth0();

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
      // 🔐 Verificar autenticación
      if (!isAuthenticated) {
        setError("Debes iniciar sesión para realizar una venta.");
        await loginWithRedirect(); // Redirige a Auth0 si no está autenticado
        return;
      }

      // 🪙 Obtener el token de acceso de Auth0
      const token = await getAccessTokenSilently();

      if (!token) {
        throw new Error("No se pudo obtener el token de autenticación. Intenta iniciar sesión nuevamente.");
      }

      // 📤 Enviar la solicitud al backend
      const response = await fetch("http://localhost:8000/api/stocks/transactions/sell/", {
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

      setSuccess(`✅ Venta exitosa: ${quantity} acciones de ${symbol}.`);
    } catch (err: any) {
      setError(err.message || "Error inesperado al vender la acción.");
    } finally {
      setLoading(false);
    }
  };

  return { sellStock, loading, error, success };
}
