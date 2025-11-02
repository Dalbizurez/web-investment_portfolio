import { useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";

export function useBuyStock() {
  const { getAccessTokenSilently } = useAuth0();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const buyStock = async (symbol: string, quantity: number) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const token = await getAccessTokenSilently();

      const response = await fetch("http://localhost:8000/api/stocks/transactions/buy/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ symbol, quantity }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "Error al realizar la compra");

      setSuccess(`Compra exitosa: ${quantity} acciones de ${symbol}`);
    } catch (err: any) {
      setError(err.message || "Error inesperado al comprar la acción.");
    } finally {
      setLoading(false);
    }
  };

  return { buyStock, loading, error, success };
}
