import { useState } from "react";

export interface TransactionData {
  symbol: string;
  amount: number;
  type: "BUY" | "SELL";
  price?: number; // opcional, si el backend lo obtiene automáticamente
}

export interface TransactionResult {
  id: number;
  symbol: string;
  amount: number;
  price: number;
  total: number;
  type: "BUY" | "SELL";
  created_at: string;
}

/**
 * Hook para crear transacciones de compra o venta de acciones.
 */
export const useTransaction = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TransactionResult | null>(null);

  const createTransaction = async (transaction: TransactionData) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("http://localhost:8000/api/transactions/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Agrega el token si usas Auth0 o JWT
          Authorization: `Bearer ${localStorage.getItem("access_token") || ""}`,
        },
        body: JSON.stringify(transaction),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Error al crear la transacción");
      }

      const data = await response.json();
      setResult(data);
      return data;
    } catch (err: any) {
      setError(err.message);
      console.error("Error al crear transacción:", err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    createTransaction,
    loading,
    error,
    result,
  };
};
