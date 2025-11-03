import { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";

export interface UserPurchase {
  id: string;
  stock_symbol: string;
  stock_name: string;
  quantity: number;
  price: number;
  total: number;
  transaction_type: string; // "BUY" o "SELL"
  created_at: string;
}

interface UseUserPurchasesResult {
  purchases: UserPurchase[] | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useUserPurchases = (): UseUserPurchasesResult => {
  const { getAccessTokenSilently, user, isAuthenticated } = useAuth0();
  const [purchases, setPurchases] = useState<UserPurchase[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPurchases = async () => {
    if (!isAuthenticated) {
      setError("Usuario no autenticado");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const token = await getAccessTokenSilently();
      const response = await fetch("http://localhost:8000/api/stocks/transactions/history/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setPurchases(data);
    } catch (err: any) {
      setError(err.message || "Error al obtener las compras");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPurchases();
  }, [isAuthenticated, user?.sub]);

  return { purchases, loading, error, refetch: fetchPurchases };
};
