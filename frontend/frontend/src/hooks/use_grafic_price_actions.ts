import { useEffect, useState } from "react";

export interface StockPricePoint {
  date: string;
  price: number;
}

interface UseStockPriceHistoryResult {
  data: StockPricePoint[] | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Hook para obtener el precio del día de una acción.
 * @param symbol - Símbolo del stock (por ejemplo, "AAPL")
 */
export const useStockPriceToday = (
  symbol: string | null
): UseStockPriceHistoryResult => {
  const [data, setData] = useState<StockPricePoint[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    if (!symbol) return;
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `http://localhost:8000/api/stocks/${symbol}/quote/`
      );

      if (!response.ok) throw new Error(`Error ${response.status}`);
      const json = await response.json();

      const prices: StockPricePoint[] = [];

      if (json.current_price && json.timestamp) {
        prices.push({
          date: new Date(json.timestamp * 1000).toISOString(),
          price: json.current_price,
        });
      }

      setData(prices.length > 0 ? prices : []);
    } catch (err: any) {
      setError(err.message);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [symbol]);

  const refetch = () => fetchData();

  return { data, loading, error, refetch };
};
